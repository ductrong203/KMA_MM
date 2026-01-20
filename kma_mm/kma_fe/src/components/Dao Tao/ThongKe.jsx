import { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Box, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import PageHeader from '../../layout/PageHeader';
import {
  fetchDanhSachHeDaoTao,
  getDanhSachKhoaDaoTao
} from '../../Api_controller/Service/trainingService';
import { getDanhSachLop } from '../../Api_controller/Service/lopService';
import {
  getThongKeTotNghiep,
  getThongKeDoAn,
  getThongKeBaoCao,
  getThongKeBaoCaoPreview
} from '../../Api_controller/Service/statisticService';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ThongKe = () => {
  const [filterType, setFilterType] = useState('khoa'); // 'khoa' hoặc 'lop'
  const [heDaoTao, setHeDaoTao] = useState([]);
  const [khoa, setKhoa] = useState([]);
  const [lop, setLop] = useState([]);
  const [filterHeDaoTao, setFilterHeDaoTao] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  const [filterLop, setFilterLop] = useState('');
  const [thongKeTotNghiep, setThongKeTotNghiep] = useState({});
  const [thongKeDoAn, setThongKeDoAn] = useState({});
  const [loading, setLoading] = useState(false);

  // Export Modal State
  const [openExportModal, setOpenExportModal] = useState(false);
  const [exportPreviewData, setExportPreviewData] = useState([]);
  const [exportFileName, setExportFileName] = useState('BaoCaoTongHop');

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
      } catch {
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

  const handleFilterChange = async () => {
    setLoading(true);
    try {
      // Chuẩn bị tham số API dựa trên loại filter
      let apiParams = {};

      if (filterType === 'lop') {
        // Nếu lọc theo lớp
        if (filterLop) {
          // Nếu đã chọn lớp cụ thể
          apiParams = {
            lop_id: filterLop
          };
        } else if (filterKhoa) {
          // Nếu chưa chọn lớp nhưng đã chọn khóa (lấy tất cả lớp trong khóa)
          apiParams = {
            khoa_dao_tao_id: filterKhoa
          };
        } else if (filterHeDaoTao) {
          // Nếu chỉ chọn hệ đào tạo
          apiParams = {
            he_dao_tao_id: filterHeDaoTao
          };
        }
      } else if (filterKhoa) {
        // Nếu lọc theo khóa đào tạo
        apiParams = {
          khoa_dao_tao_id: filterKhoa
        };
      } else if (filterHeDaoTao) {
        // Nếu chỉ chọn hệ đào tạo
        apiParams = {
          he_dao_tao_id: filterHeDaoTao
        };
      }

      // Nếu không có bộ lọc nào được chọn, hiển thị thông báo
      if (Object.keys(apiParams).length === 0) {
        toast.warning('Vui lòng chọn ít nhất một bộ lọc!');
        setLoading(false);
        return;
      }

      const [totNghiepData, doAnData] = await Promise.all([
        getThongKeTotNghiep(apiParams),
        getThongKeDoAn(apiParams)
      ]);

      setThongKeTotNghiep(totNghiepData || {});
      setThongKeDoAn(doAnData || {});
    } catch {
      toast.error('Không thể tải dữ liệu thống kê!');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const data = await getThongKeBaoCaoPreview({
        he_dao_tao_id: filterHeDaoTao,
        khoa_dao_tao_id: filterKhoa
      });

      if (!data || data.length === 0) {
        toast.warning('Không có dữ liệu để xuất báo cáo!');
        return;
      }

      setExportPreviewData(data);
      setExportFileName('BaoCaoTongHop');
      setOpenExportModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi lấy dữ liệu xem trước!');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExport = async () => {
    setLoading(true);
    try {
      const blob = await getThongKeBaoCao({
        he_dao_tao_id: filterHeDaoTao,
        khoa_dao_tao_id: filterKhoa
      });

      if (!blob) {
        toast.warning('Không có dữ liệu để xuất báo cáo!');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportFileName}_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Xuất báo cáo thành công!');
      setOpenExportModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xuất báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  const chartDataTotNghiep = {
    labels: ['Đã tốt nghiệp', 'Chờ duyệt', 'Từ chối'],
    datasets: [
      {
        label: 'Số lượng',
        data: [
          thongKeTotNghiep.totNghiep || 0,
          thongKeTotNghiep.choDuyet || 0,
          thongKeTotNghiep.tuChoi || 0
        ],
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
        borderColor: ['#36A2EB', '#FFCE56', '#FF6384'],
        borderWidth: 1
      }
    ]
  };

  const chartDataDoAn = {
    labels: ['Đủ điều kiện', 'Không đủ điều kiện'],
    datasets: [
      {
        label: 'Số lượng',
        data: [thongKeDoAn.duDieuKien || 0, thongKeDoAn.khongDuDieuKien || 0],
        backgroundColor: ['#4BC0C0', '#FFCE56'],
        borderColor: ['#4BC0C0', '#FFCE56'],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Thống kê' }
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Bộ lọc */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <PageHeader title="Bộ lọc thống kê" />
          <Grid container spacing={2}>
            {/* Loại lọc */}


            <Grid item xs={12} sm={4}>
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

            <Grid item xs={12} sm={4}>
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

            {/* Khóa đào tạo - hiển thị luôn */}
            <Grid item xs={12} sm={4}>
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

            {/* Lớp - chỉ hiển thị khi filterType === 'lop' */}
            {filterType === 'lop' && (
              <Grid item xs={12} sm={4}>
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
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {filterType === 'khoa'
                  ? 'Thống kê theo khóa đào tạo: Hiển thị tổng hợp tất cả sinh viên trong khóa đào tạo được chọn'
                  : 'Thống kê theo lớp cụ thể: Hiển thị dữ liệu chỉ của lớp được chọn'
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<BarChartIcon />}
                onClick={handleFilterChange}
                disabled={loading}
              >
                Xem thống kê
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportExcel}
                disabled={loading}
                sx={{ ml: 2 }}
              >
                Xuất Excel
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Thống kê tốt nghiệp */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <PageHeader title="Thống kê tốt nghiệp" />
          {thongKeTotNghiep.total > 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Tổng số: {thongKeTotNghiep.total} sinh viên
            </Typography>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : thongKeTotNghiep.total > 0 ? (
            <Bar data={chartDataTotNghiep} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Thống kê tốt nghiệp' } } }} />
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 4 }}>
              Không có dữ liệu để hiển thị. Vui lòng chọn bộ lọc và nhấn &quot;Xem thống kê&quot;.
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Thống kê đồ án */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <PageHeader title="Thống kê sinh viên đủ điều kiện làm đồ án" />
          {thongKeDoAn.total > 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Tổng số: {thongKeDoAn.total} sinh viên
            </Typography>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : thongKeDoAn.total > 0 ? (
            <Bar data={chartDataDoAn} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Thống kê đồ án' } } }} />
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 4 }}>
              Không có dữ liệu để hiển thị. Vui lòng chọn bộ lọc và nhấn &quot;Xem thống kê&quot;.
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Modal Preview Export */}
      <Dialog
        open={openExportModal}
        onClose={() => setOpenExportModal(false)}
        maxWidth="xl"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Xem trước báo cáo</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmExport}
              disabled={loading}
            >
              Đồng ý xuất Excel
            </Button>
          </Box>
          <IconButton onClick={() => setOpenExportModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Tên file xuất ra"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              variant="outlined"
              size="small"
              helperText={`File sẽ được lưu là: ${exportFileName}_[timestamp].xlsx`}
            />
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#FFE699', fontWeight: 'bold' }}>STT</TableCell>
                  <TableCell style={{ backgroundColor: '#FFE699', fontWeight: 'bold' }}>Mã khóa</TableCell>
                  <TableCell style={{ backgroundColor: '#FFE699', fontWeight: 'bold' }}>Tên khóa</TableCell>
                  <TableCell style={{ backgroundColor: '#FFE699', fontWeight: 'bold' }}>Hệ đào tạo</TableCell>
                  <TableCell style={{ backgroundColor: '#FFE699', fontWeight: 'bold' }}>Niên khóa</TableCell>
                  <TableCell style={{ backgroundColor: '#E2EFDA', fontWeight: 'bold' }}>Số HV đầu vào</TableCell>
                  <TableCell style={{ backgroundColor: '#E2EFDA', fontWeight: 'bold' }}>Số HV tốt nghiệp đúng hạn</TableCell>
                  <TableCell style={{ backgroundColor: '#E2EFDA', fontWeight: 'bold' }}>Số HV tốt nghiệp không đúng hạn</TableCell>
                  <TableCell style={{ backgroundColor: '#DDEBF7', fontWeight: 'bold' }}>Khối lượng CTĐT</TableCell>
                  <TableCell style={{ backgroundColor: '#DDEBF7', fontWeight: 'bold' }}>Khối lượng HP điều kiện</TableCell>
                  <TableCell style={{ backgroundColor: '#DDEBF7', fontWeight: 'bold' }}>Thời gian đào tạo</TableCell>
                  <TableCell style={{ backgroundColor: '#EDEDED', fontWeight: 'bold' }}>Tổng số học kỳ</TableCell>
                  <TableCell style={{ backgroundColor: '#EDEDED', fontWeight: 'bold' }}>Số lớp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exportPreviewData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell align="center">{row.stt}</TableCell>
                    <TableCell>{row.ma_khoa}</TableCell>
                    <TableCell>{row.ten_khoa}</TableCell>
                    <TableCell>{row.he_dao_tao}</TableCell>
                    <TableCell align="center">{row.nien_khoa}</TableCell>
                    <TableCell align="center">{row.so_hv_dau_vao}</TableCell>
                    <TableCell align="center">{row.so_hv_tot_nghiep_dung_han}</TableCell>
                    <TableCell align="center">{row.so_hv_tot_nghiep_khong_dung_han}</TableCell>
                    <TableCell align="center">{row.khoi_luong_ctdt}</TableCell>
                    <TableCell align="center">{row.khoi_luong_hp_dieu_kien}</TableCell>
                    <TableCell align="center">{row.thoi_gian_dao_tao}</TableCell>
                    <TableCell align="center">{row.tong_so_hoc_ky}</TableCell>
                    <TableCell align="center">{row.so_lop}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default ThongKe;