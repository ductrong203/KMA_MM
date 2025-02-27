import api from "../Api_setup/axiosConfig"

export const createGiangVien = async (data) => {
    const response = await api.post(`giang-vien`, data)
    return response.data
}

export const getGiangVien = async () => {
    const response = await api.get(`giang-vien`)
    return response.data
}

export const updateGiangVien = async (maGiangVien, data) => {
    const response = await api.put(`giang-vien/${maGiangVien}`, data)
    return response.data
}