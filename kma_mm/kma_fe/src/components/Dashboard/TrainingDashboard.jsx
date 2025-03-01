import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PrintIcon from '@mui/icons-material/Print';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import {
    AppBar,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Step,
    StepLabel,
    Stepper,
    Switch,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Toolbar,
    Typography,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { createTraining, fetchDanhSachHeDaoTao, updateTraining } from "../../Api_controller/Service/trainingService";
import StudentManagement from '../QLHV/StudentManagement ';
import ClassManagement from '../LOP/ClassManagement';
import QuanLyKhoa from '../Khoa/QuanLyKhoa';
import QuanLyLop from '../LOP/ClassManagement';

// Mock data
const trainerInfo = {
    name: 'Nguyễn Văn A',
    id: 'DT001',
};
const mockStudents = [
    {
        id: 1,
        code: 'SV001',
        name: 'Nguyễn Văn A',
        class: 'LT01',
        status: 'active',
        credits: 120,
        gpa: 3.2,
        graduationStatus: 'eligible',
        hasDegree: false
    },
    {
        id: 2,
        code: 'SV002',
        name: 'Trần Thị B',
        class: 'LT01',
        status: 'active',
        credits: 115,
        gpa: 3.5,
        graduationStatus: 'eligible',
        hasDegree: true
    }
];

function TrainingDashboard() {
    const [currentTab, setCurrentTab] = useState(0);
    const [openAddTraining, setOpenAddTraining] = useState(false);
    const [openAddClass, setOpenAddClass] = useState(false);
    const [editingTraining, setEditingTraining] = useState(null);
    const [newTraining, setNewTraining] = useState({
        code: '',
        name: '',
        active: true,
    });
    const [trainingTypes, setTrainingTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [openGraduationCheck, setOpenGraduationCheck] = useState(false);
    const [openDegreeIssue, setOpenDegreeIssue] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const mockClasses = [
        { id: 1, code: 'LT01', trainingTypeId: 1, students: 35 },
        { id: 2, code: 'LT02', trainingTypeId: 1, students: 40 },
        { id: 3, code: 'TC01', trainingTypeId: 2, students: 45 },
    ];

    // Fetch training types from API on component mount
    useEffect(() => {
        fetchTrainingTypes();
    }, []);

    // Function to fetch training types from API
    const fetchTrainingTypes = async () => {
        setLoading(true);
        try {
            const response = await fetchDanhSachHeDaoTao();
            setTrainingTypes(response);
        } catch (error) {
            console.error('Error fetching training types:', error);
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách hệ đào tạo. Vui lòng thử lại!',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleAddTraining = async () => {
        // Validate code length
        if (newTraining.code.length > 5) {
            setSnackbar({
                open: true,
                message: 'Ký hiệu hệ đào tạo không được vượt quá 5 ký tự!',
                severity: 'error'
            });
            return;
        }

        // Validate required fields
        if (!newTraining.code || !newTraining.name) {
            setSnackbar({
                open: true,
                message: 'Vui lòng điền đầy đủ thông tin!',
                severity: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            if (editingTraining) {
                // Update existing training
                console.log(newTraining)
                console.log(editingTraining)
                await updateTraining(editingTraining.ma_he_dao_tao, newTraining);
                setSnackbar({
                    open: true,
                    message: 'Cập nhật hệ đào tạo thành công!',
                    severity: 'success'
                });
            } else {
                // Add new training
                await createTraining(newTraining);
                setSnackbar({
                    open: true,
                    message: 'Thêm hệ đào tạo thành công!',
                    severity: 'success'
                });
            }

            // Refresh the list
            fetchTrainingTypes();

            // Close dialog and reset form
            setOpenAddTraining(false);
            setEditingTraining(null);
            setNewTraining({ code: '', name: '', active: true });
        } catch (error) {
            console.error('Error adding/updating training:', error);
            setSnackbar({
                open: true,
                message: 'Đã xảy ra lỗi! Vui lòng thử lại.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditTraining = (training) => {
        setEditingTraining(training);
        setNewTraining({
            code: training.ma_he_dao_tao,
            name: training.ten_he_dao_tao,
            active: training.trang_thai
        });
        setOpenAddTraining(true);
    };

    const handleToggleTrainingStatus = async (id) => {
        setLoading(true);
        try {
            await toggleTrainingStatus(id);
            fetchTrainingTypes(); // Refresh the list after toggling
            setSnackbar({
                open: true,
                message: 'Cập nhật trạng thái thành công!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error toggling training status:', error);
            setSnackbar({
                open: true,
                message: 'Không thể cập nhật trạng thái. Vui lòng thử lại!',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const graduationSteps = ['Kiểm tra điều kiện', 'Xét duyệt', 'Hoàn thành'];

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('access_token');
        console.log('Logging out...');
        window.location.href = '/login';
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
                    <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                        <Tab label="Hệ đào tạo" />
                        <Tab label="Quản lý khóa" />
                        <Tab label="Quản lý lớp" />
                        <Tab label="Thống kê" />
                        <Tab label="Sinh viên" />
                        <Tab label="Xét tốt nghiệp" />
                        <Tab label="Quản lý bằng" />
                        <Tab label="Thống kê chi tiết" />
                    </Tabs>

                    {/* Training Types Tab */}
                    {currentTab === 0 && (
                        <Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenAddTraining(true)}
                                sx={{ mb: 3 }}
                                disabled={loading}
                            >
                                Thêm hệ đào tạo
                            </Button>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Ký hiệu</TableCell>
                                                <TableCell>Tên hệ đào tạo</TableCell>
                                                <TableCell >Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {trainingTypes.length > 0 ? (
                                                trainingTypes.map((type) => (
                                                    <TableRow key={type.id}>
                                                        <TableCell>{type.ma_he_dao_tao}</TableCell>
                                                        <TableCell>{type.ten_he_dao_tao}</TableCell>

                                                        <TableCell >
                                                            <IconButton
                                                                onClick={() => handleEditTraining(type)}
                                                                disabled={loading}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        Không có dữ liệu hệ đào tạo
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}

                    {currentTab === 1 && (
                        <Box>
                            <QuanLyKhoa />
                        </Box>
                    )}

                    {/* Classes Tab */}
                    {currentTab === 2 && (
                        <QuanLyLop />
                    )}

                    {/* Statistics Tab */}
                    {currentTab === 3 && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Thống kê điểm
                                        </Typography>
                                        <Button variant="outlined" startIcon={<FileDownloadIcon />}>
                                            Xuất điểm theo lớp
                                        </Button>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Biểu mẫu báo cáo
                                        </Typography>
                                        <Button variant="outlined" startIcon={<PrintIcon />}>
                                            In biểu mẫu tổng hợp
                                        </Button>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Add/Edit Training Type Dialog */}
                    <Dialog
                        open={openAddTraining}
                        onClose={() => {
                            setOpenAddTraining(false);
                            setEditingTraining(null);
                            setNewTraining({ code: '', name: '', active: true });
                        }}
                    >
                        <DialogTitle>
                            {editingTraining ? 'Sửa hệ đào tạo' : 'Thêm hệ đào tạo'}
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Ký hiệu"
                                fullWidth
                                margin="normal"
                                value={newTraining.code}
                                onChange={(e) => setNewTraining({ ...newTraining, code: e.target.value })}
                                inputProps={{ maxLength: 5 }}
                                helperText="Tối đa 5 ký tự"
                                required
                                error={!newTraining.code}
                                disabled={loading}
                            />
                            <TextField
                                label="Tên hệ đào tạo"
                                fullWidth
                                margin="normal"
                                value={newTraining.name}
                                onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
                                required
                                error={!newTraining.name}
                                disabled={loading}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={newTraining.active}
                                        onChange={(e) => setNewTraining({ ...newTraining, active: e.target.checked })}
                                        disabled={loading}
                                    />
                                }
                                label="Hoạt động"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setOpenAddTraining(false);
                                    setEditingTraining(null);
                                    setNewTraining({ code: '', name: '', active: true });
                                }}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAddTraining}
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : (editingTraining ? 'Cập nhật' : 'Thêm')}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Student Management Tab */}
                    {currentTab === 4 && (
                        <StudentManagement />
                    )}

                    {/* Graduation Eligibility Tab */}
                    {currentTab === 5 && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Xét điều kiện tốt nghiệp
                                        </Typography>

                                        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
                                            {graduationSteps.map((label) => (
                                                <Step key={label}>
                                                    <StepLabel>{label}</StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>

                                        <Box sx={{ mt: 2 }}>
                                            {activeStep === 0 && (
                                                <Box>
                                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                                        <Autocomplete
                                                            options={mockStudents}
                                                            getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                                            renderInput={(params) => (
                                                                <TextField {...params} label="Chọn sinh viên" />
                                                            )}
                                                            onChange={(event, newValue) => setSelectedStudent(newValue)}
                                                        />
                                                    </FormControl>

                                                    {selectedStudent && (
                                                        <Card sx={{ mt: 2 }}>
                                                            <CardContent>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={6}>
                                                                        <Typography color="textSecondary">Số tín chỉ tích lũy</Typography>
                                                                        <Typography variant="h6">
                                                                            {selectedStudent.credits}/130
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography color="textSecondary">GPA</Typography>
                                                                        <Typography variant="h6">
                                                                            {selectedStudent.gpa}/4.0
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                    )}
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
                                                    disabled={!selectedStudent}
                                                >
                                                    {activeStep === graduationSteps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                                                </Button>
                                            </Box>
                                        </Box>
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
                                                • Hoàn thành các môn bắt buộc
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Degree Management Tab */}
                    {currentTab === 6 && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Mã SV</TableCell>
                                                    <TableCell>Họ tên</TableCell>
                                                    <TableCell>Ngày xét TN</TableCell>
                                                    <TableCell>Trạng thái bằng</TableCell>
                                                    <TableCell align="right">Thao tác</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {mockStudents.map((student) => (
                                                    <TableRow key={student.id}>
                                                        <TableCell>{student.code}</TableCell>
                                                        <TableCell>{student.name}</TableCell>
                                                        <TableCell>20/01/2024</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={student.hasDegree ? "Đã cấp bằng" : "Chưa cấp bằng"}
                                                                color={student.hasDegree ? "success" : "default"}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<PrintIcon />}
                                                                onClick={() => { }}
                                                                disabled={!student.hasDegree}
                                                            >
                                                                In xác nhận
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Detailed Statistics Tab */}
                    {currentTab === 7 && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Thống kê điểm theo lớp
                                        </Typography>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Lớp</InputLabel>
                                            <Select value="" label="Lớp">
                                                <MenuItem value="LT01">LT01</MenuItem>
                                                <MenuItem value="LT02">LT02</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button variant="outlined" startIcon={<FileDownloadIcon />}>
                                            Xuất báo cáo
                                        </Button>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Thống kê tốt nghiệp
                                        </Typography>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Khóa</InputLabel>
                                            <Select value="" label="Khóa">
                                                <MenuItem value="2020">2020</MenuItem>
                                                <MenuItem value="2021">2021</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button variant="outlined" startIcon={<BarChartIcon />}>
                                            Xem biểu đồ
                                        </Button>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>

                {/* Add Student Dialog */}
                <Dialog open={openAddStudent} onClose={() => setOpenAddStudent(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Thêm sinh viên mới</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Họ và tên"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Ngày sinh"
                                    type="date"
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="CCCD"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Lớp</InputLabel>
                                    <Select label="Lớp">
                                        <MenuItem value="LT01">LT01</MenuItem>
                                        <MenuItem value="LT02">LT02</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Địa chỉ"
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddStudent(false)}>Hủy</Button>
                        <Button variant="contained">Thêm</Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default TrainingDashboard;