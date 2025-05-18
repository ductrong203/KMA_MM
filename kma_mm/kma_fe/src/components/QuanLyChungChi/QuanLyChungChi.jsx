import { useState, useEffect } from "react";
import {
    Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container,
    TextField, InputAdornment, Pagination as MuiPagination, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, createTheme, ThemeProvider
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import { fetchLopByKhoaDaoTao } from "../../Api_controller/Service/thoiKhoaBieuService";

// Mock Data for demonstration
const mockSinhVien = [
    {
        id: 1,
        ma_sinh_vien: "AT140101",
        ho_ten: "Lê Bá Bình",
        diem_tb: 5.94,
        xep_loai: "Trung bình",
        ghi_chu: "",
        so_quyet_dinh: "67K/QĐ-HVM",
        ngay_ky_qd: "28/07/2020",
        tinh_trang: "Bình thường",
        lop_id: 201,
        da_dat: true,
        loai_chung_chi: "GDQP"
    },
    {
        id: 2,
        ma_sinh_vien: "AT140103",
        ho_ten: "Nguyễn Chí Bình",
        diem_tb: 3.17,
        xep_loai: "Khá",
        ghi_chu: "",
        so_quyet_dinh: "67K/QĐ-HVM",
        ngay_ky_qd: "28/07/2020",
        tinh_trang: "TB Nghiệp",
        lop_id: 201,
        da_dat: true,
        loai_chung_chi: "GDQP"
    },
    {
        id: 3,
        ma_sinh_vien: "AT140104",
        ho_ten: "Nguyễn Chí Đình",
        diem_tb: 7.28,
        xep_loai: "Khá",
        ghi_chu: "",
        so_quyet_dinh: "67K/QĐ-HVM",
        ngay_ky_qd: "28/07/2020",
        tinh_trang: "Tốt Nghiệp",
        lop_id: 201,
        da_dat: true,
        loai_chung_chi: "GDQP"
    },
    {
        id: 4,
        ma_sinh_vien: "AT140106",
        ho_ten: "Lê Việt Cường",
        diem_tb: 5.86,
        xep_loai: "Trung bình",
        ghi_chu: "Môn không đạt: Giáo dục thể chất 2(0), Giáo dục thể chất 3(0), DTB Không đạt: 2.27",
        so_quyet_dinh: "",
        ngay_ky_qd: "",
        tinh_trang: "Tốt Nghiệp",
        lop_id: 202,
        da_dat: false,
        loai_chung_chi: "GDQP"
    },
    {
        id: 5,
        ma_sinh_vien: "AT140109",
        ho_ten: "Nguyễn Duy Dũng",
        diem_tb: 2.23,
        xep_loai: "",
        ghi_chu: "Môn không đạt: Giáo dục thể chất 2(0), Giáo dục thể chất 3(0), DTB Không đạt: 2.27",
        so_quyet_dinh: "",
        ngay_ky_qd: "",
        tinh_trang: "Bình thường",
        lop_id: 202,
        da_dat: false,
        loai_chung_chi: "GDQP"
    },
    {
        id: 6,
        ma_sinh_vien: "AT140108",
        ho_ten: "Nguyễn Tiến Dũng",
        diem_tb: 5.40,
        xep_loai: "Trung bình",
        ghi_chu: "",
        so_quyet_dinh: "",
        ngay_ky_qd: "",
        tinh_trang: "Bình thường",
        lop_id: 203,
        da_dat: false,
        loai_chung_chi: "GDQP"
    },
    {
        id: 7,
        ma_sinh_vien: "AT140110",
        ho_ten: "Nguyễn Trung Dũng",
        diem_tb: 4.57,
        xep_loai: "",
        ghi_chu: "Môn không đạt: Giáo dục thể chất 2(0), DTB không đạt: 4",
        so_quyet_dinh: "",
        ngay_ky_qd: "",
        tinh_trang: "Bình thường",
        lop_id: 203,
        da_dat: false,
        loai_chung_chi: "TIENGANH"
    },
    {
        id: 8,
        ma_sinh_vien: "AT140115",
        ho_ten: "Nguyễn Đức Duy",
        diem_tb: 6.53,
        xep_loai: "Khá",
        ghi_chu: "",
        so_quyet_dinh: "",
        ngay_ky_qd: "",
        tinh_trang: "Bình thường",
        lop_id: 204,
        da_dat: true,
        loai_chung_chi: "TIENGANH"
    }
];

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        background: { default: '#f5f5f5' }
    },
    typography: { fontFamily: 'Roboto, Arial, sans-serif' }
});

