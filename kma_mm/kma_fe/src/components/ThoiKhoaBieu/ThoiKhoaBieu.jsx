
import { useState, useEffect } from "react";
import {
    Box,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
    Paper,
    Button,
    Grid,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    CardActions,
    IconButton,
    createTheme,
    ThemeProvider,
    TextField,
    InputAdornment, Autocomplete
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from "@mui/icons-material/FilterList";
import TuneIcon from '@mui/icons-material/Tune';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { getMonHoc, getThoiKhoaBieu, themThoiKhoaBieu, updateThoiKhoaBieu, xoaThoiKhoaBieu } from "../../Api_controller/Service/monHocService";
import { getGiangVien } from "../../Api_controller/Service/giangVienService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        background: {
            default: '#f5f5f5'
        }
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif'
    }
});

const ThoiKhoaBieu = () => {
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editId, setEditId] = useState(null);

    // Form data - Updated to include all fields from the JSON sample
    const [kyHoc, setKyHoc] = useState(2025);
    const [dotHoc, setDotHoc] = useState(1);
    const [lopId, setLopId] = useState("");
    const [monHocId, setMonHocId] = useState("");
    const [giangVienId, setGiangVienId] = useState("");
    const [giangVien, setGiangVien] = useState(""); // Added field for the JSON structure
    const [phongHoc, setPhongHoc] = useState("");
    const [tietHoc, setTietHoc] = useState(""); // Added field for the JSON structure
    const [trangThai, setTrangThai] = useState(1); // Added field for the JSON structure
    //phan nay chi tac dong den ki hoc ,no k gui du lieu
    const [khoaDaoTao, setKhoaDaoTao] = useState([]);
    const [khoaDaoTaoId, setKhoaDaoTaoId] = useState([]);
    const [HeDaoTao, setHeDaoTao] = useState([])



    // Options for dropdowns
    const [kyHocOptions, setKyHocOptions] = useState([]);
    const dotHocOptions = [1, 2, 3];
    const trangThaiOptions = [
        { value: 1, label: "Hoạt động" },
        { value: 0, label: "Không hoạt động" }
    ];

    // Search terms
    const [lopSearch, setLopSearch] = useState("");
    const [monHocSearch, setMonHocSearch] = useState("");
    const [giangVienSearch, setGiangVienSearch] = useState("");

    // Data lists
    const [lopList, setLopList] = useState([]);
    const [monHocList, setMonHocList] = useState([]);
    const [giangVienList, setGiangVienList] = useState([]);
    const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);
    const [monHocFilList, setMonHocFilList] = useState([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [kyHocFilter, setKyHocFilter] = useState("");
    const [lopIdFilter, setLopIdFilter] = useState("");
    const [lopListView, setLopListView] = useState([]);
    const [heDaoTaoId, setHeDaoTaoId] = useState()
    // Fetch initial data
    useEffect(() => {
        fetchHeDaoTaoList();
        fetchLopList();
        fetchThoiKhoaBieu();
        fetchMonHocList();
        fetchGiangVienList();
        //fetchKhoaDaoTaoList();

    }, []);




    //fetch khoa dao tao list
    const fetchKhoaDaoTaoList = async (heDaoTaoId) => {
        try {
            const response = await getDanhSachKhoaDaoTaobyId(heDaoTaoId);
            setKhoaDaoTao(response);


        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
        }
    };


    useEffect(() => {
        if (heDaoTaoId) {
            fetchKhoaDaoTaoList(heDaoTaoId);
        }
    }, [heDaoTaoId]); // Gọi lại khi heDaoTaoId thay đổi




    //fetch khoa dao tao 
    const fetchHeDaoTaoList = async () => {
        try {
            const response = await fetchDanhSachHeDaoTao();
            setHeDaoTao(response);
            console.log(HeDaoTao)
        } catch (error) {
            console.error("err fetching he tao list", error)
        }
    }

    // Fetch lớp list
    const fetchLopList = async () => {
        try {
            const response = await getDanhSachLop();
            setLopList(response);
            setLopListView(response);
        } catch (error) {
            console.error("Error fetching lớp list:", error);
        }
    };



    // Fetch môn học list
    const fetchMonHocList = async () => {
        try {
            const response = await getMonHoc();
            setMonHocList(response);
            setMonHocFilList(response);
        } catch (error) {
            console.error("Error fetching môn học list:", error);
        }
    };

    // Fetch giảng viên list
    const fetchGiangVienList = async () => {
        try {
            const response = await getGiangVien();
            setGiangVienList(response);
        } catch (error) {
            console.error("Error fetching giảng viên list:", error);
        }
    };

    // Fetch thời khóa biểu list with pagination and filters
    const fetchThoiKhoaBieu = async () => {
        let url = `http://localhost:8000/thoikhoabieu/getbypage?page=${page}&pageSize=${pageSize}`;

        if (kyHocFilter || lopIdFilter) {
            url = `http://localhost:8000/thoikhoabieu/filterbyid?page=${page}&pageSize=${pageSize}`;
            if (kyHocFilter) url += `&ky_hoc=${kyHocFilter}`;
            if (lopIdFilter) url += `&lop_id=${lopIdFilter}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            setThoiKhoaBieuList(data.data);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };

    // Call API when component mounts or when page, pageSize, kyHocFilter, lopIdFilter change
    useEffect(() => {
        fetchThoiKhoaBieu();
    }, [page, pageSize, kyHocFilter, lopIdFilter]);

    // Handle form field changes


    const handlekhoaChange = (event) => {
        const selectedKhoaId = event.target.value;
        setKhoaDaoTaoId(selectedKhoaId);

        // Tìm khóa đào tạo được chọn từ danh sách
        const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === selectedKhoaId);

        if (selectedKhoa) {
            let years = [];
            if (selectedKhoa.nam_hoc.includes("-")) {
                // Nếu năm học là khoảng thời gian (VD: "2025-2029")
                const [start, end] = selectedKhoa.nam_hoc.trim().split("-").map(Number);
                years = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            } else {
                // Nếu chỉ có một năm duy nhất
                years = [Number(selectedKhoa.nam_hoc.trim())];
            }

            setKyHocOptions(years); // Cập nhật danh sách năm học
            console.log("Danh sách năm học:", years);
        } else {
            setKyHocOptions([]); // Nếu không có khóa đào tạo hợp lệ
        }
    };











    const handleKyHocChange = (event) => {
        setKyHoc(event.target.value);
    };

    const handleHeDaoTaoChange = (event) => {
        setHeDaoTaoId(event.target.value);

    };
    const handleDotHocChange = (event) => {
        setDotHoc(event.target.value);
    };

    const handleLopChange = (event) => {
        setLopId(event.target.value);
    };

    const handleMonHocChange = (event) => {
        setMonHocId(event.target.value);
    };

    const handleGiangVienChange = (event) => {
        const selectedId = event.target.value;
        setGiangVienId(selectedId);

        // Update giangVien name field
        const selectedGV = giangVienList.find(gv => gv.id === selectedId);
        setGiangVien(selectedGV ? selectedGV.ho_ten : "");
    };

    const handleTrangThaiChange = (event) => {
        setTrangThai(event.target.value);
    };

    // Filter lists based on search terms
    const filteredLopList = lopList.filter(lop =>
        lop.ma_lop.toLowerCase().includes(lopSearch.toLowerCase())
    );

    const filteredMonHocList = monHocList.filter(monHoc =>
        monHoc.ten_mon_hoc.toLowerCase().includes(monHocSearch.toLowerCase())
    );

    const filteredGiangVienList = giangVienList.filter(giangVien =>
        giangVien.ho_ten.toLowerCase().includes(giangVienSearch.toLowerCase())
    );

    // Submit form
    const handleSubmit = async () => {
        if (lopId && monHocId) {
            setIsLoading(true);

            const thoiKhoaBieuData = {
                ky_hoc: kyHoc,
                dot_hoc: dotHoc,
                lop_id: lopId,
                mon_hoc_id: monHocId,
                giang_vien_id: giangVienId,
                giang_vien: giangVien,
                phong_hoc: phongHoc,
                tiet_hoc: tietHoc,
                trang_thai: trangThai
            };

            try {
                if (editId !== null) {
                    // Update existing record
                    await updateThoiKhoaBieu(editId, thoiKhoaBieuData);
                } else {
                    // Create new record
                    await themThoiKhoaBieu(thoiKhoaBieuData);
                }

                // Refresh the list
                fetchThoiKhoaBieu();

                // Reset form
                resetForm();
            } catch (error) {
                console.error("Error saving thời khóa biểu:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setKyHoc(2025);
        setDotHoc(1);
        setLopId("");
        setMonHocId("");
        setGiangVienId("");
        setGiangVien("");
        setPhongHoc("");
        setTietHoc("");
        setTrangThai(1);
        setLopSearch("");
        setMonHocSearch("");
        setGiangVienSearch("");
        setEditIndex(null);
        setEditId(null);
        setOpen(false);
    };

    // Handle edit
    const handleEdit = (tkb, index) => {
        setKyHoc(tkb.ky_hoc || 2025);
        setDotHoc(tkb.dot_hoc || 1);
        setLopId(tkb.lop_id);
        setMonHocId(tkb.mon_hoc_id);
        setGiangVienId(tkb.giang_vien_id);
        setGiangVien(tkb.giang_vien || "");
        setPhongHoc(tkb.phong_hoc || "");
        setTietHoc(tkb.tiet_hoc || "");
        setTrangThai(tkb.trang_thai !== undefined ? tkb.trang_thai : 1);
        setEditIndex(index);
        setEditId(tkb.id);
        setOpen(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await xoaThoiKhoaBieu(id);
            fetchThoiKhoaBieu();
        } catch (error) {
            console.error("Error deleting thời khóa biểu:", error);
        }
    };

    // Find names for display
    const findLopName = (id) => {
        const lop = lopList.find(item => item.id === id);
        return lop ? lop.ma_lop : id;
    };

    const findMonHocName = (id) => {
        const monHoc = monHocList.find(item => item.id === id);
        return monHoc ? monHoc.ten_mon_hoc : id;
    };

    const findGiangVienName = (id) => {
        const giangVien = giangVienList.find(item => item.id === id);
        return giangVien ? giangVien.ho_ten : id;
    };

    const findMonHocNameInView = (id) => {
        const monHoc = monHocFilList.find(mon => mon.id === id);
        return monHoc ? monHoc.ten_mon_hoc : "Không tìm thấy";
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" gutterBottom textAlign="center">
                        Thời Khóa Biểu
                    </Typography>

                    {/* Nút thêm mới */}
                    <Box textAlign="center" my={2}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                resetForm();
                                setOpen(true);
                            }}
                        >
                            Thêm Thời Khóa Biểu
                        </Button>
                    </Box>

                    <Box position="relative">
                        {/* Nút mở bộ lọc */}
                        <IconButton
                            onClick={() => setShowFilter(!showFilter)}
                            sx={{
                                position: "absolute",
                                top: -50,
                                right: 10,
                                width: "30px",
                                height: "30px",
                                backgroundColor: "#1976d2",
                                color: "white",
                                "&:hover": { backgroundColor: "#115293" }
                            }}
                        >
                            <TuneIcon />
                        </IconButton>

                        {/* Bộ lọc (ẩn/hiện dựa vào showFilter) */}
                        {showFilter && (
                            <Box
                                sx={{
                                    backgroundColor: "#f5f5f5",
                                    p: 2,
                                    borderRadius: 1,
                                    boxShadow: 1,
                                    maxWidth: 500,
                                    mx: "auto",
                                    mt: 5
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" mb={1}>
                                    Bộ lọc
                                </Typography>

                                <Grid container spacing={1} alignItems="center">
                                    {/* Kỳ học */}
                                    <Grid item xs={5}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Kỳ học</InputLabel>
                                            <Select value={kyHocFilter} onChange={(e) => setKyHocFilter(e.target.value)}>
                                                <MenuItem value="">Tất cả</MenuItem>
                                                <MenuItem value="2025">2025</MenuItem>
                                                <MenuItem value="2024">2024</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Lớp */}
                                    <Grid item xs={5}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Lớp</InputLabel>
                                            <Select value={lopIdFilter} onChange={(e) => setLopIdFilter(e.target.value)}>
                                                <MenuItem value="">Tất cả</MenuItem>
                                                {lopListView.map((item) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.ma_lop}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Nút lọc / hủy lọc */}
                                    <Grid item xs={2}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                minWidth: 80,
                                                backgroundColor: kyHocFilter || lopIdFilter ? "#d32f2f" : "#1976d2",
                                                "&:hover": { backgroundColor: kyHocFilter || lopIdFilter ? "#b71c1c" : "#115293" }
                                            }}
                                            onClick={() => {
                                                if (kyHocFilter || lopIdFilter) {
                                                    setKyHocFilter("");
                                                    setLopIdFilter("");
                                                    fetchThoiKhoaBieu();
                                                } else {
                                                    fetchThoiKhoaBieu();
                                                }
                                            }}
                                        >
                                            {kyHocFilter || lopIdFilter ? "Hủy" : "Lọc"}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Box>

                    {/* Danh sách thời khóa biểu */}
                    {thoiKhoaBieuList.length === 0 ? (
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            textAlign="center"
                            sx={{ my: 4, fontStyle: 'italic' }}
                        >
                            Chưa có thời khóa biểu nào được thêm
                        </Typography>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            {thoiKhoaBieuList.map((tkb, index) => (
                                <Grid item xs={12} sm={6} md={4} key={tkb.id || index}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                {findMonHocNameInView(tkb.mon_hoc_id)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Lớp:</strong> {findLopName(tkb.lop_id)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Kỳ học:</strong> {tkb.ky_hoc || "N/A"}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Đợt học:</strong> {tkb.dot_hoc || "N/A"}
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
                                        <CardActions sx={{ justifyContent: "center" }}>
                                            <IconButton color="primary" size="small" onClick={() => handleEdit(tkb, index)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" size="small" onClick={() => handleDelete(tkb.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Phân trang */}
                    <Box textAlign="center" mt={4}>
                        <Stack spacing={2} alignItems="center">
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                color="primary"
                            />
                        </Stack>
                    </Box>
                </Paper>
            </Container>































            {/* Dialog for adding/editing */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editId !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
                <DialogContent>


                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/*hệ đào tạo  */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel sx={{ backgroundColor: "white" }} >Hệ đào tạo</InputLabel>
                                <Select value={heDaoTaoId} onChange={handleHeDaoTaoChange}>
                                    {HeDaoTao?.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.ten_he_dao_tao}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Đợt học */}
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel sx={{ backgroundColor: "white" }}>Khóa đào tạo </InputLabel>
                                <Select value={khoaDaoTaoId} onChange={handlekhoaChange}>
                                    {khoaDaoTao.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.ten_khoa} nk {option.nam_hoc}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>







                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* chon khoa hoc  */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel sx={{ backgroundColor: "white" }}>Kỳ học</InputLabel>
                                <Select value={kyHoc} onChange={handleKyHocChange}>
                                    {kyHocOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Đợt học */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel sx={{ backgroundColor: "white" }}>Đợt học</InputLabel>
                                <Select value={dotHoc} onChange={handleDotHocChange}>
                                    {dotHocOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Lớp selection with inline search */}
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Lớp</InputLabel>
                                <Select
                                    value={lopId}
                                    onChange={handleLopChange}
                                    label="Lớp"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {filteredLopList.map((lop) => (
                                        <MenuItem key={lop.id} value={lop.id}>
                                            {lop.ma_lop}
                                        </MenuItem>
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>







                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <Autocomplete
                                freeSolo
                                options={filteredMonHocList}
                                getOptionLabel={(option) => (typeof option === "string" ? option : option.ten_mon_hoc)}
                                value={filteredMonHocList.find((m) => m.id === monHocId) || monHocId || null}
                                onChange={(event, newValue) => {
                                    if (typeof newValue === "string") {
                                        // Nếu nhập tay, giữ nguyên giá trị chuỗi
                                        handleMonHocChange({ target: { value: newValue } });
                                    } else if (newValue) {
                                        // Nếu chọn từ danh sách, lấy ID của môn học
                                        handleMonHocChange({ target: { value: newValue.id } });
                                    } else {
                                        // Nếu xóa giá trị, đặt thành null
                                        handleMonHocChange({ target: { value: null } });
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Môn học" fullWidth size="small" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Tìm kiếm môn học..."
                                value={monHocSearch}
                                onChange={(e) => setMonHocSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
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


                                onChange={(event, newValue) => {
                                    handleGiangVienChange({ target: { value: newValue ? newValue.id : null } });
                                }}


                                renderInput={(params) => (
                                    <TextField {...params} label="Giảng viên" fullWidth size="small" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Tìm kiếm giảng viên..."
                                value={giangVienSearch}
                                onChange={(e) => setGiangVienSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>


                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Phòng học */}
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

                        {/* Tiết học */}
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

                    {/* Trạng thái */}
                    <FormControl fullWidth margin="dense">
                        <InputLabel sx={{ backgroundColor: "white" }}>Trạng thái</InputLabel>
                        <Select value={trangThai} onChange={handleTrangThaiChange}>
                            {trangThaiOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
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
                        disabled={!lopId || !monHocId || isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : (editId !== null ? "Cập nhật" : "Xác nhận")}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default ThoiKhoaBieu;