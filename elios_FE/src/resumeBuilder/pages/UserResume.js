// file: elios_FE/src/resumeBuilder/pages/UserResume.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar";
import '../styles/UserResume.css';

// Define available templates
const AVAILABLE_TEMPLATES = [
  { 
    id: 'basic', 
    name: 'Cơ bản', 
    description: 'Đơn giản, chuyên nghiệp.', 
    isAvailable: true 
  },
  { 
    id: 'modern', 
    name: 'Hiện đại', 
    description: 'Coming soon.', 
    isAvailable: false 
  },
  { 
    id: 'creative', 
    name: 'Sáng tạo', 
    description: 'Coming soon.', 
    isAvailable: false 
  },
];

const UserResume = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [cvTitle, setCvTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("basic");
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(API_ENDPOINTS.GET_USER_CV, {
          withCredentials: true,
        });

        const data = response.data.responseData;
        setResumes(data);
      } catch (error) {
        console.error("Error fetching resumes:", error);
        setError("Không thể tải danh sách hồ sơ. Vui lòng thử lại sau."); 
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);


  const handleCreateNew = () => {
    setCvTitle(""); 
    setSelectedTemplate("basic"); // Default to basic
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitNewResume = async () => {
    const ResumeTitle = cvTitle.trim() || "Hồ sơ chưa đặt tên"; 
    
    try {
      const url = `${API_ENDPOINTS.CREATE_USER_CV}`;

      const response = await axios.post(
        url,
        {
          resumeTitle: ResumeTitle,
          template: selectedTemplate, // Sending selected template to backend
        },
        { withCredentials: true }
      );

      console.log("response from server:", response.data);

      const newResumeId = response.data?.responseData?.id;
      if (!newResumeId) {
        console.error("No resume ID returned from server.");
        alert("Lỗi: Không thể nhận ID hồ sơ mới từ máy chủ."); 
        setIsModalOpen(false); 
        return;
      }

      navigate(`/resume/edit/${newResumeId}`);
    } catch (error) {
      console.error("Error creating resume:", error);
      alert("Tạo hồ sơ thất bại. Vui lòng thử lại."); 
      setIsModalOpen(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/resume/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này không?")) { 
      try {
        await axios.delete(`${API_ENDPOINTS.DELETE_USER_CV(id)}`, {
          withCredentials: true,
        });
        setResumes(resumes.filter((resume) => resume.id !== id));
      } catch (error) {
        console.error("Error deleting resume:", error);
        alert("Xóa hồ sơ thất bại. Vui lòng thử lại."); 
      }
    }
  };
  
  // Helper to render preview content
  const renderTemplatePreview = (templateId) => {
      if (templateId === 'basic') {
          return (
            <div className="mini-cv-preview basic-preview">
                <div className="mini-header"></div>
                <div className="mini-body">
                    <div className="mini-line long"></div>
                    <div className="mini-line short"></div>
                    <div className="mini-section"></div>
                    <div className="mini-line medium"></div>
                    <div className="mini-line long"></div>
                </div>
            </div>
          );
      }
      return <span style={{fontSize: '10px', color: '#888'}}>Coming Soon</span>;
  };

  if (loading) {
    return (
      <div id="user-resume-background">
        <UserNavbar />
        <div id="user-resume-dashboard" style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải hồ sơ của bạn...</p> 
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="user-resume-background">
        <UserNavbar />
        <div id="user-resume-dashboard" style={{ textAlign: "center", padding: "40px", color: "red" }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button> 
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="user-resume-background">
        <UserNavbar />
        <div id="user-resume-dashboard">
          <div id="dashboard-header">
            <h1>CV của tôi</h1> 
            <button id="create-resume-btn" onClick={handleCreateNew}>
              Tạo CV mới 
            </button>
          </div>

          <div id="resume-list-container">
            {resumes.length > 0 ? (
              resumes.map((resume) => (
                <div className="resume-card" key={resume.id}>
                  <div className="card-content">
                    <h3 className="resume-card-title">
                      {resume.resumeTitle || "Hồ sơ chưa đặt tên"} 
                    </h3>
                    <p className="resume-card-updated">
                      Cập nhật lần cuối: {new Date(resume.updatedAt).toLocaleDateString()} 
                    </p>
                  </div>
                  <div className="resume-card-actions">
                    <button
                      className="resume-action-btn edit"
                      onClick={() => handleEdit(resume.id)}
                    >
                      Sửa 
                    </button>
                    <button
                      className="resume-action-btn delete"
                      onClick={() => handleDelete(resume.id)}
                    >
                      Xóa 
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>Chưa có CV nào. Hãy tạo CV đầu tiên của bạn!</p> 
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Create New Resume Modal --- */}
      {isModalOpen && (
        <div id="create-resume-modal-backdrop" onClick={handleCloseModal}>
          <div id="create-resume-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo hồ sơ mới</h2>
            
            <div id="modal-form-body">
              <label className="modal-label">Tiêu đề hồ sơ</label>
              <input
                type="text"
                id="resume-title-input"
                value={cvTitle}
                onChange={(e) => setCvTitle(e.target.value)}
                placeholder="Ví dụ: CV Ứng tuyển..." 
                autoFocus
              />

              <label className="modal-label">Chọn mẫu (Template)</label>
              <div id="template-selection-grid">
                {AVAILABLE_TEMPLATES.filter(t => t.isAvailable).map((tmpl) => (
                  <div 
                    key={tmpl.id}
                    className={`template-option-card ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                  >
                    <div className="template-preview-box">
                       {renderTemplatePreview(tmpl.id)}
                    </div>
                    <div className="template-info">
                      <strong>{tmpl.name}</strong>
                      <small>{tmpl.description}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="modal-action-buttons">
              <button id="modal-cancel-btn" onClick={handleCloseModal}>
                Hủy 
              </button>
              <button id="modal-create-btn" onClick={handleSubmitNewResume}>
                Tạo 
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserResume;