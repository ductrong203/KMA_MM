import React, { useState } from "react";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  AppBar,
  Container,
  Button,
  Grid,
  Paper,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import StudentManagement from "../QLHV/StudentManagement ";
import StudentRequests from "../QLHV/StudentRequest";
import ReportForms from "../QLHV/ReportForm";
import ScoreManagement from "../QLHV/ScoreManagement";
import StatisticsReport from "../QLHV/StatisticsReport";
import QuanLyKhoa from "../Khoa/QuanLyKhoa";
import QuanLyLop from "../LOP/ClassManagement";
import QuanLyDaoTao from "../Dao Tao/QuanLyDaoTao";
import QuanLyKhenKyLuat from "../QLHV/khen_kyLuat";
// Mock data
const mockTrainingTypes = [
  { id: 1, code: "HT001", name: "Hệ Đào Tạo A", active: true },
  { id: 2, code: "HT002", name: "Hệ Đào Tạo B", active: false },
];

const mockClasses = [
  { id: 1, code: "L001", students: 30 },
  { id: 2, code: "L002", students: 25 },
];

// Component for each tab's content
function SectionContent({ title, children }) {
  return (
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: "8px", boxShadow: 2 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", marginBottom: "1rem" }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function StudentManagementDashboard() {
  const [value, setValue] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [openAddTraining, setOpenAddTraining] = useState(false);
  const [openAddClass, setOpenAddClass] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleTabChange = (event, newTab) => {
    setCurrentTab(newTab);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 5 }}>
      <Paper position="sticky">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Quản lý học viên"
          // indicatorColor="secondary"
          textColor="inherit"
          centered
        >
          <Tab label="Hệ đào tạo" />
          <Tab label="Quản lý khóa  " />
          <Tab label="Quản lý lớp " />
          <Tab label="Quản lý học viên" />
          <Tab label="Khen thưởng/ kỷ luật " />
          <Tab label="Đơn từ học viên" />
          <Tab label="Biểu mẫu & xuất dữ liệu" />
          <Tab label="Quản lý điểm số" />
          <Tab label="Thống kê báo cáo " />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {value === 0 && <QuanLyDaoTao />}

        {value === 1 && <QuanLyKhoa />}

        {value === 2 && <QuanLyLop />}
        {value === 3 && <StudentManagement />}
        {value === 4 && <QuanLyKhenKyLuat />}

        {value === 5 && <StudentRequests />}

        {value === 6 && <ReportForms />}
        {value === 7 && <ScoreManagement />}
        {value === 8 && <StatisticsReport />}
      </Box>
    </Container>
  );
}
