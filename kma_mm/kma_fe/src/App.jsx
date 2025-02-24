import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import PrivateRoute from "./setPermiss/PrivateRoute";

import Layout from "./layout/Layout";
import TrainingDashboard from "./components/Dashboard/TrainingDashboard";
// Các component chức năng admin
import AddAccount from "./components/admin/AddAccount";
import ManageAccounts from "./components/admin/ManageAccounts";
import AssignRoles from "./components/admin/AssignRoles";
import ActivityLogs from "./components/admin/ActivityLogs";
import DeleteAccount from "./components/admin/DeleteAccount";
import ExamDashboard from "./components/Dashboard/ExaminationDashboard";

import DirectorDashboard from "./components/Dashboard/DirectorDashboard";
import LibraryDashBoard from "./components/Dashboard/LibraryDashboard";
import { getDetailUserById } from "./Api_controller/Service/authService";
import UserInfo from "./components/Infor/UserInfor";
import StudentManagement from "./components/Dashboard/StudentManageDashboard";
import StudentManagementDashboard from "./components/Dashboard/StudentManageDashboard";
import ManageObjects from "./components/admin/ManageObject";

import ManageDepartments from "./components/admin/ManageDepartment";
import FormGiangVien from "./components/admin/TeacherForm";
import QuanLyGiangViens from "./components/admin/QuanlyGiangVien";


const App = () => {
  // Lấy role từ localStorage khi khởi động
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [info, setInfo] = useState({
    name: "Nguyễn Văn A",
    id: "T1001",
  });
  const handleLogin = async (role) => {
    if (!role) {
      // Redirect to login if role is empty (logout scenario)
      window.location.href = "/login";
      return;
    }
    try {
      let id = localStorage.getItem("id");
      const response = await getDetailUserById(id); //
      console.log(response.data);
      setInfo(response.data);
    } catch (e) {
      throw e;
    }
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
              <Layout Info={info} title="Admin Dashboard">
                <AdminDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Route thêm tài khoản */}
        <Route
          path="/admin/add-account"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <AddAccount />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Route quản lý tài khoản */}
        <Route
          path="/admin/manage-accounts"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <ManageAccounts />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Route quản lý đối tượng */}
        <Route
          path="/admin/manage-objects"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <ManageObjects />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Route phân quyền */}
        <Route
          path="/admin/assign-roles"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <AssignRoles />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Route nhật ký hoạt động */}
        <Route
          path="/admin/activity-logs"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <ActivityLogs />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Route xóa tài khoản */}
        <Route
          path="/admin/departments"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <ManageDepartments />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/teacher-management"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <QuanLyGiangViens />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/delete-account"
          element={
            <PrivateRoute role={role} allowedRoles={["admin"]}>
              <Layout Info={info} title="Admin Dashboard">
                <DeleteAccount />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/sv/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["sv"]}>
              <Layout Info={info} title="HỆ THỐNG QUẢN LÝ SINH VIÊN">
                <StudentDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/training/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["training"]}>
              <Layout Info={info} title="HỆ QUẢN LÝ ĐÀO TẠO">
                <TrainingDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/examination/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["examination"]}>
              <Layout Info={info} title="HỆ QUẢN LÝ KHẢO THÍ">
                <ExamDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/director/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["director"]}>
              <Layout Info={info} title="Director dashboard">
                <DirectorDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path={`/${role}/info`}
          element={
            <PrivateRoute role={role} allowedRoles={[`${role}`]}>
              <Layout Info={info} title="Library dashboard">
                <UserInfo />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/library/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["library"]}>
              <Layout Info={info} title="Library dashboard">
                <LibraryDashBoard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/student_manage/dashboard"
          element={
            <PrivateRoute role={role} allowedRoles={["student_manage"]}>
              <Layout Info={info} title="Quản lý học viên">
                <StudentManagementDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
