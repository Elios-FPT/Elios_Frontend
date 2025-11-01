// file: elios_FE/src/resumeBuilder/components/Toolbar.js
import React from 'react';
import PropTypes from 'prop-types';
import exportToPdf from '../utils/exportPdf';

// Add the onReset prop back to the component's arguments
const Toolbar = ({ resumeData, onReset }) => {
  const resumeName = resumeData?.personalInfo?.firstName 
    ? `${resumeData.personalInfo.firstName}'s Resume` 
    : "Untitled Resume";

  return (
    <div id="resume-builder-toolbar">
      <div className="toolbar-left">
        <span className="breadcrumbs">Dashboard / Resume Builder</span>
        <div className="resume-title-container">
          <h2 className="resume-title">{resumeName}</h2>
          <span className="update-status">✓ Updated 3 mins ago</span>
        </div>
      </div>
      <div className="toolbar-right">
        {/* --- THIS IS THE FIX --- */}
        {/* Add the Reset button back and connect it to the onReset function */}
        <button className="toolbar-btn-secondary" onClick={onReset}>Reset</button>

        <button className="toolbar-btn-download" onClick={() => exportToPdf('resume-preview')}>
          Download
        </button>
      </div>
    </div>
  );
};

// Add onReset back to the propTypes validation
Toolbar.propTypes = {
  resumeData: PropTypes.object.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default Toolbar;