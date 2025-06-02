import React, { useState } from 'react';
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
    Container,
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
import XemDanhSachDiem from '../Diem/XemDanhSachDiem';
import StudentManagement from '../QLHV/StudentManagement ';
import MonHocTheoHeDaoTao from '../Mon Hoc/MonHocTheoHeDaoTao';
import QuanLyDaoTao from '../Dao Tao/QuanLyDaoTao';
import QuanLyKhoa from '../Khoa/QuanLyKhoa';
import QuanLyLop from '../LOP/ClassManagement';
import DieuKienTotNghiep from '../Dao Tao/DieuKienTotNghiep';
import QuanLyBangCap from '../Dao Tao/QuanLyBangCap';
import QuanLyKhenKyLuat from '../QLHV/khen_kyLuat';
import QuanLyChungChi from '../QuanLyChungChi/QuanLyChungChi';
import QuanLyMonHoc from '../Mon Hoc/QuanLyMonHoc';
import PhuLucBangDiem from '../Dao Tao/PhuLucBangDiem';
import ThongKeTotNghiep from '../Dao Tao/ThongKe';

// Styled component for file upload
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// Sample data for demonstration
const sampleStudents = [
    { id: 'SV001', name: 'Lê Hoài Nam', class: 'CT6', status: 'Học lần 1', scores: { TP1: 7, TP2: 8, CK1: 3, CK2: 2 } },
    { id: 'SV002', name: 'Nguyễn Văn Trọng', class: 'CT6', status: 'Học lần 1', scores: { TP1: 5, TP2: 6, CK1: 2, CK2: null } },
    { id: 'SV003', name: 'Trần Thị Hương', class: 'CT6', status: 'Học lần 2', scores: { TP1: 7, TP2: 8, CK1: 1, CK2: 6 } },
];

