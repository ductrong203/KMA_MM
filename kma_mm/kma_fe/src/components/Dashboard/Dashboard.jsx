// src/components/Dashboard.jsx
import React from "react";

const Dashboard = ({ role }) => {
    const features = {
        sinh_vien: [
            "Xem điểm",
            "Xem thời khóa biểu",
            "Xin nghỉ phép",
            "Xem thông tin cá nhân",
        ],
        admin: ["Tùy chỉnh website", "Thêm cán bộ", "Xem file log"],
        kho_thi: ["Nhập điểm", "Xuất điểm", "Thống kê"],
        dao_tao: ["Xét tốt nghiệp", "Cấp bằng", "Nhập thông tin học viên"],
        quan_ly: ["Duyệt đơn", "Cảnh báo học tập", "Thống kê"],
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Bảng điều khiển ({role})</h1>
            <ul>
                {features[role].map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
