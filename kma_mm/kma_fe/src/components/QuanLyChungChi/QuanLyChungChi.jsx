

// import React, { useState, useEffect } from "react";
// import {
//     Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container,
//     TextField, InputAdornment, Pagination as MuiPagination, Table, TableBody, TableCell,
//     TableContainer, TableHead, TableRow, IconButton, Tooltip, createTheme, ThemeProvider,
//     Dialog, DialogActions, DialogContent, DialogTitle // Thêm các components cho dialog
// } from "@mui/material";
// import SearchIcon from '@mui/icons-material/Search';
// import DeleteIcon from '@mui/icons-material/Delete';
// import InfoIcon from '@mui/icons-material/Info';
// import AddIcon from '@mui/icons-material/Add'; // Thêm icon
// import FileUploadIcon from '@mui/icons-material/FileUpload'; // Thêm icon
// import FileDownloadIcon from '@mui/icons-material/FileDownload'; // Thêm icon
// import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
// import { getDanhSachLop } from "../../Api_controller/Service/lopService";
// import { fetchLopByKhoaDaoTao } from "../../Api_controller/Service/thoiKhoaBieuService";
// import { laydanhsachloaichungchi } from "../../Api_controller/Service/chungChiService";
// import { toast } from "react-toastify";
// // Mock Data for demonstration
// const mockSinhVien = [
//     {
//         id: 1,
//         ma_sinh_vien: "AT140101",
//         ho_ten: "Lê Bá Bình",
//         diem_tb: 5.94,
//         xep_loai: "Trung bình",
//         ghi_chu: "",
//         so_quyet_dinh: "67K/QĐ-HVM",
//         ngay_ky_qd: "28/07/2020",
//         tinh_trang: "Bình thường",
//         lop_id: 201,
//         da_dat: true,
//         loai_chung_chi: "GDQP"
//     },
//     {
//         id: 2,
//         ma_sinh_vien: "AT140103",
//         ho_ten: "Nguyễn Chí Bình",
//         diem_tb: 3.17,
//         xep_loai: "Khá",
//         ghi_chu: "",
//         so_quyet_dinh: "67K/QĐ-HVM",
//         ngay_ky_qd: "28/07/2020",
//         tinh_trang: "TB Nghiệp",
//         lop_id: 201,
//         da_dat: true,
//         loai_chung_chi: "GDQP"
//     },
//     {
//         id: 3,
//         ma_sinh_vien: "AT140104",
//         ho_ten: "Nguyễn Chí Đình",
//         diem_tb: 7.28,
//         xep_loai: "Khá",
//         ghi_chu: "",
//         so_quyet_dinh: "67K/QĐ-HVM",
//         ngay_ky_qd: "28/07/2020",
//         tinh_trang: "Tốt Nghiệp",
//         lop_id: 201,
//         da_dat: true,
//         loai_chung_chi: "GDQP"
//     },
//     {
//         id: 4,
//         ma_sinh_vien: "AT140106",
//         ho_ten: "Lê Việt Cường",
//         diem_tb: 5.86,
//         xep_loai: "Trung bình",
//         ghi_chu: "Môn không đạt: Giáo dục thể chất 2(0), Giáo dục thể chất 3(0), DTB Không đạt: 2.27",
//         so_quyet_dinh: "",
//         ngay_ky_qd: "",
//         tinh_trang: "Tốt Nghiệp",
//         lop_id: 202,
//         da_dat: false,
//         loai_chung_chi: "GDQP"
//     },
//     {
//         id: 5,
//         ma_sinh_vien: "AT140109",
//         ho_ten: "Nguyễn Duy Dũng",
//         diem_tb: 2.23,
//         xep_loai: "",
//         ghi_chu: "Môn không đạt: Giáo dục thể chất 2(0), Giáo dục thể chất 3(0), DTB Không đạt: 2.27",
//         so_quyet_dinh: "",
//         ngay_ky_qd: "",
//         tinh_trang: "Bình thường",
//         lop_id: 202,
//         da_dat: false,
//         loai_chung_chi: "GDQP"
//     },
//     {
//         id: 6,
//         ma_sinh_vien: "AT140108",
//         ho_ten: "Nguyễn Tiến Dũng",
//         diem_tb: 5.40,
//         xep_loai: "Trung bình",
//         ghi_chu: "",
//         so_quyet_dinh: "",
//         ngay_ky_qd: "",
//         tinh_trang: "Bình thường",
//         lop_id: 203,
//         da_dat: false,
//         loai_chung_chi: "GDQP"
//     },
//     {
//         id: 7,
//         ma_sinh_vien: "AT140110",
//         ho_ten: "Nguyễn Trung Dũng",
//         diem_tb: 4.57,
//         xep_loai: "",
//         ghi_chu: "Môn không đạt: Giáo dục thể chất 2(0), DTB không đạt: 4",
//         so_quyet_dinh: "",
//         ngay_ky_qd: "",
//         tinh_trang: "Bình thường",
//         lop_id: 203,
//         da_dat: false,
//         loai_chung_chi: "TIENGANH"
//     },
//     {
//         id: 8,
//         ma_sinh_vien: "AT140115",
//         ho_ten: "Nguyễn Đức Duy",
//         diem_tb: 6.53,
//         xep_loai: "Khá",
//         ghi_chu: "",
//         so_quyet_dinh: "",
//         ngay_ky_qd: "",
//         tinh_trang: "Bình thường",
//         lop_id: 204,
//         da_dat: true,
//         loai_chung_chi: "TIENGANH"
//     }
// ];

