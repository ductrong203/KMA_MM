import api from "../Api_setup/axiosConfig"

export const createTraining = async (data) => {
    const response = await api.post(`training/create-training`, data)
    return response.data
  }