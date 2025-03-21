import api from "../Api_setup/axiosConfig";

export const createDoiTuongQuanLy = async (data) => {
  const response = await api.post(`/doituongquanly`, data);
  return response.data;
};

export const getAllDoiTuongQuanLy = async () => {
  const response = await api.get(`/doituongquanly`);
  return response.data;
};

export const getDoiTuongQuanLy = async (id) => {
  const response = await api.get(`/doituongquanly/${id}`);
  return response.data;
};
export const updateDoiTuongQuanLy = async (id, data) => {
  const response = await api.put(`/doituongquanly/${id}`, data);
  return response.data;
};

export const deleteDoiTuongQuanLy = async (id) => {
  const response = await api.delete(`/doituongquanly/${id}`);
  if (response.status === 200) {
    return response.data;
  }
};
