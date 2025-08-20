import api from "../Api_setup/axiosConfig";

// Lấy thiết lập điểm hiện tại
export const getGradeSettings = async () => {
  try {
    const response = await api.get('/grade-settings');
    
    if (response && response.data) {
      // Tùy thuộc vào cấu trúc dữ liệu trả về từ backend
      if (response.data.data) {
        return response.data.data;
      }
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy thiết lập điểm:', error);
    throw error;
  }
};
