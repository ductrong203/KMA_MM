import api from "../Api_setup/axiosConfig"; // Đường dẫn đến file config axios

// Hàm xử lý đăng nhập
export const login = async (username, password) => {
    if (!username || !password) {
        throw new Error("Please enter both username and password.");
    }

    const response = await api.post("/auth/login", { username, password });
    const { access_token, data } = response.data;

    // Lưu token và thông tin người dùng vào localStorage
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", data.role === 1 ? "training" : "sv");
    localStorage.setItem("username", data.username);

    return data.role === 1 ? "training" : "sv"; // Trả về role để sử dụng
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
