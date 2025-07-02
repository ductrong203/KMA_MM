import api from "../Api_setup/axiosConfig";

export const createChuongTrinhDaoTao = async (data) => {
  try {
    const response = await api.post("/chuong-trinh-dao-tao", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tạo chương trình đào tạo');
  }
};

export const getChuongTrinhDaoTao = async (filters = {}) => {
  try {
    const { he_dao_tao_id, khoa_dao_tao_id } = filters;
    const params = {};
    if (he_dao_tao_id) params.he_dao_tao_id = he_dao_tao_id;
    if (khoa_dao_tao_id) params.khoa_dao_tao_id = khoa_dao_tao_id;

    const response = await api.get("/chuong-trinh-dao-tao", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách chương trình đào tạo');
  }
};

export const updateChuongTrinhDaoTao = async (data) => {
  try {
    const response = await api.put("/chuong-trinh-dao-tao/update", data);
    return response.data;
  } catch (error) {
    throw new Error('Lỗi khi cập nhật chương trình đào tạo: ' + error.message);
  }
};