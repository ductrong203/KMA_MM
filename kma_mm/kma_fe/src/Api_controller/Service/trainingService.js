import api from "../Api_setup/axiosConfig"

export const createTraining = async (data) => {
  const response = await api.post(`training/create-training`, data)
  return response.data
}


export const getAllClassList = async () => {
  const response = await api.get(`/lop`)
  return response.data
}