import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Container,
  Box,
} from "@mui/material";
import {
  Add as AddIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  People as PeopleIcon, // Thêm icon cho Quản lý giảng viên, nhân viên
  Groups as GroupsIcon, // Thêm icon cho Quản lý đối tượng
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const menuItems = [
   {
    title: "Quản lý giảng viên, nhân viên",
    description: "Thêm, sửa, quản lý giảng viên, nhân viên",
    icon: <PeopleIcon sx={{ fontSize: 40 }} />, // Sử dụng PeopleIcon
    href: "/admin/teacher-management",
    color: "info.main",
  },
   {
    title: "Phân quyền",
    description: "Gán hoặc cập nhật vai trò cho người dùng.",
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    href: "/admin/assign-roles",
    color: "secondary.main",
  },
  {
    title: "Quản lý phòng ban",
    description: "Thêm, sửa, quản lý phòng ban.",
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    href: "/admin/departments",
    color: "info.main",
  },
 {
    title: "Quản lý đối tượng",
    description: "Thêm, sửa, quản lý đối tượng",
    icon: <GroupsIcon sx={{ fontSize: 40 }} />, // Sử dụng GroupsIcon
    href: "/admin/manage-objects",
    color: "info.main",
  },
  {
    title: "Thêm tài khoản",
    description: "Tạo tài khoản mới cho người dùng hoặc quản trị viên.",
    icon: <AddIcon sx={{ fontSize: 40 }} />,
    href: "/admin/add-account",
    color: "success.main",
  },
  {
    title: "Quản lý tài khoản",
    description: "Chỉnh sửa, cập nhật hoặc vô hiệu hóa tài khoản người dùng.",
    icon: <ManageAccountsIcon sx={{ fontSize: 40 }} />,
    href: "/admin/manage-accounts",
    color: "primary.main",
  },
 
  {
    title: "Lịch sử hoạt động",
    description: "Xem lịch sử đăng nhập hoặc hành động của người dùng.",
    icon: <HistoryIcon sx={{ fontSize: 40 }} />,
    href: "/admin/activity-logs",
    color: "warning.main",
  },
  
  
];

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 3,
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  height: "100%",
                  p: 3,
                }}
              >
                <Link to={item.href} style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: "grey.100",
                      mb: 2,
                      color: item.color,
                      "&:hover": {
                        backgroundColor: "grey.200",
                      },
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