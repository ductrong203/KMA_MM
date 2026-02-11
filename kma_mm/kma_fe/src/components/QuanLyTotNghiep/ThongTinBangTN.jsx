import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid,
    TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, CircularProgress, Tooltip, createTheme, ThemeProvider
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import { fetchLopByKhoaDaoTao } from "../../Api_controller/Service/thoiKhoaBieuService";
import { getGraduationList, batchUpdateDiploma } from "../../Api_controller/Service/totNghiepService";
import { toast } from "react-toastify";

const theme = createTheme({
    palette: { primary: { main: '#1976d2' }, background: { default: '#f5f5f5' } },
    typography: { fontFamily: 'Roboto, Arial, sans-serif' }
});

const ThongTinBangTN = () => {
    // Filter state
    const [filters, setFilters] = useState({ heDaoTao: "", khoaDaoTao: "", lopId: "" });

    // Data
    const [data, setData] = useState({ heDaoTao: [], khoaDaoTao: [], lopList: [] });
    const [graduationList, setGraduationList] = useState([]);

    // Editable state — keyed by graduation id
    const [editValues, setEditValues] = useState({});

    // Batch inputs
    const [batchNgayCapBang, setBatchNgayCapBang] = useState("");
    const [batchSoVaoSo, setBatchSoVaoSo] = useState("");

    // Selection
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // UI
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ---- Data fetching ----
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await fetchDanhSachHeDaoTao();
                setData(prev => ({ ...prev, heDaoTao: res || [] }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchInitial();
    }, []);

    useEffect(() => {
        if (!filters.heDaoTao) {
            setData(prev => ({ ...prev, khoaDaoTao: [], lopList: [] }));
            return;
        }
        const fetch = async () => {
            try {
                const res = await getDanhSachKhoaDaoTaobyId(filters.heDaoTao);
                setData(prev => ({ ...prev, khoaDaoTao: res || [], lopList: [] }));
            } catch (err) { console.error(err); }
        };
        fetch();
    }, [filters.heDaoTao]);

    useEffect(() => {
        if (!filters.khoaDaoTao) {
            setData(prev => ({ ...prev, lopList: [] }));
            return;
        }
        const fetch = async () => {
            try {
                const res = await fetchLopByKhoaDaoTao(filters.khoaDaoTao);
                setData(prev => ({ ...prev, lopList: res || [] }));
            } catch (err) { console.error(err); }
        };
        fetch();
    }, [filters.khoaDaoTao]);

    const fetchGraduations = useCallback(async () => {
        if (!filters.lopId) {
            setGraduationList([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await getGraduationList({
                lop_id: filters.lopId,
                trang_thai: 'da_duyet'
            });
            const list = res?.data || [];
            setGraduationList(list);

            // Initialize edit values from current data
            const initEdit = {};
            list.forEach(g => {
                initEdit[g.id] = {
                    so_hieu_bang: g.so_hieu_bang || "",
                    so_vao_so: g.so_vao_so || "",
                    ngay_cap_bang: g.ngay_cap_bang ? g.ngay_cap_bang.substring(0, 10) : ""
                };
            });
            setEditValues(initEdit);
            setSelectedIds([]);
            setSelectAll(false);
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi lấy danh sách tốt nghiệp");
        } finally {
            setIsLoading(false);
        }
    }, [filters.lopId]);

    useEffect(() => {
        fetchGraduations();
    }, [fetchGraduations]);

    // ---- Handlers ----
    const handleFilterChange = (field, value) => {
        setFilters(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'heDaoTao') { next.khoaDaoTao = ""; next.lopId = ""; }
            if (field === 'khoaDaoTao') { next.lopId = ""; }
            return next;
        });
    };

    const handleEditChange = (id, field, value) => {
        setEditValues(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedIds(graduationList.map(g => g.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                const next = prev.filter(i => i !== id);
                setSelectAll(false);
                return next;
            } else {
                const next = [...prev, id];
                if (next.length === graduationList.length) setSelectAll(true);
                return next;
            }
        });
    };

    const handleApplyBatch = () => {
        if (selectedIds.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một học viên");
            return;
        }
        if (!batchNgayCapBang && !batchSoVaoSo) {
            toast.warning("Vui lòng nhập ngày cấp bằng hoặc số vào sổ");
            return;
        }
        setEditValues(prev => {
            const next = { ...prev };
            selectedIds.forEach(id => {
                if (next[id]) {
                    if (batchNgayCapBang) next[id].ngay_cap_bang = batchNgayCapBang;
                    if (batchSoVaoSo) next[id].so_vao_so = batchSoVaoSo;
                }
            });
            return next;
        });
        toast.success(`Đã áp dụng cho ${selectedIds.length} học viên`);
    };

    const handleSave = async () => {
        const updates = graduationList.map(g => ({
            id: g.id,
            so_hieu_bang: editValues[g.id]?.so_hieu_bang || null,
            so_vao_so: editValues[g.id]?.so_vao_so || null,
            ngay_cap_bang: editValues[g.id]?.ngay_cap_bang || null
        }));

        setIsSaving(true);
        try {
            await batchUpdateDiploma(updates);
            toast.success("Lưu thành công!");
            fetchGraduations(); // Refresh
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi lưu dữ liệu");
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const xepLoaiMap = { xuat_sac: "Xuất sắc", gioi: "Giỏi", kha: "Khá", trung_binh: "Trung bình", kem: "Kém" };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1976d2' }}>
                    Thông tin bằng tốt nghiệp
                </Typography>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Hệ đào tạo</InputLabel>
                                <Select value={filters.heDaoTao} onChange={(e) => handleFilterChange('heDaoTao', e.target.value)} label="Hệ đào tạo">
                                    <MenuItem value="">Chọn hệ đào tạo</MenuItem>
                                    {data.heDaoTao.map(item => (
                                        <MenuItem key={item.id} value={item.id}>{item.ten_he_dao_tao}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Khóa đào tạo</InputLabel>
                                <Select value={filters.khoaDaoTao} onChange={(e) => handleFilterChange('khoaDaoTao', e.target.value)} label="Khóa đào tạo" disabled={!filters.heDaoTao}>
                                    <MenuItem value="">Chọn khóa đào tạo</MenuItem>
                                    {data.khoaDaoTao.map(item => (
                                        <MenuItem key={item.id} value={item.id}>{item.ten_khoa}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Lớp</InputLabel>
                                <Select value={filters.lopId} onChange={(e) => handleFilterChange('lopId', e.target.value)} label="Lớp" disabled={!filters.khoaDaoTao}>
                                    <MenuItem value="">Chọn lớp</MenuItem>
                                    {data.lopList.map(item => (
                                        <MenuItem key={item.id} value={item.id}>{item.ma_lop}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Batch controls */}
                {graduationList.length > 0 && (
                    <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f0f7ff' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                            Cập nhật hàng loạt (áp dụng cho các học viên đã chọn)
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Ngày cấp bằng"
                                    type="date"
                                    size="small"
                                    fullWidth
                                    value={batchNgayCapBang}
                                    onChange={(e) => setBatchNgayCapBang(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Số vào sổ"
                                    size="small"
                                    fullWidth
                                    value={batchSoVaoSo}
                                    onChange={(e) => setBatchSoVaoSo(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Button
                                    variant="contained"
                                    onClick={handleApplyBatch}
                                    disabled={selectedIds.length === 0}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Áp dụng ({selectedIds.length} đã chọn)
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={isSaving || graduationList.length === 0}
                                    sx={{ textTransform: 'none' }}
                                >
                                    {isSaving ? "Đang lưu..." : "Lưu tất cả"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {/* Table */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : !filters.lopId ? (
                    <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                        Vui lòng chọn bộ lọc để hiển thị danh sách
                    </Typography>
                ) : graduationList.length === 0 ? (
                    <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                        Không có học viên nào đã được xét duyệt tốt nghiệp trong lớp này
                    </Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                    <TableCell padding="checkbox" sx={{ color: 'white' }}>
                                        <Checkbox
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "bold", color: 'white', width: '50px' }}>STT</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: 'white', width: '100px' }}>Mã SV</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: 'white', width: '180px' }}>Họ và tên</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "bold", color: 'white', width: '80px' }}>Điểm TBTL</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: 'white', width: '100px' }}>Xếp loại</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: 'white', width: '140px' }}>Ngày cấp bằng</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: 'white', width: '160px' }}>Số hiệu bằng</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: 'white', width: '140px' }}>Số vào sổ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {graduationList.map((g, index) => {
                                    const sv = g.sinh_vien || {};
                                    const ev = editValues[g.id] || {};
                                    return (
                                        <TableRow key={g.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedIds.includes(g.id)}
                                                    onChange={() => handleSelectOne(g.id)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{index + 1}</TableCell>
                                            <TableCell>{sv.ma_sinh_vien}</TableCell>
                                            <TableCell>{`${sv.ho_dem || ''} ${sv.ten || ''}`.trim()}</TableCell>
                                            <TableCell align="center">{g.diem_trung_binh_tich_luy || "-"}</TableCell>
                                            <TableCell>{xepLoaiMap[g.xep_loai] || g.xep_loai || "-"}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    variant="standard"
                                                    fullWidth
                                                    value={ev.ngay_cap_bang || ""}
                                                    onChange={(e) => handleEditChange(g.id, 'ngay_cap_bang', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    variant="standard"
                                                    fullWidth
                                                    value={ev.so_hieu_bang || ""}
                                                    onChange={(e) => handleEditChange(g.id, 'so_hieu_bang', e.target.value)}
                                                    placeholder="Nhập số hiệu bằng"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    variant="standard"
                                                    fullWidth
                                                    value={ev.so_vao_so || ""}
                                                    onChange={(e) => handleEditChange(g.id, 'so_vao_so', e.target.value)}
                                                    placeholder="Nhập số vào sổ"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default ThongTinBangTN;
