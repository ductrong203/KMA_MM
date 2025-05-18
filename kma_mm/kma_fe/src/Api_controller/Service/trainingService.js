import api from "../Api_setup/axiosConfig"

export const createTraining = async (data) => {
  const response = await api.post(`training`, data)
  return response.data
}
export const fetchDanhSachHeDaoTao = async () => {
  const response = await api.get(`/training`)
  return response.data
}

export const updateTraining = async (code, data) => {
  const response = await api.put(`training/${code}`, data)
  return response.data
}

export const getDanhSachKhoaDaoTao = async () => {
  const response = await api.get(`/khoadaotao`)
  return response.data
}
export const getDanhSachKhoaDaoTaobyId = async (id) => {
  const response = await api.get(`/khoadaotao/getbydanhmucdaotaoid/${id}`)
  return response.data
}