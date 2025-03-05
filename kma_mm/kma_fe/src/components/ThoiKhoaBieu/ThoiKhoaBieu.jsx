import { useState } from "react";
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
    ThemeProvider
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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
    const [kyHoc, setKyHoc] = useState("");
    const [lop, setLop] = useState("");
    const [monHoc, setMonHoc] = useState("");
    const [giangVien, setGiangVien] = useState("");
    const [thoiKhoaBieuList, setThoiKhoaBieuList] = useState([]);

    const kyHocOptions = ["Kỳ 1", "Kỳ 2", "Kỳ 3"];
    const lopOptions = ["Lớp A", "Lớp B", "Lớp C"];
    const monHocOptions = ["Toán", "Lý", "Hóa", "Văn"];
    const giangVienOptions = ["Thầy A", "Cô B", "Thầy C"];

    const handleSubmit = () => {
        if (kyHoc && lop && monHoc && giangVien) {
            const newItem = { kyHoc, lop, monHoc, giangVien };
            if (editIndex !== null) {
                const updatedList = [...thoiKhoaBieuList];
                updatedList[editIndex] = newItem;
                setThoiKhoaBieuList(updatedList);
            } else {
                setThoiKhoaBieuList([...thoiKhoaBieuList, newItem]);
            }
            setKyHoc("");
            setLop("");
            setMonHoc("");
            setGiangVien("");
            setEditIndex(null);
            setOpen(false);
        }
    };

    const handleEdit = (index) => {
        const item = thoiKhoaBieuList[index];
        setKyHoc(item.kyHoc);
        setLop(item.lop);
        setMonHoc(item.monHoc);
        setGiangVien(item.giangVien);
        setEditIndex(index);
        setOpen(true);
    };

    const handleDelete = (index) => {
        setThoiKhoaBieuList(thoiKhoaBieuList.filter((_, i) => i !== index));
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Box textAlign="center" my={2}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpen(true)}
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
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                {tkb.monHoc}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Kỳ học:</strong> {tkb.kyHoc}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Lớp:</strong> {tkb.lop}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Giảng viên:</strong> {tkb.giangVien}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <IconButton color="primary" size="small" onClick={() => handleEdit(index)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" size="small" onClick={() => handleDelete(index)}>
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
                <DialogTitle>{editIndex !== null ? "Sửa" : "Thêm"} Thời Khóa Biểu</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Kỳ Học</InputLabel>
                        <Select value={kyHoc} onChange={(e) => setKyHoc(e.target.value)}>
                            {kyHocOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Lớp</InputLabel>
                        <Select value={lop} onChange={(e) => setLop(e.target.value)}>
                            {lopOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Môn Học</InputLabel>
                        <Select value={monHoc} onChange={(e) => setMonHoc(e.target.value)}>
                            {monHocOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Giảng Viên</InputLabel>
                        <Select value={giangVien} onChange={(e) => setGiangVien(e.target.value)}>
                            {giangVienOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">Hủy</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">{editIndex !== null ? "Cập nhật" : "Xác nhận"}</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default ThoiKhoaBieu;