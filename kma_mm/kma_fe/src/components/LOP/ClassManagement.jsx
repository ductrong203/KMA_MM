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

function QuanLyLop() {
    const [danhSachLop, setDanhSachLop] = useState([]);
    const [danhSachKhoa, setDanhSachKhoa] = useState([]);
    const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
    const [moForm, setMoForm] = useState(false);
    const [indexChinhSua, setIndexChinhSua] = useState(null);
    const [thongTinLop, setThongTinLop] = useState({
        khoa_dao_tao_id: ""
    });
    const [khoaMoRong, setKhoaMoRong] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    const [xemSinhVien, setXemSinhVien] = useState(false);
    const [lopDangChon, setLopDangChon] = useState(null);
    const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
    const [dangTaiSinhVien, setDangTaiSinhVien] = useState(false);
    // Pagination state for each course
    const [pagination, setPagination] = useState({});
    // Filter by training system
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

    // Fetch class list
    const layDanhSachLop = async () => {
        try {
            const ketQua = await getDanhSachLop();
            setDanhSachLop(ketQua || []);
            // Merge existing pagination with new course IDs
            setPagination(prev => {
                const updatedPagination = { ...prev };
                ketQua.forEach(lop => {
                    const khoaId = lop.khoa_dao_tao_id;
                    if (!updatedPagination[khoaId]) {
                        updatedPagination[khoaId] = { page: 0, rowsPerPage: 5 };
                    }
                });
                // Debug: Log updated pagination
                console.log("Updated pagination after fetching classes:", updatedPagination);
                return updatedPagination;
            });
        } catch (error) {
            toast.error("Không thể lấy danh sách lớp. Vui lòng thử lại!");
            setDanhSachLop([]);
        }
    };

    // Fetch course list
    const layDanhSachKhoa = async () => {
        try {
            const ketQua = await fetchDanhSachKhoa();
            setDanhSachKhoa(ketQua || []);
            // Initialize pagination for all courses
            const initialPagination = {};
            ketQua.forEach(khoa => {
                initialPagination[khoa.id] = { page: 0, rowsPerPage: 5 };
            });
            setPagination(initialPagination);
            // Debug: Log pagination initialization
            console.log("Initial pagination:", initialPagination);
        } catch (error) {
            toast.error("Không thể lấy danh sách khóa. Vui lòng thử lại!");
            setDanhSachKhoa([]);
        }
    };

    // Fetch training system list
    const layDanhSachHeDaoTao = async () => {
        try {
            const ketQua = await fetchDanhSachHeDaoTao();
            setDanhSachHeDaoTao(ketQua || []);
        } catch (error) {
            toast.error("Không thể lấy danh sách hệ đào tạo. Vui lòng thử lại!");
            setDanhSachHeDaoTao([]);
        }
    };

    // Fetch student list for a class
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

    // Open form (Add or Edit)
    const moFormLop = (index = null) => {
        if (index !== null) {
            setIndexChinhSua(index);
            const lopDuocChon = danhSachLop[index];
            setThongTinLop({
                khoa_dao_tao_id: lopDuocChon.khoa_dao_tao_id
            });
        } else {
            setIndexChinhSua(null);
            setThongTinLop({ khoa_dao_tao_id: "" });
        }
        setMoForm(true);
    };

    // Close form
    const dongForm = () => setMoForm(false);

    // Handle course selection
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

    // Generate class code
    const taoMaLop = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        if (!khoa) return "LOP-MOID";

        const lopThuocKhoa = danhSachLop.filter(l => l.khoa_dao_tao_id === khoaId);
        let soThuTu = lopThuocKhoa.length + 1;
        let maLop = `${khoa.ma_khoa}-${soThuTu.toString().padStart(2, '0')}`;

        // Ensure unique class code
        while (lopThuocKhoa.some(l => l.ma_lop === maLop)) {
            soThuTu++;
            maLop = `${khoa.ma_khoa}-${soThuTu.toString().padStart(2, '0')}`;
        }

        return maLop;
    };

    // Save or update class
    const luuLop = async () => {
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
            await layDanhSachLop(); // Refresh list and pagination
            dongForm();
        } catch (error) {
            toast.error("Lỗi khi lưu lớp. Vui lòng thử lại!");
        }
    };

    // Get course name
    const layTenKhoa = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        return khoa ? `${khoa.ma_khoa} - ${khoa.ten_khoa}` : "Khóa chưa xác định";
    };

    // Get course code
    const layMaKhoa = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        return khoa ? khoa.ma_khoa : "N/A";
    };

    // Group classes by course
    const nhomLopTheoKhoa = () => {
        const danhSachNhom = {};

        // Filter courses by training system
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

    // Handle accordion toggle
    const xuLyDoiTrangThaiAccordion = (khoaId) => (event, isExpanded) => {
        setKhoaMoRong(isExpanded ? khoaId : null);
    };

    // View student list
    const xemDanhSachSinhVien = (lop) => {
        setLopDangChon(lop);
        layDanhSachSinhVien(lop.id);
        setXemSinhVien(true);
    };

    // Close student list dialog
    const dongDanhSachSinhVien = () => {
        setXemSinhVien(false);
    };

    // Handle pagination change
    const handleChangePage = (khoaId, newPage) => {
        setPagination(prev => ({
            ...prev,
            [khoaId]: { ...prev[khoaId], page: newPage }
        }));
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (khoaId, event) => {
        setPagination(prev => ({
            ...prev,
            [khoaId]: { ...prev[khoaId], page: 0, rowsPerPage: parseInt(event.target.value, 10) }
        }));
    };

    // Handle training system filter change
    const handleFilterHeDaoTaoChange = (event) => {
        setFilterHeDaoTao(event.target.value);
        setKhoaMoRong(null); // Collapse all accordions
        // Reset pagination for all courses
        const newPagination = {};
        danhSachKhoa.forEach(khoa => {
            newPagination[khoa.id] = { page: 0, rowsPerPage: 5 };
        });
        setPagination(newPagination);
    };

    const danhSachLopTheoKhoa = nhomLopTheoKhoa();

    return (
        <div>
            <Card sx={{ mb: 4, p: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            Quản lý danh sách lớp theo khóa
                        </Typography>
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

                    {/* Training System Filter */}
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
                                                                    <TableCell>Thuộc khóa</TableCell>
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
                                                    Không có lớp nào trong khóa này
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
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={danhSachKhoa}
                                    getOptionLabel={(option) => `${option.ma_khoa} - ${option.ten_khoa}`}
                                    value={danhSachKhoa.find(k => k.id === thongTinLop.khoa_dao_tao_id) || null}
                                    onChange={xuLyChonKhoa}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Chọn khóa"
                                            variant="outlined"
                                            required
                                            helperText="Vui lòng chọn khóa cho lớp này"
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
                                        Mã lớp được tạo tự động theo định dạng: [MÃ KHÓA]-[SỐ THỨ TỰ]
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
                        disabled={!thongTinLop.khoa_dao_tao_id}
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
                                    <strong>Thuộc khóa:</strong> {lopDangChon ? layTenKhoa(lopDangChon.khoa_dao_tao_id) : ''}
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
                                                    <TableCell>{sinhVien.name}</TableCell>
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