import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Container,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const menuItems = [
  {
    title: 'Create Account',
    description: 'Create new accounts for users or admins.',
    icon: <AddIcon sx={{ fontSize: 40 }} />,
    href: '/admin/add-account',
    color: 'success.main'
  },
  {
    title: 'Manage Accounts',
    description: 'Edit, update, or disable user accounts.',
    icon: <ManageAccountsIcon sx={{ fontSize: 40 }} />,
    href: '/admin/manage-accounts',
    color: 'primary.main'
  },
  {
    title: 'Assign Roles',
    description: 'Assign or update roles for users.',
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    href: '/admin/assign-roles',
    color: 'secondary.main'
  },
  {
    title: 'Activity Logs',
    description: 'View login history or actions performed by users.',
    icon: <HistoryIcon sx={{ fontSize: 40 }} />,
    href: '/admin/activity-logs',
    color: 'warning.main'
  },
  {
    title: 'Delete Account',
    description: 'Remove inactive or unwanted accounts.',
    icon: <DeleteIcon sx={{ fontSize: 40 }} />,
    href: '/admin/delete-account',
    color: 'error.main'
  },
  {
    title: 'Manage Departments',
    description: 'Create, edit, and manage department structure.',
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    href: '/admin/departments',
    color: 'info.main'
  },
  {
    title: 'Manage Teaher',
    description: 'Create, edit, and manage teacher',
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    href: '/admin/teacher-management',
    color: 'info.main'
  },
  {
    title: 'Đối tượng quản lý',
    description: 'Create, edit, and manage object',
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    href: '/admin/manage-objects',
    color: 'info.main'
  }
];

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3,
                }
              }}
            >
              <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                p: 3
              }}>
                <Link to={item.href} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'grey.100',
                      mb: 2,
                      color: item.color,
                      '&:hover': {
                        backgroundColor: 'grey.200',
                      }
                    }}
                  >
                    {item.icon}
                  </Box>
                </Link>

                <Typography variant="h6" component="h2" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;