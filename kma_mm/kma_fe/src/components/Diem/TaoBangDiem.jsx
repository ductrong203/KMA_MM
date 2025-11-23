import {
    Alert,
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
import { chiTietMonHoc, getDanhSachMonHocTheoKhoaVaKi } from '../../Api_controller/Service/monHocService';
import api from '../../Api_controller/Api_setup/axiosConfig';
import { getThoiKhoaBieu } from '../../Api_controller/Service/thoiKhoaBieuService';
import { kiemTraBangDiemTonTai, layDanhSachSinhVienTheoTKB, taoBangDiemChoSinhVien, themSinhVienHocLai, timSinhVienTheoMaHoacFilter } from '../../Api_controller/Service/diemService';
import { exportDanhSachDiemCK, exportDanhSachDiemGK } from '../../Api_controller/Service/excelService';
import { toast } from 'react-toastify';

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
    const [course, setCourse] = useState([]); // Changed to array for multiple selection
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
    const [selectedStudents, setSelectedStudents] = useState([]); // Thêm state cho nhiều sinh viên
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
    const [rowsPerPage, setRowsPerPage] = useState(40);
    
    // State cho hình thức bảo vệ
    const [defenseType, setDefenseType] = useState('');

    // Thêm hàm xử lý chức năng tìm kiếm
    const handleSearchStudents = async () => {
        if (!batch || !classGroup || !semester || !course.length) {
            toast.error('Vui lòng chọn đầy đủ thông tin để tìm kiếm học viên');
            return;
        }
        
        if (!scheduleId || scheduleId.length === 0) {
            toast.error('Không tìm thấy thời khóa biểu cho các môn học đã chọn');
            return;
        }
        
        setSearchMode(true);
        setLoadingStudents(true);
        try {
            let allStudents = [];

            // Process each schedule ID
            for (const schedule of scheduleId) {
                try {
                    // Chuẩn bị tham số cho API tìm kiếm
                    let searchUrl = `thoi_khoa_bieu_id=${schedule.scheduleId}`;
                    
                    // Thêm tham số bao_ve_do_an nếu có chọn hình thức bảo vệ
                    if (defenseType === 'bao_ve_do_an') {
                        searchUrl += '&bao_ve_do_an=true';
                    } else if (defenseType === 'thi_tot_nghiep') {
                        searchUrl += '&bao_ve_do_an=false';
                    }
                    
                    const response = await layDanhSachSinhVienTheoTKB(searchUrl);

                    // Backend đã lọc theo hình thức bảo vệ, không cần lọc lại ở frontend
                    const filteredByDefenseType = response.data;

                    const formattedStudents = await Promise.all(
                        filteredByDefenseType.map(async (student) => {
                            const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
                            const maLop = lopInfo?.ma_lop || student.lop_id;
                            
                            // Get course name from courseOptions
                            const courseInfo = courseOptions.find(c => c.id === schedule.courseId);
                            const courseName = courseInfo?.ten_mon_hoc || courseInfo?.name || schedule.courseId;

                            return {
                                ma_sinh_vien: student.sinh_vien.ma_sinh_vien,
                                ho_dem: student.sinh_vien.ho_dem,
                                ten: student.sinh_vien.ten,
                                lop: maLop,
                                mon_hoc: courseName,
                                lan_hoc: student.lan_hoc ? 'Học lần ' + student.lan_hoc : 'Học lần 1',
                                diem: {
                                    TP1: student.diem?.TP1 || null,
                                    TP2: student.diem?.TP2 || null,
                                    CK1: student.diem?.CK1 || null,
                                    CK2: student.diem?.CK2 || null
                                },
                                retakeRegistered: student.retakeRegistered || false,
                                scheduleId: schedule.scheduleId,
                                courseId: schedule.courseId
                            };
                        })
                    );
                    allStudents = allStudents.concat(formattedStudents);
                } catch {
                    toast.error(`Có lỗi xảy ra khi tìm kiếm học viên cho môn học ${schedule.courseId}`);
                }
            }

            setStudents(allStudents);

            if (allStudents.length > 0) {
                const defenseTypeText = defenseType === 'bao_ve_do_an' ? 'bảo vệ đồ án' :
                                      defenseType === 'thi_tot_nghiep' ? 'thi tốt nghiệp' : 'tất cả';
                toast.success(`Đã tìm thấy ${allStudents.length} học viên đủ điều kiện ${defenseTypeText}.`);
            } else {
                const defenseTypeText = defenseType === 'bao_ve_do_an' ? 'bảo vệ đồ án' :
                                      defenseType === 'thi_tot_nghiep' ? 'thi tốt nghiệp' : 'phù hợp';
                toast.warn(`Không tìm thấy học viên nào đủ điều kiện ${defenseTypeText}.`);
            }
        } catch {
            toast.error('Có lỗi xảy ra khi tìm kiếm học viên. Vui lòng thử lại sau.');
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
            setCourse([]); // Reset to empty array
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
            setCourse([]); // Reset course selection to empty array
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
                const courseDetailsResponse = await chiTietMonHoc({
                    ids: courseIds.join(',')
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

    // Find schedule IDs when courses and class are selected
    useEffect(() => {
        if (!classGroup || !course.length) return;

        const fetchScheduleIds = async () => {
            setLoading(true);
            try {
                const scheduleIds = [];
                for (const courseId of course) {
                    const response = await getThoiKhoaBieu(courseId, classGroup, semester);
                    if (response.data && response.data.length > 0) {
                        scheduleIds.push({
                            courseId: courseId,
                            scheduleId: response.data[0].id
                        });
                    }
                }
                setScheduleId(scheduleIds);
            } catch (error) {
                console.error('Error fetching schedule IDs:', error);
                setScheduleId([]);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleIds();
    }, [classGroup, course, semester]);

    console.log("scheduleId:", scheduleId);

    const handleCreateGradeSheet = async () => {
        if (!scheduleId || scheduleId.length === 0) {
            toast.error('Vui lòng chọn đầy đủ thông tin để tạo bảng điểm');
            return;
        }

        setLoadingStudents(true);
        try {
            let allStudents = [];
            let existingGradeSheetsCount = 0;
            let newGradeSheetsCount = 0;

            // Process each schedule ID
            for (const schedule of scheduleId) {
                try {
                    const existingGradeSheet = await kiemTraBangDiemTonTai(schedule.scheduleId);
                    
                    if (existingGradeSheet && existingGradeSheet.data && existingGradeSheet.data.length > 0) {
                        existingGradeSheetsCount++;
                        
                        // Chuẩn bị tham số cho API tìm kiếm khi bảng điểm đã tồn tại
                        let searchUrl = `thoi_khoa_bieu_id=${schedule.scheduleId}`;
                        
                        // Thêm tham số bao_ve_do_an nếu có chọn hình thức bảo vệ
                        if (defenseType === 'bao_ve_do_an') {
                            searchUrl += '&bao_ve_do_an=true';
                        } else if (defenseType === 'thi_tot_nghiep') {
                            searchUrl += '&bao_ve_do_an=false';
                        }
                        
                        const studentsResponse = await layDanhSachSinhVienTheoTKB(searchUrl);
                        const filteredByDefenseType = studentsResponse.data;
                        
                        const formattedStudents = await Promise.all(
                            filteredByDefenseType.map(async (student) => {
                                const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
                                const maLop = lopInfo?.ma_lop || student.lop_id;
                                
                                // Get course name from courseOptions
                                const courseInfo = courseOptions.find(c => c.id === schedule.courseId);
                                const courseName = courseInfo?.ten_mon_hoc || courseInfo?.name || schedule.courseId;

                                return {
                                    ma_sinh_vien: student.sinh_vien.ma_sinh_vien,
                                    ho_dem: student.sinh_vien.ho_dem,
                                    ten: student.sinh_vien.ten,
                                    lop: maLop,
                                    mon_hoc: courseName,
                                    lan_hoc: student.lan_hoc ? 'Học lần ' + student.lan_hoc : 'Học lần 1',
                                    diem: {
                                        TP1: student.diem_tp1 || null,
                                        TP2: student.diem_tp2 || null,
                                        CK1: student.diem_ck || null,
                                        CK2: student.diem_ck2 || null
                                    },
                                    retakeRegistered: student.retakeRegistered || false,
                                    scheduleId: schedule.scheduleId,
                                    courseId: schedule.courseId
                                };
                            })
                        );
                        allStudents = allStudents.concat(formattedStudents);
                    } else {
                        // Tạo bảng điểm mới cho môn học này
                        const gradeSheetParams = { thoi_khoa_bieu_id: schedule.scheduleId };
                        
                        // Thêm tham số bao_ve_do_an nếu có chọn hình thức bảo vệ
                        if (defenseType === 'bao_ve_do_an') {
                            gradeSheetParams.bao_ve_do_an = true;
                        } else if (defenseType === 'thi_tot_nghiep') {
                            gradeSheetParams.bao_ve_do_an = false;
                        }
                        
                        await taoBangDiemChoSinhVien(gradeSheetParams);
                        newGradeSheetsCount++;

                        // Chuẩn bị tham số cho API tìm kiếm sau khi tạo bảng điểm mới
                        let searchUrl = `thoi_khoa_bieu_id=${schedule.scheduleId}`;
                        
                        // Thêm tham số bao_ve_do_an nếu có chọn hình thức bảo vệ
                        if (defenseType === 'bao_ve_do_an') {
                            searchUrl += '&bao_ve_do_an=true';
                        } else if (defenseType === 'thi_tot_nghiep') {
                            searchUrl += '&bao_ve_do_an=false';
                        }
                        
                        const studentsResponse = await layDanhSachSinhVienTheoTKB(searchUrl);
                        const filteredByDefenseType = studentsResponse.data;

                        const formattedStudents = await Promise.all(
                            filteredByDefenseType.map(async (student) => {
                                const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
                                const maLop = lopInfo?.ma_lop || student.lop_id;
                                
                                // Get course name from courseOptions
                                const courseInfo = courseOptions.find(c => c.id === schedule.courseId);
                                const courseName = courseInfo?.ten_mon_hoc || courseInfo?.name || schedule.courseId;

                                return {
                                    ma_sinh_vien: student.sinh_vien.ma_sinh_vien,
                                    ho_dem: student.sinh_vien.ho_dem,
                                    ten: student.sinh_vien.ten,
                                    lop: maLop,
                                    mon_hoc: courseName,
                                    lan_hoc: student.lan_hoc ? 'Học lần ' + student.lan_hoc : 'Học lần 1',
                                    diem: {
                                        TP1: student.diem_tp1 || null,
                                        TP2: student.diem_tp2 || null,
                                        CK1: student.diem_ck || null,
                                        CK2: student.diem_ck2 || null
                                    },
                                    retakeRegistered: student.retakeRegistered || false,
                                    scheduleId: schedule.scheduleId,
                                    courseId: schedule.courseId
                                };
                            })
                        );
                        allStudents = allStudents.concat(formattedStudents);
                    }
                } catch (courseError) {
                    console.error(`Error processing course ${schedule.courseId}:`, courseError);
                    toast.error(`Có lỗi xảy ra khi xử lý môn học ${schedule.courseId}`);
                }
            }

            setStudents(allStudents);

            // Tạo thông báo tổng hợp
            let message = '';
            if (newGradeSheetsCount > 0 && existingGradeSheetsCount > 0) {
                message = `Đã tạo ${newGradeSheetsCount} bảng điểm mới và tìm thấy ${existingGradeSheetsCount} bảng điểm đã tồn tại. Tổng cộng ${allStudents.length} học viên.`;
            } else if (newGradeSheetsCount > 0) {
                message = `Đã tạo ${newGradeSheetsCount} bảng điểm mới với ${allStudents.length} học viên.`;
            } else if (existingGradeSheetsCount > 0) {
                message = `Tìm thấy ${existingGradeSheetsCount} bảng điểm đã tồn tại với ${allStudents.length} học viên.`;
            }

            if (allStudents.length > 0) {
                toast.success(message);
            } else {
                toast.warn('Không tìm thấy học viên nào phù hợp với các tiêu chí đã chọn.');
            }
        } catch (error) {
            console.error('Error creating grade sheet:', error);
            toast.error('Có lỗi xảy ra khi tạo bảng điểm. Vui lòng thử lại sau.');

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
        const numericValue = value === '' ? null : parseFloat(value);

        setStudents(prevStudents =>
            prevStudents.map(student => {
                if (student.ma_sinh_vien === studentId) {
                    if ((scoreType === 'CK1' || scoreType === 'CK2') && !canEnterFinalExamScore(student)) {
                        toast.error(`Không thể nhập điểm cuối kỳ cho học viên ${student.ho_dem} ${student.ten}. Điểm giữa kỳ (TP1 và TP2) phải lớn hơn hoặc bằng 4.0.`);
                        return student;
                    }

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
            prevStudents.map(student => {
                if (student.ma_sinh_vien === studentId) {
                    toast.success(checked ? 'Đã đăng ký học lại.' : 'Đã hủy đăng ký học lại.');
                    return { ...student, retakeRegistered: checked };
                }
                return student;
            })
        );

        if (gradeSheetId) {
            try {
                await axios.put(`${API_BASE_URL}/grade-sheets/${gradeSheetId}/students/${studentId}/retake`, {
                    retakeRegistered: checked
                });
                toast.success('Cập nhật đăng ký học lại thành công.');
            } catch (error) {
                console.error('Error updating retake registration:', error);
                toast.error('Có lỗi xảy ra khi cập nhật đăng ký học lại. Vui lòng thử lại.');
            }
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
        // Reset dialog fields
        setStudentId('');
        setSelectedStudents([]); // Reset danh sách sinh viên đã chọn
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
        setSelectedStudents([]); // Reset danh sách sinh viên đã chọn
        setDialogEducationType('');
        setDialogBatch('');
        setDialogClass('');
        setFilteredStudents([]);
        setDialogEducationTypeOptions([]);
        setDialogBatchOptions([]);
        setDialogClassOptions([]);
    };

    // Xử lý chọn/bỏ chọn một sinh viên
    const handleSelectStudent = (studentCode) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentCode)) {
                return prev.filter(code => code !== studentCode);
            } else {
                return [...prev, studentCode];
            }
        });
    };

    // Xử lý chọn/bỏ chọn tất cả sinh viên
    const handleSelectAllStudents = (checked) => {
        if (checked) {
            const allStudentCodes = filteredStudents.map(student => student.ma_sinh_vien);
            setSelectedStudents(allStudentCodes);
        } else {
            setSelectedStudents([]);
        }
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
        // Kiểm tra có sinh viên nào được chọn không
        if (selectedStudents.length === 0) {
            toast.error('Vui lòng chọn ít nhất một học viên');
            return;
        }

        if (!scheduleId || scheduleId.length === 0) {
            toast.error('Vui lòng chọn môn học trước khi thêm sinh viên học lại');
            return;
        }

        // Xác nhận trước khi thêm học viên học lại (liệt kê các lớp học phần)
        const classInfoConfirm = classOptions.find(option => option.id === classGroup);
        const maLopConfirm = classInfoConfirm?.ma_lop || '';
        const hpLines = (scheduleId || []).map((s) => {
            const courseInfo = courseOptions.find(c => c.id === s.courseId);
            const tenMon = courseInfo?.ten_mon_hoc || courseInfo?.name || s.courseId;
            return `- ${tenMon} - ${maLopConfirm}`;
        }).join('\n');
        const plural = (scheduleId?.length || 0) > 1 ? 'các lớp học phần sau' : 'lớp học phần sau';
        const confirmMsg = `Bạn có chắc chắn muốn thêm sinh viên học lại vào ${plural}:\n${hpLines}`;
        const agreed = window.confirm(confirmMsg);
        if (!agreed) return;

        try {
            let totalAdded = 0;
            let totalSkipped = 0;
            let errorCount = 0;

            // Duyệt qua từng sinh viên được chọn
            for (const studentCode of selectedStudents) {
                // Kiểm tra sinh viên đã tồn tại trong danh sách chưa
                const isStudentExist = students.some(student => student.ma_sinh_vien === studentCode);
                if (isStudentExist) {
                    totalSkipped++;
                    continue;
                }

                // Thêm sinh viên vào tất cả các môn học được chọn
                let addedToSchedules = 0;
                for (const schedule of scheduleId) {
                    try {
                        const response = await themSinhVienHocLai({
                            thoi_khoa_bieu_id: schedule.scheduleId,
                            ma_sinh_vien: studentCode,
                        });

                        if (response.success) {
                            addedToSchedules++;
                        }
                    } catch {
                        // Tiếp tục với schedule tiếp theo nếu có lỗi
                        continue;
                    }
                }

                if (addedToSchedules > 0) {
                    totalAdded++;
                } else {
                    errorCount++;
                }
            }

            // Hiển thị kết quả
            if (totalAdded > 0) {
                await handleSearchStudents(); // Tải lại danh sách sinh viên
                let message = `Đã thêm thành công ${totalAdded} học viên`;
                if (totalSkipped > 0) {
                    message += `, bỏ qua ${totalSkipped} học viên đã tồn tại`;
                }
                if (errorCount > 0) {
                    message += `, ${errorCount} học viên gặp lỗi`;
                }
                toast.success(message);
            } else {
                toast.error('Không thể thêm bất kỳ học viên nào');
            }
        } catch (error) {
            toast.error(`Có lỗi xảy ra khi thêm học viên: ${error.message || 'Vui lòng thử lại.'}`);
        }

        handleCloseDialog();
    };


    // Thêm hàm xử lý tìm kiếm học viên trong Dialog
    const handleSearchStudentsInDialog = async () => {
        try {
            const filters = {};
            if (studentId) filters.ma_sinh_vien = studentId;
            if (dialogEducationType) filters.he_dao_tao_id = dialogEducationType;
            if (dialogBatch) filters.khoa_id = dialogBatch;
            if (dialogClass) filters.lop_id = dialogClass;
            const response = await timSinhVienTheoMaHoacFilter(filters);
            setFilteredStudents(response.data);
            toast.success(`Đã tìm thấy ${response.data.length} học viên phù hợp.`);
            if (response.data.length === 0) {
                toast.warn('Không tìm thấy học viên phù hợp.');
            }
        } catch (error) {
            console.error('Error searching students:', error);
            toast.error('Không tìm thấy học viên.');
            setFilteredStudents([]);
        }
    };

    console.log(classGroup);

    const exportExcel = (lopId, monHocId) => {
        const courseInfo = courseOptions.find(option => option.id === monHocId);
        const tenMonHoc = courseInfo?.ten_mon_hoc || 'Unknown';

        const classInfo = classOptions.find(option => option.id === lopId);
        const maLop = classInfo?.ma_lop || 'Unknown';

        const fileName = `${tenMonHoc} - ${maLop}.xlsx`;

        const data = {
            lop_id: lopId,
            mon_hoc_id: monHocId
        };

        exportDanhSachDiemGK(data)
            .then(response => {
                const blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
                toast.success('Xuất file Excel thành công!');
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error('Không thể tải xuống file Excel. Vui lòng thử lại sau.');
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
                            multiple
                            value={course}
                            label="Học phần"
                            onChange={(e) => setCourse(e.target.value)}
                            disabled={!classGroup || !semester || loadingCourses}
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return 'Chọn môn học';
                                }
                                const selectedCourses = courseOptions.filter(option =>
                                    selected.includes(option.id)
                                );
                                return selectedCourses.map(course =>
                                    course.ten_mon_hoc || course.name || course.mon_hoc_id
                                ).join(', ');
                            }}
                        >
                            {loadingCourses ? (
                                <MenuItem value="">
                                    <CircularProgress size={20} />
                                </MenuItem>
                            ) : (
                                courseOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        <Checkbox checked={course.indexOf(option.id) > -1} />
                                        {option.ten_mon_hoc || option.name || option.mon_hoc_id}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Hình thức bảo vệ</InputLabel>
                        <Select
                            value={defenseType}
                            label="Hình thức bảo vệ"
                            onChange={(e) => setDefenseType(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Tất cả (không lọc)</em>
                            </MenuItem>
                            <MenuItem value="bao_ve_do_an">Bảo vệ đồ án</MenuItem>
                            <MenuItem value="thi_tot_nghiep">Thi tốt nghiệp</MenuItem>
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
                            disabled={!course.length || loading || loadingStudents}
                        >
                            {loadingStudents && !searchMode ? <CircularProgress size={24} color="inherit" /> : 'Tạo Bảng Điểm'}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<SearchIcon />}
                            onClick={handleSearchStudents}
                            disabled={!course.length || loading || loadingStudents}
                        >
                            {loadingStudents && searchMode ? <CircularProgress size={24} color="inherit" /> : 'Tìm Kiếm'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Chú ý khi lựa chọn hình thức bảo vệ:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        <li>
                            <Typography variant="body2">
                                <strong>Bảo vệ đồ án:</strong> Chỉ tạo sinh viên được đánh dấu &quot;Bảo vệ đồ án&quot;
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>Thi tốt nghiệp:</strong> Chỉ tạo sinh viên &quot;Thi tốt nghiệp&quot;
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>Tất cả:</strong> Chỉ tạo toàn bộ sinh viên (không lọc theo hình thức bảo vệ)
                            </Typography>
                        </li>
                    </Box>
                </Alert>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={handleOpenDialog}
                    disabled={!course.length || !scheduleId || scheduleId.length === 0} // Chỉ vô hiệu hóa khi chưa chọn môn học
                >
                    Thêm học viên
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
                            <TableCell>Môn học</TableCell>
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
                                <TableCell colSpan={11} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : students.length > 0 ? (
                            students
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((student) => {
                                    const canEnterFinal = canEnterFinalExamScore(student);
                                    const isRetakeStudent = student.lan_hoc !== 'Học lần 1';

                                    return (
                                        <TableRow key={`${student.ma_sinh_vien}-${student.courseId}`}>
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{student.ho_dem}</TableCell>
                                            <TableCell>{student.ten}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.mon_hoc}</TableCell>
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
                                                {isRetakeStudent ? (
                                                    <Tooltip title="Chỉ học viên học lại mới có thể đăng ký">
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={student.retakeRegistered || false}
                                                                    onChange={(e) => handleRetakeRegistration(student.ma_sinh_vien, e.target.checked)}
                                                                />
                                                            }
                                                            label=""
                                                        />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="học viên học lần đầu không thể đăng ký học lại">
                                                        <span>
                                                            <FormControlLabel
                                                                control={<Checkbox disabled />}
                                                                label=""
                                                            />
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={11} align="center">
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
                        rowsPerPageOptions={[5, 10, 25, 40, 50]}
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

            {/* Dialog thêm học viên học lại */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Thêm học viên</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Mã học viên"
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
                                <InputLabel>Khóa đào tạo</InputLabel>
                                <Select
                                    value={dialogBatch}
                                    label="Khóa đào tạo"
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
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                                            checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                            onChange={(e) => handleSelectAllStudents(e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell>Mã SV</TableCell>
                                    <TableCell>Họ và tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Khóa đào tạo</TableCell>
                                    <TableCell>Hệ đào tạo</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.ma_sinh_vien}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedStudents.includes(student.ma_sinh_vien)}
                                                    onChange={() => handleSelectStudent(student.ma_sinh_vien)}
                                                />
                                            </TableCell>
                                            <TableCell>{student.ma_sinh_vien}</TableCell>
                                            <TableCell>{`${student.ho_dem || ''} ${student.ten || ''}`}</TableCell>
                                            <TableCell>{student.lop}</TableCell>
                                            <TableCell>{student.khoa}</TableCell>
                                            <TableCell>
                                                {dialogEducationTypeOptions.find(et => et.id === student.he_dao_tao_id)?.ten_he_dao_tao || student.he_dao_tao_id}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Không tìm thấy học viên phù hợp
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
                        disabled={selectedStudents.length === 0}
                    >
                        Thêm {selectedStudents.length > 0 ? `${selectedStudents.length} học viên` : ''} vào danh sách học lại
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