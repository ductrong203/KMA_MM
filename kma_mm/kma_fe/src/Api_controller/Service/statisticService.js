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
// Thống kê sinh viên đủ điều kiện làm đồ án theo khóa đào tạo hoặc lớp
export const getThongKeDoAn = async (params) => {
  try {
    const response = await api.post('/statistic/do-an', params);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Báo cáo tổng hợp
export const getThongKeBaoCao = async (params) => {
  try {
    const response = await api.post('/statistic/export-bao-cao', params, {
      responseType: 'blob' // Quan trọng: Yêu cầu server trả về file
    });
    return response.data; // Trả về blob
  } catch (error) {
    throw error;
  }
};

// Lấy dữ liệu preview báo cáo
export const getThongKeBaoCaoPreview = async (params) => {
  try {
    const response = await api.post('/statistic/export-bao-cao-preview', params);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
