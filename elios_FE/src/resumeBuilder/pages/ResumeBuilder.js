// file: elios_FE/src/resumeBuilder/pages/ResumeBuilder.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { Container, Row, Col } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import '../styles/ResumeBuilder.css';
import Toolbar from '../components/Toolbar';
import SectionEditor from '../components/SectionEditor';
import PreviewPanel from '../components/PreviewPanel';
import CVFeedbackView from '../components/CVFeedbackView'; // <--- IMPORT
import { loadFromLocalStorage, saveToLocalStorage, saveToServer } from '../utils/storage';
import UserNavbar from '../../components/navbars/UserNavbar';
import { FaEdit, FaRobot } from 'react-icons/fa'; // Icons for tabs

// ... [Keep initialResumeState and createNewItem exactly as they were] ...
const initialResumeState = {
  personalInfo: {
    id: 'personalInfo',
    title: 'Personal Info',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    jobTitle: '',
    links: { id: 'links', title: 'Links', items: [] },
  },
  education: {
    id: 'education',
    title: 'Education',
    items: [],
  },
  experience: {
    id: 'experience',
    title: 'Experience',
    items: [],
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    items: [],
  },
  skillsets: {
    id: 'skillsets',
    title: 'Skillsets',
    languages: { id: 'languages', title: 'Languages', items: [] },
    frameworks: { id: 'frameworks', title: 'Libraries / Frameworks', items: [] }, 
    tools: { id: 'tools', title: 'Tools / Platforms', items: [] },
    databases: { id: 'databases', title: 'Databases', items: [] },
  },
};

const createNewItem = (sectionId) => {
  const base = { id: uuidv4() };
  switch (sectionId) {
    case 'personalInfo.links':
      return { ...base, name: 'Select...', url: '' };
    case 'experience':
      return { ...base, employer: '', jobTitle: '', start: '', end: '', location: '', description: '' };
    case 'projects':
      return { 
        ...base, 
        projectName: '', 
        role: '', 
        start: '', 
        end: '', 
        description: '', 
        techStack: '', 
        achievements: '', 
        githubUrl: '', 
        liveUrl: '' 
      };
    case 'education':
      return { ...base, institution: '', location: '', degreeType: '', fieldOfStudy: '', start: '', grad: '', gpa: '' };
    case 'skillsets.languages':
    case 'skillsets.frameworks':
    case 'skillsets.tools':
    case 'skillsets.databases':
      return { ...base, name: '' };
    default:
      return base;
  }
};

const ResumeBuilder = () => {
  const { id } = useParams();
  const [resumeData, setResumeData] = useState(loadFromLocalStorage() || initialResumeState);
  const [isSaving, setIsSaving] = useState(false);
  
  // NEW STATE: Manage active tab ('editor' or 'feedback')
  const [activeTab, setActiveTab] = useState('editor');

  const sectionOrder = ['personalInfo', 'education', 'experience', 'skillsets', 'projects'];

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSaving(true);
      saveToLocalStorage(resumeData);
      try {
        await saveToServer(resumeData, id);
      } catch (error) {
        console.error("Failed to save to server", error);
      } finally {
        setIsSaving(false);
      }
    }, 10000); 

    return () => clearTimeout(timer);
  }, [resumeData, id]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_USER_CV_DETAIL(id), {
          withCredentials: true,
        });
        // Merge fetched data with initial state structure to ensure all keys exist
        // This prevents crashes if the DB has partial data
        if(response.data.responseData) {
            setResumeData(prev => ({...initialResumeState, ...response.data.responseData}));
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };
    fetchResume();
  }, [id]);
  

  const handleFieldChange = useCallback((sectionId, field, value, itemId = null) => {
    setResumeData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const path = sectionId.split('.');
      let current = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      if (itemId) {
        const itemIndex = current.items.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
          current.items[itemIndex][field] = value;
        }
      } else {
        current[field] = value;
      }
      return newData;
    });
  }, []);

  const handleAddItem = useCallback((sectionId) => {
    setResumeData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const path = sectionId.split('.');
      let current = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      current.items.push(createNewItem(sectionId));
      return newData;
    });
  }, []);

  const handleRemoveItem = useCallback((sectionId, itemId) => {
    setResumeData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const path = sectionId.split('.');
      let current = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      current.items = current.items.filter(item => item.id !== itemId);
      return newData;
    });
  }, []);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      setResumeData(initialResumeState);
      localStorage.removeItem('resumeData');
    }
  };

  return (
    <div id="rb-app-container">
      <UserNavbar />
      <Toolbar resumeData={resumeData} onReset={handleReset} isSaving={isSaving} />
      <Container fluid className="rb-main-container">
        <Row>
          <Col md={5} id="rb-editor-panel">
            {/* UPDATED TABS */}
            <div className="editor-tabs">
              <button 
                className={`editor-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                <FaEdit style={{marginRight: '6px'}}/> Editor
              </button>
              <button 
                className={`editor-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedback')}
              >
                <FaRobot style={{marginRight: '6px'}}/> AI Assistant
              </button>
            </div>

            {/* CONDITIONAL CONTENT */}
            {activeTab === 'editor' ? (
                <div className="editor-content-wrapper">
                    {sectionOrder.map(sectionId => (
                    resumeData[sectionId] && (
                        <SectionEditor
                        key={sectionId}
                        section={resumeData[sectionId]}
                        path={sectionId}
                        onFieldChange={handleFieldChange}
                        onAddItem={handleAddItem}
                        onRemoveItem={handleRemoveItem}
                        />
                    )
                    ))}
                </div>
            ) : (
                // NEW FEEDBACK VIEW
                <CVFeedbackView resumeData={resumeData} resumeId={id} />
            )}
          </Col>
          <Col md={7} id="rb-preview-panel">
            <PreviewPanel resumeData={resumeData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResumeBuilder;