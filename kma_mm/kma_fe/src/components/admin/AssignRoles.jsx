// import React, { useState } from 'react';
// import { Button, TextField, Grid, Typography, MenuItem } from '@mui/material';

// const AssignRoles = () => {
//     const [username, setUsername] = useState('');
//     const [role, setRole] = useState('');

//     const roleMapping = {
//         1: "training",
//         2: "examination",
//         3: "student_manage",
//         4: "library",
//         5: "director",
//         6: "sv",
//         7: "admin",
//     };

//     const handleAssignRole = () => {
//         console.log(`Assigning role ${role} to user ${username}`);
//         alert(`Role ${role} assigned to ${username}`);
//     };

//     return (
//         <div>
//             <Typography variant="h5" gutterBottom>Assign Roles</Typography>
//             <Grid container spacing={3}>
//                 <Grid item xs={12} sm={6}>
//                     <TextField
//                         label="Username"
//                         variant="outlined"
//                         fullWidth
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                     />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <TextField
//                         select
//                         label="Role"
//                         variant="outlined"
//                         fullWidth
//                         value={role}
//                         onChange={(e) => setRole(parseInt(e.target.value))} // Nếu muốn giữ role dạng số
//                     >
//                         {Object.entries(roleMapping).map(([key, value]) => (
//                             <MenuItem key={key} value={parseInt(key)}>
//                                 {value}
//                             </MenuItem>
//                         ))}
//                     </TextField>
//                 </Grid>
//                 <Grid item xs={12}>
//                     <Button variant="contained" color="primary" onClick={handleAssignRole}>
//                         Assign Role
//                     </Button>
//                 </Grid>
//             </Grid>
//         </div>
//     );
// };

// export default AssignRoles;





import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Typography, MenuItem, Autocomplete, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon quay lại
import axios from 'axios';
import { asignRole, getAllUser } from '../../Api_controller/Service/adminService';
import { useNavigate } from 'react-router-dom';
const AssignRoles = () => {
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState('');
    const [users, setUsers] = useState([]);
    const navigate = useNavigate(); // Hook điều hướng
    const roleMapping = {
        1: "training",
        2: "examination",
        3: "student_manage",
        4: "library",
        5: "director",
        6: "sv",
        7: "admin",
    };

    // Fetch all users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUser()
                const userData = response.data?.data || [];
                setUsers(userData); // Giả sử API trả về danh sách user dưới dạng mảng
                console.log(users)
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleAssignRole = async () => {
        if (!userId || !role) {
            alert('Please select a user and role');
            return;
        }
        try {
            const response = await asignRole(userId, role);
            alert(`Role ${roleMapping[role]} assigned to user ${username}`);
        } catch (error) {
            console.error('Error assigning role:', error);
            alert('Failed to assign role');
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
                Phân quyền
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={users} // Đảm bảo users là danh sách không trùng lặp
                        getOptionLabel={(option) => option.username || ''}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setUsername(newValue.username); // Lấy username
                                setUserId(newValue.id);        // Lấy user ID từ dữ liệu
                            } else {
                                setUsername('');
                                setUserId(null);
                            }
                        }}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}> {/* Đảm bảo key là option.id */}
                                {option.username}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label="Username" variant="outlined" fullWidth />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        label="Role"
                        variant="outlined"
                        fullWidth
                        value={role}
                        onChange={(e) => setRole(parseInt(e.target.value))}
                    >
                        {Object.entries(roleMapping).map(([key, value]) => (
                            <MenuItem key={key} value={parseInt(key)}>
                                {value}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleAssignRole}>
                        Gán quyền
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default AssignRoles;
