import api from "../Api_setup/axiosConfig"; // Đường dẫn đến file config axios

export const getAllUser = async (username, password) => {

    const response = await api.get("/auth/get-all");
    return response; // Trả về role để sử dụng
};

export const asignRole = async (id, role) => {
    const response = await api.put(`/auth/update-user/${id}`, { role });
    return response.message
}


export const updateUserById = async (id, data) => {
    try {
        const response = await api.put(`/auth/update-user/${id}`, data);
        return response.data;  // Trả về dữ liệu cập nhật
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};