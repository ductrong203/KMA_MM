import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container,
    TextField, InputAdornment, Pagination as MuiPagination, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, createTheme, ThemeProvider,
    Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Autocomplete,
    FormControlLabel, Checkbox
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
    capNhatLoaiChungChi,
    xoaLoaiChungChi,
    layChiTietLoaiChungChi
} from "../../Api_controller/Service/chungChiService";
import { getDanhSachSinhVienTheoLop } from "../../Api_controller/Service/sinhVienService"; // Thêm API lấy học viên
import { toast } from "react-toastify";

// Constants
const TRANG_THAI_OPTIONS = [
    { value: "all", label: "Tất cả học viên" },
    { value: "Bình thường", label: "Tình trạng bình thường" },
    { value: "Tốt nghiệp", label: "Tình trạng đã tốt nghiệp" }
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
        loaiChungChi: "", // Sẽ được set sau khi load dữ liệu
        trangThai: "all"
    });

    // Data states
    const [data, setData] = useState({
        heDaoTao: [],
        khoaDaoTao: [],
        lopList: [],
        originalLopList: [],
        sinhVienList: [],
        loaiChungChiList: [], // Khởi tạo rỗng, sẽ lấy từ API
        sinhVienTheoLop: [] // Thêm danh sách học viên theo lớp
    });

    // UI states
    const [ui, setUi] = useState({
        isLoading: false,
        openDialog: false,
        openEditDialog: false,
        openManageTypeDialog: false,
        openEditTypeDialog: false,
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
    const [xetTotNghiep, setXetTotNghiep] = useState(false);
    
    // State cho chỉnh sửa loại chứng chỉ
    const [editLoaiChungChi, setEditLoaiChungChi] = useState({
        id: null,
        ten_loai_chung_chi: "",
        mo_ta: "",
        xet_tot_nghiep: false,
        tinh_trang: "hoạt động"
    });
    const [isEditingType, setIsEditingType] = useState(false);

    // Thêm state để phân biệt edit mode hay add mode
    const [isAddMode, setIsAddMode] = useState(false);

    // Thêm state cho chọn nhiều sinh viên trong form thêm mới
    const [selectedStudentsForNew, setSelectedStudentsForNew] = useState([]);

    // Memoized filtered data - SỬA ĐỔI LOGIC CHO TẤT CẢ SINH VIÊN
    const processFilteredData = useMemo(() => {
        // Nếu chọn "Tất cả học viên" thì merge dữ liệu từ sinh viên và chứng chỉ
        if (filters.trangThai === "all" && data.sinhVienTheoLop.length > 0) {
            // Lấy tất cả sinh viên trong lớp
            let filtered = data.sinhVienTheoLop.map(sv => {
                // Tìm chứng chỉ tương ứng (nếu có)
                const chungChi = data.sinhVienList.find(cc => 
                    cc.ma_sinh_vien === sv.ma_sinh_vien && 
                    cc.loai_chung_chi === filters.loaiChungChi
                );
                
                if (chungChi) {
                    // Sinh viên có chứng chỉ
                    return {
                        ...chungChi,
                        hasChungChi: true
                    };
                } else {
                    // Sinh viên không có chứng chỉ
                    return {
                        id: null, // không có ID chứng chỉ
                        ma_sinh_vien: sv.ma_sinh_vien,
                        ho_ten: `${sv.ho_dem} ${sv.ten}`.trim(),
                        diem_tb: null,
                        xep_loai: null,
                        ghi_chu: null,
                        so_quyet_dinh: null,
                        ngay_ky_qd: null,
                        tinh_trang: null,
                        loai_chung_chi: filters.loaiChungChi,
                        hasChungChi: false,
                        sinhVienId: sv.id // ID sinh viên gốc
                    };
                }
            });

            // Áp dụng search filter
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
        } else {
            // Logic cũ cho các trường hợp khác
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

            // Thêm hasChungChi = true cho tất cả (vì đây là danh sách chứng chỉ)
            filtered = filtered.map(sv => ({ ...sv, hasChungChi: true }));

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
        }
    }, [data.sinhVienList, data.sinhVienTheoLop, filters.loaiChungChi, filters.trangThai, filters.searchTerm, ui.page, ui.pageSize]);

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

            let loaiChungChiList = [];
            // Cập nhật để xử lý cả format cũ và mới
            if (loaiChungChiRes?.success && loaiChungChiRes.data?.length > 0) {
                loaiChungChiList = loaiChungChiRes.data.map(item => ({
                    id: item.id,
                    value: item.ten_loai_chung_chi,
                    label: item.ten_loai_chung_chi,
                    mo_ta: item.mo_ta,
                    xet_tot_nghiep: item.xet_tot_nghiep,
                    tinh_trang: item.tinh_trang
                }));
            } else if (loaiChungChiRes?.thongBao === "Lấy danh sách loại chứng chỉ thành công" && loaiChungChiRes.data?.length > 0) {
                // Fallback cho format cũ
                loaiChungChiList = loaiChungChiRes.data.map(item => ({
                    id: item.id,
                    value: item.ten_loai_chung_chi,
                    label: item.ten_loai_chung_chi,
                    mo_ta: item.mo_ta,
                    xet_tot_nghiep: item.xet_tot_nghiep,
                    tinh_trang: item.tinh_trang
                }));
            }

            setData(prev => ({
                ...prev,
                heDaoTao: heDaoTaoRes || [],
                loaiChungChiList,
                sinhVienList: []
            }));

            // Set loại chứng chỉ mặc định nếu có
            if (loaiChungChiList.length > 0 && !filters.loaiChungChi) {
                setFilters(prev => ({ ...prev, loaiChungChi: loaiChungChiList[0].value }));
            }
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

    // Event handlers
    const handleFilterChange = useCallback((filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));

        if (filterName === 'heDaoTao') {
            fetchKhoaDaoTao(value);
        } else if (filterName === 'khoaDaoTao') {
            fetchLopByKhoa(value);
        }
    }, [fetchKhoaDaoTao, fetchLopByKhoa]);

    // Thay đổi logic handleNewDataChange để xử lý multiple students
    const handleNewDataChange = useCallback((name, value) => {
        setNewData(prev => ({ ...prev, [name]: value }));
        if (name === 'heDaoTao') {
            fetchKhoaDaoTao(value);
            setNewData(prev => ({ ...prev, khoaDaoTao: "", lopId: "" }));
            setSelectedStudentsForNew([]); // Reset selected students
        } else if (name === 'khoaDaoTao') {
            fetchLopByKhoa(value);
            setNewData(prev => ({ ...prev, lopId: "" }));
            setSelectedStudentsForNew([]); // Reset selected students
        } else if (name === 'lopId') {
            fetchSinhVienTheoLop(value);
            setSelectedStudentsForNew([]); // Reset selected students
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
        
        // Nếu chọn "Tất cả học viên", cần fetch danh sách sinh viên theo lớp
        if (filters.trangThai === "all" && filters.lopId) {
            await fetchSinhVienTheoLop(filters.lopId);
        }
        
        // Fetch chứng chỉ
        await fetchChungChiData();
    }, [fetchChungChiData, fetchSinhVienTheoLop, filters.lopId, filters.trangThai]);

    const handleClearFilter = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            heDaoTao: "",
            khoaDaoTao: "",
            lopId: "",
            searchTerm: "",
            trangThai: "all" // Reset về giá trị mặc định
            // Không reset loaiChungChi vì nó cần giữ giá trị để hiển thị
        }));
        setUi(prev => ({ ...prev, page: 1 }));
        setData(prev => ({ 
            ...prev, 
            khoaDaoTao: [], 
            lopList: prev.originalLopList, 
            sinhVienList: [], // Xóa danh sách để ẩn bảng
            sinhVienTheoLop: [] // Reset danh sách sinh viên theo lớp
        }));
    }, []);

    // Cập nhật handleSubmitNew để xử lý nhiều học viên
    const handleSubmitNew = useCallback(async () => {
        if (selectedStudentsForNew.length === 0) {
            toast.error("Vui lòng chọn ít nhất một học viên");
            return;
        }

        try {
            setUi(prev => ({ ...prev, isLoading: true }));
            
            // Tạo array các promise để submit song song
            const submitPromises = selectedStudentsForNew.map(student => {
                const apiData = {
                    ma_sinh_vien: student.ma_sinh_vien,
                    diem_trung_binh: parseFloat(newData.diem_tb) || null,
                    xep_loai: newData.xep_loai || null,
                    ghi_chu: newData.ghi_chu || null,
                    so_quyet_dinh: newData.so_quyet_dinh || null,
                    loai_chung_chi: newData.loai_chung_chi,
                    ngay_ky_quyet_dinh: newData.ngay_ky_qd || null,
                    tinh_trang: newData.tinh_trang === "Bình thường" ? "bình thường" : "tốt nghiệp"
                };
                return themChungChi(apiData);
            });

            const results = await Promise.allSettled(submitPromises);
            
            // Đếm thành công và thất bại
            const successCount = results.filter(result => 
                result.status === 'fulfilled' && result.value?.thongBao === "Tạo chứng chỉ thành công"
            ).length;
            
            const failureCount = results.length - successCount;
            
            if (successCount > 0) {
                toast.success(`Thêm thành công ${successCount} chứng chỉ!`);
            }
            
            if (failureCount > 0) {
                toast.warning(`${failureCount} chứng chỉ không thể thêm (có thể đã tồn tại)`);
            }

            setUi(prev => ({ ...prev, openDialog: false }));
            setNewData(INIT_NEW_DATA);
            setSelectedStudentsForNew([]);
            fetchChungChiData();
            
        } catch (error) {
            console.error("Lỗi khi thêm chứng chỉ:", error);
            toast.error("Có lỗi xảy ra khi thêm chứng chỉ");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [selectedStudentsForNew, newData, fetchChungChiData]);

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

    // Handler cho sinh viên chưa có chứng chỉ (mở form edit nhưng ở chế độ tạo mới)
    const handleAddChungChi = useCallback((sv) => {
        setEditData({
            id: null, // không có ID chứng chỉ
            ma_sinh_vien: sv.ma_sinh_vien,
            ho_ten: sv.ho_ten,
            diem_tb: "",
            xep_loai: "",
            ghi_chu: "",
            so_quyet_dinh: "",
            ngay_ky_qd: "",
            tinh_trang: "Bình thường",
            loai_chung_chi: filters.loaiChungChi || "",
            sinhVienId: sv.sinhVienId // ID sinh viên gốc
        });
        setIsAddMode(true); // đánh dấu là chế độ thêm mới
        setUi(prev => ({ ...prev, openEditDialog: true }));
    }, [filters.loaiChungChi]);

    // Sửa lại handleEdit để đánh dấu là chế độ edit
    const handleEdit = useCallback((sv) => {
        setEditData({
            id: sv.id,
            ma_sinh_vien: sv.ma_sinh_vien,
            ho_ten: sv.ho_ten,
            diem_tb: sv.diem_tb || "",
            xep_loai: sv.xep_loai || "",
            ghi_chu: sv.ghi_chu || "",
            so_quyet_dinh: sv.so_quyet_dinh || "",
            ngay_ky_qd: sv.ngay_ky_qd || "",
            tinh_trang: sv.tinh_trang || "Bình thường",
            loai_chung_chi: sv.loai_chung_chi || filters.loaiChungChi || "" // Fallback về loaiChungChi hiện tại
        });
        setIsAddMode(false);
        setUi(prev => ({ ...prev, openEditDialog: true }));
    }, [filters.loaiChungChi]);

    // Sửa handleCloseEditDialog để reset isAddMode
    const handleCloseEditDialog = useCallback(() => {
        setUi(prev => ({ ...prev, openEditDialog: false }));
        setEditData(INIT_NEW_DATA);
        setIsAddMode(false);
    }, []);

    const handleEditInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEditAutocompleteChange = useCallback((name, value) => {
        setEditData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Sửa lại handleSubmitEdit để xử lý cả edit và add
    const handleSubmitEdit = useCallback(async () => {
        try {
            setUi(prev => ({ ...prev, isLoading: true }));

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

            let result;
            if (isAddMode) {
                // Tạo mới chứng chỉ
                result = await themChungChi(apiData);
                if (result?.thongBao === "Tạo chứng chỉ thành công") {
                    toast.success("Tạo chứng chỉ thành công!");
                } else {
                    throw new Error(result?.thongBao || "Có lỗi xảy ra");
                }
            } else {
                // Cập nhật chứng chỉ
                result = await suaChungChi(editData.id, apiData);
                if (result?.thongBao === "Chỉnh sửa chứng chỉ thành công") {
                    toast.success("Cập nhật chứng chỉ thành công!");
                } else {
                    throw new Error(result?.thongBao || "Có lỗi xảy ra");
                }
            }

            setUi(prev => ({ ...prev, openEditDialog: false }));
            setEditData(INIT_NEW_DATA);
            setIsAddMode(false);
            fetchChungChiData();
        } catch (error) {
            console.error("Lỗi khi xử lý chứng chỉ:", error);
            toast.error(error?.response?.data?.thongBao || `Không thể ${isAddMode ? 'tạo' : 'cập nhật'} chứng chỉ`);
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [editData, isAddMode, fetchChungChiData]);

    const handleCloseDialog = useCallback(() => {
        setUi(prev => ({ ...prev, openDialog: false }));
        setNewData(INIT_NEW_DATA);
        setSelectedStudentsForNew([]); // Reset selected students
    }, []);

    const formatDate = useCallback((dateString) => dateString || "", []);

    const hasActiveFilters = useMemo(() =>
        !!(filters.heDaoTao && filters.khoaDaoTao && filters.lopId && filters.loaiChungChi),
        [filters.heDaoTao, filters.khoaDaoTao, filters.lopId, filters.loaiChungChi]
    );

    // Thêm các functions để quản lý loại chứng chỉ
    const handleOpenManageTypeDialog = () => {
        setUi(prev => ({ ...prev, openManageTypeDialog: true }));
    };

    const handleCloseManageTypeDialog = () => {
        setUi(prev => ({ ...prev, openManageTypeDialog: false }));
        setNewLoaiChungChi("");
        setIsAddingType(false);
        setXetTotNghiep(false);
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
            const response = await taoLoaiChungChi({
                ten_loai_chung_chi: newLoaiChungChi.trim(),
                xet_tot_nghiep: xetTotNghiep
            });

            if (response.success) {
                // Reload danh sách loại chứng chỉ từ API
                const loaiChungChiRes = await laydanhsachloaichungchi();
                
                // Xử lý cả format cũ và mới
                if ((loaiChungChiRes?.success && loaiChungChiRes.data?.length > 0) || 
                    (loaiChungChiRes?.thongBao === "Lấy danh sách loại chứng chỉ thành công" && loaiChungChiRes.data?.length > 0)) {
                    const loaiChungChiList = loaiChungChiRes.data.map(item => ({
                        id: item.id,
                        value: item.ten_loai_chung_chi,
                        label: item.ten_loai_chung_chi,
                        mo_ta: item.mo_ta,
                        xet_tot_nghiep: item.xet_tot_nghiep,
                        tinh_trang: item.tinh_trang
                    }));
                    setData(prev => ({
                        ...prev,
                        loaiChungChiList
                    }));
                }

                setNewLoaiChungChi("");
                setXetTotNghiep(false);
                toast.success("Thêm loại chứng chỉ thành công");
            } else {
                toast.error("Không thể thêm loại chứng chỉ");
            }
        } catch (error) {
            toast.error("Không thể thêm loại chứng chỉ");
        } finally {
            setIsAddingType(false);
        }
    };

    // Handlers cho chỉnh sửa loại chứng chỉ
    const handleEditLoaiChungChi = (item) => {
        setEditLoaiChungChi({
            id: item.id,
            ten_loai_chung_chi: item.label,
            mo_ta: item.mo_ta || "",
            xet_tot_nghiep: item.xet_tot_nghiep || false,
            tinh_trang: item.tinh_trang || "hoạt động"
        });
        setUi(prev => ({ ...prev, openEditTypeDialog: true }));
    };

    const handleCloseEditTypeDialog = () => {
        setUi(prev => ({ ...prev, openEditTypeDialog: false }));
        setEditLoaiChungChi({
            id: null,
            ten_loai_chung_chi: "",
            mo_ta: "",
            xet_tot_nghiep: false,
            tinh_trang: "hoạt động"
        });
        setIsEditingType(false);
    };

    const handleEditTypeInputChange = (field, value) => {
        setEditLoaiChungChi(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitEditLoaiChungChi = async () => {
        if (!editLoaiChungChi.ten_loai_chung_chi.trim()) {
            toast.error("Vui lòng nhập tên loại chứng chỉ");
            return;
        }

        // Kiểm tra trùng lặp (trừ chính nó)
        const exists = data.loaiChungChiList.some(item => 
            item.value.toLowerCase() === editLoaiChungChi.ten_loai_chung_chi.trim().toLowerCase() 
            && item.id !== editLoaiChungChi.id
        );
        
        if (exists) {
            toast.error("Tên loại chứng chỉ này đã tồn tại");
            return;
        }

        try {
            setIsEditingType(true);
            const response = await capNhatLoaiChungChi(editLoaiChungChi.id, {
                ten_loai_chung_chi: editLoaiChungChi.ten_loai_chung_chi.trim(),
                mo_ta: editLoaiChungChi.mo_ta.trim(),
                xet_tot_nghiep: editLoaiChungChi.xet_tot_nghiep,
                tinh_trang: editLoaiChungChi.tinh_trang
            });

            if (response.success) {
                // Cập nhật danh sách loại chứng chỉ
                setData(prev => ({
                    ...prev,
                    loaiChungChiList: prev.loaiChungChiList.map(item => 
                        item.id === editLoaiChungChi.id 
                            ? { 
                                ...item, 
                                value: editLoaiChungChi.ten_loai_chung_chi.trim(),
                                label: editLoaiChungChi.ten_loai_chung_chi.trim(),
                                mo_ta: editLoaiChungChi.mo_ta.trim(),
                                xet_tot_nghiep: editLoaiChungChi.xet_tot_nghiep,
                                tinh_trang: editLoaiChungChi.tinh_trang
                            }
                            : item
                    )
                }));

                handleCloseEditTypeDialog();
                toast.success("Cập nhật loại chứng chỉ thành công");
            } else {
                toast.error("Không thể cập nhật loại chứng chỉ");
            }
        } catch (error) {
            toast.error("Không thể cập nhật loại chứng chỉ");
        } finally {
            setIsEditingType(false);
        }
    };

    const handleDeleteLoaiChungChi = async (item) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa loại chứng chỉ "${item.label}"?`)) {
            return;
        }

        try {
            const response = await xoaLoaiChungChi(item.id);
            
            if (response.success) {
                // Xóa khỏi danh sách
                setData(prev => ({
                    ...prev,
                    loaiChungChiList: prev.loaiChungChiList.filter(x => x.id !== item.id)
                }));
                
                toast.success("Xóa loại chứng chỉ thành công");
            } else {
                toast.error("Không thể xóa loại chứng chỉ");
            }
        } catch (error) {
            toast.error("Không thể xóa loại chứng chỉ. Có thể loại chứng chỉ này đang được sử dụng.");
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
                    ) : !hasActiveFilters ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                            Vui lòng chọn bộ lọc để hiển thị danh sách
                        </Typography>
                    ) : filteredSinhVien.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                            Không tìm thấy học viên nào
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
                                        <TableRow key={sv.hasChungChi ? sv.id : `no-cert-${sv.ma_sinh_vien}`} sx={{
                                            backgroundColor: sv.hasChungChi 
                                                ? (sv.tinh_trang === 'Tốt nghiệp' || sv.tinh_trang === 'tốt nghiệp' ? '#f0f8ff' : 'inherit')
                                                : '#fffbf0', // màu khác cho sinh viên chưa có chứng chỉ
                                        }}>
                                            <TableCell align="center">{(ui.page - 1) * ui.pageSize + index + 1}</TableCell>
                                            <TableCell>{sv.ma_sinh_vien}</TableCell>
                                            <TableCell>{sv.ho_ten}</TableCell>
                                            <TableCell align="center">{sv.diem_tb || "-"}</TableCell>
                                            <TableCell>{sv.xep_loai || "-"}</TableCell>
                                            <TableCell>
                                                {sv.ghi_chu && sv.ghi_chu.length > 40 ? (
                                                    <Tooltip title={sv.ghi_chu}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {sv.ghi_chu.substring(0, 40)}...
                                                            <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                                                        </Box>
                                                    </Tooltip>
                                                ) : sv.ghi_chu || "-"}
                                            </TableCell>
                                            <TableCell>{sv.so_quyet_dinh || "-"}</TableCell>
                                            <TableCell>{sv.ngay_ky_qd ? formatDate(sv.ngay_ky_qd) : "-"}</TableCell>
                                            <TableCell>
                                                {sv.hasChungChi ? (
                                                    <Box sx={{
                                                        color: (sv.tinh_trang === 'Tốt nghiệp' || sv.tinh_trang === 'tốt nghiệp') ? '#2e7d32' : '#1976d2',
                                                        fontWeight: 'medium'
                                                    }}>
                                                        {sv.tinh_trang}
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ color: '#f57c00', fontWeight: 'medium', fontStyle: 'italic' }}>
                                                        Chưa có chứng chỉ
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {sv.hasChungChi ? (
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleEdit(sv)}
                                                        disabled={ui.isLoading}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleAddChungChi(sv)}
                                                        disabled={ui.isLoading}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {sv.hasChungChi && (
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDelete(sv.id)}
                                                        disabled={ui.isLoading}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
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
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={data.sinhVienTheoLop}
                                getOptionLabel={(option) => `${option.ho_dem} ${option.ten} (${option.ma_sinh_vien})`}
                                value={selectedStudentsForNew}
                                onChange={(event, newValue) => setSelectedStudentsForNew(newValue)}
                                renderOption={(props, option, { selected }) => (
                                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                        <Checkbox
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        <Box>
                                            <Typography variant="body2">
                                                {option.ho_dem} {option.ten}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Mã SV: {option.ma_sinh_vien}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Box
                                            key={option.id}
                                            {...getTagProps({ index })}
                                            sx={{
                                                backgroundColor: '#e3f2fd',
                                                border: '1px solid #1976d2',
                                                borderRadius: 1,
                                                px: 1,
                                                py: 0.5,
                                                m: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <Typography variant="caption">
                                                {option.ten} ({option.ma_sinh_vien})
                                            </Typography>
                                            <Box
                                                component="span"
                                                onClick={() => {
                                                    setSelectedStudentsForNew(prev => 
                                                        prev.filter(s => s.id !== option.id)
                                                    );
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    color: '#1976d2',
                                                    '&:hover': { color: '#d32f2f' },
                                                    fontWeight: 'bold',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                ×
                                            </Box>
                                        </Box>
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Chọn học viên"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        placeholder="Nhập tên hoặc mã học viên để tìm..."
                                        helperText={`Đã chọn ${selectedStudentsForNew.length} học viên`}
                                    />
                                )}
                                filterOptions={(options, { inputValue }) => {
                                    const searchTerm = inputValue.toLowerCase();
                                    return options.filter(option =>
                                        `${option.ho_dem} ${option.ten}`.toLowerCase().includes(searchTerm) ||
                                        option.ma_sinh_vien.toLowerCase().includes(searchTerm)
                                    );
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                disableCloseOnSelect
                                selectOnFocus
                                clearOnBlur
                                handleHomeEndKeys
                                disabled={!newData.lopId || ui.isLoading}
                                noOptionsText="Không tìm thấy học viên"
                                loadingText="Đang tải..."
                                sx={{
                                    '& .MuiAutocomplete-inputRoot': {
                                        minHeight: '60px',
                                        alignItems: 'flex-start',
                                        paddingTop: '8px'
                                    }
                                }}
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
                        disabled={ui.isLoading || selectedStudentsForNew.length === 0 || !newData.loai_chung_chi}
                    >
                        {ui.isLoading ? <CircularProgress size={20} /> : `Thêm cho ${selectedStudentsForNew.length} học viên`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog chỉnh sửa chứng chỉ */}
            <Dialog open={ui.openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    {isAddMode ? "Thêm chứng chỉ cho sinh viên" : "Chỉnh sửa thông tin chứng chỉ"}
                </DialogTitle>
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
                        disabled={ui.isLoading || !editData.ma_sinh_vien || !editData.loai_chung_chi}
                    >
                        {ui.isLoading ? <CircularProgress size={20} /> : (isAddMode ? "Tạo mới" : "Cập nhật")}
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
                            <Grid container spacing={2} alignItems="flex-start">
                                <Grid item xs={12} md={8}>
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
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={xetTotNghiep}
                                                    onChange={(e) => setXetTotNghiep(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Xét tốt nghiệp"
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
                                </Grid>
                            </Grid>
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
                                                <TableCell sx={{ fontWeight: "bold", color: 'white', width: '120px' }}>Tình trạng</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", color: 'white', width: '120px' }}>Xét tốt nghiệp</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", color: 'white', width: '140px' }}>Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.loaiChungChiList.map((item, index) => (
                                                <TableRow
                                                    key={item.id || item.value}
                                                    sx={{
                                                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'inherit',
                                                        '&:hover': { backgroundColor: '#f0f0f0' }
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: 'medium' }}>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {item.label}
                                                        </Typography>
                                                        {item.mo_ta && (
                                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                {item.mo_ta}
                                                            </Typography>
                                                        )}
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
                                                            bgcolor: item.tinh_trang === 'hoạt động' ? '#4caf50' : '#f44336'
                                                        }}>
                                                            {item.tinh_trang === 'hoạt động' ? 'Hoạt động' : 'Tạm dừng'}
                                                        </Box>
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
                                                            bgcolor: item.xet_tot_nghiep ? '#2196f3' : '#9e9e9e'
                                                        }}>
                                                            {item.xet_tot_nghiep ? 'Có' : 'Không'}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="Chỉnh sửa">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditLoaiChungChi(item)}
                                                                    sx={{
                                                                        color: '#1976d2',
                                                                        '&:hover': {
                                                                            backgroundColor: '#e3f2fd'
                                                                        }
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Xóa">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteLoaiChungChi(item)}
                                                                    sx={{
                                                                        color: '#d32f2f',
                                                                        '&:hover': {
                                                                            backgroundColor: '#ffebee'
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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

            {/* Dialog chỉnh sửa loại chứng chỉ */}
            <Dialog open={ui.openEditTypeDialog} onClose={handleCloseEditTypeDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    <Typography variant="h6" component="span">Chỉnh sửa loại chứng chỉ</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Tên loại chứng chỉ"
                                    variant="outlined"
                                    value={editLoaiChungChi.ten_loai_chung_chi}
                                    onChange={(e) => handleEditTypeInputChange('ten_loai_chung_chi', e.target.value)}
                                    disabled={isEditingType}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Mô tả"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    value={editLoaiChungChi.mo_ta}
                                    onChange={(e) => handleEditTypeInputChange('mo_ta', e.target.value)}
                                    disabled={isEditingType}
                                    placeholder="Nhập mô tả cho loại chứng chỉ (tùy chọn)"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={editLoaiChungChi.xet_tot_nghiep}
                                            onChange={(e) => handleEditTypeInputChange('xet_tot_nghiep', e.target.checked)}
                                            disabled={isEditingType}
                                            color="primary"
                                        />
                                    }
                                    label="Xét tốt nghiệp"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" disabled={isEditingType}>
                                    <InputLabel>Tình trạng</InputLabel>
                                    <Select
                                        value={editLoaiChungChi.tinh_trang}
                                        onChange={(e) => handleEditTypeInputChange('tinh_trang', e.target.value)}
                                        label="Tình trạng"
                                    >
                                        <MenuItem value="hoạt động">Hoạt động</MenuItem>
                                        <MenuItem value="tạm dừng">Tạm dừng</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Button
                        onClick={handleCloseEditTypeDialog}
                        disabled={isEditingType}
                        sx={{ minWidth: 100 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmitEditLoaiChungChi}
                        variant="contained"
                        disabled={isEditingType || !editLoaiChungChi.ten_loai_chung_chi.trim()}
                        sx={{ minWidth: 120 }}
                    >
                        {isEditingType ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default QuanLyChungChi;