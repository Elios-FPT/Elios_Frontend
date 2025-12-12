// file: elios_FE/src/resumeBuilder/pages/UserResume.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar";
import '../styles/UserResume.css';

const UserResume = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cvTitle, setCvTitle] = useState("");
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
        setError("Không thể tải danh sách hồ sơ. Vui lòng thử lại sau."); // Translated
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);


  // Opens the "create new" modal
  const handleCreateNew = () => {
    setCvTitle(""); // Reset title field
    setIsModalOpen(true);
  };

  // Closes the "create new" modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handles the submission from the modal
  const handleSubmitNewResume = async () => {
    const ResumeTitle = cvTitle.trim() || "Hồ sơ chưa đặt tên"; // Translated
    
    try {
      
      const url = `${API_ENDPOINTS.CREATE_USER_CV}`;

      const response = await axios.post(
        url,
        {
          resumeTitle: ResumeTitle,
        },
        { withCredentials: true }
      );

      console.log("response from server:", response.data);

      const newResumeId = response.data?.responseData?.id;
      if (!newResumeId) {
        console.error("No resume ID returned from server.");
        alert("Lỗi: Không thể nhận ID hồ sơ mới từ máy chủ."); // Translated
        setIsModalOpen(false); 
        return;
      }

      // No need to set modal false, navigation will unmount component
      navigate(`/resume/edit/${newResumeId}`);
    } catch (error) {
      console.error("Error creating resume:", error);
      console.log("API Endpoint used: POST", API_ENDPOINTS.CREATE_USER_CV);
      alert("Tạo hồ sơ thất bại. Vui lòng thử lại."); // Translated
      setIsModalOpen(false);
    }
  };


  // Handler for editing an existing resume
  const handleEdit = (id) => {
    navigate(`/resume/edit/${id}`);
  };

  // Handler for deleting a resume
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này không?")) { // Translated
      try {
        await axios.delete(`${API_ENDPOINTS.DELETE_USER_CV(id)}`, {
          withCredentials: true,
        });

        console.log("Deleted resume with ID:", id);
        setResumes(resumes.filter((resume) => resume.id !== id));
      } catch (error) {
        console.error("Error deleting resume:", error);
        alert("Xóa hồ sơ thất bại. Vui lòng thử lại."); // Translated
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div id="user-resume-background">
        
        <div id="user-resume-dashboard" style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải hồ sơ của bạn...</p> {/* Translated */}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div id="user-resume-background">
        
        <div id="user-resume-dashboard" style={{ textAlign: "center", padding: "40px", color: "red" }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button> {/* Translated */}
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="user-resume-background">
        
        <div id="user-resume-dashboard">
          <div id="dashboard-header">
            <h1>CV của tôi</h1> {/* Translated */}
            <button id="create-resume-btn" onClick={handleCreateNew}>
              Tạo CV mới {/* Translated */}
            </button>
          </div>

          <div id="resume-list-container">
            {resumes.length > 0 ? (
              resumes.map((resume) => (
                <div className="resume-card" key={resume.id}>
                  <div className="card-content">
                    <h3 className="resume-card-title">
                      {resume.resumeTitle || "Hồ sơ chưa đặt tên"} {/* Translated */}
                    </h3>
                    <p className="resume-card-updated">
                      Cập nhật lần cuối: {new Date(resume.updatedAt).toLocaleDateString()} {/* Translated */}
                    </p>
                  </div>
                  <div className="resume-card-actions">
                    <button
                      className="resume-action-btn edit"
                      onClick={() => handleEdit(resume.id)}
                    >
                      Sửa {/* Translated */}
                    </button>
                    <button
                      className="resume-action-btn delete"
                      onClick={() => handleDelete(resume.id)}
                    >
                      Xóa {/* Translated */}
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
            <h2>Tạo hồ sơ mới</h2> {/* Translated */}
            <p>Vui lòng nhập tiêu đề cho hồ sơ mới của bạn.</p> {/* Translated */}
            <input
              type="text"
              id="resume-title-input"
              value={cvTitle}
              onChange={(e) => setCvTitle(e.target.value)}
              placeholder="Ví dụ: CV Ứng tuyển..." // Translated
              autoFocus
            />
            <div id="modal-action-buttons">
              <button id="modal-cancel-btn" onClick={handleCloseModal}>
                Hủy {/* Translated */}
              </button>
              <button id="modal-create-btn" onClick={handleSubmitNewResume}>
                Tạo {/* Translated */}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserResume;