import React from "react";
import { AppBar, Toolbar, Typography, Box, Avatar, Button, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const Layout = ({ children, Info, title }) => {
    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('access_token');
        console.log('Logging out...');
        window.location.href = '/login'; // Điều hướng tới trang login
    };

    return (
        <div>
            {/* Thanh điều hướng */}
            <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#1565c0' }}>
                            <PersonIcon />
                        </Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {Info.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {Info.id}
                            </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mx: 2 }} />
                        <Button
                            color="inherit"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                                borderRadius: '8px',
                                textTransform: 'none'
                            }}
                        >
                            Đăng xuất
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Nội dung chính */}
            <div style={{ padding: "20px" }}>
                {children} {/* Các route con sẽ được render tại đây */}
            </div>
        </div>
    );
};

export default Layout;
