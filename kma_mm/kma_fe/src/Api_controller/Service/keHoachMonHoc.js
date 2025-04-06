// Api_controller/Service/keHoachMonHocService.js
import api from "../Api_setup/axiosConfig";

// Lấy danh sách hệ đào tạo
export const getAllTrainingSystems = async () => {
    const response = await api.get('/training');
    return Array.isArray(response.data) ? response.data : [];
};

// Lấy khóa đào tạo theo hệ đào tạo
export const getBatchesByCurriculumId = async (curriculumId) => {
    const response = await api.get(`/khoadaotao/getbydanhmucdaotaoid/${curriculumId}`);
    return Array.isArray(response.data) ? response.data : [];
};

// Lấy toàn bộ môn học
export const getAllSubjects = async () => {
    const response = await api.get('/mon-hoc');
    return Array.isArray(response.data) ? response.data : [];
};

// Lấy môn học theo hệ đào tạo
export const getSubjectsByCurriculumId = async (curriculumId) => {
    const response = await api.get(`/mon-hoc/getByHeDaoTaoId/${curriculumId}`);
    return response.data.data && Array.isArray(response.data.data) ? response.data.data : [];
};

// Lấy kế hoạch môn học theo khóa
export const getSubjectPlansByBatch = async (batchId) => {
    const response = await api.get(`/kehoachmonhoc/getbykhoavaky/${batchId}`);
    return Array.isArray(response.data) ? response.data : [];
};

// Thêm kế hoạch môn học
export const createSubjectPlan = async (data) => {
    const response = await api.post('/kehoachmonhoc', data);
    return response.data;
};

// Xóa kế hoạch môn học
export const deleteSubjectPlan = async (planId) => {
    await api.delete(`/kehoachmonhoc/${planId}`);
};

// Cập nhật kế hoạch môn học
export const updateSubjectPlan = async (planId, data) => {
    const response = await api.put(`/kehoachmonhoc/${planId}`, data);
    return response.data;
};