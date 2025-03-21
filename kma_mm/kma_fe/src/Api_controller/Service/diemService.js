import api from "../Api_setup/axiosConfig";

export const taoBangDiemChoSinhVien = async (data) => {
  const response = await api.post(`/diem/createDiemForClass`, data);
  return response.data;
};

export const layDanhSachSinhVienTheoTKB = async (id) => {
    const response = await api.get(`/diem/filter?thoi_khoa_bieu_id=${id}`);
    return response.data;
  };