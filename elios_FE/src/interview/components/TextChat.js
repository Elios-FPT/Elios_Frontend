import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import websocketService from '../utils/websocketService';
import audioService from '../utils/audioService';
import { useInterview } from '../context/InterviewContext';
import { CONNECTION_STATUS } from '../utils/config';
import toast from '../utils/toast';
import '../style/TextChat.css';

function TextChat({ interviewId, wsUrl, onDetailedFeedbackReceived }) {
  const { messages, setMessages, setIsAiThinking } = useInterview();
  const [inputText, setInputText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(websocketService.getConnectionStatus());
  const messagesEndRef = useRef(null);
  const isInitialized = useRef(false);
  const wsUrlRef = useRef(null);
  const statusChangeHandlerRef = useRef(null);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      audioService.cleanup();
    };
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (wsUrl && !isInitialized.current) {
      isInitialized.current = true;
      wsUrlRef.current = wsUrl;
      initializeWebSocket();
    } else if (wsUrl && wsUrl !== wsUrlRef.current) {
      // URL changed, disconnect old connection and connect to new one
      wsUrlRef.current = wsUrl;
      websocketService.disconnect();
      initializeWebSocket();
    }

    // Don't disconnect on unmount - connection is shared with VoiceChat
    // Only unregister handlers to prevent memory leaks
    return () => {
      if (isInitialized.current) {
        // Unregister status change handler
        if (statusChangeHandlerRef.current) {
          websocketService.offStatusChange(statusChangeHandlerRef.current);
          statusChangeHandlerRef.current = null;
        }
        // Unregister handlers but keep connection alive for other component
        // The connection will be disconnected when interview ends (in InterviewPage)
        isInitialized.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  const initializeWebSocket = () => {
    try {
      // Always register message handlers (they persist in Map)
      websocketService.onMessage('question', handleQuestionMessage);
      websocketService.onMessage('follow_up_question', handleFollowUpQuestionMessage);
      websocketService.onMessage('interview_complete', handleInterviewCompleteMessage);

      // Enhanced status change handler
      const handleStatusChange = (status) => {
        setConnectionStatus(status);
      };
      websocketService.onStatusChange(handleStatusChange);
      statusChangeHandlerRef.current = handleStatusChange;

      // Check if already connected before attempting to connect
      const currentStatus = websocketService.getConnectionStatus();
      if (currentStatus === CONNECTION_STATUS.CONNECTED) {
        console.log('WebSocket already connected, using existing connection');
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        return;
      }

      // Connect
      websocketService.connect(wsUrl);
    } catch (error) {
      toast.error('Failed to connect to interview service');
      console.error('WebSocket initialization error:', error);
    }
  };

  // Re-register handlers when connection is restored
  useEffect(() => {
    if (connectionStatus === CONNECTION_STATUS.CONNECTED) {
      // Ensure handlers are registered after reconnection
      websocketService.onMessage('question', handleQuestionMessage);
      websocketService.onMessage('follow_up_question', handleFollowUpQuestionMessage);
      websocketService.onMessage('interview_complete', handleInterviewCompleteMessage);
    }
  }, [connectionStatus]);

  const handleReconnect = () => {
    if (!wsUrl) {
      toast.warning('No WebSocket URL available');
      return;
    }
    try {
      // Reset reconnection attempt counter
      websocketService.resetReconnectAttempt();
      // Re-register handlers
      websocketService.onMessage('question', handleQuestionMessage);
      websocketService.onMessage('follow_up_question', handleFollowUpQuestionMessage);
      websocketService.onMessage('interview_complete', handleInterviewCompleteMessage);
      // Connect
      websocketService.connect(wsUrl);
    } catch (error) {
      toast.error('Failed to reconnect');
      console.error('Reconnect error:', error);
    }
  };

  const handleQuestionMessage = (message) => {
    // Xóa placeholder trước khi thêm câu hỏi mới
    setMessages(prev => prev.filter(msg => msg.id !== 'thinking-placeholder'));
    setIsAiThinking(false);

    const aiMessage = {
      id: Date.now(),
      text: message.text,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      metadata: {
        questionId: message.question_id,
        questionType: message.question_type,
        difficulty: message.difficulty,
        audioData: message.audio_data,
      },
    };

    setMessages(prev => [...prev, aiMessage]);

    websocketService.setCurrentQuestionId(message.question_id);

    if (message.audio_data) {
      audioService.playBase64Audio(message.audio_data).catch(err => console.error(err));
    }
  };

  const handleFollowUpQuestionMessage = (message) => {
    // Xóa placeholder
    setMessages(prev => prev.filter(msg => msg.id !== 'thinking-placeholder'));
    setIsAiThinking(false);

    const aiMessage = {
      id: Date.now(),
      text: message.text,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      metadata: {
        questionId: message.question_id,
        parentQuestionId: message.parent_question_id,
        questionType: 'follow_up',
        generatedReason: message.generated_reason,
        orderInSequence: message.order_in_sequence,
        audioData: message.audio_data,
      },
    };

    setMessages(prev => [...prev, aiMessage]);

    websocketService.setCurrentQuestionId(message.question_id);

    if (message.audio_data) {
      audioService.playBase64Audio(message.audio_data).catch(err => console.error(err));
    }
  };
  const handleInterviewCompleteMessage = (message) => {
    // Show toast notification
    toast.info('Interview completed! Viewing your feedback...');

    // Extract detailed_feedback from message
    if (message.detailed_feedback && onDetailedFeedbackReceived) {
      onDetailedFeedbackReceived(message.detailed_feedback);
    } else {
      console.error('Interview complete message missing detailed_feedback:', message);
      toast.error('Received incomplete feedback data');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    if (connectionStatus !== CONNECTION_STATUS.CONNECTED) {
      toast.warning('Not connected to interview service');
      return;
    }

    try {
      const currentQuestionId = websocketService.getCurrentQuestionId();
      if (!currentQuestionId) {
        toast.warning('No active question to answer');
        return;
      }

      const userMessage = {
        id: Date.now(),
        text: inputText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages(prev => [...prev, userMessage]);

      const placeholderMessage = {
        id: 'thinking-placeholder',
        text: 'AI đang phân tích',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isPlaceholder: true,
      };
      setMessages(prev => [...prev, placeholderMessage]);

      setIsAiThinking(true);

      const answerText = inputText;
      setInputText('');

      websocketService.sendUserAnswer(currentQuestionId, answerText);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderConnectionStatus = () => {
    if (connectionStatus === CONNECTION_STATUS.CONNECTED) return null;

    const getStatusMessage = () => {
      switch (connectionStatus) {
        case CONNECTION_STATUS.DISCONNECTED:
          return 'Disconnected';
        case CONNECTION_STATUS.PLANNING:
          return 'Planning interview...';
        case CONNECTION_STATUS.CONNECTING:
          return 'Connecting...';
        case CONNECTION_STATUS.RECONNECTING:
          const maxAttempts = 5; // From WS_CONFIG
          const currentAttempt = websocketService.getReconnectAttempt();
          if (currentAttempt > 0 && currentAttempt <= maxAttempts) {
            return `Reconnecting... (Attempt ${currentAttempt}/${maxAttempts})`;
          }
          return 'Reconnecting...';
        default:
          return 'Connecting...';
      }
    };

    const statusMessage = getStatusMessage();

    return (
      <div className={`connection-banner connection-${connectionStatus}`}>
        <span className="material-icons">
          {connectionStatus === CONNECTION_STATUS.RECONNECTING ? 'sync' : 'info'}
        </span>
        <span>{statusMessage}</span>
        {connectionStatus === CONNECTION_STATUS.DISCONNECTED && (
          <button
            onClick={handleReconnect}
            className="reconnect-button"
            title="Reconnect to interview service"
          >
            <span className="material-icons">refresh</span>
            Reconnect
          </button>
        )}
        {connectionStatus === CONNECTION_STATUS.RECONNECTING && websocketService.getReconnectAttempt() > 0 && (
          <span className="reconnect-spinner">
            <span className="material-icons spin">autorenew</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div id="interview-text-chat">
      {renderConnectionStatus()}

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div>
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a response..."
            className="message-input"
            disabled={connectionStatus !== CONNECTION_STATUS.CONNECTED}
          />
          <button
            onClick={handleSendMessage}
            className="send-button"
            disabled={!inputText.trim() || connectionStatus !== CONNECTION_STATUS.CONNECTED}
          >
            <span className="material-icons">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextChat;
