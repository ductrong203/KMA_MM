// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Box,
//   CircularProgress,
//   FormHelperText,
//   Typography,
//   Grid,
//   Divider,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Paper,
//   List,
//   ListItem,
//   ListItemText
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// const MonHocTheoHeDaoTao = ({ 
//   open, 
//   onClose, 
//   mapping, 
//   subjects, 
//   curriculums, 
//   batches, // Danh sách khóa đào tạo
//   onSubmit 
// }) => {
//   const [formData, setFormData] = useState({
//     id: null,
//     subjectId: '',
//     curriculumId: '',
//     batchId: '', // Trường cho khóa đào tạo
//     semester: 1
//   });
  
//   // State để lưu trữ danh sách các môn học theo kỳ
//   const [subjectsBySemester, setSubjectsBySemester] = useState({});
//   const [maxSemesters, setMaxSemesters] = useState(8); // Mặc định 8 học kỳ
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
  
//   // Lọc danh sách khóa đào tạo theo chương trình đào tạo đã chọn
//   const filteredBatches = formData.curriculumId 
//     ? batches.filter(batch => batch.curriculumId === formData.curriculumId)
//     : [];

//   // Cập nhật dữ liệu form khi prop mapping thay đổi
//   useEffect(() => {
//     if (mapping) {
//       setFormData({ ...mapping });
//     }
//   }, [mapping]);

//   // Cập nhật danh sách môn học khi curriculumId hoặc batchId thay đổi
//   useEffect(() => {
//     if (formData.curriculumId && formData.batchId) {
//       // Mô phỏng việc lấy dữ liệu từ server
//       setLoading(true);
      
//       // Dữ liệu mẫu - trong thực tế, gọi API
//       setTimeout(() => {
//         // Tạo cấu trúc dữ liệu mẫu theo kỳ
//         const mockSubjectsBySemester = {};
        
//         // Giả sử có 8 học kỳ
//         for (let i = 1; i <= maxSemesters; i++) {
//           // Lọc môn học cho chương trình và khóa đào tạo hiện tại ở học kỳ i
//           const semesterSubjects = subjects.filter(subject => 
//             // Trong thực tế, kiểm tra curriculumId, batchId và semester
//             Math.random() > 0.5 // Giả lập việc lọc
//           ).slice(0, Math.floor(Math.random() * 5) + 1); // Ngẫu nhiên 1-5 môn học mỗi kỳ
          
//           if (semesterSubjects.length > 0) {
//             mockSubjectsBySemester[i] = semesterSubjects;
//           }
//         }
        
//         setSubjectsBySemester(mockSubjectsBySemester);
//         setLoading(false);
//       }, 500);
//     } else {
//       // Đặt lại danh sách môn học nếu chưa chọn đủ thông tin
//       setSubjectsBySemester({});
//     }
//   }, [formData.curriculumId, formData.batchId, maxSemesters, subjects]);

//   // Xử lý thay đổi đầu vào form
//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Nếu curriculumId thay đổi, đặt lại batchId
//     if (name === 'curriculumId') {
//       setFormData({
//         ...formData,
//         [name]: value,
//         batchId: ''
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: value
//       });
//     }

//     // Xóa lỗi khi trường được chỉnh sửa
//     if (errors[name]) {
//       setErrors({
//         ...errors,
//         [name]: null
//       });
//     }
//   };

//   // Xác thực form trước khi gửi
//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.subjectId) {
//       newErrors.subjectId = 'Vui lòng chọn môn học';
//     }

//     if (!formData.curriculumId) {
//       newErrors.curriculumId = 'Vui lòng chọn chương trình đào tạo';
//     }
    
//     if (!formData.batchId) {
//       newErrors.batchId = 'Vui lòng chọn khóa đào tạo';
//     }

//     if (formData.semester <= 0) {
//       newErrors.semester = 'Học kỳ phải lớn hơn 0';
//     }

//     // Kiểm tra ánh xạ trùng lặp
//     if (!formData.id && !newErrors.subjectId && !newErrors.curriculumId && !newErrors.batchId) {
//       // Giả sử subjects đã có thông tin về ánh xạ
//       const isDuplicate = subjects.some(
//         s => s.subjectId === formData.subjectId && 
//              s.curriculumId === formData.curriculumId &&
//              s.batchId === formData.batchId
//       );

//       if (isDuplicate) {
//         newErrors.subjectId = 'Môn học này đã được thêm vào khóa đào tạo này';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Xử lý gửi form
//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       await onSubmit(formData);
//     } catch (error) {
//       console.error('Lỗi khi gửi form:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Đặt lại form khi đóng
//   const handleClose = () => {
//     setErrors({});
//     onClose();
//   };