// const theme = createTheme({
//     palette: {
//         primary: { main: '#1976d2' },
//         background: { default: '#f5f5f5' }
//     },
//     typography: { fontFamily: 'Roboto, Arial, sans-serif' }
// });

// const QuanLyChungChi = () => {
//     // Filter states
//     const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
//     const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
//     const [lopIdFilter, setLopIdFilter] = useState("");
//     const [searchTerm, setSearchTerm] = useState("");
//     const [loaiChungChi, setLoaiChungChi] = useState("GDQP"); // Default to GDQP
//     const [trangThai, setTrangThai] = useState("all"); // all, da_dat, chua_dat

//     // Data for filters
//     const [HeDaoTao, setHeDaoTao] = useState([]);
//     const [khoaDaoTao, setKhoaDaoTao] = useState([]);
//     const [originalLopList, setOriginalLopList] = useState([]);
//     const [lopListView, setLopListView] = useState([]);

//     // Student data
//     const [sinhVienList, setSinhVienList] = useState([]);
//     const [filteredSinhVien, setFilteredSinhVien] = useState([]);

//     // State mới cho dialog thêm học viên
//     const [openDialog, setOpenDialog] = useState(false);
//     const [newData, setNewData] = useState({
//         ma_sinh_vien: "",
//         ho_ten: "",
//         diem_tb: "",
//         xep_loai: "",
//         ghi_chu: "",
//         so_quyet_dinh: "",
//         ngay_ky_qd: "",
//         tinh_trang: "Bình thường",
//         da_dat: true,
//         loai_chung_chi: "GDQP"
//     });

//     // Pagination
//     const [page, setPage] = useState(1);
//     const [pageSize] = useState(10);
//     const [totalPages, setTotalPages] = useState(1);

//     // Loading state
//     const [isLoading, setIsLoading] = useState(false);



//     // Certificate types
//     const loaiChungChiOptions = [
//         { value: "GDQP", label: "Chứng chỉ GDQP" },
//         { value: "TIENGANH", label: "Chứng chỉ Tiếng Anh" }
//     ];


// // Hàm thêm mới chứng chỉ
// const handleSubmitNew = async () => {
//     try {
//         setIsLoading(true);
//         // TODO: Thay thế bằng API thực tế khi có
//         const newItem = {
//             ...newData,
//             id: Date.now(),
//             lop_id: lopIdFilter || 201,
//         };

//         // Giả lập API call
//         // await themChungChi(newItem);

//         const updatedList = [...sinhVienList, newItem];
//         setSinhVienList(updatedList);
//         filterSinhVien(updatedList);
//         toast.success("Thêm chứng chỉ thành công!");
//         handleCloseDialog();
//     } catch (error) {
//         console.error("Lỗi khi thêm chứng chỉ:", error);
//         toast.error("Không thể thêm chứng chỉ");
//     } finally {
//         setIsLoading(false);
//     }
// };

// // Hàm xóa chứng chỉ
// const handleDelete = async (id) => {
//     if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
//         try {
//             setIsLoading(true);
//             // TODO: Thay thế bằng API thực tế khi có
//             // await xoaChungChi(id);

//             const updatedList = sinhVienList.filter(sv => sv.id !== id);
//             setSinhVienList(updatedList);
//             filterSinhVien(updatedList);
//             toast.success("Xóa chứng chỉ thành công!");
//         } catch (error) {
//             console.error("Lỗi khi xóa chứng chỉ:", error);
//             toast.error("Không thể xóa chứng chỉ");
//         } finally {
//             setIsLoading(false);
//         }
//     }
// };


