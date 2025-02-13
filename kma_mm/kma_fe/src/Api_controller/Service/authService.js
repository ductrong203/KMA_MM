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
    localStorage.setItem("id", data.id)
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
export const getDetailUserById = async (id) => {
    const response = await api.get(`/auth/get-detail-user/${id}`)
    return response.data
}

export const changeUserPassWord = async (id, data) => {
    try {
        const response = await api.put(`/auth/change-password/${id}`, data);
        return response; // Trả về response để xử lý ở phía trên
    } catch (error) {
        console.error("Error in changeUserPassWord:", error);
        throw error; // Ném lỗi để xử lý ở phía trên
    }
};



// Hàm xóa người dùng dựa trên ID
export const deleteUserById = async (id) => {
    try {
        const response = await api.delete(`/auth/delete-user/${id}`); // Gọi endpoint xóa
        if (response.status === 200) {

            return response.data; // Trả về dữ liệu từ server
        } else {
            alert("Xóa người dùng không thành công!");
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        alert("Đã xảy ra lỗi khi xóa người dùng!");
        throw error;
    }
};



