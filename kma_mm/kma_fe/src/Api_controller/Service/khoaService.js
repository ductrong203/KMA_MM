import api from "../Api_setup/axiosConfig"

export const fetchDanhSachKhoa = async () => {
    const response = await api.get(`khoadaotao`)
    return response.data
}

export const createKhoa = async (data) => {
    const response = await api.post(`khoadaotao`, data)
    return response.data
}

export const updateKhoa = async (maKhoa, data) => {
    const response = await api.put(`khoadaotao/${maKhoa}`, data)
    return response.data
}

export const getDanhSachKhoaTheoDanhMucDaoTao = async (danhMucDaoTaoId) => {
    const response = await api.get(`khoadaotao/getbydanhmucdaotaoid/${danhMucDaoTaoId}`)
    return response.data
}