// const findLopName = (id) => originalLopList.find(item => item.id === id)?.ma_lop || "Lớp không xác định";
// const findHeDaoTaoName = (id) => HeDaoTao.find(item => item.id === id)?.ten_he_dao_tao || "Hệ đào tạo không xác định";
// const findKhoaDaoTaoName = (id) => khoaDaoTao.find(item => item.id === id)?.ten_khoa || "Khóa đào tạo không xác định";


//     // Thêm state cho loại chứng chỉ
//     const [loaiChungChiList, setLoaiChungChiList] = useState(loaiChungChiOptions); // Mặc định là GDQP
//     // Initial data loading
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setIsLoading(true);
//             try {
//                 // Gọi các API song song để tối ưu thời gian tải
//                 const [loaiChungChiRes, heDaoTaoRes, lopRes] = await Promise.all([
//                     laydanhsachloaichungchi(),
//                     fetchDanhSachHeDaoTao(),
//                     getDanhSachLop()
//                 ]);

//                 // Xử lý response loại chứng chỉ
//                 if (loaiChungChiRes && loaiChungChiRes.thongBao === "Lấy danh sách loại chứng chỉ thành công") {
//                     const formattedList = loaiChungChiRes.data.map(item => ({
//                         value: item,
//                         label: item
//                     }));
//                     setLoaiChungChiList(formattedList);
//                 } else {
//                     console.error("Không thể tải danh sách loại chứng chỉ");
//                     setLoaiChungChiList([
//                         { value: "Chuẩn đầu ra TA", label: "Chuẩn đầu ra TA" },
//                         { value: "Chứng chỉ GDTC", label: "Chứng chỉ GDTC" }
//                     ]);
//                 }

//                 // Set data từ API
//                 setHeDaoTao(heDaoTaoRes);
//                 setOriginalLopList(lopRes);
//                 setLopListView(lopRes);

//                 // TODO: Thay thế mockSinhVien bằng API thực tế khi có
//                 setSinhVienList(mockSinhVien);
//                 filterSinhVien(mockSinhVien);

//             } catch (error) {
//                 console.error("Lỗi khi tải dữ liệu ban đầu:", error);
//                 toast.error("Có lỗi xảy ra khi tải dữ liệu");
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, []);

//     useEffect(() => {
//         const fetchKhoaDaoTao = async () => {
//             if (heDaoTaoFilter) {
//                 try {
//                     const khoaDaoTaoData = await getDanhSachKhoaDaoTaobyId(heDaoTaoFilter);
//                     setKhoaDaoTao(khoaDaoTaoData);
//                 } catch (error) {
//                     console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
//                     toast.error("Không thể lấy danh sách khóa đào tạo");
//                 }
//             } else {
//                 setKhoaDaoTao([]);
//                 setKhoaDaoTaoFilter("");
//                 setLopIdFilter("");
//                 setLopListView(originalLopList);
//             }
//         };

//         fetchKhoaDaoTao();
//     }, [heDaoTaoFilter, originalLopList]);



//     //khóa đào tạo thay đổi thì lấy danh sách lớp theo khóa đào tạo
//     useEffect(() => {
//         const fetchLopByKhoa = async () => {
//             if (khoaDaoTaoFilter) {
//                 try {
//                     const lopData = await fetchLopByKhoaDaoTao(khoaDaoTaoFilter);
//                     setLopListView(lopData);
//                 } catch (error) {
//                     console.error("Lỗi khi lấy danh sách lớp:", error);
//                     toast.error("Không thể lấy danh sách lớp");
//                 }
//             } else {
//                 setLopIdFilter("");
//                 setLopListView(originalLopList);
//             }
//         };

//         fetchLopByKhoa();
//     }, [khoaDaoTaoFilter, originalLopList]);

//     // Filter sinh vien based on all criteria
//     const filterSinhVien = (data = sinhVienList) => {
//         let filtered = [...data];

//         // Filter by certificate type
//         filtered = filtered.filter(sv => sv.loai_chung_chi === loaiChungChi);

//         // Filter by he dao tao -> khoa dao tao -> lop (when selected)
//         if (lopIdFilter) {
//             filtered = filtered.filter(sv => sv.lop_id == lopIdFilter);
//         }

//         // Filter by pass status
//         if (trangThai === 'da_dat') {
//             filtered = filtered.filter(sv => sv.da_dat);
//         } else if (trangThai === 'chua_dat') {
//             filtered = filtered.filter(sv => !sv.da_dat);
//         }

//         // Search by name or student ID
//         if (searchTerm) {
//             const search = searchTerm.toLowerCase();
//             filtered = filtered.filter(sv =>
//                 sv.ho_ten.toLowerCase().includes(search) ||
//                 sv.ma_sinh_vien.toLowerCase().includes(search)
//             );
//         }

//         // Pagination
//         setTotalPages(Math.ceil(filtered.length / pageSize));

//         // Slice for current page
//         const startIndex = (page - 1) * pageSize;
//         const endIndex = startIndex + pageSize;
//         setFilteredSinhVien(filtered.slice(startIndex, endIndex));

//         // Reset page if no results on current page
//         if (filtered.length > 0 && startIndex >= filtered.length) {
//             setPage(1);
//         }
//     };

//     // Apply filters when parameters change
//     useEffect(() => {
//         filterSinhVien();
//     }, [loaiChungChi, trangThai, lopIdFilter, page, searchTerm]);

//     // Format date for display
//     const formatDate = (dateString) => {
//         if (!dateString) return "";
//         return dateString;
//     };

//     // Handle delete
//     const handleDelete = (id) => {
//         if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
//             const updatedList = sinhVienList.filter(sv => sv.id !== id);
//             setSinhVienList(updatedList);
//             filterSinhVien(updatedList);
//         }
//     };

//     // Apply filters
//     const handleApplyFilter = () => {
//         setPage(1);
//         filterSinhVien();
//     };

//     // Clear filters
//     const handleClearFilter = () => {
//         setHeDaoTaoFilter("");
//         setKhoaDaoTaoFilter("");
//         setLopIdFilter("");
//         setSearchTerm("");
//         setPage(1);
//         // trangThai and loaiChungChi are kept
//     };

//     // Hàm xử lý cho dialog thêm học viên
//     const handleOpenDialog = () => {
//         setOpenDialog(true);
//         setNewData({
//             ...newData,
//             loai_chung_chi: loaiChungChi
//         });
//     };

//     const handleCloseDialog = () => {
//         setOpenDialog(false);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setNewData({
//             ...newData,
//             [name]: value
//         });
//     };

//     const handleSubmitNew = () => {
//         // Giả lập thêm mới
//         const newItem = {
//             ...newData,
//             id: Date.now(), // Tạm dùng timestamp làm id
//             lop_id: lopIdFilter || 201, // Default hoặc selected
//         };

//         const updatedList = [...sinhVienList, newItem];
//         setSinhVienList(updatedList);
//         filterSinhVien(updatedList);

//         handleCloseDialog();
//     };

//     return (
//         <ThemeProvider theme={theme}>
//             <Container maxWidth="" sx={{ py: 4 }}>
//                 <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
//                     {/* Thêm nút thêm mới + import/export ở đây */}
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             startIcon={<AddIcon />}
//                             onClick={handleOpenDialog}
//                         >
//                             Thêm học viên
//                         </Button>

//                         <Box sx={{ display: 'flex', gap: 2 }}>
//                             <Button
//                                 variant="contained"
//                                 color="secondary"
//                                 startIcon={<FileUploadIcon />}
//                             >
//                                 Import
//                             </Button>
//                             <Button
//                                 variant="contained"
//                                 color="success"
//                                 startIcon={<FileDownloadIcon />}
//                             >
//                                 Export
//                             </Button>
//                         </Box>
//                     </Box>

//                     {/* Filter Section */}
//                     <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, backgroundColor: "#fff" }}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Loại chứng chỉ</InputLabel>
//                                     <Select
//                                         value={loaiChungChi}
//                                         onChange={(e) => setLoaiChungChi(e.target.value)}
//                                         label="Loại chứng chỉ"
//                                     >
//                                         {loaiChungChiList.map((option) => (
//                                             <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Hệ đào tạo</InputLabel>
//                                     <Select
//                                         value={heDaoTaoFilter}
//                                         onChange={(e) => setHeDaoTaoFilter(e.target.value)}
//                                         label="Hệ đào tạo"
//                                     >
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {HeDaoTao.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ten_he_dao_tao}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Khóa đào tạo</InputLabel>
//                                     <Select
//                                         value={khoaDaoTaoFilter}
//                                         onChange={(e) => setKhoaDaoTaoFilter(e.target.value)}
//                                         label="Khóa đào tạo"
//                                         disabled={!heDaoTaoFilter}
//                                     >
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {khoaDaoTao.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ten_khoa}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Lớp</InputLabel>
//                                     <Select
//                                         value={lopIdFilter}
//                                         onChange={(e) => setLopIdFilter(e.target.value)}
//                                         label="Lớp"
//                                     >
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {lopListView.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ma_lop}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} md={8}>
//                                 <TextField
//                                     fullWidth
//                                     size="small"
//                                     placeholder="Tìm kiếm theo tên hoặc mã sinh viên..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     InputProps={{
//                                         startAdornment: (
//                                             <InputAdornment position="start">
//                                                 <SearchIcon fontSize="small" />
//                                             </InputAdornment>
//                                         ),
//                                     }}
//                                 />
//                             </Grid>

