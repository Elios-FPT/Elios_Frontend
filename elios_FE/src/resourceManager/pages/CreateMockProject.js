// src/resourceManager/pages/CreateMockProject.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiUpload, FiX, FiCheckCircle } from 'react-icons/fi';

const CreateMockProject = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    language: '',
    description: '',
    difficulty: '',
    fileName: '',
    keyPrefix: '',
    baseProjectUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(API_ENDPOINTS.CREATE_MOCK_PROJECT, formData, { withCredentials: true });

      if (res.data.status === 200 && res.data.responseData) {
        alert('Project created successfully');
        navigate('/manage-project-bank');
      } else {
        throw new Error(res.data.message || 'Create failed');
      }
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.message || 'Create failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Upload ZIP
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Please select a .zip file');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setError(null);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await axios.post(
        API_ENDPOINTS.UPLOAD_ZIP,
        formDataUpload,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (res.data.status === 200 && res.data.responseData) {
        const publicUrl = res.data.responseData;

        // === TỰ ĐỘNG TRÍCH XUẤT fileName & keyPrefix ===
        const urlObj = new URL(publicUrl);
        const pathname = urlObj.pathname;
        const pathParts = pathname.split('/').filter(Boolean); // ["mockproject", "geek.xxx.zip"]

        let extractedFileName = '';
        let extractedKeyPrefix = '';

        if (pathParts.length >= 2) {
          extractedKeyPrefix = pathParts[pathParts.length - 2]; // "mockproject"
          extractedFileName = pathParts[pathParts.length - 1];   // "geek.xxx.zip"
        } else if (pathParts.length === 1) {
          extractedFileName = pathParts[0];
          extractedKeyPrefix = 'mockproject'; // fallback
        }

        // Cập nhật form
        setFormData(prev => ({
          ...prev,
          baseProjectUrl: publicUrl,
          fileName: extractedFileName,
          keyPrefix: extractedKeyPrefix
        }));

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Creating project...</p>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Create New Mock Project</h1>
            <p className="intro-text">Fill in the details to create a new project with Markdown support.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            {/* Title & Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required className="form-input" />
              </div>
              <div className="form-group">
                <label>Language</label>
                <input name="language" value={formData.language} onChange={handleChange} required className="form-input" />
              </div>
            </div>

            {/* Difficulty */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} required className="form-select">
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Description with Side-by-Side Edit and Preview */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Description (Markdown)</label>
              <p className="intro-text" style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#aaa' }}>
                Edit Markdown on the left and see live preview on the right. Supports bold (**text**), italics (*text*), lists, tables, code blocks (```code```), etc.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="form-textarea"
                  placeholder={`# Project Description\n\n**Overview:** Describe the project.\n\n- List item 1\n- List item 2\n\n\`\`\`code\nSample code\n\`\`\``}
                  style={{ minHeight: '400px', fontFamily: 'monospace', resize: 'vertical', padding: '1rem', borderRadius: '8px' }}
                />
                <div className="markdown-preview" style={{
                  padding: '1rem',
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  minHeight: '400px',
                  overflowY: 'auto',
                  color: '#fff',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.description || '*No description provided yet.*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>File Name (Auto-filled)</label>
                <input
                  name="fileName"
                  value={formData.fileName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Auto-filled after upload"
                  readOnly={uploading}
                />
              </div>
              <div className="form-group">
                <label>Key Prefix (Auto-filled)</label>
                <input
                  name="keyPrefix"
                  value={formData.keyPrefix}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Auto-filled after upload"
                  readOnly={uploading}
                />
              </div>
            </div>

            {/* ZIP Upload + Base Project URL */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Base Project ZIP File</label>
              <p className="intro-text" style={{ fontSize: '0.85rem', margin: '0.5rem 0 1rem', color: '#aaa' }}>
                Drag & drop a .zip file or click to select. URL, File Name, and Key Prefix will be auto-filled.
              </p>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? '#4ade80' : '#555'}`,
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  background: dragActive ? '#1a2a1a' : '#222',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {uploading ? (
                  <div style={{ color: '#4ade80' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p>Uploading...</p>
                  </div>
                ) : uploadSuccess ? (
                  <div style={{ color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <FiCheckCircle size={20} />
                    <p>Upload successful!</p>
                  </div>
                ) : (
                  <>
                    <FiUpload size={32} style={{ marginBottom: '1rem', color: '#4ade80' }} />
                    <p style={{ margin: '0.5rem 0', color: '#ccc' }}>
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
                      .zip files only
                    </p>
                  </>
                )}
              </div>

              {/* Base Project URL Input */}
              <div style={{ marginTop: '1rem' }}>
                <label>Base Project URL (Auto-filled after upload)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="baseProjectUrl"
                    value={formData.baseProjectUrl}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://..."
                    readOnly={uploading}
                  />
                  {formData.baseProjectUrl && (
                    <a
                      href={formData.baseProjectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#4ade80',
                        fontSize: '0.9rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Open
                    </a>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-success" disabled={loading || uploading}>
                {loading ? 'Creating...' : 'Create Project'}
              </button>
              <button type="button" onClick={() => navigate('/manage-project-bank')} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateMockProject;