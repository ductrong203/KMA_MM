// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import {
//   Alert,
//   Box,
//   Button,
//   IconButton,
//   Paper,
//   Snackbar,
//   Tab,
//   Tabs,
//   Typography
// } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import ThoiKhoaBieu from '../ThoiKhoaBieu/ThoiKhoaBieu';
// import MonHocForm from './MonHocForm';
// import MonHocTheoHeDaoTao from './MonHocTheoHeDaoTao';
// import { createMonHoc, getMonHoc, updateMonHoc } from '../../Api_controller/Service/monHocService';

// const subjectsMock = [
//   {
//     id: 'SUB001',
//     subjectCode: 'CSE101',
//     subjectName: 'Nhập môn lập trình',
//     credits: 3
//   },
//   {
//     id: 'SUB002',
//     subjectCode: 'CSE102',
//     subjectName: 'Cấu trúc dữ liệu và giải thuật',
//     credits: 4
//   },
//   {
//     id: 'SUB003',
//     subjectCode: 'CSE201',
//     subjectName: 'Lập trình hướng đối tượng',
//     credits: 3
//   },
//   {
//     id: 'SUB004',
//     subjectCode: 'CSE202',
//     subjectName: 'Cơ sở dữ liệu',
//     credits: 4
//   },
//   {
//     id: 'SUB005',
//     subjectCode: 'CSE301',
//     subjectName: 'Phát triển ứng dụng web',
//     credits: 3
//   },
//   {
//     id: 'SUB006',
//     subjectCode: 'CSE302',
//     subjectName: 'Phát triển ứng dụng di động',
//     credits: 3
//   },
//   {
//     id: 'SUB007',
//     subjectCode: 'CSE401',
//     subjectName: 'Trí tuệ nhân tạo',
//     credits: 4
//   },
//   {
//     id: 'SUB008',
//     subjectCode: 'CSE402',
//     subjectName: 'Học máy',
//     credits: 4
//   },
//   {
//     id: 'SUB009',
//     subjectCode: 'MAT101',
//     subjectName: 'Toán cao cấp',
//     credits: 3
//   },
//   {
//     id: 'SUB010',
//     subjectCode: 'MAT201',
//     subjectName: 'Xác suất thống kê',
//     credits: 3
//   },
//   {
//     id: 'SUB011',
//     subjectCode: 'ENG101',
//     subjectName: 'Tiếng Anh chuyên ngành 1',
//     credits: 2
//   },
//   {
//     id: 'SUB012',
//     subjectCode: 'ENG102',
//     subjectName: 'Tiếng Anh chuyên ngành 2',
//     credits: 2
//   },
//   {
//     id: 'SUB013',
//     subjectCode: 'NET301',
//     subjectName: 'Mạng máy tính',
//     credits: 3
//   },
//   {
//     id: 'SUB014',
//     subjectCode: 'SEC301',
//     subjectName: 'An toàn thông tin',
//     credits: 3
//   },
//   {
//     id: 'SUB015',
//     subjectCode: 'CSE403',
//     subjectName: 'Đồ án tốt nghiệp',
//     credits: 10
//   }
// ];

// // Danh sách chương trình đào tạo
// const curriculumsMock = [
//   {
//     id: 'CUR001',
//     name: 'Kỹ thuật phần mềm',
//     code: 'KTPM',
//     totalCredits: 145
//   },
//   {
//     id: 'CUR002',
//     name: 'Khoa học máy tính',
//     code: 'KHMT',
//     totalCredits: 140
//   },
//   {
//     id: 'CUR003',
//     name: 'Hệ thống thông tin',
//     code: 'HTTT',
//     totalCredits: 142
//   },
//   {
//     id: 'CUR004',
//     name: 'An toàn thông tin',
//     code: 'ATTT',
//     totalCredits: 146
//   }
// ];