//                             <Grid item xs={12} md={4}>
//                                 <FormControl fullWidth size="small">
//                                     <InputLabel>Trạng thái</InputLabel>
//                                     <Select
//                                         value={trangThai}
//                                         onChange={(e) => setTrangThai(e.target.value)}
//                                         label="Trạng thái"
//                                     >
//                                         <MenuItem value="all">Tất cả sinh viên</MenuItem>
//                                         <MenuItem value="da_dat">Sinh viên đã đạt</MenuItem>
//                                         <MenuItem value="chua_dat">Sinh viên chưa đạt</MenuItem>
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
//                                 <Button
//                                     variant="contained"
//                                     color="primary"
//                                     sx={{
//                                         minWidth: 100,
//                                         textTransform: "none"
//                                     }}
//                                     onClick={handleApplyFilter}
//                                 >
//                                     Áp dụng
//                                 </Button>

//                                 <Button
//                                     variant="outlined"
//                                     color="secondary"
//                                     sx={{
//                                         minWidth: 100,
//                                         textTransform: "none"
//                                     }}
//                                     onClick={handleClearFilter}
//                                     disabled={!heDaoTaoFilter && !khoaDaoTaoFilter && !lopIdFilter && !searchTerm}
//                                 >
//                                     Xóa bộ lọc
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Box>

//                     {/* Student List Table */}
//                     {isLoading ? (
//                         <Typography variant="body1" textAlign="center" sx={{ my: 4 }}>
//                             Đang tải dữ liệu...
//                         </Typography>
//                     ) : filteredSinhVien.length === 0 ? (
//                         <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
//                             Không tìm thấy sinh viên nào
//                         </Typography>
//                     ) : (
//                         <TableContainer component={Paper} sx={{ mt: 4, overflowX: 'auto' }}>
//                             <Table size="small">
//                                 <TableHead>
//                                     <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
//                                         <TableCell align="center" sx={{ fontWeight: "bold", width: '50px' }}>STT</TableCell>
//                                         <TableCell sx={{ fontWeight: "bold", width: '100px' }}>Mã SV</TableCell>
//                                         <TableCell sx={{ fontWeight: "bold", width: '180px' }}>Họ và tên</TableCell>
//                                         <TableCell align="center" sx={{ fontWeight: "bold", width: '80px' }}>Điểm TB</TableCell>
//                                         <TableCell sx={{ fontWeight: "bold", width: '100px' }}>Xếp loại</TableCell>
//                                         <TableCell sx={{ fontWeight: "bold", width: '240px' }}>Ghi chú</TableCell>
//                                         <TableCell sx={{ fontWeight: "bold", width: '120px' }}>Số quyết định</TableCell>
//                                         <TableCell sx={{ fontWeight: "bold", width: '120px' }}>Ngày ký QĐ</TableCell>
//                                         <TableCell sx={{ fontWeight: "bold", width: '100px' }}>Tình trạng</TableCell>
//                                         <TableCell align="center" sx={{ fontWeight: "bold", width: '60px' }}>Xóa</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {filteredSinhVien.map((sv, index) => (
//                                         <TableRow key={sv.id} sx={{
//                                             backgroundColor: !sv.da_dat ? '#fff9f9' : 'inherit',
//                                         }}>
//                                             <TableCell align="center">{(page - 1) * pageSize + index + 1}</TableCell>
//                                             <TableCell>{sv.ma_sinh_vien}</TableCell>
//                                             <TableCell>{sv.ho_ten}</TableCell>
//                                             <TableCell align="center">{sv.diem_tb}</TableCell>
//                                             <TableCell>{sv.xep_loai}</TableCell>
//                                             <TableCell>
//                                                 {sv.ghi_chu.length > 40 ? (
//                                                     <Tooltip title={sv.ghi_chu}>
//                                                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                                                             {sv.ghi_chu.substring(0, 40)}...
//                                                             <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
//                                                         </Box>
//                                                     </Tooltip>
//                                                 ) : sv.ghi_chu}
//                                             </TableCell>
//                                             <TableCell>{sv.so_quyet_dinh}</TableCell>
//                                             <TableCell>{formatDate(sv.ngay_ky_qd)}</TableCell>
//                                             <TableCell>{sv.tinh_trang}</TableCell>
//                                             <TableCell align="center">
//                                                 <IconButton color="error" size="small" onClick={() => handleDelete(sv.id)}>
//                                                     <DeleteIcon fontSize="small" />
//                                                 </IconButton>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </TableContainer>
//                     )}

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
//                             <MuiPagination
//                                 color="primary"
//                                 count={totalPages}
//                                 page={page}
//                                 onChange={(event, value) => setPage(value)}
//                                 variant="outlined"
//                                 shape="rounded"
//                             />
//                         </Box>
//                     )}
//                 </Paper>

//                 {/* Import/Export Section - Thêm mới ở dưới bảng */}
//                 {/* <Paper elevation={2} sx={{ p: 2, mt: 3, borderRadius: 2 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
//                         <Button
//                             variant="contained"
//                             component="label"
//                             startIcon={<FileUploadIcon />}
//                             size="medium"
//                         >
//                             Chọn File
//                             <input type="file" hidden />
//                         </Button>
//                         <TextField
//                             size="small"
//                             label="Ngày cấp theo dạng"
//                             placeholder="ngày/tháng/năm"
//                             sx={{ width: 180 }}
//                         />
//                         <Button
//                             variant="contained"
//                             size="medium"
//                         >
//                             Import q.định
//                         </Button>
//                         <FormControl size="small" sx={{ minWidth: 180 }}>
//                             <InputLabel>Import c.chỉ vào HK</InputLabel>
//                             <Select
//                                 label="Import c.chỉ vào HK"
//                                 defaultValue="2023_2024_1"
//                             >
//                                 <MenuItem value="2023_2024_1">2023_2024_1</MenuItem>
//                                 <MenuItem value="2023_2024_2">2023_2024_2</MenuItem>
//                                 <MenuItem value="2024_2025_1">2024_2025_1</MenuItem>
//                             </Select>
//                         </FormControl>
//                         <Button
//                             variant="contained"
//                             color="success"
//                             sx={{ ml: 'auto' }}
//                         >
//                             Cập nhật
//                         </Button>
//                     </Box>
//                 </Paper> */}
//             </Container>

//             {/* Dialog thêm mới học viên */}
//             <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
//                 <DialogTitle>Thêm học viên đạt chứng chỉ</DialogTitle>
//                 <DialogContent>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12} md={6}>
//                             <TextField
//                                 name="ma_sinh_vien"
//                                 label="Mã sinh viên"
//                                 variant="outlined"
//                                 fullWidth
//                                 size="small"
//                                 value={newData.ma_sinh_vien}
//                                 onChange={handleInputChange}
//                             />
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <TextField
//                                 name="ho_ten"
//                                 label="Họ và tên"
//                                 variant="outlined"
//                                 fullWidth
//                                 size="small"
//                                 value={newData.ho_ten}
//                                 onChange={handleInputChange}
//                             />
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <TextField
//                                 name="diem_tb"
//                                 label="Điểm trung bình"
//                                 variant="outlined"
//                                 fullWidth
//                                 size="small"
//                                 type="number"
//                                 value={newData.diem_tb}
//                                 onChange={handleInputChange}
//                             />
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <FormControl fullWidth size="small">
//                                 <InputLabel>Xếp loại</InputLabel>
//                                 <Select
//                                     name="xep_loai"
//                                     value={newData.xep_loai}
//                                     label="Xếp loại"
//                                     onChange={handleInputChange}
//                                 >
//                                     <MenuItem value="Xuất sắc">Xuất sắc</MenuItem>
//                                     <MenuItem value="Giỏi">Giỏi</MenuItem>
//                                     <MenuItem value="Khá">Khá</MenuItem>
//                                     <MenuItem value="Trung bình">Trung bình</MenuItem>
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <TextField
//                                 name="so_quyet_dinh"
//                                 label="Số quyết định"
//                                 variant="outlined"
//                                 fullWidth
//                                 size="small"
//                                 value={newData.so_quyet_dinh}
//                                 onChange={handleInputChange}
//                             />
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <TextField
//                                 name="ngay_ky_qd"
//                                 label="Ngày ký quyết định"
//                                 variant="outlined"
//                                 fullWidth
//                                 size="small"
//                                 placeholder="DD/MM/YYYY"
//                                 value={newData.ngay_ky_qd}
//                                 onChange={handleInputChange}
//                             />
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <FormControl fullWidth size="small">
//                                 <InputLabel>Tình trạng</InputLabel>
//                                 <Select
//                                     name="tinh_trang"
//                                     value={newData.tinh_trang}
//                                     label="Tình trạng"
//                                     onChange={handleInputChange}
//                                 >
//                                     <MenuItem value="Bình thường">Bình thường</MenuItem>
//                                     <MenuItem value="Tốt Nghiệp">Tốt Nghiệp</MenuItem>
//                                     <MenuItem value="TB Nghiệp">TB Nghiệp</MenuItem>
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                             <FormControl fullWidth size="small">
//                                 <InputLabel>Trạng thái đạt</InputLabel>
//                                 <Select
//                                     name="da_dat"
//                                     value={newData.da_dat ? 'true' : 'false'}
//                                     label="Trạng thái đạt"
//                                     onChange={(e) => handleInputChange({
//                                         target: { name: 'da_dat', value: e.target.value === 'true' }
//                                     })}
//                                 >
//                                     <MenuItem value={'true'}>Đã đạt</MenuItem>
//                                     <MenuItem value={'false'}>Chưa đạt</MenuItem>
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12}>
//                             <TextField
//                                 name="ghi_chu"
//                                 label="Ghi chú"
//                                 variant="outlined"
//                                 fullWidth
//                                 multiline
//                                 rows={2}
//                                 size="small"
//                                 value={newData.ghi_chu}
//                                 onChange={handleInputChange}
//                             />
//                         </Grid>
//                     </Grid>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseDialog}>Hủy</Button>
//                     <Button variant="contained" onClick={handleSubmitNew} color="primary">
//                         Thêm
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </ThemeProvider>
//     );
// };

// export default QuanLyChungChi;










import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container,
    TextField, InputAdornment, Pagination as MuiPagination, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, createTheme, ThemeProvider,
    Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import { fetchLopByKhoaDaoTao } from "../../Api_controller/Service/thoiKhoaBieuService";
import { laydanhsachloaichungchi } from "../../Api_controller/Service/chungChiService";
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
    ma_sinh_vien: "",
    ho_ten: "",
    diem_tb: "",
    xep_loai: "",
    ghi_chu: "",
    so_quyet_dinh: "",
    ngay_ky_qd: "",
    tinh_trang: "Bình thường",
    loai_chung_chi: "Chuẩn đầu ra TA"
};

// Mock Data
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
        loai_chung_chi: "Chuẩn đầu ra TA"
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
        tinh_trang: "Tốt nghiệp",
        lop_id: 201,
        loai_chung_chi: "Chuẩn đầu ra TA"
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
        tinh_trang: "Tốt nghiệp",
        lop_id: 201,
        loai_chung_chi: "Chuẩn đầu ra TA"
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
        tinh_trang: "bình thường",
        lop_id: 202,
        loai_chung_chi: "Chuẩn đầu ra TA"
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
        loai_chung_chi: "Chuẩn đầu ra TA"
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
        loai_chung_chi: "Chuẩn đầu ra TA"
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
        loai_chung_chi: "Chứng chỉ GDTC"
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
        tinh_trang: "Tốt nghiệp",
        lop_id: 204,
        loai_chung_chi: "Chứng chỉ GDTC"
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

    // Memoized filtered data
    const filterSinhVien = useCallback((sinhVienData = data.sinhVienList) => {
        let filtered = [...sinhVienData];

        // Apply filters
        filtered = filtered.filter(sv => sv.loai_chung_chi === filters.loaiChungChi);

        if (filters.lopId) {
            filtered = filtered.filter(sv => sv.lop_id == filters.lopId);
        }

        // Filter by tinh_trang instead of da_dat
        if (filters.trangThai === 'Bình thường') {
            filtered = filtered.filter(sv => sv.tinh_trang === 'Bình thường');
        } else if (filters.trangThai === 'Tốt nghiệp') {
            filtered = filtered.filter(sv => sv.tinh_trang === 'Tốt nghiệp');
        }

        if (filters.searchTerm) {
            const search = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(sv =>
                sv.ho_ten.toLowerCase().includes(search) ||
                sv.ma_sinh_vien.toLowerCase().includes(search)
            );
        }

        // Pagination
        const totalPages = Math.ceil(filtered.length / ui.pageSize);
        setUi(prev => ({ ...prev, totalPages }));

        const startIndex = (ui.page - 1) * ui.pageSize;
        const endIndex = startIndex + ui.pageSize;
        setFilteredSinhVien(filtered.slice(startIndex, endIndex));

        // Reset page if no results on current page
        if (filtered.length > 0 && startIndex >= filtered.length) {
            setUi(prev => ({ ...prev, page: 1 }));
        }
    }, [filters, ui.page, ui.pageSize, data.sinhVienList]);

    // API calls
    const fetchInitialData = useCallback(async () => {
        setUi(prev => ({ ...prev, isLoading: true }));
        try {
            const [loaiChungChiRes, heDaoTaoRes, lopRes] = await Promise.all([
                laydanhsachloaichungchi(),
                fetchDanhSachHeDaoTao(),
                // getDanhSachLop() // Uncomment when available
            ]);

            // Process certificate types
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
                originalLopList: lopRes || [],
                lopList: lopRes || [],
                sinhVienList: mockSinhVien, // Replace with API when available
                loaiChungChiList
            }));

            filterSinhVien(mockSinhVien);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            toast.error("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [filterSinhVien]);

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

        // Handle cascading filters
        if (filterName === 'heDaoTao') {
            fetchKhoaDaoTao(value);
        } else if (filterName === 'khoaDaoTao') {
            fetchLopByKhoa(value);
        }
    }, [fetchKhoaDaoTao, fetchLopByKhoa]);

    const handlePageChange = useCallback((event, value) => {
        setUi(prev => ({ ...prev, page: value }));
    }, []);

    const handleApplyFilter = useCallback(() => {
        setUi(prev => ({ ...prev, page: 1 }));
        filterSinhVien();
    }, [filterSinhVien]);

    const handleClearFilter = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            heDaoTao: "",
            khoaDaoTao: "",
            lopId: "",
            searchTerm: ""
        }));
        setUi(prev => ({ ...prev, page: 1 }));
        setData(prev => ({ ...prev, khoaDaoTao: [], lopList: prev.originalLopList }));
    }, []);

    const handleSubmitNew = useCallback(async () => {
        try {
            setUi(prev => ({ ...prev, isLoading: true }));

            const newItem = {
                ...newData,
                id: Date.now(),
                lop_id: filters.lopId || 201,
            };

            const updatedList = [...data.sinhVienList, newItem];
            setData(prev => ({ ...prev, sinhVienList: updatedList }));
            filterSinhVien(updatedList);

            toast.success("Thêm chứng chỉ thành công!");
            setUi(prev => ({ ...prev, openDialog: false }));
            setNewData(INIT_NEW_DATA);
        } catch (error) {
            console.error("Lỗi khi thêm chứng chỉ:", error);
            toast.error("Không thể thêm chứng chỉ");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [newData, filters.lopId, data.sinhVienList, filterSinhVien]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) return;

        try {
            setUi(prev => ({ ...prev, isLoading: true }));

            const updatedList = data.sinhVienList.filter(sv => sv.id !== id);
            setData(prev => ({ ...prev, sinhVienList: updatedList }));
            filterSinhVien(updatedList);

            toast.success("Xóa chứng chỉ thành công!");
        } catch (error) {
            console.error("Lỗi khi xóa chứng chỉ:", error);
            toast.error("Không thể xóa chứng chỉ");
        } finally {
            setUi(prev => ({ ...prev, isLoading: false }));
        }
    }, [data.sinhVienList, filterSinhVien]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleOpenDialog = useCallback(() => {
        setUi(prev => ({ ...prev, openDialog: true }));
        setNewData(prev => ({ ...prev, loai_chung_chi: filters.loaiChungChi }));
    }, [filters.loaiChungChi]);

    const handleCloseDialog = useCallback(() => {
        setUi(prev => ({ ...prev, openDialog: false }));
        setNewData(INIT_NEW_DATA);
    }, []);

    // Memoized utility functions
    const findLopName = useCallback((id) =>
        data.originalLopList.find(item => item.id === id)?.ma_lop || "Lớp không xác định",
        [data.originalLopList]
    );

    const formatDate = useCallback((dateString) => dateString || "", []);

    // Effects
    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        filterSinhVien();
    }, [filters, ui.page]);

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

    // Memoized filter criteria check
    const hasActiveFilters = useMemo(() =>
        !!(filters.heDaoTao || filters.khoaDaoTao || filters.lopId || filters.searchTerm),
        [filters.heDaoTao, filters.khoaDaoTao, filters.lopId, filters.searchTerm]
    );

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
                                            backgroundColor: sv.tinh_trang === 'Tốt nghiệp' ? '#f0f8ff' : 'inherit',
                                        }}>
                                            <TableCell align="center">{(ui.page - 1) * ui.pageSize + index + 1}</TableCell>
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
                                            <TableCell>
                                                <Box sx={{
                                                    color: sv.tinh_trang === 'Tốt nghiệp' ? '#2e7d32' : '#1976d2',
                                                    fontWeight: 'medium'
                                                }}>
                                                    {sv.tinh_trang}
                                                </Box>
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
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="ho_ten"
                                label="Họ và tên"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={newData.ho_ten}
                                onChange={handleInputChange}
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
                                placeholder="DD/MM/YYYY"
                                value={newData.ngay_ky_qd}
                                onChange={handleInputChange}
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
        </ThemeProvider>
    );
};

export default QuanLyChungChi;