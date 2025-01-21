import React, { useState } from 'react';
import { Button, TextField, Grid, Typography, MenuItem } from '@mui/material';

const AssignRoles = () => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    const roleMapping = {
        1: "training",
        2: "examination",
        3: "student_manage",
        4: "library",
        5: "director",
        6: "sv",
        7: "admin",
    };

    const handleAssignRole = () => {
        console.log(`Assigning role ${role} to user ${username}`);
        alert(`Role ${role} assigned to ${username}`);
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>Assign Roles</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        label="Role"
                        variant="outlined"
                        fullWidth
                        value={role}
                        onChange={(e) => setRole(parseInt(e.target.value))} // Nếu muốn giữ role dạng số
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
                        Assign Role
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default AssignRoles;
