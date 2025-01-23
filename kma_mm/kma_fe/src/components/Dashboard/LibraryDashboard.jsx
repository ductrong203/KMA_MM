import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const LibraryDashBoard = () => {
    // Mảng sinh viên (có thể thay bằng dữ liệu từ API)
    const [students, setStudents] = useState([
        { id: 1, name: "Nguyễn Văn A", isBookReturned: false, hasNoFines: false, isEligibleForDiploma: false },
        { id: 2, name: "Trần Thị B", isBookReturned: true, hasNoFines: true, isEligibleForDiploma: true },
        { id: 3, name: "Lê Quang C", isBookReturned: true, hasNoFines: false, isEligibleForDiploma: false },
    ]);

    const handleEditClick = (id) => {
        // Mở modal hoặc form để chỉnh sửa thông tin sinh viên (có thể mở rộng thêm)
        alert(`Chỉnh sửa sinh viên với ID: ${id}`);
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
                        <TableRow key={student.id}>
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
                            <TableCell align="center">
                                <Button
                                    variant="outlined"  // Sử dụng variant "outlined" để không có nền
                                    color="primary"
                                    size="small"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        padding: "6px 6px",
                                        border: "none",
                                        color: "#4caf50",  // Đổi màu chữ và icon
                                        "&:hover": {
                                            borderColor: "#45a049",  // Thay đổi màu viền khi hover
                                            color: "#45a049",  // Thay đổi màu chữ và icon khi hover
                                        },
                                    }}
                                    onClick={() => handleEditClick(student.id)}
                                >
                                    <EditIcon sx={{ fontSize: 18 }} />
                                </Button>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Button
                variant="contained"
                color="primary"
                sx={{ marginTop: 3 }}
                onClick={() => alert("Cập nhật thông tin sinh viên thành công!")}
            >
                Cập nhật trạng thái
            </Button>
        </Paper>
    );
};

export default LibraryDashBoard;
