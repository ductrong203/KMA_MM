import api from "../Api_setup/axiosConfig"

export const getDanhSachLop = async () => {
    const response = await api.get(`lop`)
    return response.data
}

export const createLop = async (data) => {
    const response = await api.post(`lop`, data)
    return response.data
}

export const updateLop = async (maLop, data) => {
    const response = await api.put(`lop/${maLop}`, data)
    return response.data
}

