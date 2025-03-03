import api from "../Api_setup/axiosConfig";

export const createdanhmuckhenkyluat = async (data) => {
  const response = await api.post(`/danhmuckhenkyluat`, data);
  return response.data;
};

export const getAlldanhmuckhenkyluat = async () => {
  const response = await api.get(`/danhmuckhenkyluat`);
  return response.data;
};

export const updateDanhMucKhenKyLuat = async (id, data) => {
  const response = await api.put(`/danhmuckhenkyluat/${id}`, data);
  return response.data;
};

export const deleteDanhMucKhenKyLuat = async (id) => {
  const response = await api.delete(`/danhmuckhenkyluat/${id}`);
  return response.data;
};
