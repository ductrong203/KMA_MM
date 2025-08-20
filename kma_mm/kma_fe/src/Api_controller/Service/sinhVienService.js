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

// Api_controller/Service/sinhVienService.js
export const kiemTraTotNghiep = async (sinhVienId, requiredCredits) => {
  try {
    let url = `student/kiem-tra-tot-nghiep/${sinhVienId}`;
    
    // Add requiredCredits as a query parameter if provided
    if (requiredCredits) {
      url += `?requiredCredits=${requiredCredits}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API kiểm tra tốt nghiệp:', error);
    throw error;
  }
};

export const getDanhSachSinhVienTheoKhoa = async (maKhoa) => {
    const response = await api.get(`student/khoa/${maKhoa}`)
    return response.data
}

export const capNhatSinhVien = async (id, formData) => {
    const response = await api.put(`student/${id}`, formData)
    return response.data
}

export const capNhatDanhSachSinhVien = async (khoa_dao_tao_id, sinh_vien_list) => {
    const response = await api.put(`student/khoa/${khoa_dao_tao_id}`, { sinh_vien_list });
    return response.data;
}