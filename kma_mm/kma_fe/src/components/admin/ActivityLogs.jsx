import React from 'react';
import { List, ListItem, ListItemText, Typography, IconButton, Paper, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon quay lại
import { useNavigate } from 'react-router-dom';

const mockLogs = [
    { id: 1, log: 'Người dùng admin đã đăng nhập' },
    { id: 2, log: 'Người dùng user1 đã cập nhật tài khoản của họ' },
    { id: 3, log: 'Người dùng admin đã tạo tài khoản mới' },
];

const ActivityLogs = () => {
    const navigate = useNavigate(); // Hook điều hướng

    const handleBackToDashboard = () => {
        navigate('/admin/dashboard'); // Điều hướng đến trang AdminDashboard
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* Icon Button back to Dashboard */}
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton
                    color="primary"
                    onClick={handleBackToDashboard}
                    sx={{ mr: 2 }} // Khoảng cách giữa icon và tiêu đề
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5">Lịch sử hoạt động</Typography>
            </Box>

            {/* Danh sách hoạt động */}
            <Paper sx={{ padding: 2 }}>
                <List>
                    {mockLogs.map((log) => (
                        <ListItem key={log.id}>
                            <ListItemText primary={log.log} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default ActivityLogs;
