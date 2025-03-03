import api from "../Api_setup/axiosConfig";

export const getDanhSachSinhVienTheoLop = async (maLop) => {
    const response = await api.get(`student/getbylopid/${maLop}`)
    return response.data
}