// // Danh sách khóa đào tạo
// const batches = [
//   {
//     id: 'BAT001',
//     name: 'K18 (2020-2024)',
//     startYear: 2020,
//     endYear: 2024,
//     curriculumId: 'CUR001'
//   },
//   {
//     id: 'BAT002',
//     name: 'K19 (2021-2025)',
//     startYear: 2021,
//     endYear: 2025,
//     curriculumId: 'CUR001'
//   },
//   {
//     id: 'BAT003',
//     name: 'K20 (2022-2026)',
//     startYear: 2022,
//     endYear: 2026,
//     curriculumId: 'CUR001'
//   },
//   {
//     id: 'BAT004',
//     name: 'K18 (2020-2024)',
//     startYear: 2020,
//     endYear: 2024,
//     curriculumId: 'CUR002'
//   },
//   {
//     id: 'BAT005',
//     name: 'K19 (2021-2025)',
//     startYear: 2021,
//     endYear: 2025,
//     curriculumId: 'CUR002'
//   },
//   {
//     id: 'BAT006',
//     name: 'K18 (2020-2024)',
//     startYear: 2020,
//     endYear: 2024,
//     curriculumId: 'CUR003'
//   },
//   {
//     id: 'BAT007',
//     name: 'K19 (2021-2025)',
//     startYear: 2021,
//     endYear: 2025,
//     curriculumId: 'CUR003'
//   },
//   {
//     id: 'BAT008',
//     name: 'K18 (2020-2024)',
//     startYear: 2020,
//     endYear: 2024,
//     curriculumId: 'CUR004'
//   }
// ];

// // Mẫu ánh xạ giữa môn học và chương trình đào tạo (cho phần chỉnh sửa)
// const sampleMapping = {
//   id: 'MAP001',
//   subjectId: 'SUB001',
//   curriculumId: 'CUR001',
//   batchId: 'BAT001',
//   semester: 1
// };

// const QuanLyMonHoc = () => {
//   const [subjects, setSubjects] = useState([]);
//   const [curriculums, setCurriculums] = useState([]);
//   const [subjectMappings, setSubjectMappings] = useState([]);
//   const [openSubjectForm, setOpenSubjectForm] = useState(false);
//   const [openMappingForm, setOpenMappingForm] = useState(false);
//   const [currentSubject, setCurrentSubject] = useState(null);
//   const [currentMapping, setCurrentMapping] = useState(null);
//   const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
//   const [tabValue, setTabValue] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [subjectsRes, curriculumsRes, mappingsRes] = await Promise.all([
//         getMonHoc(),
//       ]);

//       setSubjects(subjectsRes);
//       // setCurriculums(curriculumsRes);
//       // setSubjectMappings(mappingsRes);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setNotification({
//         open: true,
//         message: 'Lỗi khi tải dữ liệu: ' + error.message,
//         severity: 'error'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Định nghĩa cột cho DataGrid môn học
//   const subjectColumns = [
//     { field: 'ma_mon_hoc', headerName: 'Mã môn học', width: 130 },
//     { field: 'ten_mon_hoc', headerName: 'Tên môn học', width: 260 },
//     { field: 'so_tin_chi', headerName: 'Số tín chỉ', width: 120 },
//     { field: 'tinh_diem', headerName: 'Tính điểm TBC', width: 140, renderCell: (params) => params.value ? 'Có' : 'Không' },
//     { field: 'ghi_chu', headerName: 'Ghi chú', width: 250 },
//     {
//       field: 'actions',
//       headerName: 'Thao tác',
//       width: 150,
//       sortable: false,
//       renderCell: (params) => (
//         <Box>
//           <IconButton onClick={() => handleEditSubject(params.row)} color="primary">
//             <EditIcon />
//           </IconButton>
//         </Box>
//       ),
//     },
//   ];

