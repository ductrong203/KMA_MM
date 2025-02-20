import React from "react";
import { Grid, Card, CardContent, Typography, IconButton, Paper } from "@mui/material";
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
                            Tạo tài khoản
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Tạo tài khoản cho người dùng
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
                            Quản lý tài khoản
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Thêm sửa xóa tài khoản
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
                            Phân quyền
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Gán quyền hoặc phân quyền cho người dùng
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
                            Nhật kí hoạt động
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Xem hành động của người dùng
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Delete Account */}
            {/* <Grid item xs={12} sm={6} md={4}>
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
            </Grid> */}
        </Grid>

    );
};

export default AdminDashboard;
