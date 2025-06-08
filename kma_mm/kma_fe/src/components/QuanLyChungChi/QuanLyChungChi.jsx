
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container,
    TextField, InputAdornment, Pagination as MuiPagination, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, createTheme, ThemeProvider,
    Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Autocomplete
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import { fetchLopByKhoaDaoTao } from "../../Api_controller/Service/thoiKhoaBieuService";
import {
    laydanhsachloaichungchi,
    getChungChiByFilters,
    themChungChi,
    suaChungChi,
    xoaChungChi
} from "../../Api_controller/Service/chungChiService";
import { toast } from "react-toastify";

// Constants
const DEFAULT_CHUNG_CHI_OPTIONS = [
    { value: "Chuẩn đầu ra TA", label: "Chuẩn đầu ra TA" },
    { value: "Chứng chỉ GDTC", label: "Chứng chỉ GDTC" }
];

const TRANG_THAI_OPTIONS = [
    { value: "all", label: "Tất cả sinh viên" },
    { value: "Bình thường", label: "Sinh viên đang học" },
    { value: "Tốt nghiệp", label: "Sinh viên đã tốt nghiệp" }
];

const TINH_TRANG_OPTIONS = [
    { value: "Bình thường", label: "Bình thường" },
    { value: "Tốt nghiệp", label: "Tốt nghiệp" }
];

const INIT_NEW_DATA = {
    // sinh_vien_id: "",
    ma_sinh_vien: "",
    ho_ten: "",
    diem_tb: "",
    xep_loai: "",
    ghi_chu: "",
    so_quyet_dinh: "",
    ngay_ky_qd: "",
    tinh_trang: "Bình thường",
    loai_chung_chi: ""
};

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        background: { default: '#f5f5f5' }
    },
    typography: { fontFamily: 'Roboto, Arial, sans-serif' }
});

