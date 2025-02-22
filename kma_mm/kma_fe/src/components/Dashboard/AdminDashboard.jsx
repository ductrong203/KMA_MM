import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SecurityIcon from "@mui/icons-material/Security";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import Layout from "../../layout/Layout"; // Import Layout component

const AdminDashboard = () => {
  return (
    <Grid container spacing={4}>
      {/* Create Account */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Link to="/admin/add-account">
              <IconButton color="primary" sx={{ fontSize: 50 }}>
                <AddIcon />
              </IconButton>
            </Link>
            <Typography variant="h6" component="div" mt={2}>
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create new accounts for users or admins.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Manage Accounts */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Link to="/admin/manage-accounts">
              <IconButton color="primary" sx={{ fontSize: 50 }}>
                <ManageAccountsIcon />
              </IconButton>
            </Link>
            <Typography variant="h6" component="div" mt={2}>
              Manage Accounts
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Edit, update, or disable user accounts.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Assign Roles */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Link to="/admin/assign-roles">
              <IconButton color="primary" sx={{ fontSize: 50 }}>
                <SecurityIcon />
              </IconButton>
            </Link>
            <Typography variant="h6" component="div" mt={2}>
              Assign Roles
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Assign or update roles for users.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Activity Logs */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Link to="/admin/activity-logs">
              <IconButton color="primary" sx={{ fontSize: 50 }}>
                <HistoryIcon />
              </IconButton>
            </Link>
            <Typography variant="h6" component="div" mt={2}>
              Activity Logs
            </Typography>
            <Typography variant="body2" color="textSecondary">
              View login history or actions performed by users.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Account */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Link to="/admin/delete-account">
              <IconButton color="primary" sx={{ fontSize: 50 }}>
                <DeleteIcon />
              </IconButton>
            </Link>
            <Typography variant="h6" component="div" mt={2}>
              Delete Account
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Remove inactive or unwanted accounts.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;
