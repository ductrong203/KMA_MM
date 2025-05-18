import api from "../Api_setup/axiosConfig";

export const getThoiKhoaBieu = async (monHocId, lopId, kyHoc) => {
    const response = await api.get(`thoikhoabieu/filterbyid?mon_hoc_id=${monHocId}&lop_id=${lopId}&ky_hoc=${kyHoc}`)
    return response.data
}