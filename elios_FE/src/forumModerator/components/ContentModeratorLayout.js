// file: elios_FE/src/forumModerator/components/ContentModeratorLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import ContentModeratorSidebar from '../components/ContentModeratorSidebar';
import '../styles/ContentModeratorLayout.css'; // Reuse layout styles

const ContentModeratorLayout = () => {
    return (
        <div id="admin-layout-container">
            <ContentModeratorSidebar />
            <main id="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default ContentModeratorLayout;