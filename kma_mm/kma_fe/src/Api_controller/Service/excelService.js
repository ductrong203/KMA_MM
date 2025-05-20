import api from "../Api_setup/axiosConfig";

export const exportDanhSachDiemGK = async (data) => {
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

export const importDanhSachDiemGK = async (data) => {
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

export const exportDanhSachDiemCK = async (data) => {
  console.log(data);
  try {
    const response = await api.post(`/excel/exportcuoiky`, data, {
      responseType: 'blob' // Quan trọng: yêu cầu dữ liệu kiểu blob để tải file
    });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const importDanhSachDiemCK = async (data) => {
  console.log(data);
  try {
    const response = await api.post(`/diem/importdiemck`, data, {
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

export const exportStudentsToExcel = async (data) => {
  console.log(data);
  try {
    const response = await api.post(`/student/export-excel`, data, {
      responseType: 'blob', // Quan trọng: yêu cầu dữ liệu kiểu blob để tải file
    });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Hàm import danh sách sinh viên
export const importStudentsFromExcel = async (data) => {
  console.log(data);
  try {
    const response = await api.post(`/student/import`, data, {
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

export const exportPhuLucBangDiem = async (id) => {
  console.log(id);
  try {
    const response = await api.get(`/excel-phu-luc-bang/export/?sinh_vien_id=${id}`, {
      responseType: 'blob', // Quan trọng: yêu cầu dữ liệu kiểu blob để tải file
    });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};