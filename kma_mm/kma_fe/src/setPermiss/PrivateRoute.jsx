import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ role, allowedRoles, children }) => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken || !allowedRoles.includes(role)) {
        // Remove stored role and navigate via react-router to avoid full-page reloads
        localStorage.removeItem("role");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;

