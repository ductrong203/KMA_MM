import axios from "axios";
import config from "../../config/config";
// Tạo một instance của axios
const api = axios.create({
    baseURL: `${config.baseUrl}`, // URL cơ bản của API
    timeout: 10000, // Thời gian chờ tối đa (ms)
    headers: {
        "Content-Type": "application/json", // Header mặc định
    },
});
// Thêm interceptor để xử lý request trước khi gửi
api.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage (nếu có)
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor để xử lý response
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Xử lý lỗi
        if (error.response && error.response.status === 401) {
            // Ví dụ: Redirect về trang login nếu gặp lỗi 401 (Unauthorized)
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
