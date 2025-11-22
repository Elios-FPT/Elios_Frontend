// file: elios_FE/src/user/pages/UserProfile.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/UserProfile.css';
import LoadingCircle1 from '../../components/loading/LoadingCircle1';


const UserPorfile = () => {
  const [profile, setProfile] = useState();
  const [loading, setLoading] = useState(true); // Set to true to show loading screen initially

  // Placeholder for date formatting
  const formatBirthDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    // Format date string to "January 30, 1998"
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_USER_PROFILE, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        setProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfile(null); // Clear profile on error
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);



  if (loading) {
    return (
      <div id="user-profile-loading">
        <LoadingCircle1 />
      </div>
    );
  }

  if (!profile) {
    return <div id="user-profile-error">Could not load user profile.</div>;
  }

    return (
        <div id="user-profile-bg">
            <div id="user-profile-container">
                <div id="user-profile-card">
                    
                    {/* Header: Avatar and Name */}
                    <div id="user-profile-header">
                        <img 
                            id="user-profile-avatar"
                            src={profile.avatarUrl} 
                            alt={`${profile.firstName}'s Avatar`}
                            // Fallback image in case the URL fails
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src="https://placehold.co/100x100/333333/ffffff?text=U";
                            }}
                        />
                        <h1 id="user-profile-name">{`${profile.firstName} ${profile.lastName}`}</h1>
                        <p id="user-profile-role">{profile.role}</p>
                    </div>

                    {/* Details Section */}
                    <div id="user-profile-details">
                        <h2 id="user-profile-details-title">User Information</h2>
                        
                        <div className="profile-detail-item">
                            <span className="detail-label">User ID:</span>
                            <span className="detail-value">{profile.id}</span>
                        </div>
                        
                        <div className="profile-detail-item">
                            <span className="detail-label">Gender:</span>
                            <span className="detail-value">{profile.gender}</span>
                        </div>

                        <div className="profile-detail-item">
                            <span className="detail-label">Date of Birth:</span>
                            <span className="detail-value">{formatBirthDate(profile.dateOfBirth)}</span>
                        </div>

                        <div className="profile-detail-item">
                            <span className="detail-label">Avatar File:</span>
                            <span className="detail-value">{profile.avatarFileName}</span>
                        </div>
                        
                    </div>
                    
                    {/* Action Button */}
                    <button id="user-profile-action-btn" onClick={() => console.log("Edit Profile clicked")}>
                        Edit Profile
                    </button>

                </div>
            </div>
        </div>
    );
}


export default UserPorfile;