const QuanLyChungChi = () => {
    // Filter states
    const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
    const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
    const [lopIdFilter, setLopIdFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loaiChungChi, setLoaiChungChi] = useState("GDQP"); // Default to GDQP
    const [trangThai, setTrangThai] = useState("all"); // all, da_dat, chua_dat

    // Data for filters
    const [HeDaoTao, setHeDaoTao] = useState([]);
    const [khoaDaoTao, setKhoaDaoTao] = useState([]);
    const [originalLopList, setOriginalLopList] = useState([]);
    const [lopListView, setLopListView] = useState([]);

    // Student data
    const [sinhVienList, setSinhVienList] = useState([]);
    const [filteredSinhVien, setFilteredSinhVien] = useState([]);

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // Certificate types
    const loaiChungChiOptions = [
        { value: "GDQP", label: "Chứng chỉ GDQP" },
        { value: "TIENGANH", label: "Chứng chỉ Tiếng Anh" }
    ];

    // Initial data loading
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Mock fetch HeDaoTao
                const heDaoTao = [
                    { id: 401, ten_he_dao_tao: "Đại học chính quy" },
                    { id: 402, ten_he_dao_tao: "Đại học liên thông" },
                    { id: 403, ten_he_dao_tao: "Cao đẳng" }
                ];

                // Mock fetch Lop
                const lop = [
                    { id: 201, ma_lop: "AT14AT", khoa_dao_tao_id: 301 },
                    { id: 202, ma_lop: "AT13AT", khoa_dao_tao_id: 301 },
                    { id: 203, ma_lop: "AT12AT", khoa_dao_tao_id: 302 },
                    { id: 204, ma_lop: "AT11AT", khoa_dao_tao_id: 303 }
                ];

                setHeDaoTao(heDaoTao);
                setOriginalLopList(lop);
                setLopListView(lop);
                setSinhVienList(mockSinhVien);

                // Initial filtering
                filterSinhVien(mockSinhVien);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Handle Hệ đào tạo filter change
    useEffect(() => {
        if (heDaoTaoFilter) {
            // Mock fetch khoa dao tao by he dao tao
            const mockKhoaDaoTao = [
                { id: 301, ten_khoa: "Khóa AT14", he_dao_tao_id: 401, so_ky_hoc: 8, nam_hoc: "2020-2024" },
                { id: 302, ten_khoa: "Khóa AT13", he_dao_tao_id: 401, so_ky_hoc: 8, nam_hoc: "2019-2023" },
                { id: 303, ten_khoa: "Khóa AT12", he_dao_tao_id: 401, so_ky_hoc: 8, nam_hoc: "2018-2022" },
                { id: 304, ten_khoa: "Khóa AT11", he_dao_tao_id: 401, so_ky_hoc: 8, nam_hoc: "2017-2021" }
            ];

            const filteredKhoa = mockKhoaDaoTao.filter(k => k.he_dao_tao_id == heDaoTaoFilter);
            setKhoaDaoTao(filteredKhoa);
        } else {
            setKhoaDaoTao([]);
            setKhoaDaoTaoFilter("");
            setLopIdFilter("");
            setLopListView(originalLopList);
        }
    }, [heDaoTaoFilter, originalLopList]);

    // Handle Khóa đào tạo filter change
    useEffect(() => {
        if (khoaDaoTaoFilter) {
            // Filter lop by khoa dao tao
            const filteredLop = originalLopList.filter(lop => lop.khoa_dao_tao_id == khoaDaoTaoFilter);
            setLopListView(filteredLop);
        } else {
            setLopIdFilter("");
            setLopListView(originalLopList);
        }
    }, [khoaDaoTaoFilter, originalLopList]);

    // Filter sinh vien based on all criteria
    const filterSinhVien = (data = sinhVienList) => {
        let filtered = [...data];

        // Filter by certificate type
        filtered = filtered.filter(sv => sv.loai_chung_chi === loaiChungChi);

        // Filter by he dao tao -> khoa dao tao -> lop (when selected)
        if (lopIdFilter) {
            filtered = filtered.filter(sv => sv.lop_id == lopIdFilter);
        }

        // Filter by pass status
        if (trangThai === 'da_dat') {
            filtered = filtered.filter(sv => sv.da_dat);
        } else if (trangThai === 'chua_dat') {
            filtered = filtered.filter(sv => !sv.da_dat);
        }

        // Search by name or student ID
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(sv =>
                sv.ho_ten.toLowerCase().includes(search) ||
                sv.ma_sinh_vien.toLowerCase().includes(search)
            );
        }

        // Pagination
        setTotalPages(Math.ceil(filtered.length / pageSize));

        // Slice for current page
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setFilteredSinhVien(filtered.slice(startIndex, endIndex));

        // Reset page if no results on current page
        if (filtered.length > 0 && startIndex >= filtered.length) {
            setPage(1);
        }
    };

    // Apply filters when parameters change
    useEffect(() => {
        filterSinhVien();
    }, [loaiChungChi, trangThai, lopIdFilter, page, searchTerm]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return dateString;
    };

    // Handle delete
    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
            const updatedList = sinhVienList.filter(sv => sv.id !== id);
            setSinhVienList(updatedList);
            filterSinhVien(updatedList);
        }
    };

    // Apply filters
    const handleApplyFilter = () => {
        setPage(1);
        filterSinhVien();
    };

    // Clear filters
    const handleClearFilter = () => {
        setHeDaoTaoFilter("");
        setKhoaDaoTaoFilter("");
        setLopIdFilter("");
        setSearchTerm("");
        setPage(1);
        // trangThai and loaiChungChi are kept
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" gutterBottom textAlign="center">
                        Quản Lý Chứng Chỉ
                    </Typography>

                    {/* Filter Section */}
                    <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, backgroundColor: "#fff" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Loại chứng chỉ</InputLabel>
                                    <Select
                                        value={loaiChungChi}
                                        onChange={(e) => setLoaiChungChi(e.target.value)}
                                        label="Loại chứng chỉ"
                                    >
                                        {loaiChungChiOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Hệ đào tạo</InputLabel>
                                    <Select
                                        value={heDaoTaoFilter}
                                        onChange={(e) => setHeDaoTaoFilter(e.target.value)}
                                        label="Hệ đào tạo"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {HeDaoTao.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.ten_he_dao_tao}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Khóa đào tạo</InputLabel>
                                    <Select
                                        value={khoaDaoTaoFilter}
                                        onChange={(e) => setKhoaDaoTaoFilter(e.target.value)}
                                        label="Khóa đào tạo"
                                        disabled={!heDaoTaoFilter}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {khoaDaoTao.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.ten_khoa}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Lớp</InputLabel>
                                    <Select
                                        value={lopIdFilter}
                                        onChange={(e) => setLopIdFilter(e.target.value)}
                                        label="Lớp"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {lopListView.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.ma_lop}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Tìm kiếm theo tên hoặc mã sinh viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Trạng thái</InputLabel>
                                    <Select
                                        value={trangThai}
                                        onChange={(e) => setTrangThai(e.target.value)}
                                        label="Trạng thái"
                                    >
                                        <MenuItem value="all">Tất cả sinh viên</MenuItem>
                                        <MenuItem value="da_dat">Sinh viên đã đạt</MenuItem>
                                        <MenuItem value="chua_dat">Sinh viên chưa đạt</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        minWidth: 100,
                                        textTransform: "none"
                                    }}
                                    onClick={handleApplyFilter}
                                >
                                    Áp dụng
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    sx={{
                                        minWidth: 100,
                                        textTransform: "none"
                                    }}
                                    onClick={handleClearFilter}
                                    disabled={!heDaoTaoFilter && !khoaDaoTaoFilter && !lopIdFilter && !searchTerm}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Student List Table */}
                    {isLoading ? (
                        <Typography variant="body1" textAlign="center" sx={{ my: 4 }}>
                            Đang tải dữ liệu...
                        </Typography>
                    ) : filteredSinhVien.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                            Không tìm thấy sinh viên nào
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ mt: 4, overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableCell align="center" sx={{ fontWeight: "bold", width: '50px' }}>STT</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", width: '100px' }}>Mã SV</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", width: '180px' }}>Họ và tên</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: "bold", width: '80px' }}>Điểm TB</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", width: '100px' }}>Xếp loại</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", width: '240px' }}>Ghi chú</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", width: '120px' }}>Số quyết định</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", width: '120px' }}>Ngày ký QĐ</TableCell>
                                        <TableCell sx={{ fontWeight: "bold", width: '100px' }}>Tình trạng</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: "bold", width: '60px' }}>Xóa</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSinhVien.map((sv, index) => (
                                        <TableRow key={sv.id} sx={{
                                            backgroundColor: !sv.da_dat ? '#fff9f9' : 'inherit',
                                        }}>
                                            <TableCell align="center">{(page - 1) * pageSize + index + 1}</TableCell>
                                            <TableCell>{sv.ma_sinh_vien}</TableCell>
                                            <TableCell>{sv.ho_ten}</TableCell>
                                            <TableCell align="center">{sv.diem_tb}</TableCell>
                                            <TableCell>{sv.xep_loai}</TableCell>
                                            <TableCell>
                                                {sv.ghi_chu.length > 40 ? (
                                                    <Tooltip title={sv.ghi_chu}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {sv.ghi_chu.substring(0, 40)}...
                                                            <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                                                        </Box>
                                                    </Tooltip>
                                                ) : sv.ghi_chu}
                                            </TableCell>
                                            <TableCell>{sv.so_quyet_dinh}</TableCell>
                                            <TableCell>{formatDate(sv.ngay_ky_qd)}</TableCell>
                                            <TableCell>{sv.tinh_trang}</TableCell>
                                            <TableCell align="center">
                                                <IconButton color="error" size="small" onClick={() => handleDelete(sv.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <MuiPagination
                                color="primary"
                                count={totalPages}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                variant="outlined"
                                shape="rounded"
                            />
                        </Box>
                    )}
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default QuanLyChungChi;