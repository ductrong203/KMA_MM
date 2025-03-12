
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
    InputAdornment,

} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { getMonHoc, getThoiKhoaBieu, themThoiKhoaBieu, updateThoiKhoaBieu, xoaThoiKhoaBieu } from "../../Api_controller/Service/monHocService";
import { getGiangVien } from "../../Api_controller/Service/giangVienService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
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

    // Form data
    const [lopId, setLopId] = useState("");
    const [kiId, setKiId] = useState(1);
    const kiOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const [monHocId, setMonHocId] = useState("");
    const [giangVienId, setGiangVienId] = useState("");
    const [phongHoc, setPhongHoc] = useState("");

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

    // Fetch initial data
    useEffect(() => {
        fetchLopList();
        fetchThoiKhoaBieu();
    }, []);

    // Fetch lớp list
    const fetchLopList = async () => {
        try {
            const response = await getDanhSachLop();
            setLopList(response);
        } catch (error) {
            console.error("Error fetching lớp list:", error);
        }
    };

    // Fetch môn học list when lớp is selected
    const fetchMonHocList = async () => {
        try {
            const response = await getMonHoc();
            console.log(response)
            setMonHocList(response);
        } catch (error) {
            console.error("Error fetching môn học list:", error);
        }
    };

    // Fetch giảng viên list when môn học is selected
    const fetchGiangVienList = async () => {
        try {
            const response = await getGiangVien();
            setGiangVienList(response);
        } catch (error) {
            console.error("Error fetching giảng viên list:", error);
        }
    };

    // // Fetch thời khóa biểu list
    // const fetchThoiKhoaBieu = async () => {
    //     try {
    //         const response = await getThoiKhoaBieu();
    //         setThoiKhoaBieuList(response);
    //     } catch (error) {
    //         console.error("Error fetching thời khóa biểu:", error);
    //     }
    // };

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [kyHoc, setKyHoc] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(5);


    const fetchThoiKhoaBieu = async () => {
        let res = await getMonHoc();
        console.log(res)
        setMonHocFilList(res);
        let url = `http://localhost:8000/thoikhoabieu/getbypage?page=${page}&pageSize=${pageSize}`;

        if (kyHoc || lopId) {
            url = `http://localhost:8000/thoikhoabieu/filter?page=${page}&pageSize=${pageSize}`;
            if (kyHoc) url += `&ky_hoc=${kyHoc}`;
            if (lopId) url += `&lop_id=${lopId}`;
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

    // Gọi API khi component mount hoặc khi các giá trị page, pageSize, kyHoc, lopId thay đổi
    useEffect(() => {
        fetchThoiKhoaBieu();
    }, [page, pageSize, kyHoc, lopId]);


    useEffect(() => {
        if (page && pageSize) {
            fetchThoiKhoaBieu();
        }
    }, [page, pageSize, kyHoc, lopId]);


    // Handle lớp change
    const handleKiChange = (event) => {
        setKiId(event.target.value);
        fetchLopList();
    };

    // Handle lớp change
    const handleLopChange = (event) => {
        setLopId(event.target.value);
        fetchMonHocList();
    };

    // Handle môn học change
    const handleMonHocChange = (event) => {
        setMonHocId(event.target.value);
        fetchGiangVienList();
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
        if (lopId && monHocId && giangVienId) {
            setIsLoading(true);

            const thoiKhoaBieuData = {
                lop_id: lopId,
                mon_hoc_id: monHocId,
                giang_vien_id: giangVienId,
                phong_hoc: phongHoc
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
        setLopId("");
        setMonHocId("");
        setGiangVienId("");
        setPhongHoc("");
        setLopSearch("");
        setMonHocSearch("");
        setGiangVienSearch("");
        setEditIndex(null);
        setEditId(null);
        setOpen(false);
    };

    // Handle edit
    const handleEdit = (tkb, index) => {
        setLopId(tkb.lop_id);
        setMonHocId(tkb.mon_hoc_id);
        setGiangVienId(tkb.giang_vien_id);
        setPhongHoc(tkb.phong_hoc || "");
        setEditIndex(index);
        setEditId(tkb.id);

        // Load dependent dropdowns
        fetchMonHocList();
        fetchGiangVienList();

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
                                fetchMonHocList();
                                fetchGiangVienList();
                                setOpen(true);
                            }}
                        >
                            Thêm Thời Khóa Biểu
                        </Button>
                    </Box>

                    {/* Bộ lọc: Kỳ học + Lớp + Nút lọc */}
                    <Box display="flex" justifyContent="center" alignItems="center" gap={2} my={2}>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Kỳ học</InputLabel>
                            <Select value={kyHoc} onChange={(e) => setKyHoc(e.target.value)}>
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="2025">2025</MenuItem>
                                <MenuItem value="2024">2024</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Lớp</InputLabel>
                            <Select value={lopId} onChange={(e) => setLopId(e.target.value)}>
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="1">Lớp 1</MenuItem>
                                <MenuItem value="2">Lớp 2</MenuItem>
                            </Select>
                        </FormControl>

                        <Button variant="contained" color="primary" onClick={fetchThoiKhoaBieu}>
                            Lọc
                        </Button>
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
                                                <strong>Giảng viên:</strong> {findGiangVienName(tkb.giang_vien_id)}
                                            </Typography>
                                            {tkb.phong_hoc && (
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Phòng học:</strong> {tkb.phong_hoc}
                                                </Typography>
                                            )}
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




            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Kì</InputLabel>
                        <Select value={kiId} onChange={handleKiChange}>
                            {kiOptions.map((ki) => (
                                <MenuItem key={ki} value={ki}>
                                    {ki}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Lớp selection with inline search */}
                    <Grid container spacing={2} direction="row-reverse" alignItems="center" sx={{ mt: 1 }}>
                        {/* Ô tìm kiếm (1/3) */}
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
                                            {/* <SearchIcon fontSize="small" /> */}
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ height: "40px" }} // Đặt chiều cao cố định
                            />
                        </Grid>

                        {/* Ô chọn lớp (2/3) */}
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth size="small" sx={{ height: "40px" }}>
                                <Select
                                    value={lopId}
                                    onChange={handleLopChange}
                                    displayEmpty
                                    renderValue={(value) => {
                                        if (!value) return "Chọn lớp";
                                        const lop = lopList.find(item => item.id === value);
                                        return lop ? lop.ma_lop : value;
                                    }}
                                    sx={{ height: "40px", display: "flex", alignItems: "center" }} // Căn chỉnh chiều cao
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
                    </Grid>

                    {/* Môn học selection with inline search */}
                    <Grid container spacing={2} direction="row-reverse" alignItems="center" sx={{ mt: 1 }}>
                        {/* Ô tìm kiếm (1/3) */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Tìm kiếm môn học..."
                                value={monHocSearch}
                                onChange={(e) => setMonHocSearch(e.target.value)}
                                disabled={!lopId}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {/* <SearchIcon fontSize="small" /> */}
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ height: "40px" }} // Căn chiều cao
                            />
                        </Grid>

                        {/* Ô chọn môn học (2/3) */}
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth size="small" sx={{ height: "40px" }} disabled={!lopId}>
                                <Select
                                    value={monHocId}
                                    onChange={handleMonHocChange}
                                    displayEmpty
                                    renderValue={(value) => {
                                        if (!value) return "Chọn môn học";
                                        const monHoc = monHocList.find(item => item.id === value);
                                        return monHoc ? monHoc.ten_mon_hoc : value;
                                    }}
                                    sx={{ height: "40px", display: "flex", alignItems: "center" }} // Căn chỉnh
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {filteredMonHocList.map((monHoc) => (
                                        <MenuItem key={monHoc.id} value={monHoc.id}>
                                            {monHoc.ten_mon_hoc}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Giảng viên selection with inline search */}
                    <Grid container spacing={2} direction="row-reverse" alignItems="center" sx={{ mt: 1 }}>
                        {/* Ô tìm kiếm (1/3) */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Tìm kiếm giảng viên..."
                                value={giangVienSearch}
                                onChange={(e) => setGiangVienSearch(e.target.value)}
                                disabled={!monHocId}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {/* <SearchIcon fontSize="small" /> */}
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ height: "40px" }} // Căn chỉnh chiều cao
                            />
                        </Grid>

                        {/* Ô chọn giảng viên (2/3) */}
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth size="small" sx={{ height: "40px" }} disabled={!monHocId}>
                                <Select
                                    value={giangVienId}
                                    onChange={(e) => setGiangVienId(e.target.value)}
                                    displayEmpty
                                    renderValue={(value) => {
                                        if (!value) return "Chọn giảng viên";
                                        const giangVien = giangVienList.find(item => item.id === value);
                                        return giangVien ? giangVien.ho_ten : value;
                                    }}
                                    sx={{ height: "40px", display: "flex", alignItems: "center" }} // Căn chỉnh
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {filteredGiangVienList.map((giangVien) => (
                                        <MenuItem key={giangVien.id} value={giangVien.id}>
                                            {giangVien.ho_ten}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Phòng Học"
                        value={phongHoc}
                        onChange={(e) => setPhongHoc(e.target.value)}
                        placeholder="Ví dụ: 103 TA1"
                        sx={{ mt: 3 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetForm} color="secondary">Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={!lopId || !monHocId || !giangVienId || isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : (editId !== null ? "Cập nhật" : "Xác nhận")}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default ThoiKhoaBieu;
