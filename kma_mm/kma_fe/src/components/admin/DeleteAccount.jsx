import React, { useState } from 'react';
import { Button, TextField, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleDelete = () => {
        // Mock dữ liệu
        console.log(`Xóa tài khoản ${username}`);
        alert(`Tài khoản ${username} đã được xóa thành công!`);
    };

    const handleBackToDashboard = () => {
        navigate('/admin/dashboard');
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                <IconButton
                    color="primary"
                    onClick={handleBackToDashboard}
                    sx={{ mr: 1, mb: 1 }}
                >
                    <ArrowBackIcon />
                </IconButton>
                Xóa tài khoản
            </Typography>
            <TextField
                label="Tên đăng nhập"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <Button variant="contained" color="secondary" onClick={handleDelete} style={{ marginTop: '20px' }}>
                Xóa tài khoản
            </Button>
        </div>
    );
};

export default DeleteAccount;
