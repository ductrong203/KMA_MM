import React, { useState } from 'react';
import { Button, TextField, Grid, Typography } from '@mui/material';
import Layout from '../../layout/Layout';
const AddAccount = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const handleSubmit = () => {
        // Mock dữ liệu
        console.log('Adding new account:', { username, password, role });
        alert(`Account ${username} added successfully!`);
    };


    const trainerInfo = {
        name: "Nguyễn Văn A",
        id: "T1001"
    };

    return (
        <div>



            <Typography variant="h5" gutterBottom>Add New Account</Typography>
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
                        label="Password"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Role"
                        variant="outlined"
                        fullWidth
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                </Grid>
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
