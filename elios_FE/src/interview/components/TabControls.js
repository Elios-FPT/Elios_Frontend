import React from 'react';
import '../style/TabControls.css';

function TabControls({ activeTab, onTabSwitch, onEndSession, isEndingSession }) {
  return (
    <div id="interview-tab-controls" className="control-buttons">
      {/* Microphone button */}
      {activeTab === 'voice' ? (
        <button
          className="control-button mic-button active-prominent"
          onClick={() => onTabSwitch('voice')}
          disabled={isEndingSession}
        >
          <div className="mic-icon material-icons">mic</div>
          <span className="button-text">Speak</span>
        </button>
      ) : (
        <button
          className="control-button mic-button-icon"
          onClick={() => onTabSwitch('voice')}
          disabled={isEndingSession}
        >
          <div className="mic-icon material-icons">mic</div>
        </button>
      )}

      {/* Write button */}
      {activeTab === 'text' ? (
        <button
          className="control-button write-button active-prominent"
          onClick={() => onTabSwitch('text')}
          disabled={isEndingSession}
        >
          <div className="write-icon material-icons">edit</div>
          <span className="button-text">Write</span>
        </button>
      ) : (
        <button
          className="control-button write-button-icon"
          onClick={() => onTabSwitch('text')}
          disabled={isEndingSession}
        >
          <div className="write-icon material-icons">edit</div>
        </button>
      )}

      {/* End session button */}
      <button
        className="control-button end-button"
        onClick={onEndSession}
        disabled={isEndingSession}
      >
        {isEndingSession ? (
          <>
            <span className="material-icons spin" style={{ fontSize: 18, marginRight: 8 }}>
              hourglass_empty
            </span>
            Đang kết thúc...
          </>
        ) : (
          'End session'
        )}
      </button>
    </div>
  );
}

export default TabControls;