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
    CircularProgress,
    TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
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
import { kiemTraBangDiemTonTai, layDanhSachSinhVienTheoTKB, taoBangDiemChoSinhVien, themSinhVienHocLai, timSinhVienTheoMaHoacFilter } from '../../Api_controller/Service/diemService';
import { exportDanhSachDiemCK, exportDanhSachDiemGK } from '../../Api_controller/Service/excelService';

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
    const [numberOfSemesters, setNumberOfSemesters] = useState(null);
    // State variables for loading indicators
    const [loading, setLoading] = useState(false);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingSemester, setLoadingSemester] = useState(false);
    const [semesterOptions, setSemesterOptions] = useState([]);

    // State variables for student dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [dialogEducationType, setDialogEducationType] = useState('');
    const [dialogBatch, setDialogBatch] = useState('');
    const [dialogClass, setDialogClass] = useState('');
    const [dialogEducationTypeOptions, setDialogEducationTypeOptions] = useState([]);
    const [dialogBatchOptions, setDialogBatchOptions] = useState([]);
    const [dialogClassOptions, setDialogClassOptions] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loadingDialogData, setLoadingDialogData] = useState(false);

    // Schedule IDs for API calls
    const [scheduleId, setScheduleId] = useState(null);
    const [gradeSheetId, setGradeSheetId] = useState(null);
    // Thêm state cho chức năng tìm kiếm
    const [searchMode, setSearchMode] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Thêm hàm xử lý chức năng tìm kiếm
    const handleSearchStudents = async () => {
        if (!batch || !classGroup || !semester || !course) {
            alert('Vui lòng chọn đầy đủ thông tin để tìm kiếm sinh viên');
            return;
        }
        setSearchMode(true);
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
                        ma_sinh_vien: student.sinh_vien.ma_sinh_vien,
                        ho_dem: student.sinh_vien.ho_dem,
                        ten: student.sinh_vien.ten,
                        lop: maLop,
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

    // Sample education types - replace with API call
    useEffect(() => {
        const fetchEducationTypes = async () => {
            try {
                const response = await fetchDanhSachHeDaoTao();
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
                const response = await getDanhSachKhoaTheoDanhMucDaoTao(educationType);
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
                setSemesterOptions([]);
            } finally {
                setLoadingSemester(false);
            }
        };

        fetchSemesters();
    }, [batch, numberOfSemesters]);

    // Fetch classes when batch changes
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
                });
                console.log(response);

                // Lấy danh sách ID môn học
                const courseIds = response.map(course => course.mon_hoc_id);
                console.log(courseIds);
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
                console.log("coursesWithDetails", coursesWithDetails);

                console.log(coursesWithDetails);

                // Cập nhật state với danh sách môn học đã gộp
                setCourseOptions(coursesWithDetails);
            } catch (error) {
                console.error('Error fetching courses:', error);
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
                const response = await getThoiKhoaBieu(course, classGroup, semester);
                console.log(response.data);
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

    console.log("scheduleId:", scheduleId);

    const handleCreateGradeSheet = async () => {
        if (!scheduleId) {
            alert('Vui lòng chọn đầy đủ thông tin để tạo bảng điểm');
            return;
        }

        setLoadingStudents(true);
        try {
            // Kiểm tra xem bảng điểm đã tồn tại chưa
            const existingGradeSheet = await kiemTraBangDiemTonTai(scheduleId);
            console.log(existingGradeSheet);
            if (existingGradeSheet && existingGradeSheet.data && existingGradeSheet.data.length > 0) {
                alert('Bảng điểm cho thời khóa biểu này đã tồn tại. Vui lòng kiểm tra lại hoặc sử dụng bảng điểm hiện có.');
                // Tùy chọn: Lấy dữ liệu bảng điểm hiện có
                const studentsResponse = await layDanhSachSinhVienTheoTKB(scheduleId);
                const formattedStudents = await Promise.all(
                    studentsResponse.data.map(async (student) => {
                        const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
                        const maLop = lopInfo?.ma_lop || student.lop_id;

                        return {
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
                setStudents(formattedStudents);
                return; // Dừng hàm nếu bảng điểm đã tồn tại
            }

            // Nếu chưa tồn tại, tiến hành tạo bảng điểm
            const gradeSheetResponse = await taoBangDiemChoSinhVien({ thoi_khoa_bieu_id: scheduleId });
            console.log('Grade sheet response:', gradeSheetResponse);

            // Lấy danh sách sinh viên cho bảng điểm
            const studentsResponse = await layDanhSachSinhVienTheoTKB(scheduleId);
            console.log("studentsResponse:", studentsResponse);

            // Chuyển đổi dữ liệu sinh viên
            const formattedStudents = await Promise.all(
                studentsResponse.data.map(async (student) => {
                    const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
                    const maLop = lopInfo?.ma_lop || student.lop_id;

                    return {
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
                if (student.ma_sinh_vien === studentId) {
                    // Nếu đang cập nhật điểm cuối kỳ nhưng điểm giữa kỳ không đạt yêu cầu
                    if ((scoreType === 'CK1' || scoreType === 'CK2') && !canEnterFinalExamScore(student)) {
                        alert(`Không thể nhập điểm cuối kỳ cho sinh viên ${student.ho_dem} ${student.ten}. Điểm giữa kỳ (TP1 và TP2) phải lớn hơn hoặc bằng 4.0.`);
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
    };

    const handleRetakeRegistration = async (studentId, checked) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.ma_sinh_vien === studentId
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

    const handleOpenDialog = () => {
        setOpenDialog(true);
        // Reset dialog fields
        setStudentId('');
        setDialogEducationType('');
        setDialogBatch('');
        setDialogClass('');
        setFilteredStudents([]);
        setDialogEducationTypeOptions([]);
        setDialogBatchOptions([]);
        setDialogClassOptions([]);
        // Fetch education types for dialog
        fetchDialogEducationTypes();
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        // Reset dialog fields
        setStudentId('');
        setDialogEducationType('');
        setDialogBatch('');
        setDialogClass('');
        setFilteredStudents([]);
        setDialogEducationTypeOptions([]);
        setDialogBatchOptions([]);
        setDialogClassOptions([]);
    };

    // Fetch education types for dialog
    const fetchDialogEducationTypes = async () => {
        setLoadingDialogData(true);
        try {
            const response = await fetchDanhSachHeDaoTao();
            setDialogEducationTypeOptions(response);
        } catch (error) {
            console.error('Error fetching dialog education types:', error);
            setDialogEducationTypeOptions([
                { id: 'CQ', name: 'Chính quy' },
                { id: 'LT', name: 'Liên thông' },
                { id: 'VLVH', name: 'Vừa làm vừa học' }
            ]);
        } finally {
            setLoadingDialogData(false);
        }
    };

    // Fetch batches for dialog when education type changes
    useEffect(() => {
        if (!dialogEducationType) {
            setDialogBatchOptions([]);
            setDialogBatch('');
            setDialogClass('');
            setDialogClassOptions([]);
            return;
        }

        const fetchDialogBatches = async () => {
            setLoadingDialogData(true);
            try {
                const response = await getDanhSachKhoaTheoDanhMucDaoTao(dialogEducationType);
                setDialogBatchOptions(response);
            } catch (error) {
                console.error('Error fetching dialog batches:', error);
                setDialogBatchOptions([
                    { id: 'K14', name: 'K14' },
                    { id: 'K15', name: 'K15' },
                    { id: 'K16', name: 'K16' }
                ]);
            } finally {
                setLoadingDialogData(false);
            }
        };

        fetchDialogBatches();
    }, [dialogEducationType]);

    // Fetch classes for dialog when batch changes
    useEffect(() => {
        if (!dialogBatch) {
            setDialogClassOptions([]);
            setDialogClass('');
            return;
        }

        const fetchDialogClasses = async () => {
            setLoadingDialogData(true);
            try {
                const response = await getDanhSachLopTheoKhoaDaoTao(dialogBatch);
                setDialogClassOptions(response);
            } catch (error) {
                console.error('Error fetching dialog classes:', error);
                setDialogClassOptions([]);
            } finally {
                setLoadingDialogData(false);
            }
        };

        fetchDialogClasses();
    }, [dialogBatch]);

    const handleAddRetakeStudent = async () => {
        if (!studentId) {
            alert('Vui lòng chọn sinh viên');
            return;
        }

        console.log('studentId:', studentId);

        try {
            // Kiểm tra xem sinh viên đã có trong bảng điểm hiện tại chưa
            const isStudentExist = students.some(student => student.ma_sinh_vien === studentId);
            if (isStudentExist) {
                const existingStudent = students.find(student => student.ma_sinh_vien === studentId);
                alert(`Sinh viên ${existingStudent.ho_dem} ${existingStudent.ten} đã có trong bảng điểm hiện tại (Lần ${existingStudent.lan_hoc}).`);
                handleCloseDialog();
                return;
            }

            // Gọi API thêm sinh viên học lại
            const response = await themSinhVienHocLai({
                thoi_khoa_bieu_id: scheduleId, // scheduleId từ context hoặc props
                ma_sinh_vien: studentId,       // studentId là mã sinh viên (VD: CT060110)
            });

            console.log('API Response:', response);

            if (response.success) {
                const retakeData = response.data; // Bản ghi điểm mới từ API

                // Gọi timSinhVienTheoMaHoacFilter để lấy thông tin sinh viên
                const sinhVienData = await timSinhVienTheoMaHoacFilter({
                    'ma_sinh_vien': studentId, // Truyền ma_sinh_vien làm tham số lọc
                });

                const sinhVienInfo = sinhVienData.success && sinhVienData.data.length > 0 ? sinhVienData.data[0] : null;
                console.log(sinhVienInfo);
                if (!sinhVienInfo) {
                    throw new Error('Không tìm thấy thông tin sinh viên');
                }

                // Format dữ liệu sinh viên mới theo định dạng của formattedStudents
                const newStudent = {
                    ma_sinh_vien: sinhVienInfo.ma_sinh_vien,
                    ho_dem: sinhVienInfo.ho_dem,
                    ten: sinhVienInfo.ten,
                    lop: sinhVienInfo.lop,
                    lan_hoc: retakeData.lan_hoc, // Lấy từ API (bắt đầu từ 2)
                    diem: {
                        TP1: null,
                        TP2: null,
                        CK1: null,
                        CK2: null,
                    },
                    retakeRegistered: true,
                };

                // Thêm sinh viên vào danh sách cục bộ
                setStudents(prevStudents => [...prevStudents, newStudent]);
                alert(`Đã thêm sinh viên ${newStudent.ho_dem} ${newStudent.ten} vào danh sách học lại (Lần ${retakeData.lan_hoc}).`);
            } else {
                alert(`Không thể thêm sinh viên: ${response.message || 'Lỗi không xác định'}`);
            }
        } catch (error) {
            console.error('Error adding retake student:', error);
            alert(`Có lỗi xảy ra khi thêm sinh viên học lại: ${error.message || 'Vui lòng thử lại.'}`);
        }

        handleCloseDialog();
    };

    // Thêm hàm xử lý tìm kiếm sinh viên trong Dialog
    const handleSearchStudentsInDialog = async () => {
        try {
            const filters = {};
            if (studentId) filters.ma_sinh_vien = studentId;
            if (dialogEducationType) filters.he_dao_tao_id = dialogEducationType;
            if (dialogBatch) filters.khoa_id = dialogBatch;
            if (dialogClass) filters.lop_id = dialogClass;
            const response = await timSinhVienTheoMaHoacFilter(filters);
            setFilteredStudents(response.data);
        } catch (error) {
            console.error('Error searching students:', error);
            alert('Có lỗi xảy ra khi tìm kiếm sinh viên.');
            setFilteredStudents([]);
        }
    };

    const handleSelectStudent = (id) => {
        setStudentId(id);
    };

    console.log(classGroup);

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

        exportDanhSachDiemGK(data)
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
                            disabled={!numberOfSemesters}
                        >
                            <MenuItem value="">
                                <em>Chọn học kỳ</em>
                            </MenuItem>
                            {numberOfSemesters &&
                                Array.from({ length: numberOfSemesters }, (_, i) => (
                                    <MenuItem key={i + 1} value={`${i + 1}`}>
                                        Học kỳ {i + 1}
                                    </MenuItem>
                                ))}
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
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<NoteAddIcon />}
                            onClick={handleCreateGradeSheet}
                            disabled={!course || loading || loadingStudents}
                        >
                            {loadingStudents && !searchMode ? <CircularProgress size={24} color="inherit" /> : 'Tạo Bảng Điểm'}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<SearchIcon />}
                            onClick={handleSearchStudents}
                            disabled={!course || loading || loadingStudents}
                        >
                            {loadingStudents && searchMode ? <CircularProgress size={24} color="inherit" /> : 'Tìm Kiếm'}
                        </Button>
                    </Box>
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
                    disabled={students.length === 0} // Chỉ vô hiệu hóa khi không có sinh viên
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
                            <TableCell>Lần học</TableCell>
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
                                <TableCell colSpan={10} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : students.length > 0 ? (
                            students
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((student) => {
                                    const canEnterFinal = canEnterFinalExamScore(student);

                                    return (
                                        <TableRow key={student.ma_sinh_vien}>
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
                                                    onChange={(e) => handleScoreChange(student.ma_sinh_vien, 'TP1', e.target.value)}
                                                    sx={{ width: '70px' }}
                                                    disabled
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                    value={student.diem.TP2 === null ? '' : student.diem.TP2}
                                                    onChange={(e) => handleScoreChange(student.ma_sinh_vien, 'TP2', e.target.value)}
                                                    sx={{ width: '70px' }}
                                                    disabled
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={!canEnterFinal ? "Điểm giữa kỳ TP1 và TP2 phải ≥ 4.0 để nhập điểm cuối kỳ" : ""}>
                                                    <span>
                                                        <TextField
                                                            type="number"
                                                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                            value={student.diem.CK1 === null ? '' : student.diem.CK1}
                                                            onChange={(e) => handleScoreChange(student.ma_sinh_vien, 'CK1', e.target.value)}
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
                                                            onChange={(e) => handleScoreChange(student.ma_sinh_vien, 'CK2', e.target.value)}
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
                                                            onChange={(e) => handleRetakeRegistration(student.ma_sinh_vien, e.target.checked)}
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
                                <TableCell colSpan={10} align="center">
                                    <Typography variant="body1" color="textSecondary">
                                        Chưa có dữ liệu. Vui lòng tạo bảng điểm trước.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {students.length > 0 && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={students.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0); // Reset về trang đầu khi thay đổi số hàng mỗi trang
                        }}
                    />
                )}
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
                                    value={dialogEducationType}
                                    label="Hệ đào tạo"
                                    onChange={(e) => setDialogEducationType(e.target.value)}
                                    disabled={loadingDialogData}
                                >
                                    {loadingDialogData ? (
                                        <MenuItem value="">
                                            <CircularProgress size={20} />
                                        </MenuItem>
                                    ) : (
                                        dialogEducationTypeOptions.map((option) => (
                                            <MenuItem key={option.id} value={option.id}>
                                                {option.ten_he_dao_tao}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Khóa</InputLabel>
                                <Select
                                    value={dialogBatch}
                                    label="Khóa"
                                    onChange={(e) => setDialogBatch(e.target.value)}
                                    disabled={!dialogEducationType || loadingDialogData}
                                >
                                    {loadingDialogData ? (
                                        <MenuItem value="">
                                            <CircularProgress size={20} />
                                        </MenuItem>
                                    ) : (
                                        dialogBatchOptions.map((option) => (
                                            <MenuItem key={option.id} value={option.id}>
                                                {option.ma_khoa}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Lớp</InputLabel>
                                <Select
                                    value={dialogClass}
                                    label="Lớp"
                                    onChange={(e) => setDialogClass(e.target.value)}
                                    disabled={!dialogBatch || loadingDialogData}
                                >
                                    {loadingDialogData ? (
                                        <MenuItem value="">
                                            <CircularProgress size={20} />
                                        </MenuItem>
                                    ) : (
                                        dialogClassOptions.map((option) => (
                                            <MenuItem key={option.id} value={option.id}>
                                                {option.ma_lop}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<SearchIcon />}
                                onClick={handleSearchStudentsInDialog}
                                disabled={loadingDialogData}
                            >
                                Tìm Kiếm
                            </Button>
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
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.ma_sinh_vien}>
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{`${student.ho_dem || ''} ${student.ten || ''}`}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.khoa}</TableCell>
                                            <TableCell>
                                                {dialogEducationTypeOptions.find(et => et.id === student.he_dao_tao_id)?.ten_he_dao_tao || student.he_dao_tao_id}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleSelectStudent(student.ma_sinh_vien)}
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
                    disabled={loadingStudents}
                    onClick={() => exportExcel(classGroup, course)}
                    id="exportButton"
                >
                    Xuất Excel
                </Button>
            </Box>
        </Paper>
    );
}

export default TaoBangDiem;