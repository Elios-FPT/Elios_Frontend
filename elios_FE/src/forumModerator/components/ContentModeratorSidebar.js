// file: elios_FE/src/forumModerator/components/ContentModeratorSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/ContentModeratorSidebar.css'; 

const ContentModeratorSidebar = () => {
    return (
        <nav id="moderator-sidebar-nav">
            <div id="sidebar-header">
                <h2>Kiểm Duyệt Nội Dung</h2> {/* Translated: Content Moderator */}
            </div>
            <ul id="sidebar-menu-list">
                <li>
                    {/* Updated to match App.js route */}
                    <NavLink to="/content-moderator/dashboard" end>
                        Bảng Điều Khiển {/* Translated: Dashboard */}
                    </NavLink>
                </li>
                
                <li>
                    <NavLink to="/content-moderator/pending">
                        Bài Viết Chờ Duyệt {/* Translated: Pending Posts */}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/content-moderator/reported">
                        Nội Dung Bị Báo Cáo {/* Translated: Reported Content */}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/content-moderator/manage-categories">
                        Quản Lý Danh Mục {/* Translated: Manage Categories */}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/content-moderator/banned-users">
                        Người Dùng Bị Cấm {/* Translated: Banned Users */}
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default ContentModeratorSidebar;