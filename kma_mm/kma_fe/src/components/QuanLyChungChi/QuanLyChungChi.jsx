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
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import { fetchLopByKhoaDaoTao } from "../../Api_controller/Service/thoiKhoaBieuService";
import {
    laydanhsachloaichungchi,
    getChungChiByFilters,
    themChungChi,
    suaChungChi,
    xoaChungChi,
    taoLoaiChungChi,

} from "../../Api_controller/Service/chungChiService";
import { getDanhSachSinhVienTheoLop } from "../../Api_controller/Service/sinhVienService"; // Thêm API lấy học viên
import { toast } from "react-toastify";

// Constants
const DEFAULT_CHUNG_CHI_OPTIONS = [
    { value: "Chuẩn đầu ra TA", label: "Chuẩn đầu ra TA" },
    { value: "Chứng chỉ GDTC", label: "Chứng chỉ GDTC" },
    { value: "Chứng chỉ GDQP&AN", label: "Chứng chỉ GDQP&AN" }
];

const TRANG_THAI_OPTIONS = [
    { value: "all", label: "Tất cả học viên" },
    { value: "Bình thường", label: "Học viên đang học" },
    { value: "Tốt nghiệp", label: "Học viên đã tốt nghiệp" }
];

const TINH_TRANG_OPTIONS = [
    { value: "Bình thường", label: "Bình thường" },
    { value: "Tốt nghiệp", label: "Tốt nghiệp" }
];

