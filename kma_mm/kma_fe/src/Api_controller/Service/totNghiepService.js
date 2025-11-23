import api from "../Api_setup/axiosConfig"

// Xét duyệt tốt nghiệp
export const approveGraduation = async (data) => {
  const response = await api.post(`/tot-nghiep/approve`, data)
  return response.data
}

// Lấy danh sách tốt nghiệp với filter
export const getGraduationList = async (filters = {}) => {
  const params = new URLSearchParams()
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key])
    }
  })
  
  const queryString = params.toString()
  const url = queryString ? `/tot-nghiep/list?${queryString}` : `/tot-nghiep/list`
  
  const response = await api.get(url)
  return response.data
}

// Lấy thông tin tốt nghiệp của một sinh viên
export const getStudentGraduation = async (sinhVienId, khoaDaoTaoId = null) => {
  const params = new URLSearchParams()
  if (khoaDaoTaoId) {
    params.append('khoa_dao_tao_id', khoaDaoTaoId)
  }
  
  const queryString = params.toString()
  const url = queryString
    ? `/tot-nghiep/student/${sinhVienId}?${queryString}`
    : `/tot-nghiep/student/${sinhVienId}`
  
  const response = await api.get(url)
  return response.data
}

// Cập nhật thông tin bằng tốt nghiệp
export const updateGraduationCertificate = async (graduationId, certificateData) => {
  const response = await api.put(`/tot-nghiep/certificate/${graduationId}`, certificateData)
  return response.data
}

// Lấy thống kê tốt nghiệp
export const getGraduationStatistics = async (filters = {}) => {
  const params = new URLSearchParams()
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key])
    }
  })
  
  const queryString = params.toString()
  const url = queryString ? `/tot-nghiep/statistics?${queryString}` : `/tot-nghiep/statistics`
  
  const response = await api.get(url)
  return response.data
}

// Tạo bản ghi tốt nghiệp mới
export const createGraduation = async (graduationData) => {
  const response = await api.post(`/tot-nghiep`, graduationData)
  return response.data
}

// Xóa bản ghi tốt nghiệp
export const deleteGraduation = async (graduationId) => {
  const response = await api.delete(`/tot-nghiep/${graduationId}`)
  return response.data
}

// Kiểm tra điều kiện tốt nghiệp (cho interface DieuKienTotNghiep)
export const checkGraduationConditions = async (filters) => {
  // Gọi API lấy danh sách sinh viên và kiểm tra điều kiện
  const response = await api.post(`/tot-nghiep/check-conditions`, filters)
  return response.data
}

// Lấy danh sách sinh viên đủ điều kiện tốt nghiệp
export const getEligibleStudents = async (filters) => {
  const params = new URLSearchParams()
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key])
    }
  })
  
  const queryString = params.toString()
  const url = queryString
    ? `/tot-nghiep/eligible-students?${queryString}`
    : `/tot-nghiep/eligible-students`
  
  const response = await api.get(url)
  return response.data
}

// Kiểm tra sinh viên đã được xét duyệt tốt nghiệp chưa
export const checkGraduationStatus = async (filters) => {
  const params = new URLSearchParams()
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key])
    }
  })
  
  const queryString = params.toString()
  const url = queryString
    ? `/tot-nghiep/check-status?${queryString}`
    : `/tot-nghiep/check-status`
  
  const response = await api.get(url)
  return response.data
}
