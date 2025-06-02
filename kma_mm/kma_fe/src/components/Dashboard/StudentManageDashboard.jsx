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
import XemDanhSachDiem from "../Diem/XemDanhSachDiem";
import MonHocTheoHeDaoTao from "../Mon Hoc/MonHocTheoHeDaoTao";
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
          
          <Tab label="Quản lý học viên" />
          <Tab label="Xem danh sách môn học dự kiến" />
          <Tab label="Khen thưởng/ kỷ luật " />
          <Tab label="Đơn từ học viên" />
          <Tab label="Biểu mẫu" />
          <Tab label="Xem danh sách điểm" />
          <Tab label="Thống kê báo cáo " />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
  
        {value === 0 && <StudentManagement />}
        {value === 1 && <MonHocTheoHeDaoTao />}
        {value === 2 && <QuanLyKhenKyLuat />}

        {value === 3 && <StudentRequests />}

        {value === 4 && <ReportForms />}
        {value === 5 && <XemDanhSachDiem />}
        {value === 6 && <StatisticsReport />}
      </Box>
    </Container>
  );
}
