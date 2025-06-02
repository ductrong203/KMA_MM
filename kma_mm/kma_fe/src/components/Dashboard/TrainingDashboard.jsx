import BarChartIcon from "@mui/icons-material/BarChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PrintIcon from "@mui/icons-material/Print";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import {
  AppBar,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import StudentManagement from '../QLHV/StudentManagement ';
import ClassManagement from '../LOP/ClassManagement';
import QuanLyKhoa from '../Khoa/QuanLyKhoa';
import QuanLyLop from '../LOP/ClassManagement';
import QuanLyDaoTao from '../Dao Tao/QuanLyDaoTao';
import QuanLyMonHoc from '../Mon Hoc/QuanLyMonHoc';
import DieuKienTotNghiep from '../Dao Tao/DieuKienTotNghiep';
import QuanLyBangCap from '../Dao Tao/QuanLyBangCap';
import ThoiKhoaBieu from "../ThoiKhoaBieu/ThoiKhoaBieu";
import QuanLyKhenKyLuat from "../QLHV/khen_kyLuat";
import PhuLucBangDiem from "../Dao Tao/PhuLucBangDiem";
import ThongKeTotNghiep from "../Dao Tao/ThongKe";
import QuanLyChungChi from "../QuanLyChungChi/QuanLyChungChi";
import ThongKe from "../Dao Tao/ThongKe";
import XemDanhSachDiem from "../Diem/XemDanhSachDiem";


// Mock data
const trainerInfo = {
  name: "Nguyễn Văn A",
  id: "DT001",
};
const mockStudents = [
  {
    id: 1,
    code: "SV001",
    name: "Nguyễn Văn A",
    class: "LT01",
    status: "active",
    credits: 120,
    gpa: 3.2,
    graduationStatus: "eligible",
    hasDegree: false,
  },
  {
    id: 2,
    code: "SV002",
    name: "Trần Thị B",
    class: "LT01",
    status: "active",
    credits: 115,
    gpa: 3.5,
    graduationStatus: "eligible",
    hasDegree: true,
  },
];

function TrainingDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [subTab, setSubTab] = useState(0); // State cho tab con

  const [openAddClass, setOpenAddClass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [openAddStudent, setOpenAddStudent] = useState(false);
  const [openGraduationCheck, setOpenGraduationCheck] = useState(false);
  const [openDegreeIssue, setOpenDegreeIssue] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSubTab(0); // Reset tab con về 0 khi chuyển tab chính
  };
  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };
  const graduationSteps = ['Kiểm tra điều kiện', 'Xét duyệt', 'Hoàn thành'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("access_token");
    console.log("Logging out...");
    window.location.href = "/login";
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      <Container maxWidth="" sx={{ py: 4 }}>
        <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          {/* Tab chính */}
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
                color: 'primary.main',
                textTransform: 'uppercase',
                padding: '12px 24px',
              },
              '& .Mui-selected': {
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Tab label="Quản lý đào tạo" />
            <Tab label="Quản lý học viên" />
            <Tab label="Quản lý môn học" />
            <Tab label="Thống kê và báo cáo" />
            <Tab label="Xem danh sách điểm" />
          </Tabs>

          {currentTab === 0 && (
            <Box>
              {/* Tab con */}
              <Tabs
                value={subTab}
                onChange={handleSubTabChange}
                sx={{
                  mb: 2,
                  '& .MuiTab-root': {
                    fontWeight: 'normal',
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    padding: '8px 16px',
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Tab label="Hệ đào tạo" />
                <Tab label="Quản lý khóa đào tạo" />
                <Tab label="Quản lý lớp học" />
              </Tabs>
              {subTab === 0 && <QuanLyDaoTao />}
              {subTab === 1 && <QuanLyKhoa />}
              {subTab === 2 && <QuanLyLop />}
            </Box>
          )}

          {currentTab === 1 && (
            <Box>
              <Tabs value={subTab} onChange={handleSubTabChange}>
                <Tab label="Danh sách học viên" />
                <Tab label="Xét tốt nghiệp" />
                <Tab label="Quản lý bằng cấp" />
                <Tab label="Quản lý danh mục khen thưởng" />
                <Tab label="Quản lý chứng chỉ" />
              </Tabs>
              {subTab === 0 && <StudentManagement />}
              {subTab === 1 && <DieuKienTotNghiep />}
              {subTab === 2 && <QuanLyBangCap />}
              {subTab === 3 && < QuanLyKhenKyLuat />}
              {subTab === 4 && < QuanLyChungChi />}
            </Box>
          )}

          {currentTab === 2 && (
            <QuanLyMonHoc />
          )}
          {currentTab === 3 && (
            <Box>
              <Tabs value={subTab} onChange={handleSubTabChange}>
                <Tab label="Phụ lục văn bằng" />
                <Tab label="Thống kê" />
                <Tab label="Báo cáo chi tiết" />
              </Tabs>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {subTab === 0 && <PhuLucBangDiem />}
                {subTab === 1 && <ThongKe />}
              </Grid>
            </Box>
          )}
          {currentTab === 4 && (
            <XemDanhSachDiem />
          )}
        </Paper>

        {/* Add Student Dialog */}
        <Dialog
          open={openAddStudent}
          onClose={() => setOpenAddStudent(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Thêm Học viên mới</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField label="Họ và tên" fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Ngày sinh"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="CCCD" fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Lớp</InputLabel>
                  <Select label="Lớp">
                    <MenuItem value="LT01">LT01</MenuItem>
                    <MenuItem value="LT02">LT02</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Địa chỉ" fullWidth multiline rows={2} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddStudent(false)}>Hủy</Button>
            <Button variant="contained">Thêm</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default TrainingDashboard;