//   // Định nghĩa cột cho DataGrid ánh xạ môn học với chương trình đào tạo
//   const mappingColumns = [
//     {
//       field: 'ma_mon_hoc',
//       headerName: 'Môn học',
//       width: 200,
//       valueGetter: (params) => {
//         const subject = subjects.find(s => s.id === params.value);
//         return subject ? subject.ten_mon_hoc : '';
//       }
//     },
//     {
//       field: 'curriculumId',
//       headerName: 'Chương trình đào tạo',
//       width: 200,
//       valueGetter: (params) => {
//         const curriculum = curriculums.find(c => c.id === params.value);
//         return curriculum ? curriculum.name : '';
//       }
//     },
//     { field: 'semester', headerName: 'Học kỳ', width: 100 },
//     {
//       field: 'actions',
//       headerName: 'Thao tác',
//       width: 150,
//       sortable: false,
//       renderCell: (params) => (
//         <Box>
//           <IconButton onClick={() => handleEditMapping(params.row)} color="primary">
//             <EditIcon />
//           </IconButton>
//           <IconButton onClick={() => handleDeleteMapping(params.row.id)} color="error">
//             <DeleteIcon />
//           </IconButton>
//         </Box>
//       ),
//     },
//   ];

//   // Xử lý thay đổi tab
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   // Xử lý đóng/mở form môn học
//   const handleOpenSubjectForm = () => {
//     setCurrentSubject({
//       ma_mon_hoc: '',
//       ten_mon_hoc: '',
//       so_tin_chi: 0,
//       ghi_chu: '',
//       tinh_diem: true
//     });
//     setOpenSubjectForm(true);
//   };

//   const handleCloseSubjectForm = () => {
//     setOpenSubjectForm(false);
//   };

//   // Xử lý đóng/mở form ánh xạ
//   const handleOpenMappingForm = () => {
//     setCurrentMapping({
//       subjectId: '',
//       curriculumId: '',
//       semester: 1
//     });
//     setOpenMappingForm(true);
//   };

//   const handleCloseMappingForm = () => {
//     setOpenMappingForm(false);
//   };

//   // Các hàm xử lý cho môn học
//   const handleEditSubject = (subject) => {
//     setCurrentSubject(subject);
//     setOpenSubjectForm(true);
//   };

//   const handleDeleteSubject = async (id) => {
//     try {
//       // Kiểm tra xem môn học có đang được sử dụng trong mapping không
//       const isUsed = subjectMappings.some(mapping => mapping.subjectId === id);
//       if (isUsed) {
//         setNotification({
//           open: true,
//           message: 'Không thể xóa môn học này vì đang được sử dụng trong chương trình đào tạo!',
//           severity: 'error'
//         });
//         return;
//       }

//       await axios.delete(`/api/subjects/${id}`);
//       setSubjects(subjects.filter(s => s.id !== id));
//       setNotification({ open: true, message: 'Xóa môn học thành công!', severity: 'success' });
//     } catch (error) {
//       console.error('Error deleting subject:', error);
//       setNotification({
//         open: true,
//         message: 'Lỗi khi xóa môn học: ' + error.message,
//         severity: 'error'
//       });
//     }
//   };

//   // Các hàm xử lý cho ánh xạ môn học
//   const handleEditMapping = (mapping) => {
//     setCurrentMapping(mapping);
//     setOpenMappingForm(true);
//   };

//   const handleDeleteMapping = async (id) => {
//     try {
//       await axios.delete(`/api/subject-mappings/${id}`);
//       setSubjectMappings(subjectMappings.filter(m => m.id !== id));
//       setNotification({ open: true, message: 'Xóa ánh xạ thành công!', severity: 'success' });
//     } catch (error) {
//       console.error('Error deleting mapping:', error);
//       setNotification({
//         open: true,
//         message: 'Lỗi khi xóa ánh xạ: ' + error.message,
//         severity: 'error'
//       });
//     }
//   };

//   // Xử lý thêm/cập nhật môn học từ component con
//   const handleSubjectSubmit = async (subject) => {
//     try {
//       console.log(subject);
//       let response;

