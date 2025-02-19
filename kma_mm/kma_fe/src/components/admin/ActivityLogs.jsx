import React from 'react';
import { List, ListItem, ListItemText, Typography, IconButton, Paper, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon quay lại
import { useNavigate } from 'react-router-dom';

const mockLogs = [
    { id: 1, log: 'User admin logged in' },
    { id: 2, log: 'User user1 updated their account' },
    { id: 3, log: 'User admin created a new account' },
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
                <Typography variant="h5">Activity Logs</Typography>
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
