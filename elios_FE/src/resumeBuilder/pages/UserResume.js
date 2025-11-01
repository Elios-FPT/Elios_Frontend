// file: elios_FE/src/resumeBuilder/pages/UserResume.js
import React from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar";
import '../styles/UserResume.css';

const mockResume = () => [
  {
    "_id": "60dc4a3a4d4d4d4d4d4d4d4a",
    "resumeTitle": "Software Engineer Resume",
    "updatedAt": "2023-10-28T10:30:00Z"
  },
  {
    "_id": "60dc4a3a4d4d4d4d4d4d4d4b",
    "resumeTitle": "Product Manager CV",
    "updatedAt": "2023-10-26T14:15:00Z"
  },
  {
    "_id": "60dc4a3a4d4d4d4d4d4d4d4c",
    "resumeTitle": "Full-Stack Dev (Internal)",
    "updatedAt": "2023-10-22T08:00:00Z"
  }
];

const UserResume = () => {
  const resumes = mockResume();
  const navigate = useNavigate();

  // Handler for creating a new resume
  const handleCreateNew = () => {
    // In a real app, you would POST to /api/resumes
    // and then navigate to the new ID.
    console.log("Creating new resume...");
    // For this mock, we'll just navigate to a placeholder
    // In your real app, you'd get the ID from the backend:
    // const newResume = await api.post('/api/resumes', { title: 'Untitled' });
    // navigate(`/resume/edit/${newResume._id}`);
    alert("Creating new CV... (See backend requirements)");
  };

  // Handler for editing an existing resume
  const handleEdit = (id) => {
    navigate(`/resume/edit/${id}`);
  };

  // Handler for deleting a resume
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      // In a real app, you would DELETE /api/resumes/:id
      console.log(`Deleting resume ${id}`);
    }
  };

  return (
    <>
    <div id="user-resume-background">
    <UserNavbar />
    <div id="user-resume-dashboard">
      <div id="dashboard-header">
        <h1>My Resumes</h1>
        <button id="create-resume-btn" onClick={handleCreateNew}>
          + Create New CV
        </button>
      </div>

      <div id="resume-list-container">
        {resumes.map((resume) => (
          <div className="resume-card" key={resume._id}>
            <div className="card-content">
              <h3 className="resume-card-title">{resume.resumeTitle}</h3>
              <p className="resume-card-updated">
                Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="resume-card-actions">
              <button 
                className="resume-action-btn edit" 
                onClick={() => handleEdit(resume._id)}
              >
                Edit
              </button>
              <button 
                className="resume-action-btn delete"
                onClick={() => handleDelete(resume._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
    </>
  );
}

export default UserResume;