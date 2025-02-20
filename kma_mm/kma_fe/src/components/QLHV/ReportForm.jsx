import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Container, Typography, Box } from "@mui/material";
import * as XLSX from "xlsx";

const ReportForm = () => {
    const [openForm, setOpenForm] = useState(false);
    const [openExport, setOpenExport] = useState(false);

    // Danh sách biểu mẫu
    const forms = [
        { id: 1, name: "Biểu mẫu đăng ký môn học" },
        { id: 2, name: "Biểu mẫu xin nghỉ phép" },
        { id: 3, name: "Biểu mẫu hoàn thành khóa học" },
    ];

    // Dữ liệu giả lập để xuất file Excel
    const studentData = [
        { ID: "SV001", Name: "Nguyễn Văn A", Class: "CTK44", GPA: 3.5 },
        { ID: "SV002", Name: "Trần Thị B", Class: "CTK44", GPA: 3.8 },
        { ID: "SV003", Name: "Lê Văn C", Class: "CTK45", GPA: 3.2 },
    ];

    // Xuất dữ liệu ra file Excel
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(studentData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Student Data");
        XLSX.writeFile(wb, "ThongKeLop.xlsx");
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>📊 Biểu mẫu & Xuất dữ liệu</Typography>

            <Box display="flex" gap={2} marginBottom={2}>
                <Button variant="contained" color="primary" onClick={() => setOpenForm(true)}>
                    Cung cấp biểu mẫu
                </Button>
                <Button variant="contained" color="secondary" onClick={handleExport}>
                    Xuất dữ liệu
                </Button>
            </Box>

            {/* Dialog hiển thị biểu mẫu */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)}>
                <DialogTitle>📄 Danh sách biểu mẫu</DialogTitle>
                <DialogContent>
                    <List>
                        {forms.map((form) => (
                            <ListItem key={form.id}>
                                <ListItemText primary={form.name} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)} color="primary">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ReportForm;
