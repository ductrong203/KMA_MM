import React from "react";
import { Container, Typography, Paper, Box, Button } from "@mui/material";

const UserInfo = ({ user, onLogout }) => {
    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "80vh",
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                    width: "100%",
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color: "primary.main",
                        mb: 3,
                    }}
                >
                    User Information
                </Typography>
                {/* <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Username:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.username || "N/A"}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Email:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.email || "N/A"}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Role:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.role || "N/A"}
                    </Typography>
                </Box> */}
                <Button
                    variant="contained"
                    color="error"
                    onClick={onLogout}
                    sx={{
                        py: 1,
                        px: 3,
                        fontWeight: "bold",
                        "&:hover": {
                            backgroundColor: "darkred",
                        },
                    }}
                >
                    Logout
                </Button>
            </Paper>
        </Container>
    );
};

export default UserInfo;
