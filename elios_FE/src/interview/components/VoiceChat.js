import React, { useState, useRef, useEffect } from 'react';
import websocketService from '../utils/websocketService';
import audioService from '../utils/audioService';
import audioRecordingService from '../utils/audioRecordingService';
import { useInterview } from '../context/InterviewContext';
import { userProfile, aiProfile } from '../data/mockData';
import { CONNECTION_STATUS } from '../utils/config';
import toast from '../utils/toast';
import '../style/VoiceChat.css';

function VoiceChat({ interviewId, wsUrl, onDetailedFeedbackReceived }) {
  const { messages, setMessages, setIsAiThinking } = useInterview();
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(websocketService.getConnectionStatus());
  const [isProcessing, setIsProcessing] = useState(false);
  const isInitialized = useRef(false);
  const wsUrlRef = useRef(null);
  const statusChangeHandlerRef = useRef(null);
  const latestVoiceMetricsRef = useRef(null); // Store latest voice metrics to attach to final transcription

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      audioService.cleanup();
      audioRecordingService.cleanup();
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

    // Don't disconnect on unmount - connection is shared with TextChat
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
      websocketService.onMessage('transcription_result', handleTranscriptionResult);
      websocketService.onMessage('transcription', handleTranscription);
      websocketService.onMessage('voice_metrics', handleVoiceMetrics);
      websocketService.onMessage('error', handleErrorMessage);

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
      websocketService.onMessage('transcription_result', handleTranscriptionResult);
      websocketService.onMessage('transcription', handleTranscription);
      websocketService.onMessage('voice_metrics', handleVoiceMetrics);
      websocketService.onMessage('error', handleErrorMessage);
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
      websocketService.onMessage('transcription_result', handleTranscriptionResult);
      websocketService.onMessage('transcription', handleTranscription);
      websocketService.onMessage('voice_metrics', handleVoiceMetrics);
      websocketService.onMessage('error', handleErrorMessage);
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

  const handleTranscriptionResult = (message) => {
    setIsProcessing(false);

    // Create user message from transcribed text
    const userMessage = {
      id: Date.now(),
      text: message.text || 'Transcription unavailable',
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      metadata: {
        voiceMetrics: message.voice_metrics,
        transcriptionMetadata: message.metadata,
      },
    };

    setMessages(prev => [...prev, userMessage]);
  };

  const handleErrorMessage = (message) => {
    setIsProcessing(false);

    // Display error message to user
    const errorCode = message.code || 'UNKNOWN_ERROR';
    const errorMessage = message.message || 'An error occurred';

    // Show toast notification with error details
    toast.error(`${errorCode}: ${errorMessage}`);

    // Log error for debugging
    console.error('Backend error:', {
      code: errorCode,
      message: errorMessage,
      fullMessage: message,
    });
  };

  const handleTranscription = (message) => {
    const { text, is_final, confidence } = message;

    if (is_final) {
      // Final transcription - create user message and add to shared messages
      // This message will appear in both VoiceChat and TextChat tabs
      setIsProcessing(false);

      if (!text || text.trim() === '') {
        console.warn('Received empty transcription text');
        return;
      }

      const userMessage = {
        id: Date.now(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        metadata: {
          confidence: confidence,
          voiceMetrics: latestVoiceMetricsRef.current,
          transcriptionMetadata: {
            is_final: true,
            confidence: confidence,
          },
        },
      };

      // Add to shared messages context - will be displayed in TextChat tab
      setMessages(prev => [...prev, userMessage]);

      console.log('Transcription added to chat:', text);

      // Clear voice metrics after attaching to message
      latestVoiceMetricsRef.current = null;
    } else {
      // Intermediate transcription - could be used for real-time display
      // For now, just log it (could be enhanced to show live transcription)
      console.debug('Intermediate transcription:', text);
    }
  };

  const handleVoiceMetrics = (message) => {
    // Store voice metrics to attach to final transcription
    latestVoiceMetricsRef.current = {
      intonation_score: message.intonation_score,
      fluency_score: message.fluency_score,
      confidence_score: message.confidence_score,
      speaking_rate_wpm: message.speaking_rate_wpm,
      real_time: message.real_time,
    };

    // Log for debugging
    console.debug('Voice metrics received:', latestVoiceMetricsRef.current);
  };


  const handleMicClick = async () => {
    // Check connection
    if (connectionStatus !== CONNECTION_STATUS.CONNECTED) {
      toast.warning('Not connected to interview service');
      return;
    }

    // Get current question ID from shared service
    const currentQuestionId = websocketService.getCurrentQuestionId();
    if (!currentQuestionId && !isRecording) {
      toast.warning('No active question to answer');
      return;
    }

    if (isRecording) {
      // Stop recording
      await stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setAudioLevel(0);

      // Start recording with audio level callback
      await audioRecordingService.startRecording((level) => {
        setAudioLevel(level);
      });
    } catch (error) {
      setIsRecording(false);
      setAudioLevel(0);
      console.error('Error starting recording:', error);

      if (error.message.includes('permission')) {
        toast.error('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else {
        toast.error(error.message || 'Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      const audioBlob = await audioRecordingService.stopRecording();

      if (!audioBlob) {
        setIsProcessing(false);
        toast.warning('No audio recorded');
        return;
      }

      const audioBytes = await audioRecordingService.convertToWavPCM(audioBlob);
      setAudioLevel(0);

      const currentQuestionId = websocketService.getCurrentQuestionId();
      if (currentQuestionId) {
        websocketService.sendUserAudioAnswer(currentQuestionId, audioBytes, 'en-US');

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
      } else {
        setIsProcessing(false);
        toast.warning('No active question to answer');
      }
    } catch (error) {
      setIsRecording(false);
      setIsProcessing(false);
      setAudioLevel(0);
      console.error('Error stopping recording:', error);
      toast.error(error.message || 'Failed to process audio. Please try again.');
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
      <div className={`connection-banner connection-${connectionStatus}`} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '10px 20px',
        backgroundColor: connectionStatus === CONNECTION_STATUS.RECONNECTING ? '#ff6b6b' : '#4dabf7',
        color: 'white',
        textAlign: 'center',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}>
        <span className="material-icons">
          {connectionStatus === CONNECTION_STATUS.RECONNECTING ? 'sync' : 'info'}
        </span>
        <span>{statusMessage}</span>
        {connectionStatus === CONNECTION_STATUS.DISCONNECTED && (
          <button
            onClick={handleReconnect}
            className="reconnect-button"
            title="Reconnect to interview service"
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: 'white',
              color: '#4dabf7',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
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
    <div id="interview-voice-chat">
      {renderConnectionStatus()}

      {/* Background decorations */}
      <div className="voice-background">
        <div className="decoration decoration-top-left">
          <div className="shelf">
            <div className="book"></div>
            <div className="book"></div>
            <div className="vase"></div>
          </div>
        </div>
        <div className="decoration decoration-mid-left">
          <div className="shelf">
            <div className="plant plant-red"></div>
            <div className="plant plant-cactus"></div>
            <div className="object"></div>
          </div>
        </div>
        <div className="decoration decoration-top-right">
          <div className="frame frame-large">
            <div className="artwork"></div>
          </div>
          <div className="frame frame-small">
            <div className="landscape"></div>
          </div>
          <div className="stickies">
            <div className="sticky sticky-smiley">😊</div>
            <div className="sticky sticky-eye">👁</div>
            <div className="sticky sticky-lines">☰</div>
          </div>
        </div>
        <div className="decoration decoration-bottom-left">
          <div className="monitor"></div>
          <div className="papers"></div>
        </div>
        <div className="decoration decoration-bottom-right">
          <div className="plant plant-large"></div>
          <div className="books-stack"></div>
          <div className="coffee-mug"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="voice-content">
        {/* Profile cards */}
        <div className="profile-cards">
          <div className="profile-card user-card">
            <div className="profile-avatar user-avatar">
              <div className="avatar-placeholder material-icons">person</div>
            </div>
            <div className="profile-info">
              <div className="profile-name">{userProfile.name}</div>
              <div className="profile-role">{userProfile.role}</div>
            </div>
          </div>

          <div className="profile-card ai-card">
            <div className="profile-avatar ai-avatar">
              <div className="avatar-placeholder material-icons">star</div>
            </div>
            <div className="profile-info">
              <div className="profile-name">{aiProfile.name}</div>
              <div className="profile-role">{aiProfile.role}</div>
            </div>
          </div>
        </div>

        {/* Connection indicator */}
        <div className="connection-line"></div>

        {/* Instructions */}
        <div className="voice-instructions">
          {isProcessing ? (
            'Processing your answer...'
          ) : isRecording ? (
            'Recording... Click the mic to stop'
          ) : (
            'Press the mic button to start speaking'
          )}
        </div>

        {/* Mic Button */}
        <div className="voice-mic-container">
          {/* Sound Wave Animation */}
          {(isRecording || isProcessing) && (
            <div className="sound-wave-container">
              <div
                className="sound-wave sound-wave-1"
                style={{
                  '--audio-level': audioLevel,
                  '--wave-intensity': Math.max(0.15, audioLevel * 0.4)
                }}
              ></div>
              <div
                className="sound-wave sound-wave-2"
                style={{
                  '--audio-level': audioLevel,
                  '--wave-intensity': Math.max(0.1, audioLevel * 0.35)
                }}
              ></div>
              <div
                className="sound-wave sound-wave-3"
                style={{
                  '--audio-level': audioLevel,
                  '--wave-intensity': Math.max(0.05, audioLevel * 0.3)
                }}
              ></div>
              <div
                className="sound-wave sound-wave-4"
                style={{
                  '--audio-level': audioLevel,
                  '--wave-intensity': Math.max(0.03, audioLevel * 0.25)
                }}
              ></div>
              <div
                className="sound-wave sound-wave-5"
                style={{
                  '--audio-level': audioLevel,
                  '--wave-intensity': Math.max(0.01, audioLevel * 0.2)
                }}
              ></div>
            </div>
          )}

          <button
            className={`voice-mic-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
            onClick={handleMicClick}
            disabled={connectionStatus !== CONNECTION_STATUS.CONNECTED || isProcessing}
            style={{
              opacity: (connectionStatus !== CONNECTION_STATUS.CONNECTED || isProcessing) ? 0.5 : 1,
              cursor: (connectionStatus !== CONNECTION_STATUS.CONNECTED || isProcessing) ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="material-icons">
              {isProcessing ? 'hourglass_empty' : 'mic'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceChat;
