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
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { createTraining } from "../../Api_controller/Service/trainingService";
import StudentManagement from '../QLHV/StudentManagement ';
import ClassManagement from '../LOP/ClassManagement';

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
const mockTrainingTypes = [
    { id: 1, code: 'LT', name: 'Liên thông', active: true },
    { id: 2, code: 'TC', name: 'Tại chức', active: true },
    { id: 3, code: 'VL', name: 'Vừa làm vừa học', active: false },
];

const mockClasses = [
    { id: 1, code: 'LT01', trainingTypeId: 1, students: 35 },
    { id: 2, code: 'LT02', trainingTypeId: 1, students: 40 },
    { id: 3, code: 'TC01', trainingTypeId: 2, students: 45 },
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
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [openGraduationCheck, setOpenGraduationCheck] = useState(false);
    const [openDegreeIssue, setOpenDegreeIssue] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleAddTraining = async () => {
        // Validate code length
        if (newTraining.code.length > 5) {
            alert('Ký hiệu hệ đào tạo không được vượt quá 5 ký tự!');
            return;
        }
        // Add training type logic here
        await createTraining(newTraining)
        setOpenAddTraining(false);
        setNewTraining({ code: '', name: '', active: true });
    };

    const handleEditTraining = (training) => {
        setEditingTraining(training);
        setNewTraining(training);
        setOpenAddTraining(true);
    };

    const graduationSteps = ['Kiểm tra điều kiện', 'Xét duyệt', 'Hoàn thành'];

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleLogout = () => {
        localStorage.removeItem('role')
        localStorage.removeItem('access_token')
        console.log('Logging out...');
        window.location.href = '/login'
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
                    <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                        <Tab label="Hệ đào tạo" />
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
                            >
                                Thêm hệ đào tạo
                            </Button>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ký hiệu</TableCell>
                                            <TableCell>Tên hệ đào tạo</TableCell>
                                            <TableCell align="center">Trạng thái</TableCell>
                                            <TableCell align="right">Thao tác</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mockTrainingTypes.map((type) => (
                                            <TableRow key={type.id}>
                                                <TableCell>{type.code}</TableCell>
                                                <TableCell>{type.name}</TableCell>
                                                <TableCell align="center">
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={type.active}
                                                                onChange={() => { }}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={type.active ? "Đang hoạt động" : "Không hoạt động"}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton onClick={() => handleEditTraining(type)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* Classes Tab */}
                    {currentTab === 1 && (
                        <ClassManagement />
                    )}

                    {/* Statistics Tab */}
                    {currentTab === 2 && (
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
                </Paper>

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
                        />
                        <TextField
                            label="Tên hệ đào tạo"
                            fullWidth
                            margin="normal"
                            value={newTraining.name}
                            onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newTraining.active}
                                    onChange={(e) => setNewTraining({ ...newTraining, active: e.target.checked })}
                                />
                            }
                            label="Hoạt động"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddTraining(false)}>Hủy</Button>
                        <Button onClick={handleAddTraining} variant="contained">
                            {editingTraining ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Student Management Tab */}
                {currentTab === 3 && (
                    // <Box>
                    //     <Button
                    //         variant="contained"
                    //         startIcon={<PersonAddIcon />}
                    //         onClick={() => setOpenAddStudent(true)}
                    //         sx={{ mb: 3 }}
                    //     >
                    //         Thêm sinh viên
                    //     </Button>

                    //     <TableContainer>
                    //         <Table>
                    //             <TableHead>
                    //                 <TableRow>
                    //                     <TableCell>Mã SV</TableCell>
                    //                     <TableCell>Họ tên</TableCell>
                    //                     <TableCell>Lớp</TableCell>
                    //                     <TableCell>Số tín chỉ</TableCell>
                    //                     <TableCell>GPA</TableCell>
                    //                     <TableCell align="right">Thao tác</TableCell>
                    //                 </TableRow>
                    //             </TableHead>
                    //             <TableBody>
                    //                 {mockStudents.map((student) => (
                    //                     <TableRow key={student.id}>
                    //                         <TableCell>{student.code}</TableCell>
                    //                         <TableCell>{student.name}</TableCell>
                    //                         <TableCell>{student.class}</TableCell>
                    //                         <TableCell>{student.credits}</TableCell>
                    //                         <TableCell>{student.gpa}</TableCell>
                    //                         <TableCell align="right">
                    //                             <IconButton onClick={() => { }}>
                    //                                 <EditIcon />
                    //                             </IconButton>
                    //                             <IconButton onClick={() => { }}>
                    //                                 <FileDownloadIcon />
                    //                             </IconButton>
                    //                         </TableCell>
                    //                     </TableRow>
                    //                 ))}
                    //             </TableBody>
                    //         </Table>
                    //     </TableContainer>
                    // </Box>
                    <StudentManagement />
                )}

                {/* Graduation Eligibility Tab */}
                {currentTab === 4 && (
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
                {currentTab === 5 && (
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
                {currentTab === 6 && (
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
            </Container>
        </Box>
    );
}

export default TrainingDashboard;