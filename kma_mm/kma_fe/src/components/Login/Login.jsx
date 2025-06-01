import React, { useState } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
} from "@mui/material";
import axios from "axios"; // Import Axios để gọi API
import { login, register } from "../../Api_controller/Service/authService";
import { toast } from "react-toastify";
const Login = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true); // Quản lý chế độ
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); // Lưu thông báo lỗi

   const handleLogin = async () => {
        if (!username || !password) {
            toast.error("Vui lòng nhập username và password!");
            return;
        }

        try {
            const role = await login(username, password); // Gọi hàm login từ authService
            toast.success("Login successful!");
            // Cập nhật trạng thái đăng nhập sau khi đăng nhập thành công
            onLogin(role);
        } catch (error) {
            toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại!");
        }
    };

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            toast.error("Please fill all fields.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            const message = await register(username, password, confirmPassword); // Gọi hàm register từ authService
            toast.success(message); // Hiển thị thông báo đăng ký thành công
            setIsLoginMode(true); // Chuyển sang chế độ đăng nhập
        } catch (error) {
            toast.error(error.message || "Failed to register. Please try again.");
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission or other default behavior
            isLoginMode ? handleLogin() : handleRegister();
        }
    };
    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "95vh",
                background:
                    "linear-gradient(135deg, rgba(58,123,213,1) 0%, rgba(58,213,158,1) 100%)",
                borderRadius: 2,
                padding: 4,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                    width: "100%",
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color: "primary.main",
                        mb: 3,
                        textTransform: "uppercase",
                    }}
                >
                    {isLoginMode ? "ĐĂNG NHẬP" : "Tạo Tài Khoản"}
                </Typography>

                {errorMessage && (
                    <Typography
                        variant="body2"
                        color="error"
                        sx={{ mb: 2, textAlign: "center" }}
                    >
                        {errorMessage}
                    </Typography>
                )}

                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        "& .MuiTextField-root": { mb: 2 },
                    }}
                    noValidate
                    onKeyDown={handleKeyDown}
                >
                    <TextField
                        label="Tên đăng nhập"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Mật khẩu"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {!isLoginMode && (
                        <TextField
                            label="Xác nhận mật khẩu"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    )}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={isLoginMode ? handleLogin : handleRegister}
                        sx={{
                            mt: 2,
                            py: 1.5,
                            background: "linear-gradient(45deg, #2196F3, #21CBF3)",
                            fontWeight: "bold",
                            "&:hover": {
                                background: "linear-gradient(45deg, #1976D2, #2196F3)",
                            },
                        }}
                    >
                        {isLoginMode ? "Đăng nhập" : "Đăng ký"}
                    </Button>
                    {/* <Button
                        fullWidth
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        sx={{
                            mt: 1,
                            py: 1.5,
                            color: "primary.main",
                            textTransform: "none",
                        }}
                    >
                        {isLoginMode
                            ? "Don't have an account? Register"
                            : "Already have an account? Login"}
                    </Button> */}
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
