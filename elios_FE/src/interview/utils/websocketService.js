import { WS_CONFIG, CONNECTION_STATUS } from './config';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.wsUrl = null;
    this.reconnectAttempt = 0;
    this.reconnectTimeout = null;
    this.messageHandlers = new Map();
    this.statusChangeHandler = null;
    this.shouldReconnect = true;
  }

  connect(wsUrl, isReconnect = false) {
    // Validate WebSocket URL
    if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
      throw new Error('Invalid WebSocket URL');
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
        this.ws.close();
        this.ws = null;
      }

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
    console.log('WebSocket connected');
    this.reconnectAttempt = 0;
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
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
  }

  handleClose(event) {
    console.log('WebSocket closed:', event.code, event.reason);

    if (this.shouldReconnect && this.reconnectAttempt < WS_CONFIG.RECONNECT_ATTEMPTS) {
      this.updateStatus(CONNECTION_STATUS.RECONNECTING);
      this.attemptReconnect();
    } else {
      this.updateStatus(CONNECTION_STATUS.DISCONNECTED);
    }
  }

  handleConnectionError(error) {
    // Close socket if exists
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus(CONNECTION_STATUS.DISCONNECTED);
    throw error;
  }

  attemptReconnect() {
    const delay = WS_CONFIG.RECONNECT_DELAYS[this.reconnectAttempt] || 16000;

    // Increment attempt count before scheduling reconnect
    this.reconnectAttempt++;
    const currentAttempt = this.reconnectAttempt;

    console.log(`Reconnecting in ${delay}ms (attempt ${currentAttempt}/${WS_CONFIG.RECONNECT_ATTEMPTS})`);

    // Update status with current attempt info
    this.updateStatus(CONNECTION_STATUS.RECONNECTING);

    this.reconnectTimeout = setTimeout(() => {
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

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  onStatusChange(handler) {
    this.statusChangeHandler = handler;
  }

  updateStatus(status) {
    if (this.statusChangeHandler) {
      this.statusChangeHandler(status);
    }
  }

  disconnect() {
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateStatus(CONNECTION_STATUS.DISCONNECTED);
  }

  getConnectionStatus() {
    if (!this.ws) return CONNECTION_STATUS.DISCONNECTED;

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

  resetReconnectAttempt() {
    this.reconnectAttempt = 0;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
