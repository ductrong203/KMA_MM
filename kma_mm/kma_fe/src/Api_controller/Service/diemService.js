import api from "../Api_setup/axiosConfig";

export const taoBangDiemChoSinhVien = async (data) => {
  const response = await api.post(`/diem/createDiemForClass`, data);
  return response.data;
};

export const layDanhSachSinhVienTheoTKB = async (params) => {
  // Nếu params là string, sử dụng trực tiếp; nếu là object, convert thành query string
  const queryString = typeof params === 'string' ? params : `thoi_khoa_bieu_id=${params}`;
  const response = await api.get(`/diem/filter?${queryString}`);
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

export const fetchThongKeDiem = async (heDaoTaoId, khoaId, lopId, kyHocId) => {
  try {
    const queryParams = new URLSearchParams({
      he_dao_tao_id: heDaoTaoId || '',
      khoa_dao_tao_id: khoaId || '',
      ky_hoc_id: kyHocId || '',
      ...(lopId && { lop_id: lopId })
    });
    const response = await api.get(`/diem/thong-ke-diem?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export kết quả kỳ học theo sinh viên
export const exportKetQuaKyHoc = async (sinhVienId, soKyHoc) => {
  try {
    const response = await api.get(`/export-excel/ket-qua-ky-hoc/?sinh_vien_id=${sinhVienId}&so_ky_hoc=${soKyHoc}`, {
      responseType: 'blob' // Để nhận file Excel
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Export kết quả năm học theo sinh viên
export const exportKetQuaNamHoc = async (sinhVienId, namHoc) => {
  try {
    const response = await api.get(`/export-excel/ket-qua-nam-hoc/?sinh_vien_id=${sinhVienId}&nam_hoc=${namHoc}`, {
      responseType: 'blob' // Để nhận file Excel
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const lockGrade = async (thoi_khoa_bieu_id, is_locked) => {
  try {
    const response = await api.put('/diem/lock-grade', { thoi_khoa_bieu_id, is_locked });
    return response.data;
  } catch (error) {
    throw error;
  }
};