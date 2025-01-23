import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    Modal,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { changeUserPassWord, getDetailUserById } from "../../Api_controller/Service/authService";


const UserInfo = () => {
    const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
    const [userInfo, setUserInfo] = useState({
        id: "",
        name: "",
        username: "",
        role: "",
        createdAt: "",
        updatedAt: "",
    });
    const [editedInfo, setEditedInfo] = useState({});
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Trạng thái mở modal đổi mật khẩu
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    // Map role to readable string
    const roleMapping = {
        1: "Training",
        2: "Examination",
        3: "Student Management",
        4: "Library",
        5: "Director",
        6: "Student",
        7: "Admin",
    };

    // Lấy thông tin cá nhân từ API
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const id = localStorage.getItem("id");
                if (id) {
                    const response = await getDetailUserById(id); // Gọi API
                    setUserInfo(response.data);
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };
        fetchUserInfo();
    }, []);

    // Toggle chế độ chỉnh sửa
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setEditedInfo(userInfo); // Sao chép dữ liệu hiện tại
    };

    // Xử lý thay đổi thông tin
    const handleChange = (field, value) => {
        setEditedInfo((prev) => ({ ...prev, [field]: value }));
    };

    // Lưu thông tin đã chỉnh sửa
    const handleSave = async () => {
        console.log("Thông tin cập nhật:", editedInfo);
    };

    // Xử lý thay đổi mật khẩu
    const handlePasswordChange = (field, value) => {
        setPasswords((prev) => ({ ...prev, [field]: value }));
    };

    const handleSavePassword = async () => {
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            alert("Mật khẩu mới và Nhập lại mật khẩu mới không khớp!");
            return;
        }

        try {
            const id = localStorage.getItem("id"); // Lấy ID từ localStorage
            if (!id) {
                alert("Không tìm thấy thông tin người dùng!");
                return;
            }

            const data = {
                oldPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmNewPassword: passwords.confirmNewPassword,
            };

            const response = await changeUserPassWord(id, data);

            if (response.status === 200) {
                alert("Đổi mật khẩu thành công!");
                setIsPasswordModalOpen(false); // Đóng modal
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                }); // Reset dữ liệu
            } else {
                alert("Đổi mật khẩu không thành công. Vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Đã xảy ra lỗi khi đổi mật khẩu!");
        }
    };



    return (
        <Box
            sx={{
                maxWidth: "600px",
                margin: "20px auto",
                padding: "20px",
                boxShadow: 3,
                borderRadius: 2,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}>
                <Avatar sx={{ bgcolor: "#1976d2", width: 60, height: 60 }}>
                    <PersonIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                    Thông tin cá nhân
                </Typography>
                <IconButton onClick={handleEditToggle}>
                    {isEditing ? <SaveIcon color="success" /> : <EditIcon />}
                </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Tên đầy đủ */}



                <Typography variant="subtitle1" fontWeight="bold">
                    Họ và tên
                </Typography>
                {isEditing ? (
                    <TextField
                        value={editedInfo.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                ) : (
                    <Typography>{userInfo.name}</Typography>
                )}



                {/* Tên đăng nhập */}
                <Typography variant="subtitle1" fontWeight="bold">
                    Tên đăng nhập
                </Typography>
                {isEditing ? (
                    <TextField
                        value={editedInfo.username}
                        onChange={(e) => handleChange("username", e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                ) : (
                    <Typography>{userInfo.username}</Typography>
                )}

                {/* Quyền hạn */}
                <Typography variant="subtitle1" fontWeight="bold">
                    Quyền hạn
                </Typography>
                <Typography>{roleMapping[userInfo.role]}</Typography>

                {/* Ngày tạo */}
                <Typography variant="subtitle1" fontWeight="bold">
                    Ngày tạo
                </Typography>
                <Typography>{new Date(userInfo.createdAt).toLocaleDateString()}</Typography>

                {/* Ngày cập nhật */}
                <Typography variant="subtitle1" fontWeight="bold">
                    Ngày cập nhật
                </Typography>
                <Typography>{new Date(userInfo.updatedAt).toLocaleDateString()}</Typography>
            </Box>

            {/* Nút lưu thông tin */}
            {isEditing && (
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 3, alignSelf: "flex-end" }}
                    onClick={handleSave}
                >
                    Lưu thay đổi
                </Button>
            )}

            {/* Nút đổi mật khẩu */}
            <Button
                variant="outlined"
                color="secondary"
                sx={{ marginTop: 3 }}
                startIcon={<LockIcon />}
                onClick={() => setIsPasswordModalOpen(true)}
            >
                Đổi mật khẩu
            </Button>

            {/* Modal đổi mật khẩu */}
            <Modal
                open={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                aria-labelledby="modal-password-title"
                aria-describedby="modal-password-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography id="modal-password-title" variant="h6" fontWeight="bold">
                        Đổi mật khẩu
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
                        <TextField
                            label="Mật khẩu hiện tại"
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        />
                        <TextField
                            label="Mật khẩu mới"
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        />
                        <TextField
                            label="Nhập lại mật khẩu mới"
                            type="password"
                            value={passwords.confirmNewPassword}
                            onChange={(e) =>
                                handlePasswordChange("confirmNewPassword", e.target.value)
                            }
                        />
                        <Button variant="contained" color="primary" onClick={handleSavePassword}>
                            Lưu mật khẩu
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default UserInfo;
