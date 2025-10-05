// Frontend/elios_FE/src/cvGenerator/CVDesignerPage.js
import React from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/EditorToolbar';
import PropertiesPanel from './components/PropertiesPanel';
import './styles/Designer.css';

const CVDesignerPage = () => {
  return (
    <div className="cv-designer-page">
      <Toolbar />
      <CanvasEditor />
      <PropertiesPanel />
    </div>
  );
};

export default CVDesignerPage;
