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
    Typography
} from "@mui/material";

const StudentManagement = () => {
    const [students, setStudents] = useState([
        { id: 1, name: "Nguyễn Văn A", credits: 15, completedRules: true },
        { id: 2, name: "Trần Thị B", credits: 8, completedRules: false }
    ]);

    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [studentData, setStudentData] = useState({
        name: "",
        credits: "",
        completedRules: false
    });

    // Mở form thêm/chỉnh sửa
    const handleOpen = (index = null) => {
        setEditIndex(index);
        if (index !== null) {
            setStudentData(students[index]);
        } else {
            setStudentData({ name: "", credits: "", completedRules: false });
        }
        setOpen(true);
    };

    // Đóng form
    const handleClose = () => {
        setOpen(false);
    };

    // Lưu dữ liệu
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

            {/* Nút Thêm Sinh Viên */}
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                Thêm sinh viên
            </Button>

            {/* Bảng danh sách sinh viên */}
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
                                    <Button variant="outlined" onClick={() => handleOpen(index)}>
                                        Chỉnh sửa
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form Thêm/Chỉnh sửa */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editIndex !== null ? "Chỉnh sửa sinh viên" : "Thêm sinh viên"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Họ và tên"
                        name="name"
                        value={studentData.name}
                        onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Số tín chỉ"
                        name="credits"
                        type="number"
                        value={studentData.credits}
                        onChange={(e) => setStudentData({ ...studentData, credits: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <div>
                        <Checkbox
                            checked={studentData.completedRules}
                            onChange={(e) => setStudentData({ ...studentData, completedRules: e.target.checked })}
                        />
                        <Typography variant="body1" display="inline">
                            Đã hoàn thành nội quy, quy chế
                        </Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentManagement;
