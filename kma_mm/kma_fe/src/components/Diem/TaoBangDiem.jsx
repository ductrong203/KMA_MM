import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getDanhSachLopTheoKhoaDaoTao, getLopHocById } from '../../Api_controller/Service/lopService';
import { getDanhSachMonHocTheoKhoaVaKi } from '../../Api_controller/Service/monHocService';
import api from '../../Api_controller/Api_setup/axiosConfig';
import { getThoiKhoaBieu } from '../../Api_controller/Service/thoiKhoaBieuService';
import { layDanhSachSinhVienTheoTKB, taoBangDiemChoSinhVien } from '../../Api_controller/Service/diemService';

// Assuming you have an API base URL
const API_BASE_URL = 'https://your-api-base-url.com/api';

function TaoBangDiem({ sampleStudents }) {
    // State variables for form selection
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [examPeriod, setExamPeriod] = useState('');
    const [educationType, setEducationType] = useState('');
    const [educationTypeOptions, setEducationTypeOptions] = useState([]);
    const [batch, setBatch] = useState('');
    const [batchOptions, setBatchOptions] = useState([]);
    const [classGroup, setClassGroup] = useState('');
    const [classOptions, setClassOptions] = useState([]);
    const [course, setCourse] = useState('');
    const [courseOptions, setCourseOptions] = useState([]);
    const [major, setMajor] = useState('');
    const [examNumber, setExamNumber] = useState('');
    const [students, setStudents] = useState([]);

    // State variables for loading indicators
    const [loading, setLoading] = useState(false);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // State variables for student dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [filterEducationType, setFilterEducationType] = useState('');
    const [filterBatch, setFilterBatch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);

    // Schedule IDs for API calls
    const [scheduleId, setScheduleId] = useState(null);
    const [gradeSheetId, setGradeSheetId] = useState(null);

    // Sample education types - replace with API call
    useEffect(() => {
        const fetchEducationTypes = async () => {
            try {
                const response = await fetchDanhSachHeDaoTao()
                setEducationTypeOptions(response);
            } catch (error) {
                console.error('Error fetching education types:', error);
                // Fallback to sample data
                setEducationTypeOptions([
                    { id: 'CQ', name: 'Chính quy' },
                    { id: 'LT', name: 'Liên thông' },
                    { id: 'VLVH', name: 'Vừa làm vừa học' }
                ]);
            }
        };

        fetchEducationTypes();
    }, []);

    // Fetch batches when education type changes
    useEffect(() => {
        if (!educationType) return;

        const fetchBatches = async () => {
            setLoadingBatches(true);
            setBatch('');
            setClassGroup('');
            setCourse('');
            try {
                const response = await getDanhSachKhoaTheoDanhMucDaoTao(educationType)
                setBatchOptions(response);
            } catch (error) {
                console.error('Error fetching batches:', error);
                // Fallback to sample data
                setBatchOptions([
                    { id: 'K14', name: 'K14' },
                    { id: 'K15', name: 'K15' },
                    { id: 'K16', name: 'K16' }
                ]);
            } finally {
                setLoadingBatches(false);
            }
        };

        fetchBatches();
    }, [educationType]);

    // Fetch classes when batch changes
    useEffect(() => {
        if (!batch) return;

        const fetchClasses = async () => {
            setLoadingClasses(true);
            setClassGroup('');
            setCourse('');
            try {
                const response = await getDanhSachLopTheoKhoaDaoTao(batch)
                setClassOptions(response);
            } catch (error) {
                console.error('Error fetching classes:', error);
                // Fallback to sample data
                setClassOptions([
                    { id: 'CT6', name: 'CT6' },
                    { id: 'CT7', name: 'CT7' },
                    { id: 'CT8', name: 'CT8' }
                ]);
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, [batch]);

    // Fetch courses when class and semester change
    useEffect(() => {
        if (!classGroup || !batch || !semester) return;
    
        const fetchCourses = async () => {
            setLoadingCourses(true);
            setCourse(''); // Reset course selection
            try {
                // Lấy danh sách môn học từ API /courses
                const response = await getDanhSachMonHocTheoKhoaVaKi( {
                            khoa_dao_tao_id: batch,
                            ky_hoc: semester
                    })
                    console.log(response)
    
                // Lấy danh sách ID môn học
                const courseIds = response.map(course => course.mon_hoc_id);
                console.log(courseIds)
                // Gọi API /mon-hoc/details để lấy chi tiết các môn học
                const courseDetailsResponse = await axios.get(`http://localhost:8000/mon-hoc/chitiet`, {
                    params: { ids: courseIds.join(',') }
                });
                console.log("courseDetailsResponse",courseDetailsResponse)
    
                // Gộp dữ liệu từ hai API
                const coursesWithDetails = response.map(course => {
                    const details = courseDetailsResponse.data.data.find(
                        detail => detail.id === course.mon_hoc_id
                    );
                    return {
                        ...course,
                        ten_mon_hoc: details?.ten_mon_hoc || 'Unknown'
                    };
                });
                console.log(coursesWithDetails)
    
                // Cập nhật state với danh sách môn học đã gộp
                setCourseOptions(coursesWithDetails);
            } catch (error) {
                console.error('Error fetching courses:', error);
                // Fallback to sample data in case of error
                setCourseOptions([
                    { id: 'WEB', name: 'Lập trình Web' },
                    { id: 'JAVA', name: 'Lập trình Java' },
                    { id: 'DB', name: 'Cơ sở dữ liệu' },
                    { id: 'AI', name: 'Trí tuệ nhân tạo' },
                    { id: 'DS', name: 'Cấu trúc dữ liệu' }
                ]);
            } finally {
                setLoadingCourses(false);
            }
        };
    
        fetchCourses();
    }, [classGroup, batch, semester]);

    // Find schedule ID when course and class are selected
    useEffect(() => {
        if (!classGroup || !course) return;

        const fetchScheduleId = async () => {
            setLoading(true);
            try {
                // const response = await axios.get(`${API_BASE_URL}/schedules`, {
                //     params: {
                //         classId: classGroup,
                //         courseId: course
                //     }
                // });
                const response = await getThoiKhoaBieu(classGroup, course, semester)
                console.log(response.data)
                setScheduleId(response.data[0].id);
            } catch (error) {
                console.error('Error fetching schedule ID:', error);
                // Mock schedule ID for testing
                setScheduleId('SCH001');
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleId();
    }, [classGroup, course]);
    console.log("scheduleId:",scheduleId)

    const handleCreateGradeSheet = async () => {
        if (!scheduleId) {
            alert('Vui lòng chọn đầy đủ thông tin để tạo bảng điểm');
            return;
        }
        setLoadingStudents(true);
        try {
            // Gọi hàm tạo bảng điểm với scheduleId
            const gradeSheetResponse = await taoBangDiemChoSinhVien({thoi_khoa_bieu_id:scheduleId});
            console.log('Grade sheet response:', gradeSheetResponse); // Debug response
    
            const newGradeSheetId = gradeSheetResponse.data[0].id;
            if (!newGradeSheetId) {
                throw new Error('Không nhận được ID bảng điểm từ server');
            }
            setGradeSheetId(newGradeSheetId);
    
            // Lấy danh sách sinh viên cho bảng điểm
            const studentsResponse = await layDanhSachSinhVienTheoTKB(scheduleId)
            console.log("studentsResponse:",studentsResponse)
    
            // Chuyển đổi dữ liệu sinh viên
            const formattedStudents = await Promise.all(
                studentsResponse.data.map(async (student) => {
                    // Gọi API để lấy thông tin lớp dựa trên lop_id
                    const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
                    const maLop = lopInfo?.ma_lop || student.lop_id;
    
                    return {
                        ma_sinh_vien: student.sinh_vien.ma_sinh_vien,
                        ho_dem: student.sinh_vien.ho_dem,
                        ten: student.sinh_vien.ten,
                        lop: maLop, // Gán mã lớp thay vì lop_id
                        lan_hoc: student.lan_hoc || 'Học lần 1',
                        diem: {
                            TP1: student.diem?.TP1 || null,
                            TP2: student.diem?.TP2 || null,
                            CK1: student.diem?.CK1 || null,
                            CK2: student.diem?.CK2 || null
                        },
                        retakeRegistered: student.retakeRegistered || false
                    };
                })
            );
    console.log(formattedStudents)
            setStudents(formattedStudents);
    
            if (formattedStudents.length > 0) {
                alert(`Đã tạo bảng điểm với ${formattedStudents.length} sinh viên.`);
            } else {
                alert('Không tìm thấy sinh viên nào phù hợp với các tiêu chí đã chọn.');
            }
        } catch (error) {
            console.error('Error creating grade sheet:', error);
            alert('Có lỗi xảy ra khi tạo bảng điểm. Vui lòng thử lại sau.');
    
            // Fallback to sample data
            const allStudents = [
                {
                    id: 'SV001',
                    name: 'Lê Hoài Nam',
                    class: 'CT6',
                    batch: 'K15',
                    major: 'CNTT',
                    educationType: 'CQ',
                    status: 'Thi lần 1',
                    examNumber: '1',
                    diem: { TP1: null, TP2: null, CK1: null, CK2: null }
                },
                // ... other sample students
            ];
    
            let filteredStudents = [...allStudents];
            if (classGroup && classGroup !== 'ALL') {
                filteredStudents = filteredStudents.filter(student => student.class === classGroup);
            }
            if (batch) {
                filteredStudents = filteredStudents.filter(student => student.batch === batch);
            }
            if (educationType) {
                filteredStudents = filteredStudents.filter(student => student.educationType === educationType);
            }
    
            setStudents(filteredStudents);
        } finally {
            setLoadingStudents(false);
        }
    };
    // Kiểm tra xem điểm giữa kỳ có đạt yêu cầu để nhập điểm cuối kỳ không
    const canEnterFinalExamScore = (student) => {
        const midtermScoreTP1 = student.diem.TP1;
        const midtermScoreTP2 = student.diem.TP2;

        // Cả hai điểm thành phần phải được nhập và >= 4.0 mới cho phép nhập điểm cuối kỳ
        return (
            midtermScoreTP1 !== null &&
            midtermScoreTP1 !== undefined &&
            midtermScoreTP1 >= 4.0 &&
            midtermScoreTP2 !== null &&
            midtermScoreTP2 !== undefined &&
            midtermScoreTP2 >= 4.0
        );
    };

    const handleScoreChange = async (studentId, scoreType, value) => {
        // Chuyển đổi giá trị nhập vào thành số thực hoặc null nếu trống
        const numericValue = value === '' ? null : parseFloat(value);

        setStudents(prevStudents =>
            prevStudents.map(student => {
                if (student.id === studentId) {
                    // Nếu đang cập nhật điểm cuối kỳ nhưng điểm giữa kỳ không đạt yêu cầu
                    if ((scoreType === 'CK1' || scoreType === 'CK2') && !canEnterFinalExamScore(student)) {
                        alert(`Không thể nhập điểm cuối kỳ cho sinh viên ${student.name}. Điểm giữa kỳ (TP1 và TP2) phải lớn hơn hoặc bằng 4.0.`);
                        return student; // Không thay đổi điểm
                    }

                    // Cập nhật điểm
                    return {
                        ...student,
                        diem: {
                            ...student.diem,
                            [scoreType]: numericValue
                        }
                    };
                }
                return student;
            })
        );

        // Update score in API
        if (gradeSheetId) {
            try {
                await axios.put(`${API_BASE_URL}/grade-sheets/${gradeSheetId}/students/${studentId}/diem`, {
                    scoreType: scoreType,
                    value: numericValue
                });
            } catch (error) {
                console.error('Error updating score:', error);
                alert('Có lỗi xảy ra khi cập nhật điểm. Vui lòng thử lại.');
            }
        }
    };

    const handleRetakeRegistration = async (studentId, checked) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === studentId
                    ? { ...student, retakeRegistered: checked }
                    : student
            )
        );

        // Update retake registration in API
        if (gradeSheetId) {
            try {
                await axios.put(`${API_BASE_URL}/grade-sheets/${gradeSheetId}/students/${studentId}/retake`, {
                    retakeRegistered: checked
                });
            } catch (error) {
                console.error('Error updating retake registration:', error);
                alert('Có lỗi xảy ra khi cập nhật đăng ký học lại. Vui lòng thử lại.');
            }
        }
    };

    const handleOpenDialog = async () => {
        setOpenDialog(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/students`);
            setFilteredStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            // Fallback to sample data
            setFilteredStudents([
                {
                    id: 'SV001',
                    name: 'Lê Hoài Nam',
                    class: 'CT6',
                    batch: 'K15',
                    educationType: 'CQ',
                },
                // ... other sample students
            ]);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        // Reset form
        setStudentId('');
        setFilterEducationType('');
        setFilterBatch('');
        setFilterClass('');
    };

    const handleAddRetakeStudent = async () => {
        if (!studentId || !gradeSheetId) {
            alert('Vui lòng chọn sinh viên và tạo bảng điểm trước');
            return;
        }

        try {
            // Add retake student to grade sheet
            const response = await axios.post(`${API_BASE_URL}/grade-sheets/${gradeSheetId}/retake-students`, {
                studentId: studentId
            });

            if (response.data.success) {
                // Get the student details
                const studentResponse = await axios.get(`${API_BASE_URL}/students/${studentId}`);
                const retakeStudent = studentResponse.data;

                // Format student data
                const newStudent = {
                    id: retakeStudent.id,
                    name: retakeStudent.name,
                    class: retakeStudent.className,
                    batch: retakeStudent.batchName,
                    major: retakeStudent.majorName,
                    educationType: retakeStudent.educationTypeId,
                    status: 'Học lại',
                    examNumber: '1',
                    diem: { TP1: null, TP2: null, CK1: null, CK2: null }
                };

                // Add to local state
                setStudents(prevStudents => [...prevStudents, newStudent]);
                alert(`Đã thêm sinh viên ${newStudent.name} vào danh sách học lại.`);
            } else {
                alert('Không thể thêm sinh viên vào danh sách học lại.');
            }
        } catch (error) {
            console.error('Error adding retake student:', error);
            alert('Có lỗi xảy ra khi thêm sinh viên học lại. Vui lòng thử lại.');
        }

        handleCloseDialog();
    };

    // Lọc sinh viên trong dialog
    const getFilteredStudents = () => {
        let filtered = [...filteredStudents];

        if (filterEducationType) {
            filtered = filtered.filter(s => s.educationType === filterEducationType);
        }

        if (filterBatch) {
            filtered = filtered.filter(s => s.batch === filterBatch);
        }

        if (filterClass) {
            filtered = filtered.filter(s => s.class === filterClass);
        }

        return filtered;
    };

    const handleSelectStudent = (id) => {
        setStudentId(id);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Tạo Bảng Điểm
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Hệ đào tạo</InputLabel>
                        <Select
                            value={educationType}
                            label="Hệ đào tạo"
                            onChange={(e) => setEducationType(e.target.value)}
                        >
                            {educationTypeOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.ten_he_dao_tao}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Khóa</InputLabel>
                        <Select
                            value={batch}
                            label="Khóa"
                            onChange={(e) => setBatch(e.target.value)}
                            disabled={!educationType || loadingBatches}
                        >
                            {loadingBatches ? (
                                <MenuItem value="">
                                    <CircularProgress size={20} />
                                </MenuItem>
                            ) : (
                                batchOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.ma_khoa}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Học kỳ</InputLabel>
                        <Select
                            value={semester}
                            label="Học kỳ"
                            onChange={(e) => setSemester(e.target.value)}
                        >
                            <MenuItem value="1">Học kỳ 1</MenuItem>
                            <MenuItem value="2">Học kỳ 2</MenuItem>
                            <MenuItem value="3">Học kỳ 3</MenuItem>
                            <MenuItem value="4">Học kỳ 4</MenuItem>
                            <MenuItem value="5">Học kỳ 5</MenuItem>
                            <MenuItem value="6">Học kỳ 6</MenuItem>
                            <MenuItem value="7">Học kỳ 7</MenuItem>
                            <MenuItem value="8">Học kỳ 8</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Đợt học</InputLabel>
                        <Select
                            value={examPeriod}
                            label="Đợt học"
                            onChange={(e) => setExamPeriod(e.target.value)}
                        >
                            <MenuItem value="1">Đợt 1</MenuItem>
                            <MenuItem value="2">Đợt 2</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Lớp</InputLabel>
                        <Select
                            value={classGroup}
                            label="Lớp"
                            onChange={(e) => setClassGroup(e.target.value)}
                            disabled={!batch || loadingClasses}
                        >
                            {loadingClasses ? (
                                <MenuItem value="">
                                    <CircularProgress size={20} />
                                </MenuItem>
                            ) : (
                                classOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.ma_lop}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Học phần</InputLabel>
                        <Select
                            value={course}
                            label="Học phần"
                            onChange={(e) => setCourse(e.target.value)}
                            disabled={!classGroup || !semester || loadingCourses}
                        >
                            {loadingCourses ? (
                                <MenuItem value="">
                                    <CircularProgress size={20} />
                                </MenuItem>
                            ) : (
                                courseOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                       {option.ten_mon_hoc || option.name || option.mon_hoc_id}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Lần thi</InputLabel>
                        <Select
                            value={examNumber}
                            label="Lần thi"
                            onChange={(e) => setExamNumber(e.target.value)}
                        >
                            <MenuItem value="1">Lần 1</MenuItem>
                            <MenuItem value="2">Lần 2 (Thi lại)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<NoteAddIcon />}
                        onClick={handleCreateGradeSheet}
                        disabled={!course || loading || loadingStudents}
                        sx={{ height: '56px' }}
                    >
                        {loadingStudents ? <CircularProgress size={24} color="inherit" /> : 'Tạo Bảng Điểm'}
                    </Button>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                    Lưu ý: Chỉ có thể nhập điểm cuối kỳ (CK) khi điểm giữa kỳ (TP1 và TP2) đều lớn hơn hoặc bằng 4.0
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={handleOpenDialog}
                    disabled={!gradeSheetId}
                >
                    Thêm Sinh Viên Học Lại
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="grade table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã SV</TableCell>
                            <TableCell>Họ đệm</TableCell>
                            <TableCell>Tên</TableCell>
                            <TableCell>Lớp</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>TP1</TableCell>
                            <TableCell>TP2</TableCell>
                            <TableCell>CK lần 1</TableCell>
                            <TableCell>CK lần 2</TableCell>
                            <TableCell>Đăng ký học lại</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loadingStudents ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : students.length > 0 ? (
                            students.map((student) => {
                                const canEnterFinal = canEnterFinalExamScore(student);

                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.ma_sinh_vien}</TableCell>
                                        <TableCell>{student.ho_dem}</TableCell>
                                        <TableCell>{student.ten}</TableCell>
                                        <TableCell>{student.lop}</TableCell>
                                        <TableCell>{student.lan_hoc}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                value={student.diem.TP1 === null ? '' : student.diem.TP1}
                                                onChange={(e) => handleScoreChange(student.id, 'TP1', e.target.value)}
                                                sx={{ width: '70px' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                value={student.diem.TP2 === null ? '' : student.diem.TP2}
                                                onChange={(e) => handleScoreChange(student.id, 'TP2', e.target.value)}
                                                sx={{ width: '70px' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={!canEnterFinal ? "Điểm giữa kỳ TP1 và TP2 phải ≥ 4.0 để nhập điểm cuối kỳ" : ""}>
                                                <span>
                                                    <TextField
                                                        type="number"
                                                        inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                        value={student.diem.CK1 === null ? '' : student.diem.CK1}
                                                        onChange={(e) => handleScoreChange(student.id, 'CK1', e.target.value)}
                                                        sx={{ width: '70px' }}
                                                        disabled={!canEnterFinal}
                                                        error={!canEnterFinal && student.diem.CK1 !== null}
                                                    />
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={!canEnterFinal ? "Điểm giữa kỳ TP1 và TP2 phải ≥ 4.0 để nhập điểm cuối kỳ" : ""}>
                                                <span>
                                                    <TextField
                                                        type="number"
                                                        inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                        value={student.diem.CK2 === null ? '' : student.diem.CK2}
                                                        onChange={(e) => handleScoreChange(student.id, 'CK2', e.target.value)}
                                                        sx={{ width: '70px' }}
                                                        disabled={!canEnterFinal}
                                                        error={!canEnterFinal && student.diem.CK2 !== null}
                                                    />
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={student.retakeRegistered || false}
                                                        onChange={(e) => handleRetakeRegistration(student.id, e.target.checked)}
                                                    />
                                                }
                                                label=""
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <Typography variant="body1" color="textSecondary">
                                        Chưa có dữ liệu. Vui lòng tạo bảng điểm trước.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog thêm sinh viên học lại */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Thêm Sinh Viên Học Lại</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Mã Sinh Viên"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Hoặc lọc theo:
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Hệ đào tạo</InputLabel>
                                <Select
                                    value={filterEducationType}
                                    label="Hệ đào tạo"
                                    onChange={(e) => setFilterEducationType(e.target.value)}
                                >
                                    {educationTypeOptions.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Khóa</InputLabel>
                                <Select
                                    value={filterBatch}
                                    label="Khóa"
                                    onChange={(e) => setFilterBatch(e.target.value)}
                                >
                                    {batchOptions.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Lớp</InputLabel>
                                <Select
                                    value={filterClass}
                                    label="Lớp"
                                    onChange={(e) => setFilterClass(e.target.value)}
                                >
                                    {classOptions.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã SV</TableCell>
                                    <TableCell>Họ và tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Khóa</TableCell>
                                    <TableCell>Hệ đào tạo</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFilteredStudents().length > 0 ? (
                                    getFilteredStudents().map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.class}</TableCell>
                                            <TableCell>{student.batch}</TableCell>
                                            <TableCell>
                                                {educationTypeOptions.find(et => et.id === student.educationType)?.name || student.educationType}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleSelectStudent(student.id)}
                                                >
                                                    Chọn
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Không tìm thấy sinh viên phù hợp
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleAddRetakeStudent}
                        color="primary"
                        variant="contained"
                        disabled={!studentId}
                    >
                        Thêm vào danh sách học lại
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Các nút hành động chính */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={!gradeSheetId || loadingStudents}
                >
                    Xuất Excel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!gradeSheetId || loadingStudents}
                >
                    Lưu Bảng Điểm
                </Button>
            </Box>
        </Paper>
    );
}

export default TaoBangDiem;