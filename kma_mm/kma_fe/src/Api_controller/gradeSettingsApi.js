import api from "./Api_setup/axiosConfig"

// Lấy thiết lập điểm hiện tại
export const getGradeSettings = () => {
  return api.get('/grade-settings');
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
    chinhSachTuychinh: settings.chinhSachTuychinh
  };
  
  return api.put('/grade-settings', data);
};
