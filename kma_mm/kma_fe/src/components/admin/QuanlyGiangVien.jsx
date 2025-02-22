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

const QuanLyGiangViens = () => {
    const [giangViens, setGiangViens] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedGiangVien, setSelectedGiangVien] = useState(null);

    // Tạo hàm fetchgiangViens với useCallback để tránh tạo lại hàm mới mỗi lần render
    const fetchgiangViens = useCallback(async () => {
        try {
            const response = await getPhongBan();
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
                <Typography variant="h4">giangVien Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
                    Add giangVien
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã Phòng Ban</TableCell>
                            <TableCell>Tên Phòng Ban</TableCell>
                            <TableCell>Ghi chú</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {giangViens.map((giangVien) => (
                            <TableRow key={giangVien.ma_phong_ban}>
                                <TableCell>{giangVien.ma_phong_ban}</TableCell>
                                <TableCell>{giangVien.ten_phong_ban}</TableCell>
                                <TableCell>{giangVien.ghi_chu}</TableCell>
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