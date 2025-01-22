import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ role, allowedRoles, children }) => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken || !allowedRoles.includes(role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;

