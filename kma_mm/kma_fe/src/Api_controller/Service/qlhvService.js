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
