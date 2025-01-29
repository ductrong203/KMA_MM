import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ role, allowedRoles, children }) => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken || !allowedRoles.includes(role)) {
        localStorage.removeItem("role");
        // Redirect về trang login
        window.location.href = "/login";
        return null;
    }

    return children;
};

export default PrivateRoute;

