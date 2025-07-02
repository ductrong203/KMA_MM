import { Box, Button, Chip, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import React, { useState, useEffect } from 'react'
import PrintIcon from '@mui/icons-material/Print';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { getDanhSachLopTheoKhoaDaoTao } from '../../Api_controller/Service/lopService';
import { getDanhSachSinhVienTheoLop } from '../../Api_controller/Service/sinhVienService';

function QuanLyBangCap() {
    const [heDaoTao, setHeDaoTao] = useState([]);
    const [khoaDaoTao, setKhoaDaoTao] = useState([]);
    const [lop, setLop] = useState([]);
    const [sinhVien, setSinhVien] = useState([]);
    
    const [selectedHeDaoTao, setSelectedHeDaoTao] = useState('');
    const [selectedKhoaDaoTao, setSelectedKhoaDaoTao] = useState('');
    const [selectedLop, setSelectedLop] = useState('');
    const [loading, setLoading] = useState(false);

    // Lấy danh sách hệ đào tạo
    useEffect(() => {
        const fetchHeDaoTao = async () => {
            try {
                setLoading(true);
                const response = await fetchDanhSachHeDaoTao();
                setHeDaoTao(response || []);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách hệ đào tạo:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHeDaoTao();
    }, []);

    // Lấy danh sách khóa đào tạo theo hệ đào tạo
    useEffect(() => {
        if (selectedHeDaoTao) {
            const fetchKhoaDaoTao = async () => {
                try {
                    setLoading(true);
                    const response = await getDanhSachKhoaTheoDanhMucDaoTao(selectedHeDaoTao);
                    setKhoaDaoTao(response || []);
                    setSelectedKhoaDaoTao(''); // Reset khóa khi thay đổi hệ
                    setLop([]); // Reset lớp
                    setSinhVien([]); // Reset sinh viên
                } catch (error) {
                    console.error('Lỗi khi lấy danh sách khóa đào tạo:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchKhoaDaoTao();
        }
    }, [selectedHeDaoTao]);

    // Lấy danh sách lớp theo khóa đào tạo
    useEffect(() => {
        if (selectedKhoaDaoTao) {
            const fetchLop = async () => {
                try {
                    setLoading(true);
                    const response = await getDanhSachLopTheoKhoaDaoTao(selectedKhoaDaoTao);
                    setLop(response || []);
                    setSelectedLop(''); // Reset lớp khi thay đổi khóa
                    setSinhVien([]); // Reset sinh viên
                } catch (error) {
                    console.error('Lỗi khi lấy danh sách lớp:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchLop();
        }
    }, [selectedKhoaDaoTao]);

    // Lấy danh sách sinh viên theo lớp
    useEffect(() => {
        if (selectedLop) {
            const fetchSinhVien = async () => {
                try {
                    setLoading(true);
                    const response = await getDanhSachSinhVienTheoLop(selectedLop);
                    setSinhVien(response.data || []);
                } catch (error) {
                    console.error('Lỗi khi lấy danh sách sinh viên:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSinhVien();
        }
    }, [selectedLop]);

    return (
        <Box>
            <Grid container spacing={3} sx={{ padding: 4 }}>
                {/* Bộ lọc */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel>Hệ đào tạo</InputLabel>
                                <Select
                                    value={selectedHeDaoTao}
                                    onChange={(e) => setSelectedHeDaoTao(e.target.value)}
                                    label="Hệ đào tạo"
                                    disabled={loading}
                                >
                                    <MenuItem value="">Chọn hệ đào tạo</MenuItem>
                                    {heDaoTao.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.ten_he_dao_tao}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel>Khóa đào tạo</InputLabel>
                                <Select
                                    value={selectedKhoaDaoTao}
                                    onChange={(e) => setSelectedKhoaDaoTao(e.target.value)}
                                    label="Khóa đào tạo"
                                    disabled={!selectedHeDaoTao || loading}
                                >
                                    <MenuItem value="">Chọn khóa đào tạo</MenuItem>
                                    {khoaDaoTao.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.ten_khoa}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel>Lớp</InputLabel>
                                <Select
                                    value={selectedLop}
                                    onChange={(e) => setSelectedLop(e.target.value)}
                                    label="Lớp"
                                    disabled={!selectedKhoaDaoTao || loading}
                                >
                                    <MenuItem value="">Chọn lớp</MenuItem>
                                    {lop.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.ma_lop}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Bảng danh sách sinh viên */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã SV</TableCell>
                                    <TableCell>Họ đệm</TableCell>
                                    <TableCell>Tên</TableCell>
                                    <TableCell>Ngày xét TN</TableCell>
                                    <TableCell>Trạng thái bằng</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sinhVien.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.ma_sinh_vien}</TableCell>
                                        <TableCell>{student.ho_dem}</TableCell>
                                        <TableCell>{student.ten}</TableCell>
                                        <TableCell>20/01/2024</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.hasDegree ? "Đã cấp bằng" : "Chưa cấp bằng"}
                                                color={student.hasDegree ? "success" : "default"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<PrintIcon />}
                                                onClick={() => { }}
                                                disabled={!student.hasDegree}
                                            >
                                                In xác nhận
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    )
}

export default QuanLyBangCap