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
import PageHeader from '../../layout/PageHeader';

const QuanLyMonHoc = () => {
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [openSubjectForm, setOpenSubjectForm] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [heDaoTaoFilter, setHeDaoTaoFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const role = localStorage.getItem("role") || "";

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
    setPage(0);
  }, [subjects, curriculums, heDaoTaoFilter]);

  const handleHeDaoTaoFilterChange = (event) => {
    setHeDaoTaoFilter(event.target.value);
  };

  // Cột DataGrid, loại bỏ cột "Thao tác" nếu role == examination
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
    { field: 'ghi_chu', headerName: 'Ghi chú', width: 250, flex: 1 },
    ...(role !== 'examination' ? [{
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
    }] : []),
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenSubjectForm = () => {
    if (role === 'examination') {
      setNotification({
        open: true,
        message: 'Bạn không có quyền thêm môn học!',
        severity: 'warning',
      });
      return;
    }
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
    if (role === 'examination') {
      setNotification({
        open: true,
        message: 'Bạn không có quyền chỉnh sửa môn học!',
        severity: 'warning',
      });
      return;
    }
    setCurrentSubject(subject);
    setOpenSubjectForm(true);
  };

  const handleSubjectSubmit = async (subject) => {
    if (role === 'examination') {
      setNotification({
        open: true,
        message: 'Bạn không có quyền thực hiện thao tác này!',
        severity: 'warning',
      });
      return;
    }
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
            <PageHeader title="Quản lý môn học" />
            {role !== 'examination' && (
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenSubjectForm}>
                Thêm môn học
              </Button>
            )}
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
                pageSizeOptions={[15,25, 50]}
                rowCount={filteredSubjects.length}
                paginationMode="client"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(newModel) => {
                  setPage(newModel.page);
                  setPageSize(newModel.pageSize);
                }}
                disableRowSelectionOnClick
                loading={loading}
                autoHeight
                sx={{
                  width: '100%',
                  '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
                }}
              />
            </Box>
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <MonHocTheoHeDaoTao
          />
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <ThoiKhoaBieu />
        </Paper>
      )}

      {role !== 'examination' && (
        <MonHocForm
          open={openSubjectForm}
          onClose={handleCloseSubjectForm}
          subject={currentSubject}
          onSubmit={handleSubjectSubmit}
          curriculums={curriculums}
        />
      )}

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