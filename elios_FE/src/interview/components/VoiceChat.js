import React, { useState, useEffect, useRef } from 'react';
import { userProfile, aiProfile } from '../data/mockData';
import '../style/VoiceChat.css';

function VoiceChat() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const intervalRef = useRef(null);

  const simulateAudioLevel = () => {
    // Simulate realistic audio levels with random variations
    const baseLevel = Math.random() * 0.8 + 0.2; // Random between 0.2 and 1.0
    const variation = (Math.random() - 0.5) * 0.3; // Random variation of ±0.15
    const newLevel = Math.max(0, Math.min(1, baseLevel + variation));
    setAudioLevel(newLevel);
  };

  const handleMicClick = () => {
    setIsSpeaking(!isSpeaking);
    // Simulate speaking state for a few seconds
    if (!isSpeaking) {
      // Start audio level simulation
      intervalRef.current = setInterval(simulateAudioLevel, 100);

      setTimeout(() => {
        setIsSpeaking(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          setAudioLevel(0);
        }
      }, 3000);
    } else {
      // Stop audio level simulation
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        setAudioLevel(0);
      }
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="voice-chat">
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
          Press the mic button to start speaking
        </div>

        {/* Mic Button */}
        <div className="voice-mic-container">
          {/* Sound Wave Animation */}
          {isSpeaking && (
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
            className={`voice-mic-button ${isSpeaking ? 'recording' : ''}`}
            onClick={handleMicClick}
          >
            <span className="material-icons">mic</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceChat;
