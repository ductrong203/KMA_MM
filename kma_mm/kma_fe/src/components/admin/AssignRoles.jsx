import React, { useState } from 'react';
import { Button, TextField, Grid, Typography } from '@mui/material';

const AssignRoles = () => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    const handleAssignRole = () => {
        // Mock dữ liệu
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
                        label="Role"
                        variant="outlined"
                        fullWidth
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
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
