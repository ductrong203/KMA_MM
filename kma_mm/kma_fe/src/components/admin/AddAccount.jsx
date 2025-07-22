import React, { useState } from 'react';
import { Button, TextField, Grid, Typography, MenuItem, IconButton } from '@mui/material';
import { AdminRegister } from '../../Api_controller/Service/authService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon quay lại
import { useNavigate } from 'react-router-dom';

const AddAccount = () => {
    const navigate = useNavigate(); // Hook điều hướng
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [ho_ten, setHoten] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(6); // Default to 'sv'

    const roleMapping = {
        1: "đào tạo",
        2: "khảo thí",
        3: "quản lý sinh viên",
        4: "thư viện",
        5: "giám đốc",
        6: "sinh viên",
        7: "admin",
    };

    const handleSubmit = async () => {
        console.log(password, confirmPassword, ho_ten)
        if (password !== confirmPassword) {
            alert('Mật khẩu không khớp!');
            return;
        }

        try {
            const res = await AdminRegister(username, ho_ten, password, confirmPassword, role); // Truyền từng tham số
            console.log('Adding new account:', { username, password, confirmPassword, role });
            alert(res); // Hiển thị thông báo từ server
        } catch (error) {
            alert(error.message); // Hiển thị lỗi từ hàm AdminRegister
        }
    };

    const handleBackToDashboard = () => {
        navigate('/admin/dashboard'); // Điều hướng về trang Admin Dashboard
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                <IconButton
                    color="primary"
                    onClick={handleBackToDashboard}
                    sx={{ mr: 1, mb: 1 }} // Khoảng cách giữa icon và tiêu đề
                >
                    <ArrowBackIcon />
                </IconButton>
                Thêm tài khoản
            </Typography>
            <Grid container spacing={3}>
                {/* Username */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Tên đăng nhập"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Grid>

                {/* Username */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Họ tên"
                        variant="outlined"
                        fullWidth
                        value={ho_ten}
                        onChange={(e) => setHoten(e.target.value)}
                    />
                </Grid>
                {/* Password */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Mật khẩu"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Xác nhận mật khẩu"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Grid>

                {/* Role */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        label="Vai trò"
                        variant="outlined"
                        fullWidth
                        value={role}
                        onChange={(e) => setRole(parseInt(e.target.value))}
                    >
                        {Object.entries(roleMapping).map(([key, value]) => (
                            <MenuItem key={key} value={key}>
                                {value}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Thêm tài khoản
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default AddAccount;
