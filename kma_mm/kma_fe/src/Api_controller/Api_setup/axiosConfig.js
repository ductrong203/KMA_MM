import axios from "axios";
import config from "../../config/config";

const api = axios.create({
    baseURL: `${config.baseUrl}`, // URL cơ bản của API
    timeout: 10000, // Thời gian chờ tối đa (ms)
    headers: {
        "Content-Type": "application/json", // Header mặc định
    },
    //withCredentials: true, // Bật gửi cookie trong request
});

let isRefreshing = false;
let refreshSubscribers = [];

// Hàm để thêm các request cần đợi refresh token
const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

// Hàm để thông báo rằng token đã được làm mới
const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
};

// Thêm interceptor để xử lý request trước khi gửi
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401) {
            const message = error.response.data.message;

            // Nếu refresh token không hợp lệ hoặc thiếu
            if (message === "token is required!") {
                // Xóa token và chuyển hướng đến trang đăng nhập
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
                return Promise.reject(error);
            }

            // Nếu là lỗi khác và cần làm mới token
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const refreshToken = localStorage.getItem("refresh_token");

                    if (!refreshToken) {
                        throw new Error("Refresh token is missing.");
                    }

                    // Gửi request làm mới token
                    const response = await api.post(
                        "/auth/refresh-token",
                        { token: refreshToken }, // Backend yêu cầu token trong payload
                        { withCredentials: true } // Nếu cần gửi cookie
                    );

                    // Nhận access token mới từ backend
                    const newToken = response.data.access_token;

                    // Lưu token mới vào localStorage
                    localStorage.setItem("access_token", newToken);

                    // Gọi lại tất cả các request đang chờ
                    onRefreshed(newToken);
                } catch (refreshError) {
                    // Nếu làm mới token thất bại, chuyển hướng đến trang đăng nhập
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // Đợi token mới
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);



export default api;
