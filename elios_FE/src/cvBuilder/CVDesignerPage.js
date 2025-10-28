// Frontend/elios_FE/src/cvGenerator/CVDesignerPage.js
import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CanvasEditor from "./components/CanvasEditor";
import Toolbar from "./components/EditorToolbar";
import PropertiesPanel from "./components/PropertiesPanel";
import { loadAllFonts } from "./utils/loadFonts"; // ✅ add this import
import "../styles/CVDesignerPage.css";

const CVDesignerPage = () => {
  // ✅ Load all Google Fonts when editor opens
  useEffect(() => {
    loadAllFonts();
  }, []);

  return (
    <div className="cv-designer-page-background">
      <Container fluid className="cv-designer-container">
        <Row className="justify-content-center">
          {/* Center column for Canvas */}
          <Col md="auto" className="cv-canvas-col">
            <div className="cv-canvas-wrapper">
              <CanvasEditor />
            </div>
          </Col>

          {/* Right column for Toolbar + Properties */}
          <Col md={2} className="cv-right-panel">
            <Toolbar />
            <PropertiesPanel />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CVDesignerPage;
