import { WS_CONFIG, CONNECTION_STATUS } from './config';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.wsUrl = null;
    this.reconnectAttempt = 0;
    this.reconnectTimeout = null;
    this.messageHandlers = new Map();
    this.statusChangeHandler = null; // Keep for backward compatibility, but use statusChangeHandlers array
    this.shouldReconnect = true;
    this.isConnected = false;
    this.connectedAt = null;
    this.currentQuestionId = null; // Shared current question ID across components
    this.connectionStatus = CONNECTION_STATUS.DISCONNECTED; // Shared connection status
    this.statusChangeHandlers = []; // Multiple handlers for status changes
  }

  connect(wsUrl, isReconnect = false) {
    // Validate WebSocket URL
    if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
      throw new Error('Invalid WebSocket URL');
    }

    // Check if already connected to the same URL
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.wsUrl === wsUrl) {
      console.log('WebSocket already connected to', wsUrl, '- skipping connection');
      return;
    }

    // Clear any pending reconnection timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.wsUrl = wsUrl;
    // Only set shouldReconnect to true if not already in a reconnection cycle
    // This preserves the flag during automatic reconnection attempts
    if (!isReconnect) {
      this.shouldReconnect = true;
    }

    try {
      // Close existing connection if any
      if (this.ws) {
        console.log('Closing existing WebSocket connection before creating new one');
        this.ws.close();
        this.ws = null;
      }

      console.log(`Connecting to WebSocket: ${wsUrl}${isReconnect ? ' (reconnect)' : ''}`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

      this.updateStatus(CONNECTION_STATUS.CONNECTING);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError(error);
    }
  }

  handleOpen() {
    console.log('WebSocket connected successfully');

    // Clear any pending reconnection timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
      console.log('Cleared pending reconnection timeout');
    }

    // Reset reconnection state
    this.reconnectAttempt = 0;
    this.isConnected = true;
    this.connectedAt = Date.now();

    console.log(`Connection established at ${new Date(this.connectedAt).toISOString()}`);
    this.updateStatus(CONNECTION_STATUS.CONNECTED);
  }

  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);

      // Route message to appropriate handler
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      } else {
        console.warn('No handler for message type:', message.type);
        console.log('Message:', message);
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
  }

  handleClose(event) {
    const closeCode = event.code;
    const closeReason = event.reason || 'No reason provided';

    // Update connection state
    const wasConnected = this.isConnected;
    const connectionDuration = this.connectedAt ? Date.now() - this.connectedAt : 0;
    this.isConnected = false;
    this.connectedAt = null;

    console.log(`WebSocket closed: code=${closeCode}, reason="${closeReason}", wasConnected=${wasConnected}, duration=${connectionDuration}ms`);

    // Close codes that indicate intentional closure - don't reconnect
    const noReconnectCodes = [
      1000, // Normal Closure
      1001, // Going Away
      1002, // Protocol Error
      1003, // Unsupported Data
      1008, // Policy Violation
    ];

    // Check if this is an intentional closure that shouldn't trigger reconnection
    if (noReconnectCodes.includes(closeCode)) {
      console.log(`WebSocket closed intentionally (code ${closeCode}), not reconnecting`);
      this.shouldReconnect = false;
      this.updateStatus(CONNECTION_STATUS.DISCONNECTED);
      return;
    }

    // If connection was just established and closed immediately (within 1 second),
    // it might be a server-side issue - wait a bit before reconnecting
    const IMMEDIATE_CLOSE_THRESHOLD = 1000; // 1 second
    if (wasConnected && connectionDuration < IMMEDIATE_CLOSE_THRESHOLD) {
      console.log(`Connection closed immediately after opening (${connectionDuration}ms) - possible server-side issue`);
    }

    // For other close codes (network errors, timeouts, unexpected closures), attempt reconnection
    if (this.shouldReconnect && this.reconnectAttempt < WS_CONFIG.RECONNECT_ATTEMPTS) {
      console.log(`Attempting to reconnect (close code: ${closeCode}, wasConnected: ${wasConnected}, attempt: ${this.reconnectAttempt + 1}/${WS_CONFIG.RECONNECT_ATTEMPTS})`);
      this.updateStatus(CONNECTION_STATUS.RECONNECTING);
      this.attemptReconnect();
    } else {
      if (this.reconnectAttempt >= WS_CONFIG.RECONNECT_ATTEMPTS) {
        console.log(`Max reconnection attempts (${WS_CONFIG.RECONNECT_ATTEMPTS}) reached, giving up`);
      }
      if (!this.shouldReconnect) {
        console.log('Reconnection disabled, not attempting to reconnect');
      }
      this.updateStatus(CONNECTION_STATUS.DISCONNECTED);
    }
  }

  handleConnectionError(error) {
    // Close socket if exists
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.connectedAt = null;
    this.updateStatus(CONNECTION_STATUS.DISCONNECTED);
    throw error;
  }

  attemptReconnect() {
    const delay = WS_CONFIG.RECONNECT_DELAYS[this.reconnectAttempt] || 30000;

    // Increment attempt count before scheduling reconnect
    this.reconnectAttempt++;
    const currentAttempt = this.reconnectAttempt;

    const delaySeconds = (delay / 1000).toFixed(1);
    console.log(`Reconnecting in ${delaySeconds}s (attempt ${currentAttempt}/${WS_CONFIG.RECONNECT_ATTEMPTS})`);

    // Update status with current attempt info
    this.updateStatus(CONNECTION_STATUS.RECONNECTING);

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnection attempt ${currentAttempt} starting...`);
      // Pass isReconnect=true to preserve shouldReconnect flag
      this.connect(this.wsUrl, true);
    }, delay);
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
      throw new Error('Cannot send message: WebSocket not connected');
    }
  }

  sendUserAnswer(questionId, answerText) {
    this.sendMessage({
      type: 'text_answer',
      question_id: questionId,
      answer_text: answerText,
    });
  }

  /**
   * Send audio answer to backend
   * @param {string} questionId - Current question ID
   * @param {Uint8Array} audioBytes - Audio data as Uint8Array (WAV/PCM format)
   * @param {string} language - Language code (default: "en-US") - Not used by backend, kept for compatibility
   */
  sendUserAudioAnswer(questionId, audioBytes, language = 'en-US') {
    // Convert Uint8Array to base64 string
    const base64Audio = this.arrayBufferToBase64(audioBytes.buffer);

    this.sendMessage({
      type: 'audio_chunk',
      question_id: questionId,
      audio_data: base64Audio,
      chunk_index: 0,
      is_final: true,
    });
  }

  /**
   * Convert ArrayBuffer to base64 string
   * @param {ArrayBuffer} buffer - ArrayBuffer to convert
   * @returns {string} - Base64 encoded string
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  onStatusChange(handler) {
    // Add handler to array to support multiple components
    if (!this.statusChangeHandlers.includes(handler)) {
      this.statusChangeHandlers.push(handler);
    }
  }

  offStatusChange(handler) {
    // Remove handler from array
    this.statusChangeHandlers = this.statusChangeHandlers.filter(h => h !== handler);
  }

  updateStatus(status) {
    this.connectionStatus = status;
    // Notify all registered handlers
    this.statusChangeHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in status change handler:', error);
      }
    });
  }

  getConnectionStatus() {
    if (!this.ws) return CONNECTION_STATUS.DISCONNECTED;

    // Return cached status if connection exists, otherwise check readyState
    if (this.connectionStatus !== CONNECTION_STATUS.DISCONNECTED || this.ws.readyState === WebSocket.OPEN) {
      return this.connectionStatus;
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return CONNECTION_STATUS.CONNECTING;
      case WebSocket.OPEN:
        return CONNECTION_STATUS.CONNECTED;
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return CONNECTION_STATUS.DISCONNECTED;
      default:
        return CONNECTION_STATUS.DISCONNECTED;
    }
  }

  getReconnectAttempt() {
    return this.reconnectAttempt;
  }

  disconnect() {
    console.log('Disconnecting WebSocket (manual disconnect)');
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.connectedAt = null;
    this.updateStatus(CONNECTION_STATUS.DISCONNECTED);
  }

  resetReconnectAttempt() {
    this.reconnectAttempt = 0;
  }

  getCurrentQuestionId() {
    return this.currentQuestionId;
  }

  setCurrentQuestionId(questionId) {
    this.currentQuestionId = questionId;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