const INIT_NEW_DATA = {
    ma_sinh_vien: "",
    ho_ten: "",
    diem_tb: "",
    xep_loai: "",
    ghi_chu: "",
    so_quyet_dinh: "",
    ngay_ky_qd: "",
    tinh_trang: "Bình thường",
    loai_chung_chi: "",
    heDaoTao: "", // Thêm hệ đào tạo
    khoaDaoTao: "", // Thêm khóa đào tạo
    lopId: "" // Thêm lớp
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
        loaiChungChiList: DEFAULT_CHUNG_CHI_OPTIONS,
        sinhVienTheoLop: [] // Thêm danh sách học viên theo lớp
    });

    // UI states
    const [ui, setUi] = useState({
        isLoading: false,
        openDialog: false,
        openEditDialog: false,
        openManageTypeDialog: false,
        page: 1,
        pageSize: 10,
        totalPages: 1
    });

    // Form data
    const [newData, setNewData] = useState(INIT_NEW_DATA);
    const [editData, setEditData] = useState(INIT_NEW_DATA);
    const [filteredSinhVien, setFilteredSinhVien] = useState([]);

    // Thêm state cho quản lý loại chứng chỉ
    const [newLoaiChungChi, setNewLoaiChungChi] = useState("");
    const [isAddingType, setIsAddingType] = useState(false);

    // Memoized filtered data
    const processFilteredData = useMemo(() => {
        if (!data.sinhVienList || data.sinhVienList.length === 0) {
            setFilteredSinhVien([]);
            setUi(prev => ({ ...prev, totalPages: 1 }));
            return [];
        }

        let filtered = [...data.sinhVienList];
        filtered = filtered.filter(sv => sv.loai_chung_chi === filters.loaiChungChi);

        if (filters.trangThai === 'Bình thường') {
            filtered = filtered.filter(sv =>
                sv.tinh_trang === 'Bình thường' || sv.tinh_trang === 'bình thường'
            );
        } else if (filters.trangThai === 'Tốt nghiệp') {
            filtered = filtered.filter(sv =>
                sv.tinh_trang === 'Tốt nghiệp' || sv.tinh_trang === 'tốt nghiệp'
            );
        }

        if (filters.searchTerm) {
            const search = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(sv =>
                sv.ho_ten.toLowerCase().includes(search) ||
                sv.ma_sinh_vien.toLowerCase().includes(search)
            );
        }

        const totalPages = Math.ceil(filtered.length / ui.pageSize);
        setUi(prev => ({ ...prev, totalPages }));

        const startIndex = (ui.page - 1) * ui.pageSize;
        const endIndex = startIndex + ui.pageSize;
        const paginatedData = filtered.slice(startIndex, endIndex);

        setFilteredSinhVien(paginatedData);
        return paginatedData;
    }, [data.sinhVienList, filters.loaiChungChi, filters.trangThai, filters.searchTerm, ui.page, ui.pageSize]);

    // API calls
    const fetchChungChiData = useCallback(async () => {
        if (!filters.lopId && !filters.khoaDaoTao && !filters.heDaoTao) {
            setData(prev => ({ ...prev, sinhVienList: [] }));
            return;
        }

        try {
            setUi(prev => ({ ...prev, isLoading: true }));
            const chungChiRes = await getChungChiByFilters(filters);

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
            }

            setData(prev => ({ ...prev, sinhVienList: chungChiList }));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chứng chỉ:", error);
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
                const apiChungChiList = loaiChungChiRes.data.map(item => ({
                    value: item,
                    label: item
                }));
                // Kết hợp danh sách API với mặc định, loại bỏ trùng lặp
                loaiChungChiList = [
                    ...DEFAULT_CHUNG_CHI_OPTIONS,
                    ...apiChungChiList.filter(item => !DEFAULT_CHUNG_CHI_OPTIONS.some(defaultItem => defaultItem.value === item.value))
                ];
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
            setData(prev => ({ ...prev, khoaDaoTao: [], lopList: prev.originalLopList, sinhVienTheoLop: [] }));
            setFilters(prev => ({ ...prev, khoaDaoTao: "", lopId: "" }));
            setNewData(prev => ({ ...prev, khoaDaoTao: "", lopId: "", ma_sinh_vien: "", ho_ten: "" }));
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
            setData(prev => ({ ...prev, lopList: prev.originalLopList, sinhVienTheoLop: [] }));
            setFilters(prev => ({ ...prev, lopId: "" }));
            setNewData(prev => ({ ...prev, lopId: "", ma_sinh_vien: "", ho_ten: "" }));
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

    const fetchSinhVienTheoLop = useCallback(async (lopId) => {
        if (!lopId) {
            setData(prev => ({ ...prev, sinhVienTheoLop: [] }));
            setNewData(prev => ({ ...prev, ma_sinh_vien: "", ho_ten: "" }));
            return;
        }

        try {
            setUi(prev => ({ ...prev, isLoading: true }));
            const response = await getDanhSachSinhVienTheoLop(lopId);
            const sinhVienList = Array.isArray(response.data) ? response.data.map(sv => ({
                id: sv.id,
                ma_sinh_vien: sv.ma_sinh_vien,
                ho_dem: sv.ho_dem,
                ten: sv.ten
            })) : [];
            setData(prev => ({ ...prev, sinhVienTheoLop: sinhVienList }));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách học viên:", error);
            toast.error("Không thể lấy danh sách học viên");
            setData(prev => ({ ...prev, sinhVienTheoLop: [] }));
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    console.log(filteredSinhVien)
    console.log(data)
    // Event handlers
    const handleFilterChange = useCallback((filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));

        if (filterName === 'heDaoTao') {
            fetchKhoaDaoTao(value);
        } else if (filterName === 'khoaDaoTao') {
            fetchLopByKhoa(value);
        }
    }, [fetchKhoaDaoTao, fetchLopByKhoa]);

    const handleNewDataChange = useCallback((name, value) => {
        setNewData(prev => ({ ...prev, [name]: value }));
        if (name === 'heDaoTao') {
            fetchKhoaDaoTao(value);
            setNewData(prev => ({ ...prev, khoaDaoTao: "", lopId: "", ma_sinh_vien: "", ho_ten: "" }));
        } else if (name === 'khoaDaoTao') {
            fetchLopByKhoa(value);
            setNewData(prev => ({ ...prev, lopId: "", ma_sinh_vien: "", ho_ten: "" }));
        } else if (name === 'lopId') {
            fetchSinhVienTheoLop(value);
            setNewData(prev => ({ ...prev, ma_sinh_vien: "", ho_ten: "" }));
        } else if (name === 'sinhVien') {
            setNewData(prev => ({
                ...prev,
                ma_sinh_vien: value ? value.ma_sinh_vien : "",
                ho_ten: value ? value.ho_ten : ""
            }));
        }
    }, [fetchKhoaDaoTao, fetchLopByKhoa, fetchSinhVienTheoLop]);

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

    const handleEdit = useCallback((sv) => {
        setEditData({
            id: sv.id,
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

            const chungChiId = editData.id;
            const apiData = {
                ma_sinh_vien: editData.ma_sinh_vien,
                diem_trung_binh: parseFloat(editData.diem_tb) || null,
                xep_loai: editData.xep_loai || null,
                ghi_chu: editData.ghi_chu || null,
                so_quyet_dinh: editData.so_quyet_dinh || null,
                loai_chung_chi: editData.loai_chung_chi,
                ngay_ky_quyet_dinh: editData.ngay_ky_qd || null,
                tinh_trang: editData.tinh_trang === "Bình thường" ? "bình thường" : "tốt nghiệp"
            };

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

    // Thêm các functions để quản lý loại chứng chỉ
    const handleOpenManageTypeDialog = () => {
        setUi(prev => ({ ...prev, openManageTypeDialog: true }));
    };

    const handleCloseManageTypeDialog = () => {
        setUi(prev => ({ ...prev, openManageTypeDialog: false }));
        setNewLoaiChungChi("");
        setIsAddingType(false);
    };

    const handleAddLoaiChungChi = async () => {
        if (!newLoaiChungChi.trim()) {
            toast.error("Vui lòng nhập tên loại chứng chỉ");
            return;
        }

        // Kiểm tra trùng lặp
        const exists = data.loaiChungChiList.some(item =>
            item.value.toLowerCase() === newLoaiChungChi.trim().toLowerCase()
        );
        if (exists) {
            toast.error("Loại chứng chỉ này đã tồn tại");
            return;
        }

        try {
            setIsAddingType(true);
            const response = await taoLoaiChungChi(newLoaiChungChi.trim());

            if (response.success) {
                // Cập nhật danh sách loại chứng chỉ
                const newTypeItem = {
                    value: newLoaiChungChi.trim(),
                    label: newLoaiChungChi.trim()
                };
                setData(prev => ({
                    ...prev,
                    loaiChungChiList: [...prev.loaiChungChiList, newTypeItem]
                }));

                setNewLoaiChungChi("");
                toast.success("Thêm loại chứng chỉ thành công");
            } else {
                toast.error("Không thể thêm loại chứng chỉ");
            }
        } catch (error) {
            console.error("Error adding chung chi type:", error);
            toast.error("Không thể thêm loại chứng chỉ");
        } finally {
            setIsAddingType(false);
        }
    };

    // Effects
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

    useEffect(() => {
        if (ui.page > 1) {
            setUi(prev => ({ ...prev, page: 1 }));
        }
    }, [filters.loaiChungChi, filters.trangThai, filters.searchTerm]);

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {/* Action Buttons - 2 nút cùng bên trái */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenDialog}
                            sx={{ textTransform: "none" }}
                        >
                            Thêm học viên
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<ManageSearchIcon />}
                            onClick={handleOpenManageTypeDialog}
                            sx={{ textTransform: "none" }}
                        >
                            Quản lý loại chứng chỉ
                        </Button>
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
                                    placeholder="Tìm kiếm theo tên hoặc mã học viên..."
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
                            {hasActiveFilters ? "Không tìm thấy học viên nào" : "Vui lòng chọn bộ lọc để hiển thị danh sách"}
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
                            <FormControl fullWidth size="small" variant="outlined">
                                <InputLabel>Hệ đào tạo</InputLabel>
                                <Select
                                    value={newData.heDaoTao}
                                    onChange={(e) => handleNewDataChange('heDaoTao', e.target.value)}
                                    label="Hệ đào tạo"
                                    disabled={ui.isLoading}
                                >
                                    <MenuItem value="">Chọn hệ đào tạo</MenuItem>
                                    {data.heDaoTao.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.ten_he_dao_tao}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" variant="outlined">
                                <InputLabel>Khóa đào tạo</InputLabel>
                                <Select
                                    value={newData.khoaDaoTao}
                                    onChange={(e) => handleNewDataChange('khoaDaoTao', e.target.value)}
                                    label="Khóa đào tạo"
                                    disabled={!newData.heDaoTao || ui.isLoading}
                                >
                                    <MenuItem value="">Chọn khóa đào tạo</MenuItem>
                                    {data.khoaDaoTao.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.ten_khoa}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" variant="outlined">
                                <InputLabel>Lớp</InputLabel>
                                <Select
                                    value={newData.lopId}
                                    onChange={(e) => handleNewDataChange('lopId', e.target.value)}
                                    label="Lớp"
                                    disabled={!newData.khoaDaoTao || ui.isLoading}
                                >
                                    <MenuItem value="">Chọn lớp</MenuItem>
                                    {data.lopList.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.ma_lop}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={data.sinhVienTheoLop}
                                getOptionLabel={(option) => `${option.ho_dem} ${option.ten} (${option.ma_sinh_vien})`}
                                value={data.sinhVienTheoLop.find(sv => sv.ma_sinh_vien === newData.ma_sinh_vien) || null}
                                onChange={(event, newValue) => handleNewDataChange('sinhVien', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Học viên"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        helperText="Chọn học viên từ danh sách"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        {option.ho_dem} {option.ten} ({option.ma_sinh_vien})
                                    </Box>
                                )}
                                noOptionsText="Không tìm thấy học viên"
                                disabled={!newData.lopId || ui.isLoading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                freeSolo
                                options={data.loaiChungChiList.map(option => option.label)}
                                value={newData.loai_chung_chi}
                                onChange={(event, newValue) => handleAutocompleteChange('loai_chung_chi', newValue || '')}
                                onInputChange={(event, newInputValue) => {
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
                        disabled={ui.isLoading || !newData.ma_sinh_vien || !newData.loai_chung_chi}
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
                                label="Mã học viên"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={editData.ma_sinh_vien}
                                onChange={handleEditInputChange}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                freeSolo
                                options={data.loaiChungChiList.map(option => option.label)}
                                value={editData.loai_chung_chi}
                                onChange={(event, newValue) => handleEditAutocompleteChange('loai_chung_chi', newValue || '')}
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

            {/* Dialog quản lý loại chứng chỉ - bỏ icon */}
            <Dialog open={ui.openManageTypeDialog} onClose={handleCloseManageTypeDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    <Typography variant="h6" component="span">Quản lý loại chứng chỉ</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* Form thêm loại chứng chỉ mới */}
                        <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #e3f2fd' }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                Thêm loại chứng chỉ mới
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Tên loại chứng chỉ"
                                    variant="outlined"
                                    value={newLoaiChungChi}
                                    onChange={(e) => setNewLoaiChungChi(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddLoaiChungChi();
                                        }
                                    }}
                                    disabled={isAddingType}
                                    placeholder="Ví dụ: Chứng chỉ TOEIC, Chứng chỉ IT..."
                                    helperText="Nhập tên loại chứng chỉ mới và nhấn Enter hoặc click Thêm"
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddLoaiChungChi}
                                    disabled={isAddingType || !newLoaiChungChi.trim()}
                                    sx={{ minWidth: 120, height: 40 }}
                                >
                                    {isAddingType ? "Đang thêm..." : "Thêm"}
                                </Button>
                            </Box>
                        </Paper>

                        {/* Danh sách loại chứng chỉ hiện có */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                Danh sách loại chứng chỉ hiện có ({data.loaiChungChiList.length})
                            </Typography>

                            {data.loaiChungChiList.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                                    <Typography variant="body1" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                        Chưa có loại chứng chỉ nào. Hãy thêm loại chứng chỉ đầu tiên!
                                    </Typography>
                                </Paper>
                            ) : (
                                <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                                <TableCell sx={{ fontWeight: "bold", color: 'white', width: '80px' }}>STT</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", color: 'white' }}>Tên loại chứng chỉ</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", color: 'white', width: '120px' }}>Trạng thái</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", color: 'white', width: '120px' }}>Nguồn gốc</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.loaiChungChiList.map((item, index) => {
                                                const isDefault = DEFAULT_CHUNG_CHI_OPTIONS.some(defaultItem => defaultItem.value === item.value);
                                                return (
                                                    <TableRow
                                                        key={item.value}
                                                        sx={{
                                                            backgroundColor: isDefault ? '#e3f2fd' : index % 2 === 0 ? '#fafafa' : 'inherit',
                                                            '&:hover': { backgroundColor: isDefault ? '#bbdefb' : '#f0f0f0' }
                                                        }}
                                                    >
                                                        <TableCell sx={{ fontWeight: 'medium' }}>{index + 1}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: isDefault ? 'bold' : 'normal' }}>
                                                                {item.label}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{
                                                                display: 'inline-block',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 2,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                color: 'white',
                                                                bgcolor: isDefault ? '#4caf50' : '#2196f3'
                                                            }}>
                                                                {isDefault ? 'Hệ thống' : 'Tùy chỉnh'}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {isDefault ? 'Mặc định' : 'Người dùng tạo'}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Button
                        onClick={handleCloseManageTypeDialog}
                        variant="contained"
                        sx={{ minWidth: 100 }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default QuanLyChungChi;