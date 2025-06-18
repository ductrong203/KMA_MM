import { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box, Autocomplete, TextField, Skeleton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import {
  fetchDanhSachHeDaoTao,
  getDanhSachKhoaDaoTao
} from '../../Api_controller/Service/trainingService';
import { getDanhSachLop } from '../../Api_controller/Service/lopService';
import React from 'react';

// Đăng ký Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Giả lập API
const fetchDanhSachKyHoc = async () => {
  return [
    { id: 'all', ten_ky: 'Tất cả' },
    { id: '1', ten_ky: 'Kỳ 1' },
    { id: '2', ten_ky: 'Kỳ 2' }
  ];
};

const fetchThongKeDiem = async (heDaoTaoId, khoaId, lopId, kyHocId) => {
  const isAllKy = kyHocId === 'all';
  const monHocList = [
    'Tin học đại cương', 'Toán CC A1', 'Toán CC A3', 'Công nghệ mạng MT',
    'KTCT Mác-Lênin', 'Triết học Mác-Lênin', 'Tiếng Anh1'
  ];

  const sampleData = [
    {
      ma_sinh_vien: 'SV001',
      ho_ten: 'Trần Xuân An',
      gioi_tinh: 'Nam',
      diem_tb_ky: isAllKy ? { 'Kỳ 1': 7.41, 'Kỳ 2': 7.21 } : { [kyHocId]: 7.41 },
      diem_tb_tich_luy_he10: 7.41,
      diem_tb_tich_luy_he4: 3.0,
      chi_tiet: [
        {
          ky_hoc: 'Kỳ 1',
          mon_hoc: {
            'Tin học đại cương': { tp1: 10, tp2: 9, diem_thi_ktph: 6, diem_hp: 7.1 },
            'Toán CC A1': { tp1: 10, tp2: 5, diem_thi_ktph: 5.8, diem_hp: 8 },
            'Toán CC A3': { tp1: 9, tp2: 8.5, diem_thi_ktph: 8.4, diem_hp: 10 },
            'Công nghệ mạng MT': { tp1: 9, tp2: 8.5, diem_thi_ktph: 8.9, diem_hp: 8.7 },
            'KTCT Mác-Lênin': { tp1: 8, tp2: 7, diem_thi_ktph: 7.4, diem_hp: 8.3 },
            'Triết học Mác-Lênin': { tp1: 8, tp2: 6, diem_thi_ktph: 6.7, diem_hp: 7.21 },
            'Tiếng Anh1': { tp1: 10, tp2: 8.3, diem_thi_ktph: 8.5, diem_hp: 8.5 }
          },
          diem_tb_ky_he10: 7.41,
          diem_tb_ky_he4: 3.0
        }
      ]
    },
    {
      ma_sinh_vien: 'SV002',
      ho_ten: 'Tưởng Cao Bằng',
      gioi_tinh: 'Nam',
      diem_tb_ky: isAllKy ? { 'Kỳ 1': 7.01, 'Kỳ 2': 6.67 } : { [kyHocId]: 7.01 },
      diem_tb_tich_luy_he10: 7.01,
      diem_tb_tich_luy_he4: 2.8,
      chi_tiet: [
        {
          ky_hoc: 'Kỳ 1',
          mon_hoc: {
            'Tin học đại cương': { tp1: 8, tp2: 8.5, diem_thi_ktph: 5.2, diem_hp: 6.1 },
            'Toán CC A1': { tp1: 8, tp2: 8, diem_thi_ktph: 7.7, diem_hp: 8.6 },
            'Toán CC A3': { tp1: 8.5, tp2: 7.8, diem_thi_ktph: 8, diem_hp: 8 },
            'Công nghệ mạng MT': { tp1: 8.5, tp2: 7.8, diem_thi_ktph: 7.9, diem_hp: 8.5 },
            'KTCT Mác-Lênin': { tp1: 7, tp2: 7, diem_thi_ktph: 7.3, diem_hp: 8.3 },
            'Triết học Mác-Lênin': { tp1: 7, tp2: 1, diem_thi_ktph: 3.1, diem_hp: 6.67 },
            'Tiếng Anh1': { tp1: 8, tp2: 8.8, diem_thi_ktph: 8.8, diem_hp: 8.8 }
          },
          diem_tb_ky_he10: 7.01,
          diem_tb_ky_he4: 2.8
        }
      ]
    }
  ];

  return {
    thongKeTongQuan: sampleData.map(item => ({
      ma_sinh_vien: item.ma_sinh_vien,
      ho_ten: item.ho_ten,
      gioi_tinh: item.gioi_tinh,
      diem_tb_ky: item.diem_tb_ky,
      diem_tb_tich_luy_he10: item.diem_tb_tich_luy_he10,
      diem_tb_tich_luy_he4: item.diem_tb_tich_luy_he4
    })),
    chiTietMonHoc: sampleData.flatMap(item => item.chi_tiet.map(chiTiet => ({
      ma_sinh_vien: item.ma_sinh_vien,
      ho_ten: item.ho_ten,
      ky_hoc: chiTiet.ky_hoc,
      mon_hoc: chiTiet.mon_hoc,
      diem_tb_ky_he10: chiTiet.diem_tb_ky_he10,
      diem_tb_ky_he4: chiTiet.diem_tb_ky_he4
    })))
  };
};

const ThongKeDiem = () => {
  const [heDaoTao, setHeDaoTao] = useState([]);
  const [khoa, setKhoa] = useState([]);
  const [lop, setLop] = useState([]);
  const [kyHoc, setKyHoc] = useState([]);
  const [filterHeDaoTao, setFilterHeDaoTao] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  const [filterLop, setFilterLop] = useState(null);
  const [filterKyHoc, setFilterKyHoc] = useState('');
  const [thongKeTongQuan, setThongKeTongQuan] = useState([]);
  const [chiTietMonHoc, setChiTietMonHoc] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [heDaoTaoData, khoaData, kyHocData] = await Promise.all([
          fetchDanhSachHeDaoTao(),
          getDanhSachKhoaDaoTao(),
          fetchDanhSachKyHoc()
        ]);
        setHeDaoTao(heDaoTaoData || []);
        setKhoa(khoaData || []);
        setKyHoc(kyHocData || []);
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
      setFilterLop(null);
    };
    fetchLop();
  }, [filterKhoa]);

  const handleFilterChange = async () => {
    if (!filterLop) {
      toast.error('Vui lòng chọn lớp!');
      return;
    }
    setLoading(true);
    try {
      const thongKeData = await fetchThongKeDiem(filterHeDaoTao, filterKhoa, filterLop.id, filterKyHoc);
      setThongKeTongQuan(thongKeData.thongKeTongQuan || []);
      setChiTietMonHoc(thongKeData.chiTietMonHoc || []);
    } catch (error) {
      toast.error('Không thể tải dữ liệu thống kê!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFilterHeDaoTao('');
    setFilterKhoa('');
    setFilterLop(null);
    setFilterKyHoc('');
    setThongKeTongQuan([]);
    setChiTietMonHoc([]);
  };

  const exportToExcel = () => {
    const monHocList = [
      'Tin học đại cương', 'Toán CC A1', 'Toán CC A3', 'Công nghệ mạng MT',
      'KTCT Mác-Lênin', 'Triết học Mác-Lênin', 'Tiếng Anh1'
    ];

    const worksheetData = chiTietMonHoc.map(item => {
      const row = {
        'Mã SV': item.ma_sinh_vien,
        'Họ tên': item.ho_ten,
        'Kỳ học': item.ky_hoc
      };
      monHocList.forEach(mon => {
        const diem = item.mon_hoc[mon] || {};
        row[`${mon}_TP1`] = diem.tp1 || '-';
        row[`${mon}_TP2`] = diem.tp2 || '-';
        row[`${mon}_Điểm thi KTPH`] = diem.diem_thi_ktph || '-';
        row[`${mon}_Điểm HP`] = diem.diem_hp || '-';
      });
      row['ĐTB kỳ (hệ 10)'] = item.diem_tb_ky_he10;
      row['ĐTB kỳ (hệ 4)'] = item.diem_tb_ky_he4;
      return row;
    });

    const worksheetTongQuan = XLSX.utils.json_to_sheet(
      thongKeTongQuan.map(sv => {
        const diemTbKy = filterKyHoc === 'all'
          ? Object.keys(sv.diem_tb_ky).reduce((acc, ky) => ({
              ...acc,
              [`ĐTB ${ky}`]: sv.diem_tb_ky[ky]
            }), {})
          : { 'ĐTB Kỳ': sv.diem_tb_ky[filterKyHoc] };
        return {
          'Mã SV': sv.ma_sinh_vien,
          'Họ tên': sv.ho_ten,
          'Giới tính': sv.gioi_tinh,
          ...diemTbKy,
          'ĐTB tích lũy (hệ 10)': sv.diem_tb_tich_luy_he10,
          'ĐTB tích lũy (hệ 4)': sv.diem_tb_tich_luy_he4
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetTongQuan, 'Thống kê tổng quát');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(worksheetData), 'Chi tiết môn học');
    XLSX.write(workbook, 'Thong_ke_diem.xlsx');
  };

  const chartData = {
    labels: thongKeTongQuan.map(sv => sv.ho_ten),
    datasets: filterKyHoc === 'all'
      ? kyHoc.filter(ky => ky.id !== 'all').map((ky, index) => ({
          label: ky.ten_ky,
          data: thongKeTongQuan.map(sv => sv.diem_tb_ky[ky.ten_ky] || 0),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'][index % 3],
          borderColor: ['#FF6384', '#36A2EB', '#FFCE56'][index % 3],
          borderWidth: 1
        }))
      : [{
          label: 'ĐTB Kỳ',
          data: thongKeTongQuan.map(sv => sv.diem_tb_ky[filterKyHoc] || 0),
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 1
        }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Điểm trung bình học kỳ của sinh viên' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: 'Điểm (hệ 10)' }
      }
    }
  };

  const renderTongQuanTable = () => {
    const isAllKy = filterKyHoc === 'all';
    const kyHocList = isAllKy ? kyHoc.filter(ky => ky.id !== 'all').map(ky => ky.ten_ky) : [];
    return (
      <TableContainer component={Paper} sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã SV</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giới tính</TableCell>
              {isAllKy ? kyHocList.map(ky => (
                <TableCell key={ky} sx={{ fontWeight: 'bold' }}>ĐTB {ky}</TableCell>
              )) : <TableCell sx={{ fontWeight: 'bold' }}>ĐTB Kỳ</TableCell>}
              <TableCell sx={{ fontWeight: 'bold' }}>ĐTB tích lũy (hệ 10)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ĐTB tích lũy (hệ 4)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {thongKeTongQuan.map((sv, index) => (
              <TableRow key={sv.ma_sinh_vien} sx={{ backgroundColor: index % 2 ? '#fafafa' : 'white' }}>
                <TableCell>{sv.ma_sinh_vien}</TableCell>
                <TableCell>{sv.ho_ten}</TableCell>
                <TableCell>{sv.gioi_tinh}</TableCell>
                {isAllKy ? kyHocList.map(ky => (
                  <TableCell key={ky}>{sv.diem_tb_ky[ky]?.toFixed(2) || '-'}</TableCell>
                )) : <TableCell>{sv.diem_tb_ky[filterKyHoc]?.toFixed(2) || '-'}</TableCell>}
                <TableCell>{sv.diem_tb_tich_luy_he10.toFixed(2)}</TableCell>
                <TableCell>{sv.diem_tb_tich_luy_he4.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChiTietTable = () => {
    const monHocList = [
      'Tin học đại cương', 'Toán CC A1', 'Toán CC A3', 'Công nghệ mạng MT',
      'KTCT Mác-Lênin', 'Triết học Mác-Lênin', 'Tiếng Anh1'
    ];

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell rowSpan={2} sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>Mã SV</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>Họ tên</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>Kỳ học</TableCell>
              {monHocList.map(mon => (
                <TableCell key={mon} colSpan={4} align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', backgroundColor: '#e3f2fd' }}>
                  {mon}
                </TableCell>
              ))}
              <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>ĐTB kỳ (hệ 10)</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>ĐTB kỳ (hệ 4)</TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {monHocList.map(mon => (
                <React.Fragment key={mon}>
                  <TableCell sx={{ fontWeight: 'medium' }}>TP1</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>TP2</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>Thi KTPH</TableCell>
                  <TableCell sx={{ fontWeight: 'medium', borderRight: '1px solid #e0e0e0' }}>Điểm HP</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {chiTietMonHoc.map((item, index) => (
              <TableRow key={`${item.ma_sinh_vien}-${item.ky_hoc}-${index}`} sx={{ backgroundColor: index % 2 ? '#fafafa' : 'white' }}>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{item.ma_sinh_vien}</TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{item.ho_ten}</TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{item.ky_hoc}</TableCell>
                {monHocList.map(mon => {
                  const diem = item.mon_hoc[mon] || {};
                  return (
                    <React.Fragment key={mon}>
                      <TableCell>{diem.tp1 || '-'}</TableCell>
                      <TableCell>{diem.tp2 || '-'}</TableCell>
                      <TableCell>{diem.diem_thi_ktph || '-'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{diem.diem_hp || '-'}</TableCell>
                    </React.Fragment>
                  );
                })}
                <TableCell>{item.diem_tb_ky_he10.toFixed(2)}</TableCell>
                <TableCell>{item.diem_tb_ky_he4.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
      {/* Bộ lọc */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" gutterBottom>Bộ lọc thống kê điểm</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Hệ đào tạo</InputLabel>
                <Select
                  value={filterHeDaoTao}
                  onChange={(e) => {
                    setFilterHeDaoTao(e.target.value);
                    setFilterKhoa('');
                    setFilterLop(null);
                    setFilterKyHoc('');
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
                <InputLabel>Khóa đào tạo</InputLabel>
                <Select
                  value={filterKhoa}
                  onChange={(e) => {
                    setFilterKhoa(e.target.value);
                    setFilterLop(null);
                    setFilterKyHoc('');
                  }}
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
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={lop}
                getOptionLabel={(option) => option.ma_lop || ''}
                value={filterLop}
                onChange={(e, newValue) => setFilterLop(newValue)}
                disabled={!filterKhoa}
                renderInput={(params) => <TextField {...params} label="Lớp" />}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Kỳ học</InputLabel>
                <Select
                  value={filterKyHoc}
                  onChange={(e) => setFilterKyHoc(e.target.value)}
                  label="Kỳ học"
                  disabled={!filterLop}
                >
                  {kyHoc.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.ten_ky}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleFilterChange}
                disabled={loading || !filterLop}
              >
                Xem thống kê
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetFilter}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Biểu đồ */}
      {thongKeTongQuan.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>So sánh điểm trung bình học kỳ</Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </Paper>
        </Grid>
      )}

      {/* Thống kê tổng quát */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" gutterBottom>Thống kê điểm tổng quát</Typography>
          {loading ? (
            <Box sx={{ my: 4 }}>
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} />
            </Box>
          ) : thongKeTongQuan.length > 0 ? (
            <>
              {renderTongQuanTable()}
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportToExcel}
                sx={{ mt: 2 }}
                disabled={thongKeTongQuan.length === 0}
              >
                Xuất Excel
              </Button>
            </>
          ) : (
            <Typography>Không có dữ liệu để hiển thị</Typography>
          )}
        </Paper>
      </Grid>

      {/* Chi tiết môn học */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" gutterBottom>Chi tiết điểm các môn</Typography>
          {loading ? (
            <Box sx={{ my: 4 }}>
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} />
            </Box>
          ) : chiTietMonHoc.length > 0 ? (
            renderChiTietTable()
          ) : (
            <Typography>Không có dữ liệu để hiển thị</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ThongKeDiem;