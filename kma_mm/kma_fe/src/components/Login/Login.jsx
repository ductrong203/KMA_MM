// import React, { useState } from "react";

// const Login = ({ onLogin }) => {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");

//     const handleLogin = () => {
//         if (username === "admin" && password === "1234") {
//             localStorage.setItem("access_token", "abc");
//             localStorage.setItem("role", "admin");
//             onLogin("admin");
//         } else if (username === "sv123" && password === "123") {
//             localStorage.setItem("access_token", "abc");
//             localStorage.setItem("role", "sv");
//             onLogin("sv");
//         } else {
//             alert("Invalid username or password");
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
//                 <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
//                     Login
//                 </h1>
//                 <div className="space-y-4">
//                     <div>
//                         <label
//                             htmlFor="username"
//                             className="block text-sm font-medium text-gray-700"
//                         >
//                             Username
//                         </label>
//                         <input
//                             type="text"
//                             id="username"
//                             placeholder="Enter your username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                     </div>
//                     <div>
//                         <label
//                             htmlFor="password"
//                             className="block text-sm font-medium text-gray-700"
//                         >
//                             Password
//                         </label>
//                         <input
//                             type="password"
//                             id="password"
//                             placeholder="Enter your password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                     </div>
//                 </div>
//                 <button
//                     onClick={handleLogin}
//                     className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
//                 >
//                     Login
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Login;


import React, { useState } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Grid,
    Paper,
} from "@mui/material";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (username === "admin" && password === "1234") {
            localStorage.setItem("access_token", "abc");
            localStorage.setItem("role", "admin");
            onLogin("admin");
        } else if (username === "sv123" && password === "123") {
            localStorage.setItem("access_token", "abc");
            localStorage.setItem("role", "sv");
            onLogin("sv");
        }
        else if (username === "dt123" && password === "123") {
            localStorage.setItem("access_token", "abc");
            localStorage.setItem("role", "training");
            onLogin("training");
        } else {
            alert("Invalid username or password");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                    Login
                </Typography>
                <Box
                    component="form"
                    sx={{
                        "& .MuiTextField-root": { mb: 2 },
                        display: "flex",
                        flexDirection: "column",
                    }}
                    noValidate
                >
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleLogin}
                        sx={{ mt: 2 }}
                    >
                        Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
