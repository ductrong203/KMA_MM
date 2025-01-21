import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';

const DeleteAccount = () => {
    const [username, setUsername] = useState('');

    const handleDelete = () => {
        // Mock dữ liệu
        console.log(`Deleting account ${username}`);
        alert(`Account ${username} deleted successfully!`);
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>Delete Account</Typography>
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <Button variant="contained" color="secondary" onClick={handleDelete} style={{ marginTop: '20px' }}>
                Delete Account
            </Button>
        </div>
    );
};

export default DeleteAccount;
