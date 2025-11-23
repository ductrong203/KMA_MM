import api from "../Api_setup/axiosConfig";

// Thống kê tốt nghiệp theo khóa đào tạo hoặc lớp
export const getThongKeTotNghiep = async (params) => {
  try {
    const response = await api.post('/statistic/tot-nghiep', params);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Thống kê sinh viên đủ điều kiện làm đồ án theo khóa đào tạo hoặc lớp
export const getThongKeDoAn = async (params) => {
  try {
    const response = await api.post('/statistic/do-an', params);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
