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






// Lấy thông tin quân nhân theo sinh viên ID
export const getMilitaryInfoByStudentId = async (id) => {
    const response = await api.get(`/thongtinquannhan/byidsinhvien/${id}`);
    return response.data;
};

// Thêm mới thông tin quân nhân
export const createMilitaryInfo = async (data) => {
    const response = await api.post(`/thongtinquannhan/`, data);
    return response.data;
};

// Cập nhật thông tin quân nhân theo sinh viên ID
export const updateMilitaryInfoByStudentId = async (id, data) => {
    const response = await api.put(`/thongtinquannhan/byidsinhvien/${id}`, data);
    return response.data;
};