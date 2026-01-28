import React, { useState, useEffect } from 'react';
import {
    Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Box,
    TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import PageHeader from '../../layout/PageHeader';
import {
    fetchDanhSachHeDaoTao,
    getDanhSachKhoaDaoTao
} from '../../Api_controller/Service/trainingService';
import { getDanhSachLop } from '../../Api_controller/Service/lopService';
import { exportSinhVienToExcel, exportSinhVienPreview } from '../../Api_controller/Service/sinhVienService';

const XuatThongTinSinhVien = () => {
    const [filterType, setFilterType] = useState('khoa'); // 'khoa' hoặc 'lop'
    const [heDaoTao, setHeDaoTao] = useState([]);
    const [khoa, setKhoa] = useState([]);
    const [lop, setLop] = useState([]);
    const [filterHeDaoTao, setFilterHeDaoTao] = useState('');
    const [filterKhoa, setFilterKhoa] = useState('');
    const [filterLop, setFilterLop] = useState('');
    const [loading, setLoading] = useState(false);

    // Export & Preview State
    const [previewData, setPreviewData] = useState([]);
    const [showExportSection, setShowExportSection] = useState(false);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [heDaoTaoData, khoaData] = await Promise.all([
                    fetchDanhSachHeDaoTao(),
                    getDanhSachKhoaDaoTao()
                ]);
                setHeDaoTao(heDaoTaoData || []);
                setKhoa(khoaData || []);
            } catch (error) {
                toast.error('Không thể tải dữ liệu ban đầu!');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchLop = async () => {
            if (filterType === 'lop' && filterKhoa) {
                try {
                    const lopData = await getDanhSachLop();
                    const filteredLop = lopData.filter(l => l.khoa_dao_tao_id === filterKhoa);
                    setLop(filteredLop || []);
                } catch {
                    toast.error('Không thể tải danh sách lớp!');
                    setLop([]);
                }
            } else {
                setLop([]);
            }
            setFilterLop('');
        };
        fetchLop();
    }, [filterKhoa, filterType]);

    const handleExportClick = async () => {
        if (!filterKhoa) {
            toast.warning('Vui lòng chọn khóa đào tạo!');
            return;
        }
        if (filterType === 'lop' && !filterLop) {
            toast.warning('Vui lòng chọn lớp!');
            return;
        }

        setLoading(true);
        try {
            const filters = {
                khoa_dao_tao_id: filterKhoa,
                lop_id: filterType === 'lop' ? filterLop : undefined,
            };
            const response = await exportSinhVienPreview(filters);
            if (response && response.success) {
                setPreviewData(response.data || []);
                setShowExportSection(true);
                setFileName(`DanhSachSinhVien_${new Date().toISOString().substring(0, 10)}`);
            } else {
                toast.error('Không tải được dữ liệu xem trước');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải xem trước!');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmExport = async () => {
        setLoading(true);
        try {
            const filters = {
                khoa_dao_tao_id: filterKhoa,
                lop_id: filterType === 'lop' ? filterLop : undefined,
            };

            const blob = await exportSinhVienToExcel(filters);

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            // Use custom filename or default
            const finalName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
            link.setAttribute('download', finalName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success('Xuất file thành công!');
            setShowExportSection(false);
            setPreviewData([]);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xuất file Excel!');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <PageHeader title="Xuất thông tin sinh viên" />
                    <Grid container spacing={2} alignItems="center">

                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Hệ đào tạo</InputLabel>
                                <Select
                                    value={filterHeDaoTao}
                                    onChange={(e) => {
                                        setFilterHeDaoTao(e.target.value);
                                        setFilterKhoa('');
                                        setFilterLop('');
                                    }}
                                    label="Hệ đào tạo"
                                >
                                    <MenuItem value=""><em>Tất cả</em></MenuItem>
                                    {heDaoTao.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.ten_he_dao_tao}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Lọc theo</InputLabel>
                                <Select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setFilterKhoa('');
                                        setFilterLop('');
                                    }}
                                    label="Lọc theo"
                                >
                                    <MenuItem value="khoa">Theo khóa đào tạo</MenuItem>
                                    <MenuItem value="lop">Theo lớp</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Khóa đào tạo</InputLabel>
                                <Select
                                    value={filterKhoa}
                                    onChange={(e) => setFilterKhoa(e.target.value)}
                                    label="Khóa đào tạo"
                                >
                                    <MenuItem value=""><em>Tất cả</em></MenuItem>
                                    {khoa
                                        .filter(k => !filterHeDaoTao || k.he_dao_tao_id === filterHeDaoTao)
                                        .map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.ma_khoa} - {item.ten_khoa}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {filterType === 'lop' && (
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Lớp</InputLabel>
                                    <Select
                                        value={filterLop}
                                        onChange={(e) => setFilterLop(e.target.value)}
                                        label="Lớp"
                                        disabled={!filterKhoa}
                                    >
                                        <MenuItem value=""><em>Tất cả</em></MenuItem>
                                        {lop.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.ma_lop}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleExportClick}
                                    disabled={loading || !filterKhoa || (filterType === 'lop' && !filterLop)}
                                >
                                    {loading ? 'Đang xử lý...' : 'Xuất Excel'}
                                </Button>
                            </Box>
                        </Grid>

                        {/* Export Configuration Section */}
                        {showExportSection && (
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
                                    <Typography variant="h6" gutterBottom>Cấu hình xuất file</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <TextField
                                            label="Tên file"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            fullWidth
                                            size="small"
                                            helperText="Không cần nhập đuôi .xlsx"
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleConfirmExport}
                                            disabled={loading}
                                            sx={{ minWidth: 150 }}
                                        >
                                            Xác nhận tải
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        )}

                        {/* Data Table */}
                        {(previewData.length > 0) && (
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Dữ liệu xem trước:</Typography>
                                <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto' }}>
                                    <Table stickyHeader size="small" sx={{ minWidth: 3000 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ minWidth: 50, backgroundColor: '#FFE699' }}>STT</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFE699' }}>Mã SV</TableCell>
                                                <TableCell sx={{ minWidth: 150, backgroundColor: '#FFE699' }}>Họ đệm</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFE699' }}>Tên</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFE699' }}>Lớp</TableCell>
                                                <TableCell sx={{ minWidth: 100, backgroundColor: '#FFE699' }}>Ngày sinh</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFE699' }}>Nơi sinh</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFE699' }}>Giới tính</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFE699' }}>Dân tộc</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFE699' }}>Tôn giáo</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFE699' }}>Quốc tịch</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFE699' }}>Số CCCD</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFE699' }}>Ngày cấp CCCD</TableCell>
                                                <TableCell sx={{ minWidth: 150, backgroundColor: '#FFE699' }}>Nơi cấp CCCD</TableCell>

                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#E2EFDA' }}>SĐT</TableCell>
                                                <TableCell sx={{ minWidth: 150, backgroundColor: '#E2EFDA' }}>Email</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#E2EFDA' }}>SĐT Gia đình</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#E2EFDA' }}>SĐT Cơ quan</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#E2EFDA' }}>Ngày vào Đoàn</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#E2EFDA' }}>Ngày vào Đảng</TableCell>

                                                <TableCell sx={{ minWidth: 100, backgroundColor: '#DDEBF7' }}>Đối tượng</TableCell>
                                                <TableCell sx={{ minWidth: 150, backgroundColor: '#DDEBF7' }}>Đơn vị gửi ĐT</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#DDEBF7' }}>Năm TN PTTH</TableCell>
                                                <TableCell sx={{ minWidth: 100, backgroundColor: '#DDEBF7' }}>Tổ hợp XT</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#DDEBF7' }}>Điểm TT</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#DDEBF7' }}>Ngày nhập học</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#DDEBF7' }}>QĐ trúng tuyển</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#DDEBF7' }}>Ngày QĐ TT</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#DDEBF7' }}>Hệ đào tạo</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#DDEBF7' }}>Số QĐ CTDT</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#DDEBF7' }}>ĐT từ năm</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#DDEBF7' }}>ĐT đến năm</TableCell>
                                                <TableCell sx={{ minWidth: 150, backgroundColor: '#DDEBF7' }}>QĐ thôi học</TableCell>
                                                <TableCell sx={{ minWidth: 150, backgroundColor: '#DDEBF7' }}>QĐ bảo lưu</TableCell>
                                                <TableCell sx={{ minWidth: 150, backgroundColor: '#DDEBF7' }}>Cảnh báo HT</TableCell>

                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFF2CC' }}>Tổng TC</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFF2CC' }}>ĐIểm TBTL(10)</TableCell>
                                                <TableCell sx={{ minWidth: 80, backgroundColor: '#FFF2CC' }}>Điểm TBTL(4)</TableCell>
                                                <TableCell sx={{ minWidth: 100, backgroundColor: '#FFF2CC' }}>Xếp loại TN</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>Số QĐ TN</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>Ngày QĐ TN</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>QĐ GDQPAN</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>Ngày QĐ GDQPAN</TableCell>
                                                <TableCell sx={{ minWidth: 100, backgroundColor: '#FFF2CC' }}>XL GDTC</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>QĐ Chuẩn TA</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>Ngày QĐ TA</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>Ngày cấp bằng</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>Số hiệu bằng</TableCell>
                                                <TableCell sx={{ minWidth: 120, backgroundColor: '#FFF2CC' }}>Số vào sổ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {previewData.map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>{row.stt}</TableCell>
                                                    <TableCell>{row.ma_sinh_vien}</TableCell>
                                                    <TableCell>{row.ho_dem}</TableCell>
                                                    <TableCell>{row.ten}</TableCell>
                                                    <TableCell>{row.lop}</TableCell>
                                                    <TableCell>{row.ngay_sinh}</TableCell>
                                                    <TableCell>{row.noi_sinh}</TableCell>
                                                    <TableCell>{row.gioi_tinh}</TableCell>
                                                    <TableCell>{row.dan_toc}</TableCell>
                                                    <TableCell>{row.ton_giao}</TableCell>
                                                    <TableCell>{row.quoc_tich}</TableCell>
                                                    <TableCell>{row.cccd}</TableCell>
                                                    <TableCell>{row.ngay_cap_cccd}</TableCell>
                                                    <TableCell>{row.noi_cap_cccd}</TableCell>

                                                    <TableCell>{row.so_dien_thoai}</TableCell>
                                                    <TableCell>{row.email}</TableCell>
                                                    <TableCell>{row.dien_thoai_gia_dinh}</TableCell>
                                                    <TableCell>{row.dien_thoai_cq}</TableCell>
                                                    <TableCell>{row.ngay_vao_doan}</TableCell>
                                                    <TableCell>{row.ngay_vao_dang}</TableCell>

                                                    <TableCell>{row.doi_tuong}</TableCell>
                                                    <TableCell>{row.don_vi_gui}</TableCell>
                                                    <TableCell>{row.nam_tot_nghiep_PTTH}</TableCell>
                                                    <TableCell>{row.to_hop_xet_tuyen}</TableCell>
                                                    <TableCell>{row.diem_trung_tuyen}</TableCell>

                                                    <TableCell>{row.ngay_vao_truong}</TableCell>
                                                    <TableCell>{row.quyet_dinh_trung_tuyen}</TableCell>
                                                    <TableCell>{row.ngay_ban_hanh_qd_trung_tuyen}</TableCell>
                                                    <TableCell>{row.he_dao_tao}</TableCell>
                                                    <TableCell>{row.so_quyet_dinh_ctdt}</TableCell>
                                                    <TableCell>{row.dao_tao_tu}</TableCell>
                                                    <TableCell>{row.dao_tao_den}</TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell></TableCell>

                                                    <TableCell>{row.tong_tin_chi}</TableCell>
                                                    <TableCell>{row.diem_tbtl_10}</TableCell>
                                                    <TableCell>{row.diem_tbtl_4}</TableCell>
                                                    <TableCell>{row.xep_loai_tn}</TableCell>
                                                    <TableCell>{row.so_qd_tn}</TableCell>
                                                    <TableCell>{row.ngay_qd_tn}</TableCell>
                                                    <TableCell>{row.qd_gdqpan}</TableCell>
                                                    <TableCell>{row.ngay_qd_gdqpan}</TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell>{row.qd_ta}</TableCell>
                                                    <TableCell>{row.ngay_qd_ta}</TableCell>
                                                    <TableCell>{row.ngay_cap_bang}</TableCell>
                                                    <TableCell>{row.so_hieu_bang}</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        )}

                    </Grid>
                </Paper>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                    * Chọn các bộ lọc phía trên và nhấn nút "Xuất Excel" để tải về danh sách sinh viên với đầy đủ thông tin chi tiết.
                </Typography>
            </Grid>
        </Grid>
    );
};
export default XuatThongTinSinhVien;
