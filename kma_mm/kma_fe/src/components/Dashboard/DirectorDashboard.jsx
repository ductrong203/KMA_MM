import React, { useState } from 'react';
import { Box, Avatar, Typography, Divider, Button, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SettingsIcon from '@mui/icons-material/Settings';

// Đăng ký các thành phần Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DirectorInfoCard = () => {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [directorInfo, setDirectorInfo] = useState({
        name: 'Nguyễn Văn A',
        position: 'Giám đốc',
        department: 'Ban quản lý',
        directorId: 'D001',
        contact: 'director@example.com',
    });

    const handleEditDialogOpen = () => {
        setOpenEditDialog(true);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };

    const handleSaveChanges = () => {
        // Thực hiện lưu thông tin (thay đổi state hoặc gọi API)
        setOpenEditDialog(false);
    };

    // Dữ liệu biểu đồ
    const chartData = {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
        datasets: [
            {
                label: 'Doanh thu (triệu VNĐ)',
                data: [50, 75, 60, 80, 95, 70],
                backgroundColor: 'rgba(25, 118, 210, 0.7)',
                borderColor: 'rgba(25, 118, 210, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Thống kê doanh thu nửa năm',
            },
        },
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            {/* Phần thông tin bên trái */}
            <Card sx={{ flex: 1, height: '100%', borderRadius: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        {/* Avatar */}
                        <Avatar sx={{ width: 80, height: 80, bgcolor: '#1976d2' }}>
                            <Typography variant="h4">{directorInfo.name[0]}</Typography>
                        </Avatar>
                        {/* Name and Title */}
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {directorInfo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {directorInfo.position} - {directorInfo.department}
                        </Typography>
                        <Divider flexItem />
                        {/* Detailed Information */}
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" color="text.secondary">
                                Mã giám đốc: {directorInfo.directorId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Email liên hệ: {directorInfo.contact}
                            </Typography>
                        </Box>
                        {/* Settings Button */}
                        <IconButton
                            color="primary"
                            onClick={handleEditDialogOpen}
                            sx={{
                                bgcolor: '#e3f2fd',
                                borderRadius: '50%',
                                mt: 2,
                                ':hover': { bgcolor: '#bbdefb' },
                            }}
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Box>
                </CardContent>

                {/* Edit Dialog */}
                <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
                    <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Tên giám đốc"
                            fullWidth
                            margin="dense"
                            value={directorInfo.name}
                            onChange={(e) => setDirectorInfo({ ...directorInfo, name: e.target.value })}
                        />
                        <TextField
                            label="Vị trí"
                            fullWidth
                            margin="dense"
                            value={directorInfo.position}
                            onChange={(e) => setDirectorInfo({ ...directorInfo, position: e.target.value })}
                        />
                        <TextField
                            label="Phòng ban"
                            fullWidth
                            margin="dense"
                            value={directorInfo.department}
                            onChange={(e) => setDirectorInfo({ ...directorInfo, department: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            margin="dense"
                            value={directorInfo.contact}
                            onChange={(e) => setDirectorInfo({ ...directorInfo, contact: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditDialogClose} color="secondary">
                            Hủy
                        </Button>
                        <Button onClick={handleSaveChanges} variant="contained">
                            Lưu
                        </Button>
                    </DialogActions>
                </Dialog>
            </Card>

            {/* Phần biểu đồ bên phải */}
            <Card sx={{ flex: 2, height: '100%', borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Báo cáo doanh thu
                    </Typography>
                    <Bar data={chartData} options={chartOptions} />
                </CardContent>
            </Card>
        </Box>
    );
};

export default DirectorInfoCard;
