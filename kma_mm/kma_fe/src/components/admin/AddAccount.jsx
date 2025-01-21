import React, { useState } from 'react';
import { Button, TextField, Grid, Typography, MenuItem } from '@mui/material';
import { AdminRegister } from '../../Api_controller/Service/authService';

const AddAccount = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(6); // Default to 'sv'

    const roleMapping = {
        1: "training",
        2: "examination",
        3: "student_manage",
        4: "library",
        5: "director",
        6: "sv",
        7: "admin",
    };

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const res = await AdminRegister(username, password, confirmPassword, role); // Truyền từng tham số
            console.log('Adding new account:', { username, password, confirmPassword, role });
            alert(res); // Hiển thị thông báo từ server
        } catch (error) {
            alert(error.message); // Hiển thị lỗi từ hàm AdminRegister
        }
    };


    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Add New Account
            </Typography>
            <Grid container spacing={3}>
                {/* Username */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Grid>

                {/* Password */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Password"
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
                        label="Confirm Password"
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
                        label="Role"
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
                        Add Account
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default AddAccount;
