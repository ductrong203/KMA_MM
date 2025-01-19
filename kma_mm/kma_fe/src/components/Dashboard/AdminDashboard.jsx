import React from "react";
import { Link } from "react-router-dom";
const AdminDashboard = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin!</p>
            <Link to="/admin/manage">Click here to manage</Link>
        </div>
    );
};

export default AdminDashboard;
