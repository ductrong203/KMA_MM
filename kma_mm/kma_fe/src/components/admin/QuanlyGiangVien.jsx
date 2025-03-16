import {
    Add as AddIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Container,
    Dialog,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { getPhongBan } from '../../Api_controller/Service/phongBanService';
import FormGiangVien from './TeacherForm';
import { getGiangVien } from '../../Api_controller/Service/giangVienService';

const QuanLyGiangViens = () => {
    const [giangViens, setGiangViens] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedGiangVien, setSelectedGiangVien] = useState(null);
    const [danhSachPhongBan, setDanhSachPhongBan] = useState([]);

    // Tạo hàm fetchgiangViens với useCallback để tránh tạo lại hàm mới mỗi lần render
    const fetchgiangViens = useCallback(async () => {
        try {
            const response = await getGiangVien();
            setGiangViens(response);
        } catch (error) {
            console.error('Error fetching giangViens:', error);
        }
    }, []);

    useEffect(() => {
        fetchgiangViens();
    }, [fetchgiangViens]);

    const handleEdit = (giangVien) => {
        setSelectedGiangVien(giangVien);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setSelectedGiangVien(null);
    };

    const handleFormSubmit = async () => {
        try {
            // Sau khi form submit thành công, gọi lại API để lấy data mới nhất
            await fetchgiangViens();

            // Đóng form
            setOpenForm(false);
            setSelectedGiangVien(null);
        } catch (error) {
            console.error('Error updating giangViens:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">QUẢN LÝ GIẢNG VIÊN/NHÂN VIÊN</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
                    Thêm giảng viên/nhân viên
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã Giảng Viên/Nhân viên</TableCell>
                            <TableCell>Tên Giảng Viên/Nhân viên</TableCell>
                            <TableCell>Giảng Viên/Nhân viên</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {giangViens.map((giangVien) => (
                            <TableRow key={giangVien.ma_giang_vien}>
                                <TableCell>{giangVien.ma_giang_vien}</TableCell>
                                <TableCell>{giangVien.ho_ten}</TableCell>
                                <TableCell> {giangVien.la_giang_vien_moi
                                    ? "Thỉnh giảng"
                                    : giangVien.thuoc_khoa
                                        ? "Cơ hữu"
                                        : "Nhân viên"}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleEdit(giangVien)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog aria-hidden="true" open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <FormGiangVien giangVien={selectedGiangVien} onClose={handleCloseForm} onSubmit={handleFormSubmit} />
            </Dialog>
        </Container>
    );
};

export default QuanLyGiangViens;