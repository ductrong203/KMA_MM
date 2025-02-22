import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Typography } from '@mui/material';
import { updateUserById } from '../../Api_controller/Service/adminService';  // Giả sử bạn đã có API cho việc cập nhật người dùng

const EditUserModal = ({ user, open, onClose, onUserUpdated }) => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');

    useEffect(() => {
        if (user) {  // Kiểm tra nếu user tồn tại
            setUsername(user.username);
            setRole(user.role);
            setCreatedAt(user.createdAt);  // Hiển thị nhưng không cho phép chỉnh sửa
            setUpdatedAt(user.updatedAt);  // Hiển thị nhưng không cho phép chỉnh sửa
        }
    }, [user]);  // Chỉ chạy lại khi user thay đổi

    const handleSubmit = async () => {
        if (!user) return;  // Nếu user không tồn tại, không làm gì cả

        try {
            const updatedData = {
                username,
                role: parseInt(role),  // Chuyển đổi role sang kiểu số nếu cần
                createdAt,  // Giữ nguyên ngày tạo
                updatedAt,  // Giữ nguyên ngày cập nhật
            };

            const response = await updateUserById(user.id, updatedData);  // Gửi PUT request để cập nhật người dùng
            if (response.status === "OK") {
                alert('User updated successfully!');
                onUserUpdated(response.data);  // Cập nhật danh sách người dùng sau khi chỉnh sửa
                onClose();  // Đóng modal
            } else {
                alert('Failed to update user.');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('An error occurred while updating the user.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Edit User</DialogTitle>
            <DialogContent sx={{ padding: 3 }}>
                <Typography variant="body2" sx={{ marginBottom: 2 }}>Please update the user details below:</Typography>
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 3 }}
                    inputProps={{ style: { padding: '12px 14px' } }}
                />
                <TextField
                    label="Role"
                    variant="outlined"
                    fullWidth
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    select
                    sx={{ mb: 3 }}
                    inputProps={{ style: { padding: '12px 14px' } }}
                >
                    <MenuItem value="1">Training</MenuItem>
                    <MenuItem value="2">Examination</MenuItem>
                    <MenuItem value="3">Student Manage</MenuItem>
                    <MenuItem value="4">Library</MenuItem>
                    <MenuItem value="5">Director</MenuItem>
                    <MenuItem value="6">SV</MenuItem>
                    <MenuItem value="7">Admin</MenuItem>
                </TextField>
                <TextField
                    label="Created At"
                    variant="outlined"
                    fullWidth
                    value={createdAt}
                    disabled  // Không cho phép chỉnh sửa
                    sx={{ mb: 3 }}
                    inputProps={{ style: { padding: '12px 14px' } }}
                />
                <TextField
                    label="Updated At"
                    variant="outlined"
                    fullWidth
                    value={updatedAt}
                    disabled  // Không cho phép chỉnh sửa
                    sx={{ mb: 3 }}
                    inputProps={{ style: { padding: '12px 14px' } }}
                />
            </DialogContent>
            <DialogActions sx={{ padding: '16px 24px' }}>
                <Button onClick={onClose} color="secondary" sx={{ fontWeight: 'bold' }}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary" sx={{ fontWeight: 'bold', '&:hover': { backgroundColor: '#3b82f6' } }}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditUserModal;
