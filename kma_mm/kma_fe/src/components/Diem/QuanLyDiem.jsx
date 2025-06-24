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
import { layDanhSachSinhVienTheoTKB, layDSSVTheoKhoaVaMonHoc, nhapDiem } from '../../Api_controller/Service/diemService';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getDanhSachLopTheoKhoaDaoTao, getLopHocById } from '../../Api_controller/Service/lopService';
import { chiTietMonHoc, getDanhSachMonHocTheoKhoaVaKi } from '../../Api_controller/Service/monHocService';
import { getThoiKhoaBieu } from '../../Api_controller/Service/thoiKhoaBieuService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import axios from 'axios';
import { exportDanhSachDiemCK, exportDanhSachDiemGK, importDanhSachDiemCK, importDanhSachDiemGK } from '../../Api_controller/Service/excelService';
import { toast } from 'react-toastify';

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
    const [numberOfSemesters, setNumberOfSemesters] = useState(null);
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
    const [loadingSemester, setLoadingSemester] = useState(false);
    const [searchType, setSearchType] = useState('class');
    const [semesterOptions, setSemesterOptions] = useState([]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleGradeTabChange = (event, newValue) => {
        setActiveGradeTab(newValue);
    };

    useEffect(() => {
        const fetchEducationTypes = async () => {
            try {
                const response = await fetchDanhSachHeDaoTao();
                setEducationTypeOptions(response);
            } catch (error) {
                console.error('Error fetching education types:', error);
                toast.error('Không thể tải danh sách hệ đào tạo.');
            }
        };
        fetchEducationTypes();
    }, []);

    useEffect(() => {
        if (!educationType) return;
        const fetchBatches = async () => {
            setLoadingBatches(true);
            setBatch('');
            setClassGroup('');
            setCourse('');
            try {
                const response = await getDanhSachKhoaTheoDanhMucDaoTao(educationType);
                setBatchOptions(response);
            } catch (error) {
                console.error('Error fetching batches:', error);
                toast.error('Không thể tải danh sách khóa đào tạo.');
            } finally {
                setLoadingBatches(false);
            }
        };
        fetchBatches();
    }, [educationType]);

    useEffect(() => {
        if (!batch) {
            setNumberOfSemesters(null);
            return;
        }
        const selectedBatch = batchOptions.find((b) => b.id === batch);
        if (selectedBatch) {
            setNumberOfSemesters(selectedBatch.so_ky_hoc);
        }
    }, [batch, batchOptions]);

    useEffect(() => {
        if (!batch || !numberOfSemesters) return;
        const fetchSemesters = async () => {
            setLoadingSemester(true);
            setSemester('');
            try {
                const semesters = Array.from({ length: numberOfSemesters }, (_, i) => ({
                    id: i + 1,
                    name: `Kỳ ${i + 1}`
                }));
                setSemesterOptions(semesters);
            } catch (error) {
                console.error('Error fetching semesters:', error);
                toast.error('Không thể tải danh sách học kỳ.');
                setSemesterOptions([]);
            } finally {
                setLoadingSemester(false);
            }
        };
        fetchSemesters();
    }, [batch, numberOfSemesters]);

    useEffect(() => {
        if (!batch) return;
        const fetchClasses = async () => {
            setLoadingClasses(true);
            setClassGroup('');
            setCourse('');
            try {
                const response = await getDanhSachLopTheoKhoaDaoTao(batch);
                setClassOptions(response);
            } catch (error) {
                console.error('Error fetching classes:', error);
                toast.error('Không thể tải danh sách lớp.');
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
    }, [batch]);

    useEffect(() => {
        if (!batch || !semester) return;
        const fetchCourses = async () => {
            setLoadingCourses(true);
            setCourse('');
            try {
                const response = await getDanhSachMonHocTheoKhoaVaKi({
                    khoa_dao_tao_id: batch,
                    ky_hoc: semester
                });
                const courseIds = response.map(course => course.mon_hoc_id);
                const courseDetailsResponse = await chiTietMonHoc({ ids: courseIds.join(',') });
                const coursesWithDetails = response.map(course => {
                    const details = courseDetailsResponse.data.data.find(
                        detail => detail.id === course.mon_hoc_id
                    );
                    return {
                        id: course.mon_hoc_id,
                        ten_mon_hoc: details?.ten_mon_hoc || 'Unknown'
                    };
                });
                setCourseOptions(coursesWithDetails);
            } catch (error) {
                console.error('Error fetching courses:', error);
                toast.error('Không thể tải danh sách học phần.');
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [classGroup, batch, semester]);

    useEffect(() => {
        if (!classGroup || !course || (searchType === 'class' && !classGroup)) return;
        const fetchScheduleId = async () => {
            setLoading(true);
            try {
                const response = await getThoiKhoaBieu(course, classGroup, semester);
                setScheduleId(response.data[0].id);
            } catch (error) {
                console.error('Error fetching schedule ID:', error);
                toast.error('Không thể tải thời khóa biểu.');
            } finally {
                setLoading(false);
            }
        };
        fetchScheduleId();
    }, [classGroup, course, semester, searchType]);

    const handleSearch = async () => {
        if (!batch || !semester || !course || (searchType === 'class' && !classGroup)) {
            toast.error('Vui lòng chọn đầy đủ thông tin để tìm kiếm học viên.');
            return;
        }
        setLoadingStudents(true);
        try {
            let response;
            if (searchType === 'class') {
                response = await layDanhSachSinhVienTheoTKB(scheduleId);
            } else {
                response = await layDSSVTheoKhoaVaMonHoc(batch, course);
            }
            const formattedStudents = await Promise.all(
                response.data.map(async (student) => {
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
                        retakeRegistered: student.trang_thai === 'thi_lai'
                    };
                })
            );
            setStudents(formattedStudents);
            if (formattedStudents.length > 0) {
                toast.success(`Đã tìm thấy ${formattedStudents.length} học viên.`);
            } else {
                toast.warn('Không tìm thấy học viên nào phù hợp với các tiêu chí đã chọn.');
            }
        } catch (error) {
            console.error('Error searching students:', error);
            toast.error('Có lỗi xảy ra khi tìm kiếm học viên. Vui lòng thử lại.');
        } finally {
            setLoadingStudents(false);
        }
    };

    const canTakeFinalExam = (student) => {
        return student.diem.TP1 !== null && student.diem.TP1 !== undefined && student.diem.TP1 >= 4.0;
    };

    
    const calculateAverageScore = (student) => {
        const finalScore = student.diem.CK2 !== null ? student.diem.CK2 : student.diem.CK1;
        if (student.diem.TP1 === null || student.diem.TP2 === null || finalScore === null) {
            return { score: null, passed: false };
        }
        const componentScore = 0.7 * student.diem.TP1 + 0.3 * student.diem.TP2;
        const averageScore = Number(((componentScore * 0.3 + finalScore * 0.7)).toFixed(1));
        const passed = finalScore >= 2.0 && averageScore >= 4.0;
        return { score: averageScore, passed };
    };

    const eligibleForRetake = (student) => {
        if (student.diem.CK1 === null || student.diem.CK1 === undefined) return false;
        const { score: averageScore } = calculateAverageScore(student);
        return student.diem.CK1 < 2.0 || (averageScore !== null && averageScore < 4.0) || student.diem.CK2 !== null;
    };

    const handleMidtermScoreChange = (studentId, scoreType, value) => {
        if (value === '' || isNaN(value)) {
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.ma_sinh_vien === studentId
                        ? { ...student, diem: { ...student.diem, [scoreType]: null } }
                        : student
                )
            );
            return;
        }
        const numericValue = parseFloat(value);
        if (numericValue < 0 || numericValue > 10) {
            toast.error('Điểm phải nằm trong khoảng từ 0 đến 10.');
            return;
        }
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.ma_sinh_vien === studentId
                    ? { ...student, diem: { ...student.diem, [scoreType]: numericValue } }
                    : student
            )
        );
    };

    const handleFinalScoreChange = (studentId, scoreType, value) => {
        if (value === '' || isNaN(value)) {
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.ma_sinh_vien === studentId
                        ? { ...student, diem: { ...student.diem, [scoreType]: null } }
                        : student
                )
            );
            return;
        }
        const numericValue = parseFloat(value);
        if (numericValue < 0 || numericValue > 10) {
            toast.error('Điểm phải nằm trong khoảng từ 0 đến 10.');
            return;
        }
        setStudents(prevStudents =>
            prevStudents.map(student => {
                if (student.ma_sinh_vien === studentId) {
                    if (!canTakeFinalExam(student)) {
                        toast.error(`Không thể nhập điểm cuối kỳ cho học viên ${student.ho_dem} ${student.ten}. Điểm giữa kỳ (TP1) phải ≥ 4.0.`);
                        return student;
                    }
                    if (scoreType === 'CK2' && !eligibleForRetake(student)) {
                        toast.error(`Không thể nhập điểm thi lại cho học viên ${student.ho_dem} ${student.ten}. Điểm thi lần 1 (CK1) phải < 2.0 hoặc điểm tổng kết < 4.0.`);
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
            prevStudents.map(student => {
                if (student.ma_sinh_vien === studentId) {
                    if (!eligibleForRetake(student) && checked) {
                        toast.error('Học viên không đủ điều kiện đăng ký thi lại (CK1 phải < 2.0 hoặc điểm tổng kết < 4.0).');
                        return student;
                    }
                    return { ...student, retakeRegistered: checked };
                }
                return student;
            })
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const dataToSave = students.map(student => ({
                id: student.id,
                sinh_vien_id: student.sinh_vien_id,
                diem_tp1: student.diem.TP1,
                diem_tp2: student.diem.TP2,
                diem_gk: calculateComponentScore(student),
                diem_ck: student.diem.CK1,
                diem_ck2: student.diem.CK2,
                thoi_khoa_bieu_id: scheduleId,
                trang_thai: student.retakeRegistered && eligibleForRetake(student) ? 'thi_lai' : null
            }));
            const response = await nhapDiem(dataToSave);
            if (response.data) {
                toast.success('Đã lưu điểm và trạng thái thi lại thành công!');
            } else {
                toast.error('Lưu thất bại: ' + response.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi lưu điểm:', error);
            toast.error('Có lỗi xảy ra khi lưu điểm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const studentsForFinalExam = students.filter(student => canTakeFinalExam(student));
    const eligibleStudentCount = studentsForFinalExam.length;
    const studentsAwaitingMidtermScores = students.filter(student => !canTakeFinalExam(student));
    const studentsEligibleForRetake = studentsForFinalExam.filter(student => eligibleForRetake(student));

    const calculateComponentScore = (student) => {
        if (student.diem.TP1 !== null && student.diem.TP2 !== null) {
            return (0.7 * student.diem.TP1 + 0.3 * student.diem.TP2).toFixed(1);
        }
        return null;
    };


    const exportExcel = (lop_id, khoa_dao_tao_id, mon_hoc_id, activeGradeTab, courseOptions, classOptions, searchType = 'class') => {
        if (!mon_hoc_id || (searchType === 'class' && !lop_id) || (searchType === 'batch' && !khoa_dao_tao_id)) {
            toast.error('Vui lòng chọn đầy đủ thông tin (môn học và lớp/khóa) trước khi export.');
            return;
        }
        if (activeGradeTab === 0 && searchType === 'batch') {
            toast.error('Chỉ có thể export điểm giữa kỳ theo lớp học phần.');
            return;
        }
        const courseInfo = courseOptions.find((option) => option.id === mon_hoc_id);
        const tenMonHoc = courseInfo?.ten_mon_hoc || 'Unknown';
        let maLop = 'Unknown';
        if (searchType === 'class' && lop_id) {
            const classInfo = classOptions.find((option) => option.id === lop_id);
            maLop = classInfo?.ma_lop || 'Unknown';
        } else {
            const batchInfo = batchOptions.find((option) => option.id === khoa_dao_tao_id);
            maLop = batchInfo?.ma_khoa || 'Unknown';
        }
        const fileName = `${tenMonHoc} - ${maLop}.xlsx`;
        const exportApi = activeGradeTab === 0 ? exportDanhSachDiemGK : exportDanhSachDiemCK;
        const data = activeGradeTab === 0
            ? { lop_id, mon_hoc_id }
            : { mon_hoc_id, khoa_dao_tao_id, ...(searchType === 'class' && lop_id && { lop_id }) };
        exportApi(data)
            .then((response) => {
                const blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success(`Xuất điểm ${activeGradeTab === 0 ? 'giữa kỳ' : 'cuối kỳ'} thành công!`);
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error('Không thể tải xuống file Excel. Vui lòng thử lại.');
            });
    };

    const handleFileChange = (event) => {
        event.stopPropagation();
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            event.target.value = null;
        } else {
            setFile(null);
            setFileName('');
        }
    };

    const handleButtonClick = (event) => {
        event.preventDefault();
        fileInputRef.current?.click();
    };

    const importExcel = (lop_id, mon_hoc_id, khoa_dao_tao_id, activeGradeTab, selectedFile) => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn file trước khi import.');
            return;
        }
        const importApi = activeGradeTab === 0 ? importDanhSachDiemGK : importDanhSachDiemCK;
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('mon_hoc_id', mon_hoc_id);
        formData.append('khoa_dao_tao_id', khoa_dao_tao_id);
        if (lop_id) {
            formData.append('lop_id', lop_id);
        }
        setUploading(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 1000);
        importApi(formData)
            .then((response) => {
                clearInterval(interval);
                setProgress(100);
                toast.success('Import thành công!');
                setUploading(false);
                setFile(null);
                setFileName('');
                handleSearch();
            })
            .catch((error) => {
                clearInterval(interval);
                console.error('Error:', error);
                toast.error('Không thể import dữ liệu. Vui lòng thử lại.');
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
                        <InputLabel>Khóa đào tạo</InputLabel>
                        <Select
                            value={batch}
                            label="Khóa đào tạo"
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
                            disabled={!numberOfSemesters || loadingSemester}
                        >
                            <MenuItem value="">
                                <em>Chọn học kỳ</em>
                            </MenuItem>
                            {semesterOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Tìm kiếm theo</InputLabel>
                        <Select
                            value={searchType}
                            label="Tìm kiếm theo"
                            onChange={(e) => {
                                setSearchType(e.target.value);
                                setClassGroup('');
                            }}
                            disabled={!batch}
                        >
                            <MenuItem value="class">Theo lớp</MenuItem>
                            <MenuItem value="batch">Theo khóa đào tạo</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                {searchType === 'class' && (
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
                )}
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Học phần</InputLabel>
                        <Select
                            value={course}
                            label="Học phần"
                            onChange={(e) => setCourse(e.target.value)}
                            disabled={(!classGroup && searchType === 'class') || !semester || loadingCourses}
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
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                        sx={{ height: '56px' }}
                        disabled={(!classGroup && searchType === 'class') || !course || !batch || !semester}
                    >
                        Tìm kiếm
                    </Button>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Tabs value={activeTab} onChange={handleTabChange} aria-label="grade management tabs">
                <Tab label={<Badge badgeContent={students.length} color="primary" icon={<PersonIcon />}>Danh sách học viên</Badge>} />
                <Tab label={<Badge badgeContent={eligibleStudentCount} color="success" icon={<AssignmentIcon />}>Học viên đủ điều kiện thi</Badge>} />
                <Tab label={<Badge badgeContent={studentsAwaitingMidtermScores.length} color="warning" icon={<AssessmentIcon />}>Học viên chưa đủ điều kiện</Badge>} />
                <Tab label={<Badge badgeContent={studentsEligibleForRetake.length} color="error" icon={<AssessmentIcon />}>Học viên thi lại</Badge>} />
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
                                Nhập điểm giữa kỳ (TP1) và điểm chuyên cần (TP2). Điểm TP1 ≥ 4.0 là điều kiện để học viên được thi cuối kỳ.
                            </Alert>
                            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ boxShadow: 2 }}
                                    onClick={handleButtonClick}
                                >
                                    Import điểm giữa kỳ
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files[0];
                                        handleFileChange(e);
                                        if (selectedFile) {
                                            importExcel(classGroup, course, batch, activeGradeTab, selectedFile);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
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
                                <Box sx={{ flexGrow: 1 }} />
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => exportExcel(classGroup, batch, course, activeGradeTab, courseOptions, classOptions, searchType)}
                                    sx={{ boxShadow: 2 }}
                                >
                                    Export điểm giữa kỳ
                                </Button>
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
                                            <TableCell align="center">Điểm thành phần</TableCell>
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
                                                    </TableCell>
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
                                Nhập điểm cuối kỳ (CK). Chỉ có thể nhập điểm cho học viên có điểm TP1 ≥ 4.0.
                                Điểm thi (CK1 hoặc CK2) phải ≥ 2.0 và điểm tổng kết ≥ 4.0 để qua môn.
                              
                            </Alert>
                            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ boxShadow: 2 }}
                                    onClick={handleButtonClick}
                                >
                                    Import điểm cuối kỳ/thi lại
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files[0];
                                        handleFileChange(e);
                                        if (selectedFile) {
                                            importExcel(classGroup, course, batch, activeGradeTab, selectedFile);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
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
                                <Box sx={{ flexGrow: 1 }} />
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => exportExcel(classGroup, batch, course, activeGradeTab, courseOptions, classOptions, searchType)}
                                    sx={{ boxShadow: 2 }}
                                >
                                    Export điểm cuối kỳ
                                </Button>
                            </Box>
                            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
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
                                            <TableCell align="center">Điểm thành phần</TableCell>
                                            <TableCell align="center">Điểm thi (CK1)</TableCell>
                                            <TableCell align="center">Điểm thi lại (CK2)</TableCell>
                                            <TableCell align="center">Điểm TB</TableCell>
                                            <TableCell align="center">Trạng thái</TableCell>
                                            <TableCell align="center">Đăng ký thi lại</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student) => {
                                            const { score: averageScore, passed } = calculateAverageScore(student);
                                            const canRetake = eligibleForRetake(student);
                                            const componentScore = calculateComponentScore(student);
                                            return (
                                                <TableRow
                                                    key={student.ma_sinh_vien}
                                                    sx={!passed && averageScore !== null ? { backgroundColor: 'rgba(255, 0, 0, 0.05)' } : {}}
                                                >
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
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title={!canTakeFinalExam(student) ? 'Học viên phải có điểm TP1 ≥ 4.0' : ''}>
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
                                                        <Tooltip title={!canRetake ? 'Học viên phải có điểm CK1 < 2.0 hoặc điểm TB <4.0 để thi lại' : ''}>
                                                            <span>
                                                                <TextField
                                                                    type="number"
                                                                    value={student.diem.CK2 === null ? '' : student.diem.CK2}
                                                                    onChange={(e) => handleFinalScoreChange(student.ma_sinh_vien, 'CK2', e.target.value)}
                                                                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                                    sx={{ width: '80px' }}
                                                                    disabled={!canTakeFinalExam(student) ||  !eligibleForRetake(student) || examNumber === "1"}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {averageScore ? (
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: passed ? 'green' : 'red'
                                                                }}
                                                            >
                                                                {averageScore}
                                                            </Typography>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {averageScore ? (
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: passed ? 'green' : 'red'
                                                                }}
                                                            >
                                                                {passed ? 'Qua' : 'Trượt'}
                                                            </Typography>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title={
                                                            !eligibleForRetake(student) ? 'Học viên phải có điểm CK1 < 2.0 để đăng ký thi lại.' :
                                                                student.diem.CK2 !== null ? 'Đã có điểm thi lại (CK2), không thể thay đổi.' : ''
                                                        }>
                                                            <span>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={!!student.retakeRegistered}
                                                                            onChange={(e) => handleRetakeRegistration(student.ma_sinh_vien, e.target.checked)}
                                                                            disabled={!eligibleForRetake(student) || student.diem.CK2 !== null}
                                                                        />
                                                                    }
                                                                    label=""
                                                                />
                                                            </span>
                                                        </Tooltip>
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
                        {eligibleStudentCount} học viên đủ điều kiện thi cuối kỳ (TP1 ≥ 4.0)
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
                                    <TableCell align="center">Điểm thành phần</TableCell>
                                    <TableCell align="center">Điểm CK1</TableCell>
                                    <TableCell align="center">Điểm CK2</TableCell>
                                    <TableCell align="center">Điểm TB</TableCell>
                                    <TableCell align="center">Trạng thái</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsForFinalExam.map((student) => {
                                    const { score: averageScore, passed } = calculateAverageScore(student);
                                    const componentScore = calculateComponentScore(student);
                                    return (
                                        <TableRow
                                            key={student.ma_sinh_vien}
                                            sx={!passed && averageScore !== null ? { backgroundColor: 'rgba(255, 0, 0, 0.05)' } : {}}
                                        >
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{student.ho_dem}</TableCell>
                                            <TableCell>{student.ten}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.lan_hoc}</TableCell>
                                            <TableCell align="center">{student.diem.TP1}</TableCell>
                                            <TableCell align="center">{student.diem.TP2}</TableCell>
                                            <TableCell align="center">{componentScore !== null ? componentScore : '-'}</TableCell>
                                            <TableCell align="center">{student.diem.CK1 !== null ? student.diem.CK1 : '-'}</TableCell>
                                            <TableCell align="center">{student.diem.CK2 !== null ? student.diem.CK2 : '-'}</TableCell>
                                            <TableCell align="center">
                                                {averageScore ? (
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: passed ? 'green' : 'red'
                                                        }}
                                                    >
                                                        {averageScore}
                                                    </Typography>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {averageScore ? (
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: passed ? 'green' : 'red'
                                                        }}
                                                    >
                                                        {passed ? 'Qua' : 'Trượt'}
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
                        {studentsAwaitingMidtermScores.length} học viên chưa đủ điều kiện thi cuối kỳ (Cần có TP1 ≥ 4.0)
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
                                    <TableCell align="center">Điểm thành phần</TableCell>
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
                                            <TableCell align="center">{componentScore !== null ? componentScore : '-'}</TableCell>
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
                        {`${studentsEligibleForRetake.length} học viên cần thi lại (Điểm CK1 < 2.0)`}
                    </Alert>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={() => exportExcel(classGroup, batch, course, 1, courseOptions, classOptions, searchType)} // Reuse exportExcel for retake list
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
                                    <TableCell>Họ đệm</TableCell>
                                    <TableCell>Tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Lần học</TableCell>
                                    <TableCell align="center">Điểm TP1</TableCell>
                                    <TableCell align="center">Điểm TP2</TableCell>
                                    <TableCell align="center">Điểm thành phần</TableCell>
                                    <TableCell align="center">Điểm CK1</TableCell>
                                    <TableCell align="center">Điểm CK2</TableCell>
                                    <TableCell align="center">Điểm TB</TableCell>
                                    <TableCell align="center">Trạng thái</TableCell>
                                    <TableCell align="center">Đăng ký thi lại</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsEligibleForRetake.map((student) => {
                                    const { score: averageScore, passed } = calculateAverageScore(student);
                                    const componentScore = calculateComponentScore(student);
                                    return (
                                        <TableRow
                                            key={student.ma_sinh_vien}
                                            sx={!passed && averageScore !== null ? { backgroundColor: 'rgba(255, 0, 0, 0.05)' } : {}}
                                        >
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{student.ho_dem}</TableCell>
                                            <TableCell>{student.ten}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.lan_hoc}</TableCell>
                                            <TableCell align="center">{student.diem.TP1}</TableCell>
                                            <TableCell align="center">{student.diem.TP2}</TableCell>
                                            <TableCell align="center">{componentScore !== null ? componentScore : '-'}</TableCell>
                                            <TableCell align="center" sx={{ color: 'red' }}>{student.diem.CK1}</TableCell>
                                            <TableCell align="center">{student.diem.CK2 !== null ? student.diem.CK2 : '-'}</TableCell>
                                            <TableCell align="center">
                                                {averageScore ? (
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: passed ? 'green' : 'red'
                                                        }}
                                                    >
                                                        {averageScore}
                                                    </Typography>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {averageScore ? (
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: passed ? 'green' : 'red'
                                                        }}
                                                    >
                                                        {passed ? 'Qua' : 'Trượt'}
                                                    </Typography>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title={
                                                    student.diem.CK2 !== null ? 'Đã có điểm thi lại (CK2), không thể thay đổi.' : ''
                                                }>
                                                    <span>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={!!student.retakeRegistered}
                                                                    onChange={(e) => handleRetakeRegistration(student.ma_sinh_vien, e.target.checked)}
                                                                    disabled={student.diem.CK2 !== null}
                                                                />
                                                            }
                                                            label=""
                                                        />
                                                    </span>
                                                </Tooltip>
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
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={20} /> : 'Lưu điểm'}
                </Button>
            </Box>
        </Paper>
    );
}

export default QuanLyDiem;