import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, Autocomplete, TextField, Typography, Accordion, AccordionSummary,
    AccordionDetails, Box, Card, CardContent, Grid, CircularProgress, Chip
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { createLop, getDanhSachLop, updateLop } from "../../Api_controller/Service/lopService";
import { fetchDanhSachHeDaoTao } from "../../Api_controller/Service/trainingService";
import { fetchDanhSachKhoa } from "../../Api_controller/Service/khoaService";

const QuanLyLop = () => {
    const [danhSachLop, setDanhSachLop] = useState([]);
    const [danhSachKhoa, setDanhSachKhoa] = useState([]);
    const [moForm, setMoForm] = useState(false);
    const [indexChinhSua, setIndexChinhSua] = useState(null);
    const [thongTinLop, setThongTinLop] = useState({
        khoa_dao_tao_id: ""
    });
    const [khoaMoRong, setKhoaMoRong] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    const [xemSinhVien, setXemSinhVien] = useState(false);
    const [lopDangChon, setLopDangChon] = useState(null);
    const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
    const [dangTaiSinhVien, setDangTaiSinhVien] = useState(false);

    useEffect(() => {
        layDanhSachLop();
        layDanhSachKhoa();
    }, []);

    // Lấy danh sách lớp từ API
    const layDanhSachLop = async () => {
        setDangTai(true);
        try {
            const ketQua = await getDanhSachLop();
            setDanhSachLop(ketQua || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lớp:", error);
            // // Sử dụng dữ liệu mẫu nếu API chưa hoạt động
            // setDanhSachLop([
            //     { id: 1, ma_lop: "LT01-01", khoa_dao_tao_id: 1 },
            //     { id: 2, ma_lop: "LT01-02", khoa_dao_tao_id: 1 },
            //     { id: 3, ma_lop: "LT02-01", khoa_dao_tao_id: 2 },
            //     { id: 4, ma_lop: "LT03-01", khoa_dao_tao_id: 3 },
            //     { id: 5, ma_lop: "LT02-02", khoa_dao_tao_id: 2 }
            // ]);
        } finally {
            setDangTai(false);
        }
    };

    // Lấy danh sách khóa từ API
    const layDanhSachKhoa = async () => {
        try {
            const ketQua = await fetchDanhSachKhoa();
            setDanhSachKhoa(ketQua || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa:", error);
            // // Sử dụng dữ liệu mẫu nếu API chưa hoạt động
            // setDanhSachKhoa([
            //     { id: 1, ma_khoa: "LT01", ten_khoa: "Khóa Lập Trình 01" },
            //     { id: 2, ma_khoa: "LT02", ten_khoa: "Khóa Lập Trình 02" },
            //     { id: 3, ma_khoa: "LT03", ten_khoa: "Khóa Lập Trình 03" }
            // ]);
        }
    };

    // Lấy danh sách sinh viên của lớp
    const layDanhSachSinhVien = async (lopId) => {
        setDangTaiSinhVien(true);
        try {
            // Trong thực tế, cần có API riêng để lấy sinh viên theo lớp
            // Đây là ví dụ gọi API, cần thay đổi theo API thực tế
            const ketQua = await getDanhSachSinhVien();
            setDanhSachSinhVien(ketQua || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sinh viên:", error);
            // Sử dụng dữ liệu mẫu
            setDanhSachSinhVien([
                { id: 1, ma_sv: "SV001", ho_ten: "Nguyễn Văn A", ngay_sinh: "2000-01-15" },
                { id: 2, ma_sv: "SV002", ho_ten: "Trần Thị B", ngay_sinh: "2001-05-20" },
                { id: 3, ma_sv: "SV003", ho_ten: "Lê Văn C", ngay_sinh: "2000-11-10" },
                { id: 4, ma_sv: "SV004", ho_ten: "Phạm Thị D", ngay_sinh: "2002-03-25" },
            ]);
        } finally {
            setDangTaiSinhVien(false);
        }
    };

    // Mở form (Thêm hoặc Chỉnh sửa)
    const moFormLop = (index = null) => {
        if (index !== null) {
            setIndexChinhSua(index);
            const lopDuocChon = danhSachLop[index];
            setThongTinLop({
                khoa_dao_tao_id: lopDuocChon.khoa_dao_tao_id
            });
        } else {
            setIndexChinhSua(null);
            setThongTinLop({ khoa_dao_tao_id: "" });
        }
        setMoForm(true);
    };

    // Đóng form
    const dongForm = () => setMoForm(false);

    // Xử lý khi chọn khóa từ Autocomplete
    const xuLyChonKhoa = (event, khoaDuocChon) => {
        if (khoaDuocChon) {
            setThongTinLop({
                ...thongTinLop,
                khoa_dao_tao_id: khoaDuocChon.id
            });
        } else {
            setThongTinLop({ ...thongTinLop, khoa_dao_tao_id: "" });
        }
    };

    // Tạo mã lớp tự động dựa trên khóa
    const taoMaLop = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        if (!khoa) return "LOP-MOID";

        // Đếm số lớp hiện có của khóa này
        const lopThuocKhoa = danhSachLop.filter(l => l.khoa_dao_tao_id === khoaId);
        const soThuTu = lopThuocKhoa.length + 1;

        // Tạo mã lớp theo định dạng: [MÃ KHÓA]-[SỐ THỨ TỰ 2 CHỮ SỐ]
        return `${khoa.ma_khoa}${soThuTu.toString().padStart(2, '0')}`;
    };

    // Lưu lớp mới hoặc cập nhật lớp
    const luuLop = async () => {
        try {
            const duLieuLuu = {
                khoa_dao_tao_id: thongTinLop.khoa_dao_tao_id
            };

            if (indexChinhSua === null) {
                // Thêm lớp mới
                const ketQua = await createLop(duLieuLuu);

                // Cách tốt nhất: Gọi lại API để lấy toàn bộ danh sách lớp mới nhất
                await layDanhSachLop();

                // Hoặc nếu API trả về đầy đủ thông tin lớp mới, sử dụng dữ liệu đó
                // if (ketQua?.data) {
                //     setDanhSachLop([...danhSachLop, ketQua.data]);
                // } else {
                //     await layDanhSachLop();
                // }
            } else {
                // Cập nhật lớp
                await updateLop(danhSachLop[indexChinhSua].id, duLieuLuu);
                // Gọi lại API để lấy dữ liệu mới nhất
                await layDanhSachLop();
            }
            dongForm();
        } catch (error) {
            console.error("Lỗi khi lưu lớp:", error);
            dongForm();
        }
    };

    // Hiển thị tên khóa
    const layTenKhoa = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        return khoa ? `${khoa.ma_khoa} - ${khoa.ten_khoa}` : "Khóa chưa xác định";
    };

    // Hiển thị mã khóa
    const layMaKhoa = (khoaId) => {
        const khoa = danhSachKhoa.find(k => k.id === khoaId);
        return khoa ? khoa.ma_khoa : "N/A";
    };

    // Nhóm lớp theo khóa
    const nhomLopTheoKhoa = () => {
        const danhSachNhom = {};

        // Tạo object nhóm
        danhSachKhoa.forEach(khoa => {
            danhSachNhom[khoa.id] = {
                khoa: khoa,
                danhSachLop: []
            };
        });

        // Thêm các lớp vào nhóm tương ứng
        danhSachLop.forEach(lop => {
            if (danhSachNhom[lop.khoa_dao_tao_id]) {
                danhSachNhom[lop.khoa_dao_tao_id].danhSachLop.push(lop);
            } else {
                // Trường hợp khóa không tồn tại trong danh sách
                if (!danhSachNhom['chuaXacDinh']) {
                    danhSachNhom['chuaXacDinh'] = {
                        khoa: { id: 'chuaXacDinh', ma_khoa: 'N/A', ten_khoa: 'Khóa chưa xác định' },
                        danhSachLop: []
                    };
                }
                danhSachNhom['chuaXacDinh'].danhSachLop.push(lop);
            }
        });

        return Object.values(danhSachNhom);
    };

    // Xử lý mở/đóng accordion
    const xuLyDoiTrangThaiAccordion = (khoaId) => (event, isExpanded) => {
        setKhoaMoRong(isExpanded ? khoaId : null);
    };

    // Xem chi tiết lớp (danh sách sinh viên)
    const xemDanhSachSinhVien = (lop) => {
        setLopDangChon(lop);
        layDanhSachSinhVien(lop.id);
        setXemSinhVien(true);
    };

    // Đóng dialog danh sách sinh viên
    const dongDanhSachSinhVien = () => {
        setXemSinhVien(false);
    };

    const danhSachLopTheoKhoa = nhomLopTheoKhoa();

    return (
        <div>
            <Card sx={{ mb: 4, p: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            Quản lý danh sách lớp theo khóa
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<EditIcon />}
                            onClick={() => moFormLop()}
                        >
                            Thêm lớp mới
                        </Button>
                    </Box>

                    {dangTai ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        /* Danh sách lớp được nhóm theo khóa */
                        <div>
                            {danhSachLopTheoKhoa.map((nhom) => (
                                <Accordion
                                    key={nhom.khoa.id}
                                    expanded={khoaMoRong === nhom.khoa.id}
                                    onChange={xuLyDoiTrangThaiAccordion(nhom.khoa.id)}
                                    sx={{ mb: 2 }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                {nhom.khoa.ma_khoa} - {nhom.khoa.ten_khoa}
                                            </Typography>
                                            <Chip
                                                label={`${nhom.danhSachLop.length} lớp`}
                                                size="small"
                                                color="primary"
                                                sx={{ ml: 2 }}
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {nhom.danhSachLop.length > 0 ? (
                                            <TableContainer component={Paper} elevation={0} variant="outlined">
                                                <Table>
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                                            <TableCell>Mã lớp</TableCell>
                                                            <TableCell>Thuộc khóa</TableCell>
                                                            <TableCell align="right">Hành động</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {nhom.danhSachLop.map((lop) => (
                                                            <TableRow key={lop.id} hover>
                                                                <TableCell>{lop.ma_lop}</TableCell>
                                                                <TableCell>{layMaKhoa(lop.khoa_dao_tao_id)}</TableCell>
                                                                <TableCell align="right">
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="info"
                                                                        startIcon={<PersonIcon />}
                                                                        onClick={() => xemDanhSachSinhVien(lop)}
                                                                        sx={{ mr: 1 }}
                                                                    >
                                                                        Danh sách sinh viên
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        startIcon={<EditIcon />}
                                                                        onClick={() => moFormLop(danhSachLop.findIndex(l => l.id === lop.id))}
                                                                    >
                                                                        Chỉnh sửa
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', p: 2 }}>
                                                Không có lớp nào trong khóa này
                                            </Typography>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                            {danhSachLopTheoKhoa.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body1">
                                        Không có dữ liệu lớp. Hãy thêm lớp mới!
                                    </Typography>
                                </Box>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Thêm/Sửa lớp */}
            <Dialog
                open={moForm}
                onClose={dongForm}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    {indexChinhSua === null ? "Thêm lớp mới" : "Chỉnh sửa thông tin lớp"}
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={danhSachKhoa}
                                    getOptionLabel={(option) => `${option.ma_khoa} - ${option.ten_khoa}`}
                                    value={danhSachKhoa.find(k => k.id === thongTinLop.khoa_dao_tao_id) || null}
                                    onChange={xuLyChonKhoa}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Chọn khóa"
                                            variant="outlined"
                                            required
                                            helperText="Vui lòng chọn khóa cho lớp này"
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        {thongTinLop.khoa_dao_tao_id && indexChinhSua === null && (
                            <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Mã lớp sẽ được tạo:</strong> {taoMaLop(thongTinLop.khoa_dao_tao_id)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontStyle: 'italic', mt: 1, display: 'block' }}>
                                        Mã lớp được tạo tự động theo định dạng: [MÃ KHÓA][SỐ THỨ TỰ]
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={dongForm}
                        variant="outlined"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={luuLop}
                        disabled={!thongTinLop.khoa_dao_tao_id}
                    >
                        {indexChinhSua === null ? "Tạo lớp" : "Lưu thay đổi"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog hiển thị danh sách sinh viên */}
            <Dialog
                open={xemSinhVien}
                onClose={dongDanhSachSinhVien}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1 }} />
                    Danh sách sinh viên - Lớp {lopDangChon?.ma_lop}
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 3, mt: 2 }}>
                    {dangTaiSinhVien ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', m: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Mã lớp:</strong> {lopDangChon?.ma_lop}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Thuộc khóa:</strong> {lopDangChon ? layTenKhoa(lopDangChon.khoa_dao_tao_id) : ''}
                                </Typography>
                            </Box>

                            {danhSachSinhVien.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                                                <TableCell>Mã SV</TableCell>
                                                <TableCell>Họ tên</TableCell>
                                                <TableCell>Ngày sinh</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {danhSachSinhVien.map((sinhVien) => (
                                                <TableRow key={sinhVien.id} hover>
                                                    <TableCell>{sinhVien.ma_sv}</TableCell>
                                                    <TableCell>{sinhVien.ho_ten}</TableCell>
                                                    <TableCell>
                                                        {new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                                    <Typography variant="body1">
                                        Lớp này chưa có sinh viên nào
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={dongDanhSachSinhVien}
                        variant="contained"
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default QuanLyLop;