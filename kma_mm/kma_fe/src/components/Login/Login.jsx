// src/components/Login.jsx
import React, { useState } from "react";

const Login = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true); // Quản lý chế độ
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const users = {
        sv123: { password: "123", role: "sinh_vien" },
        admin: { password: "1234", role: "admin" },
        khothi: { password: "4567", role: "kho_thi" },
        daotao: { password: "7890", role: "dao_tao" },
        quanly: { password: "1111", role: "quan_ly" },
    };

    const handleLogin = () => {
        if (users[username] && users[username].password === password) {
            onLogin(users[username].role);
        } else {
            setError("Sai tài khoản hoặc mật khẩu!");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Đăng nhập</h1>
            <input
                type="text"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button onClick={handleLogin}>Đăng nhập</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;
