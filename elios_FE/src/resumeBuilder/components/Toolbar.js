// file: elios_FE/src/resumeBuilder/components/Toolbar.js
import React from 'react';
import PropTypes from 'prop-types';
import exportToPdf from '../utils/exportPdf';
import '../styles/Toolbar.css';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

const Toolbar = ({ resumeData, onReset, isSaving }) => {
  const navigate = useNavigate();
  const resumeName = resumeData?.personalInfo?.firstName
    ? `${resumeData.personalInfo.firstName}'s Resume`
    : "Untitled Resume";

  return (
    <div id="resume-builder-toolbar">
      <div className="toolbar-left">
        <button
          type="button"
          className="breadcrumbs-btn"
          onClick={() => navigate(-1)} 
          aria-label="Go back to previous page"
        >
           Resumes / Resume Builder
        </button>
        <div className="resume-title-container">
          <h2 className="resume-title">{resumeName}</h2>
          {isSaving ? (
             <span className="update-status" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                Saving...
             </span>
          ) : (
             <span className="update-status">✓ Saved</span>
          )}
        </div>
      </div>
      <div className="toolbar-right">
        <button className="toolbar-btn-secondary" onClick={onReset}>Reset</button>

        <button className="toolbar-btn-download" onClick={() => exportToPdf('resume-preview')}>
          Download
        </button>
      </div>
    </div>
  );
};

Toolbar.propTypes = {
  resumeData: PropTypes.object.isRequired,
  onReset: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
};

// Default props in case isSaving is not passed immediately
Toolbar.defaultProps = {
  isSaving: false,
};

export default Toolbar;