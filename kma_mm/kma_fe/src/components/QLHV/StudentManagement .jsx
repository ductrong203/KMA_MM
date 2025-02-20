import React, { useState } from "react";
import {
    Container,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Checkbox,
    Typography,
    Tabs,
    Tab
} from "@mui/material";

const StudentManagement = () => {
    const [students, setStudents] = useState([
        { id: 1, name: "Nguyễn Văn A", credits: 15, completedRules: true, isSoldier: true, militaryInfo: "Chi tiết quân nhân A" },
        { id: 2, name: "Trần Thị B", credits: 8, completedRules: false, isSoldier: false }
    ]);

    const [open, setOpen] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [studentData, setStudentData] = useState({
        name: "",
        credits: "",
        completedRules: false,
        isSoldier: false,
        militaryInfo: ""
    });

    const handleOpen = (index = null) => {
        setEditIndex(index);
        if (index !== null) {
            setStudentData(students[index]);
        } else {
            setStudentData({ name: "", credits: "", completedRules: false, isSoldier: false, militaryInfo: "" });
        }
        setOpen(true);
    };

    const handleOpenDetail = (index) => {
        setStudentData(students[index]);
        setOpenDetail(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
    };

    const handleSave = () => {
        if (editIndex !== null) {
            const updatedStudents = [...students];
            updatedStudents[editIndex] = studentData;
            setStudents(updatedStudents);
        } else {
            setStudents([...students, { ...studentData, id: students.length + 1 }]);
        }
        setOpen(false);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h5" gutterBottom>
                Quản lý học viên
            </Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                Thêm học viên
            </Button>
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Họ và tên</TableCell>
                            <TableCell>Số tín chỉ</TableCell>
                            <TableCell>Hoàn thành nội quy</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.credits}</TableCell>
                                <TableCell>
                                    <Checkbox checked={student.completedRules} disabled />
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" onClick={() => handleOpenDetail(index)}>Xem chi tiết</Button>
                                    <Button variant="outlined" onClick={() => handleOpen(index)} style={{ marginLeft: 10 }}>Chỉnh sửa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Chi Tiết */}
            <Dialog open={openDetail} onClose={handleCloseDetail}>
                <DialogTitle>Chi tiết học viên</DialogTitle>
                <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)}>
                    <Tab label="Chi tiết học viên" />
                    {studentData.isSoldier && <Tab label="Chi tiết quân nhân" />}
                </Tabs>
                <DialogContent>
                    {tabIndex === 0 && (
                        <Typography variant="body1">Tên: {studentData.name}</Typography>
                    )}
                    {tabIndex === 1 && studentData.isSoldier && (
                        <Typography variant="body1">{studentData.militaryInfo}</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetail} color="secondary">Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Chỉnh Sửa */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editIndex !== null ? "Chỉnh sửa sinh viên" : "Thêm sinh viên"}</DialogTitle>
                <DialogContent>
                    <TextField label="Họ và tên" value={studentData.name} onChange={(e) => setStudentData({ ...studentData, name: e.target.value })} fullWidth margin="normal" />
                    <TextField label="Số tín chỉ" type="number" value={studentData.credits} onChange={(e) => setStudentData({ ...studentData, credits: e.target.value })} fullWidth margin="normal" />
                    <Checkbox checked={studentData.completedRules} onChange={(e) => setStudentData({ ...studentData, completedRules: e.target.checked })} /> Hoàn thành nội quy
                    <Checkbox checked={studentData.isSoldier} onChange={(e) => setStudentData({ ...studentData, isSoldier: e.target.checked })} /> Là quân nhân
                    {studentData.isSoldier && (
                        <TextField label="Thông tin quân nhân" value={studentData.militaryInfo} onChange={(e) => setStudentData({ ...studentData, militaryInfo: e.target.value })} fullWidth margin="normal" />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Hủy</Button>
                    <Button onClick={handleSave} color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentManagement;
