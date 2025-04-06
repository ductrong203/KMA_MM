// import { useState, useEffect } from "react";
// import {
//     Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container, Dialog,
//     DialogTitle, DialogContent, DialogActions, Card, CardContent, CardActions, IconButton, createTheme,
//     ThemeProvider, TextField, InputAdornment, Autocomplete
// } from "@mui/material";
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import SearchIcon from '@mui/icons-material/Search';
// import { getMonHoc, getThoiKhoaBieu, themThoiKhoaBieu, updateThoiKhoaBieu, xoaThoiKhoaBieu } from "../../Api_controller/Service/monHocService";
// import { getGiangVien } from "../../Api_controller/Service/giangVienService";
// import { getDanhSachLop } from "../../Api_controller/Service/lopService";
// import Pagination from '@mui/material/Pagination';
// import Stack from '@mui/material/Stack';
// import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";

// const theme = createTheme({
//     palette: {
//         primary: { main: '#1976d2' },
//         background: { default: '#f5f5f5' }
//     },
//     typography: { fontFamily: 'Roboto, Arial, sans-serif' }
// });

// const ThoiKhoaBieu = () => {
//     const [open, setOpen] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [editId, setEditId] = useState(null);

//     const [kyHoc, setKyHoc] = useState("");
//     const [lopId, setLopId] = useState("");
//     const [monHocId, setMonHocId] = useState("");
//     const [giangVienId, setGiangVienId] = useState("");
//     const [giangVien, setGiangVien] = useState("");
//     const [phongHoc, setPhongHoc] = useState("");
//     const [tietHoc, setTietHoc] = useState("");
//     const [trangThai, setTrangThai] = useState(1);
//     const [khoaDaoTaoId, setKhoaDaoTaoId] = useState("");
//     const [heDaoTaoId, setHeDaoTaoId] = useState("");
//     const [HeDaoTao, setHeDaoTao] = useState([]);
//     const [khoaDaoTao, setKhoaDaoTao] = useState([]);
//     const [kyHocOptionsForm, setKyHocOptionsForm] = useState([]);
//     const [kyHocOptionsFilter, setKyHocOptionsFilter] = useState([]);

//     const [trangThaiOptions] = useState([
//         { value: 1, label: "Hoạt động" },
//         { value: 0, label: "Không hoạt động" }
//     ]);

//     const [lopSearch, setLopSearch] = useState("");
//     const [monHocSearch, setMonHocSearch] = useState("");
//     const [giangVienSearch, setGiangVienSearch] = useState("");

//     const [originalLopList, setOriginalLopList] = useState([]); // Danh sách lớp gốc để hiển thị thời khóa biểu
//     const [lopList, setLopList] = useState([]); // Danh sách lớp dùng trong form và bộ lọc
//     const [monHocList, setMonHocList] = useState([]);
//     const [giangVienList, setGiangVienList] = useState([]);
//     const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);
//     const [khoaDaoTaoList, setKhoaDaoTaoList] = useState([]);
//     const [lopListView, setLopListView] = useState([]);

//     const [isLoading, setIsLoading] = useState(false);
//     const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
//     const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
//     const [kyHocFilter, setKyHocFilter] = useState("");
//     const [lopIdFilter, setLopIdFilter] = useState("");
//     const [monHocIdFilter, setMonHocIdFilter] = useState("");
//     const [page, setPage] = useState(1);
//     const [pageSize] = useState(6);
//     const [totalPages, setTotalPages] = useState(1);

//     // Tải dữ liệu ban đầu
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setIsLoading(true);
//             try {
//                 const [heDaoTao, giangVien, khoaDaoTao, monHoc, lop, thoiKhoaBieu] = await Promise.all([
//                     fetchHeDaoTaoList(),
//                     fetchGiangVienList(),
//                     fetchAllKhoaDaoTaoList(),
//                     fetchMonHocList(),
//                     fetchLopList(),
//                     fetchThoiKhoaBieu()
//                 ]);
//                 setOriginalLopList(lop); // Lưu danh sách lớp gốc
//                 setLopList(lop); // Ban đầu, lopList cũng bằng danh sách gốc
//                 setLopListView(lop);
//             } catch (error) {
//                 console.error("Lỗi khi tải dữ liệu ban đầu:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, []);

//     const fetchAllKhoaDaoTaoList = async () => {
//         try {
//             const response = await getDanhSachKhoaDaoTao();
//             setKhoaDaoTaoList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchKhoaDaoTaoList = async (heDaoTaoId) => {
//         try {
//             const response = await getDanhSachKhoaDaoTaobyId(heDaoTaoId);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchLopByKhoaDaoTao = async (khoaDaoTaoId) => {
//         try {
//             const response = await fetch(`http://localhost:8000/lop/bykhoadaotao?khoa_dao_tao_id=${khoaDaoTaoId}`);
//             const data = await response.json();
//             setLopList(data); // Chỉ cập nhật lopList cho form
//             setLopListView(data); // Cập nhật lopListView cho bộ lọc
//             return data;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách lớp theo khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchLopList = async () => {
//         try {
//             const response = await getDanhSachLop();
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách lớp:", error);
//             return [];
//         }
//     };

//     const fetchHeDaoTaoList = async () => {
//         try {
//             const response = await fetchDanhSachHeDaoTao();
//             setHeDaoTao(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách hệ đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchMonHocList = async () => {
//         try {
//             const response = await getMonHoc();
//             setMonHocList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách môn học:", error);
//             return [];
//         }
//     };

//     const fetchGiangVienList = async () => {
//         try {
//             const response = await getGiangVien();
//             setGiangVienList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách giảng viên:", error);
//             return [];
//         }
//     };

//     const fetchThoiKhoaBieu = async () => {
//         let url = `http://localhost:8000/thoikhoabieu/getbypage?page=${page}&pageSize=${pageSize}`;
//         if (kyHocFilter || lopIdFilter || monHocIdFilter) {
//             url = `http://localhost:8000/thoikhoabieu/filterbyid?page=${page}&pageSize=${pageSize}`;
//             if (kyHocFilter) url += `&ky_hoc=${kyHocFilter}`;
//             if (lopIdFilter) url += `&lop_id=${lopIdFilter}`;
//             if (monHocIdFilter) url += `&mon_hoc_id=${monHocIdFilter}`;
//         }
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             setThoiKhoaBieuList(data.data || []);
//             setTotalPages(data.totalPages || 1);
//             return data.data;
//         } catch (error) {
//             console.error("Lỗi khi lấy dữ liệu thời khóa biểu:", error);
//             return [];
//         }
//     };

//     useEffect(() => {
//         if (heDaoTaoFilter) {
//             fetchKhoaDaoTaoList(heDaoTaoFilter).then((response) => {
//                 setKhoaDaoTao(response);
//             });
//         } else {
//             setKhoaDaoTao([]);
//             setKyHocOptionsFilter([]);
//             setLopList(originalLopList); // Khôi phục danh sách lớp ban đầu
//             setLopListView(originalLopList);
//         }
//     }, [heDaoTaoFilter, originalLopList]);

//     useEffect(() => {
//         if (heDaoTaoId) {
//             fetchKhoaDaoTaoList(heDaoTaoId).then((response) => {
//                 setKhoaDaoTao(response);
//             });
//         } else {
//             setKhoaDaoTao([]);
//             setKyHocOptionsForm([]);
//             setLopList(originalLopList); // Khôi phục danh sách lớp ban đầu
//         }
//     }, [heDaoTaoId, originalLopList]);

//     useEffect(() => {
//         if (khoaDaoTaoFilter) {
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsFilter(kyHocArray);
//                 fetchLopByKhoaDaoTao(khoaDaoTaoFilter);
//             }
//         } else {
//             setKyHocOptionsFilter([]);
//             setLopList(originalLopList); // Khôi phục danh sách lớp ban đầu
//             setLopListView(originalLopList);
//         }
//     }, [khoaDaoTaoFilter, khoaDaoTao, originalLopList]);

//     useEffect(() => {
//         if (khoaDaoTaoId) {
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoId);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsForm(kyHocArray);
//                 fetchLopByKhoaDaoTao(khoaDaoTaoId);
//             }
//         } else {
//             setKyHocOptionsForm([]);
//             setLopList(originalLopList); // Khôi phục danh sách lớp ban đầu
//         }
//     }, [khoaDaoTaoId, khoaDaoTao, originalLopList]);

//     useEffect(() => {
//         fetchThoiKhoaBieu();
//     }, [page, kyHocFilter, lopIdFilter, monHocIdFilter]);

//     const handlekhoaChange = (event) => setKhoaDaoTaoId(event.target.value);
//     const handleKyHocChange = (event) => setKyHoc(event.target.value);
//     const handleHeDaoTaoChange = (event) => setHeDaoTaoId(event.target.value);
//     const handleLopChange = (event) => setLopId(event.target.value);
//     const handleMonHocChange = (event) => setMonHocId(event.target.value);
//     const handleGiangVienChange = (event) => {
//         const selectedId = event.target.value;
//         setGiangVienId(selectedId);
//         const selectedGV = giangVienList.find(gv => gv.id === selectedId);
//         setGiangVien(selectedGV ? selectedGV.ho_ten : "");
//     };
//     const handleTrangThaiChange = (event) => setTrangThai(event.target.value);

//     const filteredLopList = lopList.filter(lop => lop.ma_lop.toLowerCase().includes(lopSearch.toLowerCase()));
//     const filteredMonHocList = monHocList.filter(monHoc => monHoc.ten_mon_hoc.toLowerCase().includes(monHocSearch.toLowerCase()));
//     const filteredGiangVienList = giangVienList.filter(giangVien => giangVien.ho_ten.toLowerCase().includes(giangVienSearch.toLowerCase()));

//     const handleSubmit = async () => {
//         if (lopId && monHocId && kyHoc) {
//             setIsLoading(true);
//             const thoiKhoaBieuData = {
//                 ky_hoc: kyHoc,
//                 lop_id: lopId,
//                 mon_hoc_id: monHocId,
//                 giang_vien_id: giangVienId,
//                 giang_vien: giangVien,
//                 phong_hoc: phongHoc,
//                 tiet_hoc: tietHoc,
//                 trang_thai: trangThai
//             };
//             try {
//                 if (editId !== null) {
//                     await updateThoiKhoaBieu(editId, thoiKhoaBieuData);
//                 } else {
//                     await themThoiKhoaBieu(thoiKhoaBieuData);
//                 }
//                 fetchThoiKhoaBieu();
//                 resetForm();
//             } catch (error) {
//                 console.error("Lỗi khi lưu thời khóa biểu:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//     };

//     const resetForm = () => {
//         setGiangVienId("");
//         setGiangVien("");
//         setPhongHoc("");
//         setTietHoc("");
//         setTrangThai(1);
//         setKyHoc("");
//         setLopId("");
//         setMonHocId("");
//         setKhoaDaoTaoId("");
//         setHeDaoTaoId("");
//         setKyHocOptionsForm([]);
//         setLopSearch("");
//         setMonHocSearch("");
//         setGiangVienSearch("");
//         setEditIndex(null);
//         setEditId(null);
//         setOpen(false);
//         setLopList(originalLopList); // Khôi phục danh sách lớp ban đầu khi reset
//     };

