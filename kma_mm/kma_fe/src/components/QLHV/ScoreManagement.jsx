import React, { useState } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Container, Typography, TextField, Box
} from "@mui/material";
import * as XLSX from "xlsx";

const ScoreManagement = () => {
    // Dữ liệu giả lập danh sách sinh viên
    const [students, setStudents] = useState([
        { id: 1, name: "Nguyễn Văn A", studentId: "SV001", scores: { "Toán": 8, "Lý": 7, "Hóa": 9 } },
        { id: 2, name: "Trần Thị B", studentId: "SV002", scores: { "Toán": 6, "Lý": 8, "Hóa": 7 } },
        { id: 3, name: "Lê Văn C", studentId: "SV003", scores: { "Toán": 7, "Lý": 6, "Hóa": 8 } },
    ]);

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    // Mở modal chỉnh sửa sinh viên
    const handleEditStudent = (student) => {
        setEditingStudent({ ...student });
        setOpenEditDialog(true);
    };

    // Lưu thông tin sau khi chỉnh sửa
    const handleSaveEdit = () => {
        setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
        setOpenEditDialog(false);
    };

    // Xuất điểm của một sinh viên
    const exportStudentScore = (student) => {
        const ws = XLSX.utils.json_to_sheet([
            { "Môn học": "Toán", "Điểm số": student.scores["Toán"] },
            { "Môn học": "Lý", "Điểm số": student.scores["Lý"] },
            { "Môn học": "Hóa", "Điểm số": student.scores["Hóa"] },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Điểm_${student.name}`);
        XLSX.writeFile(wb, `Diem_${student.name}.xlsx`);
    };

    // Xuất điểm của lớp theo môn học
    const exportClassScoreBySubject = () => {
        const wsData = students.map(student => ({
            "Mã SV": student.studentId,
            "Tên SV": student.name,
            "Toán": student.scores["Toán"],
            "Lý": student.scores["Lý"],
            "Hóa": student.scores["Hóa"],
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Điểm lớp");
        XLSX.writeFile(wb, "Diem_Lop.xlsx");
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>📊 Quản lý điểm số</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã SV</TableCell>
                            <TableCell>Tên SV</TableCell>
                            <TableCell>Toán</TableCell>
                            <TableCell>Lý</TableCell>
                            <TableCell>Hóa</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.studentId}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.scores["Toán"]}</TableCell>
                                <TableCell>{student.scores["Lý"]}</TableCell>
                                <TableCell>{student.scores["Hóa"]}</TableCell>
                                <TableCell>
                                    <Button size="small" color="primary" onClick={() => handleEditStudent(student)}>
                                        ✏️ Sửa
                                    </Button>
                                    <Button size="small" color="secondary" onClick={() => exportStudentScore(student)}>
                                        📥 Xuất điểm
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box mt={2}>
                <Button variant="contained" color="success" onClick={exportClassScoreBySubject}>
                    📥 Xuất điểm lớp theo môn học
                </Button>
            </Box>

            {/* Dialog chỉnh sửa thông tin sinh viên */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>✏️ Chỉnh sửa thông tin</DialogTitle>
                <DialogContent>
                    {editingStudent && (
                        <>
                            <TextField
                                fullWidth margin="dense" label="Tên SV" value={editingStudent.name}
                                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                            />
                            <TextField
                                fullWidth margin="dense" label="Toán" type="number" value={editingStudent.scores["Toán"]}
                                onChange={(e) => setEditingStudent({ ...editingStudent, scores: { ...editingStudent.scores, "Toán": e.target.value } })}
                            />
                            <TextField
                                fullWidth margin="dense" label="Lý" type="number" value={editingStudent.scores["Lý"]}
                                onChange={(e) => setEditingStudent({ ...editingStudent, scores: { ...editingStudent.scores, "Lý": e.target.value } })}
                            />
                            <TextField
                                fullWidth margin="dense" label="Hóa" type="number" value={editingStudent.scores["Hóa"]}
                                onChange={(e) => setEditingStudent({ ...editingStudent, scores: { ...editingStudent.scores, "Hóa": e.target.value } })}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)} color="secondary">Hủy</Button>
                    <Button onClick={handleSaveEdit} color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ScoreManagement;
