import React, { useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper,
    Typography, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Box, TextField
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";

const LibraryDashBoard = () => {
    const [students, setStudents] = useState([
        {
            id: 1,
            name: "Nguyễn Văn A",
            isBookReturned: false,
            hasNoFines: false,
            isEligibleForDiploma: false,
            bookDetails: "Nợ sách: Sách Lập trình Java, mượn ngày 01/01/2024, đã quá hạn 10 ngày.",
            fineDetails: "Phí phạt: 50,000 VNĐ."
        },
        {
            id: 2,
            name: "Trần Thị B",
            isBookReturned: true,
            hasNoFines: true,
            isEligibleForDiploma: true,
            bookDetails: "Không nợ sách.",
            fineDetails: "Không nợ phí."
        },
        {
            id: 3,
            name: "Lê Quang C",
            isBookReturned: true,
            hasNoFines: false,
            isEligibleForDiploma: false,
            bookDetails: "Không nợ sách.",
            fineDetails: "Phí phạt: 30,000 VNĐ."
        },
        {
            id: 4,
            name: "Nguyễn Văn A",
            isBookReturned: false,
            hasNoFines: false,
            isEligibleForDiploma: false,
            bookDetails: "Nợ sách: Sách Lập trình Java, mượn ngày 01/01/2024, đã quá hạn 10 ngày.",
            fineDetails: "Phí phạt: 50,000 VNĐ."
        },
        {
            id: 5,
            name: "Trần Thị B",
            isBookReturned: true,
            hasNoFines: true,
            isEligibleForDiploma: true,
            bookDetails: "Không nợ sách.",
            fineDetails: "Không nợ phí."
        },
        {
            id: 6,
            name: "Lê Quang C",
            isBookReturned: true,
            hasNoFines: false,
            isEligibleForDiploma: false,
            bookDetails: "Không nợ sách.",
            fineDetails: "Phí phạt: 30,000 VNĐ."
        },
    ]);

    const [openEdit, setOpenEdit] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleRowClick = (id) => {
        const student = students.find((s) => s.id === id);
        setSelectedStudent(student);
        setOpenDetails(true);
    };

    const handleEditClick = (id) => {
        const student = students.find((s) => s.id === id);
        setSelectedStudent(student);
        setOpenEdit(true);
    };

    const handleClose = () => {
        setOpenEdit(false);
        setOpenDetails(false);
        setSelectedStudent(null);
    };

    const handleSave = () => {
        if (selectedStudent) {
            const isEligibleForDiploma = selectedStudent.isBookReturned && selectedStudent.hasNoFines;
            setStudents((prev) =>
                prev.map((student) =>
                    student.id === selectedStudent.id
                        ? { ...selectedStudent, isEligibleForDiploma }
                        : student
                )
            );
        }
        handleClose();
    };

    const handleChange = (field, value) => {
        setSelectedStudent((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Paper elevation={3} sx={{ padding: 3, maxWidth: "100%", margin: "auto" }}>
            <Typography variant="h5" gutterBottom>
                Danh Sách Sinh Viên Xét Tốt Nghiệp
            </Typography>

            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Họ Tên</TableCell>
                        <TableCell align="center">Trạng Thái Đã Trả Sách</TableCell>
                        <TableCell align="center">Trạng Thái Không Nợ Phí</TableCell>
                        <TableCell align="center">Trạng Thái Điều Kiện Tốt Nghiệp</TableCell>
                        <TableCell align="center">Hành Động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.id} hover onClick={() => handleRowClick(student.id)}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell align="center">
                                {student.isBookReturned ? (
                                    <Typography variant="body2" color="success.main">Đã trả sách</Typography>
                                ) : (
                                    <Typography variant="body2" color="error.main">Chưa trả sách</Typography>
                                )}
                            </TableCell>
                            <TableCell align="center">
                                {student.hasNoFines ? (
                                    <Typography variant="body2" color="success.main">Không nợ phí</Typography>
                                ) : (
                                    <Typography variant="body2" color="error.main">Có nợ phí</Typography>
                                )}
                            </TableCell>
                            <TableCell align="center">
                                {student.isEligibleForDiploma ? (
                                    <Typography variant="body2" color="success.main">Đủ điều kiện</Typography>
                                ) : (
                                    <Typography variant="body2" color="error.main">Chưa đủ điều kiện</Typography>
                                )}
                            </TableCell>
                            <TableCell
                                onClick={(e) => e.stopPropagation()}
                                align="center">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(student.id);
                                    }}
                                >
                                    <EditIcon />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Chi tiết thông tin */}
            <Dialog open={openDetails} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Chi Tiết Tình Trạng Sinh Viên</DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" gutterBottom>
                                <strong>Họ Tên:</strong> {selectedStudent.name}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Tình Trạng Nợ Sách:</strong> {selectedStudent.bookDetails}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Tình Trạng Nợ Phí:</strong> {selectedStudent.fineDetails}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal chỉnh sửa */}
            <Dialog open={openEdit} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Chỉnh Sửa Thông Tin Sinh Viên</DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
                            <TextField
                                label="Họ Tên"
                                value={selectedStudent.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Trạng Thái Đã Trả Sách"
                                select
                                value={selectedStudent.isBookReturned ? "true" : "false"}
                                onChange={(e) => handleChange("isBookReturned", e.target.value === "true")}
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                            >
                                <option value="true">Đã trả sách</option>
                                <option value="false">Chưa trả sách</option>
                            </TextField>

                            <TextField
                                label="Trạng Thái Không Nợ Phí"
                                select
                                value={selectedStudent.hasNoFines ? "true" : "false"}
                                onChange={(e) => handleChange("hasNoFines", e.target.value === "true")}
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                            >
                                <option value="true">Không nợ phí</option>
                                <option value="false">Có nợ phí</option>
                            </TextField>
                            <TextField
                                label="Trạng Thái sách"

                                value={selectedStudent.bookDetails}
                                onChange={(e) => handleChange("bookDetails", e.target.value)}
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                            >
                            </TextField>
                            <TextField
                                label="Trạng Thái Nợ Phí"

                                value={selectedStudent.fineDetails}
                                onChange={(e) => handleChange("fineDetails", e.target.value)}
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                            >
                            </TextField>

                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default LibraryDashBoard;