//       if (subject.id) {
//         // Cập nhật
//         response = await updateMonHoc(subject.id,subject)
//         setSubjects(subjects.map(s => s.id === subject.id ? response.data : s));
//         setNotification({ open: true, message: 'Cập nhật môn học thành công!', severity: 'success' });
//       } else {
//         // Thêm mới
//         response = await createMonHoc(subject); // Add await here

//         // Make sure the response data has an id
//         const newSubject = {
//           ...response.data,
//           id: response.data.id
//         };

//         setSubjects([...subjects, newSubject]);
//         setNotification({ open: true, message: 'Thêm môn học thành công!', severity: 'success' });
//       }

//       handleCloseSubjectForm();
//     } catch (error) {
//       console.error('Error saving subject:', error);
//       setNotification({
//         open: true,
//         message: 'Lỗi khi lưu môn học: ' + (error.response?.data?.message || error.message),
//         severity: 'error'
//       });
//     }
//   };

//   // Xử lý thêm/cập nhật ánh xạ từ component con
//   const handleMappingSubmit = async (formData) => {
//     // try {
//     //   let response;
//     //   if (mapping.id) {
//     //     // Cập nhật
//     //     response = await axios.put(`/api/subject-mappings/${mapping.id}`, mapping);
//     //     setSubjectMappings(subjectMappings.map(m => m.id === mapping.id ? response.data : m));
//     //     setNotification({ open: true, message: 'Cập nhật ánh xạ thành công!', severity: 'success' });
//     //   } else {
//     //     // Thêm mới
//     //     response = await axios.post('/api/subject-mappings', mapping);
//     //     setSubjectMappings([...subjectMappings, response.data]);
//     //     setNotification({ open: true, message: 'Thêm ánh xạ thành công!', severity: 'success' });
//     //   }
//     //   handleCloseMappingForm();
//     // } catch (error) {
//     //   console.error('Error saving mapping:', error);
//     //   setNotification({
//     //     open: true,
//     //     message: 'Lỗi khi lưu ánh xạ: ' + error.message,
//     //     severity: 'error'
//     //   });
//     // }

//     console.log('Dữ liệu gửi đi:', formData);
//     // Xử lý logic lưu dữ liệu
//     handleCloseMappingForm();
//   };

//   // Xử lý đóng thông báo
//   const handleCloseNotification = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     setNotification({ ...notification, open: false });
//   };

//   return (
//     <Box>
//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//         <Tabs value={tabValue} onChange={handleTabChange}>
//           <Tab label="Danh sách môn học" />
//           <Tab label="Phân bổ môn học theo CTĐT" />
//           <Tab label="Thời khóa biểu " />
//         </Tabs>
//       </Box>

//       {tabValue === 0 && (
//         <Paper sx={{ p: 2, mb: 2 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//             <Typography variant="h6">Danh sách môn học</Typography>
//             <Button
//               variant="contained"
//               color="primary"
//               startIcon={<AddIcon />}
//               onClick={handleOpenSubjectForm}
//             >
//               Thêm môn học
//             </Button>
//           </Box>
//           <Box sx={{ height: 600, width: '100%' }}>
//             <DataGrid
//               rows={subjects}
//               getRowId={(row) => row.id}
//               columns={subjectColumns}
//               pageSize={5}
//               rowsPerPageOptions={[5]}
//               disableSelectionOnClick
//               loading={loading}
//             />
//           </Box>
//         </Paper>
//       )}

