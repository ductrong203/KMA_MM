import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    InputAdornment,
} from '@mui/material';
import {
    Assessment,
    Class,
    CloudUpload,
    Download,
    Person,
    School,
    Search,
    Visibility,
} from '@mui/icons-material';

// Mock data
const mockClasses = [
    { id: "CNTT1", name: "Công nghệ thông tin 1" },
    { id: "CNTT2", name: "Công nghệ thông tin 2" },
    { id: "KTPM1", name: "Kỹ thuật phần mềm 1" }
];

const mockSubjects = [
    { id: "MATH101", name: "Toán cao cấp" },
    { id: "PROG101", name: "Lập trình cơ bản" },
    { id: "ENG101", name: "Tiếng Anh" },
];

const mockStudentGrades = {
    "SV001": {
        info: { name: "Nguyễn Văn A", class: "CNTT1" },
        grades: [
            { subject: "MATH101", midterm: 7.5, final: 4.0, average: 5.25 },
            { subject: "PROG101", midterm: 8.0, final: 7.5, average: 7.7 },
            { subject: "ENG101", midterm: 6.5, final: 7.0, average: 6.8 },
        ]
    }
};

const mockGrades = [
    {
        studentId: "SV001",
        name: "Nguyễn Văn A",
        midterm: 7.5,
        final: 4.0,
        average: 5.25,
        status: "failed"
    },
    {
        studentId: "SV002",
        name: "Trần Thị B",
        midterm: 8.5,
        final: 8.0,
        average: 8.2,
        status: "passed"
    },
    {
        studentId: "SV003",
        name: "Lê Văn C",
        midterm: 0,
        final: 0,
        average: 0,
        status: "banned"
    }
];
const mockStudents = [
    {
        id: "SV001",
        name: "Nguyễn Văn A",
        class: "CNTT1",
        grades: {
            semester: "HK1 2023-2024",
            subjects: [
                { code: "MATH101", name: "Toán cao cấp", credits: 3, midterm: 8.5, final: 7.5, average: 8.0 },
                { code: "PRG101", name: "Lập trình cơ bản", credits: 4, midterm: 7.0, final: 8.0, average: 7.5 },
                { code: "ENG101", name: "Tiếng Anh", credits: 3, midterm: 8.0, final: 8.5, average: 8.25 }
            ]
        }
    },
    {
        id: "SV002",
        name: "Trần Thị B",
        class: "CNTT2",
        grades: {
            semester: "HK1 2023-2024",
            subjects: [
                { code: "MATH101", name: "Toán cao cấp", credits: 3, midterm: 9.0, final: 8.5, average: 8.75 },
                { code: "PRG101", name: "Lập trình cơ bản", credits: 4, midterm: 8.5, final: 8.0, average: 8.25 },
                { code: "ENG101", name: "Tiếng Anh", credits: 3, midterm: 7.5, final: 8.0, average: 7.75 }
            ]
        }
    }
];

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function ExamDashboard() {
    const [currentTab, setCurrentTab] = useState(0);
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setOpenDialog(true);
    };

    const handleExportGrades = (student) => {
        console.log(`Exporting grades for student: ${student.id}`);
        // Add export logic here
    };

    const filteredStudents = mockStudents.filter(student =>
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleViewStudent = (studentId) => {
        setCurrentStudent(mockStudentGrades[studentId]);
        setOpenStudentDialog(true);
    };

    const handleExportClass = () => {
        // Logic to export class grades
        console.log(`Exporting grades for class ${selectedClass} and subjects:`, selectedSubjects);
    };

    const handleExportStudent = (studentId) => {
        // Logic to export student grades
        console.log(`Exporting grades for student:`, studentId);
    };
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleImport = () => {
        setShowSnackbar(true);
        setOpenImportDialog(false);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'failed':
                return { backgroundColor: '#ffebee', color: '#d32f2f' };
            case 'banned':
                return { backgroundColor: '#f5f5f5', color: '#757575' };
            default:
                return {};
        }
    };

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                <Paper sx={{ mb: 2, p: 2 }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab
                            icon={<Assessment />}
                            label="Quản lý điểm"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<Assessment />}
                            label="Tra cứu điểm"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<Assessment />}
                            label="Thống kê"
                            iconPosition="start"
                        />
                    </Tabs>

                    <TabPanel value={currentTab} index={0}>
                        <Box sx={{ bgcolor: '', minHeight: '100vh', py: 4 }}>
                            <Container maxWidth="xl">
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Lớp</InputLabel>
                                                <Select
                                                    value={selectedClass}
                                                    label="Lớp"
                                                    onChange={(e) => setSelectedClass(e.target.value)}
                                                >
                                                    {mockClasses.map(cls => (
                                                        <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Môn học</InputLabel>
                                                <Select
                                                    multiple
                                                    value={selectedSubjects}
                                                    label="Môn học"
                                                    onChange={(e) => setSelectedSubjects(e.target.value)}
                                                    renderValue={(selected) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {selected.map((value) => (
                                                                <Chip
                                                                    key={value}
                                                                    label={mockSubjects.find(s => s.id === value)?.name}
                                                                    size="small"
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                >
                                                    {mockSubjects.map(subject => (
                                                        <MenuItem key={subject.id} value={subject.id}>
                                                            {subject.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<CloudUpload />}
                                                    onClick={() => setOpenImportDialog(true)}
                                                    disabled={!selectedClass || !selectedSubjects.length}
                                                >
                                                    Import điểm
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Download />}
                                                    onClick={handleExportClass}
                                                    disabled={!selectedClass || !selectedSubjects.length}
                                                >
                                                    Xuất điểm lớp
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>MSSV</TableCell>
                                                    <TableCell>Họ và tên</TableCell>
                                                    {selectedSubjects.map(subjectId => (
                                                        <React.Fragment key={subjectId}>
                                                            <TableCell align="center">{mockSubjects.find(s => s.id === subjectId)?.name} (GK)</TableCell>
                                                            <TableCell align="center">{mockSubjects.find(s => s.id === subjectId)?.name} (CK)</TableCell>
                                                        </React.Fragment>
                                                    ))}
                                                    <TableCell align="center">Thao tác</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {Object.entries(mockStudentGrades).map(([studentId, data]) => (
                                                    <TableRow key={studentId}>
                                                        <TableCell>{studentId}</TableCell>
                                                        <TableCell>{data.info.name}</TableCell>
                                                        {selectedSubjects.map(subjectId => {
                                                            const grade = data.grades.find(g => g.subject === subjectId);
                                                            return (
                                                                <React.Fragment key={subjectId}>
                                                                    <TableCell align="center">{grade?.midterm || '-'}</TableCell>
                                                                    <TableCell align="center">{grade?.final || '-'}</TableCell>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                        <TableCell align="center">
                                                            <Button
                                                                size="small"
                                                                startIcon={<Visibility />}
                                                                onClick={() => handleViewStudent(studentId)}
                                                            >
                                                                Xem chi tiết
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                {/* Import Dialog */}
                                <Dialog
                                    open={openImportDialog}
                                    onClose={() => setOpenImportDialog(false)}
                                    maxWidth="sm"
                                    fullWidth
                                >
                                    <DialogTitle>Import điểm - {mockClasses.find(c => c.id === selectedClass)?.name}</DialogTitle>
                                    <DialogContent>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Môn học: {selectedSubjects.map(s => mockSubjects.find(sub => sub.id === s)?.name).join(', ')}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<CloudUpload />}
                                                sx={{ mt: 2 }}
                                            >
                                                Chọn file Excel
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept=".xlsx,.xls"
                                                    onChange={(e) => console.log(e.target.files[0])}
                                                />
                                            </Button>
                                        </Box>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setOpenImportDialog(false)}>
                                            Hủy
                                        </Button>
                                        <Button onClick={handleImport} variant="contained">
                                            Import
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                {/* Student Detail Dialog */}
                                <Dialog
                                    open={openStudentDialog}
                                    onClose={() => setOpenStudentDialog(false)}
                                    maxWidth="md"
                                    fullWidth
                                >
                                    <DialogTitle>
                                        Thông tin điểm - {currentStudent?.info.name}
                                    </DialogTitle>
                                    <DialogContent>
                                        <List>
                                            {currentStudent?.grades.map((grade, index) => (
                                                <React.Fragment key={grade.subject}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={mockSubjects.find(s => s.id === grade.subject)?.name}
                                                            secondary={
                                                                <Typography component="span" variant="body2">
                                                                    Giữa kỳ: {grade.midterm} | Cuối kỳ: {grade.final} | Trung bình: {grade.average}
                                                                </Typography>
                                                            }
                                                        />
                                                    </ListItem>
                                                    {index < currentStudent.grades.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            onClick={() => handleExportStudent(currentStudent?.studentId)}
                                            startIcon={<Download />}
                                        >
                                            Xuất điểm
                                        </Button>
                                        <Button onClick={() => setOpenStudentDialog(false)}>
                                            Đóng
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                <Snackbar
                                    open={showSnackbar}
                                    autoHideDuration={3000}
                                    onClose={() => setShowSnackbar(false)}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <Alert severity="success" onClose={() => setShowSnackbar(false)}>
                                        Import điểm thành công!
                                    </Alert>
                                </Snackbar>
                            </Container>
                        </Box>

                    </TabPanel>

                    <TabPanel value={currentTab} index={1}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Tìm kiếm theo MSSV, Họ tên, hoặc Lớp..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {filteredStudents.map((student) => (
                                    <Card key={student.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Person sx={{ mr: 1 }} />
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                {student.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                MSSV: {student.id}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Class sx={{ mr: 1 }} />
                                                        <Typography>Lớp: {student.class}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => handleViewDetails(student)}
                                                        >
                                                            Xem điểm
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            startIcon={<Download />}
                                                            onClick={() => handleExportGrades(student)}
                                                        >
                                                            Xuất điểm
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredStudents.length === 0 && (
                                    <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                                        Không tìm thấy sinh viên phù hợp
                                    </Typography>
                                )}

                                <Dialog
                                    open={openDialog}
                                    onClose={() => setOpenDialog(false)}
                                    maxWidth="md"
                                    fullWidth
                                >
                                    <DialogTitle>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <School />
                                            <Typography variant="h6">
                                                Bảng điểm - {selectedStudent?.name}
                                            </Typography>
                                        </Box>
                                    </DialogTitle>
                                    <DialogContent>
                                        {selectedStudent && (
                                            <>
                                                <Box sx={{ mb: 3, mt: 2 }}>
                                                    <Typography variant="body1" gutterBottom>
                                                        MSSV: {selectedStudent.id}
                                                    </Typography>
                                                    <Typography variant="body1" gutterBottom>
                                                        Lớp: {selectedStudent.class}
                                                    </Typography>
                                                    <Typography variant="body1" gutterBottom>
                                                        Học kỳ: {selectedStudent.grades.semester}
                                                    </Typography>
                                                </Box>
                                                <TableContainer>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Mã môn</TableCell>
                                                                <TableCell>Tên môn học</TableCell>
                                                                <TableCell align="center">Số tín chỉ</TableCell>
                                                                <TableCell align="center">Điểm GK</TableCell>
                                                                <TableCell align="center">Điểm CK</TableCell>
                                                                <TableCell align="center">Trung bình</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {selectedStudent.grades.subjects.map((subject) => (
                                                                <TableRow key={subject.code}>
                                                                    <TableCell>{subject.code}</TableCell>
                                                                    <TableCell>{subject.name}</TableCell>
                                                                    <TableCell align="center">{subject.credits}</TableCell>
                                                                    <TableCell align="center">{subject.midterm}</TableCell>
                                                                    <TableCell align="center">{subject.final}</TableCell>
                                                                    <TableCell align="center">{subject.average}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </>
                                        )}
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            onClick={() => handleExportGrades(selectedStudent)}
                                            startIcon={<Download />}
                                        >
                                            Xuất điểm
                                        </Button>
                                        <Button onClick={() => setOpenDialog(false)}>
                                            Đóng
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                    </TabPanel>
                    <TabPanel value={currentTab} index={2}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Tổng số sinh viên
                                        </Typography>
                                        <Typography variant="h3">
                                            150
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Tỷ lệ đạt
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: 'success.main' }}>
                                            85%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Sinh viên cấm thi
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: 'error.main' }}>
                                            5
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Paper>

                {/* Import Dialog */}
                <Dialog
                    open={openImportDialog}
                    onClose={() => setOpenImportDialog(false)}
                >
                    <DialogTitle>Import điểm</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                            >
                                Chọn file Excel
                                <input
                                    type="file"
                                    hidden
                                    accept=".xlsx,.xls"
                                    onChange={(e) => console.log(e.target.files[0])}
                                />
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenImportDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleImport} variant="contained">
                            Import
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success Snackbar */}
                <Snackbar
                    open={showSnackbar}
                    autoHideDuration={3000}
                    onClose={() => setShowSnackbar(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert severity="success" onClose={() => setShowSnackbar(false)}>
                        Import điểm thành công!
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default ExamDashboard;