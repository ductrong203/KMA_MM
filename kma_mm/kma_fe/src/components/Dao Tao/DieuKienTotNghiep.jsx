import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import PageHeader from '../../layout/PageHeader';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { fetchDanhSachKhoa } from '../../Api_controller/Service/khoaService';
import { getDanhSachSinhVienTheoLop } from '../../Api_controller/Service/sinhVienService';
import { getDanhSachLopTheoKhoaDaoTao } from '../../Api_controller/Service/lopService';

function DieuKienTotNghiep() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTrainingSystem, setSelectedTrainingSystem] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [trainingSystems, setTrainingSystems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const graduationSteps = ['Kiểm tra điều kiện', 'Xét duyệt', 'Hoàn thành'];

  // Lấy danh sách hệ đào tạo khi component mount
  useEffect(() => {
    const fetchTrainingSystems = async () => {
      setLoading(true);
      try {
        const response = await fetchDanhSachHeDaoTao();
        console.log('Danh sách hệ đào tạo:', response);
        // Giả định response có dạng { data: [...] }
        const data = Array.isArray(response) ? response : [];
        setTrainingSystems(data);
      } catch (error) {
        console.error('Lỗi khi tải hệ đào tạo:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải danh sách hệ đào tạo',
          severity: 'error',
        });
        setTrainingSystems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainingSystems();
  }, []);

  // Lấy danh sách khóa đào tạo khi chọn hệ đào tạo
  useEffect(() => {
    if (selectedTrainingSystem) {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const response = await fetchDanhSachKhoa(selectedTrainingSystem.id);
          console.log('Danh sách khóa đào tạo:', response);
          const data = Array.isArray(response) ? response : [];
          setCourses(data);
          setClasses([]);
          setStudents([]);
          setSelectedCourse(null);
          setSelectedClass(null);
          setSelectedStudent(null);
        } catch (error) {
          console.error('Lỗi khi tải khóa đào tạo:', error);
          setSnackbar({
            open: true,
            message: 'Lỗi khi tải danh sách khóa đào tạo',
            severity: 'error',
          });
          setCourses([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    } else {
      setCourses([]);
      setClasses([]);
      setStudents([]);
      setSelectedCourse(null);
      setSelectedClass(null);
      setSelectedStudent(null);
    }
  }, [selectedTrainingSystem]);

  // Lấy danh sách lớp khi chọn khóa đào tạo
  useEffect(() => {
    if (selectedCourse) {
      const fetchClasses = async () => {
        setLoading(true);
        try {
          const response = await getDanhSachLopTheoKhoaDaoTao(selectedCourse.id);
          console.log('Danh sách lớp:', response);
          const data = Array.isArray(response) ? response : [];
          setClasses(data);
          setStudents([]);
          setSelectedClass(null);
          setSelectedStudent(null);
        } catch (error) {
          console.error('Lỗi khi tải lớp:', error);
          setSnackbar({
            open: true,
            message: 'Lỗi khi tải danh sách lớp',
            severity: 'error',
          });
          setClasses([]);
        } finally {
          setLoading(false);
        }
      };
      fetchClasses();
    } else {
      setClasses([]);
      setStudents([]);
      setSelectedClass(null);
      setSelectedStudent(null);
    }
  }, [selectedCourse]);

  // Lấy danh sách sinh viên khi chọn lớp
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const response = await getDanhSachSinhVienTheoLop(selectedClass.id);
          console.log('Danh sách sinh viên:', response);
          const data = Array.isArray(response.data) ? response.data : [];
          setStudents(data);
          setSelectedStudent(null);
        } catch (error) {
          console.error('Lỗi khi tải sinh viên:', error);
          setSnackbar({
            open: true,
            message: 'Lỗi khi tải danh sách sinh viên',
            severity: 'error',
          });
          setStudents([]);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [selectedClass]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Kiểm tra điều kiện tốt nghiệp
  const isEligibleForGraduation = (student) => {
    return (
      student &&
      student.credits >= 130 &&
      student.gpa >= 2.0 &&
      student.hasDegree // Phải hoàn thành chứng chỉ
    );
  };
console.log(selectedStudent)
  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <PageHeader title="Xét tốt nghiệp" />

            <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
              {graduationSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && (
              <Box sx={{ mt: 2 }}>
                {activeStep === 0 && (
                  <Box>
                    {/* Chọn hệ đào tạo */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Autocomplete
                        options={trainingSystems}
                        getOptionLabel={(option) => option.ten_he_dao_tao || option.name || ''}
                        renderInput={(params) => <TextField {...params} label="Hệ đào tạo" />}
                        onChange={(event, newValue) => setSelectedTrainingSystem(newValue)}
                        value={selectedTrainingSystem}
                      />
                    </FormControl>

                    {/* Chọn khóa đào tạo */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Autocomplete
                        options={courses}
                        getOptionLabel={(option) => option.ten_khoa || option.name || ''}
                        renderInput={(params) => <TextField {...params} label="Khóa đào tạo" />}
                        onChange={(event, newValue) => setSelectedCourse(newValue)}
                        value={selectedCourse}
                        disabled={!selectedTrainingSystem}
                      />
                    </FormControl>

                    {/* Chọn lớp */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Autocomplete
                        options={classes}
                        getOptionLabel={(option) => option.ma_lop || option.name || ''}
                        renderInput={(params) => <TextField {...params} label="Lớp" />}
                        onChange={(event, newValue) => setSelectedClass(newValue)}
                        value={selectedClass}
                        disabled={!selectedCourse}
                      />
                    </FormControl>

                    {/* Chọn sinh viên */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Autocomplete
                        options={students}
                        getOptionLabel={(option) =>
                          `${option.ma_sinh_vien || option.code || ''} - ${option.ho_dem || ''} ${option.ten || option.name || ''}`.trim()
                        }
                        renderInput={(params) => <TextField {...params} label="Chọn sinh viên" />}
                        onChange={(event, newValue) => setSelectedStudent(newValue)}
                        value={selectedStudent}
                        disabled={!selectedClass}
                      />
                    </FormControl>

                    {selectedStudent && (
                      <Card sx={{ mt: 2 }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">Mã sinh viên</Typography>
                              <Typography variant="h6">{selectedStudent.ma_sinh_vien || selectedStudent.code || ''}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">Họ tên</Typography>
                              <Typography variant="h6">
                                {`${selectedStudent.ho_dem || ''} ${selectedStudent.ten || selectedStudent.name || ''}`.trim()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">Số tín chỉ tích lũy</Typography>
                              <Typography variant="h6">
                                {selectedStudent.credits || 0}/130
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">GPA</Typography>
                              <Typography variant="h6">
                                {selectedStudent.gpa || 0}/4.0
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">Hoàn thành chứng chỉ</Typography>
                              <Typography variant="h6">
                                {selectedStudent.hasDegree ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography color="textSecondary">Đủ điều kiện tốt nghiệp</Typography>
                              <Typography variant="h6">
                                {isEligibleForGraduation(selectedStudent) ? 'Đủ điều kiện' : 'Không đủ điều kiện'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6">Xét duyệt tốt nghiệp</Typography>
                    {selectedStudent && (
                      <Typography>
                        Xác nhận xét tốt nghiệp cho sinh viên: {selectedStudent.ma_sinh_vien || selectedStudent.code || ''} -{' '}
                        {`${selectedStudent.ho_dem || ''} ${selectedStudent.ten || selectedStudent.name || ''}`.trim()}
                      </Typography>
                    )}
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h6">Hoàn thành</Typography>
                    <Typography>
                      Quá trình xét tốt nghiệp cho sinh viên{' '}
                      {selectedStudent?.ma_sinh_vien || selectedStudent?.code || ''} đã hoàn tất.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  {activeStep > 0 && (
                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                      Quay lại
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={
                      !selectedStudent ||
                      !isEligibleForGraduation(selectedStudent) ||
                      activeStep >= graduationSteps.length - 1
                    }
                  >
                    {activeStep === graduationSteps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Điều kiện tốt nghiệp
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                • Tích lũy đủ 130 tín chỉ
              </Typography>
              <Typography variant="body2" gutterBottom>
                • GPA tổng ≥ 2.0
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Hoàn thành tất cả chứng chỉ bắt buộc
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DieuKienTotNghiep;