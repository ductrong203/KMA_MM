import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Mock data cho demo
const initialSubjects = [
  { id: 1, subjectCode: 'ITEC101', subjectName: 'Nhập môn lập trình', credits: 3, note: 'Môn cơ sở', countInGPA: true },
  { id: 2, subjectCode: 'ITEC201', subjectName: 'Cấu trúc dữ liệu', credits: 4, note: 'Môn nâng cao', countInGPA: true },
  { id: 3, subjectCode: 'PHED101', subjectName: 'Thể dục', credits: 1, note: 'Môn bắt buộc', countInGPA: false },
];

const initialCurriculums = [
  { id: 1, name: 'Đại học chính quy' },
  { id: 2, name: 'Cao đẳng' },
  { id: 3, name: 'Liên thông' },
];

const initialSubjectMapping = [
  { id: 1, subjectId: 1, curriculumId: 1, semester: 1 },
  { id: 2, subjectId: 1, curriculumId: 2, semester: 1 },
  { id: 3, subjectId: 2, curriculumId: 1, semester: 3 },
  { id: 4, subjectId: 3, curriculumId: 1, semester: 1 },
];

const QuanLyMonHoc = () => {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [curriculums, setCurriculums] = useState(initialCurriculums);
  const [subjectMappings, setSubjectMappings] = useState(initialSubjectMapping);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMappingDialog, setOpenMappingDialog] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentMapping, setCurrentMapping] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);

  // Định nghĩa cột cho DataGrid môn học
  const subjectColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'subjectCode', headerName: 'Mã môn học', width: 130 },
    { field: 'subjectName', headerName: 'Tên môn học', width: 200 },
    { field: 'credits', headerName: 'Số tín chỉ', width: 120 },
    { field: 'countInGPA', headerName: 'Tính điểm TBT', width: 140, renderCell: (params) => params.value ? 'Có' : 'Không' },
    { field: 'note', headerName: 'Ghi chú', width: 150 },
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
          <IconButton onClick={() => handleDeleteSubject(params.row.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Định nghĩa cột cho DataGrid ánh xạ môn học với chương trình đào tạo
  const mappingColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'subjectId', 
      headerName: 'Môn học', 
      width: 200,
      valueGetter: (params) => {
        const subject = subjects.find(s => s.id === params.value);
        return subject ? subject.subjectName : '';
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

  // Xử lý đóng/mở dialog môn học
  const handleOpenDialog = () => {
    setCurrentSubject({
      id: null,
      subjectCode: '',
      subjectName: '',
      credits: 0,
      note: '',
      countInGPA: true
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Xử lý đóng/mở dialog ánh xạ
  const handleOpenMappingDialog = () => {
    setCurrentMapping({
      id: null,
      subjectId: '',
      curriculumId: '',
      semester: 1
    });
    setOpenMappingDialog(true);
  };

  const handleCloseMappingDialog = () => {
    setOpenMappingDialog(false);
  };

  // Các hàm xử lý cho môn học
  const handleAddSubject = () => {
    const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    const newSubject = {
      ...currentSubject,
      id: currentSubject.id || newId
    };

    if (currentSubject.id) {
      // Cập nhật
      setSubjects(subjects.map(s => s.id === currentSubject.id ? newSubject : s));
      setNotification({ open: true, message: 'Cập nhật môn học thành công!', severity: 'success' });
    } else {
      // Thêm mới
      setSubjects([...subjects, newSubject]);
      setNotification({ open: true, message: 'Thêm môn học thành công!', severity: 'success' });
    }
    handleCloseDialog();
  };

  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setOpenDialog(true);
  };

  const handleDeleteSubject = (id) => {
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
    
    setSubjects(subjects.filter(s => s.id !== id));
    setNotification({ open: true, message: 'Xóa môn học thành công!', severity: 'success' });
  };

  // Các hàm xử lý cho ánh xạ môn học
  const handleAddMapping = () => {
    const newId = subjectMappings.length > 0 ? Math.max(...subjectMappings.map(m => m.id)) + 1 : 1;
    const newMapping = {
      ...currentMapping,
      id: currentMapping.id || newId
    };

    if (currentMapping.id) {
      // Cập nhật
      setSubjectMappings(subjectMappings.map(m => m.id === currentMapping.id ? newMapping : m));
      setNotification({ open: true, message: 'Cập nhật ánh xạ thành công!', severity: 'success' });
    } else {
      // Thêm mới
      setSubjectMappings([...subjectMappings, newMapping]);
      setNotification({ open: true, message: 'Thêm ánh xạ thành công!', severity: 'success' });
    }
    handleCloseMappingDialog();
  };

  const handleEditMapping = (mapping) => {
    setCurrentMapping(mapping);
    setOpenMappingDialog(true);
  };

  const handleDeleteMapping = (id) => {
    setSubjectMappings(subjectMappings.filter(m => m.id !== id));
    setNotification({ open: true, message: 'Xóa ánh xạ thành công!', severity: 'success' });
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
              onClick={handleOpenDialog}
            >
              Thêm môn học
            </Button>
          </Box>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={subjects}
              columns={subjectColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              disableSelectionOnClick
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
              onClick={handleOpenMappingDialog}
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
            />
          </Box>
        </Paper>
      )}

      {/* Dialog thêm/sửa môn học */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentSubject && currentSubject.id ? 'Cập nhật môn học' : 'Thêm môn học mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              label="Mã môn học"
              fullWidth
              value={currentSubject ? currentSubject.subjectCode : ''}
              onChange={(e) => setCurrentSubject({...currentSubject, subjectCode: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Tên môn học"
              fullWidth
              value={currentSubject ? currentSubject.subjectName : ''}
              onChange={(e) => setCurrentSubject({...currentSubject, subjectName: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Số tín chỉ"
              type="number"
              fullWidth
              value={currentSubject ? currentSubject.credits : 0}
              onChange={(e) => setCurrentSubject({...currentSubject, credits: parseInt(e.target.value)})}
            />
            <TextField
              margin="dense"
              label="Ghi chú"
              fullWidth
              multiline
              rows={2}
              value={currentSubject ? currentSubject.note : ''}
              onChange={(e) => setCurrentSubject({...currentSubject, note: e.target.value})}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentSubject ? currentSubject.countInGPA : true}
                  onChange={(e) => setCurrentSubject({...currentSubject, countInGPA: e.target.checked})}
                />
              }
              label="Tính vào điểm trung bình chung"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleAddSubject} variant="contained" color="primary">
            {currentSubject && currentSubject.id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm/sửa ánh xạ */}
      <Dialog open={openMappingDialog} onClose={handleCloseMappingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentMapping && currentMapping.id ? 'Cập nhật ánh xạ' : 'Thêm ánh xạ mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Môn học</InputLabel>
              <Select
                value={currentMapping ? currentMapping.subjectId : ''}
                label="Môn học"
                onChange={(e) => setCurrentMapping({...currentMapping, subjectId: e.target.value})}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.subjectCode} - {subject.subjectName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Chương trình đào tạo</InputLabel>
              <Select
                value={currentMapping ? currentMapping.curriculumId : ''}
                label="Chương trình đào tạo"
                onChange={(e) => setCurrentMapping({...currentMapping, curriculumId: e.target.value})}
              >
                {curriculums.map((curriculum) => (
                  <MenuItem key={curriculum.id} value={curriculum.id}>
                    {curriculum.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Học kỳ"
              type="number"
              fullWidth
              value={currentMapping ? currentMapping.semester : 1}
              onChange={(e) => setCurrentMapping({...currentMapping, semester: parseInt(e.target.value)})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMappingDialog}>Hủy</Button>
          <Button onClick={handleAddMapping} variant="contained" color="primary">
            {currentMapping && currentMapping.id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

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