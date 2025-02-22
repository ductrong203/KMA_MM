import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Typography, Box } from "@mui/material";
import * as XLSX from "xlsx";

const StatisticsReport = () => {
    const [openStatistics, setOpenStatistics] = useState(false);

    // Dữ liệu giả lập thống kê
    const statisticsData = [
        { category: "Số lượng sinh viên", value: 120 },
        { category: "Tổng số môn học", value: 8 },
        { category: "Điểm trung bình toàn trường", value: 7.5 },
        { category: "Số lượng sinh viên đạt giỏi", value: 40 },
        { category: "Số lượng sinh viên cần cải thiện", value: 15 },
    ];

    // Xuất báo cáo thống kê
    const exportStatisticsReport = () => {
        const ws = XLSX.utils.json_to_sheet(statisticsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Statistics Report");
        XLSX.writeFile(wb, "BaoCao_ThongKe.xlsx");
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>📊 Thống kê & Báo cáo</Typography>

            <Box display="flex" gap={2} marginBottom={2}>
                <Button variant="contained" color="primary" onClick={() => setOpenStatistics(true)}>
                    Xem thống kê tổng hợp
                </Button>
                <Button variant="contained" color="secondary" onClick={exportStatisticsReport}>
                    In báo cáo thống kê
                </Button>
            </Box>

            {/* Dialog hiển thị thống kê */}
            <Dialog open={openStatistics} onClose={() => setOpenStatistics(false)}>
                <DialogTitle>📄 Thống kê tổng hợp</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Danh mục</TableCell>
                                    <TableCell>Giá trị</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {statisticsData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatistics(false)} color="primary">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StatisticsReport;
