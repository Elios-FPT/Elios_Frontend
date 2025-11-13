import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import websocketService from '../utils/websocketService';
import { CONNECTION_STATUS } from '../utils/config';
import toast from '../utils/toast';
import '../style/TextChat.css';

function TextChat({ interviewId, wsUrl, onEvaluationReceived }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.DISCONNECTED);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const messagesEndRef = useRef(null);
  const isInitialized = useRef(false);
  const wsUrlRef = useRef(null);

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

    // Only disconnect on actual unmount, not on dependency changes
    return () => {
      // This cleanup only runs on unmount
      if (isInitialized.current) {
        websocketService.disconnect();
        isInitialized.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  const initializeWebSocket = () => {
    try {
      // Register message handlers (they persist in Map, but ensure they're set)
      websocketService.onMessage('question', handleQuestionMessage);
      websocketService.onMessage('follow_up_question', handleFollowUpQuestionMessage);
      websocketService.onMessage('evaluation', handleEvaluationMessage);

      // Enhanced status change handler that also tracks reconnection attempts
      const handleStatusChange = (status) => {
        setConnectionStatus(status);
        // Update reconnection attempt count when status changes
        if (status === CONNECTION_STATUS.RECONNECTING) {
          const attempt = websocketService.getReconnectAttempt();
          setReconnectAttempt(attempt);
        } else if (status === CONNECTION_STATUS.CONNECTED) {
          // Reset attempt count when connected
          setReconnectAttempt(0);
        }
      };
      websocketService.onStatusChange(handleStatusChange);

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
      websocketService.onMessage('evaluation', handleEvaluationMessage);
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
      websocketService.onMessage('evaluation', handleEvaluationMessage);
      // Connect
      websocketService.connect(wsUrl);
    } catch (error) {
      toast.error('Failed to reconnect');
      console.error('Reconnect error:', error);
    }
  };

  const handleQuestionMessage = (message) => {
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
      },
    };

    setMessages(prev => [...prev, aiMessage]);

    // Track current question ID
    setCurrentQuestionId(message.question_id);
  };

  const handleFollowUpQuestionMessage = (message) => {
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

    // Update current question ID to the follow-up question
    setCurrentQuestionId(message.question_id);
  };

  const handleEvaluationMessage = (evaluation) => {
    if (onEvaluationReceived) {
      onEvaluationReceived(evaluation);
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

    // Check connection
    if (connectionStatus !== CONNECTION_STATUS.CONNECTED) {
      toast.warning('Not connected to interview service');
      return;
    }

    try {
      // Check if we have a current question ID
      if (!currentQuestionId) {
        toast.warning('No active question to answer');
        return;
      }

      // Add user message to UI
      const newMessage = {
        id: Date.now(),
        text: inputText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages(prev => [...prev, newMessage]);
      const answerText = inputText;
      setInputText('');

      // Send via WebSocket
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
          if (reconnectAttempt > 0 && reconnectAttempt <= maxAttempts) {
            return `Reconnecting... (Attempt ${reconnectAttempt}/${maxAttempts})`;
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
        {connectionStatus === CONNECTION_STATUS.RECONNECTING && reconnectAttempt > 0 && (
          <span className="reconnect-spinner">
            <span className="material-icons spin">sync</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="text-chat">
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
