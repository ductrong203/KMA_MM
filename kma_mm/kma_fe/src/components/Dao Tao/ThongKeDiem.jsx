import { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box, Autocomplete, TextField, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import {
  fetchDanhSachHeDaoTao,
  getDanhSachKhoaDaoTao
} from '../../Api_controller/Service/trainingService';
import { getDanhSachLop } from '../../Api_controller/Service/lopService';
import { fetchThongKeDiem, exportKetQuaKyHoc, exportKetQuaNamHoc } from '../../Api_controller/Service/diemService';
import React from 'react';

// Đăng ký Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ThongKeDiem = () => {
  const [heDaoTao, setHeDaoTao] = useState([]);
  const [khoa, setKhoa] = useState([]);
  const [lop, setLop] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [numberOfSemesters, setNumberOfSemesters] = useState(null);
  const [filterHeDaoTao, setFilterHeDaoTao] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  const [filterLop, setFilterLop] = useState(null);
  const [filterKyHoc, setFilterKyHoc] = useState('');
  const [filterType, setFilterType] = useState('lop');
  const [thongKeTongQuan, setThongKeTongQuan] = useState([]);
  const [chiTietMonHoc, setChiTietMonHoc] = useState([]);
  const [monHocList, setMonHocList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSemester, setLoadingSemester] = useState(false);
  
  // States cho export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState(''); // 'kyHoc' hoặc 'namHoc'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [exportKyHoc, setExportKyHoc] = useState('');
  const [exportNamHoc, setExportNamHoc] = useState('');

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

  // Lấy số kỳ học dựa trên khóa đào tạo
  useEffect(() => {
    if (!filterKhoa) {
      setNumberOfSemesters(null);
      setSemesterOptions([]);
      setFilterKyHoc('');
      return;
    }
    const selectedKhoa = khoa.find((k) => k.id === filterKhoa);
    if (selectedKhoa) {
      setNumberOfSemesters(selectedKhoa.so_ky_hoc || 0);
    } else {
      setNumberOfSemesters(null);
      setSemesterOptions([]);
      setFilterKyHoc('');
    }
  }, [filterKhoa, khoa]);

  // Tạo danh sách kỳ học dựa trên số kỳ
  useEffect(() => {
    if (!filterKhoa || !numberOfSemesters) {
      setSemesterOptions([]);
      setFilterKyHoc('');
      return;
    }
    const fetchSemesters = async () => {
      setLoadingSemester(true);
      setFilterKyHoc('');
      try {
        const semesters = [
          { id: 'all', name: 'Tất cả' },
          ...Array.from({ length: numberOfSemesters }, (_, i) => ({
            id: (i + 1).toString(),
            name: `Kỳ ${i + 1}`
          }))
        ];
        setSemesterOptions(semesters);
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.error('Không thể tải danh sách học kỳ.');
        setSemesterOptions([]);
      } finally {
        setLoadingSemester(false);
      }
    };
    fetchSemesters();
  }, [filterKhoa, numberOfSemesters]);

  const handleFilterChange = async () => {
    if (filterType === 'lop' && !filterLop) {
      toast.error('Vui lòng chọn lớp!');
      return;
    }
    if (!filterKhoa) {
      toast.error('Vui lòng chọn khóa!');
      return;
    }
    setLoading(true);
    try {
      const lopId = filterType === 'lop' ? filterLop?.id : null;
      const thongKeData = await fetchThongKeDiem(filterHeDaoTao, filterKhoa, lopId, filterKyHoc);
      setThongKeTongQuan(thongKeData.thongKeTongQuan || []);
      setChiTietMonHoc(thongKeData.chiTietMonHoc || []);
      setMonHocList(thongKeData.monHocList || []);
    } catch (error) {
      toast.error('Không thể tải dữ liệu thống kê!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFilterType('lop');
    setFilterHeDaoTao('');
    setFilterKhoa('');
    setFilterLop(null);
    setFilterKyHoc('');
    setThongKeTongQuan([]);
    setChiTietMonHoc([]);
    setMonHocList([]);
    setSemesterOptions([]);
    setNumberOfSemesters(null);
  };

  const exportToExcel = () => {
    const worksheetData = chiTietMonHoc.map(item => {
      const row = {
        'Mã SV': item.ma_sinh_vien,
        'Họ tên': item.ho_ten,
        'Kỳ học': item.ky_hoc
      };
      monHocList.forEach(mon => {
        const diem = item.mon_hoc[mon] || {};
        row[`${mon}_TP1`] = diem.tp1 ?? '-';
        row[`${mon}_TP2`] = diem.tp2 ?? '-';
        row[`${mon}_Điểm thi KTPH`] = diem.diem_thi_ktph ?? '-';
        row[`${mon}_Điểm HP`] = diem.diem_hp ?? '-';
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
              [`ĐTB Kỳ ${ky}`]: sv.diem_tb_ky[ky]
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
    XLSX.writeFile(workbook, 'Thong_ke_diem.xlsx');
  };

  // Hàm mở dialog export cho sinh viên cụ thể
  const handleOpenExportDialog = (student, type) => {
    setSelectedStudent(student);
    setExportType(type);
    setExportDialogOpen(true);
    setExportKyHoc('');
    setExportNamHoc('');
  };

  // Hàm đóng dialog export
  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
    setSelectedStudent(null);
    setExportType('');
    setExportKyHoc('');
    setExportNamHoc('');
  };

  // Hàm xử lý export kết quả kỳ học
  const handleExportKyHoc = async () => {
    if (!selectedStudent || !exportKyHoc) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      // Sử dụng ID sinh viên (số) thay vì mã sinh viên
      const response = await exportKetQuaKyHoc(selectedStudent.id, exportKyHoc);
      
      // Tạo URL blob và download file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KetQua_KyHoc_${selectedStudent.ma_sinh_vien}_Ky${exportKyHoc}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export kết quả kỳ học thành công!');
      handleCloseExportDialog();
    } catch (error) {
      toast.error('Không thể export kết quả kỳ học!');
    }
  };

  // Hàm xử lý export kết quả năm học
  const handleExportNamHoc = async () => {
    if (!selectedStudent || !exportNamHoc) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      // Sử dụng ID sinh viên (số) thay vì mã sinh viên
      const response = await exportKetQuaNamHoc(selectedStudent.id, exportNamHoc);
      
      // Tạo URL blob và download file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KetQua_NamHoc_${selectedStudent.ma_sinh_vien}_${exportNamHoc}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export kết quả năm học thành công!');
      handleCloseExportDialog();
    } catch (error) {
      toast.error('Không thể export kết quả năm học!');
    }
  };

  const chartData = {
    labels: thongKeTongQuan.map(sv => sv.ho_ten),
    datasets: filterKyHoc === 'all'
      ? semesterOptions.filter(ky => ky.id !== 'all').map((ky, index) => ({
          label: ky.name,
          data: thongKeTongQuan.map(sv => sv.diem_tb_ky[ky.id] || 0),
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
    const kyHocList = isAllKy ? semesterOptions.filter(ky => ky.id !== 'all').map(ky => ky.id) : [];
    return (
      <TableContainer component={Paper} sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã SV</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Giới tính</TableCell>
              {isAllKy ? kyHocList.map(ky => (
                <TableCell key={ky} sx={{ fontWeight: 'bold' }}>ĐTB Kỳ {ky}</TableCell>
              )) : <TableCell sx={{ fontWeight: 'bold' }}>ĐTB Kỳ</TableCell>}
              <TableCell sx={{ fontWeight: 'bold' }}>ĐTB tích lũy (hệ 10)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ĐTB tích lũy (hệ 4)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
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
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GetAppIcon />}
                      onClick={() => handleOpenExportDialog(sv, 'kyHoc')}
                      sx={{ fontSize: '0.75rem', p: 0.5 }}
                    >
                      Kỳ học
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GetAppIcon />}
                      onClick={() => handleOpenExportDialog(sv, 'namHoc')}
                      sx={{ fontSize: '0.75rem', p: 0.5 }}
                    >
                      Năm học
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChiTietTable = () => {
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
                      <TableCell>{diem.tp1 ?? '-'}</TableCell>
                      <TableCell>{diem.tp2 ?? '-'}</TableCell>
                      <TableCell>{diem.diem_thi_ktph ?? '-'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{diem.diem_hp ?? '-'}</TableCell>
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
              <FormControl fullWidth>
                <InputLabel>Loại lọc</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setFilterLop(null);
                    setFilterKyHoc('');
                  }}
                  label="Loại lọc"
                >
                  <MenuItem value="lop">Theo lớp</MenuItem>
                  <MenuItem value="khoa">Theo khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {filterType === 'lop' && (
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
            )}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Kỳ học</InputLabel>
                <Select
                  value={filterKyHoc}
                  onChange={(e) => setFilterKyHoc(e.target.value)}
                  label="Kỳ học"
                  disabled={!filterKhoa || loadingSemester}
                >
                  {semesterOptions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleFilterChange}
                disabled={loading || !filterKhoa || (filterType === 'lop' && !filterLop) || loadingSemester}
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

      {/* Dialog Export */}
      <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Export kết quả {exportType === 'kyHoc' ? 'kỳ học' : 'năm học'} - {selectedStudent?.ho_ten}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {exportType === 'kyHoc' ? (
              <TextField
                fullWidth
                label="Số kỳ học"
                type="number"
                value={exportKyHoc}
                onChange={(e) => setExportKyHoc(e.target.value)}
                placeholder="Nhập số kỳ học (ví dụ: 1, 2, 3...)"
                inputProps={{ min: 1, max: numberOfSemesters || 8 }}
              />
            ) : (
              <TextField
                fullWidth
                label="Năm học"
                value={exportNamHoc}
                onChange={(e) => setExportNamHoc(e.target.value)}
                placeholder="Nhập năm học (ví dụ: 2021-2022)"
                helperText="Định dạng: YYYY-YYYY"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExportDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={exportType === 'kyHoc' ? handleExportKyHoc : handleExportNamHoc}
            disabled={exportType === 'kyHoc' ? !exportKyHoc : !exportNamHoc}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ThongKeDiem;