//   // Xử lý thêm môn học vào kỳ
//   const handleAddSubjectToSemester = (subjectId, semester) => {
//     setFormData({
//       ...formData,
//       subjectId: subjectId,
//       semester: semester
//     });
//   };

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//       <DialogTitle>Quản lý môn học theo chương trình đào tạo</DialogTitle>
//       <DialogContent>
//         <Box sx={{ mt: 2 }}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} md={6}>
//               <FormControl
//                 fullWidth
//                 margin="dense"
//                 error={!!errors.curriculumId}
//                 disabled={loading}
//               >
//                 <InputLabel>Chương trình đào tạo</InputLabel>
//                 <Select
//                   name="curriculumId"
//                   value={formData.curriculumId}
//                   label="Chương trình đào tạo"
//                   onChange={handleChange}
//                 >
//                   {curriculums.map((curriculum) => (
//                     <MenuItem key={curriculum.id} value={curriculum.id}>
//                       {curriculum.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {errors.curriculumId && <FormHelperText>{errors.curriculumId}</FormHelperText>}
//               </FormControl>
//             </Grid>
            
//             <Grid item xs={12} md={6}>
//               <FormControl
//                 fullWidth
//                 margin="dense"
//                 error={!!errors.batchId}
//                 disabled={loading || !formData.curriculumId}
//               >
//                 <InputLabel>Khóa đào tạo</InputLabel>
//                 <Select
//                   name="batchId"
//                   value={formData.batchId}
//                   label="Khóa đào tạo"
//                   onChange={handleChange}
//                 >
//                   {filteredBatches.map((batch) => (
//                     <MenuItem key={batch.id} value={batch.id}>
//                       {batch.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {errors.batchId && <FormHelperText>{errors.batchId}</FormHelperText>}
//               </FormControl>
//             </Grid>
//           </Grid>

//           <Divider sx={{ my: 2 }} />
          
//           {loading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
//               <CircularProgress />
//             </Box>
//           ) : (
//             <Box>
//               {formData.curriculumId && formData.batchId ? (
//                 <>
//                   <Box sx={{ mb: 2 }}>
//                     <Typography variant="h6" component="h3" gutterBottom>
//                       Danh sách môn học theo kỳ
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       Chọn một môn học để thêm hoặc cập nhật học kỳ
//                     </Typography>
//                   </Box>
                  
//                   {Object.keys(subjectsBySemester).length > 0 ? (
//                     Object.keys(subjectsBySemester).sort((a, b) => Number(a) - Number(b)).map(semester => (
//                       <Accordion key={`semester-${semester}`}>
//                         <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                           <Typography><strong>Học kỳ {semester}</strong> ({subjectsBySemester[semester].length} môn)</Typography>
//                         </AccordionSummary>
//                         <AccordionDetails>
//                           <List dense>
//                             {subjectsBySemester[semester].map(subject => (
//                               <ListItem 
//                                 key={subject.id}
//                                 button
//                                 onClick={() => handleAddSubjectToSemester(subject.id, Number(semester))}
//                                 selected={formData.subjectId === subject.id}
//                               >
//                                 <ListItemText 
//                                   primary={`${subject.subjectCode} - ${subject.subjectName}`} 
//                                   secondary={`Số tín chỉ: ${subject.credits || 3}`}
//                                 />
//                               </ListItem>
//                             ))}
//                           </List>
//                         </AccordionDetails>
//                       </Accordion>
//                     ))
//                   ) : (
//                     <Paper elevation={0} variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
//                       <Typography color="text.secondary">
//                         Chưa có môn học nào được thêm vào chương trình đào tạo này
//                       </Typography>
//                     </Paper>
//                   )}
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Box sx={{ mt: 3 }}>
//                     <Typography variant="h6" component="h3" gutterBottom>
//                       Thêm môn học mới vào kỳ học
//                     </Typography>
                    
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={8}>
//                         <FormControl
//                           fullWidth
//                           margin="dense"
//                           error={!!errors.subjectId}
//                           disabled={loading}
//                         >
//                           <InputLabel>Môn học</InputLabel>
//                           <Select
//                             name="subjectId"
//                             value={formData.subjectId}
//                             label="Môn học"
//                             onChange={handleChange}
//                           >
//                             {subjects.map((subject) => (
//                               <MenuItem key={subject.id} value={subject.id}>
//                                 {subject.subjectCode} - {subject.subjectName}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                           {errors.subjectId && <FormHelperText>{errors.subjectId}</FormHelperText>}
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12} md={4}>
//                         <TextField
//                           margin="dense"
//                           name="semester"
//                           label="Học kỳ"
//                           type="number"
//                           fullWidth
//                           value={formData.semester}
//                           onChange={handleChange}
//                           error={!!errors.semester}
//                           helperText={errors.semester}
//                           disabled={loading}
//                           InputProps={{ inputProps: { min: 1, max: maxSemesters } }}
//                         />
//                       </Grid>
//                     </Grid>
                    