const QuanLyChungChi = () => {
    // Consolidated filter state
    const [filters, setFilters] = useState({
        heDaoTao: "",
        khoaDaoTao: "",
        lopId: "",
        searchTerm: "",
        loaiChungChi: "Chuẩn đầu ra TA",
        trangThai: "all"
    });

    // Data states
    const [data, setData] = useState({
        heDaoTao: [],
        khoaDaoTao: [],
        lopList: [],
        originalLopList: [],
        sinhVienList: [],
        loaiChungChiList: DEFAULT_CHUNG_CHI_OPTIONS
    });

    // UI states
    const [ui, setUi] = useState({
        isLoading: false,
        openDialog: false,
        page: 1,
        pageSize: 10,
        totalPages: 1
    });

    // Form data
    const [newData, setNewData] = useState(INIT_NEW_DATA);
    const [filteredSinhVien, setFilteredSinhVien] = useState([]);

    // Memoized filtered data - XÓA DEPENDENCY LOOP
    const processFilteredData = useMemo(() => {
        console.log("🎯 processFilteredData called with:", {
            dataLength: data.sinhVienList.length,
            currentFilters: filters,
            sampleData: data.sinhVienList[0]
        });

        if (!data.sinhVienList || data.sinhVienList.length === 0) {
            console.log("📋 No data to filter");
            setFilteredSinhVien([]);
            setUi(prev => ({ ...prev, totalPages: 1 }));
            return [];
        }

        let filtered = [...data.sinhVienList];
        console.log("📊 Initial data count:", filtered.length);

        // Apply filters
        filtered = filtered.filter(sv => sv.loai_chung_chi === filters.loaiChungChi);
        console.log(`🔍 After loaiChungChi filter (${filters.loaiChungChi}):`, filtered.length);

        // Filter by tinh_trang
        if (filters.trangThai === 'Bình thường') {
            filtered = filtered.filter(sv =>
                sv.tinh_trang === 'Bình thường' ||
                sv.tinh_trang === 'bình thường'
            );
            console.log("🔍 After trangThai filter (Bình thường):", filtered.length);
        } else if (filters.trangThai === 'Tốt nghiệp') {
            filtered = filtered.filter(sv =>
                sv.tinh_trang === 'Tốt nghiệp' ||
                sv.tinh_trang === 'tốt nghiệp'
            );
            console.log("🔍 After trangThai filter (Tốt nghiệp):", filtered.length);
        }

        if (filters.searchTerm) {
            const search = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(sv =>
                sv.ho_ten.toLowerCase().includes(search) ||
                sv.ma_sinh_vien.toLowerCase().includes(search)
            );
            console.log(`🔍 After search filter (${filters.searchTerm}):`, filtered.length);
        }

        console.log("📋 Final filtered data:", filtered);

        // Pagination
        const totalPages = Math.ceil(filtered.length / ui.pageSize);
        setUi(prev => ({ ...prev, totalPages }));

        const startIndex = (ui.page - 1) * ui.pageSize;
        const endIndex = startIndex + ui.pageSize;
        const paginatedData = filtered.slice(startIndex, endIndex);

        console.log("📄 Paginated data:", {
            page: ui.page,
            pageSize: ui.pageSize,
            startIndex,
            endIndex,
            paginatedCount: paginatedData.length
        });

        setFilteredSinhVien(paginatedData);
        return paginatedData;
    }, [data.sinhVienList, filters.loaiChungChi, filters.trangThai, filters.searchTerm, ui.page, ui.pageSize]);

    // API calls
    const fetchChungChiData = useCallback(async () => {
        console.log("🔍 fetchChungChiData called with filters:", filters);

        if (!filters.lopId && !filters.khoaDaoTao && !filters.heDaoTao) {
            console.log("📋 Using empty data - no filters applied");
            setData(prev => ({ ...prev, sinhVienList: [] }));
            return;
        }

        try {
            setUi(prev => ({ ...prev, isLoading: true }));
            console.log("🌐 Calling API with filters:", filters);

            const chungChiRes = await getChungChiByFilters(filters);
            console.log("📤 API Response:", chungChiRes);

            let chungChiList = [];
            if (chungChiRes?.thongBao === "Lấy danh sách chứng chỉ thành công" && chungChiRes.data?.length > 0) {
                chungChiList = chungChiRes.data.map(item => ({
                    id: item.id,
                    ma_sinh_vien: item.maSinhVien,
                    ho_ten: item.hoTen,
                    diem_tb: item.diemTrungBinh,
                    xep_loai: item.xepLoai,
                    ghi_chu: item.ghiChu || "",
                    so_quyet_dinh: item.soQuyetDinh,
                    ngay_ky_qd: item.ngayKyQuyetDinh,
                    tinh_trang: item.tinhTrang,
                    lop_id: filters.lopId,
                    loai_chung_chi: item.loaiChungChi
                }));
                console.log("🔄 Converted data:", chungChiList);
            } else {
                console.log("⚠️ API response not valid or empty:", chungChiRes);
            }

            console.log("💾 Setting data to state:", chungChiList);
            setData(prev => ({ ...prev, sinhVienList: chungChiList }));
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách chứng chỉ:", error);
            toast.error("Không thể lấy danh sách chứng chỉ");
            setData(prev => ({ ...prev, sinhVienList: [] }));
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [filters]);

    const fetchInitialData = useCallback(async () => {
        setUi(prev => ({ ...prev, isLoading: true }));
        try {
            const [loaiChungChiRes, heDaoTaoRes] = await Promise.all([
                laydanhsachloaichungchi(),
                fetchDanhSachHeDaoTao(),
            ]);

            let loaiChungChiList = DEFAULT_CHUNG_CHI_OPTIONS;
            if (loaiChungChiRes?.thongBao === "Lấy danh sách loại chứng chỉ thành công" && loaiChungChiRes.data?.length > 0) {
                loaiChungChiList = loaiChungChiRes.data.map(item => ({
                    value: item,
                    label: item
                }));
            }

            setData(prev => ({
                ...prev,
                heDaoTao: heDaoTaoRes || [],
                loaiChungChiList,
                sinhVienList: []
            }));
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            toast.error("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const fetchKhoaDaoTao = useCallback(async (heDaoTaoId) => {
        if (!heDaoTaoId) {
            setData(prev => ({ ...prev, khoaDaoTao: [], lopList: prev.originalLopList }));
            setFilters(prev => ({ ...prev, khoaDaoTao: "", lopId: "" }));
            return;
        }

        try {
            const khoaDaoTaoData = await getDanhSachKhoaDaoTaobyId(heDaoTaoId);
            setData(prev => ({ ...prev, khoaDaoTao: khoaDaoTaoData || [] }));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
            toast.error("Không thể lấy danh sách khóa đào tạo");
        }
    }, []);

    const fetchLopByKhoa = useCallback(async (khoaDaoTaoId) => {
        if (!khoaDaoTaoId) {
            setData(prev => ({ ...prev, lopList: prev.originalLopList }));
            setFilters(prev => ({ ...prev, lopId: "" }));
            return;
        }

        try {
            const lopData = await fetchLopByKhoaDaoTao(khoaDaoTaoId);
            setData(prev => ({ ...prev, lopList: lopData || [] }));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lớp:", error);
            toast.error("Không thể lấy danh sách lớp");
        }
    }, []);

    // Event handlers
    const handleFilterChange = useCallback((filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));

        if (filterName === 'heDaoTao') {
            fetchKhoaDaoTao(value);
        } else if (filterName === 'khoaDaoTao') {
            fetchLopByKhoa(value);
        }
    }, [fetchKhoaDaoTao, fetchLopByKhoa]);


    // Thêm handler cho autocomplete
    const handleAutocompleteChange = useCallback((name, value) => {
        setNewData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handlePageChange = useCallback((event, value) => {
        setUi(prev => ({ ...prev, page: value }));
    }, []);

    const handleApplyFilter = useCallback(async () => {
        setUi(prev => ({ ...prev, page: 1 }));
        await fetchChungChiData();
    }, [fetchChungChiData]);

    const handleClearFilter = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            heDaoTao: "",
            khoaDaoTao: "",
            lopId: "",
            searchTerm: ""
        }));
        setUi(prev => ({ ...prev, page: 1 }));
        setData(prev => ({ ...prev, khoaDaoTao: [], lopList: prev.originalLopList, sinhVienList: [] }));
    }, []);

    const handleSubmitNew = useCallback(async () => {
        try {
            setUi(prev => ({ ...prev, isLoading: true }));

            const apiData = {
                //sinh_vien_id: parseInt(newData.sinh_vien_id) || 1,
                ma_sinh_vien: newData.ma_sinh_vien,
                diem_trung_binh: parseFloat(newData.diem_tb) || null,
                xep_loai: newData.xep_loai || null,
                ghi_chu: newData.ghi_chu || null,
                so_quyet_dinh: newData.so_quyet_dinh || null,
                loai_chung_chi: newData.loai_chung_chi,
                ngay_ky_quyet_dinh: newData.ngay_ky_qd || null,
                tinh_trang: newData.tinh_trang === "Bình thường" ? "bình thường" : "tốt nghiệp"
            };

            const result = await themChungChi(apiData);

            if (result?.thongBao === "Tạo chứng chỉ thành công") {
                toast.success("Thêm chứng chỉ thành công!");
                setUi(prev => ({ ...prev, openDialog: false }));
                setNewData(INIT_NEW_DATA);
                fetchChungChiData();
            } else {
                throw new Error(result?.thongBao || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Lỗi khi thêm chứng chỉ:", error);
            toast.error(error?.response?.data?.thongBao || "Không thể thêm chứng chỉ");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [newData, fetchChungChiData]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) return;

        try {
            setUi(prev => ({ ...prev, isLoading: true }));

            const result = await xoaChungChi(id);

            if (result?.thongBao === "Xóa chứng chỉ thành công") {
                toast.success("Xóa chứng chỉ thành công!");
                fetchChungChiData();
            } else {
                throw new Error(result?.thongBao || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Lỗi khi xóa chứng chỉ:", error);
            toast.error(error?.response?.data?.thongBao || "Không thể xóa chứng chỉ");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [fetchChungChiData]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleOpenDialog = useCallback(() => {
        setUi(prev => ({ ...prev, openDialog: true }));
        setNewData(prev => ({ ...prev, loai_chung_chi: filters.loaiChungChi || "" }));
    }, [filters.loaiChungChi]);



    // Thêm handlers cho edit
    const handleEdit = useCallback((sv) => {
        setEditData({
            id: sv.id,
            sinh_vien_id: sv.sinh_vien_id || "",
            ma_sinh_vien: sv.ma_sinh_vien,
            ho_ten: sv.ho_ten,
            diem_tb: sv.diem_tb,
            xep_loai: sv.xep_loai,
            ghi_chu: sv.ghi_chu,
            so_quyet_dinh: sv.so_quyet_dinh,
            ngay_ky_qd: sv.ngay_ky_qd,
            tinh_trang: sv.tinh_trang,
            loai_chung_chi: sv.loai_chung_chi
        });
        setUi(prev => ({ ...prev, openEditDialog: true }));
    }, []);



    // Thêm states cho edit
    const [editData, setEditData] = useState(INIT_NEW_DATA);
    const [isEditMode, setIsEditMode] = useState(false);


    const handleCloseEditDialog = useCallback(() => {
        setUi(prev => ({ ...prev, openEditDialog: false }));
        setEditData(INIT_NEW_DATA);
    }, []);

    const handleEditInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEditAutocompleteChange = useCallback((name, value) => {
        setEditData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmitEdit = useCallback(async () => {
        try {
            setUi(prev => ({ ...prev, isLoading: true }));

            // Tách ID ra và không đưa vào body data
            const chungChiId = editData.id;
            const apiData = {
                sinh_vien_id: parseInt(editData.sinh_vien_id) || 1,
                diem_trung_binh: parseFloat(editData.diem_tb) || null,
                xep_loai: editData.xep_loai || null,
                ghi_chu: editData.ghi_chu || null,
                so_quyet_dinh: editData.so_quyet_dinh || null,
                loai_chung_chi: editData.loai_chung_chi,
                ngay_ky_quyet_dinh: editData.ngay_ky_qd || null,
                tinh_trang: editData.tinh_trang === "Bình thường" ? "bình thường" : "tốt nghiệp"
            };

            // Truyền ID và data riêng biệt
            const result = await suaChungChi(chungChiId, apiData);

            if (result?.thongBao === "Chỉnh sửa chứng chỉ thành công") {
                toast.success("Cập nhật chứng chỉ thành công!");
                setUi(prev => ({ ...prev, openEditDialog: false }));
                setEditData(INIT_NEW_DATA);
                fetchChungChiData();
            } else {
                throw new Error(result?.thongBao || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật chứng chỉ:", error);
            toast.error(error?.response?.data?.thongBao || "Không thể cập nhật chứng chỉ");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [editData, fetchChungChiData]);



    const handleCloseDialog = useCallback(() => {
        setUi(prev => ({ ...prev, openDialog: false }));
        setNewData(INIT_NEW_DATA);
    }, []);

    const formatDate = useCallback((dateString) => dateString || "", []);

    const hasActiveFilters = useMemo(() =>
        !!(filters.heDaoTao || filters.khoaDaoTao || filters.lopId || filters.searchTerm),
        [filters.heDaoTao, filters.khoaDaoTao, filters.lopId, filters.searchTerm]
    );

    // Effects - ĐƠN GIẢN HÓA
    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (filters.heDaoTao) {
            fetchKhoaDaoTao(filters.heDaoTao);
        }
    }, [filters.heDaoTao, fetchKhoaDaoTao]);

    useEffect(() => {
        if (filters.khoaDaoTao) {
            fetchLopByKhoa(filters.khoaDaoTao);
        }
    }, [filters.khoaDaoTao, fetchLopByKhoa]);

    // Reset page khi thay đổi filter
    useEffect(() => {
        if (ui.page > 1) {
            setUi(prev => ({ ...prev, page: 1 }));
        }
    }, [filters.loaiChungChi, filters.trangThai, filters.searchTerm]);

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenDialog}
                        >
                            Thêm học viên
                        </Button>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<FileUploadIcon />}
                            >
                                Import
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<FileDownloadIcon />}
                            >
                                Export
                            </Button>
                        </Box>
                    </Box>

                    {/* Filter Section */}
                    <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, backgroundColor: "#fff" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Loại chứng chỉ</InputLabel>
                                    <Select
                                        value={filters.loaiChungChi}
                                        onChange={(e) => handleFilterChange('loaiChungChi', e.target.value)}
                                        label="Loại chứng chỉ"
                                    >
                                        {data.loaiChungChiList.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Hệ đào tạo</InputLabel>
                                    <Select
                                        value={filters.heDaoTao}
                                        onChange={(e) => handleFilterChange('heDaoTao', e.target.value)}
                                        label="Hệ đào tạo"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {data.heDaoTao.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.ten_he_dao_tao}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Khóa đào tạo</InputLabel>
                                    <Select
                                        value={filters.khoaDaoTao}
                                        onChange={(e) => handleFilterChange('khoaDaoTao', e.target.value)}
                                        label="Khóa đào tạo"
                                        disabled={!filters.heDaoTao}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {data.khoaDaoTao.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.ten_khoa}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Lớp</InputLabel>
                                    <Select
                                        value={filters.lopId}
                                        onChange={(e) => handleFilterChange('lopId', e.target.value)}
                                        label="Lớp"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {data.lopList.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.ma_lop}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Tìm kiếm theo tên hoặc mã sinh viên..."
                                    value={filters.searchTerm}
                                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
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
                                        value={filters.trangThai}
                                        onChange={(e) => handleFilterChange('trangThai', e.target.value)}
                                        label="Trạng thái"
                                    >
                                        {TRANG_THAI_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ minWidth: 100, textTransform: "none" }}
                                    onClick={handleApplyFilter}
                                >
                                    Áp dụng
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    sx={{ minWidth: 100, textTransform: "none" }}
                                    onClick={handleClearFilter}
                                    disabled={!hasActiveFilters}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Student List Table */}
                    {ui.isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredSinhVien.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                            {hasActiveFilters ? "Không tìm thấy sinh viên nào" : "Vui lòng chọn bộ lọc để hiển thị danh sách"}
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
                                        <TableCell align="center" sx={{ fontWeight: "bold", width: '60px' }}>Sửa</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: "bold", width: '60px' }}>Xóa</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSinhVien.map((sv, index) => (
                                        <TableRow key={sv.id} sx={{
                                            backgroundColor: sv.tinh_trang === 'Tốt nghiệp' || sv.tinh_trang === 'tốt nghiệp' ? '#f0f8ff' : 'inherit',
                                        }}>
                                            <TableCell align="center">{(ui.page - 1) * ui.pageSize + index + 1}</TableCell>
                                            <TableCell>{sv.ma_sinh_vien}</TableCell>
                                            <TableCell>{sv.ho_ten}</TableCell>
                                            <TableCell align="center">{sv.diem_tb}</TableCell>
                                            <TableCell>{sv.xep_loai}</TableCell>
                                            <TableCell>
                                                {sv.ghi_chu && sv.ghi_chu.length > 40 ? (
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
                                            <TableCell>
                                                <Box sx={{
                                                    color: (sv.tinh_trang === 'Tốt nghiệp' || sv.tinh_trang === 'tốt nghiệp') ? '#2e7d32' : '#1976d2',
                                                    fontWeight: 'medium'
                                                }}>
                                                    {sv.tinh_trang}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleEdit(sv)}
                                                    disabled={ui.isLoading}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>

                                            <TableCell align="center">
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDelete(sv.id)}
                                                    disabled={ui.isLoading}
                                                >
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
                    {ui.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <MuiPagination
                                color="primary"
                                count={ui.totalPages}
                                page={ui.page}
                                onChange={handlePageChange}
                                variant="outlined"
                                shape="rounded"
                            />
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Dialog thêm mới học viên */}
            <Dialog open={ui.openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>Thêm học viên đạt chứng chỉ</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="ma_sinh_vien"
                                label="Mã sinh viên"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={newData.ma_sinh_vien}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        {/* Thêm trường Loại chứng chỉ */}
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                freeSolo
                                options={data.loaiChungChiList.map(option => option.label)}
                                value={newData.loai_chung_chi}
                                onChange={(event, newValue) => {
                                    handleAutocompleteChange('loai_chung_chi', newValue || '');
                                }}
                                onInputChange={(event, newInputValue) => {
                                    // Chỉ cho phép thay đổi nếu người dùng đang gõ (không phải chọn từ dropdown)
                                    if (event && event.type === 'change') {
                                        handleAutocompleteChange('loai_chung_chi', newInputValue);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Loại chứng chỉ"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        helperText="Chọn từ danh sách hoặc nhập mới"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        {option}
                                    </Box>
                                )}
                                noOptionsText="Không tìm thấy. Bạn có thể nhập loại chứng chỉ mới"
                                clearOnBlur
                                selectOnFocus
                                handleHomeEndKeys
                            />
                        </Grid>



                        <Grid item xs={12} md={6}>
                            <TextField
                                name="diem_tb"
                                label="Điểm trung bình"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="number"
                                value={newData.diem_tb}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Xếp loại</InputLabel>
                                <Select
                                    name="xep_loai"
                                    value={newData.xep_loai}
                                    label="Xếp loại"
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="Xuất sắc">Xuất sắc</MenuItem>
                                    <MenuItem value="Giỏi">Giỏi</MenuItem>
                                    <MenuItem value="Khá">Khá</MenuItem>
                                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="so_quyet_dinh"
                                label="Số quyết định"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={newData.so_quyet_dinh}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="ngay_ky_qd"
                                label="Ngày ký quyết định"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="date"
                                value={newData.ngay_ky_qd}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tình trạng</InputLabel>
                                <Select
                                    name="tinh_trang"
                                    value={newData.tinh_trang}
                                    label="Tình trạng"
                                    onChange={handleInputChange}
                                >
                                    {TINH_TRANG_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="ghi_chu"
                                label="Ghi chú"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                value={newData.ghi_chu}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={ui.isLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitNew}
                        color="primary"
                        disabled={ui.isLoading}
                    >
                        {ui.isLoading ? <CircularProgress size={20} /> : "Thêm"}
                    </Button>
                </DialogActions>
            </Dialog>



            {/* Dialog chỉnh sửa học viên */}
            <Dialog open={ui.openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
                <DialogTitle>Chỉnh sửa thông tin chứng chỉ</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="ma_sinh_vien"
                                label="Mã sinh viên"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={editData.ma_sinh_vien}
                                onChange={handleEditInputChange}
                                disabled // Không cho sửa mã sinh viên
                            />
                        </Grid>

                        {/* Trường Loại chứng chỉ */}
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                freeSolo
                                options={data.loaiChungChiList.map(option => option.label)}
                                value={editData.loai_chung_chi}
                                onChange={(event, newValue) => {
                                    handleEditAutocompleteChange('loai_chung_chi', newValue || '');
                                }}
                                onInputChange={(event, newInputValue) => {
                                    if (event && event.type === 'change') {
                                        handleEditAutocompleteChange('loai_chung_chi', newInputValue);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Loại chứng chỉ"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        helperText="Chọn từ danh sách hoặc nhập mới"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        {option}
                                    </Box>
                                )}
                                noOptionsText="Không tìm thấy. Bạn có thể nhập loại chứng chỉ mới"
                                clearOnBlur
                                selectOnFocus
                                handleHomeEndKeys
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="diem_tb"
                                label="Điểm trung bình"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="number"
                                value={editData.diem_tb}
                                onChange={handleEditInputChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Xếp loại</InputLabel>
                                <Select
                                    name="xep_loai"
                                    value={editData.xep_loai}
                                    label="Xếp loại"
                                    onChange={handleEditInputChange}
                                >
                                    <MenuItem value="Xuất sắc">Xuất sắc</MenuItem>
                                    <MenuItem value="Giỏi">Giỏi</MenuItem>
                                    <MenuItem value="Khá">Khá</MenuItem>
                                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="so_quyet_dinh"
                                label="Số quyết định"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={editData.so_quyet_dinh}
                                onChange={handleEditInputChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="ngay_ky_qd"
                                label="Ngày ký quyết định"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="date"
                                value={editData.ngay_ky_qd}
                                onChange={handleEditInputChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tình trạng</InputLabel>
                                <Select
                                    name="tinh_trang"
                                    value={editData.tinh_trang}
                                    label="Tình trạng"
                                    onChange={handleEditInputChange}
                                >
                                    {TINH_TRANG_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="ghi_chu"
                                label="Ghi chú"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                value={editData.ghi_chu}
                                onChange={handleEditInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} disabled={ui.isLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitEdit}
                        color="primary"
                        disabled={ui.isLoading}
                    >
                        {ui.isLoading ? <CircularProgress size={20} /> : "Cập nhật"}
                    </Button>
                </DialogActions>
            </Dialog>

        </ThemeProvider>
    );
};

export default QuanLyChungChi;






{/* <Grid item xs={12} md={6}>
                            <TextField
                                name="sinh_vien_id"
                                label="ID Sinh viên"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="number"
                                value={newData.sinh_vien_id}
                                onChange={handleInputChange}
                                helperText="Nhập ID sinh viên thực từ database"
                            />
                        </Grid> */}


{/* <Grid item xs={12} md={6}>
                            <TextField
                                name="ho_ten"
                                label="Họ và tên"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={newData.ho_ten}
                                onChange={handleInputChange}
                            />
                        </Grid> */}