import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import PrivateRoute from "./setPermiss/PrivateRoute";
import AdminManage from "./components/manage/AdminManage";
import TrainingDashboard from "./components/Dashboard/TrainingDashboard";

const App = () => {
  // Lấy role từ localStorage khi khởi động
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // Hàm xử lý đăng nhập (set role và lưu vào localStorage)
  const handleLogin = (role) => {
    setRole(role);
    localStorage.setItem("role", role); // Lưu role vào localStorage
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            !role ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to={`/${role}/dashboard`} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        {/* Thêm route admin/manage */}
        <Route
          path="/admin/manage"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <AdminManage /> {/* Hiển thị component admin manage */}
            </PrivateRoute>
          }
        />
        <Route
          path="/sv/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["sv"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/training/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["training"]}>
              <TrainingDashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
