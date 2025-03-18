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
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import React, { useState } from 'react';

function TaoBangDiem({ sampleStudents }) {
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [examPeriod, setExamPeriod] = useState('');
    const [batch, setBatch] = useState('');
    const [major, setMajor] = useState('');
    const [course, setCourse] = useState('');
    const [classGroup, setClassGroup] = useState('');
    const [examNumber, setExamNumber] = useState('');
    const [educationType, setEducationType] = useState('');
    const [students, setStudents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [filterEducationType, setFilterEducationType] = useState('');
    const [filterBatch, setFilterBatch] = useState('');
    const [filterClass, setFilterClass] = useState('');

    // Danh sách sinh viên mẫu trong hệ thống
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
            scores: { TP1: null, TP2: null, CK1: null, CK2: null }
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
            scores: { TP1: null, TP2: null, CK1: null, CK2: null }
        },
        {
            id: 'SV003',
            name: 'Trần Thị Hương',
            class: 'CT6',
            batch: 'K15',
            major: 'HTTT',
            educationType: 'CQ',
            status: 'Thi lần 1',
            examNumber: '1',
            scores: { TP1: null, TP2: null, CK1: null, CK2: null }
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
            scores: { TP1: null, TP2: null, CK1: null, CK2: null }
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
            scores: { TP1: null, TP2: null, CK1: null, CK2: null }
        },
        {
            id: 'SV006',
            name: 'Vũ Đức Anh',
            class: 'CT7',
            batch: 'K16',
            major: 'CNTT',
            educationType: 'VLVH',
            status: 'Thi lần 1',
            examNumber: '1',
            scores: { TP1: null, TP2: null, CK1: null, CK2: null }
        }
    ];

    const handleCreateGradeSheet = () => {
        // Lọc sinh viên theo tiêu chí đã chọn
        let filteredStudents = [...allStudents];

        // Áp dụng bộ lọc nếu đã chọn
        if (batch) {
            filteredStudents = filteredStudents.filter(student => student.batch === batch);
        }

        if (major) {
            filteredStudents = filteredStudents.filter(student => student.major === major);
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

        // Tạo bảng điểm với các điểm ban đầu là null
        const newGradeSheet = filteredStudents.map(student => ({
            ...student,
            scores: { TP1: null, TP2: null, CK1: null, CK2: null }
        }));

        // Cập nhật danh sách sinh viên
        setStudents(newGradeSheet);

        // Cung cấp phản hồi cho người dùng
        if (newGradeSheet.length > 0) {
            alert(`Đã tạo bảng điểm với ${newGradeSheet.length} sinh viên.`);
        } else {
            alert('Không tìm thấy sinh viên nào phù hợp với các tiêu chí đã chọn.');
        }

        // Log thông tin bộ lọc để gỡ lỗi
        console.log('Tiêu chí tạo bảng điểm:', {
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

    // Kiểm tra xem điểm giữa kỳ có đạt yêu cầu để nhập điểm cuối kỳ không
    const canEnterFinalExamScore = (student) => {
        const midtermScoreTP1 = student.scores.TP1;
        const midtermScoreTP2 = student.scores.TP2;

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

    const handleScoreChange = (studentId, scoreType, value) => {
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
                        scores: {
                            ...student.scores,
                            [scoreType]: numericValue
                        }
                    };
                }
                return student;
            })
        );
    };

    const handleRetakeRegistration = (studentId, checked) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === studentId
                    ? { ...student, retakeRegistered: checked }
                    : student
            )
        );
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        // Reset form
        setStudentId('');
        setFilterEducationType('');
        setFilterBatch('');
        setFilterClass('');
    };

    const handleAddRetakeStudent = () => {
        // Tìm sinh viên theo mã sinh viên
        const studentToAdd = allStudents.find(s => s.id === studentId);

        if (studentToAdd) {
            // Kiểm tra xem sinh viên này đã có trong danh sách chưa
            const existingStudent = students.find(s => s.id === studentId);

            if (!existingStudent) {
                // Thêm sinh viên với trạng thái học lại
                const newStudent = {
                    ...studentToAdd,
                    status: 'Học lại',
                    examNumber: '1',
                    scores: { TP1: null, TP2: null, CK1: null, CK2: null }
                };

                setStudents(prevStudents => [...prevStudents, newStudent]);
                alert(`Đã thêm sinh viên ${newStudent.name} vào danh sách học lại.`);
            } else {
                alert(`Sinh viên ${studentToAdd.name} đã có trong danh sách.`);
            }
        } else {
            alert('Không tìm thấy sinh viên với mã đã nhập.');
        }

        handleCloseDialog();
    };

    // Lọc sinh viên trong dialog
    const getFilteredStudents = () => {
        let filtered = [...allStudents];

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
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<NoteAddIcon />}
                        onClick={handleCreateGradeSheet}
                        sx={{ height: '56px' }}
                    >
                        Tạo Bảng Điểm
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
                >
                    Thêm Sinh Viên Học Lại
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="grade table">
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
                            <TableCell>Đăng ký học lại</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.length > 0 ? (
                            students.map((student) => {
                                const canEnterFinal = canEnterFinalExamScore(student);

                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.class}</TableCell>
                                        <TableCell>{student.status}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                value={student.scores.TP1 === null ? '' : student.scores.TP1}
                                                onChange={(e) => handleScoreChange(student.id, 'TP1', e.target.value)}
                                                sx={{ width: '70px' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                value={student.scores.TP2 === null ? '' : student.scores.TP2}
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
                                                        value={student.scores.CK1 === null ? '' : student.scores.CK1}
                                                        onChange={(e) => handleScoreChange(student.id, 'CK1', e.target.value)}
                                                        sx={{ width: '70px' }}
                                                        disabled={!canEnterFinal}
                                                        error={!canEnterFinal && student.scores.CK1 !== null}
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
                                                        value={student.scores.CK2 === null ? '' : student.scores.CK2}
                                                        onChange={(e) => handleScoreChange(student.id, 'CK2', e.target.value)}
                                                        sx={{ width: '70px' }}
                                                        disabled={!canEnterFinal}
                                                        error={!canEnterFinal && student.scores.CK2 !== null}
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
                                    <MenuItem value="">Tất cả</MenuItem>
                                    <MenuItem value="CQ">Chính quy</MenuItem>
                                    <MenuItem value="LT">Liên thông</MenuItem>
                                    <MenuItem value="VLVH">Vừa làm vừa học</MenuItem>
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
                                    <MenuItem value="">Tất cả</MenuItem>
                                    <MenuItem value="K14">K14</MenuItem>
                                    <MenuItem value="K15">K15</MenuItem>
                                    <MenuItem value="K16">K16</MenuItem>
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
                                    <MenuItem value="">Tất cả</MenuItem>
                                    <MenuItem value="CT6">CT6</MenuItem>
                                    <MenuItem value="CT7">CT7</MenuItem>
                                    <MenuItem value="CT8">CT8</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table size="small" aria-label="danh sách sinh viên">
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
                                {getFilteredStudents().map((student) => (
                                    <TableRow key={student.id} selected={student.id === studentId}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.class}</TableCell>
                                        <TableCell>{student.batch}</TableCell>
                                        <TableCell>
                                            {student.educationType === 'CQ' ? 'Chính quy' :
                                                student.educationType === 'LT' ? 'Liên thông' :
                                                    student.educationType === 'VLVH' ? 'Vừa làm vừa học' : ''}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleSelectStudent(student.id)}
                                            >
                                                Chọn
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleAddRetakeStudent}
                        color="primary"
                        variant="contained"
                        disabled={!studentId}
                    >
                        Thêm Sinh Viên Học Lại
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default TaoBangDiem;