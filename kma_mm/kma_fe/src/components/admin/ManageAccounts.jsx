import React from 'react';
import { Table, TableBody, Typography, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

const mockData = [
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'user1', role: 'user' },
    { id: 3, username: 'user2', role: 'user' },
];

const ManageAccounts = () => {
    return (
        <div>
            <Typography variant="h5" gutterBottom>Manage Accounts</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockData.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell>{account.username}</TableCell>
                                <TableCell>{account.role}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" color="primary" onClick={() => alert(`Edit ${account.username}`)}>Edit</Button>
                                    <Button variant="outlined" color="secondary" onClick={() => alert(`Delete ${account.username}`)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ManageAccounts;
