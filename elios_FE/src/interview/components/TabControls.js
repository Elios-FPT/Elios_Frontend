import React from 'react';
import '../style/TabControls.css';

function TabControls({ activeTab, onTabSwitch, onEndSession }) {
  return (
      <div id="interview-tab-controls" className="control-buttons">
        {/* Microphone button - changes based on active tab */}
        {activeTab === 'voice' ? (
          <button
            className="control-button mic-button active-prominent"
            onClick={() => onTabSwitch('voice')}
          >
            <div className="mic-icon material-icons">mic</div>
            <span className="button-text">Speak</span>
          </button>
        ) : (
          <button
            className="control-button mic-button-icon"
            onClick={() => onTabSwitch('voice')}
          >
            <div className="mic-icon material-icons">mic</div>
          </button>
        )}

        {/* Write button - changes based on active tab */}
        {activeTab === 'text' ? (
          <button
            className="control-button write-button active-prominent"
            onClick={() => onTabSwitch('text')}
          >
            <div className="write-icon material-icons">edit</div>
            <span className="button-text">Write</span>
          </button>
        ) : (
          <button
            className="control-button write-button-icon"
            onClick={() => onTabSwitch('text')}
          >
            <div className="write-icon material-icons">edit</div>
          </button>
        )}

        {/* End session button */}
        <button
          className="control-button end-button"
          onClick={onEndSession}
        >
          End session
        </button>
      </div>
  );
}

export default TabControls;
