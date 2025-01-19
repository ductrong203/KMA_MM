// src/setPermiss/Unauthorized.jsx
import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Không có quyền truy cập</h1>
            <Link to="/login">Quay lại đăng nhập</Link>
        </div>
    );
};

export default Unauthorized;
