import api from "../Api_setup/axiosConfig";

export const taoBangDiemChoSinhVien = async (data) => {
  const response = await api.post(`/diem/createDiemForClass`, data);
  return response.data;
};

export const layDanhSachSinhVienTheoTKB = async (id) => {
  const response = await api.get(`/diem/filter?thoi_khoa_bieu_id=${id}`);
  return response.data;
};

export const nhapDiem = async (data) => {
  console.log(data)
  const response = await api.put(`/diem`, data);
  return response.data;
};

// Tìm sinh viên theo mã hoặc các bộ lọc
export const timSinhVienTheoMaHoacFilter = async (filters) => {
  try {
      const response = await api.get('/student/tim-kiem', {
          params: filters // Truyền các tham số lọc: ma_sinh_vien, he_dao_tao_id, khoa_id, lop_id
      });
      return response.data; // Trả về dữ liệu từ server
  } catch (error) {
      console.error('Error in timSinhVienTheoMaHoacFilter:', error);
      throw error; // Ném lỗi để xử lý ở nơi gọi
  }
};

// Hàm đã có sẵn trong yêu cầu trước
export const themSinhVienHocLai = async (data) => {
  try {
      const response = await api.post('/diem/them-sinh-vien-hoc-lai', data);
      return response.data;
  } catch (error) {
      console.error('Error in themSinhVienHocLai:', error);
      throw error;
  }
};

export const kiemTraBangDiemTonTai = async (id) => {
  const response = await api.get(`/diem/filter?thoi_khoa_bieu_id=${id}`);
  return response.data;
};

export const layDSSVTheoKhoaVaMonHoc = async (khoa_id, mon_hoc_id) => {
  const response = await api.get(`/diem/khoadaotaovamonhoc/${khoa_id}/${mon_hoc_id}`);
  return response.data;
};