//     const handleOpenForm = () => {
//         resetForm();
//         setHeDaoTaoId(heDaoTaoFilter || "");
//         setKhoaDaoTaoId(khoaDaoTaoFilter || "");
//         setKyHoc(kyHocFilter || "");
//         setLopId(lopIdFilter || "");
//         setMonHocId(monHocIdFilter || "");
//         if (khoaDaoTaoFilter) {
//             fetchLopByKhoaDaoTao(khoaDaoTaoFilter);
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsForm(kyHocArray);
//             }
//         }
//         setOpen(true);
//     };

//     const handleEdit = (tkb, index) => {
//         setKyHoc(tkb.ky_hoc || "");
//         setLopId(tkb.lop_id || "");
//         setMonHocId(tkb.mon_hoc_id || "");
//         setGiangVienId(tkb.giang_vien_id || "");
//         setGiangVien(tkb.giang_vien || "");
//         setPhongHoc(tkb.phong_hoc || "");
//         setTietHoc(tkb.tiet_hoc || "");
//         setTrangThai(tkb.trang_thai !== undefined ? tkb.trang_thai : 1);
//         setEditIndex(index);
//         setEditId(tkb.id);
//         setOpen(true);

//         const selectedKhoa = khoaDaoTaoList.find(khoa => khoa.id === tkb.khoaDaoTaoId);
//         if (selectedKhoa) {
//             setHeDaoTaoId(selectedKhoa.he_dao_tao_id);
//             setKhoaDaoTaoId(selectedKhoa.id);
//             fetchLopByKhoaDaoTao(selectedKhoa.id);
//             const kyHocCount = selectedKhoa.so_ky_hoc;
//             const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//             setKyHocOptionsForm(kyHocArray);
//         }
//     };

//     const handleDelete = async (id) => {
//         try {
//             await xoaThoiKhoaBieu(id);
//             fetchThoiKhoaBieu();
//         } catch (error) {
//             console.error("Lỗi khi xóa thời khóa biểu:", error);
//         }
//     };

//     const findLopName = (id) => originalLopList.find(item => item.id === id)?.ma_lop || "Lớp không xác định"; // Sử dụng originalLopList
//     const findMonHoc = (id) => monHocList.find(item => item.id === id) || { ten_mon_hoc: "Môn học không xác định", ma_mon_hoc: "N/A", so_tin_chi: "N/A", tinh_diem: "N/A", he_dao_tao_id: null, ghi_chu: "N/A" };
//     const findGiangVienName = (id) => giangVienList.find(item => item.id === id)?.ho_ten || "Giảng viên không xác định";
//     const findHeDaoTaoName = (id) => HeDaoTao.find(item => item.id === id)?.ten_he_dao_tao || "Hệ đào tạo không xác định";

//     return (
//         <ThemeProvider theme={theme}>
//             <Container maxWidth="md" sx={{ py: 4 }}>
//                 <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
//                     <Typography variant="h4" color="primary" gutterBottom textAlign="center">
//                         Thời Khóa Biểu
//                     </Typography>

//                     <Box textAlign="center" my={2}>
//                         <Button
//                             variant="contained"
//                             startIcon={<AddIcon />}
//                             onClick={handleOpenForm}
//                         >
//                             Thêm Thời Khóa Biểu
//                         </Button>
//                     </Box>

//                     {/* Bộ lọc */}
//                     <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, maxWidth: 900, backgroundColor: "#fff" }}>
//                         <Grid container spacing={2} justifyContent="center">
//                             <Grid item xs={12} sm={4} md={3}>
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

//                             <Grid item xs={12} sm={4} md={3}>
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

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Kỳ học</InputLabel>
//                                     <Select
//                                         value={kyHocFilter}
//                                         onChange={(e) => setKyHocFilter(e.target.value)}
//                                         label="Kỳ học"
//                                         disabled={!khoaDaoTaoFilter}
//                                     >
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {kyHocOptionsFilter.map((option) => (
//                                             <MenuItem key={option} value={option}>{option}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} sm={4} md={3}>
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

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Môn học</InputLabel>
//                                     <Select
//                                         value={monHocIdFilter}
//                                         onChange={(e) => setMonHocIdFilter(e.target.value)}
//                                         label="Môn học"
//                                     >
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {monHocList.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ten_mon_hoc}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} textAlign="center">
//                                 <Button
//                                     variant="contained"
//                                     sx={{
//                                         minWidth: 180,
//                                         textTransform: "none",
//                                         mt: 2,
//                                         backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#d32f2f" : "#1976d2",
//                                         "&:hover": { backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#b71c1c" : "#115293" }
//                                     }}
//                                     onClick={() => {
//                                         if (kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter) {
//                                             setKyHocFilter("");
//                                             setLopIdFilter("");
//                                             setHeDaoTaoFilter("");
//                                             setKhoaDaoTaoFilter("");
//                                             setMonHocIdFilter("");
//                                             setLopList(originalLopList); // Khôi phục danh sách lớp
//                                             setLopListView(originalLopList);
//                                             fetchThoiKhoaBieu();
//                                         } else {
//                                             fetchThoiKhoaBieu();
//                                         }
//                                     }}
//                                 >
//                                     {kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "Hủy Bộ Lọc" : "Áp Dụng"}
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Box>

//                     {isLoading ? (
//                         <Typography variant="body1" textAlign="center" sx={{ my: 4 }}>Đang tải dữ liệu...</Typography>
//                     ) : thoiKhoaBieuList.length === 0 ? (
//                         <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
//                             Chưa có thời khóa biểu nào được thêm
//                         </Typography>
//                     ) : (
//                         <Grid container spacing={3} sx={{ mt: 2 }}>
//                             {thoiKhoaBieuList.map((tkb, index) => {
//                                 const monHoc = findMonHoc(tkb.mon_hoc_id);
//                                 return (
//                                     <Grid item xs={12} sm={6} md={4} key={tkb.id || index}>
//                                         <Card variant="outlined">
//                                             <CardContent>
//                                                 <Typography variant="h6" color="primary" gutterBottom>
//                                                     {monHoc.ten_mon_hoc}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Mã môn học:</strong> {monHoc.ma_mon_hoc}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Số tín chỉ:</strong> {monHoc.so_tin_chi}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Tính điểm:</strong> {monHoc.tinh_diem === 1 ? "Có" : "Không"}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Hệ đào tạo:</strong> {findHeDaoTaoName(monHoc.he_dao_tao_id)}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Ghi chú:</strong> {monHoc.ghi_chu}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Lớp:</strong> {findLopName(tkb.lop_id)}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Kỳ học:</strong> {tkb.ky_hoc || "Chưa xác định"}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Giảng viên:</strong> {tkb.giang_vien || findGiangVienName(tkb.giang_vien_id)}
//                                                 </Typography>
//                                                 {tkb.phong_hoc && (
//                                                     <Typography variant="body2" color="textSecondary">
//                                                         <strong>Phòng học:</strong> {tkb.phong_hoc}
//                                                     </Typography>
//                                                 )}
//                                                 {tkb.tiet_hoc && (
//                                                     <Typography variant="body2" color="textSecondary">
//                                                         <strong>Tiết học:</strong> {tkb.tiet_hoc}
//                                                     </Typography>
//                                                 )}
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Trạng thái:</strong> {tkb.trang_thai === 1 ? "Hoạt động" : "Không hoạt động"}
//                                                 </Typography>
//                                             </CardContent>
//                                             <CardActions sx={{ justifyContent: "center" }}>
//                                                 <IconButton color="primary" size="small" onClick={() => handleEdit(tkb, index)}>
//                                                     <EditIcon />
//                                                 </IconButton>
//                                                 <IconButton color="error" size="small" onClick={() => handleDelete(tkb.id)}>
//                                                     <DeleteIcon />
//                                                 </IconButton>
//                                             </CardActions>
//                                         </Card>
//                                     </Grid>
//                                 );
//                             })}
//                         </Grid>
//                     )}

//                     <Box textAlign="center" mt={4}>
//                         <Stack spacing={2} alignItems="center">
//                             <Pagination
//                                 count={totalPages}
//                                 page={page}
//                                 onChange={(event, value) => setPage(value)}
//                                 color="primary"
//                             />
//                         </Stack>
//                     </Box>
//                 </Paper>
//             </Container>

//             <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
//                 <DialogTitle>{editId !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
//                 <DialogContent>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={4}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Hệ đào tạo</InputLabel>
//                                 <Select value={heDaoTaoId} onChange={handleHeDaoTaoChange}>
//                                     <MenuItem value="">Chọn hệ đào tạo</MenuItem>
//                                     {HeDaoTao?.map((option) => (
//                                         <MenuItem key={option.id} value={option.id}>{option.ten_he_dao_tao}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} sm={8}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Khóa đào tạo</InputLabel>
//                                 <Select value={khoaDaoTaoId} onChange={handlekhoaChange} disabled={!heDaoTaoId}>
//                                     <MenuItem value="">Chọn khóa đào tạo</MenuItem>
//                                     {khoaDaoTao.map((option) => (
//                                         <MenuItem key={option.id} value={option.id}>{option.ten_khoa}  | niên khóa  {option.nam_hoc}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Kỳ học</InputLabel>
//                                 <Select value={kyHoc} onChange={handleKyHocChange} disabled={!khoaDaoTaoId}>
//                                     <MenuItem value="">Chọn kỳ học</MenuItem>
//                                     {kyHocOptionsForm.map((option) => (
//                                         <MenuItem key={option} value={option}>{option}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={8}>
//                             <FormControl fullWidth size="small">
//                                 <InputLabel>Lớp</InputLabel>
//                                 <Select
//                                     value={lopId}
//                                     onChange={handleLopChange}
//                                     label="Lớp"
//                                     MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
//                                 >
//                                     <MenuItem value="">Chọn lớp</MenuItem>
//                                     {filteredLopList.map((lop) => (
//                                         <MenuItem key={lop.id} value={lop.id}>{lop.ma_lop}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} sm={4}>
//                             <TextField
//                                 fullWidth
//                                 size="small"
//                                 placeholder="Tìm kiếm lớp..."
//                                 value={lopSearch}
//                                 onChange={(e) => setLopSearch(e.target.value)}
//                                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                             />
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={8}>
//                             <Autocomplete
//                                 freeSolo
//                                 options={filteredMonHocList}
//                                 getOptionLabel={(option) => (typeof option === "string" ? option : option.ten_mon_hoc)}
//                                 value={filteredMonHocList.find((m) => m.id === monHocId) || null}
//                                 onChange={(event, newValue) => {
//                                     if (typeof newValue === "string") {
//                                         handleMonHocChange({ target: { value: newValue } });
//                                     } else if (newValue) {
//                                         handleMonHocChange({ target: { value: newValue.id } });
//                                     } else {
//                                         handleMonHocChange({ target: { value: "" } });
//                                     }
//                                 }}
//                                 renderInput={(params) => <TextField {...params} label="Môn học" fullWidth size="small" />}
//                             />
//                         </Grid>
//                         <Grid item xs={12} sm={4}>
//                             <TextField
//                                 fullWidth
//                                 size="small"
//                                 placeholder="Tìm kiếm môn học..."
//                                 value={monHocSearch}
//                                 onChange={(e) => setMonHocSearch(e.target.value)}
//                                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                             />
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={8}>
//                             <Autocomplete
//                                 freeSolo
//                                 options={filteredGiangVienList}
//                                 getOptionLabel={(option) => option.ho_ten}
//                                 value={filteredGiangVienList.find((g) => g.id === giangVienId) || null}
//                                 onChange={(event, newValue) => handleGiangVienChange({ target: { value: newValue ? newValue.id : "" } })}
//                                 renderInput={(params) => <TextField {...params} label="Giảng viên" fullWidth size="small" />}
//                             />
//                         </Grid>
//                         <Grid item xs={12} sm={4}>
//                             <TextField
//                                 fullWidth
//                                 size="small"
//                                 placeholder="Tìm kiếm giảng viên..."
//                                 value={giangVienSearch}
//                                 onChange={(e) => setGiangVienSearch(e.target.value)}
//                                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                             />
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={6}>
//                             <TextField
//                                 fullWidth
//                                 label="Phòng học"
//                                 value={phongHoc}
//                                 onChange={(e) => setPhongHoc(e.target.value)}
//                                 placeholder="Ví dụ: 103 TA1"
//                                 margin="dense"
//                             />
//                         </Grid>
//                         <Grid item xs={12} sm={6}>
//                             <TextField
//                                 fullWidth
//                                 label="Tiết học"
//                                 value={tietHoc}
//                                 onChange={(e) => setTietHoc(e.target.value)}
//                                 placeholder="Ví dụ: 2-4"
//                                 margin="dense"
//                             />
//                         </Grid>
//                     </Grid>
//                     <FormControl fullWidth margin="dense">
//                         <InputLabel sx={{ backgroundColor: "white" }}>Trạng thái</InputLabel>
//                         <Select value={trangThai} onChange={handleTrangThaiChange}>
//                             {trangThaiOptions.map((option) => (
//                                 <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={resetForm} color="secondary">Hủy</Button>
//                     <Button
//                         onClick={handleSubmit}
//                         color="primary"
//                         variant="contained"
//                         disabled={!lopId || !monHocId || !kyHoc || isLoading}
//                     >
//                         {isLoading ? "Đang xử lý..." : (editId !== null ? "Cập nhật" : "Xác nhận")}
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </ThemeProvider>
//     );
// };

// export default ThoiKhoaBieu;























// import { useState, useEffect } from "react";
// import {
//     Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container, Dialog,
//     DialogTitle, DialogContent, DialogActions, Card, CardContent, CardActions, IconButton, createTheme,
//     ThemeProvider, TextField, InputAdornment, Autocomplete, Pagination as MuiPagination
// } from "@mui/material";
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import SearchIcon from '@mui/icons-material/Search';
// import { getMonHoc, getThoiKhoaBieu, themThoiKhoaBieu, updateThoiKhoaBieu, xoaThoiKhoaBieu } from "../../Api_controller/Service/monHocService";
// import { getGiangVien } from "../../Api_controller/Service/giangVienService";
// import { getDanhSachLop } from "../../Api_controller/Service/lopService";
// import Pagination from '@mui/material/Pagination';
// import Stack from '@mui/material/Stack';
// import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";

// const theme = createTheme({
//     palette: {
//         primary: { main: '#1976d2' },
//         background: { default: '#f5f5f5' }
//     },
//     typography: { fontFamily: 'Roboto, Arial, sans-serif' }
// });

// const ThoiKhoaBieu = () => {
//     const [open, setOpen] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [editId, setEditId] = useState(null);

//     const [kyHoc, setKyHoc] = useState("");
//     const [lopId, setLopId] = useState("");
//     const [monHocId, setMonHocId] = useState("");
//     const [giangVienId, setGiangVienId] = useState("");
//     const [giangVien, setGiangVien] = useState("");
//     const [phongHoc, setPhongHoc] = useState("");
//     const [tietHoc, setTietHoc] = useState("");
//     const [trangThai, setTrangThai] = useState(1);
//     const [khoaDaoTaoId, setKhoaDaoTaoId] = useState("");
//     const [heDaoTaoId, setHeDaoTaoId] = useState("");
//     const [HeDaoTao, setHeDaoTao] = useState([]);
//     const [khoaDaoTao, setKhoaDaoTao] = useState([]);
//     const [kyHocOptionsForm, setKyHocOptionsForm] = useState([]);
//     const [kyHocOptionsFilter, setKyHocOptionsFilter] = useState([]);

//     const [trangThaiOptions] = useState([
//         { value: 1, label: "Hoạt động" },
//         { value: 0, label: "Không hoạt động" }
//     ]);

//     const [lopSearch, setLopSearch] = useState("");
//     const [monHocSearch, setMonHocSearch] = useState("");
//     const [giangVienSearch, setGiangVienSearch] = useState("");

//     const [originalLopList, setOriginalLopList] = useState([]);
//     const [lopList, setLopList] = useState([]);
//     const [monHocList, setMonHocList] = useState([]);
//     const [giangVienList, setGiangVienList] = useState([]);
//     const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);
//     const [khoaDaoTaoList, setKhoaDaoTaoList] = useState([]);
//     const [lopListView, setLopListView] = useState([]);

//     const [isLoading, setIsLoading] = useState(false);
//     const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
//     const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
//     const [kyHocFilter, setKyHocFilter] = useState("");
//     const [lopIdFilter, setLopIdFilter] = useState("");
//     const [monHocIdFilter, setMonHocIdFilter] = useState("");
//     const [page, setPage] = useState(1);
//     const [pageSize] = useState(6);
//     const [totalPages, setTotalPages] = useState(1);

//     // Tải dữ liệu ban đầu
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setIsLoading(true);
//             try {
//                 const [heDaoTao, giangVien, khoaDaoTao, monHoc, lop, thoiKhoaBieu] = await Promise.all([
//                     fetchHeDaoTaoList(),
//                     fetchGiangVienList(),
//                     fetchAllKhoaDaoTaoList(),
//                     fetchMonHocList(),
//                     fetchLopList(),
//                     fetchThoiKhoaBieu()
//                 ]);
//                 setOriginalLopList(lop);
//                 setLopList(lop);
//                 setLopListView(lop);
//                 setMonHocList(monHoc);
//             } catch (error) {
//                 console.error("Lỗi khi tải dữ liệu ban đầu:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, []);

//     const fetchAllKhoaDaoTaoList = async () => {
//         try {
//             const response = await getDanhSachKhoaDaoTao();
//             setKhoaDaoTaoList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchKhoaDaoTaoList = async (heDaoTaoId) => {
//         try {
//             const response = await getDanhSachKhoaDaoTaobyId(heDaoTaoId);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchLopByKhoaDaoTao = async (khoaDaoTaoId) => {
//         try {
//             const response = await fetch(`http://localhost:8000/lop/bykhoadaotao?khoa_dao_tao_id=${khoaDaoTaoId}`);
//             const data = await response.json();
//             setLopList(data);
//             setLopListView(data);
//             return data;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách lớp theo khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchLopList = async () => {
//         try {
//             const response = await getDanhSachLop();
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách lớp:", error);
//             return [];
//         }
//     };

//     const fetchHeDaoTaoList = async () => {
//         try {
//             const response = await fetchDanhSachHeDaoTao();
//             setHeDaoTao(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách hệ đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchMonHocList = async () => {
//         try {
//             const response = await getMonHoc();
//             setMonHocList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách môn học:", error);
//             return [];
//         }
//     };

//     const fetchMonHocByHeDaoTao = async (heDaoTaoId) => {
//         try {
//             const response = await fetch(`http://localhost:8000/mon-hoc/getByHeDaoTaoId/${heDaoTaoId}`);
//             const data = await response.json();
//             return data.data || [];
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách môn học theo hệ đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchGiangVienList = async () => {
//         try {
//             const response = await getGiangVien();
//             setGiangVienList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách giảng viên:", error);
//             return [];
//         }
//     };

//     const fetchThoiKhoaBieu = async () => {
//         let url = `http://localhost:8000/thoikhoabieu/getbypage?page=${page}&pageSize=${pageSize}`;
//         if (kyHocFilter || lopIdFilter || monHocIdFilter) {
//             url = `http://localhost:8000/thoikhoabieu/filterbyid?page=${page}&pageSize=${pageSize}`;
//             if (kyHocFilter) url += `&ky_hoc=${kyHocFilter}`;
//             if (lopIdFilter) url += `&lop_id=${lopIdFilter}`;
//             if (monHocIdFilter) url += `&mon_hoc_id=${monHocIdFilter}`;
//         }
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             setThoiKhoaBieuList(data.data || []);
//             setTotalPages(data.totalPages || 1);
//             return data.data;
//         } catch (error) {
//             console.error("Lỗi khi lấy dữ liệu thời khóa biểu:", error);
//             return [];
//         }
//     };

//     const handlePageChange = (event, value) => {
//         setPage(value);
//     };

//     useEffect(() => {
//         if (heDaoTaoFilter) {
//             Promise.all([
//                 fetchKhoaDaoTaoList(heDaoTaoFilter),
//                 fetchMonHocByHeDaoTao(heDaoTaoFilter)
//             ]).then(([khoaResponse, monHocResponse]) => {
//                 setKhoaDaoTao(khoaResponse);
//                 setMonHocList(monHocResponse);
//             });
//         } else {
//             setKhoaDaoTao([]);
//             setKyHocOptionsFilter([]);
//             setLopList(originalLopList);
//             setLopListView(originalLopList);
//             fetchMonHocList().then(setMonHocList);
//         }
//     }, [heDaoTaoFilter, originalLopList]);

//     useEffect(() => {
//         if (heDaoTaoId) {
//             Promise.all([
//                 fetchKhoaDaoTaoList(heDaoTaoId),
//                 fetchMonHocByHeDaoTao(heDaoTaoId)
//             ]).then(([khoaResponse, monHocResponse]) => {
//                 setKhoaDaoTao(khoaResponse);
//                 setMonHocList(monHocResponse);
//             });
//         } else {
//             setKhoaDaoTao([]);
//             setKyHocOptionsForm([]);
//             setLopList(originalLopList);
//             fetchMonHocList().then(setMonHocList);
//         }
//     }, [heDaoTaoId, originalLopList]);

//     useEffect(() => {
//         if (khoaDaoTaoFilter) {
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsFilter(kyHocArray);
//                 fetchLopByKhoaDaoTao(khoaDaoTaoFilter);
//             }
//         } else {
//             setKyHocOptionsFilter([]);
//             setLopList(originalLopList);
//             setLopListView(originalLopList);
//         }
//     }, [khoaDaoTaoFilter, khoaDaoTao, originalLopList]);

//     useEffect(() => {
//         if (khoaDaoTaoId) {
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoId);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsForm(kyHocArray);
//                 fetchLopByKhoaDaoTao(khoaDaoTaoId);
//             }
//         } else {
//             setKyHocOptionsForm([]);
//             setLopList(originalLopList);
//         }
//     }, [khoaDaoTaoId, khoaDaoTao, originalLopList]);

//     useEffect(() => {
//         fetchThoiKhoaBieu();
//     }, [page, kyHocFilter, lopIdFilter, monHocIdFilter]);

//     const handlekhoaChange = (event) => setKhoaDaoTaoId(event.target.value);
//     const handleKyHocChange = (event) => setKyHoc(event.target.value);
//     const handleHeDaoTaoChange = (event) => setHeDaoTaoId(event.target.value);
//     const handleLopChange = (event) => setLopId(event.target.value);
//     const handleMonHocChange = (event) => setMonHocId(event.target.value);
//     const handleGiangVienChange = (event) => {
//         const selectedId = event.target.value;
//         setGiangVienId(selectedId);
//         const selectedGV = giangVienList.find(gv => gv.id === selectedId);
//         setGiangVien(selectedGV ? selectedGV.ho_ten : "");
//     };
//     const handleTrangThaiChange = (event) => setTrangThai(event.target.value);

//     const filteredLopList = lopList.filter(lop => lop.ma_lop.toLowerCase().includes(lopSearch.toLowerCase()));
//     const filteredMonHocList = monHocList.filter(monHoc => monHoc.ten_mon_hoc.toLowerCase().includes(monHocSearch.toLowerCase()));
//     const filteredGiangVienList = giangVienList.filter(giangVien => giangVien.ho_ten.toLowerCase().includes(giangVienSearch.toLowerCase()));

//     const handleSubmit = async () => {
//         if (lopId && monHocId && kyHoc) {
//             setIsLoading(true);
//             const thoiKhoaBieuData = {
//                 ky_hoc: kyHoc,
//                 lop_id: lopId,
//                 mon_hoc_id: monHocId,
//                 giang_vien_id: giangVienId,
//                 giang_vien: giangVien,
//                 phong_hoc: phongHoc,
//                 tiet_hoc: tietHoc,
//                 trang_thai: trangThai
//             };
//             try {
//                 if (editId !== null) {
//                     await updateThoiKhoaBieu(editId, thoiKhoaBieuData);
//                 } else {
//                     await themThoiKhoaBieu(thoiKhoaBieuData);
//                 }
//                 fetchThoiKhoaBieu();
//                 resetForm();
//             } catch (error) {
//                 console.error("Lỗi khi lưu thời khóa biểu:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//     };

//     const resetForm = () => {
//         setGiangVienId("");
//         setGiangVien("");
//         setPhongHoc("");
//         setTietHoc("");
//         setTrangThai(1);
//         setKyHoc("");
//         setLopId("");
//         setMonHocId("");
//         // setKhoaDaoTaoId("");   // không reset để k ảnh hưởng đến bộ lọc bên ngoài 
//         // setHeDaoTaoId("");// không reset để k ảnh hưởng đến bộ lọc bên ngoài 
//         setKyHocOptionsForm([]);
//         setLopSearch("");
//         setMonHocSearch("");
//         setGiangVienSearch("");
//         setEditIndex(null);
//         setEditId(null);
//         setOpen(false);
//         setLopList(originalLopList);
//     };

//     const handleOpenForm = () => {
//         resetForm();
//         setHeDaoTaoId(heDaoTaoFilter || "");
//         setKhoaDaoTaoId(khoaDaoTaoFilter || "");
//         setKyHoc(kyHocFilter || "");
//         setLopId(lopIdFilter || "");
//         setMonHocId(monHocIdFilter || "");

//         if (heDaoTaoFilter) {
//             fetchMonHocByHeDaoTao(heDaoTaoFilter).then(setMonHocList);
//         }
//         if (khoaDaoTaoFilter) {
//             fetchLopByKhoaDaoTao(khoaDaoTaoFilter);
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsForm(kyHocArray);
//             }
//         }
//         setOpen(true);
//     };

//     const handleEdit = (tkb, index) => {
//         setKyHoc(tkb.ky_hoc || "");
//         setLopId(tkb.lop_id || "");
//         setMonHocId(tkb.mon_hoc_id || "");
//         setGiangVienId(tkb.giang_vien_id || "");
//         setGiangVien(tkb.giang_vien || "");
//         setPhongHoc(tkb.phong_hoc || "");
//         setTietHoc(tkb.tiet_hoc || "");
//         setTrangThai(tkb.trang_thai !== undefined ? tkb.trang_thai : 1);
//         setEditIndex(index);
//         setEditId(tkb.id);
//         setOpen(true);

//         const selectedKhoa = khoaDaoTaoList.find(khoa => khoa.id === tkb.khoaDaoTaoId);
//         if (selectedKhoa) {
//             setHeDaoTaoId(selectedKhoa.he_dao_tao_id);
//             setKhoaDaoTaoId(selectedKhoa.id);
//             fetchLopByKhoaDaoTao(selectedKhoa.id);
//             fetchMonHocByHeDaoTao(selectedKhoa.he_dao_tao_id).then(setMonHocList);
//             const kyHocCount = selectedKhoa.so_ky_hoc;
//             const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//             setKyHocOptionsForm(kyHocArray);
//         }
//     };

//     const handleDelete = async (id) => {
//         try {
//             await xoaThoiKhoaBieu(id);
//             fetchThoiKhoaBieu();
//         } catch (error) {
//             console.error("Lỗi khi xóa thời khóa biểu:", error);
//         }
//     };

//     const findLopName = (id) => originalLopList.find(item => item.id === id)?.ma_lop || "Lớp không xác định";
//     const findMonHoc = (id) => monHocList.find(item => item.id === id) || { ten_mon_hoc: "Môn học không xác định", ma_mon_hoc: "N/A", so_tin_chi: "N/A", tinh_diem: "N/A", he_dao_tao_id: null, ghi_chu: "N/A" };
//     const findGiangVienName = (id) => giangVienList.find(item => item.id === id)?.ho_ten || "Giảng viên không xác định";
//     const findHeDaoTaoName = (id) => HeDaoTao.find(item => item.id === id)?.ten_he_dao_tao || "Hệ đào tạo không xác định";

//     return (
//         <ThemeProvider theme={theme}>
//             <Container maxWidth="md" sx={{ py: 4 }}>
//                 <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
//                     <Typography variant="h4" color="primary" gutterBottom textAlign="center">
//                         Thời Khóa Biểu
//                     </Typography>

//                     <Box textAlign="center" my={2}>
//                         <Button
//                             variant="contained"
//                             startIcon={<AddIcon />}
//                             onClick={handleOpenForm}
//                         >
//                             Thêm Thời Khóa Biểu
//                         </Button>
//                     </Box>

//                     {/* Bộ lọc */}
//                     <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, maxWidth: 900, backgroundColor: "#fff" }}>
//                         <Grid container spacing={2} justifyContent="center">
//                             <Grid item xs={12} sm={4} md={3}>
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

//                             <Grid item xs={12} sm={4} md={3}>
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

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Kỳ học</InputLabel>
//                                     <Select
//                                         value={kyHocFilter}
//                                         onChange={(e) => setKyHocFilter(e.target.value)}
//                                         label="Kỳ học"
//                                         disabled={!khoaDaoTaoFilter}
//                                     >
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {kyHocOptionsFilter.map((option) => (
//                                             <MenuItem key={option} value={option}>{option}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} sm={4} md={3}>
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

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Môn học</InputLabel>
//                                     <Select
//                                         value={monHocIdFilter}
//                                         onChange={(e) => setMonHocIdFilter(e.target.value)}
//                                         label="Môn học"
//                                     >
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {monHocList.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ten_mon_hoc}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} textAlign="center">
//                                 <Button
//                                     variant="contained"
//                                     sx={{
//                                         minWidth: 180,
//                                         textTransform: "none",
//                                         mt: 2,
//                                         backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#d32f2f" : "#1976d2",
//                                         "&:hover": { backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#b71c1c" : "#115293" }
//                                     }}
//                                     onClick={() => {
//                                         if (kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter) {
//                                             setKyHocFilter("");
//                                             setLopIdFilter("");
//                                             setHeDaoTaoFilter("");
//                                             setKhoaDaoTaoFilter("");
//                                             setMonHocIdFilter("");
//                                             setLopList(originalLopList);
//                                             setLopListView(originalLopList);
//                                             fetchThoiKhoaBieu();
//                                         } else {
//                                             fetchThoiKhoaBieu();
//                                         }
//                                     }}
//                                 >
//                                     {kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "Hủy Bộ Lọc" : "Áp Dụng"}
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Box>

//                     {isLoading ? (
//                         <Typography variant="body1" textAlign="center" sx={{ my: 4 }}>Đang tải dữ liệu...</Typography>
//                     ) : thoiKhoaBieuList.length === 0 ? (
//                         <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
//                             Chưa có thời khóa biểu nào được thêm
//                         </Typography>
//                     ) : (
//                         <Grid container spacing={3} sx={{ mt: 2 }}>
//                             {thoiKhoaBieuList.map((tkb, index) => {
//                                 const monHoc = findMonHoc(tkb.mon_hoc_id);
//                                 return (
//                                     <Grid item xs={12} sm={6} md={4} key={tkb.id || index}>
//                                         <Card variant="outlined">
//                                             <CardContent>
//                                                 <Typography variant="h6" color="primary" gutterBottom>
//                                                     {monHoc.ten_mon_hoc}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Mã môn học:</strong> {monHoc.ma_mon_hoc}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Số tín chỉ:</strong> {monHoc.so_tin_chi}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Tính điểm:</strong> {monHoc.tinh_diem === 1 ? "Có" : "Không"}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Hệ đào tạo:</strong> {findHeDaoTaoName(monHoc.he_dao_tao_id)}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Ghi chú:</strong> {monHoc.ghi_chu}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Lớp:</strong> {findLopName(tkb.lop_id)}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Kỳ học:</strong> {tkb.ky_hoc || "Chưa xác định"}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Giảng viên:</strong> {tkb.giang_vien || findGiangVienName(tkb.giang_vien_id)}
//                                                 </Typography>
//                                                 {tkb.phong_hoc && (
//                                                     <Typography variant="body2" color="textSecondary">
//                                                         <strong>Phòng học:</strong> {tkb.phong_hoc}
//                                                     </Typography>
//                                                 )}
//                                                 {tkb.tiet_hoc && (
//                                                     <Typography variant="body2" color="textSecondary">
//                                                         <strong>Tiết học:</strong> {tkb.tiet_hoc}
//                                                     </Typography>
//                                                 )}
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Trạng thái:</strong> {tkb.trang_thai === 1 ? "Hoạt động" : "Không hoạt động"}
//                                                 </Typography>
//                                             </CardContent>
//                                             <CardActions sx={{ justifyContent: "center" }}>
//                                                 <IconButton color="primary" size="small" onClick={() => handleEdit(tkb, index)}>
//                                                     <EditIcon />
//                                                 </IconButton>
//                                                 <IconButton color="error" size="small" onClick={() => handleDelete(tkb.id)}>
//                                                     <DeleteIcon />
//                                                 </IconButton>
//                                             </CardActions>
//                                         </Card>
//                                     </Grid>
//                                 );
//                             })}
//                         </Grid>
//                     )}
//                 </Paper>
//                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
//                     <MuiPagination
//                         color="primary"
//                         count={totalPages}
//                         page={page}
//                         onChange={handlePageChange}
//                         variant="outlined"
//                         shape="rounded"
//                     />
//                 </Box>
//             </Container>

//             {/* Dialog form */}
//             <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
//                 <DialogTitle>{editId !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
//                 <DialogContent>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={4}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Hệ đào tạo</InputLabel>
//                                 <Select value={heDaoTaoId} onChange={handleHeDaoTaoChange}>
//                                     <MenuItem value="">Chọn hệ đào tạo</MenuItem>
//                                     {HeDaoTao?.map((option) => (
//                                         <MenuItem key={option.id} value={option.id}>{option.ten_he_dao_tao}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} sm={8}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Khóa đào tạo</InputLabel>
//                                 <Select value={khoaDaoTaoId} onChange={handlekhoaChange} disabled={!heDaoTaoId}>
//                                     <MenuItem value="">Chọn khóa đào tạo</MenuItem>
//                                     {khoaDaoTao.map((option) => (
//                                         <MenuItem key={option.id} value={option.id}>{option.ten_khoa}  | niên khóa  {option.nam_hoc}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Kỳ học</InputLabel>
//                                 <Select value={kyHoc} onChange={handleKyHocChange} disabled={!khoaDaoTaoId}>
//                                     <MenuItem value="">Chọn kỳ học</MenuItem>
//                                     {kyHocOptionsForm.map((option) => (
//                                         <MenuItem key={option} value={option}>{option}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={8}>
//                             <FormControl fullWidth size="small">
//                                 <InputLabel>Lớp</InputLabel>
//                                 <Select
//                                     value={lopId}
//                                     onChange={handleLopChange}
//                                     label="Lớp"
//                                     MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
//                                 >
//                                     <MenuItem value="">Chọn lớp</MenuItem>
//                                     {filteredLopList.map((lop) => (
//                                         <MenuItem key={lop.id} value={lop.id}>{lop.ma_lop}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} sm={4}>
//                             <TextField
//                                 fullWidth
//                                 size="small"
//                                 placeholder="Tìm kiếm lớp..."
//                                 value={lopSearch}
//                                 onChange={(e) => setLopSearch(e.target.value)}
//                                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                             />
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={8}>
//                             <Autocomplete
//                                 freeSolo
//                                 options={filteredMonHocList}
//                                 getOptionLabel={(option) => (typeof option === "string" ? option : option.ten_mon_hoc)}
//                                 value={filteredMonHocList.find((m) => m.id === monHocId) || null}
//                                 onChange={(event, newValue) => {
//                                     if (typeof newValue === "string") {
//                                         handleMonHocChange({ target: { value: newValue } });
//                                     } else if (newValue) {
//                                         handleMonHocChange({ target: { value: newValue.id } });
//                                     } else {
//                                         handleMonHocChange({ target: { value: "" } });
//                                     }
//                                 }}
//                                 renderInput={(params) => <TextField {...params} label="Môn học" fullWidth size="small" />}
//                             />
//                         </Grid>
//                         <Grid item xs={12} sm={4}>
//                             <TextField
//                                 fullWidth
//                                 size="small"
//                                 placeholder="Tìm kiếm môn học..."
//                                 value={monHocSearch}
//                                 onChange={(e) => setMonHocSearch(e.target.value)}
//                                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                             />
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={8}>
//                             <Autocomplete
//                                 freeSolo
//                                 options={filteredGiangVienList}
//                                 getOptionLabel={(option) => option.ho_ten}
//                                 value={filteredGiangVienList.find((g) => g.id === giangVienId) || null}
//                                 onChange={(event, newValue) => handleGiangVienChange({ target: { value: newValue ? newValue.id : "" } })}
//                                 renderInput={(params) => <TextField {...params} label="Giảng viên" fullWidth size="small" />}
//                             />
//                         </Grid>
//                         <Grid item xs={12} sm={4}>
//                             <TextField
//                                 fullWidth
//                                 size="small"
//                                 placeholder="Tìm kiếm giảng viên..."
//                                 value={giangVienSearch}
//                                 onChange={(e) => setGiangVienSearch(e.target.value)}
//                                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                             />
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={6}>
//                             <TextField
//                                 fullWidth
//                                 label="Phòng học"
//                                 value={phongHoc}
//                                 onChange={(e) => setPhongHoc(e.target.value)}
//                                 placeholder="Ví dụ: 103 TA1"
//                                 margin="dense"
//                             />
//                         </Grid>
//                         <Grid item xs={12} sm={6}>
//                             <TextField
//                                 fullWidth
//                                 label="Tiết học"
//                                 value={tietHoc}
//                                 onChange={(e) => setTietHoc(e.target.value)}
//                                 placeholder="Ví dụ: 2-4"
//                                 margin="dense"
//                             />
//                         </Grid>
//                     </Grid>
//                     <FormControl fullWidth margin="dense">
//                         <InputLabel sx={{ backgroundColor: "white" }}>Trạng thái</InputLabel>
//                         <Select value={trangThai} onChange={handleTrangThaiChange}>
//                             {trangThaiOptions.map((option) => (
//                                 <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={resetForm} color="secondary">Hủy</Button>
//                     <Button
//                         onClick={handleSubmit}
//                         color="primary"
//                         variant="contained"
//                         disabled={!lopId || !monHocId || !kyHoc || isLoading}
//                     >
//                         {isLoading ? "Đang xử lý..." : (editId !== null ? "Cập nhật" : "Xác nhận")}
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </ThemeProvider>
//     );
// };

// export default ThoiKhoaBieu;















// import { useState, useEffect } from "react";
// import {
//     Box, MenuItem, FormControl, InputLabel, Select, Typography, Paper, Button, Grid, Container, Dialog,
//     DialogTitle, DialogContent, DialogActions, Card, CardContent, CardActions, IconButton, createTheme,
//     ThemeProvider, TextField, InputAdornment, Autocomplete, Pagination as MuiPagination, Checkbox, List, ListItem, ListItemText
// } from "@mui/material";
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import SearchIcon from '@mui/icons-material/Search';
// import { getMonHoc, getThoiKhoaBieu, themThoiKhoaBieu, updateThoiKhoaBieu, xoaThoiKhoaBieu } from "../../Api_controller/Service/monHocService";
// import { getGiangVien } from "../../Api_controller/Service/giangVienService";
// import { getDanhSachLop } from "../../Api_controller/Service/lopService";
// import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";

// const theme = createTheme({
//     palette: {
//         primary: { main: '#1976d2' },
//         background: { default: '#f5f5f5' }
//     },
//     typography: { fontFamily: 'Roboto, Arial, sans-serif' }
// });

// const ThoiKhoaBieu = () => {
//     const [open, setOpen] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [editId, setEditId] = useState(null);

//     const [kyHoc, setKyHoc] = useState("");
//     const [lopId, setLopId] = useState("");
//     const [monHocId, setMonHocId] = useState("");
//     const [giangVienId, setGiangVienId] = useState("");
//     const [giangVien, setGiangVien] = useState("");
//     const [phongHoc, setPhongHoc] = useState("");
//     const [tietHoc, setTietHoc] = useState("");
//     const [trangThai, setTrangThai] = useState(1);
//     const [khoaDaoTaoId, setKhoaDaoTaoId] = useState("");
//     const [heDaoTaoId, setHeDaoTaoId] = useState("");
//     const [HeDaoTao, setHeDaoTao] = useState([]);
//     const [khoaDaoTao, setKhoaDaoTao] = useState([]);
//     const [kyHocOptionsForm, setKyHocOptionsForm] = useState([]);
//     const [kyHocOptionsFilter, setKyHocOptionsFilter] = useState([]);
//     const [useKeHoachDaoTao, setUseKeHoachDaoTao] = useState(false);
//     const [keHoachMonHocList, setKeHoachMonHocList] = useState([]);

//     const [trangThaiOptions] = useState([
//         { value: 1, label: "Hoạt động" },
//         { value: 0, label: "Không hoạt động" }
//     ]);

//     const [lopSearch, setLopSearch] = useState("");
//     const [monHocSearch, setMonHocSearch] = useState("");
//     const [giangVienSearch, setGiangVienSearch] = useState("");

//     const [originalLopList, setOriginalLopList] = useState([]);
//     const [lopList, setLopList] = useState([]);
//     const [monHocList, setMonHocList] = useState([]);
//     const [monHocListForm, setMonHocListForm] = useState([]);
//     const [giangVienList, setGiangVienList] = useState([]);
//     const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);
//     const [khoaDaoTaoList, setKhoaDaoTaoList] = useState([]);
//     const [lopListView, setLopListView] = useState([]);

//     const [isLoading, setIsLoading] = useState(false);
//     const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
//     const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
//     const [kyHocFilter, setKyHocFilter] = useState("");
//     const [lopIdFilter, setLopIdFilter] = useState("");
//     const [monHocIdFilter, setMonHocIdFilter] = useState("");
//     const [page, setPage] = useState(1);
//     const [pageSize] = useState(6);
//     const [totalPages, setTotalPages] = useState(1);

//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setIsLoading(true);
//             try {
//                 const [heDaoTao, giangVien, khoaDaoTao, monHoc, lop, thoiKhoaBieu] = await Promise.all([
//                     fetchHeDaoTaoList(),
//                     fetchGiangVienList(),
//                     fetchAllKhoaDaoTaoList(),
//                     fetchMonHocList(),
//                     fetchLopList(),
//                     fetchThoiKhoaBieu()
//                 ]);
//                 setOriginalLopList(lop);
//                 setLopList(lop);
//                 setLopListView(lop);
//                 setMonHocList(monHoc);
//                 setMonHocListForm(monHoc); // Ban đầu là danh sách tổng quát
//             } catch (error) {
//                 console.error("Lỗi khi tải dữ liệu ban đầu:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, []);

//     const fetchAllKhoaDaoTaoList = async () => {
//         try {
//             const response = await getDanhSachKhoaDaoTao();
//             setKhoaDaoTaoList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchKhoaDaoTaoList = async (heDaoTaoId) => {
//         try {
//             const response = await getDanhSachKhoaDaoTaobyId(heDaoTaoId);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchLopByKhoaDaoTao = async (khoaDaoTaoId) => {
//         try {
//             const response = await fetch(`http://localhost:8000/lop/bykhoadaotao?khoa_dao_tao_id=${khoaDaoTaoId}`);
//             const data = await response.json();
//             setLopList(data);
//             setLopListView(data);
//             return data;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách lớp theo khóa đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchLopList = async () => {
//         try {
//             const response = await getDanhSachLop();
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách lớp:", error);
//             return [];
//         }
//     };

//     const fetchHeDaoTaoList = async () => {
//         try {
//             const response = await fetchDanhSachHeDaoTao();
//             setHeDaoTao(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách hệ đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchMonHocList = async () => {
//         try {
//             const response = await getMonHoc();
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách môn học:", error);
//             return [];
//         }
//     };

//     const fetchMonHocByHeDaoTao = async (heDaoTaoId) => {
//         try {
//             const response = await fetch(`http://localhost:8000/mon-hoc/getByHeDaoTaoId/${heDaoTaoId}`);
//             const data = await response.json();
//             return data.data || [];
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách môn học theo hệ đào tạo:", error);
//             return [];
//         }
//     };

//     const fetchGiangVienList = async () => {
//         try {
//             const response = await getGiangVien();
//             setGiangVienList(response);
//             return response;
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách giảng viên:", error);
//             return [];
//         }
//     };

//     const fetchThoiKhoaBieu = async () => {
//         let url = `http://localhost:8000/thoikhoabieu/getbypage?page=${page}&pageSize=${pageSize}`;
//         if (kyHocFilter || lopIdFilter || monHocIdFilter) {
//             url = `http://localhost:8000/thoikhoabieu/filterbyid?page=${page}&pageSize=${pageSize}`;
//             if (kyHocFilter) url += `&ky_hoc=${kyHocFilter}`;
//             if (lopIdFilter) url += `&lop_id=${lopIdFilter}`;
//             if (monHocIdFilter) url += `&mon_hoc_id=${monHocIdFilter}`;
//         }
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             setThoiKhoaBieuList(data.data || []);
//             setTotalPages(data.totalPages || 1);
//             return data.data;
//         } catch (error) {
//             console.error("Lỗi khi lấy dữ liệu thời khóa biểu:", error);
//             return [];
//         }
//     };

//     const fetchKeHoachMonHoc = async (khoaDaoTaoId, kyHoc) => {
//         try {
//             const response = await fetch(`http://localhost:8000/kehoachmonhoc/getbykhoavaky/${khoaDaoTaoId}/${kyHoc}`);
//             const data = await response.json();
//             const enrichedData = data.map(item => ({
//                 ...item,
//                 ten_mon_hoc: monHocList.find(mon => mon.id === item.mon_hoc_id)?.ten_mon_hoc || "Môn học không xác định"
//             }));
//             setKeHoachMonHocList(enrichedData);
//         } catch (error) {
//             console.error("Lỗi khi lấy kế hoạch môn học:", error);
//             setKeHoachMonHocList([]);
//         }
//     };

//     const handlePageChange = (event, value) => {
//         setPage(value);
//     };

//     useEffect(() => {
//         if (heDaoTaoFilter) {
//             fetchKhoaDaoTaoList(heDaoTaoFilter).then(setKhoaDaoTao);
//             fetchMonHocByHeDaoTao(heDaoTaoFilter).then(setMonHocListForm); // Cập nhật monHocListForm cho bộ lọc
//         } else {
//             setKhoaDaoTao([]);
//             setKyHocOptionsFilter([]);
//             setLopList(originalLopList);
//             setLopListView(originalLopList);
//             setMonHocListForm(monHocList); // Khi không có bộ lọc, dùng danh sách tổng quát
//         }
//     }, [heDaoTaoFilter, originalLopList, monHocList]);

//     useEffect(() => {
//         if (heDaoTaoId) {
//             fetchKhoaDaoTaoList(heDaoTaoId).then(setKhoaDaoTao);
//             fetchMonHocByHeDaoTao(heDaoTaoId).then(setMonHocListForm);
//         } else {
//             setKhoaDaoTao([]);
//             setKyHocOptionsForm([]);
//             setLopList(originalLopList);
//             setMonHocListForm(monHocList);
//         }
//     }, [heDaoTaoId, originalLopList, monHocList]);

//     useEffect(() => {
//         if (khoaDaoTaoFilter) {
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsFilter(kyHocArray);
//                 fetchLopByKhoaDaoTao(khoaDaoTaoFilter);
//             }
//         } else {
//             setKyHocOptionsFilter([]);
//             setLopList(originalLopList);
//             setLopListView(originalLopList);
//         }
//     }, [khoaDaoTaoFilter, khoaDaoTao, originalLopList]);

//     useEffect(() => {
//         if (khoaDaoTaoId) {
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoId);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsForm(kyHocArray);
//                 fetchLopByKhoaDaoTao(khoaDaoTaoId);
//             }
//         } else {
//             setKyHocOptionsForm([]);
//             setLopList(originalLopList);
//         }
//     }, [khoaDaoTaoId, khoaDaoTao, originalLopList]);

//     useEffect(() => {
//         if (useKeHoachDaoTao && khoaDaoTaoId && kyHoc && editId === null) {
//             fetchKeHoachMonHoc(khoaDaoTaoId, kyHoc);
//         } else {
//             setKeHoachMonHocList([]);
//         }
//     }, [useKeHoachDaoTao, khoaDaoTaoId, kyHoc, editId]);

//     useEffect(() => {
//         fetchThoiKhoaBieu();
//     }, [page, kyHocFilter, lopIdFilter, monHocIdFilter]);

//     const handlekhoaChange = (event) => setKhoaDaoTaoId(event.target.value);
//     const handleKyHocChange = (event) => setKyHoc(event.target.value);
//     const handleHeDaoTaoChange = (event) => setHeDaoTaoId(event.target.value);
//     const handleLopChange = (event) => setLopId(event.target.value);
//     const handleMonHocChange = (event) => setMonHocId(event.target.value);
//     const handleGiangVienChange = (event) => {
//         const selectedId = event.target.value;
//         setGiangVienId(selectedId);
//         const selectedGV = giangVienList.find(gv => gv.id === selectedId);
//         setGiangVien(selectedGV ? selectedGV.ho_ten : "");
//     };
//     const handleTrangThaiChange = (event) => setTrangThai(event.target.value);
//     const handleUseKeHoachDaoTaoChange = (event) => setUseKeHoachDaoTao(event.target.checked);

//     const filteredLopList = lopList.filter(lop => lop.ma_lop.toLowerCase().includes(lopSearch.toLowerCase()));
//     const filteredMonHocList = monHocListForm.filter(monHoc => monHoc.ten_mon_hoc.toLowerCase().includes(monHocSearch.toLowerCase()));
//     const filteredGiangVienList = giangVienList.filter(giangVien => giangVien.ho_ten.toLowerCase().includes(giangVienSearch.toLowerCase()));

//     const handleSubmit = async () => {
//         if (lopId && kyHoc) {
//             setIsLoading(true);
//             try {
//                 if (useKeHoachDaoTao && editId === null) {
//                     const thoiKhoaBieuData = {
//                         ky_hoc: parseInt(kyHoc),
//                         dot_hoc: 1,
//                         lop_id: lopId,
//                         khoa_dao_tao_id: khoaDaoTaoId,
//                         giang_vien: "",
//                         phong_hoc: "",
//                         tiet_hoc: "",
//                         trang_thai: trangThai
//                     };
//                     await fetch("http://localhost:8000/thoikhoabieu/createall", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify(thoiKhoaBieuData)
//                     });
//                 } else if (monHocId) {
//                     const thoiKhoaBieuData = {
//                         ky_hoc: kyHoc,
//                         lop_id: lopId,
//                         mon_hoc_id: monHocId,
//                         giang_vien_id: giangVienId,
//                         giang_vien: giangVien,
//                         phong_hoc: phongHoc,
//                         tiet_hoc: tietHoc,
//                         trang_thai: trangThai
//                     };
//                     if (editId !== null) {
//                         await updateThoiKhoaBieu(editId, thoiKhoaBieuData);
//                     } else {
//                         await themThoiKhoaBieu(thoiKhoaBieuData);
//                     }
//                 }
//                 fetchThoiKhoaBieu();
//                 resetForm();
//             } catch (error) {
//                 console.error("Lỗi khi lưu thời khóa biểu:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//     };

//     const resetForm = () => {
//         setGiangVienId("");
//         setGiangVien("");
//         setPhongHoc("");
//         setTietHoc("");
//         setTrangThai(1);
//         setKyHoc("");
//         setLopId("");
//         setMonHocId("");
//         setKyHocOptionsForm([]);
//         setLopSearch("");
//         setMonHocSearch("");
//         setGiangVienSearch("");
//         setEditIndex(null);
//         setEditId(null);
//         setOpen(false);
//         setUseKeHoachDaoTao(false);
//         setKeHoachMonHocList([]);
//         setLopList(originalLopList);
//         // Không reset heDaoTaoId và khoaDaoTaoId để bảo vệ form chỉnh sửa
//     };

//     const handleOpenForm = () => {
//         setGiangVienId("");
//         setGiangVien("");
//         setPhongHoc("");
//         setTietHoc("");
//         setTrangThai(1);
//         setKyHoc(kyHocFilter || "");
//         setLopId(lopIdFilter || "");
//         setMonHocId(monHocIdFilter || "");
//         setEditIndex(null);
//         setEditId(null);
//         setUseKeHoachDaoTao(false);
//         setKeHoachMonHocList([]);

//         if (heDaoTaoFilter && !heDaoTaoId) setHeDaoTaoId(heDaoTaoFilter);
//         if (khoaDaoTaoFilter && !khoaDaoTaoId) setKhoaDaoTaoId(khoaDaoTaoFilter);

//         if (heDaoTaoFilter) {
//             fetchMonHocByHeDaoTao(heDaoTaoFilter).then(setMonHocListForm);
//         }
//         if (khoaDaoTaoFilter) {
//             fetchLopByKhoaDaoTao(khoaDaoTaoFilter);
//             const selectedKhoa = khoaDaoTao.find(khoa => khoa.id === khoaDaoTaoFilter);
//             if (selectedKhoa) {
//                 const kyHocCount = selectedKhoa.so_ky_hoc;
//                 const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//                 setKyHocOptionsForm(kyHocArray);
//             }
//         }
//         setOpen(true);
//     };

//     const handleEdit = async (tkb, index) => {
//         setKyHoc(tkb.ky_hoc || "");
//         setLopId(tkb.lop_id || "");
//         setMonHocId(tkb.mon_hoc_id || "");
//         setGiangVienId(tkb.giang_vien_id || "");
//         setGiangVien(tkb.giang_vien || "");
//         setPhongHoc(tkb.phong_hoc || "");
//         setTietHoc(tkb.tiet_hoc || "");
//         setTrangThai(tkb.trang_thai !== undefined ? tkb.trang_thai : 1);
//         setEditIndex(index);
//         setEditId(tkb.id);

//         const selectedKhoa = khoaDaoTaoList.find(khoa =>
//             lopList.find(lop => lop.id === tkb.lop_id)?.khoa_dao_tao_id === khoa.id
//         );
//         if (selectedKhoa) {
//             setHeDaoTaoId(selectedKhoa.he_dao_tao_id);
//             setKhoaDaoTaoId(selectedKhoa.id);
//             await fetchLopByKhoaDaoTao(selectedKhoa.id);
//             await fetchMonHocByHeDaoTao(selectedKhoa.he_dao_tao_id).then(setMonHocListForm);
//             const kyHocCount = selectedKhoa.so_ky_hoc;
//             const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
//             setKyHocOptionsForm(kyHocArray);
//         }

//         setOpen(true);
//     };

//     const handleDelete = async (id) => {
//         try {
//             await xoaThoiKhoaBieu(id);
//             fetchThoiKhoaBieu();
//         } catch (error) {
//             console.error("Lỗi khi xóa thời khóa biểu:", error);
//         }
//     };

//     const findLopName = (id) => originalLopList.find(item => item.id === id)?.ma_lop || "Lớp không xác định";
//     const findMonHoc = (id) => monHocList.find(item => item.id === id) || { ten_mon_hoc: "Môn học không xác định", ma_mon_hoc: "N/A", so_tin_chi: "N/A", tinh_diem: "N/A", he_dao_tao_id: null, ghi_chu: "N/A" };
//     const findGiangVienName = (id) => giangVienList.find(item => item.id === id)?.ho_ten || "Giảng viên không xác định";
//     const findHeDaoTaoName = (id) => HeDaoTao.find(item => item.id === id)?.ten_he_dao_tao || "Hệ đào tạo không xác định";

//     return (
//         <ThemeProvider theme={theme}>
//             <Container maxWidth="md" sx={{ py: 4 }}>
//                 <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
//                     <Typography variant="h4" color="primary" gutterBottom textAlign="center">
//                         Thời Khóa Biểu
//                     </Typography>

//                     <Box textAlign="center" my={2}>
//                         <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
//                             Thêm Thời Khóa Biểu
//                         </Button>
//                     </Box>

//                     <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, maxWidth: 900, backgroundColor: "#fff" }}>
//                         <Grid container spacing={2} justifyContent="center">
//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Hệ đào tạo</InputLabel>
//                                     <Select value={heDaoTaoFilter} onChange={(e) => setHeDaoTaoFilter(e.target.value)} label="Hệ đào tạo">
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {HeDaoTao.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ten_he_dao_tao}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Khóa đào tạo</InputLabel>
//                                     <Select value={khoaDaoTaoFilter} onChange={(e) => setKhoaDaoTaoFilter(e.target.value)} label="Khóa đào tạo" disabled={!heDaoTaoFilter}>
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {khoaDaoTao.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ten_khoa}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Kỳ học</InputLabel>
//                                     <Select value={kyHocFilter} onChange={(e) => setKyHocFilter(e.target.value)} label="Kỳ học" disabled={!khoaDaoTaoFilter}>
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {kyHocOptionsFilter.map((option) => (
//                                             <MenuItem key={option} value={option}>{option}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Lớp</InputLabel>
//                                     <Select value={lopIdFilter} onChange={(e) => setLopIdFilter(e.target.value)} label="Lớp">
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {lopListView.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ma_lop}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} sm={4} md={3}>
//                                 <FormControl fullWidth size="small" variant="outlined">
//                                     <InputLabel>Môn học</InputLabel>
//                                     <Select value={monHocIdFilter} onChange={(e) => setMonHocIdFilter(e.target.value)} label="Môn học" disabled={!heDaoTaoFilter}>
//                                         <MenuItem value="">Tất cả</MenuItem>
//                                         {monHocListForm.map((item) => (
//                                             <MenuItem key={item.id} value={item.id}>{item.ten_mon_hoc}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </Grid>

//                             <Grid item xs={12} textAlign="center">
//                                 <Button
//                                     variant="contained"
//                                     sx={{
//                                         minWidth: 180,
//                                         textTransform: "none",
//                                         mt: 2,
//                                         backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#d32f2f" : "#1976d2",
//                                         "&:hover": { backgroundColor: kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "#b71c1c" : "#115293" }
//                                     }}
//                                     onClick={() => {
//                                         if (kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter) {
//                                             setKyHocFilter("");
//                                             setLopIdFilter("");
//                                             setHeDaoTaoFilter("");
//                                             setKhoaDaoTaoFilter("");
//                                             setMonHocIdFilter("");
//                                             setLopList(originalLopList);
//                                             setLopListView(originalLopList);
//                                             setMonHocListForm(monHocList); // Reset về danh sách tổng quát khi hủy bộ lọc
//                                             fetchThoiKhoaBieu();
//                                         } else {
//                                             fetchThoiKhoaBieu();
//                                         }
//                                     }}
//                                 >
//                                     {kyHocFilter || lopIdFilter || heDaoTaoFilter || khoaDaoTaoFilter || monHocIdFilter ? "Hủy Bộ Lọc" : "Áp Dụng"}
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Box>

//                     {isLoading ? (
//                         <Typography variant="body1" textAlign="center" sx={{ my: 4 }}>Đang tải dữ liệu...</Typography>
//                     ) : thoiKhoaBieuList.length === 0 ? (
//                         <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
//                             Chưa có thời khóa biểu nào được thêm
//                         </Typography>
//                     ) : (
//                         <Grid container spacing={3} sx={{ mt: 2 }}>
//                             {thoiKhoaBieuList.map((tkb, index) => {
//                                 const monHoc = findMonHoc(tkb.mon_hoc_id);
//                                 return (
//                                     <Grid item xs={12} sm={6} md={4} key={tkb.id || index}>
//                                         <Card variant="outlined">
//                                             <CardContent>
//                                                 <Typography variant="h6" color="primary" gutterBottom>
//                                                     {monHoc.ten_mon_hoc}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Mã môn học:</strong> {monHoc.ma_mon_hoc}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Số tín chỉ:</strong> {monHoc.so_tin_chi}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Tính điểm:</strong> {monHoc.tinh_diem === 1 ? "Có" : "Không"}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Hệ đào tạo:</strong> {findHeDaoTaoName(monHoc.he_dao_tao_id)}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Ghi chú:</strong> {monHoc.ghi_chu}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Lớp:</strong> {findLopName(tkb.lop_id)}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Kỳ học:</strong> {tkb.ky_hoc || "Chưa xác định"}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Giảng viên:</strong> {tkb.giang_vien || findGiangVienName(tkb.giang_vien_id)}
//                                                 </Typography>
//                                                 {tkb.phong_hoc && (
//                                                     <Typography variant="body2" color="textSecondary">
//                                                         <strong>Phòng học:</strong> {tkb.phong_hoc}
//                                                     </Typography>
//                                                 )}
//                                                 {tkb.tiet_hoc && (
//                                                     <Typography variant="body2" color="textSecondary">
//                                                         <strong>Tiết học:</strong> {tkb.tiet_hoc}
//                                                     </Typography>
//                                                 )}
//                                                 <Typography variant="body2" color="textSecondary">
//                                                     <strong>Trạng thái:</strong> {tkb.trang_thai === 1 ? "Hoạt động" : "Không hoạt động"}
//                                                 </Typography>
//                                             </CardContent>
//                                             <CardActions sx={{ justifyContent: "center" }}>
//                                                 <IconButton color="primary" size="small" onClick={() => handleEdit(tkb, index)}>
//                                                     <EditIcon />
//                                                 </IconButton>
//                                                 <IconButton color="error" size="small" onClick={() => handleDelete(tkb.id)}>
//                                                     <DeleteIcon />
//                                                 </IconButton>
//                                             </CardActions>
//                                         </Card>
//                                     </Grid>
//                                 );
//                             })}
//                         </Grid>
//                     )}
//                 </Paper>
//                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
//                     <MuiPagination
//                         color="primary"
//                         count={totalPages}
//                         page={page}
//                         onChange={handlePageChange}
//                         variant="outlined"
//                         shape="rounded"
//                     />
//                 </Box>
//             </Container>

//             <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
//                 <DialogTitle>{editId !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
//                 <DialogContent>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={4}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Hệ đào tạo</InputLabel>
//                                 <Select value={heDaoTaoId} onChange={handleHeDaoTaoChange}>
//                                     <MenuItem value="">Chọn hệ đào tạo</MenuItem>
//                                     {HeDaoTao?.map((option) => (
//                                         <MenuItem key={option.id} value={option.id}>{option.ten_he_dao_tao}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} sm={8}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Khóa đào tạo</InputLabel>
//                                 <Select value={khoaDaoTaoId} onChange={handlekhoaChange} disabled={!heDaoTaoId}>
//                                     <MenuItem value="">Chọn khóa đào tạo</MenuItem>
//                                     {khoaDaoTao.map((option) => (
//                                         <MenuItem key={option.id} value={option.id}>{option.ten_khoa} | niên khóa {option.nam_hoc}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} sx={{ mt: 1 }}>
//                         <Grid item xs={12}>
//                             <FormControl fullWidth margin="dense">
//                                 <InputLabel sx={{ backgroundColor: "white" }}>Kỳ học</InputLabel>
//                                 <Select value={kyHoc} onChange={handleKyHocChange} disabled={!khoaDaoTaoId}>
//                                     <MenuItem value="">Chọn kỳ học</MenuItem>
//                                     {kyHocOptionsForm.map((option) => (
//                                         <MenuItem key={option} value={option}>{option}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                         <Grid item xs={12} sm={8}>
//                             <FormControl fullWidth size="small">
//                                 <InputLabel>Lớp</InputLabel>
//                                 <Select
//                                     value={lopId}
//                                     onChange={handleLopChange}
//                                     label="Lớp"
//                                     MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
//                                 >
//                                     <MenuItem value="">Chọn lớp</MenuItem>
//                                     {filteredLopList.map((lop) => (
//                                         <MenuItem key={lop.id} value={lop.id}>{lop.ma_lop}</MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={12} sm={4}>
//                             <TextField
//                                 fullWidth
//                                 size="small"
//                                 placeholder="Tìm kiếm lớp..."
//                                 value={lopSearch}
//                                 onChange={(e) => setLopSearch(e.target.value)}
//                                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                             />
//                         </Grid>
//                     </Grid>

//                     {editId === null && (
//                         <Grid container spacing={2} sx={{ mt: 1 }}>
//                             <Grid item xs={12}>
//                                 <Box display="flex" alignItems="center">
//                                     <Checkbox
//                                         checked={useKeHoachDaoTao}
//                                         onChange={handleUseKeHoachDaoTaoChange}
//                                         disabled={!khoaDaoTaoId || !kyHoc}
//                                     />
//                                     <Typography>Dùng phương án bên kế hoạch đào tạo</Typography>
//                                 </Box>
//                             </Grid>
//                         </Grid>
//                     )}

//                     {editId === null && useKeHoachDaoTao ? (
//                         <Box sx={{ mt: 2 }}>
//                             <Typography variant="subtitle1">Danh sách môn học từ kế hoạch đào tạo:</Typography>
//                             {keHoachMonHocList.length > 0 ? (
//                                 <List dense>
//                                     {keHoachMonHocList.map((mon) => (
//                                         <ListItem key={mon.id}>
//                                             <ListItemText
//                                                 primary={mon.ten_mon_hoc}
//                                                 secondary={`Bắt buộc: ${mon.bat_buoc ? "Có" : "Không"}`}
//                                             />
//                                         </ListItem>
//                                     ))}
//                                 </List>
//                             ) : (
//                                 <Typography variant="body2" color="textSecondary">Không có môn học nào trong kế hoạch.</Typography>
//                             )}
//                         </Box>
//                     ) : (
//                         <>
//                             <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                                 <Grid item xs={12} sm={8}>
//                                     <Autocomplete
//                                         freeSolo
//                                         options={filteredMonHocList}
//                                         getOptionLabel={(option) => (typeof option === "string" ? option : option.ten_mon_hoc)}
//                                         value={filteredMonHocList.find((m) => m.id === monHocId) || null}
//                                         onChange={(event, newValue) => {
//                                             if (typeof newValue === "string") {
//                                                 handleMonHocChange({ target: { value: newValue } });
//                                             } else if (newValue) {
//                                                 handleMonHocChange({ target: { value: newValue.id } });
//                                             } else {
//                                                 handleMonHocChange({ target: { value: "" } });
//                                             }
//                                         }}
//                                         renderInput={(params) => <TextField {...params} label="Môn học" fullWidth size="small" />}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={4}>
//                                     <TextField
//                                         fullWidth
//                                         size="small"
//                                         placeholder="Tìm kiếm môn học..."
//                                         value={monHocSearch}
//                                         onChange={(e) => setMonHocSearch(e.target.value)}
//                                         InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                                     />
//                                 </Grid>
//                             </Grid>
//                             <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
//                                 <Grid item xs={12} sm={8}>
//                                     <Autocomplete
//                                         freeSolo
//                                         options={filteredGiangVienList}
//                                         getOptionLabel={(option) => option.ho_ten}
//                                         value={filteredGiangVienList.find((g) => g.id === giangVienId) || null}
//                                         onChange={(event, newValue) => handleGiangVienChange({ target: { value: newValue ? newValue.id : "" } })}
//                                         renderInput={(params) => <TextField {...params} label="Giảng viên" fullWidth size="small" />}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={4}>
//                                     <TextField
//                                         fullWidth
//                                         size="small"
//                                         placeholder="Tìm kiếm giảng viên..."
//                                         value={giangVienSearch}
//                                         onChange={(e) => setGiangVienSearch(e.target.value)}
//                                         InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
//                                     />
//                                 </Grid>
//                             </Grid>
//                             <Grid container spacing={2} sx={{ mt: 1 }}>
//                                 <Grid item xs={12} sm={6}>
//                                     <TextField
//                                         fullWidth
//                                         label="Phòng học"
//                                         value={phongHoc}
//                                         onChange={(e) => setPhongHoc(e.target.value)}
//                                         placeholder="Ví dụ: 103 TA1"
//                                         margin="dense"
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <TextField
//                                         fullWidth
//                                         label="Tiết học"
//                                         value={tietHoc}
//                                         onChange={(e) => setTietHoc(e.target.value)}
//                                         placeholder="Ví dụ: 2-4"
//                                         margin="dense"
//                                     />
//                                 </Grid>
//                             </Grid>
//                         </>
//                     )}

//                     <FormControl fullWidth margin="dense">
//                         <InputLabel sx={{ backgroundColor: "white" }}>Trạng thái</InputLabel>
//                         <Select value={trangThai} onChange={handleTrangThaiChange}>
//                             {trangThaiOptions.map((option) => (
//                                 <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={resetForm} color="secondary">Hủy</Button>
//                     <Button
//                         onClick={handleSubmit}
//                         color="primary"
//                         variant="contained"
//                         disabled={!lopId || !kyHoc || (!useKeHoachDaoTao && !monHocId) || (useKeHoachDaoTao && keHoachMonHocList.length === 0) || isLoading}
//                     >
//                         {isLoading ? "Đang xử lý..." : (editId !== null ? "Cập nhật" : "Xác nhận")}
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </ThemeProvider>
//     );
// };

// export default ThoiKhoaBieu;










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
    fetchMonHocByHeDaoTao, fetchKeHoachMonHoc, createAllThoiKhoaBieu
} from "../../Api_controller/Service/thoiKhoaBieuService";

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
    const handleMonHocChange = (event) => setMonHocId(event.target.value);
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

    const handleSubmit = async () => {
        if (lopId && kyHoc) {
            setIsLoading(true);
            try {
                if (useKeHoachDaoTao && editId === null) {
                    const thoiKhoaBieuData = {
                        ky_hoc: parseInt(kyHoc),
                        dot_hoc: 1,
                        lop_id: lopId,
                        khoa_dao_tao_id: khoaDaoTaoId,
                        giang_vien: "",
                        phong_hoc: "",
                        tiet_hoc: "",
                        trang_thai: trangThai
                    };
                    await createAllThoiKhoaBieu(thoiKhoaBieuData);
                } else if (monHocId) {
                    const thoiKhoaBieuData = {
                        ky_hoc: kyHoc,
                        lop_id: lopId,
                        mon_hoc_id: monHocId,
                        giang_vien_id: giangVienId,
                        giang_vien: giangVien,
                        phong_hoc: phongHoc,
                        tiet_hoc: tietHoc,
                        trang_thai: trangThai
                    };
                    if (editId !== null) {
                        await updateThoiKhoaBieu(editId, thoiKhoaBieuData);
                    } else {
                        await themThoiKhoaBieu(thoiKhoaBieuData);
                    }
                }
                await fetchThoiKhoaBieu();
                resetForm();
            } catch (error) {
                console.error("Lỗi khi lưu thời khóa biểu:", error);
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
        setMonHocId("");
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
        // Thiết lập các giá trị cơ bản từ thời khóa biểu
        setKyHoc(tkb.ky_hoc || "");
        setLopId(tkb.lop_id || "");
        setMonHocId(tkb.mon_hoc_id || "");
        setGiangVienId(tkb.giang_vien_id || "");
        setGiangVien(tkb.giang_vien || "");
        setPhongHoc(tkb.phong_hoc || "");
        setTietHoc(tkb.tiet_hoc || "");
        setTrangThai(tkb.trang_thai !== undefined ? tkb.trang_thai : 1);
        setEditIndex(index);
        setEditId(tkb.id);

        // Tìm môn học liên quan để lấy he_dao_tao_id
        const monHoc = monHocList.find(m => m.id === tkb.mon_hoc_id);
        if (monHoc && monHoc.he_dao_tao_id) {
            setHeDaoTaoId(monHoc.he_dao_tao_id);

            // Tải danh sách khóa đào tạo dựa trên hệ đào tạo
            const khoaDaoTaoData = await getDanhSachKhoaDaoTaobyId(monHoc.he_dao_tao_id);
            setKhoaDaoTao(khoaDaoTaoData);

            // Tìm khóa đào tạo liên quan đến lớp
            const selectedLop = originalLopList.find(lop => lop.id === tkb.lop_id);
            if (selectedLop && selectedLop.khoa_dao_tao_id) {
                setKhoaDaoTaoId(selectedLop.khoa_dao_tao_id);

                // Tải danh sách lớp dựa trên khóa đào tạo
                await fetchLopByKhoaDaoTao(selectedLop.khoa_dao_tao_id).then(setLopList);

                // Tạo danh sách kỳ học dựa trên số kỳ học của khóa đào tạo
                const selectedKhoa = khoaDaoTaoData.find(khoa => khoa.id === selectedLop.khoa_dao_tao_id);
                if (selectedKhoa) {
                    const kyHocCount = selectedKhoa.so_ky_hoc;
                    const kyHocArray = Array.from({ length: kyHocCount }, (_, i) => i + 1);
                    setKyHocOptionsForm(kyHocArray);
                }
            }

            // Tải danh sách môn học dựa trên hệ đào tạo
            await fetchMonHocByHeDaoTao(monHoc.he_dao_tao_id).then(setMonHocListForm);
        }

        setOpen(true);
    };






    const handleDelete = async (id) => {
        try {
            await xoaThoiKhoaBieu(id);
            fetchThoiKhoaBieu();
        } catch (error) {
            console.error("Lỗi khi xóa thời khóa biểu:", error);
        }
    };

    const findLopName = (id) => originalLopList.find(item => item.id === id)?.ma_lop || "Lớp không xác định";
    const findMonHoc = (id) => monHocList.find(item => item.id === id) || { ten_mon_hoc: "Môn học không xác định", ma_mon_hoc: "N/A", so_tin_chi: "N/A", tinh_diem: "N/A", he_dao_tao_id: null, ghi_chu: "N/A" };
    const findGiangVienName = (id) => giangVienList.find(item => item.id === id)?.ho_ten || "Giảng viên không xác định";
    const findHeDaoTaoName = (id) => HeDaoTao.find(item => item.id === id)?.ten_he_dao_tao || "Hệ đào tạo không xác định";

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" gutterBottom textAlign="center">
                        Thời Khóa Biểu
                    </Typography>

                    <Box textAlign="center" my={2}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
                            Thêm Thời Khóa Biểu
                        </Button>
                    </Box>

                    <Box sx={{ p: 3, borderRadius: 2, mx: "auto", mt: 3, border: "1px solid #e0e0e0", boxShadow: 2, maxWidth: 900, backgroundColor: "#fff" }}>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={12} sm={4} md={3}>
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

                            <Grid item xs={12} sm={4} md={3}>
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

                            <Grid item xs={12} sm={4} md={3}>
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

                            <Grid item xs={12} sm={4} md={3}>
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

                            <Grid item xs={12} sm={4} md={3}>
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
                                    <Grid item xs={12} sm={6} md={4} key={tkb.id || index}>
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
                                    <Autocomplete
                                        freeSolo
                                        options={filteredMonHocList}
                                        getOptionLabel={(option) => (typeof option === "string" ? option : option.ten_mon_hoc)}
                                        value={filteredMonHocList.find((m) => m.id === monHocId) || null}
                                        onChange={(event, newValue) => {
                                            if (typeof newValue === "string") {
                                                handleMonHocChange({ target: { value: newValue } });
                                            } else if (newValue) {
                                                handleMonHocChange({ target: { value: newValue.id } });
                                            } else {
                                                handleMonHocChange({ target: { value: "" } });
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Môn học" fullWidth size="small" />}
                                    />
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
                        disabled={!lopId || !kyHoc || (!useKeHoachDaoTao && !monHocId) || (useKeHoachDaoTao && keHoachMonHocList.length === 0) || isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : (editId !== null ? "Cập nhật" : "Xác nhận")}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default ThoiKhoaBieu;