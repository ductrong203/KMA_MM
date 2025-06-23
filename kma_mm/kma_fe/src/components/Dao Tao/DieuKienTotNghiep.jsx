import {
  Autocomplete,
  Box,
  Button,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import PageHeader from '../../layout/PageHeader';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { fetchDanhSachKhoa } from '../../Api_controller/Service/khoaService';
import { getDanhSachSinhVienTheoLop } from '../../Api_controller/Service/sinhVienService';
import { getDanhSachLopTheoKhoaDaoTao } from '../../Api_controller/Service/lopService';
import { kiemTraTotNghiep } from '../../Api_controller/Service/sinhVienService';

function DieuKienTotNghiep() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTrainingSystem, setSelectedTrainingSystem] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [graduationResults, setGraduationResults] = useState({});
  const [trainingSystems, setTrainingSystems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
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
        const data = Array.isArray(response) ? response : [];
        setTrainingSystems(data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Lỗi khi tải danh sách hệ đào tạo',
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
          const data = Array.isArray(response) ? response : [];
          setCourses(data);
          setClasses([]);
          setStudents([]);
          setSelectedCourse(null);
          setSelectedClass(null);
          setGraduationResults({});
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi tải danh sách khóa đào tạo',
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
      setGraduationResults({});
    }
  }, [selectedTrainingSystem]);

  // Lấy danh sách lớp khi chọn khóa đào tạo
  useEffect(() => {
    if (selectedCourse) {
      const fetchClasses = async () => {
        setLoading(true);
        try {
          const response = await getDanhSachLopTheoKhoaDaoTao(selectedCourse.id);
          const data = Array.isArray(response) ? response : [];
          setClasses(data);
          setStudents([]);
          setSelectedClass(null);
          setGraduationResults({});
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi tải danh sách lớp',
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
      setGraduationResults({});
    }
  }, [selectedCourse]);

  // Lấy danh sách sinh viên và kiểm tra điều kiện tốt nghiệp khi chọn lớp
  useEffect(() => {
    if (selectedClass) {
      const fetchStudentsAndCheckGraduation = async () => {
        setLoading(true);
        try {
          const response = await getDanhSachSinhVienTheoLop(selectedClass.id);
          const data = Array.isArray(response.data) ? response.data : [];
          setStudents(data);

          // Kiểm tra điều kiện tốt nghiệp cho từng sinh viên
          const results = {};
          for (const student of data) {
            try {
              const gradResponse = await kiemTraTotNghiep(student.sinh_vien_id || student.id);
              results[student.sinh_vien_id || student.id] = gradResponse.data;
            } catch (error) {
              console.error(`Lỗi khi kiểm tra tốt nghiệp cho sinh viên ${student.sinh_vien_id}:`, error);
            }
          }
          setGraduationResults(results);
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi tải danh sách sinh viên',
            severity: 'error',
          });
          setStudents([]);
        } finally {
          setLoading(false);
        }
      };
      fetchStudentsAndCheckGraduation();
    } else {
      setStudents([]);
      setGraduationResults({});
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
  const isEligibleForGraduation = (graduationInfo) => {
    return (
      graduationInfo &&
      graduationInfo.tong_tin_chi >= 130 &&
      graduationInfo.dieu_kien_tot_nghiep?.du_tin_chi &&
      graduationInfo.dieu_kien_tot_nghiep?.co_chung_chi
    );
  };

  // Hiển thị danh sách chứng chỉ
  const renderCertificates = (certificates) => {
    if (!certificates || certificates.length === 0) return 'Chưa có';
    return certificates
      .filter((cert) => cert.tinh_trang === 'tốt nghiệp')
      .map((cert) => `${cert.loai_chung_chi} (${cert.diem_trung_binh}, ${cert.xep_loai})`)
      .join(', ');
  };

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

                    {/* Danh sách sinh viên */}
                    {selectedClass && students.length > 0 && (
                      <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Mã SV</TableCell>
                              <TableCell>Họ tên</TableCell>
                              <TableCell>Số tín chỉ</TableCell>
                              <TableCell>Chứng chỉ</TableCell>
                              <TableCell>Trạng thái</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {students.map((student) => {
                              const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                              return (
                                <TableRow key={student.sinh_vien_id || student.id}>
                                  <TableCell>{student.ma_sinh_vien || student.code}</TableCell>
                                  <TableCell>{`${student.ho_dem || ''} ${student.ten || ''}`}</TableCell>
                                  <TableCell>
                                    {graduationInfo ? `${graduationInfo.tong_tin_chi || 0}/130` : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {graduationInfo
                                      ? renderCertificates(graduationInfo.chung_chi_tot_nghiep)
                                      : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {graduationInfo
                                      ? isEligibleForGraduation(graduationInfo)
                                        ? 'Đủ điều kiện'
                                        : 'Không đủ'
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {!loading && students.length === 0 && selectedClass && (
                      <Typography color="textSecondary" sx={{ mt: 2 }}>
                        Không tìm thấy sinh viên trong lớp này.
                      </Typography>
                    )}
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6">Xét duyệt tốt nghiệp</Typography>
                    <Typography>
                      Xác nhận xét tốt nghiệp cho các sinh viên đủ điều kiện trong lớp {selectedClass?.ma_lop}.
                    </Typography>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h6">Hoàn thành</Typography>
                    <Typography>
                      Quá trình xét tốt nghiệp cho lớp {selectedClass?.ma_lop} đã hoàn tất.
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
                      !selectedClass ||
                      students.length === 0 ||
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
                • Đạt trạng thái đủ tín chỉ (theo quy định của chương trình)
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Có chứng chỉ theo yêu cầu
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DieuKienTotNghiep;