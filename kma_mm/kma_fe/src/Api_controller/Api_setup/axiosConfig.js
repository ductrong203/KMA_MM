import axios from "axios";
import config from "../../config/config";

const api = axios.create({
    baseURL: `${config.baseUrl}`, // URL cơ bản của API
    timeout: 10000, // Thời gian chờ tối đa (ms)
    headers: {
        "Content-Type": "application/json", // Header mặc định
    },
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

// Thêm interceptor để xử lý response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401) {
            // Nếu chưa làm mới token
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Gửi request làm mới token
                    const response = await axios.post(
                        `${config.baseUrl}/auth/refresh-token`,
                        {}, // Không cần payload, vì refresh_token ở trong cookie
                        { withCredentials: true } // Gửi cookie với request
                    );

                    if (response.data.message === "token is required!") {
                        throw new Error("Refresh token is invalid or expired.");
                    }

                    const newToken = response.data.access_token;

                    // Lưu token mới vào localStorage
                    localStorage.setItem("access_token", newToken);

                    // Thông báo tất cả các request đang chờ
                    onRefreshed(newToken);
                } catch (refreshError) {
                    // Nếu làm mới token thất bại, chuyển hướng đến login
                    localStorage.removeItem("access_token");
                    localStorage.clear();
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // Đợi token được làm mới
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
