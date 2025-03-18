import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import {
    Box,
    Button,
    Checkbox,
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
    Tabs,
    Tab,
    Alert,
    Badge
} from '@mui/material';
import React, { useState } from 'react';

function QuanLyDiem({ onSave, sampleStudents }) {
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [examPeriod, setExamPeriod] = useState('');
    const [batch, setBatch] = useState('');
    const [major, setMajor] = useState('');
    const [course, setCourse] = useState('');
    const [classGroup, setClassGroup] = useState('');
    const [examNumber, setExamNumber] = useState('');
    const [educationType, setEducationType] = useState('');
    const [students, setStudents] = useState(sampleStudents || []);
    const [activeTab, setActiveTab] = useState(0);
    const [activeGradeTab, setActiveGradeTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleGradeTabChange = (event, newValue) => {
        setActiveGradeTab(newValue);
    };

    const handleSearch = () => {
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

        let filteredStudents = [...allStudents];
        if (year) console.log(`Filtering by academic year: ${year}`);
        if (semester) console.log(`Filtering by semester: ${semester}`);
        if (examPeriod) console.log(`Filtering by exam period: ${examPeriod}`);
        if (batch) filteredStudents = filteredStudents.filter(student => student.batch === batch);
        if (major) filteredStudents = filteredStudents.filter(student => student.major === major);
        if (course) console.log(`Filtering by course: ${course}`);
        if (classGroup && classGroup !== 'ALL') filteredStudents = filteredStudents.filter(student => student.class === classGroup);
        if (examNumber) filteredStudents = filteredStudents.filter(student => student.examNumber === examNumber);
        if (educationType) filteredStudents = filteredStudents.filter(student => student.educationType === educationType);

        setStudents(filteredStudents);
        alert(filteredStudents.length > 0
            ? `Đã tìm thấy ${filteredStudents.length} sinh viên phù hợp với các tiêu chí.`
            : 'Không tìm thấy sinh viên nào phù hợp với các tiêu chí đã chọn.');
        setActiveTab(0);
        setActiveGradeTab(0);
    };

    // Sinh viên đủ điều kiện thi CK khi điểm TP1 >= 4.0
    const canTakeFinalExam = (student) => {
        return student.scores.TP1 !== null && student.scores.TP1 !== undefined && student.scores.TP1 >= 4.0;
    };

    // Sinh viên đủ điều kiện thi lại khi điểm CK1 < 4.0
    const eligibleForRetake = (student) => {
        return student.scores.CK1 !== null && student.scores.CK1 !== undefined && student.scores.CK1 < 4.0;
    };

    const handleMidtermScoreChange = (studentId, scoreType, value) => {
        const numericValue = value === '' ? null : parseFloat(value);
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === studentId
                    ? { ...student, scores: { ...student.scores, [scoreType]: numericValue } }
                    : student
            )
        );
    };

    const handleFinalScoreChange = (studentId, scoreType, value) => {
        const numericValue = value === '' ? null : parseFloat(value);
        setStudents(prevStudents =>
            prevStudents.map(student => {
                if (student.id === studentId) {
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

                    return { ...student, scores: { ...student.scores, [scoreType]: numericValue } };
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

    const handleSave = () => {
        if (onSave) onSave(students);
        console.log('Saving student scores:', students);
        alert('Đã lưu điểm thành công!');
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
        const finalScore = student.scores.CK2 !== null ? student.scores.CK2 : student.scores.CK1;

        if (student.scores.TP1 && student.scores.TP2 && finalScore !== null) {
            return ((student.scores.TP1 + student.scores.TP2 + finalScore * 2) / 4).toFixed(1);
        }
        return null;
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quản lý Điểm</Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Hệ đào tạo</InputLabel>
                        <Select value={educationType} label="Hệ đào tạo" onChange={(e) => setEducationType(e.target.value)}>
                            <MenuItem value="CQ">Chính quy</MenuItem>
                            <MenuItem value="LT">Liên thông</MenuItem>
                            <MenuItem value="VLVH">Vừa làm vừa học</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Khóa</InputLabel>
                        <Select value={batch} label="Khóa" onChange={(e) => setBatch(e.target.value)}>
                            <MenuItem value="K14">K14</MenuItem>
                            <MenuItem value="K15">K15</MenuItem>
                            <MenuItem value="K16">K16</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Học kỳ</InputLabel>
                        <Select value={semester} label="Học kỳ" onChange={(e) => setSemester(e.target.value)}>
                            <MenuItem value="1">Học kỳ 1</MenuItem>
                            <MenuItem value="2">Học kỳ 2</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Đợt học</InputLabel>
                        <Select value={examPeriod} label="Đợt học" onChange={(e) => setExamPeriod(e.target.value)}>
                            <MenuItem value="1">Đợt 1</MenuItem>
                            <MenuItem value="2">Đợt 2</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Lớp</InputLabel>
                        <Select value={classGroup} label="Lớp" onChange={(e) => setClassGroup(e.target.value)}>
                            <MenuItem value="ALL">Tất cả</MenuItem>
                            <MenuItem value="CT6">CT6</MenuItem>
                            <MenuItem value="CT7">CT7</MenuItem>
                            <MenuItem value="CT8">CT8</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Học phần</InputLabel>
                        <Select value={course} label="Học phần" onChange={(e) => setCourse(e.target.value)}>
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
                        <InputLabel>Lần thi</InputLabel>
                        <Select value={examNumber} label="Lần thi" onChange={(e) => setExamNumber(e.target.value)}>
                            <MenuItem value="1">Lần 1</MenuItem>
                            <MenuItem value="2">Lần 2 (Thi lại)</MenuItem>
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
                            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="midterm grades table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Mã SV</TableCell>
                                            <TableCell>Họ và tên</TableCell>
                                            <TableCell>Lớp</TableCell>
                                            <TableCell>Khóa</TableCell>
                                            <TableCell>Trạng thái</TableCell>
                                            <TableCell align="center">Điểm giữa kỳ (TP1)</TableCell>
                                            <TableCell align="center">Điểm chuyên cần (TP2)</TableCell>
                                            <TableCell>Ghi chú</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student) => {
                                            let note = '';
                                            if (student.scores.TP1 === null || student.scores.TP1 === undefined) {
                                                note = 'Chưa có điểm TP1';
                                            } else if (student.scores.TP1 < 4.0) {
                                                note = 'Điểm TP1 < 4.0 (Không đủ điều kiện thi cuối kỳ)';
                                            }

                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>{student.id}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>{student.class}</TableCell>
                                                    <TableCell>{student.batch}</TableCell>
                                                    <TableCell>{student.status}</TableCell>
                                                    <TableCell align="center">
                                                        <TextField
                                                            type="number"
                                                            value={student.scores.TP1 === null ? '' : student.scores.TP1}
                                                            onChange={(e) => handleMidtermScoreChange(student.id, 'TP1', e.target.value)}
                                                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                            sx={{ width: '80px' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <TextField
                                                            type="number"
                                                            value={student.scores.TP2 === null ? '' : student.scores.TP2}
                                                            onChange={(e) => handleMidtermScoreChange(student.id, 'TP2', e.target.value)}
                                                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                            sx={{ width: '80px' }}
                                                        />
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
                                Nhập điểm cuối kỳ (CK). Chỉ có thể nhập điểm cho sinh viên có điểm TP1 ≥ 4.0.
                                {examNumber === "2" ? " Đang nhập điểm thi lại (lần 2)." : " Đang nhập điểm thi lần 1."}
                                {examNumber === "2" && " Chỉ sinh viên có điểm CK1 < 4.0 mới đủ điều kiện thi lại."}
                            </Alert>
                            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="final exam grades table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Mã SV</TableCell>
                                            <TableCell>Họ và tên</TableCell>
                                            <TableCell>Lớp</TableCell>
                                            <TableCell>Điểm TP1</TableCell>
                                            <TableCell>Điểm TP2</TableCell>
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

                                            return (
                                                <TableRow key={student.id} sx={failed ? { backgroundColor: 'rgba(255, 0, 0, 0.05)' } : {}}>
                                                    <TableCell>{student.id}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>{student.class}</TableCell>
                                                    <TableCell align="center" sx={{ color: student.scores.TP1 < 4.0 ? 'red' : 'inherit' }}>
                                                        {student.scores.TP1 === null ? '-' : student.scores.TP1}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {student.scores.TP2 === null ? '-' : student.scores.TP2}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title={!canTakeFinalExam(student) ? 'Sinh viên phải có điểm TP1 ≥ 4.0' : ''}>
                                                            <span>
                                                                <TextField
                                                                    type="number"
                                                                    value={student.scores.CK1 === null ? '' : student.scores.CK1}
                                                                    onChange={(e) => handleFinalScoreChange(student.id, 'CK1', e.target.value)}
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
                                                                    value={student.scores.CK2 === null ? '' : student.scores.CK2}
                                                                    onChange={(e) => handleFinalScoreChange(student.id, 'CK2', e.target.value)}
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
                                                                    onChange={(e) => handleRetakeRegistration(student.id, e.target.checked)}
                                                                    disabled={!canRetake || student.scores.CK2 !== null}
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
                                    <TableCell>Họ và tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Khóa</TableCell>
                                    <TableCell align="center">Điểm TP1</TableCell>
                                    <TableCell align="center">Điểm TP2</TableCell>
                                    <TableCell align="center">Điểm CK1</TableCell>
                                    <TableCell align="center">Điểm CK2</TableCell>
                                    <TableCell align="center">Điểm TB</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsForFinalExam.map((student) => {
                                    const averageScore = calculateAverageScore(student);

                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.class}</TableCell>
                                            <TableCell>{student.batch}</TableCell>
                                            <TableCell align="center">{student.scores.TP1}</TableCell>
                                            <TableCell align="center">{student.scores.TP2}</TableCell>
                                            <TableCell align="center">
                                                {student.scores.CK1 !== null ? student.scores.CK1 : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {student.scores.CK2 !== null ? student.scores.CK2 : '-'}
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
                                    <TableCell>Họ và tên</TableCell>
                                    <TableCell>Lớp</TableCell>
                                    <TableCell>Khóa</TableCell>
                                    <TableCell align="center">Điểm TP1</TableCell>
                                    <TableCell align="center">Điểm TP2</TableCell>
                                    <TableCell>Ghi chú</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsAwaitingMidtermScores.map((student) => {
                                    let note = '';
                                    if (student.scores.TP1 === null || student.scores.TP1 === undefined) {
                                        note = 'Chưa có điểm TP1';
                                    } else if (student.scores.TP1 < 4.0) {
                                        note = 'Điểm TP1 < 4.0';
                                    }

                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.class}</TableCell>
                                            <TableCell>{student.batch}</TableCell>
                                            <TableCell align="center" sx={{ color: 'red' }}>
                                                {student.scores.TP1 === null ? '-' : student.scores.TP1}
                                            </TableCell>
                                            <TableCell align="center">
                                                {student.scores.TP2 === null ? '-' : student.scores.TP2}
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

            {activeTab === 3 && (
                <>
                    <Alert severity="error" sx={{ my: 2 }}>
                        {`${studentsEligibleForRetake.length} sinh viên cần thi lại (Điểm CK1 < 4.0)`}
                    </Alert>
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
                                    <TableCell align="center">Điểm CK1</TableCell>
                                    <TableCell align="center">Điểm CK2</TableCell>
                                    <TableCell align="center">Điểm TB</TableCell>
                                    <TableCell align="center">Đăng ký thi lại</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsEligibleForRetake.map((student) => {
                                    const averageScore = calculateAverageScore(student);
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.class}</TableCell>
                                            <TableCell>{student.batch}</TableCell>
                                            <TableCell align="center">{student.scores.TP1}</TableCell>
                                            <TableCell align="center">{student.scores.TP2}</TableCell>
                                            <TableCell align="center" sx={{ color: 'red' }}>
                                                {student.scores.CK1}
                                            </TableCell>
                                            <TableCell align="center">
                                                {student.scores.CK2 !== null ? student.scores.CK2 : '-'}
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
                                                            onChange={(e) => handleRetakeRegistration(student.id, e.target.checked)}
                                                            disabled={student.scores.CK2 !== null}
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