import api from "../Api_setup/axiosConfig";

export const createKhenKyLuat = async (data) => {
  const response = await api.post(`/khenthuongkyluat`, data);
  return response.data;
};

export const getAllKhenKyLuat = async () => {
  const response = await api.get(`/khenthuongkyluat`);
  return response.data;
};
export const getKhenKyLuat = async () => {
  const response = await api.get(`/khenthuongkyluat`);
  return response.data;
};

export const updateKhenKyLuat = async (id, data) => {
  const response = await api.put(`/khenthuongkyluat/${id}`, data);
  return response.data;
};

export const deleteKhenKyLuat = async (id) => {
  const response = await api.delete(`/khenthuongkyluat/${id}`);
  return response.data;
};
