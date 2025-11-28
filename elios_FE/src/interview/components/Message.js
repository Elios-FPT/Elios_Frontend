import React from 'react';
import '../style/Message.css';

function Message({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message-wrapper ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <div className="message-text">{message.text}</div>
        <div className="message-timestamp">{message.timestamp}</div>
      </div>
      {!isUser && (
        <div className="message-actions">
          <div className="action-icon reply-icon material-icons">reply</div>
          <div className="action-icon profile-icon material-icons">person</div>
        </div>
      )}
      {!isUser && (
        <div className="ai-indicator material-icons">auto_awesome</div>
      )}
    </div>
  );
}

export default Message;
