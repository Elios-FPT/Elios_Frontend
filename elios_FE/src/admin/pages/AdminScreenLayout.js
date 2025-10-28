// src/admin/layouts/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AddminSidebar';
import '../styles/AdminScreenLayout.css';

const AdminLayout = () => {
    return (
        <div id="admin-layout-container">
            <AdminSidebar />
            <main id="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;