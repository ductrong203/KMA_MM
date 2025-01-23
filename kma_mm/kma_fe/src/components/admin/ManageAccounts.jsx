import React, { useEffect, useState } from 'react';
import { Table, TableBody, Typography, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Pagination, TextField, MenuItem, Box } from '@mui/material';
import { getAllUser } from '../../Api_controller/Service/adminService';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ManageAccounts = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const rowsPerPage = 5;
    const navigate = useNavigate();

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
        navigate('/admin/dashboard');
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUser();
                if (response.status === 200) {
                    setUsers(response.data.data);
                    setFilteredUsers(response.data.data);
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
        // Lọc danh sách dựa trên username và role
        const filtered = users.filter((user) => {
            const matchesUsername = user.username.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole ? user.role === parseInt(selectedRole) : true;
            return matchesUsername && matchesRole;
        });
        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedRole, users]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
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
                Manage Account
            </Typography>
            <Box display="flex" gap={2} alignItems="center" marginBottom={2}>
                {/* Thanh tìm kiếm */}
                <TextField
                    label="Search by Username"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 2 }} // Chiếm 2 phần tỉ lệ
                />
                {/* Bộ lọc Role */}
                <TextField
                    select
                    label="Filter by Role"
                    variant="outlined"
                    fullWidth
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    sx={{ flex: 1 }} // Chiếm 1 phần tỉ lệ
                >
                    <MenuItem value="">All Roles</MenuItem>
                    {Object.entries(roleMapping).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>



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
                count={Math.ceil(filteredUsers.length / rowsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </div>
    );
};

export default ManageAccounts;