//                     <FormControl fullWidth margin="dense">
//                       <TextField
//                         margin="dense"
//                         name="maxSemesters"
//                         label="Số học kỳ tối đa"
//                         type="number"
//                         value={maxSemesters}
//                         onChange={(e) => setMaxSemesters(Number(e.target.value))}
//                         disabled={loading}
//                         InputProps={{ inputProps: { min: 1, max: 12 } }}
//                       />
//                       <FormHelperText>Điều chỉnh số học kỳ hiển thị tối đa</FormHelperText>
//                     </FormControl>
//                   </Box>
//                 </>
//               ) : (
//                 <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
//                   <Typography variant="body1" gutterBottom>
//                     Vui lòng chọn chương trình đào tạo và khóa đào tạo để xem danh sách môn học
//                   </Typography>
//                 </Paper>
//               )}
//             </Box>
//           )}
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleClose} disabled={loading}>Hủy</Button>
//         <Button
//           onClick={handleSubmit}
//           variant="contained"
//           color="primary"
//           disabled={loading || !formData.subjectId || !formData.curriculumId || !formData.batchId}
//         >
//           {loading ? <CircularProgress size={24} /> : (formData.id ? 'Cập nhật' : 'Thêm mới')}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default MonHocTheoHeDaoTao;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

// Giả sử đây là API service cho môn học theo CTĐT
const getSubjectsByCurriculumAndBatch = async (curriculumId, batchId) => {
  // Đây là nơi bạn sẽ gọi API thực tế
  // Tạm thời sử dụng dữ liệu mẫu
  return [
    { id: 'MAP001', subjectId: 'SUB001', subjectName: 'Nhập môn lập trình', credits: 3, semester: 1 },
    { id: 'MAP002', subjectId: 'SUB009', subjectName: 'Toán cao cấp', credits: 3, semester: 1 },
    { id: 'MAP003', subjectId: 'SUB011', subjectName: 'Tiếng Anh chuyên ngành 1', credits: 2, semester: 1 },
    { id: 'MAP004', subjectId: 'SUB002', subjectName: 'Cấu trúc dữ liệu và giải thuật', credits: 4, semester: 2 },
    { id: 'MAP005', subjectId: 'SUB010', subjectName: 'Xác suất thống kê', credits: 3, semester: 2 },
    { id: 'MAP006', subjectId: 'SUB003', subjectName: 'Lập trình hướng đối tượng', credits: 3, semester: 3 },
    { id: 'MAP007', subjectId: 'SUB004', subjectName: 'Cơ sở dữ liệu', credits: 4, semester: 3 },
    { id: 'MAP008', subjectId: 'SUB013', subjectName: 'Mạng máy tính', credits: 3, semester: 4 },
  ];
};

