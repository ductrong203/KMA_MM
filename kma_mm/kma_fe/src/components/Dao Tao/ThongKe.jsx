import { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box, CircularProgress
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import PageHeader from '../../layout/PageHeader';
import {
  fetchDanhSachHeDaoTao,
  getDanhSachKhoaDaoTao
} from '../../Api_controller/Service/trainingService';
import { getDanhSachLop } from '../../Api_controller/Service/lopService';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Giả lập API mới
const fetchDanhSachNamHoc = async () => {
  // Thay bằng API thật
  return [
    { id: '2020', ten_nam_hoc: '2020-2021' },
    { id: '2021', ten_nam_hoc: '2021-2022' },
    { id: '2022', ten_nam_hoc: '2022-2023' },
    { id: '2023', ten_nam_hoc: '2023-2024' },
    { id: '2024', ten_nam_hoc: '2024-2025' }
  ];
};

const fetchDanhSachKyHoc = async () => {
  // Thay bằng API thật
  return [
    { id: '1', ten_ky: 'Kỳ 1' },
    { id: '2', ten_ky: 'Kỳ 2' }
  ];
};

const fetchDanhSachMonHoc = async () => {
  // Thay bằng API thật
  return [
    { id: '1', ten_mon_hoc: 'Toán rời rạc' },
    { id: '2', ten_mon_hoc: 'Cấu trúc dữ liệu' },
    { id: '3', ten_mon_hoc: 'Lập trình hướng đối tượng' }
  ];
};

// Cập nhật API thống kê để hỗ trợ các bộ lọc mới
const fetchThongKeXepLoai = async (heDaoTaoId, khoaId, lopId, namHocId, kyHocId, monHocId) => {
  // Thay bằng API thật, gửi thêm tham số namHocId, kyHocId, monHocId
  return {
    data: [
      { xepLoai: 'Xuất sắc', soLuong: 10 },
      { xepLoai: 'Giỏi', soLuong: 20 },
      { xepLoai: 'Khá', soLuong: 30 },
      { xepLoai: 'Trung bình', soLuong: 15 }
    ],
    sinhVien: [
      {
        ma_sinh_vien: 'SV001',
        ho_ten: 'Nguyễn Văn A',
        he_dao_tao: 'Chính quy',
        khoa_dao_tao: 'K2020',
        lop: 'CNTT01',
        xep_loai: 'Xuất sắc'
      }
    ]
  };
};

const fetchThongKeTotNghiep = async (heDaoTaoId, khoaId, namHocId) => {
  // Thay bằng API thật
  return {
    totNghiep: 50,
    chuaTotNghiep: 20
  };
};

const fetchThongKeDoAn = async (heDaoTaoId, khoaId, namHocId) => {
  // Thay bằng API thật
  return {
    duDieuKien: 40,
    khongDuDieuKien: 30
  };
};

const ThongKe = () => {
  const [heDaoTao, setHeDaoTao] = useState([]);
  const [khoa, setKhoa] = useState([]);
  const [lop, setLop] = useState([]);
  const [namHoc, setNamHoc] = useState([]);
  const [kyHoc, setKyHoc] = useState([]);
  const [monHoc, setMonHoc] = useState([]);
  const [filterHeDaoTao, setFilterHeDaoTao] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  const [filterLop, setFilterLop] = useState('');
  const [filterNamHoc, setFilterNamHoc] = useState('');
  const [filterKyHoc, setFilterKyHoc] = useState('');
  const [filterMonHoc, setFilterMonHoc] = useState('');
  const [thongKeXepLoai, setThongKeXepLoai] = useState([]);
  const [sinhVienXepLoai, setSinhVienXepLoai] = useState([]);
  const [thongKeTotNghiep, setThongKeTotNghiep] = useState({});
  const [thongKeDoAn, setThongKeDoAn] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [heDaoTaoData, khoaData, namHocData, kyHocData, monHocData] = await Promise.all([
          fetchDanhSachHeDaoTao(),
          getDanhSachKhoaDaoTao(),
          fetchDanhSachNamHoc(),
          fetchDanhSachKyHoc(),
          fetchDanhSachMonHoc()
        ]);
        setHeDaoTao(heDaoTaoData || []);
        setKhoa(khoaData || []);
        setNamHoc(namHocData || []);
        setKyHoc(kyHocData || []);
        setMonHoc(monHocData || []);
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
      if (filterKhoa) {
        try {
          const lopData = await getDanhSachLop();
          const filteredLop = lopData.filter(l => l.khoa_dao_tao_id === filterKhoa);
          setLop(filteredLop || []);
        } catch (error) {
          toast.error('Không thể tải danh sách lớp!');
          setLop([]);
        }
      } else {
        setLop([]);
      }
      setFilterLop('');
    };
    fetchLop();
  }, [filterKhoa]);

  const handleFilterChange = async () => {
    setLoading(true);
    try {
      const [xepLoaiData, totNghiepData, doAnData] = await Promise.all([
        fetchThongKeXepLoai(filterHeDaoTao, filterKhoa, filterLop, filterNamHoc, filterKyHoc, filterMonHoc),
        fetchThongKeTotNghiep(filterHeDaoTao, filterKhoa, filterNamHoc),
        fetchThongKeDoAn(filterHeDaoTao, filterKhoa, filterNamHoc)
      ]);
      setThongKeXepLoai(xepLoaiData.data || []);
      setSinhVienXepLoai(xepLoaiData.sinhVien || []);
      setThongKeTotNghiep(totNghiepData || {});
      setThongKeDoAn(doAnData || {});
    } catch (error) {
      toast.error('Không thể tải dữ liệu thống kê!');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      sinhVienXepLoai.map(sv => ({
        'Mã SV': sv.ma_sinh_vien,
        'Họ tên': sv.ho_ten,
        'Hệ đào tạo': sv.he_dao_tao,
        'Khóa đào tạo': sv.khoa_dao_tao,
        'Lớp': sv.lop,
        'Xếp loại': sv.xep_loai
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên');
    XLSX.write(workbook, 'Danh_sach_sinh_vien.xlsx');
  };

  const chartDataXepLoai = {
    labels: thongKeXepLoai.map(item => item.xepLoai),
    datasets: [
      {
        label: 'Số lượng',
        data: thongKeXepLoai.map(item => item.soLuong),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderWidth: 1
      }
    ]
  };

  const chartDataTotNghiep = {
    labels: ['Tốt nghiệp', 'Chưa tốt nghiệp'],
    datasets: [
      {
        label: 'Số lượng',
        data: [thongKeTotNghiep.totNghiep || 0, thongKeTotNghiep.chuaTotNghiep || 0],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderColor: ['#36A2EB', '#FF6384'],
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Năm học</InputLabel>
                <Select
                  value={filterNamHoc}
                  onChange={(e) => {
                    setFilterNamHoc(e.target.value);
                    setFilterKyHoc('');
                    setFilterMonHoc('');
                  }}
                  label="Năm học"
                >
                  <MenuItem value=""><em>Tất cả</em></MenuItem>
                  {namHoc.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.ten_nam_hoc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Kỳ học</InputLabel>
                <Select
                  value={filterKyHoc}
                  onChange={(e) => setFilterKyHoc(e.target.value)}
                  label="Kỳ học"
                  disabled={!filterNamHoc}
                >
                  <MenuItem value=""><em>Tất cả</em></MenuItem>
                  {kyHoc.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.ten_ky}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Môn học</InputLabel>
                <Select
                  value={filterMonHoc}
                  onChange={(e) => setFilterMonHoc(e.target.value)}
                  label="Môn học"
                  disabled={!filterNamHoc}
                >
                  <MenuItem value=""><em>Tất cả</em></MenuItem>
                  {monHoc.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.ten_mon_hoc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<BarChartIcon />}
                onClick={handleFilterChange}
                disabled={loading}
              >
                Xem thống kê
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Thống kê xếp loại */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <PageHeader title="Thống kê xếp loại" />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Xếp loại</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {thongKeXepLoai.map((item) => (
                      <TableRow key={item.xepLoai}>
                        <TableCell>{item.xepLoai}</TableCell>
                        <TableCell align="right">{item.soLuong}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Bar data={chartDataXepLoai} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Thống kê xếp loại' } } }} />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportToExcel}
                sx={{ mt: 2 }}
                disabled={sinhVienXepLoai.length === 0}
              >
                Xuất Excel
              </Button>
            </>
          )}
        </Paper>
      </Grid>

      {/* Thống kê tốt nghiệp */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <PageHeader title="Thống kê tốt nghiệp" />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Bar data={chartDataTotNghiep} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Thống kê tốt nghiệp' } } }} />
          )}
        </Paper>
      </Grid>

      {/* Thống kê đồ án */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <PageHeader title="Thống kê sinh viên đủ điều kiện làm đồ án" />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Bar data={chartDataDoAn} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Thống kê đồ án' } } }} />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ThongKe;