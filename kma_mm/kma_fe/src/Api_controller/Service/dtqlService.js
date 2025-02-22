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
  try {
    const response = await api.put(`/doituongquanly/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating:", error);
    throw error;
  }
};

export const deleteDoiTuongQuanLy = async (id) => {
  try {
    const response = await api.delete(`/doituongquanly/${id}`);
    if (response.status === 200) {
      return response.data;
    } else {
      alert("Xóa đối tượng quản lý không thành công!");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi xóa đối tượng quản lý:", error);
    alert("Đã xảy ra lỗi khi xóa đối tượng quản lý!");
    throw error;
  }
};
