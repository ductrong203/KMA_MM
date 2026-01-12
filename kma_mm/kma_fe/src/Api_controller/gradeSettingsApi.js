import api from "./Api_setup/axiosConfig"

// Lấy thiết lập điểm hiện tại
export const getGradeSettings = (params) => {
  return api.get('/grade-settings', { params });
};

// Cập nhật thiết lập điểm
export const updateGradeSettings = (settings) => {
  // Đảm bảo dữ liệu gửi đi có cấu trúc đúng với backend
  const data = {
    diemThiToiThieu: settings.diemThiToiThieu,
    diemTrungBinhDat: settings.diemTrungBinhDat,
    diemGiuaKyToiThieu: settings.diemGiuaKyToiThieu,
    diemChuyenCanToiThieu: settings.diemChuyenCanToiThieu,
    chinhSachHienTai: settings.chinhSachHienTai,
    chinhSachTuychinh: settings.chinhSachTuychinh,
    he_dao_tao_id: settings.he_dao_tao_id || null
  };

  return api.put('/grade-settings', data);
};

// Conversion Rules
export const getConversionRules = (params) => {
  return api.get('/conversion-rules', { params });
};
export const createConversionRule = (data) => {
  return api.post('/conversion-rules', data);
};
export const updateConversionRule = (id, data) => {
  return api.put(`/conversion-rules/${id}`, data);
};
export const deleteConversionRule = (id) => {
  return api.delete(`/conversion-rules/${id}`);
};
