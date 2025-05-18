import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import ThoiKhoaBieu from '../ThoiKhoaBieu/ThoiKhoaBieu';
import MonHocForm from './MonHocForm';
import MonHocTheoHeDaoTao from './MonHocTheoHeDaoTao';
import { createMonHoc, getMonHoc, updateMonHoc } from '../../Api_controller/Service/monHocService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';

// Mock data (giữ nguyên)
const curriculumsMock = [
  { id: 'CUR001', name: 'Kỹ thuật phần mềm', code: 'KTPM', totalCredits: 145 },
  { id: 'CUR002', name: 'Khoa học máy tính', code: 'KHMT', totalCredits: 140 },
  { id: 'CUR003', name: 'Hệ thống thông tin', code: 'HTTT', totalCredits: 142 },
  { id: 'CUR004', name: 'An toàn thông tin', code: 'ATTT', totalCredits: 146 },
];

const batches = [
  { id: 'BAT001', name: 'K18 (2020-2024)', startYear: 2020, endYear: 2024, curriculumId: 'CUR001' },
  { id: 'BAT002', name: 'K19 (2021-2025)', startYear: 2021, endYear: 2025, curriculumId: 'CUR001' },
  { id: 'BAT003', name: 'K20 (2022-2026)', startYear: 2022, endYear: 2026, curriculumId: 'CUR001' },
  { id: 'BAT004', name: 'K18 (2020-2024)', startYear: 2020, endYear: 2024, curriculumId: 'CUR002' },
  { id: 'BAT005', name: 'K19 (2021-2025)', startYear: 2021, endYear: 2025, curriculumId: 'CUR002' },
  { id: 'BAT006', name: 'K18 (2020-2024)', startYear: 2020, endYear: 2024, curriculumId: 'CUR003' },
  { id: 'BAT007', name: 'K19 (2021-2025)', startYear: 2021, endYear: 2025, curriculumId: 'CUR003' },
  { id: 'BAT008', name: 'K18 (2020-2024)', startYear: 2020, endYear: 2024, curriculumId: 'CUR004' },
];