//       {tabValue === 1 && (
//         <Paper sx={{ p: 2, mb: 2 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//             <Typography variant="h6">Phân bổ môn học theo chương trình đào tạo</Typography>
//             <Button
//               variant="contained"
//               color="primary"
//               startIcon={<AddIcon />}
//               onClick={handleOpenMappingForm}
//             >
//               Thêm ánh xạ
//             </Button>
//           </Box>
//           <Box sx={{ height: 400, width: '100%' }}>
//             <DataGrid
//               rows={subjectMappings}
//               columns={mappingColumns}
//               pageSize={5}
//               rowsPerPageOptions={[5]}
//               checkboxSelection
//               disableSelectionOnClick
//               loading={loading}
//             />
//           </Box>
//         </Paper>
//       )}
//       {tabValue === 2 && (
//         <Paper sx={{ p: 2, mb: 2 }}>
//           <ThoiKhoaBieu />
//         </Paper>
//       )}

//       {/* Component Form thêm/sửa môn học */}
//       <MonHocForm
//         open={openSubjectForm}
//         onClose={handleCloseSubjectForm}
//         subject={currentSubject}
//         onSubmit={handleSubjectSubmit}
//       />

//       {/* Component Form thêm/sửa ánh xạ */}
//       <MonHocTheoHeDaoTao
//         open={openMappingForm}
//         onClose={handleCloseMappingForm}
//         mapping={currentMapping}
//         subjects={subjectsMock}
//         curriculums={curriculumsMock}
//         batches={batches} // Danh sách các khóa đào tạo
//         onSubmit={handleMappingSubmit}
//       />

//       {/* Snackbar thông báo */}
//       <Snackbar
//         open={notification.open}
//         autoHideDuration={6000}
//         onClose={handleCloseNotification}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default QuanLyMonHoc;

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

// Mock data for curriculums and batches
const curriculumsMock = [
  {
    id: 'CUR001',
    name: 'Kỹ thuật phần mềm',
    code: 'KTPM',
    totalCredits: 145
  },
  {
    id: 'CUR002',
    name: 'Khoa học máy tính',
    code: 'KHMT',
    totalCredits: 140
  },
  {
    id: 'CUR003',
    name: 'Hệ thống thông tin',
    code: 'HTTT',
    totalCredits: 142
  },
  {
    id: 'CUR004',
    name: 'An toàn thông tin',
    code: 'ATTT',
    totalCredits: 146
  }
];

// Danh sách khóa đào tạo
const batches = [
  {
    id: 'BAT001',
    name: 'K18 (2020-2024)',
    startYear: 2020,
    endYear: 2024,
    curriculumId: 'CUR001'
  },
  {
    id: 'BAT002',
    name: 'K19 (2021-2025)',
    startYear: 2021,
    endYear: 2025,
    curriculumId: 'CUR001'
  },
  {
    id: 'BAT003',
    name: 'K20 (2022-2026)',
    startYear: 2022,
    endYear: 2026,
    curriculumId: 'CUR001'
  },
  {
    id: 'BAT004',
    name: 'K18 (2020-2024)',
    startYear: 2020,
    endYear: 2024,
    curriculumId: 'CUR002'
  },
  {
    id: 'BAT005',
    name: 'K19 (2021-2025)',
    startYear: 2021,
    endYear: 2025,
    curriculumId: 'CUR002'
  },
  {
    id: 'BAT006',
    name: 'K18 (2020-2024)',
    startYear: 2020,
    endYear: 2024,
    curriculumId: 'CUR003'
  },
  {
    id: 'BAT007',
    name: 'K19 (2021-2025)',
    startYear: 2021,
    endYear: 2025,
    curriculumId: 'CUR003'
  },
  {
    id: 'BAT008',
    name: 'K18 (2020-2024)',
    startYear: 2020,
    endYear: 2024,
    curriculumId: 'CUR004'
  }
];

