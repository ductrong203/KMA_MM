import api from "../Api_setup/axiosConfig"

export const createMonHoc = async (data) => {
    console.log(data)

    const response = await api.post(`mon-hoc`, data)
    return response.data
}

export const getMonHoc = async () => {
    const response = await api.get(`mon-hoc`)
    return response.data
}

export const updateMonHoc = async (maMonHoc, data) => {
    const response = await api.put(`mon-hoc/${maMonHoc}`, data)
    return response.data
}

export const getDanhSachMonHocTheoKhoaVaKi = async (data) => {
    console.log(data)
    const response = await api.post(`kehoachmonhoc/getbykhoavaky`,data)
    return response.data
}

export const getThoiKhoaBieu = async () => {
    const response = await api.get(`thoikhoabieu`)
    return response.data
}



export const updateThoiKhoaBieu = async (editId, data) => {
    const response = await api.put(`/thoikhoabieu/${editId}`, data)
    return response.data
}


export const themThoiKhoaBieu = async (data) => {
    const response = await api.post(`/thoikhoabieu`, data)
    return response.data
}
export const xoaThoiKhoaBieu = async (id) => {
    const response = await api.delete(`/thoikhoabieu/${id}`)
    return response.data
}

export const chiTietMonHoc = async (data) => {
    const response = await api.get(`/mon-hoc/chitiet`, { params: data })
    return response
}