const GradeImportSystem = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [subTab, setSubTab] = useState(0); // State cho tab con
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [examPeriod, setExamPeriod] = useState('');
    const [course, setCourse] = useState('');
    const [examType, setExamType] = useState('');
    const [classGroup, setClassGroup] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [students, setStudents] = useState(sampleStudents);
    const [selectedFile, setSelectedFile] = useState(null);
    const [batch, setBatch] = useState('');
    const [major, setMajor] = useState('');
    const [examNumber, setExamNumber] = useState('');
    const [educationType, setEducationType] = useState('');
    const [viewFilter, setViewFilter] = useState({
        year: '',
        semester: '',
        examPeriod: '',
        batch: '',
        major: '',
        course: '',
        classGroup: '',
        examNumber: '',
        educationType: ''
    });

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setSubTab(0); // Reset tab con về 0 khi chuyển tab chính
    };
    const handleSubTabChange = (event, newValue) => {
        setSubTab(newValue);
    };
    const [reportType, setReportType] = useState('summary');

    // Add these handler functions
    const handleGenerateReport = () => {
        // Logic to generate the selected report type
        alert('Đang tạo báo cáo...');
    };

    const handleExportReport = () => {
        // Logic to export the generated report
        alert('Xuất báo cáo thành công!');
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleImport = () => {
        // Logic to import grades would go here
        alert('Điểm đã được import thành công!');
    };

    const handleSearch = () => {
        // Create a sample database of students (in a real app, this would come from an API or database)
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
                scores: { TP1: 7, TP2: 8, CK1: 3, CK2: null }
            },
            {
                id: 'SV002',
                name: 'Nguyễn Văn Trọng',
                class: 'CT6',
                batch: 'K15',
                major: 'CNTT',
                educationType: 'CQ',
                status: 'Thi lần 1',
                examNumber: '1',
                scores: { TP1: 5, TP2: 6, CK1: 2, CK2: null }
            },
            {
                id: 'SV003',
                name: 'Trần Thị Hương',
                class: 'CT6',
                batch: 'K15',
                major: 'HTTT',
                educationType: 'CQ',
                status: 'Thi lần 2',
                examNumber: '2',
                scores: { TP1: 7, TP2: 8, CK1: 1, CK2: 6 }
            },
            {
                id: 'SV004',
                name: 'Phạm Minh Tuấn',
                class: 'CT7',
                batch: 'K15',
                major: 'KTPM',
                educationType: 'CQ',
                status: 'Thi lần 1',
                examNumber: '1',
                scores: { TP1: 8, TP2: 9, CK1: 7, CK2: null }
            },
            {
                id: 'SV005',
                name: 'Hoàng Thị Mai',
                class: 'CT8',
                batch: 'K16',
                major: 'MMT',
                educationType: 'LT',
                status: 'Thi lần 1',
                examNumber: '1',
                scores: { TP1: 6, TP2: 7, CK1: 4, CK2: null }
            },
            {
                id: 'SV006',
                name: 'Vũ Đức Anh',
                class: 'CT7',
                batch: 'K16',
                major: 'CNTT',
                educationType: 'VLVH',
                status: 'Thi lần 2',
                examNumber: '2',
                scores: { TP1: 4, TP2: 5, CK1: 2, CK2: 5 }
            }
        ];

        // Filter students based on selected criteria
        let filteredStudents = [...allStudents];

        // Apply filters only if they have been selected
        if (year) {
            // In a real application, you would filter by year
            // Since our sample data doesn't have year info, we'll skip this filter
            console.log(`Filtering by academic year: ${year}`);
        }

        if (semester) {
            // In a real application, you would filter by semester
            console.log(`Filtering by semester: ${semester}`);
        }

        if (examPeriod) {
            // In a real application, you would filter by exam period
            console.log(`Filtering by exam period: ${examPeriod}`);
        }

        if (batch) {
            filteredStudents = filteredStudents.filter(student => student.batch === batch);
        }

        if (major) {
            filteredStudents = filteredStudents.filter(student => student.major === major);
        }

        if (course) {
            // In a real application, you would filter by course
            // Since our sample data doesn't have course info, we'll skip this filter
            console.log(`Filtering by course: ${course}`);
        }

        if (classGroup && classGroup !== 'ALL') {
            filteredStudents = filteredStudents.filter(student => student.class === classGroup);
        }

        if (examNumber) {
            filteredStudents = filteredStudents.filter(student => student.examNumber === examNumber);
        }

        if (educationType) {
            filteredStudents = filteredStudents.filter(student => student.educationType === educationType);
        }

        // Update the students state with filtered results
        setStudents(filteredStudents);

        // Provide feedback to the user
        if (filteredStudents.length > 0) {
            alert(`Đã tìm thấy ${filteredStudents.length} sinh viên phù hợp với các tiêu chí.`);
        } else {
            alert('Không tìm thấy sinh viên nào phù hợp với các tiêu chí đã chọn.');
        }

        // Log the filter criteria for debugging
        console.log('Search criteria:', {
            year,
            semester,
            examPeriod,
            batch,
            major,
            course,
            classGroup,
            examNumber,
            educationType
        });
    };

    const handleViewSearch = () => {
        // Logic to search students for viewing
        alert('Đã tìm danh sách điểm theo các bộ lọc đã chọn');
    };

    const handleScoreChange = (studentId, scoreType, value) => {
        const updatedStudents = students.map(student =>
            student.id === studentId
                ? { ...student, scores: { ...student.scores, [scoreType]: value === '' ? null : Number(value) } }
                : student
        );
        setStudents(updatedStudents);
    };

    const handleSave = () => {
        // Logic to save grades would go here
        alert('Đã lưu thành công!');
    };

    const handleRetakeRegistration = (studentId, checked) => {
        const updatedStudents = students.map(student =>
            student.id === studentId
                ? { ...student, retakeRegistered: checked }
                : student
        );
        setStudents(updatedStudents);
    };

    // Handle view filter changes
    const handleViewFilterChange = (field, value) => {
        setViewFilter({
            ...viewFilter,
            [field]: value
        });
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
            <Container maxWidth="" sx={{ py: 4 }}>
                <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
                    {/* Tab chính */}
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        sx={{
                            mb: 3,
                            '& .MuiTab-root': {
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                color: 'primary.main',
                                textTransform: 'uppercase',
                                padding: '12px 24px',
                            },
                            '& .Mui-selected': {
                                color: 'secondary.main',
                                borderBottom: '2px solid',
                                borderColor: 'secondary.main',
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        <Tab label="Quản lý điểm" />
                        <Tab label="Quản lý học viên" />
                        <Tab label="Quản lý môn học" />
                        <Tab label="Thống kê và báo cáo" />
                    </Tabs>

                    {currentTab === 0 && (
                        <Box>
                            {/* Tab con */}
                            <Tabs
                                value={subTab}
                                onChange={handleSubTabChange}
                                sx={{
                                    mb: 2,
                                    '& .MuiTab-root': {
                                        fontWeight: 'normal',
                                        fontSize: '0.9rem',
                                        color: 'text.secondary',
                                        padding: '8px 16px',
                                    },
                                    '& .Mui-selected': {
                                        color: 'primary.main',
                                        borderBottom: '2px solid',
                                        borderColor: 'primary.main',
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <Tab label="Tạo bảng điểm" />
                                <Tab label="Quản lý điểm" />
                                <Tab label="Xem danh sách điểm" />
                            </Tabs>
                            {subTab === 0 && <TaoBangDiem />}
                            {subTab === 1 && <QuanLyDiem />}
                            {subTab === 2 && <XemDanhSachDiem />}
                        </Box>
                    )}

                    {currentTab === 1 && (
                        <Box>
                            <Tabs value={subTab} onChange={handleSubTabChange}>
                                <Tab label="Danh sách học viên" />
                                <Tab label="Xét tốt nghiệp" />
                                <Tab label="Quản lý bằng cấp" />
                            </Tabs>
                            {subTab === 0 && <StudentManagement />}
                            {subTab === 1 && <DieuKienTotNghiep />}
                            {subTab === 2 && <QuanLyBangCap />}
                        </Box>
                    )}

                    {currentTab === 2 && (
                        <QuanLyMonHoc />
                    )}
                    {currentTab === 3 && (
                        <Box>
                            <Tabs value={subTab} onChange={handleSubTabChange}>
                                <Tab label="Thống kê tốt nghiệp" />
                                <Tab label="Báo cáo chi tiết" />
                            </Tabs>
                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                {subTab === 0 && <ThongKeTotNghiep />}
                            </Grid>
                        </Box>
                    )}
                </Paper>

            </Container>
        </Box>
    );
}


export default GradeImportSystem;