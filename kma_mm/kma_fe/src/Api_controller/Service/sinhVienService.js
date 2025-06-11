import api from "../Api_setup/axiosConfig";

export const getDanhSachSinhVienTheoLop = async (maLop) => {
    const response = await api.get(`student/getbylopid/${maLop}`)
    return response.data
}

export const checkExistingStudents = async (formData) => {
  try {
    const response = await api.post('student/kiem-tra-ton-tai', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Lỗi khi kiểm tra sinh viên tồn tại:', error);
    throw error.response?.data || new Error('Không thể kiểm tra sinh viên tồn tại');
  }
};