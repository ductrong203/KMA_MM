// // In chungChiService.js
// import api from "../Api_setup/axiosConfig";

// export const getChungChi = async (page = 1, pageSize = 10) => {

// };

// export const getChungChiByFilters = async (filters) => {

// };

// export const themChungChi = async (data) => {

// };

// export const suaChungChi = async (id, data) => {

// };

// export const xoaChungChi = async (id) => {

// };
// export const laydanhsachloaichungchi = async () => {
//     try {
//         const response = await api.get("/chung-chi/loai-chung-chi");
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching chung chi types:", error);
//         throw error;
//     }
// }



// In chungChiService.js
import api from "../Api_setup/axiosConfig";

export const getChungChi = async (heDaoTaoId, khoaDaoTaoId, lopId) => {
    try {
        const params = new URLSearchParams();
        if (heDaoTaoId) params.append('heDaoTaoId', heDaoTaoId);
        if (khoaDaoTaoId) params.append('khoaDaoTaoId', khoaDaoTaoId);
        if (lopId) params.append('lopId', lopId);

        const response = await api.get(`/chung-chi?${params}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chung chi:", error);
        throw error;
    }
};

// export const getChungChiByFilters = async (filters) => {
//     try {
//         const { heDaoTao, khoaDaoTao, lopId } = filters;
//         return await getChungChi(heDaoTao, khoaDaoTao, lopId);
//     } catch (error) {
//         console.error("Error fetching chung chi by filters:", error);
//         throw error;
//     }
// };

export const themChungChi = async (data) => {
    try {
        const response = await api.post("/chung-chi", data);
        return response.data;
    } catch (error) {
        console.error("Error creating chung chi:", error);
        throw error;
    }
};

export const suaChungChi = async (id, data) => {
    try {
        const response = await api.post(`/chung-chi/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating chung chi:", error);
        throw error;
    }
};

export const xoaChungChi = async (id) => {
    try {
        const response = await api.delete(`/chung-chi/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting chung chi:", error);
        throw error;
    }
};

export const laydanhsachloaichungchi = async () => {
    try {
        const response = await api.get("/loai-chung-chi");
        return response.data;
    } catch (error) {
        console.error("Error fetching chung chi types:", error);
        throw error;
    }
}





export const getChungChiByFilters = async (filters) => {
    try {
        console.log("🔌 getChungChiByFilters called with:", filters);
        const { heDaoTao, khoaDaoTao, lopId } = filters;
        const result = await getChungChi(heDaoTao, khoaDaoTao, lopId);
        console.log("📡 API result:", result);
        return result;
    } catch (error) {
        console.error("❌ Error fetching chung chi by filters:", error);
        throw error;
    }
};

// Thêm các API mới cho quản lý loại chứng chỉ
export const taoLoaiChungChi = async (data) => {
    try {
        const response = await api.post("/loai-chung-chi", data);
        return response.data;
    } catch (error) {
        console.error("Error creating chung chi type:", error);
        throw error;
    }
};

export const capNhatLoaiChungChi = async (id, data) => {
    try {
        const response = await api.put(`/loai-chung-chi/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating chung chi type:", error);
        throw error;
    }
};

export const xoaLoaiChungChi = async (id) => {
    try {
        const response = await api.delete(`/loai-chung-chi/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting chung chi type:", error);
        throw error;
    }
};

export const layChiTietLoaiChungChi = async (id) => {
    try {
        const response = await api.get(`/loai-chung-chi/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chung chi type detail:", error);
        throw error;
    }
};