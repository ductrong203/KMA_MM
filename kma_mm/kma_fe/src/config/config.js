const config = {

    baseUrl: "http://localhost:8000", // URL cơ bản của server


    timeout: 10000,                    // Thời gian chờ tối đa
    environment: process.env.NODE_ENV, // Môi trường (development, production)
    apiVersion: "v1",                  // Phiên bản API (nếu cần)
};

export default config;
