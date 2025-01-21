import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import Layout from '../../layout/Layout';

const mockLogs = [
    { id: 1, log: 'User admin logged in' },
    { id: 2, log: 'User user1 updated their account' },
    { id: 3, log: 'User admin created a new account' },
];

const ActivityLogs = () => {

    const trainerInfo = {
        name: "Nguyễn Văn A",
        id: "T1001"
    };

    return (
        <div>

            <Typography variant="h5" gutterBottom>Activity Logs</Typography>
            <List>
                {mockLogs.map((log) => (
                    <ListItem key={log.id}>
                        <ListItemText primary={log.log} />
                    </ListItem>
                ))}
            </List>

        </div>
    );
};

export default ActivityLogs;