const subjectsMock = [
  { id: 'SUB001', subjectCode: 'CSE101', subjectName: 'Nhập môn lập trình', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB002', subjectCode: 'CSE102', subjectName: 'Cấu trúc dữ liệu và giải thuật', credits: 4, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB003', subjectCode: 'CSE201', subjectName: 'Lập trình hướng đối tượng', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB004', subjectCode: 'CSE202', subjectName: 'Cơ sở dữ liệu', credits: 4, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB005', subjectCode: 'CSE301', subjectName: 'Phát triển ứng dụng web', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB006', subjectCode: 'CSE302', subjectName: 'Phát triển ứng dụng di động', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB007', subjectCode: 'CSE401', subjectName: 'Trí tuệ nhân tạo', credits: 4, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB008', subjectCode: 'CSE402', subjectName: 'Học máy', credits: 4, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB009', subjectCode: 'MAT101', subjectName: 'Toán cao cấp', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB010', subjectCode: 'MAT201', subjectName: 'Xác suất thống kê', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB011', subjectCode: 'ENG101', subjectName: 'Tiếng Anh chuyên ngành 1', credits: 2, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB012', subjectCode: 'ENG102', subjectName: 'Tiếng Anh chuyên ngành 2', credits: 2, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB013', subjectCode: 'NET301', subjectName: 'Mạng máy tính', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB014', subjectCode: 'SEC301', subjectName: 'An toàn thông tin', credits: 3, curriculumIds: ['CUR001', 'CUR002'] },
  { id: 'SUB015', subjectCode: 'CSE403', subjectName: 'Đồ án tốt nghiệp', credits: 10, curriculumIds: ['CUR001', 'CUR002'] },
];

const QuanLyMonHoc = () => {
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [subjectMappings, setSubjectMappings] = useState([]);
  const [openSubjectForm, setOpenSubjectForm] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [heDaoTaoFilter, setHeDaoTaoFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subjectsRes = await getMonHoc();
      setSubjects(subjectsRes);
      const curriculumsRes = await fetchDanhSachHeDaoTao();
      setCurriculums(curriculumsRes);
      setFilteredSubjects(subjectsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tải dữ liệu: ' + error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!heDaoTaoFilter) {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter((subject) => {
        const curriculum = curriculums.find((c) => c.id === subject.he_dao_tao_id);
        return curriculum && curriculum.ten_he_dao_tao.toLowerCase().includes(heDaoTaoFilter.toLowerCase());
      });
      setFilteredSubjects(filtered);
    }
    setPage(0); // Reset về trang đầu khi lọc thay đổi
  }, [subjects, curriculums, heDaoTaoFilter]);

  const handleHeDaoTaoFilterChange = (event) => {
    setHeDaoTaoFilter(event.target.value);
  };

  const subjectColumns = [
    { field: 'ma_mon_hoc', headerName: 'Mã môn học', width: 100 },
    { field: 'ten_mon_hoc', headerName: 'Tên môn học', width: 200 },
    { field: 'so_tin_chi', headerName: 'Số tín chỉ', width: 80 },
    {
      field: 'he_dao_tao_id',
      headerName: 'Hệ đào tạo',
      width: 150,
      renderCell: (params) => {
        const curriculum = curriculums.find((c) => c.id === params.value);
        return curriculum ? curriculum.ten_he_dao_tao : params.value;
      },
    },
    { field: 'tinh_diem', headerName: 'Tính điểm TBC', width: 120, renderCell: (params) => (params.value ? 'Có' : 'Không') },
    { field: 'ghi_chu', headerName: 'Ghi chú', width: 250, flex: 1 }, // flex: 1 để mở rộng nếu cần
  {
      field: 'actions',
      headerName: 'Thao tác',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEditSubject(params.row)} color="primary">
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenSubjectForm = () => {
    setCurrentSubject({
      ma_mon_hoc: '',
      ten_mon_hoc: '',
      so_tin_chi: 0,
      ghi_chu: '',
      tinh_diem: true,
      curriculumIds: [],
    });
    setOpenSubjectForm(true);
  };

  const handleCloseSubjectForm = () => {
    setOpenSubjectForm(false);
  };

  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setOpenSubjectForm(true);
  };

  const handleSubjectSubmit = async (subject) => {
    try {
      let response;
      if (subject.id) {
        response = await updateMonHoc(subject.id, subject);
        setSubjects(subjects.map((s) => (s.id === subject.id ? response.data : s)));
        setNotification({ open: true, message: 'Cập nhật môn học thành công!', severity: 'success' });
      } else {
        response = await createMonHoc(subject);
        const newSubjects = response.data;
        setSubjects([...subjects, ...newSubjects]);
        setNotification({ open: true, message: 'Thêm môn học thành công!', severity: 'success' });
      }
      handleCloseSubjectForm();
      fetchData();
    } catch (error) {
      console.error('Error saving subject:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi lưu môn học: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
    }
  };

  const handleCurriculumMappingSubmit = async (mappingData) => {
    try {
      console.log('Saving curriculum mapping:', mappingData);
      setNotification({
        open: true,
        message: 'Cập nhật phân bổ môn học thành công!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving curriculum mapping:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi lưu phân bổ môn học: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Danh sách môn học" />
          <Tab label="Phân bổ môn học theo CTĐT" />
          <Tab label="Thời khóa biểu" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Danh sách môn học</Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenSubjectForm}>
              Thêm môn học
            </Button>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, width: '100%', px: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Lọc theo hệ đào tạo</InputLabel>
                <Select value={heDaoTaoFilter} label="Lọc theo hệ đào tạo" onChange={handleHeDaoTaoFilterChange}>
                  <MenuItem value="">Tất cả hệ đào tạo</MenuItem>
                  {curriculums.map((curriculum) => (
                    <MenuItem key={curriculum.id} value={curriculum.ten_he_dao_tao}>
                      {curriculum.ten_he_dao_tao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: '100%', px: 2 }}>
              <DataGrid
                rows={filteredSubjects}
                getRowId={(row) => row.id}
                columns={subjectColumns}
                pagination
                pageSizeOptions={[5, 10, 20]}
                rowCount={filteredSubjects.length}
                paginationMode="client"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(newModel) => {
                  setPage(newModel.page);
                  setPageSize(newModel.pageSize);
                }}
                disableRowSelectionOnClick
                loading={loading}
                autoHeight // Chiều cao tự động dựa trên số hàng
                sx={{
                  width: '100%',
                  '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' }, // Thanh cuộn ngang nếu cột vượt kích thước
                }}
              />
            </Box>
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <MonHocTheoHeDaoTao
            subjects={subjectsMock}
            curriculums={curriculumsMock}
            batches={batches}
            onSubmit={handleCurriculumMappingSubmit}
          />
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <ThoiKhoaBieu />
        </Paper>
      )}

      <MonHocForm
        open={openSubjectForm}
        onClose={handleCloseSubjectForm}
        subject={currentSubject}
        onSubmit={handleSubjectSubmit}
        curriculums={curriculums}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuanLyMonHoc;