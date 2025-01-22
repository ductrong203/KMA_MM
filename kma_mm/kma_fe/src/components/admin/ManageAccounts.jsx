import React, { useEffect, useState } from 'react';
import { Table, TableBody, Typography, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Pagination, TextField } from '@mui/material';
import { getAllUser } from '../../Api_controller/Service/adminService';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon quay lại
const ManageAccounts = () => {
    const [users, setUsers] = useState([]); // Danh sách user
    const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách user sau khi lọc
    const [loading, setLoading] = useState(true); // Trạng thái loading
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
    const rowsPerPage = 5; // Số hàng mỗi trang
    const navigate = useNavigate(); // Hook điều hướng

    // Bảng ánh xạ role từ API sang tên vai trò
    const roleMapping = {
        1: "training",
        2: "examination",
        3: "student_manage",
        4: "library",
        5: "director",
        6: "sv",
        7: "admin",
    };


    const handleBackToDashboard = () => {
        navigate('/admin/dashboard'); // Điều hướng về trang Admin Dashboard
    };


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUser();
                if (response.status === 200) {
                    setUsers(response.data.data);
                    setFilteredUsers(response.data.data); // Gán danh sách ban đầu cho danh sách lọc
                } else {
                    console.error('Failed to fetch users:', response.message);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        // Lọc danh sách user theo từ khóa
        const filtered = users.filter((user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
        setCurrentPage(1); // Đưa về trang đầu khi tìm kiếm
    }, [searchTerm, users]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    // Tính toán dữ liệu hiển thị dựa trên trang hiện tại
    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (event, value) => {
        setCurrentPage(value); // Cập nhật trang hiện tại
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value); // Cập nhật từ khóa tìm kiếm
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
                Manage Account
            </Typography>

            {/* Thanh tìm kiếm */}
            <TextField
                label="Search by Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={handleSearchChange}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow className='bg-blue-100 text-white'>
                            <TableCell>Username</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentUsers.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell>{account.username}</TableCell>
                                <TableCell>{roleMapping[account.role]}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => alert(`Edit ${account.username}`)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => alert(`Delete ${account.username}`)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Phân trang */}
            <Pagination
                count={Math.ceil(filteredUsers.length / rowsPerPage)} // Tổng số trang sau khi lọc
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </div>
    );
};

export default ManageAccounts;
