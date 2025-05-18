import api from "../Api_setup/axiosConfig";

export const exportDanhSachDiem = async (data) => {
  console.log(data);
  try {
    const response = await api.post(`/excel/export`, data, {
      responseType: 'blob' // Quan trọng: yêu cầu dữ liệu kiểu blob để tải file
    });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const importDanhSachDiem = async (data) => {
  console.log(data);
  try {
    const response = await api.post(`/diem/importdiemgk`, data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Đảm bảo header đúng
      },
    });
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};