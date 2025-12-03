// src/admin/components/AdminSidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/AdminSidebar.css';

const AdminSidebar = () => {
    // State to manage the collapsible section, default to open
    const [isForumOpen, setIsForumOpen] = useState(false);

    return (
        <nav id="admin-sidebar-nav">
            <div id="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <ul id="sidebar-menu-list">
                {/* Dashboard Link */}
                <li>
                    <NavLink to="/admin" end>
                        Dashboard
                    </NavLink>
                </li>

                {/* Forum Manager Collapsible Section */}
                <li>
                    <button
                        id="forum-manager-toggle"
                        onClick={() => setIsForumOpen(!isForumOpen)}
                    >
                        <span>Forum Manager</span>
                        <span>{isForumOpen ? '▲' : '▼'}</span>
                    </button>
                    {isForumOpen && (
                        <ul id="forum-submenu" className="submenu">
                            <li>
                                <NavLink to="/admin/forum/manage-categories">
                                    Manage Categories
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/forum/pending">
                                    Pending Posts
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/forum/reported">
                                    Reported Posts
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/forum/banned-users">
                                    Banned Users
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Future sections can be added here following the same pattern */}
                {/* <li>
                    <button id="user-manager-toggle" onClick={...}>
                        <span>User Manager</span>
                        <span>{isUsersOpen ? '▲' : '▼'}</span>
                    </button>
                    ...
                </li>
                */}
            </ul>
        </nav>
    );
};

export default AdminSidebar;