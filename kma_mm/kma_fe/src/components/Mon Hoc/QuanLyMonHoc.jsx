import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ThoiKhoaBieu from '../ThoiKhoaBieu/ThoiKhoaBieu';
import MonHocForm from './MonHocForm';
import MonHocTheoHeDaoTao from './MonHocTheoHeDaoTao';
import { createMonHoc, getMonHoc, updateMonHoc } from '../../Api_controller/Service/monHocService';

const QuanLyMonHoc = () => {
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [subjectMappings, setSubjectMappings] = useState([]);
  const [openSubjectForm, setOpenSubjectForm] = useState(false);
  const [openMappingForm, setOpenMappingForm] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentMapping, setCurrentMapping] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, curriculumsRes, mappingsRes] = await Promise.all([
        getMonHoc(),
      ]);

      setSubjects(subjectsRes);
      // setCurriculums(curriculumsRes);
      // setSubjectMappings(mappingsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tải dữ liệu: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  console.log(subjects)
  // Định nghĩa cột cho DataGrid môn học
  const subjectColumns = [
    { field: 'ma_mon_hoc', headerName: 'Mã môn học', width: 130 },
    { field: 'ten_mon_hoc', headerName: 'Tên môn học', width: 260 },
    { field: 'so_tin_chi', headerName: 'Số tín chỉ', width: 120 },
    { field: 'tinh_diem', headerName: 'Tính điểm TBC', width: 140, renderCell: (params) => params.value ? 'Có' : 'Không' },
    { field: 'ghi_chu', headerName: 'Ghi chú', width: 250 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
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

  // Định nghĩa cột cho DataGrid ánh xạ môn học với chương trình đào tạo
  const mappingColumns = [
    {
      field: 'ma_mon_hoc',
      headerName: 'Môn học',
      width: 200,
      valueGetter: (params) => {
        const subject = subjects.find(s => s.id === params.value);
        return subject ? subject.ten_mon_hoc : '';
      }
    },
    {
      field: 'curriculumId',
      headerName: 'Chương trình đào tạo',
      width: 200,
      valueGetter: (params) => {
        const curriculum = curriculums.find(c => c.id === params.value);
        return curriculum ? curriculum.name : '';
      }
    },
    { field: 'semester', headerName: 'Học kỳ', width: 100 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEditMapping(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteMapping(params.row.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Xử lý đóng/mở form môn học
  const handleOpenSubjectForm = () => {
    setCurrentSubject({
      ma_mon_hoc: '',
      ten_mon_hoc: '',
      so_tin_chi: 0,
      ghi_chu: '',
      tinh_diem: true
    });
    setOpenSubjectForm(true);
  };

  const handleCloseSubjectForm = () => {
    setOpenSubjectForm(false);
  };

  // Xử lý đóng/mở form ánh xạ
  const handleOpenMappingForm = () => {
    setCurrentMapping({
      subjectId: '',
      curriculumId: '',
      semester: 1
    });
    setOpenMappingForm(true);
  };

  const handleCloseMappingForm = () => {
    setOpenMappingForm(false);
  };

  // Các hàm xử lý cho môn học
  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setOpenSubjectForm(true);
  };

  const handleDeleteSubject = async (id) => {
    try {
      // Kiểm tra xem môn học có đang được sử dụng trong mapping không
      const isUsed = subjectMappings.some(mapping => mapping.subjectId === id);
      if (isUsed) {
        setNotification({
          open: true,
          message: 'Không thể xóa môn học này vì đang được sử dụng trong chương trình đào tạo!',
          severity: 'error'
        });
        return;
      }

      await axios.delete(`/api/subjects/${id}`);
      setSubjects(subjects.filter(s => s.id !== id));
      setNotification({ open: true, message: 'Xóa môn học thành công!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting subject:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi xóa môn học: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Các hàm xử lý cho ánh xạ môn học
  const handleEditMapping = (mapping) => {
    setCurrentMapping(mapping);
    setOpenMappingForm(true);
  };

  const handleDeleteMapping = async (id) => {
    try {
      await axios.delete(`/api/subject-mappings/${id}`);
      setSubjectMappings(subjectMappings.filter(m => m.id !== id));
      setNotification({ open: true, message: 'Xóa ánh xạ thành công!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting mapping:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi xóa ánh xạ: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Xử lý thêm/cập nhật môn học từ component con
  const handleSubjectSubmit = async (subject) => {
    try {
      console.log(subject);
      let response;

      if (subject.id) {
        // Cập nhật
        response = await updateMonHoc(subject.id,subject)
        setSubjects(subjects.map(s => s.id === subject.id ? response.data : s));
        setNotification({ open: true, message: 'Cập nhật môn học thành công!', severity: 'success' });
      } else {
        // Thêm mới
        response = await createMonHoc(subject); // Add await here

        // Make sure the response data has an id
        const newSubject = {
          ...response.data,
          id: response.data.id
        };

        setSubjects([...subjects, newSubject]);
        setNotification({ open: true, message: 'Thêm môn học thành công!', severity: 'success' });
      }

      handleCloseSubjectForm();
    } catch (error) {
      console.error('Error saving subject:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi lưu môn học: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  // Xử lý thêm/cập nhật ánh xạ từ component con
  const handleMappingSubmit = async (mapping) => {
    try {
      let response;
      if (mapping.id) {
        // Cập nhật
        response = await axios.put(`/api/subject-mappings/${mapping.id}`, mapping);
        setSubjectMappings(subjectMappings.map(m => m.id === mapping.id ? response.data : m));
        setNotification({ open: true, message: 'Cập nhật ánh xạ thành công!', severity: 'success' });
      } else {
        // Thêm mới
        response = await axios.post('/api/subject-mappings', mapping);
        setSubjectMappings([...subjectMappings, response.data]);
        setNotification({ open: true, message: 'Thêm ánh xạ thành công!', severity: 'success' });
      }
      handleCloseMappingForm();
    } catch (error) {
      console.error('Error saving mapping:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi lưu ánh xạ: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Xử lý đóng thông báo
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Danh sách môn học" />
          <Tab label="Phân bổ môn học theo CTĐT" />
          <Tab label="Thời khóa biểu " />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Danh sách môn học</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenSubjectForm}
            >
              Thêm môn học
            </Button>
          </Box>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={subjects}
              getRowId={(row) => row.id}
              columns={subjectColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              loading={loading}
            />
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Phân bổ môn học theo chương trình đào tạo</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenMappingForm}
            >
              Thêm ánh xạ
            </Button>
          </Box>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={subjectMappings}
              columns={mappingColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              disableSelectionOnClick
              loading={loading}
            />
          </Box>
        </Paper>
      )}
      {tabValue === 2 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <ThoiKhoaBieu />
        </Paper>
      )}

      {/* Component Form thêm/sửa môn học */}
      <MonHocForm
        open={openSubjectForm}
        onClose={handleCloseSubjectForm}
        subject={currentSubject}
        onSubmit={handleSubjectSubmit}
      />

      {/* Component Form thêm/sửa ánh xạ */}
      <MonHocTheoHeDaoTao
        open={openMappingForm}
        onClose={handleCloseMappingForm}
        mapping={currentMapping}
        subjects={subjects}
        curriculums={curriculums}
        onSubmit={handleMappingSubmit}
      />

      {/* Snackbar thông báo */}
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