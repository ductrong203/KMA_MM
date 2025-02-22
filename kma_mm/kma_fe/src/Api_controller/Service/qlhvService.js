import api from "../Api_setup/axiosConfig";

// thêm học viên bên quản lý học viên
export const createNewStudent = async (data) => {
    const response = await api.post(`/student`, data)
    return response.data
}


// lấy danh sách học viên bên quản lý học viên
export const getAllStudent = async () => {
    const response = await api.get(`/student`)
    return response.data
}

// lấy danh sách thông tin quân nhân bên quản lý học viên
export const getAllMiri = async () => {
    const response = await api.get(`/thongtinquannhan/`)
    return response.data
}
export const updateMilitaryInfo = async (data, id) => {
    const response = await api.post(`/thongtinquannhan/${id}`, data)
    return response.data
}


export const updateStudentById = async (data, id) => {
    try {
        const response = await api.put(`/student/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật sinh viên:", error);
        throw error;
    }
};
