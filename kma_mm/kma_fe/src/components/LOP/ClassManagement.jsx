import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, Autocomplete, TextField, Typography, Accordion, AccordionSummary,
    AccordionDetails, Box, Card, CardContent, Grid, CircularProgress, Chip,
    TablePagination, Select, MenuItem, InputLabel
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { createLop, getDanhSachLop, updateLop } from "../../Api_controller/Service/lopService";
import { fetchDanhSachHeDaoTao } from "../../Api_controller/Service/trainingService";
import { fetchDanhSachKhoa } from "../../Api_controller/Service/khoaService";
import { toast } from 'react-toastify';
import { getDanhSachSinhVienTheoLop } from "../../Api_controller/Service/sinhVienService";
import PageHeader from "../../layout/PageHeader";

function QuanLyLop() {
    const [danhSachLop, setDanhSachLop] = useState([]);
    const [danhSachKhoa, setDanhSachKhoa] = useState([]);
    const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
    const [moForm, setMoForm] = useState(false);
    const [indexChinhSua, setIndexChinhSua] = useState(null);
    const [thongTinLop, setThongTinLop] = useState({
        khoa_dao_tao_id: ""
    });
    const [heDaoTaoDuocChon, setHeDaoTaoDuocChon] = useState(""); // Thêm state cho hệ đào tạo
    const [khoaMoRong, setKhoaMoRong] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    const [xemSinhVien, setXemSinhVien] = useState(false);
    const [lopDangChon, setLopDangChon] = useState(null);
    const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
    const [dangTaiSinhVien, setDangTaiSinhVien] = useState(false);
    const [pagination, setPagination] = useState({});
    const [filterHeDaoTao, setFilterHeDaoTao] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setDangTai(true);
            try {
                await Promise.all([
                    layDanhSachLop(),
                    layDanhSachKhoa(),
                    layDanhSachHeDaoTao()
                ]);
            } catch (error) {
                toast.error("Không thể tải dữ liệu. Vui lòng thử lại!");
            } finally {
                setDangTai(false);
            }
        };
        fetchData();
    }, []);

    const layDanhSachLop = async () => {
        try {
            const ketQua = await getDanhSachLop();
            setDanhSachLop(ketQua || []);
            setPagination(prev => {
                const updatedPagination = { ...prev };
                ketQua.forEach(lop => {
                    const khoaId = lop.khoa_dao_tao_id;
                    if (!updatedPagination[khoaId]) {
                        updatedPagination[khoaId] = { page: 0, rowsPerPage: 5 };
                    }
                });
                return updatedPagination;
            });
        } catch (error) {
            toast.error("Không thể lấy danh sách lớp. Vui lòng thử lại!");
            setDanhSachLop([]);
        }
    };

    const layDanhSachKhoa = async () => {
        try {
            const ketQua = await fetchDanhSachKhoa();
            setDanhSachKhoa(ketQua || []);
            const initialPagination = {};
            ketQua.forEach(khoa => {
                initialPagination[khoa.id] = { page: 0, rowsPerPage: 5 };
            });
            setPagination(initialPagination);
        } catch (error) {
            toast.error("Không thể lấy danh sách khóa. Vui lòng thử lại!");
            setDanhSachKhoa([]);
        }
    };

    const layDanhSachHeDaoTao = async () => {
        try {
            const ketQua = await fetchDanhSachHeDaoTao();
            setDanhSachHeDaoTao(ketQua || []);
        } catch (error) {
            toast.error("Không thể lấy danh sách hệ đào tạo. Vui lòng thử lại!");
            setDanhSachHeDaoTao([]);
        }
    };

    const layDanhSachSinhVien = async (lopId) => {
        setDangTaiSinhVien(true);
        try {
            const ketQua = await getDanhSachSinhVienTheoLop(lopId);
            setDanhSachSinhVien(ketQua.data || []);
        } catch (error) {
            toast.error("Không thể lấy danh sách sinh viên. Vui lòng thử lại!");
            setDanhSachSinhVien([]);
        } finally {
            setDangTaiSinhVien(false);
        }
    };

    const moFormLop = (index = null) => {
        if (index !== null) {
            setIndexChinhSua(index);
            const lopDuocChon = danhSachLop[index];
            const khoaDuocChon = danhSachKhoa.find(k => k.id === lopDuocChon.khoa_dao_tao_id);
            setThongTinLop({
                khoa_dao_tao_id: lopDuocChon.khoa_dao_tao_id
            });
            setHeDaoTaoDuocChon(khoaDuocChon?.he_dao_tao_id || ""); // Điền sẵn hệ đào tạo
        } else {
            setIndexChinhSua(null);
            setThongTinLop({ khoa_dao_tao_id: "" });
            setHeDaoTaoDuocChon("");
        }
        setMoForm(true);
    };

    const dongForm = () => setMoForm(false);

    const xuLyChonKhoa = (event, khoaDuocChon) => {
        if (khoaDuocChon) {
            setThongTinLop({
                ...thongTinLop,
                khoa_dao_tao_id: khoaDuocChon.id
            });
        } else {
            setThongTinLop({ ...thongTinLop, khoa_dao_tao_id: "" });
        }
    };

    const xuLyChonHeDaoTao = (event) => {
        const heDaoTaoId = event.target.value;
        setHeDaoTaoDuocChon(heDaoTaoId);
        setThongTinLop({ ...thongTinLop, khoa_dao_tao_id: "" }); // Reset khóa khi đổi hệ đào tạo
    };

    const taoMaLop = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        if (!khoa) return "LOP-MOID";

        const lopThuocKhoa = danhSachLop.filter(l => l.khoa_dao_tao_id === khoaId);
        let soThuTu = lopThuocKhoa.length + 1;
        let maLop = `${khoa.ma_khoa}-${soThuTu.toString().padStart(2, '0')}`;

        while (lopThuocKhoa.some(l => l.ma_lop === maLop)) {
            soThuTu++;
            maLop = `${khoa.ma_khoa}-${soThuTu.toString().padStart(2, '0')}`;
        }

        return maLop;
    };

    const luuLop = async () => {
        if (!heDaoTaoDuocChon) {
            toast.error("Vui lòng chọn hệ đào tạo!");
            return;
        }
        if (!thongTinLop.khoa_dao_tao_id) {
            toast.error("Vui lòng chọn khóa đào tạo!");
            return;
        }
        try {
            const duLieuLuu = {
                ma_lop: indexChinhSua === null ? taoMaLop(thongTinLop.khoa_dao_tao_id) : danhSachLop[indexChinhSua].ma_lop,
                khoa_dao_tao_id: thongTinLop.khoa_dao_tao_id
            };
            if (indexChinhSua === null) {
                await createLop(duLieuLuu);
                toast.success("Thêm lớp mới thành công!");
            } else {
                await updateLop(danhSachLop[indexChinhSua].id, duLieuLuu);
                toast.success("Cập nhật lớp thành công!");
            }
            await layDanhSachLop();
            dongForm();
        } catch (error) {
            toast.error("Lỗi khi lưu lớp. Vui lòng thử lại!");
        }
    };

    const layTenKhoa = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        return khoa ? `${khoa.ma_khoa} - ${khoa.ten_khoa}` : "Khóa chưa xác định";
    };

    const layMaKhoa = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        return khoa ? khoa.ma_khoa : "N/A";
    };

    const nhomLopTheoKhoa = () => {
        const danhSachNhom = {};
        const filteredKhoa = danhSachKhoa.filter(khoa =>
            filterHeDaoTao ? khoa.he_dao_tao_id === filterHeDaoTao : true
        );

        filteredKhoa.forEach(khoa => {
            danhSachNhom[khoa.id] = {
                khoa: khoa,
                danhSachLop: []
            };
        });

        danhSachLop.forEach(lop => {
            if (danhSachNhom[lop.khoa_dao_tao_id]) {
                danhSachNhom[lop.khoa_dao_tao_id].danhSachLop.push(lop);
            } else if (!filterHeDaoTao) {
                if (!danhSachNhom['chuaXacDinh']) {
                    danhSachNhom['chuaXacDinh'] = {
                        khoa: { id: 'chuaXacDinh', ma_khoa: 'N/A', ten_khoa: 'Khóa chưa xác định' },
                        danhSachLop: []
                    };
                }
                danhSachNhom['chuaXacDinh'].danhSachLop.push(lop);
            }
        });

        return Object.values(danhSachNhom).filter(nhom => nhom.danhSachLop.length > 0);
    };

    const xuLyDoiTrangThaiAccordion = (khoaId) => (event, isExpanded) => {
        setKhoaMoRong(isExpanded ? khoaId : null);
    };

    const xemDanhSachSinhVien = (lop) => {
        setLopDangChon(lop);
        layDanhSachSinhVien(lop.id);
        setXemSinhVien(true);
    };

    const dongDanhSachSinhVien = () => {
        setXemSinhVien(false);
    };

    const handleChangePage = (khoaId, newPage) => {
        setPagination(prev => ({
            ...prev,
            [khoaId]: { ...prev[khoaId], page: newPage }
        }));
    };

    const handleChangeRowsPerPage = (khoaId, event) => {
        setPagination(prev => ({
            ...prev,
            [khoaId]: { ...prev[khoaId], page: 0, rowsPerPage: parseInt(event.target.value, 10) }
        }));
    };

    const handleFilterHeDaoTaoChange = (event) => {
        setFilterHeDaoTao(event.target.value);
        setKhoaMoRong(null);
        const newPagination = {};
        danhSachKhoa.forEach(khoa => {
            newPagination[khoa.id] = { page: 0, rowsPerPage: 5 };
        });
        setPagination(newPagination);
    };

    // Lọc danh sách khóa theo hệ đào tạo trong form
    const danhSachKhoaLocTheoHe = heDaoTaoDuocChon
        ? danhSachKhoa.filter(khoa => khoa.he_dao_tao_id === heDaoTaoDuocChon)
        : danhSachKhoa;

    const danhSachLopTheoKhoa = nhomLopTheoKhoa();

    return (
        <div>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <PageHeader title="Quản lý danh sách lớp theo khóa" />
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<EditIcon />}
                            onClick={() => moFormLop()}
                        >
                            Thêm lớp mới
                        </Button>
                    </Box>

                    <Box mb={3}>
                        <FormControl variant="outlined" sx={{ minWidth: 300 }}>
                            <InputLabel id="filter-he-dao-tao-label">Lọc theo hệ đào tạo</InputLabel>
                            <Select
                                labelId="filter-he-dao-tao-label"
                                id="filter-he-dao-tao"
                                value={filterHeDaoTao}
                                onChange={handleFilterHeDaoTaoChange}
                                label="Lọc theo hệ đào tạo"
                            >
                                <MenuItem value="">
                                    <em>Tất cả</em>
                                </MenuItem>
                                {danhSachHeDaoTao.map((heDaoTao) => (
                                    <MenuItem key={heDaoTao.id} value={heDaoTao.id}>
                                        {heDaoTao.ten_he_dao_tao}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {dangTai ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <div>
                            {danhSachLopTheoKhoa.map((nhom) => {
                                const { page = 0, rowsPerPage = 5 } = pagination[nhom.khoa.id] || { page: 0, rowsPerPage: 5 };
                                const startIndex = page * rowsPerPage;
                                const endIndex = startIndex + rowsPerPage;
                                const paginatedLop = nhom.danhSachLop.slice(startIndex, endIndex);

                                return (
                                    <Accordion
                                        key={nhom.khoa.id}
                                        expanded={khoaMoRong === nhom.khoa.id}
                                        onChange={xuLyDoiTrangThaiAccordion(nhom.khoa.id)}
                                        sx={{ mb: 2 }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {nhom.khoa.ma_khoa} - {nhom.khoa.ten_khoa}
                                                </Typography>
                                                <Chip
                                                    label={`${nhom.danhSachLop.length} lớp`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ ml: 2 }}
                                                />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {paginatedLop.length > 0 ? (
                                                <>
                                                    <TableContainer component={Paper} elevation={0} variant="outlined">
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                                                                    <TableCell>Mã lớp</TableCell>
                                                                    <TableCell>Thuộc khóa đào tạo</TableCell>
                                                                    <TableCell align="right">Hành động</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {paginatedLop.map((lop) => (
                                                                    <TableRow key={lop.id} hover>
                                                                        <TableCell>{lop.ma_lop}</TableCell>
                                                                        <TableCell>{layMaKhoa(lop.khoa_dao_tao_id)}</TableCell>
                                                                        <TableCell align="right">
                                                                            <Button
                                                                                variant="outlined"
                                                                                color="info"
                                                                                startIcon={<PersonIcon />}
                                                                                onClick={() => xemDanhSachSinhVien(lop)}
                                                                                sx={{ mr: 1 }}
                                                                            >
                                                                                Danh sách sinh viên
                                                                            </Button>
                                                                            <Button
                                                                                variant="outlined"
                                                                                startIcon={<EditIcon />}
                                                                                onClick={() => moFormLop(danhSachLop.findIndex(l => l.id === lop.id))}
                                                                            >
                                                                                Chỉnh sửa
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                    {nhom.danhSachLop.length > rowsPerPage && (
                                                        <TablePagination
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                            component="div"
                                                            count={nhom.danhSachLop.length}
                                                            rowsPerPage={rowsPerPage}
                                                            page={page}
                                                            onPageChange={(e, newPage) => handleChangePage(nhom.khoa.id, newPage)}
                                                            onRowsPerPageChange={(e) => handleChangeRowsPerPage(nhom.khoa.id, e)}
                                                            labelRowsPerPage="Số dòng mỗi trang:"
                                                            labelDisplayedRows={({ from, to, count }) => `${from}–${to} của ${count}`}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <Typography variant="body2" sx={{ fontStyle: 'italic', p: 2 }}>
                                                    Không có lớp nào trong khóa đào tạo này
                                                </Typography>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                            {danhSachLopTheoKhoa.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body1">
                                        Không có dữ liệu lớp. Hãy thêm lớp mới!
                                    </Typography>
                                </Box>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Class Dialog */}
            <Dialog
                open={moForm}
                onClose={dongForm}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    {indexChinhSua === null ? "Thêm lớp mới" : "Chỉnh sửa thông tin lớp"}
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel id="he-dao-tao-label">Hệ đào tạo</InputLabel>
                                <Select
                                    labelId="he-dao-tao-label"
                                    id="he-dao-tao"
                                    value={heDaoTaoDuocChon}
                                    onChange={xuLyChonHeDaoTao}
                                    label="Hệ đào tạo"
                                    required
                                >
                                    <MenuItem value="">
                                        <em>Chọn hệ đào tạo</em>
                                    </MenuItem>
                                    {danhSachHeDaoTao.map((heDaoTao) => (
                                        <MenuItem key={heDaoTao.id} value={heDaoTao.id}>
                                            {heDaoTao.ten_he_dao_tao}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={danhSachKhoaLocTheoHe}
                                    getOptionLabel={(option) => `${option.ma_khoa} - ${option.ten_khoa}`}
                                    value={danhSachKhoa.find(k => k.id === thongTinLop.khoa_dao_tao_id) || null}
                                    onChange={xuLyChonKhoa}
                                    disabled={!heDaoTaoDuocChon} // Vô hiệu hóa nếu chưa chọn hệ đào tạo
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Chọn khóa đào tạo"
                                            variant="outlined"
                                            required
                                            helperText="Vui lòng chọn khóa đào tạo cho lớp này"
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        {thongTinLop.khoa_dao_tao_id && indexChinhSua === null && (
                            <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Mã lớp sẽ được tạo:</strong> {taoMaLop(thongTinLop.khoa_dao_tao_id)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontStyle: 'italic', mt: 1, display: 'block' }}>
                                        Mã lớp được tạo tự động theo định dạng: [MÃ KHÓA ĐÀO TẠO][SỐ THỨ TỰ]
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={dongForm}
                        variant="outlined"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={luuLop}
                        disabled={!heDaoTaoDuocChon || !thongTinLop.khoa_dao_tao_id}
                    >
                        {indexChinhSua === null ? "Tạo lớp" : "Lưu thay đổi"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Student List Dialog */}
            <Dialog
                open={xemSinhVien}
                onClose={dongDanhSachSinhVien}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1 }} />
                    Danh sách sinh viên - Lớp {lopDangChon?.ma_lop}
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 3, mt: 2 }}>
                    {dangTaiSinhVien ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', m: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Mã lớp:</strong> {lopDangChon?.ma_lop}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Thuộc khóa đào tạo:</strong> {lopDangChon ? layTenKhoa(lopDangChon.khoa_dao_tao_id) : ''}
                                </Typography>
                            </Box>

                            {danhSachSinhVien.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                                                <TableCell>Mã SV</TableCell>
                                                <TableCell>Họ đệm</TableCell>
                                                <TableCell>Tên</TableCell>
                                                <TableCell>Ngày sinh</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {danhSachSinhVien.map((sinhVien) => (
                                                <TableRow key={sinhVien.id_sinh_vien} hover>
                                                    <TableCell>{sinhVien.ma_sinh_vien}</TableCell>
                                                    <TableCell>{sinhVien.ho_dem}</TableCell>
                                                    <TableCell>{sinhVien.ten}</TableCell>
                                                    <TableCell>
                                                        {sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                                    <Typography variant="body1">
                                        Lớp này chưa có sinh viên nào
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={dongDanhSachSinhVien}
                        variant="contained"
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default QuanLyLop;