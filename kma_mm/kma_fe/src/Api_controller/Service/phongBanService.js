import api from "../Api_setup/axiosConfig"

export const createPhongBan = async (data) => {
    const response = await api.post(`phong-ban`, data)
    return response.data
  }

  export const getPhongBan = async () => {
    const response = await api.get(`phong-ban`)
    return response.data
  }

  export const updatePhongBan = async (code, data) => {
    const response = await api.put(`phong-ban/${code}`,data)
    return response.data
  }