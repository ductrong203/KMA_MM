import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ role, allowedRoles, children }) => {
    if (!allowedRoles.includes(role)) {
        // Nếu vai trò không được phép, chuyển hướng về trang login
        return <Navigate to="/" />;
    }
    // Nếu vai trò hợp lệ, render component con
    return children;
};

export default PrivateRoute;
