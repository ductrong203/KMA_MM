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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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

    const handleExportData = () => {
        // Logic to export data
        alert('Đã xuất dữ liệu thành công!');
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
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom component="div">
                Hệ thống Quản lý Điểm
            </Typography>

            <Tabs value={tabValue} onChange={handleTabChange} aria-label="grade management tabs">
                <Tab label="Import Điểm" />
                <Tab label="Tạo Bảng Điểm" />
                <Tab label="Quản lý Điểm" />
                <Tab label="Xem Danh Sách Điểm" />
                <Tab label="Báo cáo" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
                {tabValue === 0 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Import Điểm
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Năm học</InputLabel>
                                    <Select
                                        value={year}
                                        label="Năm học"
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        <MenuItem value="2023-2024">2023-2024</MenuItem>
                                        <MenuItem value="2024-2025">2024-2025</MenuItem>
                                        <MenuItem value="2025-2026">2025-2026</MenuItem>
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
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Đợt thi</InputLabel>
                                    <Select
                                        value={examPeriod}
                                        label="Đợt thi"
                                        onChange={(e) => setExamPeriod(e.target.value)}
                                    >
                                        <MenuItem value="1">Đợt 1</MenuItem>
                                        <MenuItem value="2">Đợt 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Môn học</InputLabel>
                                    <Select
                                        value={course}
                                        label="Môn học"
                                        onChange={(e) => setCourse(e.target.value)}
                                    >
                                        <MenuItem value="WEB">Lập trình Web</MenuItem>
                                        <MenuItem value="JAVA">Lập trình Java</MenuItem>
                                        <MenuItem value="DB">Cơ sở dữ liệu</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Loại điểm</InputLabel>
                                    <Select
                                        value={examType}
                                        label="Loại điểm"
                                        onChange={(e) => setExamType(e.target.value)}
                                    >
                                        <MenuItem value="TP1">Thành phần 1</MenuItem>
                                        <MenuItem value="TP2">Thành phần 2</MenuItem>
                                        <MenuItem value="CK1">Cuối kỳ (lần 1)</MenuItem>
                                        <MenuItem value="CK2">Cuối kỳ (thi lại)</MenuItem>
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
                                    >
                                        <MenuItem value="ALL">Toàn khóa</MenuItem>
                                        <MenuItem value="CT6">CT6</MenuItem>
                                        <MenuItem value="CT7">CT7</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ height: '56px' }}
                                >
                                    Chọn file Excel
                                    <VisuallyHiddenInput type="file" onChange={handleFileChange} />
                                </Button>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<FileUploadIcon />}
                                    onClick={handleImport}
                                    disabled={!selectedFile || !year || !semester || !examPeriod || !course || !examType}
                                    sx={{ height: '56px' }}
                                >
                                    Import Điểm
                                </Button>
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle1" gutterBottom>
                            {selectedFile ? `File đã chọn: ${selectedFile.name}` : 'Chưa chọn file nào'}
                        </Typography>
                    </Paper>
                )}
                {tabValue == 1 && (
                    <TaoBangDiem />
                )}
                {tabValue === 2 && (
                    <QuanLyDiem onSave={handleSave} sampleStudents={sampleStudents} />
                )}

                {tabValue === 3 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Xem Danh Sách Điểm
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Năm học</InputLabel>
                                    <Select
                                        value={viewFilter.year}
                                        label="Năm học"
                                        onChange={(e) => handleViewFilterChange('year', e.target.value)}
                                    >
                                        <MenuItem value="2023-2024">2023-2024</MenuItem>
                                        <MenuItem value="2024-2025">2024-2025</MenuItem>
                                        <MenuItem value="2025-2026">2025-2026</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Học kỳ</InputLabel>
                                    <Select
                                        value={viewFilter.semester}
                                        label="Học kỳ"
                                        onChange={(e) => handleViewFilterChange('semester', e.target.value)}
                                    >
                                        <MenuItem value="1">Học kỳ 1</MenuItem>
                                        <MenuItem value="2">Học kỳ 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Đợt học</InputLabel>
                                    <Select
                                        value={viewFilter.examPeriod}
                                        label="Đợt học"
                                        onChange={(e) => handleViewFilterChange('examPeriod', e.target.value)}
                                    >
                                        <MenuItem value="1">Đợt 1</MenuItem>
                                        <MenuItem value="2">Đợt 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Khóa</InputLabel>
                                    <Select
                                        value={viewFilter.batch}
                                        label="Khóa"
                                        onChange={(e) => handleViewFilterChange('batch', e.target.value)}
                                    >
                                        <MenuItem value="K14">K14</MenuItem>
                                        <MenuItem value="K15">K15</MenuItem>
                                        <MenuItem value="K16">K16</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Chuyên ngành</InputLabel>
                                    <Select
                                        value={viewFilter.major}
                                        label="Chuyên ngành"
                                        onChange={(e) => handleViewFilterChange('major', e.target.value)}
                                    >
                                        <MenuItem value="CNTT">Công nghệ thông tin</MenuItem>
                                        <MenuItem value="KTPM">Kỹ thuật phần mềm</MenuItem>
                                        <MenuItem value="HTTT">Hệ thống thông tin</MenuItem>
                                        <MenuItem value="MMT">Mạng máy tính</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Học phần</InputLabel>
                                    <Select
                                        value={viewFilter.course}
                                        label="Học phần"
                                        onChange={(e) => handleViewFilterChange('course', e.target.value)}
                                    >
                                        <MenuItem value="WEB">Lập trình Web</MenuItem>
                                        <MenuItem value="JAVA">Lập trình Java</MenuItem>
                                        <MenuItem value="DB">Cơ sở dữ liệu</MenuItem>
                                        <MenuItem value="AI">Trí tuệ nhân tạo</MenuItem>
                                        <MenuItem value="DS">Cấu trúc dữ liệu</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Lớp</InputLabel>
                                    <Select
                                        value={viewFilter.classGroup}
                                        label="Lớp"
                                        onChange={(e) => handleViewFilterChange('classGroup', e.target.value)}
                                    >
                                        <MenuItem value="ALL">Tất cả</MenuItem>
                                        <MenuItem value="CT6">CT6</MenuItem>
                                        <MenuItem value="CT7">CT7</MenuItem>
                                        <MenuItem value="CT8">CT8</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Lần thi</InputLabel>
                                    <Select
                                        value={viewFilter.examNumber}
                                        label="Lần thi"
                                        onChange={(e) => handleViewFilterChange('examNumber', e.target.value)}
                                    >
                                        <MenuItem value="1">Lần 1</MenuItem>
                                        <MenuItem value="2">Lần 2 (Thi lại)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Hệ đào tạo</InputLabel>
                                    <Select
                                        value={viewFilter.educationType}
                                        label="Hệ đào tạo"
                                        onChange={(e) => handleViewFilterChange('educationType', e.target.value)}
                                    >
                                        <MenuItem value="CQ">Chính quy</MenuItem>
                                        <MenuItem value="LT">Liên thông</MenuItem>
                                        <MenuItem value="VLVH">Vừa làm vừa học</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<VisibilityIcon />}
                                    onClick={handleViewSearch}
                                    sx={{ height: '56px' }}
                                >
                                    Xem điểm
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="view grades table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã SV</TableCell>
                                        <TableCell>Họ và tên</TableCell>
                                        <TableCell>Lớp</TableCell>
                                        <TableCell>Trạng thái</TableCell>
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
                                        const finalExamScore = student.scores.CK2 !== null ? student.scores.CK2 : student.scores.CK1;
                                        const totalScore = student.scores.TP1 * 0.2 + student.scores.TP2 * 0.2 + finalExamScore * 0.6;

                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>{student.id}</TableCell>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell>{student.class}</TableCell>
                                                <TableCell>{student.status}</TableCell>
                                                <TableCell>{student.scores.TP1}</TableCell>
                                                <TableCell>{student.scores.TP2}</TableCell>
                                                <TableCell>{student.scores.CK1}</TableCell>
                                                <TableCell>{student.scores.CK2 !== null ? student.scores.CK2 : '-'}</TableCell>
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
                )}

                {tabValue === 4 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Báo cáo
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Năm học</InputLabel>
                                    <Select
                                        value={year}
                                        label="Năm học"
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        <MenuItem value="2023-2024">2023-2024</MenuItem>
                                        <MenuItem value="2024-2025">2024-2025</MenuItem>
                                        <MenuItem value="2025-2026">2025-2026</MenuItem>
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
                                    <InputLabel>Loại báo cáo</InputLabel>
                                    <Select
                                        value={reportType}
                                        label="Loại báo cáo"
                                        onChange={(e) => setReportType(e.target.value)}
                                    >
                                        <MenuItem value="summary">Tổng kết điểm</MenuItem>
                                        <MenuItem value="distribution">Phân bố điểm</MenuItem>
                                        <MenuItem value="retake">Danh sách thi lại</MenuItem>
                                        <MenuItem value="failRate">Tỷ lệ trượt theo lớp</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SearchIcon />}
                                    onClick={handleGenerateReport}
                                    sx={{ height: '56px' }}
                                >
                                    Tạo báo cáo
                                </Button>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleExportReport}
                                    sx={{ height: '56px' }}
                                >
                                    Xuất báo cáo
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Kết quả báo cáo sẽ hiển thị ở đây
                            </Typography>

                            {/* Placeholder for report visualization - would be replaced with actual charts */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    backgroundColor: '#f5f5f5',
                                    height: '400px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography color="text.secondary">
                                    Chọn các tiêu chí và nhấn "Tạo báo cáo" để xem kết quả
                                </Typography>
                            </Paper>
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}


export default GradeImportSystem;