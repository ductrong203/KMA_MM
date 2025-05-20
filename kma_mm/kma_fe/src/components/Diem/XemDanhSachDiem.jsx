import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/material/styles';
import QuanLyDiem from '../Diem/QuanLyDiem';
import TaoBangDiem from '../Diem/TaoBangDiem';
import { layDanhSachSinhVienTheoTKB, nhapDiem } from '../../Api_controller/Service/diemService';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getDanhSachLopTheoKhoaDaoTao, getLopHocById } from '../../Api_controller/Service/lopService';
import { getDanhSachMonHocTheoKhoaVaKi } from '../../Api_controller/Service/monHocService';
import { getThoiKhoaBieu } from '../../Api_controller/Service/thoiKhoaBieuService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import axios from 'axios';
function XemDanhSachDiem() {
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

    const handleExportData = () => {
        // Logic to export data
        alert('Đã xuất dữ liệu thành công!');
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Xem Danh Sách Điểm
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

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="view grades table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã SV</TableCell>
                            <TableCell>Họ đệm</TableCell>
                            <TableCell>Tên</TableCell>
                            <TableCell>Lớp</TableCell>
                            <TableCell>Lần học</TableCell>
                            <TableCell>TP1</TableCell>
                            <TableCell>TP2</TableCell>
                            <TableCell>CK lần 1</TableCell>
                            <TableCell>CK lần 2</TableCell>
                            <TableCell>Điểm TK</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => {
                            // Tính điểm tổng kết (giả sử công thức: TP1*0.2 + TP2*0.2 + CK*0.6)
                            // Ưu tiên lấy điểm CK lần 2 nếu có, nếu không thì lấy điểm CK lần 1
                            const finalExamScore = student.diem.CK2 !== null ? student.diem.CK2 : student.diem.CK1;
                            const totalScore = student.diem.TP1 * 0.2 + student.diem.TP2 * 0.2 + finalExamScore * 0.6;

                            return (
                                <TableRow key={student.id}>
                                    <TableCell>{student.ma_sinh_vien}</TableCell>
                                    <TableCell>{student.ho_dem}</TableCell>
                                    <TableCell>{student.ten}</TableCell>
                                    <TableCell>{student.lop}</TableCell>
                                    <TableCell>{student.lan_hoc}</TableCell>
                                    <TableCell>{student.diem.TP1}</TableCell>
                                    <TableCell>{student.diem.TP2}</TableCell>
                                    <TableCell>{student.diem.CK1}</TableCell>
                                    <TableCell>{student.diem.CK2 !== null ? student.diem.CK2 : '-'}</TableCell>
                                    <TableCell>{totalScore.toFixed(1)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                    sx={{ mr: 2 }}
                >
                    Xuất Excel
                </Button>
            </Box>
        </Paper>
    )
}

export default XemDanhSachDiem