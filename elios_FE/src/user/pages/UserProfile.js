// file: elios_FE/src/user/pages/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import LoadingCircle1 from '../../components/loading/LoadingCircle1';
import { FiArrowLeft } from 'react-icons/fi';
import '../styles/UserProfile.css';
import UserNavbar from '../../components/navbars/UserNavbar';

// Import refactored components
import ProfileView from '../components/ProfileView';
import EditProfile from '../components/EditProfile';
import TransactionHistory from '../components/TransactionHistory';

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Load initial profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await axios.get(API_ENDPOINTS.GET_USER_PROFILE, { withCredentials: true });
        setProfile(data.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleProfileUpdate = (updatedFields) => {
    setProfile(prev => ({ ...prev, ...updatedFields }));
  };

  if (loading) return <div id="user-profile-loading"><LoadingCircle1 /></div>;

  if (!profile) {
    return (
      <div id="user-profile-error">
        <div className="error-card">
          <h2>Không thể tải hồ sơ</h2>
          <p>Vui lòng thử lại sau</p>
          <button className="btn-back" onClick={() => navigate('/')}>
            <FiArrowLeft /> Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <UserNavbar />
      <div id="user-profile-bg">
        <div id="user-profile-container">
          <div className="profile-header">
            {/* <button className="btn-back" onClick={() => navigate('/')}>
              <FiArrowLeft /> Quay lại
            </button> */}
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Hồ sơ
            </button>
            <button
              className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Chỉnh sửa
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Lịch sử giao dịch
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <ProfileView profile={profile} />
          )}

          {activeTab === 'edit' && (
            <EditProfile profile={profile} onProfileUpdate={handleProfileUpdate} />
          )}

          {activeTab === 'history' && (
            <TransactionHistory />
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;