import React from 'react';
import {
  Table,
  TableBody,
  Typography,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Pagination,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
// import { List, ListItem, ListItemText, Typography, IconButton, Paper, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon quay lại
import { useNavigate } from 'react-router-dom';

const mockLogs = [
    { id: 1,actor:"tien",role:"admin", log: 'User admin logged in' ,time:"2023/12/21"},
{ id: 2,actor:"tien",role:"admin", log: 'User user1 updated their account' ,time:"2023/12/21"},
{ id: 3,actor:"tien",role:"admin", log: 'User admin created a new account' ,time:"2023/12/21"},
{ id: 4,actor:"tien",role:"admin", log: 'User admin created a new account' ,time:"2023/12/21"},
];

const ActivityLogs = () => {
    const navigate = useNavigate(); // Hook điều hướng

    const handleBackToDashboard = () => {
        navigate('/admin/dashboard'); // Điều hướng đến trang AdminDashboard
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* Icon Button back to Dashboard */}
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton
                    color="primary"
                    onClick={handleBackToDashboard}
                    sx={{ mr: 2 }} // Khoảng cách giữa icon và tiêu đề
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5">Activity Logs</Typography>
            </Box>

            {/* Danh sách hoạt động */}

             <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow className="bg-blue-100 text-white">
                          <TableCell>id</TableCell>
                          <TableCell>actor</TableCell>
                          <TableCell>role</TableCell>
                          <TableCell>log</TableCell>
                          <TableCell>time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.id}</TableCell>
                            <TableCell>{log.actor}</TableCell>
                            <TableCell>{log.role}</TableCell>
                            <TableCell>{log.log}</TableCell>
                            <TableCell>{log.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

{/* 
            <Paper sx={{ padding: 2 }}>
                <List>
                    {mockLogs.map((log) => (
                        <ListItem key={log.id}>
                            <ListItemText primary={log.log} />
                        </ListItem>
                    ))}
                </List>
            </Paper> */}
        </Box>
    );
};

export default ActivityLogs;
