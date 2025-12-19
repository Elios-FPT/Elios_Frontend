// file: elios_FE/src/forumModerator/components/ContentModeratorSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/ContentModeratorSidebar.css'; 

const ContentModeratorSidebar = () => {
    return (
        <nav id="moderator-sidebar-nav">
            <div id="sidebar-header">
                <h2>Kiểm Duyệt Nội Dung</h2> 
            </div>
            <ul id="sidebar-menu-list">
                <li>
                    <NavLink to="/content-moderator/dashboard" end>
                        Bảng Điều Khiển
                    </NavLink>
                </li>
                
                {/* NEW LINK ADDED HERE */}
                <li>
                    <NavLink to="/content-moderator/monitor-posts">
                        Quản Lý Bài Viết
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/content-moderator/pending">
                        Bài Viết Chờ Duyệt
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/content-moderator/reported">
                        Nội Dung Bị Báo Cáo
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/content-moderator/manage-categories">
                        Quản Lý Danh Mục
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/content-moderator/banned-users">
                        Người Dùng Bị Cấm
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default ContentModeratorSidebar;