// Component hiển thị danh sách môn học theo kỳ
const MonHocTheoHeDaoTao = ({ open, onClose, subjects, curriculums, batches, onSubmit }) => {
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [subjectsBySemester, setSubjectsBySemester] = useState({});
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const maxSemesters = 8; // Số học kỳ tối đa

  // Filter batches when curriculum changes
  useEffect(() => {
    if (selectedCurriculum) {
      const filtered = batches.filter(batch => batch.curriculumId === selectedCurriculum);
      setFilteredBatches(filtered);
      setSelectedBatch(''); // Reset selected batch
      setSubjectsBySemester({}); // Reset subjects
    } else {
      setFilteredBatches([]);
    }
  }, [selectedCurriculum, batches]);

  // Fetch subjects when batch changes
  useEffect(() => {
    if (selectedCurriculum && selectedBatch) {
      fetchSubjectsBySemester();
    }
  }, [selectedBatch, selectedCurriculum]);

  // Fetch and organize subjects by semester
  const fetchSubjectsBySemester = async () => {
    setLoading(true);
    try {
      const subjectsData = await getSubjectsByCurriculumAndBatch(selectedCurriculum, selectedBatch);
      
      // Group subjects by semester
      const groupedSubjects = {};
      for (let i = 1; i <= maxSemesters; i++) {
        groupedSubjects[i] = [];
      }
      
      subjectsData.forEach(subject => {
        if (groupedSubjects[subject.semester]) {
          groupedSubjects[subject.semester].push(subject);
        }
      });
      
      setSubjectsBySemester(groupedSubjects);
    } catch (error) {
      console.error('Error fetching subjects by semester:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurriculumChange = (event) => {
    setSelectedCurriculum(event.target.value);
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedSubject('');
    setSelectedSemester(1);
  };

  const handleAddSubject = () => {
    // Here you would typically call an API to add the subject to the curriculum
    const subjectToAdd = subjects.find(s => s.id === selectedSubject);
    
    if (subjectToAdd) {
      const newMapping = {
        id: `MAP${Date.now()}`, // Generate a temporary ID
        subjectId: selectedSubject,
        subjectName: subjectToAdd.subjectName,
        credits: subjectToAdd.credits,
        curriculumId: selectedCurriculum,
        batchId: selectedBatch,
        semester: selectedSemester
      };
      
      // Add to the right semester
      const updatedSubjects = { ...subjectsBySemester };
      updatedSubjects[selectedSemester] = [...updatedSubjects[selectedSemester], newMapping];
      setSubjectsBySemester(updatedSubjects);
      
      // Call the parent component's submit handler
      onSubmit(newMapping);
      handleCloseAddDialog();
    }
  };

  const handleRemoveSubject = (subjectId, semester) => {
    // Here you would typically call an API to remove the subject from the curriculum
    const updatedSubjects = { ...subjectsBySemester };
    updatedSubjects[semester] = updatedSubjects[semester].filter(s => s.id !== subjectId);
    setSubjectsBySemester(updatedSubjects);
  };

  // Get curriculum name by ID
  const getCurriculumName = (id) => {
    const curriculum = curriculums.find(c => c.id === id);
    return curriculum ? curriculum.name : '';
  };

  // Get batch name by ID
  const getBatchName = (id) => {
    const batch = batches.find(b => b.id === id);
    return batch ? batch.name : '';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="curriculum-select-label">Chương trình đào tạo</InputLabel>
            <Select
              labelId="curriculum-select-label"
              id="curriculum-select"
              value={selectedCurriculum}
              label="Chương trình đào tạo"
              onChange={handleCurriculumChange}
            >
              {curriculums.map((curriculum) => (
                <MenuItem key={curriculum.id} value={curriculum.id}>
                  {curriculum.name} ({curriculum.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" disabled={!selectedCurriculum}>
            <InputLabel id="batch-select-label">Khóa đào tạo</InputLabel>
            <Select
              labelId="batch-select-label"
              id="batch-select"
              value={selectedBatch}
              label="Khóa đào tạo"
              onChange={handleBatchChange}
            >
              {filteredBatches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {selectedCurriculum && selectedBatch && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Môn học theo kỳ: {getCurriculumName(selectedCurriculum)} - {getBatchName(selectedBatch)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Thêm môn học
            </Button>
          </Box>

          <Grid container spacing={2}>
            {Object.keys(subjectsBySemester).map((semester) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={semester}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Học kỳ {semester}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {subjectsBySemester[semester].length > 0 ? (
                    <List>
                      {subjectsBySemester[semester].map((subject) => (
                        <ListItem
                          key={subject.id}
                          secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSubject(subject.id, semester)}>
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={subject.subjectName}
                            secondary={
                              <React.Fragment>
                                <Chip 
                                  label={`${subject.credits} tín chỉ`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                  sx={{ mr: 1 }}
                                />
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      Chưa có môn học
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Dialog to add subject to curriculum */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm môn học vào chương trình đào tạo</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="subject-select-label">Môn học</InputLabel>
            <Select
              labelId="subject-select-label"
              id="subject-select"
              value={selectedSubject}
              label="Môn học"
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.subjectCode} - {subject.subjectName} ({subject.credits} tín chỉ)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="semester-select-label">Học kỳ</InputLabel>
            <Select
              labelId="semester-select-label"
              id="semester-select"
              value={selectedSemester}
              label="Học kỳ"
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((num) => (
                <MenuItem key={num} value={num}>
                  Học kỳ {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          <Button onClick={handleAddSubject} variant="contained" color="primary" disabled={!selectedSubject}>
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonHocTheoHeDaoTao;