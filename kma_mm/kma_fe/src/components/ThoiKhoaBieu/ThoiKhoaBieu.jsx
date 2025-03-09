// import { useState } from "react";
// import {
//     Box,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     Select,
//     Typography,
//     Paper,
//     Button,
//     Grid,
//     Container,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Card,
//     CardContent,
//     CardActions,
//     IconButton,
//     createTheme,
//     ThemeProvider
// } from "@mui/material";
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';

// const theme = createTheme({
//     palette: {
//         primary: {
//             main: '#1976d2',
//         },
//         background: {
//             default: '#f5f5f5'
//         }
//     },
//     typography: {
//         fontFamily: 'Roboto, Arial, sans-serif'
//     }
// });

// const ThoiKhoaBieu = () => {
//     const [open, setOpen] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [kyHoc, setKyHoc] = useState("");
//     const [lop, setLop] = useState("");
//     const [monHoc, setMonHoc] = useState("");
//     const [giangVien, setGiangVien] = useState("");
//     const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);

//     const kyHocOptions = ["Kỳ 1", "Kỳ 2", "Kỳ 3"];
//     const lopOptions = ["Lớp A", "Lớp B", "Lớp C"];
//     const monHocOptions = ["Toán", "Lý", "Hóa", "Văn"];
//     const giangVienOptions = ["Thầy A", "Cô B", "Thầy C"];

//     const handleSubmit = () => {
//         if (kyHoc && lop && monHoc && giangVien) {
//             const newItem = { kyHoc, lop, monHoc, giangVien };
//             if (editIndex !== null) {
//                 const updatedList = [...thoiKhoaBieuList];
//                 updatedList[editIndex] = newItem;
//                 setThoiKhoaBieuList(updatedList);
//             } else {
//                 setThoiKhoaBieuList([...thoiKhoaBieuList, newItem]);
//             }
//             setKyHoc("");
//             setLop("");
//             setMonHoc("");
//             setGiangVien("");
//             setEditIndex(null);
//             setOpen(false);
//         }
//     };

//     const handleEdit = (index) => {
//         const item = thoiKhoaBieuList[index];
//         setKyHoc(item.kyHoc);
//         setLop(item.lop);
//         setMonHoc(item.monHoc);
//         setGiangVien(item.giangVien);
//         setEditIndex(index);
//         setOpen(true);
//     };

//     const handleDelete = (index) => {
//         setThoiKhoaBieuList(thoiKhoaBieuList.filter((_, i) => i !== index));
//     };

//     return (
//         <ThemeProvider theme={theme}>
//             <Container maxWidth="md" sx={{ py: 4 }}>
//                 <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
//                     <Box textAlign="center" my={2}>
//                         <Button
//                             variant="contained"
//                             startIcon={<AddIcon />}
//                             onClick={() => setOpen(true)}
//                         >
//                             Thêm Thời Khóa Biểu
//                         </Button>
//                     </Box>

//                     {thoiKhoaBieuList.length === 0 ? (
//                         <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
//                             Chưa có thời khóa biểu nào được thêm
//                         </Typography>
//                     ) : (
//                         <Grid container spacing={2}>
//                             {thoiKhoaBieuList.map((tkb, index) => (
//                                 <Grid item xs={12} sm={6} md={4} key={index}>
//                                     <Card variant="outlined">
//                                         <CardContent>
//                                             <Typography variant="h6" color="primary" gutterBottom>
//                                                 {tkb.monHoc}
//                                             </Typography>
//                                             <Typography variant="body2" color="textSecondary">
//                                                 <strong>Kỳ học:</strong> {tkb.kyHoc}
//                                             </Typography>
//                                             <Typography variant="body2" color="textSecondary">
//                                                 <strong>Lớp:</strong> {tkb.lop}
//                                             </Typography>
//                                             <Typography variant="body2" color="textSecondary">
//                                                 <strong>Giảng viên:</strong> {tkb.giangVien}
//                                             </Typography>
//                                         </CardContent>
//                                         <CardActions>
//                                             <IconButton color="primary" size="small" onClick={() => handleEdit(index)}>
//                                                 <EditIcon />
//                                             </IconButton>
//                                             <IconButton color="error" size="small" onClick={() => handleDelete(index)}>
//                                                 <DeleteIcon />
//                                             </IconButton>
//                                         </CardActions>
//                                     </Card>
//                                 </Grid>
//                             ))}
//                         </Grid>
//                     )}
//                 </Paper>
//             </Container>

//             <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
//                 <DialogTitle>{editIndex !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
//                 <DialogContent>
//                     <FormControl fullWidth margin="normal">
//                         <InputLabel>Kỳ Học</InputLabel>
//                         <Select value={kyHoc} onChange={(e) => setKyHoc(e.target.value)}>
//                             {kyHocOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
//                         </Select>
//                     </FormControl>
//                     <FormControl fullWidth margin="normal">
//                         <InputLabel>Lớp</InputLabel>
//                         <Select value={lop} onChange={(e) => setLop(e.target.value)}>
//                             {lopOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
//                         </Select>
//                     </FormControl>
//                     <FormControl fullWidth margin="normal">
//                         <InputLabel>Môn Học</InputLabel>
//                         <Select value={monHoc} onChange={(e) => setMonHoc(e.target.value)}>
//                             {monHocOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
//                         </Select>
//                     </FormControl>
//                     <FormControl fullWidth margin="normal">
//                         <InputLabel>Giảng Viên</InputLabel>
//                         <Select value={giangVien} onChange={(e) => setGiangVien(e.target.value)}>
//                             {giangVienOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
//                         </Select>
//                     </FormControl>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setOpen(false)} color="secondary">Hủy</Button>
//                     <Button onClick={handleSubmit} color="primary" variant="contained">{editIndex !== null ? "Cập nhật" : "Xác nhận"}</Button>
//                 </DialogActions>
//             </Dialog>
//         </ThemeProvider>
//     );
// };

// export default ThoiKhoaBieu;



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
    TextField
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { getMonHoc, getThoiKhoaBieu, themThoiKhoaBieu, updateThoiKhoaBieu, xoaThoiKhoaBieu } from "../../Api_controller/Service/monHocService";
import { getGiangVien } from "../../Api_controller/Service/giangVienService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";

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

    // Data lists
    const [lopList, setLopList] = useState([]);
    const [monHocList, setMonHocList] = useState([]);
    const [giangVienList, setGiangVienList] = useState([]);
    const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);

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

    // Fetch thời khóa biểu list
    const fetchThoiKhoaBieu = async () => {
        try {
            const response = await getThoiKhoaBieu();
            setThoiKhoaBieuList(response);
        } catch (error) {
            console.error("Error fetching thời khóa biểu:", error);
        }
    };


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
                    await updateThoiKhoaBieu(editId, thoiKhoaBieuData) //axios.put(`http://localhost:8000/thoikhoabieu/${editId}`, thoiKhoaBieuData);
                } else {
                    // Create new record
                    await themThoiKhoaBieu(thoiKhoaBieuData) // axios.post("http://localhost:8000/thoikhoabieu", thoiKhoaBieuData);
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

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" gutterBottom textAlign="center">
                        Thời Khóa Biểu
                    </Typography>

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

                    {thoiKhoaBieuList.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ my: 4, fontStyle: 'italic' }}>
                            Chưa có thời khóa biểu nào được thêm
                        </Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {thoiKhoaBieuList.map((tkb, index) => (
                                <Grid item xs={12} sm={6} md={4} key={tkb.id || index}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                {findMonHocName(tkb.mon_hoc_id)}
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
                                        <CardActions>
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

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Lớp</InputLabel>
                        <Select value={lopId} onChange={handleLopChange}>
                            {lopList.map((lop) => (
                                <MenuItem key={lop.id} value={lop.id}>
                                    {lop.ma_lop}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" disabled={!lopId}>
                        <InputLabel>Môn Học</InputLabel>
                        <Select value={monHocId} onChange={handleMonHocChange}>
                            {monHocList.map((monHoc) => (
                                <MenuItem key={monHoc.id} value={monHoc.id}>
                                    {monHoc.ten_mon_hoc}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" disabled={!monHocId}>
                        <InputLabel>Giảng Viên</InputLabel>
                        <Select
                            value={giangVienId}
                            onChange={(e) => setGiangVienId(e.target.value)}
                        >
                            {giangVienList.map((giangVien) => (
                                <MenuItem key={giangVien.id} value={giangVien.id}>
                                    {giangVien.ho_ten}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Phòng Học"
                        value={phongHoc}
                        onChange={(e) => setPhongHoc(e.target.value)}
                        placeholder="Ví dụ: 103 TA1"
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