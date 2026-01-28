import api from "../Api_setup/axiosConfig";

export const getThoiKhoaBieu = async (monHocId, lopId, kyHoc) => {
    const response = await api.get(`thoikhoabieu/filterbyid?mon_hoc_id=${monHocId}&lop_id=${lopId}&ky_hoc=${kyHoc}`)
    return response.data
}



// Lấy danh sách thời khóa biểu theo trang
export const fetchThoiKhoaBieuByPage = async (page, pageSize) => {
    const response = await api.get(`/thoikhoabieu/getbypage?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

// Lấy danh sách thời khóa biểu với bộ lọc
export const fetchThoiKhoaBieuByFilter = async (page, pageSize, kyHoc, lopId, monHocId) => {
    let url = `/thoikhoabieu/filterbyid?page=${page}&pageSize=${pageSize}`;
    if (kyHoc) url += `&ky_hoc=${kyHoc}`;
    if (lopId) url += `&lop_id=${lopId}`;
    if (monHocId) url += `&mon_hoc_id=${monHocId}`;
    const response = await api.get(url);
    return response.data;
};

// Lấy danh sách lớp theo khóa đào tạo
export const fetchLopByKhoaDaoTao = async (khoaDaoTaoId) => {
    const response = await api.get(`/lop/bykhoadaotao?khoa_dao_tao_id=${khoaDaoTaoId}`);
    return response.data;
};

// Lấy danh sách môn học theo hệ đào tạo
export const fetchMonHocByHeDaoTao = async (heDaoTaoId) => {
    const response = await api.get(`/mon-hoc/getByHeDaoTaoId/${heDaoTaoId}`);
    return response.data.data || [];
};

// Lấy kế hoạch môn học theo khóa và kỳ
export const fetchKeHoachMonHoc = async (khoaDaoTaoId, kyHoc) => {
    const response = await api.get(`/kehoachmonhoc/getbykhoavaky/${khoaDaoTaoId}/${kyHoc}`);
    return response.data;
};

// Thêm thời khóa biểu cho tất cả môn học từ kế hoạch
export const createAllThoiKhoaBieu = async (data) => {
    const response = await api.post('/thoikhoabieu/createall', data);
    return response.data;
};

/**
 * Lấy danh sách môn học có trong TKB nhưng chưa có trong KHMH
 * @param {number} khoaDaoTaoId - ID khóa đào tạo
 * @param {number|null} kyHoc - Kỳ học (optional)
 */
export const getMissingMonHocInKeHoach = async (khoaDaoTaoId, kyHoc = null) => {
    let url = `/thoikhoabieu/missing/${khoaDaoTaoId}`;
    if (kyHoc) {
        url += `/${kyHoc}`;
    }
    const response = await api.get(url);
    return response.data;
};

/**
 * Thêm nhiều môn học vào kế hoạch môn học nếu chưa tồn tại
 * @param {Array} items - Mảng các { khoa_dao_tao_id, mon_hoc_id, ky_hoc, bat_buoc }
 */
export const bulkAddToKeHoachMonHoc = async (items) => {
    const response = await api.post('/kehoachmonhoc/bulk-add', { items });
    return response.data;
};

// Lấy danh sách duyệt điểm
export const fetchApprovalList = async (khoaDaoTaoId, kyHoc, lopId) => {
    let url = `/thoikhoabieu/get-approval-list?khoa_dao_tao_id=${khoaDaoTaoId}`;
    if (kyHoc) url += `&ky_hoc=${kyHoc}`;
    if (lopId) url += `&lop_id=${lopId}`;
    const response = await api.get(url);
    return response.data;
};