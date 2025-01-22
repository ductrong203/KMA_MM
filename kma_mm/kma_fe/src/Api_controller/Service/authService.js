import api from "../Api_setup/axiosConfig"; // Đường dẫn đến file config axios

// Hàm xử lý đăng nhập
export const login = async (username, password) => {
    if (!username || !password) {
        throw new Error("Please enter both username and password.");
    }
    const response = await api.post("/auth/login", { username, password });
    const { access_token, data } = response.data;
    // Bảng ánh xạ role từ API sang tên vai trò
    const roleMapping = {
        1: "training",
        2: "examination",
        3: "student_manage",
        4: "library",
        5: "director",
        6: "sv",
        7: "admin",
    };
    // Lấy tên role từ roleMapping
    const roleName = roleMapping[data.role];
    if (!roleName) {
        throw new Error("Role không hợp lệ."); // Xử lý lỗi nếu role không xác định
    }
    // Lưu token và thông tin người dùng vào localStorage
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", roleName);
    // localStorage.setItem("username", data.username);
    return roleName; // Trả về role để sử dụng
};

// Hàm xử lý đăng ký
export const register = async (username, password, confirmPassword) => {
    if (!username || !password || !confirmPassword) {
        throw new Error("Please fill all fields.");
    }
    if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
    }

    const response = await api.post("/auth/register", {
        username,
        password,
        confirmPassword,
    });

    return response.data.message || "Registration successful!"; // Trả về thông báo thành công
};


// Hàm xử lý đăng ký
export const AdminRegister = async (username, password, confirmPassword, role) => {
    if (!username || !password || !confirmPassword || !role) {
        throw new Error("Please fill all fields.");
    }
    if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
    }

    const response = await api.post("/auth/register", {
        username,
        password,
        confirmPassword,
        role
    });

    return response.data.message || "Registration successful!"; // Trả về thông báo thành công
};