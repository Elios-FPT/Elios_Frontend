import React from 'react';
import '../style/Message.css';

function Message({ message }) {
  const isUser = message.sender === 'user';
  const isPlaceholder = message.isPlaceholder;

  return (
    <div className={`message-wrapper ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <div className="message-text">
          {message.text}
          {isPlaceholder && (
            <span className="thinking-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          )}
        </div>
        <div className="message-timestamp">{message.timestamp}</div>
      </div>

      {!isUser && !isPlaceholder && (
        <div className="ai-indicator material-icons">auto_awesome</div>
      )}
    </div>
  );
}

export default Message;