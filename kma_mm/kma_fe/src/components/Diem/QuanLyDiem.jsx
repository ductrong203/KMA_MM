import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
    Alert,
    Badge,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { layDanhSachSinhVienTheoTKB, nhapDiem } from '../../Api_controller/Service/diemService';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getDanhSachLopTheoKhoaDaoTao, getLopHocById } from '../../Api_controller/Service/lopService';
import { getDanhSachMonHocTheoKhoaVaKi } from '../../Api_controller/Service/monHocService';
import { getThoiKhoaBieu } from '../../Api_controller/Service/thoiKhoaBieuService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import axios from 'axios';
import { exportDanhSachDiem, importDanhSachDiem } from '../../Api_controller/Service/excelService';

function QuanLyDiem({ onSave, sampleStudents }) {
    const fileInputRef = useRef(null);
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
    const [activeTab, setActiveTab] = useState(0);
    const [activeGradeTab, setActiveGradeTab] = useState(0);
    // ... (các state hiện có)
    const [scheduleId, setScheduleId] = useState(null);
    const [gradeSheetId, setGradeSheetId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleGradeTabChange = (event, newValue) => {
        setActiveGradeTab(newValue);
    };

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
                const response = await getDanhSachMonHocTheoKhoaVaKi({
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

                // Gộp dữ liệu từ hai API
                const coursesWithDetails = response.map(course => {
                    const details = courseDetailsResponse.data.data.find(
                        detail => detail.id === course.mon_hoc_id
                    );
                    return {
                        id: course.mon_hoc_id, // Sử dụng mon_hoc_id làm id
                        ten_mon_hoc: details?.ten_mon_hoc || 'Unknown'
                    };
                });
                console.log("coursesWithDetails", coursesWithDetails)

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
                const response = await getThoiKhoaBieu(course, classGroup, semester)
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
    console.log("scheduleId:", scheduleId)


    // Thêm hàm xử lý chức năng tìm kiếm
    const handleSearch = async () => {
        if (!batch || !classGroup || !semester || !course) {
            alert('Vui lòng chọn đầy đủ thông tin để tìm kiếm sinh viên');
            return;
        }
        setLoadingStudents(true);
        try {
            // Lấy danh sách sinh viên theo filter
            const response = await layDanhSachSinhVienTheoTKB(scheduleId);
            console.log("searchResponse:", response);

            // Chuyển đổi dữ liệu sinh viên
            const formattedStudents = await Promise.all(
                response.data.map(async (student) => {
                    // Gọi API để lấy thông tin lớp dựa trên lop_id
                    const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
                    const maLop = lopInfo?.ma_lop || student.lop_id;

                    return {
                        id: student.id,
                        sinh_vien_id: student.sinh_vien_id,
                        ma_sinh_vien: student.sinh_vien.ma_sinh_vien,
                        ho_dem: student.sinh_vien.ho_dem,
                        ten: student.sinh_vien.ten,
                        lop: maLop,
                        lan_hoc: student.lan_hoc ? 'Học lần ' + student.lan_hoc : 'Học lần 1',
                        diem: {
                            TP1: student.diem_tp1 || null,
                            TP2: student.diem_tp2 || null,
                            CK1: student.diem_ck || null,
                            CK2: student.diem_ck2 || null
                        },
                        retakeRegistered: student.retakeRegistered || false
                    };
                })
            );
            console.log(formattedStudents);
            setStudents(formattedStudents);

            if (formattedStudents.length > 0) {
                alert(`Đã tìm thấy ${formattedStudents.length} sinh viên.`);
            } else {
                alert('Không tìm thấy sinh viên nào phù hợp với các tiêu chí đã chọn.');
            }
        } catch (error) {
            console.error('Error searching students:', error);
            alert('Có lỗi xảy ra khi tìm kiếm sinh viên. Vui lòng thử lại sau.');
        } finally {
            setLoadingStudents(false);
        }
    };

    // Sinh viên đủ điều kiện thi CK khi điểm TP1 >= 4.0
    const canTakeFinalExam = (student) => {
        return student.diem.TP1 !== null && student.diem.TP1 !== undefined && student.diem.TP1 >= 4.0;
    };

    // Sinh viên đủ điều kiện thi lại khi điểm CK1 < 4.0
    const eligibleForRetake = (student) => {
        return student.diem.CK1 !== null && student.diem.CK1 !== undefined && student.diem.CK1 < 4.0;
    };

    const handleMidtermScoreChange = (studentId, scoreType, value) => {
        const numericValue = value === '' ? null : parseFloat(value);
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.ma_sinh_vien === studentId
                    ? { ...student, diem: { ...student.diem, [scoreType]: numericValue } }
                    : student
            )
        );
    };

    const handleFinalScoreChange = (studentId, scoreType, value) => {
        const numericValue = value === '' ? null : parseFloat(value);
        setStudents(prevStudents =>
            prevStudents.map(student => {
                if (student.ma_sinh_vien === studentId) {
                    // Kiểm tra điều kiện dự thi cuối kỳ
                    if (!canTakeFinalExam(student)) {
                        alert(`Không thể nhập điểm cuối kỳ cho sinh viên ${student.name}. Điểm giữa kỳ (TP1) phải lớn hơn hoặc bằng 4.0.`);
                        return student;
                    }

                    // Kiểm tra điều kiện thi lại (CK2)
                    if (scoreType === 'CK2' && !eligibleForRetake(student)) {
                        alert(`Không thể nhập điểm thi lại cho sinh viên ${student.name}. Điểm thi lần 1 (CK1) phải nhỏ hơn 4.0.`);
                        return student;
                    }

                    return { ...student, diem: { ...student.diem, [scoreType]: numericValue } };
                }
                return student;
            })
        );
    };

    const handleRetakeRegistration = (studentId, checked) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === studentId ? { ...student, retakeRegistered: checked } : student
            )
        );
    };

    const handleSave = async () => {
        try {
            // Chuẩn bị dữ liệu để gửi lên API
            const dataToSave = students.map(student => ({
                id: student.id,
                sinh_vien_id: student.sinh_vien_id,
                diem_tp1: student.diem.TP1,
                diem_tp2: student.diem.TP2,
                diem_ck: student.diem.CK1,
                diem_ck2: student.diem.CK2,
                thoi_khoa_bieu_id: scheduleId // Thêm scheduleId nếu API yêu cầu
            }));

            // Gọi API để lưu điểm
            const response = await nhapDiem(dataToSave)
            console.log(response)
            // Xử lý phản hồi từ API
            if (response.data) {
                alert('Đã lưu điểm thành công!');
                // if (onSave) onSave(students); // Gọi callback nếu có
            } else {
                alert('Lưu điểm thất bại: ' + response.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi lưu điểm:', error);
            alert('Có lỗi xảy ra khi lưu điểm. Vui lòng thử lại.');
        }
    };

    // Tính toán các danh sách sinh viên cho các tab
    const studentsForFinalExam = students.filter(student => canTakeFinalExam(student));
    const eligibleStudentCount = studentsForFinalExam.length;
    const studentsAwaitingMidtermScores = students.filter(student => !canTakeFinalExam(student));

    // Sinh viên đủ điều kiện thi lại
    const studentsEligibleForRetake = studentsForFinalExam.filter(student => eligibleForRetake(student));

    // Tính toán điểm trung bình cho một sinh viên
    const calculateAverageScore = (student) => {
        // Lấy điểm cuối kỳ (ưu tiên CK2 nếu có)
        const finalScore = student.diem.CK2 !== null ? student.diem.CK2 : student.diem.CK1;

        if (student.diem.TP1 && student.diem.TP2 && finalScore !== null) {
            return ((student.diem.TP1 + student.diem.TP2 + finalScore * 2) / 4).toFixed(1);
        }
        return null;
    };

    const calculateComponentScore = (student) => {
        if (student.diem.TP1 !== null && student.diem.TP2 !== null) {
            return (0.7 * student.diem.TP1 + 0.3 * student.diem.TP2).toFixed(1);
        }
        return null;
    };

    const exportExcel = (lopId, monHocId) => {
            // Tìm tên học phần từ courseOptions
            const courseInfo = courseOptions.find(option => option.id === monHocId);
            const tenMonHoc = courseInfo?.ten_mon_hoc || 'Unknown';
        
            // Tìm tên lớp từ classOptions
            const classInfo = classOptions.find(option => option.id === lopId);
            const maLop = classInfo?.ma_lop || 'Unknown';
        
            // Tạo tên file
            const fileName = `${tenMonHoc} - ${maLop}.xlsx`;
        
            // Chuẩn bị dữ liệu gửi lên server
            const data = {
                lop_id: lopId,
                mon_hoc_id: monHocId
            };
        
            exportDanhSachDiem(data)
                .then(response => {
                    // Trực tiếp xử lý dữ liệu blob từ response.data
                    const blob = new Blob([response.data], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
        
                    // Tạo URL để tải xuống file
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    // Sử dụng tên file động
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a); // Làm sạch DOM
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Thêm thông báo lỗi cho người dùng nếu cần
                    alert('Không thể tải xuống file Excel. Vui lòng thử lại sau.');
                });
        };
    // Hàm xử lý upload file Excel

    const handleFileChange = (event) => {
        event.stopPropagation();
        console.log('handleFileChange triggered');
        const selectedFile = event.target.files[0];
        console.log('Selected file:', selectedFile);
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            event.target.value = null; // Reset để chọn lại được
        } else {
            setFile(null);
            setFileName('');
        }
    };

    const handleButtonClick = (event) => {
        event.preventDefault(); // Ngăn chặn hành vi mặc định
        fileInputRef.current?.click(); // Mở hộp thoại chọn file
    };

    const importExcel = (lop_id, mon_hoc_id) => {
        console.log('File before sending:', file);
        if (!file) {
            alert('Vui lòng chọn file trước khi import.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('lop_id', lop_id); // Thêm lop_id vào formData
        formData.append('mon_hoc_id', mon_hoc_id); // Thêm mon_hoc_id vào formData
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]); // Debug FormData
        }
        setUploading(true);
        setProgress(0); // Reset progress khi bắt đầu upload

        // Giả lập tiến trình tải file
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10; // Tăng tiến trình lên 10%
            });
        }, 1000);
        importDanhSachDiem(formData)
            .then(data => {
                alert('Import thành công!');
                console.log(data);
                setUploading(false);
                setFile(null); // Reset file sau khi import
                setFileName(''); // Reset tên file
                // Gọi lại handleSearch để cập nhật danh sách sinh viên
                handleSearch();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Không thể import dữ liệu. Vui lòng thử lại.');
                setUploading(false);
            });
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quản lý Điểm</Typography>

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
                                )
                                )
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
                    <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={handleSearch} sx={{ height: '56px' }}>
                        Tìm kiếm
                    </Button>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Tabs value={activeTab} onChange={handleTabChange} aria-label="grade management tabs">
                <Tab label={<Badge badgeContent={students.length} color="primary" icon={<PersonIcon />}>Danh sách sinh viên</Badge>} />
                <Tab label={<Badge badgeContent={eligibleStudentCount} color="success" icon={<AssignmentIcon />}>Sinh viên đủ điều kiện thi</Badge>} />
                <Tab label={<Badge badgeContent={studentsAwaitingMidtermScores.length} color="warning" icon={<AssessmentIcon />}>Sinh viên chưa đủ điều kiện</Badge>} />
                <Tab label={<Badge badgeContent={studentsEligibleForRetake.length} color="error" icon={<AssessmentIcon />}>Sinh viên thi lại</Badge>} />
            </Tabs>

            {activeTab === 0 && (
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                        <Tabs value={activeGradeTab} onChange={handleGradeTabChange} aria-label="grade entry tabs">
                            <Tab label="Nhập điểm giữa kỳ (TP1) và điểm chuyên cần (TP2)" />
                            <Tab label="Nhập điểm cuối kỳ (CK)" />
                        </Tabs>
                    </Box>

                    {activeGradeTab === 0 && (
                        <>
                            <Alert severity="info" sx={{ my: 2 }}>
                                Nhập điểm giữa kỳ (TP1) và điểm chuyên cần (TP2). Điểm TP1 ≥ 4.0 là điều kiện để sinh viên được thi cuối kỳ.
                            </Alert>
                            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ boxShadow: 2 }}
                                    onClick={handleButtonClick} // Gọi hàm mở input file
                                >
                                    Chọn file điểm giữa kỳ
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }} // Ẩn input file
                                />

                                {/* Hiển thị tên file và tiến trình import */}
                                {file && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ marginLeft: 2 }}>
                                            {fileName}
                                        </Typography>
                                        {uploading && (
                                            <Box sx={{ width: '200px', marginLeft: 2 }}>
                                                <LinearProgress variant="determinate" value={progress} />
                                            </Box>
                                        )}
                                    </Box>
                                )}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => { importExcel(classGroup, course) }}
                                    sx={{ boxShadow: 2, marginLeft: 2 }}
                                >
                                    Thực hiện Import
                                </Button>
                                {/* Nút Export, căn phải */}
                                <Box sx={{ flexGrow: 1 }} /> {/* Giúp căn nút Export ra bên phải */}
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => { exportExcel(classGroup, course) }}
                                    sx={{ boxShadow: 2 }}
                                >
                                    Export điểm giữa kỳ
                                </Button>

                                {/* Nút Import và xử lý khi đã chọn file */}

                            </Box>
                            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="midterm grades table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Mã SV</TableCell>
                                            <TableCell>Họ đệm</TableCell>
                                            <TableCell>Tên</TableCell>
                                            <TableCell>Lớp</TableCell>
                                            <TableCell>Lần học</TableCell>
                                            <TableCell align="center">Điểm giữa kỳ (TP1)</TableCell>
                                            <TableCell align="center">Điểm chuyên cần (TP2)</TableCell>
                                            <TableCell align="center">Điểm thành phần</TableCell> {/* Thêm cột mới */}
                                            <TableCell>Ghi chú</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student) => {
                                            let note = '';
                                            if (student.diem.TP1 === null || student.diem.TP1 === undefined) {
                                                note = 'Chưa có điểm TP1';
                                            } else if (student.diem.TP1 < 4.0) {
                                                note = 'Điểm TP1 < 4.0 (Không đủ điều kiện thi cuối kỳ)';
                                            }
                                            const componentScore = calculateComponentScore(student);

                                            return (
                                                <TableRow key={student.ma_sinh_vien}>
                                                    <TableCell>{student.ma_sinh_vien}</TableCell>
                                                    <TableCell>{student.ho_dem}</TableCell>
                                                    <TableCell>{student.ten}</TableCell>
                                                    <TableCell>{student.lop}</TableCell>
                                                    <TableCell>{student.lan_hoc}</TableCell>
                                                    <TableCell align="center">
                                                        <TextField
                                                            type="number"
                                                            value={student.diem.TP1 === null ? '' : student.diem.TP1}
                                                            onChange={(e) => handleMidtermScoreChange(student.ma_sinh_vien, 'TP1', e.target.value)}
                                                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                            sx={{ width: '80px' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <TextField
                                                            type="number"
                                                            value={student.diem.TP2 === null ? '' : student.diem.TP2}
                                                            onChange={(e) => handleMidtermScoreChange(student.ma_sinh_vien, 'TP2', e.target.value)}
                                                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                            sx={{ width: '80px' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {componentScore !== null ? componentScore : '-'}
                                                    </TableCell> {/* Hiển thị điểm thành phần */}
                                                    <TableCell sx={{ color: 'red' }}>{note}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {activeGradeTab === 1 && (
                        <>
                            <Alert severity="info" sx={{ my: 2 }}>
                                Nhập điểm cuối kỳ (CK). Chỉ có thể nhập điểm cho sinh viên có điểm TP1 ≥ 4.0.
                                {examNumber === "2" ? " Đang nhập điểm thi lại (lần 2)." : " Đang nhập điểm thi lần 1."}
                                {examNumber === "2" && " Chỉ sinh viên có điểm CK1 < 4.0 mới đủ điều kiện thi lại."}
                            </Alert>

                            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary" // Màu xanh dương cho import CK lần 1
                                    onClick={() => {/* Xử lý import điểm CK lần 1 */ }}
                                    sx={{ boxShadow: 2 }}
                                >
                                    Import điểm CK lần 1
                                </Button>

                                <Button
                                    variant="contained"
                                    color="secondary" // Màu tím cho import điểm thi lại
                                    onClick={() => {/* Xử lý import điểm sinh viên thi lại */ }}
                                    sx={{ boxShadow: 2 }}
                                >
                                    Import điểm thi lại
                                </Button>
                            </Box>                            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="final exam grades table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Mã SV</TableCell>
                                            <TableCell>Họ đệm</TableCell>
                                            <TableCell>Tên</TableCell>
                                            <TableCell>Lớp</TableCell>
                                            <TableCell>Lần học</TableCell>
                                            <TableCell>Điểm TP1</TableCell>
                                            <TableCell>Điểm TP2</TableCell>
                                            <TableCell align="center">Điểm thành phần</TableCell> {/* Thêm cột mới */}
                                            <TableCell align="center">Điểm thi (CK1)</TableCell>
                                            <TableCell align="center">Điểm thi lại (CK2)</TableCell>
                                            <TableCell align="center">Điểm TB</TableCell>
                                            <TableCell align="center">Đăng ký thi lại</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student) => {
                                            const averageScore = calculateAverageScore(student);
                                            const failed = averageScore !== null && parseFloat(averageScore) < 4.0;
                                            const canRetake = eligibleForRetake(student);
                                            const componentScore = calculateComponentScore(student);

                                            return (
                                                <TableRow key={student.ma_sinh_vien} sx={failed ? { backgroundColor: 'rgba(255, 0, 0, 0.05)' } : {}}>
                                                    <TableCell>{student.ma_sinh_vien}</TableCell>
                                                    <TableCell>{student.ho_dem}</TableCell>
                                                    <TableCell>{student.ten}</TableCell>
                                                    <TableCell>{student.lop}</TableCell>
                                                    <TableCell>{student.lan_hoc}</TableCell>
                                                    <TableCell align="center" sx={{ color: student.diem.TP1 < 4.0 ? 'red' : 'inherit' }}>
                                                        {student.diem.TP1 === null ? '-' : student.diem.TP1}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {student.diem.TP2 === null ? '-' : student.diem.TP2}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {componentScore !== null ? componentScore : '-'}
                                                    </TableCell> {/* Hiển thị điểm thành phần */}
                                                    <TableCell align="center">
                                                        <Tooltip title={!canTakeFinalExam(student) ? 'Sinh viên phải có điểm TP1 ≥ 4.0' : ''}>
                                                            <span>
                                                                <TextField
                                                                    type="number"
                                                                    value={student.diem.CK1 === null ? '' : student.diem.CK1}
                                                                    onChange={(e) => handleFinalScoreChange(student.ma_sinh_vien, 'CK1', e.target.value)}
                                                                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                                    sx={{ width: '80px' }}
                                                                    disabled={!canTakeFinalExam(student) || examNumber === "2"}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title={!canRetake ? 'Sinh viên phải có điểm CK1 < 4.0 để thi lại' : ''}>
                                                            <span>
                                                                <TextField
                                                                    type="number"
                                                                    value={student.diem.CK2 === null ? '' : student.diem.CK2}
                                                                    onChange={(e) => handleFinalScoreChange(student.ma_sinh_vien, 'CK2', e.target.value)}
                                                                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                                    sx={{ width: '80px' }}
                                                                    disabled={!canTakeFinalExam(student) || !canRetake || examNumber === "1"}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {averageScore ? (
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: parseFloat(averageScore) >= 4.0 ? 'green' : 'red'
                                                                }}
                                                            >
                                                                {averageScore}
                                                            </Typography>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={!!student.retakeRegistered}
                                                                    onChange={(e) => handleRetakeRegistration(student.ma_sinh_vien, e.target.checked)}
                                                                    disabled={!canRetake || student.diem.CK2 !== null}
                                                                />
                                                            }
                                                            label=""
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </>
            )}

            {activeTab === 1 && (
                <>
                    <Alert severity="success" sx={{ my: 2 }}>
                        {eligibleStudentCount} sinh viên đủ điều kiện thi cuối kỳ (TP1 ≥ 4.0)
                    </Alert>
                    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="eligible students table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã SV</TableCell>
                                    <TableCell>Họ đệm</TableCell>
                                    <TableCell>Tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Lần học</TableCell>
                                    <TableCell align="center">Điểm TP1</TableCell>
                                    <TableCell align="center">Điểm TP2</TableCell>
                                    <TableCell align="center">Điểm thành phần</TableCell> {/* Thêm cột mới */}
                                    <TableCell align="center">Điểm CK1</TableCell>
                                    <TableCell align="center">Điểm CK2</TableCell>
                                    <TableCell align="center">Điểm TB</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsForFinalExam.map((student) => {
                                    const averageScore = calculateAverageScore(student);
                                    const componentScore = calculateComponentScore(student);

                                    return (
                                        <TableRow key={student.ma_sinh_vien}>
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{student.ho_dem}</TableCell>
                                            <TableCell>{student.ten}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.lan_hoc}</TableCell>
                                            <TableCell align="center">{student.diem.TP1}</TableCell>
                                            <TableCell align="center">{student.diem.TP2}</TableCell>
                                            <TableCell align="center">{componentScore !== null ? componentScore : '-'}</TableCell> {/* Hiển thị điểm thành phần */}
                                            <TableCell align="center">{student.diem.CK1 !== null ? student.diem.CK1 : '-'}</TableCell>
                                            <TableCell align="center">{student.diem.CK2 !== null ? student.diem.CK2 : '-'}</TableCell>
                                            <TableCell align="center">
                                                {averageScore ? (
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: parseFloat(averageScore) >= 4.0 ? 'green' : 'red'
                                                        }}
                                                    >
                                                        {averageScore}
                                                    </Typography>
                                                ) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {activeTab === 2 && (
                <>
                    <Alert severity="warning" sx={{ my: 2 }}>
                        {studentsAwaitingMidtermScores.length} sinh viên chưa đủ điều kiện thi cuối kỳ (Cần có TP1 ≥ 4.0)
                    </Alert>
                    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="ineligible students table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã SV</TableCell>
                                    <TableCell>Họ đệm</TableCell>
                                    <TableCell>Tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Lần học</TableCell>
                                    <TableCell align="center">Điểm TP1</TableCell>
                                    <TableCell align="center">Điểm TP2</TableCell>
                                    <TableCell align="center">Điểm thành phần</TableCell> {/* Thêm cột mới */}
                                    <TableCell>Ghi chú</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsAwaitingMidtermScores.map((student) => {
                                    let note = '';
                                    if (student.diem.TP1 === null || student.diem.TP1 === undefined) {
                                        note = 'Chưa có điểm TP1';
                                    } else if (student.diem.TP1 < 4.0) {
                                        note = 'Điểm TP1 < 4.0';
                                    }
                                    const componentScore = calculateComponentScore(student);

                                    return (
                                        <TableRow key={student.ma_sinh_vien}>
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{student.ho_dem}</TableCell>
                                            <TableCell>{student.ten}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.lan_hoc}</TableCell>
                                            <TableCell align="center" sx={{ color: 'red' }}>{student.diem.TP1 === null ? '-' : student.diem.TP1}</TableCell>
                                            <TableCell align="center">{student.diem.TP2 === null ? '-' : student.diem.TP2}</TableCell>
                                            <TableCell align="center">{componentScore !== null ? componentScore : '-'}</TableCell> {/* Hiển thị điểm thành phần */}
                                            <TableCell sx={{ color: 'red' }}>{note}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {activeTab === 3 && (
                <>
                    <Alert severity="error" sx={{ my: 2 }}>
                        {`${studentsEligibleForRetake.length} sinh viên cần thi lại (Điểm CK1 < 4.0)`}
                    </Alert>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="warning" // Màu vàng cho export danh sách thi lại
                            onClick={() => {/* Xử lý export danh sách sinh viên thi lại */ }}
                            sx={{ boxShadow: 2 }}
                        >
                            Export danh sách thi lại
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="retake students table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã SV</TableCell>
                                    <TableCell>Họ và tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Khóa</TableCell>
                                    <TableCell align="center">Điểm TP1</TableCell>
                                    <TableCell align="center">Điểm TP2</TableCell>
                                    <TableCell align="center">Điểm thành phần</TableCell> {/* Thêm cột mới */}
                                    <TableCell align="center">Điểm CK1</TableCell>
                                    <TableCell align="center">Điểm CK2</TableCell>
                                    <TableCell align="center">Điểm TB</TableCell>
                                    <TableCell align="center">Đăng ký thi lại</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsEligibleForRetake.map((student) => {
                                    const averageScore = calculateAverageScore(student);
                                    const componentScore = calculateComponentScore(student);

                                    return (
                                        <TableRow key={student.ma_sinh_vien}>
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{student.ho_dem}</TableCell>
                                            <TableCell>{student.ten}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.lan_hoc}</TableCell>
                                            <TableCell align="center">{student.diem.TP1}</TableCell>
                                            <TableCell align="center">{student.diem.TP2}</TableCell>
                                            <TableCell align="center">{componentScore !== null ? componentScore : '-'}</TableCell> {/* Hiển thị điểm thành phần */}
                                            <TableCell align="center" sx={{ color: 'red' }}>{student.diem.CK1}</TableCell>
                                            <TableCell align="center">{student.diem.CK2 !== null ? student.diem.CK2 : '-'}</TableCell>
                                            <TableCell align="center">
                                                {averageScore ? (
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: parseFloat(averageScore) >= 4.0 ? 'green' : 'red'
                                                        }}
                                                    >
                                                        {averageScore}
                                                    </Typography>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={!!student.retakeRegistered}
                                                            onChange={(e) => handleRetakeRegistration(student.id, e.target.checked)}
                                                            disabled={student.diem.CK2 !== null}
                                                        />
                                                    }
                                                    label=""
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    Lưu điểm
                </Button>
            </Box>
        </Paper>
    );
}

export default QuanLyDiem;