// For demo purposes - sample subjects
const subjectsMock = [
  {
    id: 'SUB001',
    subjectCode: 'CSE101',
    subjectName: 'Nhập môn lập trình',
    credits: 3
  },
  {
    id: 'SUB002',
    subjectCode: 'CSE102',
    subjectName: 'Cấu trúc dữ liệu và giải thuật',
    credits: 4
  },
  {
    id: 'SUB003',
    subjectCode: 'CSE201',
    subjectName: 'Lập trình hướng đối tượng',
    credits: 3
  },
  {
    id: 'SUB004',
    subjectCode: 'CSE202',
    subjectName: 'Cơ sở dữ liệu',
    credits: 4
  },
  {
    id: 'SUB005',
    subjectCode: 'CSE301',
    subjectName: 'Phát triển ứng dụng web',
    credits: 3
  },
  {
    id: 'SUB006',
    subjectCode: 'CSE302',
    subjectName: 'Phát triển ứng dụng di động',
    credits: 3
  },
  {
    id: 'SUB007',
    subjectCode: 'CSE401',
    subjectName: 'Trí tuệ nhân tạo',
    credits: 4
  },
  {
    id: 'SUB008',
    subjectCode: 'CSE402',
    subjectName: 'Học máy',
    credits: 4
  },
  {
    id: 'SUB009',
    subjectCode: 'MAT101',
    subjectName: 'Toán cao cấp',
    credits: 3
  },
  {
    id: 'SUB010',
    subjectCode: 'MAT201',
    subjectName: 'Xác suất thống kê',
    credits: 3
  },
  {
    id: 'SUB011',
    subjectCode: 'ENG101',
    subjectName: 'Tiếng Anh chuyên ngành 1',
    credits: 2
  },
  {
    id: 'SUB012',
    subjectCode: 'ENG102',
    subjectName: 'Tiếng Anh chuyên ngành 2',
    credits: 2
  },
  {
    id: 'SUB013',
    subjectCode: 'NET301',
    subjectName: 'Mạng máy tính',
    credits: 3
  },
  {
    id: 'SUB014',
    subjectCode: 'SEC301',
    subjectName: 'An toàn thông tin',
    credits: 3
  },
  {
    id: 'SUB015',
    subjectCode: 'CSE403',
    subjectName: 'Đồ án tốt nghiệp',
    credits: 10
  }
];

const QuanLyMonHoc = () => {
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState(curriculumsMock); // Using mock data for now
  const [subjectMappings, setSubjectMappings] = useState([]);
  const [openSubjectForm, setOpenSubjectForm] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
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
      // Fetch subjects from API
      const subjectsRes = await getMonHoc();
      setSubjects(subjectsRes);
      
      // In a real application, you would fetch curriculum and batch data as well
      // For now, we're using mock data
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

  // Các hàm xử lý cho môn học
  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setOpenSubjectForm(true);
  };

  // Xử lý thêm/cập nhật môn học từ component con
  const handleSubjectSubmit = async (subject) => {
    try {
      let response;

      if (subject.id) {
        // Cập nhật
        response = await updateMonHoc(subject.id, subject);
        setSubjects(subjects.map(s => s.id === subject.id ? response.data : s));
        setNotification({ open: true, message: 'Cập nhật môn học thành công!', severity: 'success' });
      } else {
        // Thêm mới
        response = await createMonHoc(subject);

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

  // Xử lý thêm/cập nhật phân bổ môn học theo chương trình đào tạo
  const handleCurriculumMappingSubmit = async (mappingData) => {
    try {
      // In a real application, you would call an API to save the mapping
      console.log('Saving curriculum mapping:', mappingData);
      
      // For now, just show a success notification
      setNotification({ 
        open: true, 
        message: 'Cập nhật phân bổ môn học thành công!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving curriculum mapping:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi lưu phân bổ môn học: ' + error.message,
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
              rows={subjects.length > 0 ? subjects : subjectsMock} // Use mock data if API fails
              getRowId={(row) => row.id}
              columns={subjectColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              loading={loading}
            />
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <MonHocTheoHeDaoTao
            subjects={subjectsMock} // Use mock data for demo
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

      {/* Component Form thêm/sửa môn học */}
      <MonHocForm
        open={openSubjectForm}
        onClose={handleCloseSubjectForm}
        subject={currentSubject}
        onSubmit={handleSubjectSubmit}
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