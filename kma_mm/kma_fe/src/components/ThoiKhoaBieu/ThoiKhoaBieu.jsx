
import { useState, useEffect } from "react";
import {
    Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container, Dialog,
    DialogTitle, DialogContent, DialogActions, Card, CardContent, CardActions, IconButton, createTheme,
    ThemeProvider, TextField, InputAdornment, Autocomplete, Pagination as MuiPagination, Checkbox, List, ListItem, ListItemText
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { getMonHoc, themThoiKhoaBieu, updateThoiKhoaBieu, xoaThoiKhoaBieu } from "../../Api_controller/Service/monHocService";
import { getGiangVien } from "../../Api_controller/Service/giangVienService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import {
    fetchThoiKhoaBieuByPage, fetchThoiKhoaBieuByFilter, fetchLopByKhoaDaoTao,
    fetchMonHocByHeDaoTao, fetchKeHoachMonHoc
} from "../../Api_controller/Service/thoiKhoaBieuService";
import { toast } from "react-toastify";

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        background: { default: '#f5f5f5' }
    },
    typography: { fontFamily: 'Roboto, Arial, sans-serif' }
});

const ThoiKhoaBieu = () => {
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editId, setEditId] = useState(null);

    const [kyHoc, setKyHoc] = useState("");
    const [lopId, setLopId] = useState("");
    const [monHocId, setMonHocId] = useState("");
    const [giangVienId, setGiangVienId] = useState("");
    const [giangVien, setGiangVien] = useState("");
    const [phongHoc, setPhongHoc] = useState("");
    const [tietHoc, setTietHoc] = useState("");
    const [trangThai, setTrangThai] = useState(1);
    const [khoaDaoTaoId, setKhoaDaoTaoId] = useState("");
    const [heDaoTaoId, setHeDaoTaoId] = useState("");
    const [HeDaoTao, setHeDaoTao] = useState([]);
    const [khoaDaoTao, setKhoaDaoTao] = useState([]);
    const [kyHocOptionsForm, setKyHocOptionsForm] = useState([]);
    const [kyHocOptionsFilter, setKyHocOptionsFilter] = useState([]);
    const [useKeHoachDaoTao, setUseKeHoachDaoTao] = useState(false);
    const [keHoachMonHocList, setKeHoachMonHocList] = useState([]);
    const [selectedMonHocIds, setSelectedMonHocIds] = useState([]); // Danh sách môn học được chọn

    const [trangThaiOptions] = useState([
        { value: 1, label: "Hoạt động" },
        { value: 0, label: "Không hoạt động" }
    ]);

    const [lopSearch, setLopSearch] = useState("");
    const [monHocSearch, setMonHocSearch] = useState("");
    const [giangVienSearch, setGiangVienSearch] = useState("");

    const [originalLopList, setOriginalLopList] = useState([]);
    const [lopList, setLopList] = useState([]);
    const [monHocList, setMonHocList] = useState([]);
    const [monHocListForm, setMonHocListForm] = useState([]);
    const [giangVienList, setGiangVienList] = useState([]);
    const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);
    const [khoaDaoTaoList, setKhoaDaoTaoList] = useState([]);
    const [lopListView, setLopListView] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
    const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
    const [kyHocFilter, setKyHocFilter] = useState("");
    const [lopIdFilter, setLopIdFilter] = useState("");
    const [monHocIdFilter, setMonHocIdFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(6);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [heDaoTao, giangVien, khoaDaoTao, monHoc, lop, thoiKhoaBieu] = await Promise.all([
                    fetchDanhSachHeDaoTao(),
                    getGiangVien(),
                    getDanhSachKhoaDaoTao(),
                    getMonHoc(),
                    getDanhSachLop(),
                    fetchThoiKhoaBieuByPage(page, pageSize)
                ]);
                setHeDaoTao(heDaoTao);
                setGiangVienList(giangVien);
                setKhoaDaoTaoList(khoaDaoTao);
                setMonHocList(monHoc);
                setMonHocListForm(monHoc);
                setOriginalLopList(lop);
                setLopList(lop);
                setLopListView(lop);
                setThoiKhoaBieuList(thoiKhoaBieu.data || []);
                setTotalPages(thoiKhoaBieu.totalPages || 1);
                console.log("monhoclist>>", monHocList);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchThoiKhoaBieu = async () => {
        try {
            let data;
            if (kyHocFilter || lopIdFilter || monHocIdFilter) {
                data = await fetchThoiKhoaBieuByFilter(page, pageSize, kyHocFilter, lopIdFilter, monHocIdFilter);
            } else {
                data = await fetchThoiKhoaBieuByPage(page, pageSize);
            }
            setThoiKhoaBieuList(data.data || []);
            setTotalPages(data.totalPages || 1);
            return data.data;
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu thời khóa biểu:", error);
            return [];
        }
    };

    const fetchKeHoachMonHocData = async (khoaDaoTaoId, kyHoc) => {
        try {
            const data = await fetchKeHoachMonHoc(khoaDaoTaoId, kyHoc);
            const enrichedData = data.map(item => ({
                ...item,
                ten_mon_hoc: monHocList.find(mon => mon.id === item.mon_hoc_id)?.ten_mon_hoc || "Môn học không xác định"
            }));
            setKeHoachMonHocList(enrichedData);
        } catch (error) {
            console.error("Lỗi khi lấy kế hoạch môn học:", error);
            setKeHoachMonHocList([]);
        }
    };

    useEffect(() => {
        if (heDaoTaoFilter) {
            getDanhSachKhoaDaoTaobyId(heDaoTaoFilter).then(setKhoaDaoTao);
            fetchMonHocByHeDaoTao(heDaoTaoFilter).then(setMonHocListForm);
        } else {
            setKhoaDaoTao([]);
            setKyHocOptionsFilter([]);
            setLopList(originalLopList);
            setLopListView(originalLopList);
            setMonHocListForm(monHocList);
        }
    }, [heDaoTaoFilter, originalLopList, monHocList]);

    useEffect(() => {
        if (heDaoTaoId) {
            getDanhSachKhoaDaoTaobyId(heDaoTaoId).then(setKhoaDaoTao);
            fetchMonHocByHeDaoTao(heDaoTaoId).then(setMonHocListForm);
        } else {
            setKhoaDaoTao([]);
            setKyHocOptionsForm([]);
            setLopList(originalLopList);
            setMonHocListForm(monHocList);
        }
    }, [heDaoTaoId, originalLopList, monHocList]);

    useEffect(() => {
        if (khoaDaoTaoFilter) {
            const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
            if (selectedKhoa) {
                const kyHocCount = selectedKhoa.so_ky_hoc;
                const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
                setKyHocOptionsFilter(kyHocArray);
                fetchLopByKhoaDaoTao(khoaDaoTaoFilter).then(data => {
                    setLopList(data);
                    setLopListView(data);
                });
            }
        } else {
            setKyHocOptionsFilter([]);
            setLopList(originalLopList);
            setLopListView(originalLopList);
        }
    }, [khoaDaoTaoFilter, khoaDaoTao, originalLopList]);

    useEffect(() => {
        if (khoaDaoTaoId) {
            const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoId);
            if (selectedKhoa) {
                const kyHocCount = selectedKhoa.so_ky_hoc;
                const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
                setKyHocOptionsForm(kyHocArray);
                fetchLopByKhoaDaoTao(khoaDaoTaoId).then(setLopList);
            }
        } else {
            setKyHocOptionsForm([]);
            setLopList(originalLopList);
        }
    }, [khoaDaoTaoId, khoaDaoTao, originalLopList]);

    useEffect(() => {
        if (useKeHoachDaoTao && khoaDaoTaoId && kyHoc && editId === null) {
            fetchKeHoachMonHocData(khoaDaoTaoId, kyHoc);
        } else {
            setKeHoachMonHocList([]);
        }
    }, [useKeHoachDaoTao, khoaDaoTaoId, kyHoc, editId]);

    useEffect(() => {
        fetchThoiKhoaBieu();
    }, [page, kyHocFilter, lopIdFilter, monHocIdFilter]);

    const handlePageChange = (event, value) => setPage(value);
    const handlekhoaChange = (event) => setKhoaDaoTaoId(event.target.value);
    const handleKyHocChange = (event) => setKyHoc(event.target.value);
    const handleHeDaoTaoChange = (event) => setHeDaoTaoId(event.target.value);
    const handleLopChange = (event) => setLopId(event.target.value);
    const handleMonHocChange = (event) => setMonHocId(event.target.value); // Không còn dùng nữa, giữ lại để tương thích
    const handleGiangVienChange = (event) => {
        const selectedId = event.target.value;
        setGiangVienId(selectedId);
        const selectedGV = giangVienList.find(gv => gv.id === selectedId);
        setGiangVien(selectedGV ? selectedGV.ho_ten : "");
    };
    const handleTrangThaiChange = (event) => setTrangThai(event.target.value);
    const handleUseKeHoachDaoTaoChange = (event) => setUseKeHoachDaoTao(event.target.checked);

    const filteredLopList = lopList.filter(lop => lop.ma_lop.toLowerCase().includes(lopSearch.toLowerCase()));
    const filteredMonHocList = monHocListForm.filter(monHoc => monHoc.ten_mon_hoc.toLowerCase().includes(monHocSearch.toLowerCase()));
    const filteredGiangVienList = giangVienList.filter(giangVien => giangVien.ho_ten.toLowerCase().includes(giangVienSearch.toLowerCase()));
    const role = localStorage.getItem("role") || "";

    const handleSubmit = async () => {
        if (lopId && kyHoc && selectedMonHocIds.length > 0) {
            setIsLoading(true);
            try {
                if (editId !== null) {
                    // Chỉnh sửa một thời khóa biểu
                    const thoiKhoaBieuData = {
                        ky_hoc: kyHoc,
                        lop_id: lopId,
                        mon_hoc_id: selectedMonHocIds[0], // Chỉ một môn khi chỉnh sửa
                        giang_vien_id: giangVienId,
                        giang_vien: giangVien,
                        phong_hoc: phongHoc,
                        tiet_hoc: tietHoc,
                        trang_thai: trangThai,
                    };
                    await updateThoiKhoaBieu(editId, thoiKhoaBieuData);
                    toast.success("Cập nhật thời khóa biểu thành công!");
                } else {
                    // Tạo mới nhiều thời khóa biểu
                    const createPromises = selectedMonHocIds.map((monHocId) => {
                        const thoiKhoaBieuData = {
                            ky_hoc: kyHoc,
                            lop_id: lopId,
                            mon_hoc_id: monHocId,
                            giang_vien_id: giangVienId,
                            giang_vien: giangVien,
                            phong_hoc: phongHoc,
                            tiet_hoc: tietHoc,
                            trang_thai: trangThai,
                        };
                        return themThoiKhoaBieu(thoiKhoaBieuData);
                    });
                    await Promise.all(createPromises);
                    toast.success("Thêm thời khóa biểu thành công!");
                }
                await fetchThoiKhoaBieu();
                resetForm();
            } catch (error) {
                console.error("Lỗi khi lưu thời khóa biểu:", error);
                toast.error("Lỗi khi lưu thời khóa biểu. Vui lòng thử lại!");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const resetForm = () => {
        setGiangVienId("");
        setGiangVien("");
        setPhongHoc("");
        setTietHoc("");
        setTrangThai(1);
        setKyHoc("");
        setLopId("");
        setHeDaoTaoId("")//
        setKhoaDaoTaoId("")//
        setHeDaoTaoFilter("")
        setMonHocId("");
        setSelectedMonHocIds([]); // Reset danh sách môn học được chọn
        setKyHocOptionsForm([]);
        setLopSearch("");
        setMonHocSearch("");
        setGiangVienSearch("");
        setEditIndex(null);
        setEditId(null);
        setOpen(false);
        setUseKeHoachDaoTao(false);
        setKeHoachMonHocList([]);
        setLopList(originalLopList);
    };

    const handleOpenForm = () => {
        setGiangVienId("");
        setGiangVien("");
        setPhongHoc("");
        setTietHoc("");
        setTrangThai(1);
        setKyHoc(kyHocFilter || "");
        setLopId(lopIdFilter || "");
        setMonHocId(monHocIdFilter || "");
        setSelectedMonHocIds(monHocIdFilter ? [monHocIdFilter] : []);
        setEditIndex(null);
        setEditId(null);
        setUseKeHoachDaoTao(false);
        setKeHoachMonHocList([]);

        if (heDaoTaoFilter && !heDaoTaoId) setHeDaoTaoId(heDaoTaoFilter);
        if (khoaDaoTaoFilter && !khoaDaoTaoId) setKhoaDaoTaoId(khoaDaoTaoFilter);

        if (heDaoTaoFilter) {
            fetchMonHocByHeDaoTao(heDaoTaoFilter).then(setMonHocListForm);
        }
        if (khoaDaoTaoFilter) {
            fetchLopByKhoaDaoTao(khoaDaoTaoFilter).then(setLopList);
            const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
            if (selectedKhoa) {
                const kyHocCount = selectedKhoa.so_ky_hoc;
                const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
                setKyHocOptionsForm(kyHocArray);
            }
        }
        setOpen(true);
    };

    const handleEdit = async (tkb, index) => {
        setKyHoc(tkb.ky_hoc || "");
        setLopId(tkb.lop_id || "");
        setMonHocId(tkb.mon_hoc_id || "");
        setSelectedMonHocIds([tkb.mon_hoc_id]);
        setGiangVienId(tkb.giang_vien_id || "");
        setGiangVien(tkb.giang_vien || "");
        setPhongHoc(tkb.phong_hoc || "");
        setTietHoc(tkb.tiet_hoc || "");
        setTrangThai(tkb.trang_thai !== undefined ? tkb.trang_thai : 1);
        setEditIndex(index);
        setEditId(tkb.id);

        try {
            const monHoc = monHocList.find(m => m.id === tkb.mon_hoc_id);
            if (monHoc && monHoc.he_dao_tao_id) {
                setHeDaoTaoId(monHoc.he_dao_tao_id);
                await fetchMonHocByHeDaoTao(monHoc.he_dao_tao_id).then(setMonHocListForm);
            } else {
                toast.warn("Không tìm thấy hệ đào tạo cho môn học này!");
                setHeDaoTaoId("");
            }

            const selectedLop = originalLopList.find(lop => lop.id === tkb.lop_id);
            let khoaDaoTaoIdFromData = tkb.khoa_dao_tao_id;
            if (!khoaDaoTaoIdFromData && selectedLop && selectedLop.khoa_dao_tao_id) {
                khoaDaoTaoIdFromData = selectedLop.khoa_dao_tao_id;
            }

            if (khoaDaoTaoIdFromData) {
                setKhoaDaoTaoId(khoaDaoTaoIdFromData);
                if (monHoc && monHoc.he_dao_tao_id) {
                    const khoaDaoTaoData = await getDanhSachKhoaDaoTaobyId(monHoc.he_dao_tao_id);
                    setKhoaDaoTao(khoaDaoTaoData);
                    const selectedKhoa = khoaDaoTaoData.find(khoa => khoa.id === khoaDaoTaoIdFromData);
                    if (selectedKhoa) {
                        const kyHocCount = selectedKhoa.so_ky_hoc;
                        const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
                        if (!kyHocArray.includes(Number(tkb.ky_hoc))) {
                            kyHocArray.push(Number(tkb.ky_hoc));
                            kyHocArray.sort((a, b) => a - b);
                        }
                        setKyHocOptionsForm(kyHocArray);
                    } else {
                        setKyHocOptionsForm([Number(tkb.ky_hoc)]);
                    }
                }
                await fetchLopByKhoaDaoTao(khoaDaoTaoIdFromData).then(setLopList);
            } else {
                toast.warn("Không tìm thấy khóa đào tạo cho lớp này!");
                setKhoaDaoTaoId("");
                setKyHocOptionsForm([Number(tkb.ky_hoc)]);
                setLopList(originalLopList);
            }
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu chỉnh sửa. Vui lòng thử lại!");
            setKyHocOptionsForm([Number(tkb.ky_hoc)]);
        }

        setOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await xoaThoiKhoaBieu(id);
            fetchThoiKhoaBieu();
            toast.success("Xóa thời khóa biểu thành công!");
        } catch (error) {
            toast.error("Lỗi khi xóa thời khóa biểu. Vui lòng thử lại!");
        }
    };
    const findLopName = (id) => originalLopList.find(item => item.id === id)?.ma_lop || "Lớp không xác định";
    const findMonHoc = (id) => monHocList.find(item => item.id === id) || { ten_mon_hoc: "Môn học không xác định", ma_mon_hoc: "N/A", so_tin_chi: "N/A", tinh_diem: "N/A", he_dao_tao_id: null, ghi_chu: "N/A" };
    const findGiangVienName = (id) => giangVienList.find(item => item.id === id)?.ho_ten || "Giảng viên không xác định";
    const findHeDaoTaoName = (id) => HeDaoTao.find(item => item.id === id)?.ten_he_dao_tao || "Hệ đào tạo không xác định";

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" gutterBottom textAlign="center">
                        Thời Khóa Biểu
                    </Typography>

                    <Box textAlign="center" my={2}>
                        {role !== "examination" && (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
                                Thêm Thời Khóa Biểu
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, maxWidth: 1200, backgroundColor: "#fff" }}>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Hệ đào tạo</InputLabel>
                                    <Select value={heDaoTaoFilter} onChange={(e) => setHeDaoTaoFilter(e.target.value)} label="Hệ đào tạo">
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {HeDaoTao.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.ten_he_dao_tao}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Khóa đào tạo</InputLabel>
                                    <Select value={khoaDaoTaoFilter} onChange={(e) => setKhoaDaoTaoFilter(e.target.value)} label="Khóa đào tạo" disabled={!heDaoTaoFilter}>
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {khoaDaoTao.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.ten_khoa}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Kỳ học</InputLabel>
                                    <Select value={kyHocFilter} onChange={(e) => setKyHocFilter(e.target.value)} label="Kỳ học" disabled={!khoaDaoTaoFilter}>
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {kyHocOptionsFilter.map((option) => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Lớp</InputLabel>
                                    <Select value={lopIdFilter} onChange={(e) => setLopIdFilter(e.target.value)} label="Lớp">
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {lopListView.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.ma_lop}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Môn học</InputLabel>
                                    <Select value={monHocIdFilter} onChange={(e) => setMonHocIdFilter(e.target.value)} label="Môn học" disabled={!heDaoTaoFilter}>
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {monHocListForm.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>{item.ten_mon_hoc}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} textAlign="center">
                                <Button
                                    variant="contained"
                                    sx={{
                                        minWidth: 180,
                                        textTransform: "none",
                                        mt: 2,
                                        backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#d32f2f" : "#1976d2",
                                        "&:hover": { backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#b71c1c" : "#115293" }
                                    }}
                                    onClick={() => {
                                        if (kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter) {
                                            setKyHocFilter("");
                                            setLopIdFilter("");
                                            setHeDaoTaoFilter("");
                                            setKhoaDaoTaoFilter("");
                                            setMonHocIdFilter("");
                                            setLopList(originalLopList);
                                            setLopListView(originalLopList);
                                            setMonHocListForm(monHocList);
                                            fetchThoiKhoaBieu();
                                        } else {
                                            fetchThoiKhoaBieu();
                                        }
                                    }}
                                >
                                    {kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "Hủy Bộ Lọc" : "Áp Dụng"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {isLoading ? (
                        <Typography variant="body1" textAlign="center" sx={{ my: 4 }}>Đang tải dữ liệu...</Typography>
                    ) : thoiKhoaBieuList.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                            Chưa có thời khóa biểu nào được thêm
                        </Typography>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            {thoiKhoaBieuList.map((tkb, index) => {
                                const monHoc = findMonHoc(tkb.mon_hoc_id);
                                return (
                                    <Grid item xs={12} sm={4} md={3} key={tkb.id || index}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" color="primary" gutterBottom>
                                                    {monHoc.ten_mon_hoc}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Mã môn học:</strong> {monHoc.ma_mon_hoc}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Số tín chỉ:</strong> {monHoc.so_tin_chi}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Tính điểm:</strong> {monHoc.tinh_diem === 1 ? "Có" : "Không"}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Hệ đào tạo:</strong> {findHeDaoTaoName(monHoc.he_dao_tao_id)}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Ghi chú:</strong> {monHoc.ghi_chu}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Lớp:</strong> {findLopName(tkb.lop_id)}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Kỳ học:</strong> {tkb.ky_hoc || "Chưa xác định"}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Giảng viên:</strong> {tkb.giang_vien || findGiangVienName(tkb.giang_vien_id)}
                                                </Typography>
                                                {tkb.phong_hoc && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        <strong>Phòng học:</strong> {tkb.phong_hoc}
                                                    </Typography>
                                                )}
                                                {tkb.tiet_hoc && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        <strong>Tiết học:</strong> {tkb.tiet_hoc}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Trạng thái:</strong> {tkb.trang_thai === 1 ? "Hoạt động" : "Không hoạt động"}
                                                </Typography>
                                            </CardContent>
                                            {role !== "examination" && (
                                                <CardActions sx={{ justifyContent: "center" }}>
                                                    <IconButton color="primary" size="small" onClick={() => handleEdit(tkb, index)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton color="error" size="small" onClick={() => handleDelete(tkb.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </CardActions>
                                            )}
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Paper>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <MuiPagination
                        color="primary"
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        variant="outlined"
                        shape="rounded"
                    />
                </Box>
            </Container>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editId !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel sx={{ backgroundColor: "white" }}>Hệ đào tạo</InputLabel>
                                <Select value={heDaoTaoId} onChange={handleHeDaoTaoChange}>
                                    <MenuItem value="">Chọn hệ đào tạo</MenuItem>
                                    {HeDaoTao?.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>{option.ten_he_dao_tao}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel sx={{ backgroundColor: "white" }}>Khóa đào tạo</InputLabel>
                                <Select value={khoaDaoTaoId} onChange={handlekhoaChange} disabled={!heDaoTaoId}>
                                    <MenuItem value="">Chọn khóa đào tạo</MenuItem>
                                    {khoaDaoTao.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>{option.ten_khoa} | niên khóa {option.nam_hoc}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel sx={{ backgroundColor: "white" }}>Kỳ học</InputLabel>
                                <Select value={kyHoc} onChange={handleKyHocChange} disabled={!khoaDaoTaoId}>
                                    <MenuItem value="">Chọn kỳ học</MenuItem>
                                    {kyHocOptionsForm.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Lớp</InputLabel>
                                <Select
                                    value={lopId}
                                    onChange={handleLopChange}
                                    label="Lớp"
                                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                                >
                                    <MenuItem value="">Chọn lớp</MenuItem>
                                    {filteredLopList.map((lop) => (
                                        <MenuItem key={lop.id} value={lop.id}>{lop.ma_lop}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Tìm kiếm lớp..."
                                value={lopSearch}
                                onChange={(e) => setLopSearch(e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                    </Grid>

                    {editId === null && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center">
                                    <Checkbox
                                        checked={useKeHoachDaoTao}
                                        onChange={handleUseKeHoachDaoTaoChange}
                                        disabled={!khoaDaoTaoId || !kyHoc}
                                    />
                                    <Typography>Dùng phương án bên kế hoạch đào tạo</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    {editId === null && useKeHoachDaoTao ? (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Danh sách môn học từ kế hoạch đào tạo:</Typography>
                            {keHoachMonHocList.length > 0 ? (
                                <List dense>
                                    {keHoachMonHocList.map((mon) => (
                                        <ListItem key={mon.id}>
                                            <Checkbox
                                                checked={selectedMonHocIds.includes(mon.mon_hoc_id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedMonHocIds([...selectedMonHocIds, mon.mon_hoc_id]);
                                                    } else {
                                                        setSelectedMonHocIds(selectedMonHocIds.filter((id) => id !== mon.mon_hoc_id));
                                                    }
                                                }}
                                            />
                                            <ListItemText
                                                primary={mon.ten_mon_hoc}
                                                secondary={`Bắt buộc: ${mon.bat_buoc ? "Có" : "Không"}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="textSecondary">Không có môn học nào trong kế hoạch.</Typography>
                            )}
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={8}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Môn học</InputLabel>
                                        <Select
                                            multiple
                                            value={selectedMonHocIds}
                                            onChange={(e) => setSelectedMonHocIds(e.target.value)}
                                            label="Môn học"
                                            disabled={editId !== null} // Chỉ cho phép chọn một môn khi chỉnh sửa
                                            renderValue={(selected) => selected.map(id => filteredMonHocList.find(m => m.id === id)?.ten_mon_hoc || "").join(", ")}
                                        >
                                            {filteredMonHocList.map((monHoc) => (
                                                <MenuItem key={monHoc.id} value={monHoc.id}>
                                                    <Checkbox checked={selectedMonHocIds.includes(monHoc.id)} />
                                                    <ListItemText primary={monHoc.ten_mon_hoc} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Tìm kiếm môn học..."
                                        value={monHocSearch}
                                        onChange={(e) => setMonHocSearch(e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={8}>
                                    <Autocomplete
                                        freeSolo
                                        options={filteredGiangVienList}
                                        getOptionLabel={(option) => option.ho_ten}
                                        value={filteredGiangVienList.find((g) => g.id === giangVienId) || null}
                                        onChange={(event, newValue) => handleGiangVienChange({ target: { value: newValue ? newValue.id : "" } })}
                                        renderInput={(params) => <TextField {...params} label="Giảng viên" fullWidth size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Tìm kiếm giảng viên..."
                                        value={giangVienSearch}
                                        onChange={(e) => setGiangVienSearch(e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phòng học"
                                        value={phongHoc}
                                        onChange={(e) => setPhongHoc(e.target.value)}
                                        placeholder="Ví dụ: 103 TA1"
                                        margin="dense"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Tiết học"
                                        value={tietHoc}
                                        onChange={(e) => setTietHoc(e.target.value)}
                                        placeholder="Ví dụ: 2-4"
                                        margin="dense"
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}

                    <FormControl fullWidth margin="dense">
                        <InputLabel sx={{ backgroundColor: "white" }}>Trạng thái</InputLabel>
                        <Select value={trangThai} onChange={handleTrangThaiChange}>
                            {trangThaiOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetForm} color="secondary">Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={!lopId || !kyHoc || selectedMonHocIds.length === 0 || isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : (editId !== null ? "Cập nhật" : "Xác nhận")}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default ThoiKhoaBieu;