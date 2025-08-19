import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, 
  Button, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Box, Autocomplete, TextField, Skeleton, Chip,
  TablePagination, Card, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import {
  fetchDanhSachHeDaoTao,
  getDanhSachKhoaDaoTao
} from '../../Api_controller/Service/trainingService';
import { getDanhSachLop } from '../../Api_controller/Service/lopService';
import { 
  fetchThongKeDiem
} from '../../Api_controller/Service/diemService';
import api from '../../Api_controller/Api_setup/axiosConfig';

const ThongKeDiemTheoSinhVien = () => {
  // States cho bộ lọc
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
  
  // States cho dữ liệu
  const [thongKeTongQuan, setThongKeTongQuan] = useState([]);
  const [chiTietMonHoc, setChiTietMonHoc] = useState([]);
  const [monHocList, setMonHocList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSemester, setLoadingSemester] = useState(false);
  
  // States cho pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // States cho dialog chi tiết sinh viên
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [studentDetailGrades, setStudentDetailGrades] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load dữ liệu ban đầu
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

  // Load danh sách lớp khi chọn khóa
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

  // Xử lý thay đổi bộ lọc
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

  // API call để lấy chi tiết điểm của sinh viên (bao gồm các lần học lại)
  const layChiTietDiemSinhVien = async (sinhVienId) => {
    try {
      const response = await api.get(`/diem/filter?sinh_vien_id=${sinhVienId}`);
      return response.data;
    } catch (error) {
      console.error('Error in layChiTietDiemSinhVien:', error);
      throw error;
    }
  };

  // Xem chi tiết điểm của sinh viên
  const handleViewStudentDetail = async (student) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
    setLoadingDetail(true);
    
    try {
      // Lấy chi tiết từ dữ liệu có sẵn (từ fetchThongKeDiem)
      const studentChiTiet = chiTietMonHoc.find(item => 
        item.ma_sinh_vien === student.ma_sinh_vien
      );
      
      // Lấy thêm chi tiết điểm từ API (bao gồm các lần học lại)
      const detailResult = await layChiTietDiemSinhVien(student.id);
      
      // Kết hợp và xử lý dữ liệu
      const processedData = combineGradeData(studentChiTiet, detailResult.data || [], monHocList);
      setStudentDetailGrades(processedData);
    } catch (error) {
      toast.error('Không thể tải chi tiết điểm!');
      setStudentDetailGrades([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Kết hợp dữ liệu từ fetchThongKeDiem và diem/filter
  const combineGradeData = (studentChiTiet, detailGrades, monHocList) => {
    const result = [];
    
    // Tạo map từ detailGrades để dễ lookup
    const detailMap = {};
    detailGrades.forEach(detail => {
      const key = `${detail.thoi_khoa_bieu?.mon_hoc_id}-${detail.lan_hoc || 1}`;
      detailMap[key] = detail;
    });
    
    // Xử lý dữ liệu từ fetchThongKeDiem trước
    if (studentChiTiet && studentChiTiet.mon_hoc) {
      monHocList.forEach(monHoc => {
        const diemMonHoc = studentChiTiet.mon_hoc[monHoc];
        if (diemMonHoc) {
          // Tìm detail tương ứng từ diem/filter
          const matchingDetail = detailGrades.find(detail => {
            const tenMonHoc = detail.thoi_khoa_bieu?.mon_hoc?.ten_mon_hoc;
            const maMonHoc = detail.thoi_khoa_bieu?.mon_hoc?.ma_mon_hoc;
            return tenMonHoc === monHoc || maMonHoc === monHoc;
          });
          
          result.push({
            ma_mon_hoc: matchingDetail?.thoi_khoa_bieu?.mon_hoc?.ma_mon_hoc || monHoc,
            ten_mon_hoc: monHoc, // Sử dụng tên từ monHocList
            so_tin_chi: matchingDetail?.thoi_khoa_bieu?.mon_hoc?.so_tin_chi || 0,
            ky_hoc: studentChiTiet.ky_hoc || matchingDetail?.thoi_khoa_bieu?.ky_hoc || 'N/A',
            dot_hoc: matchingDetail?.thoi_khoa_bieu?.dot_hoc || 'N/A',
            lan_hoc: 1,
            lan_thi: matchingDetail?.lan_thi || 1,
            diem_tp1: diemMonHoc.tp1,
            diem_tp2: diemMonHoc.tp2,
            diem_gk: diemMonHoc.diem_thi_ktph,
            diem_ck: matchingDetail?.diem_ck,
            diem_ck2: matchingDetail?.diem_ck2,
            diem_he_4: matchingDetail?.diem_he_4,
            diem_chu: matchingDetail?.diem_chu,
            diem_hp: diemMonHoc.diem_hp,
            trang_thai: diemMonHoc.diem_hp >= 4.0 ? 'Hoàn thành' : 'Chưa đạt',
            ngay_cap_nhat: matchingDetail?.ngay_cap_nhat,
            ghi_chu: matchingDetail?.ghi_chu
          });
        }
      });
    }
    
    // Thêm các lần học lại từ API diem/filter (lan_hoc > 1)
    detailGrades.forEach(detail => {
      if (detail.lan_hoc && detail.lan_hoc > 1) {
        const tenMonHoc = detail.thoi_khoa_bieu?.mon_hoc?.ten_mon_hoc;
        const maMonHoc = detail.thoi_khoa_bieu?.mon_hoc?.ma_mon_hoc;
        
        // Ưu tiên tên môn học từ monHocList nếu có
        const finalTenMonHoc = monHocList.find(mon => 
          mon === tenMonHoc || mon === maMonHoc
        ) || tenMonHoc || maMonHoc || 'N/A';
        
        result.push({
          ma_mon_hoc: maMonHoc || 'N/A',
          ten_mon_hoc: finalTenMonHoc,
          so_tin_chi: detail.thoi_khoa_bieu?.mon_hoc?.so_tin_chi || 0,
          ky_hoc: detail.thoi_khoa_bieu?.ky_hoc || 'N/A',
          dot_hoc: detail.thoi_khoa_bieu?.dot_hoc || 'N/A',
          lan_hoc: detail.lan_hoc,
          lan_thi: detail.lan_thi || 1,
          diem_tp1: detail.diem_tp1,
          diem_tp2: detail.diem_tp2,
          diem_gk: detail.diem_gk,
          diem_ck: detail.diem_ck,
          diem_ck2: detail.diem_ck2,
          diem_he_4: detail.diem_he_4,
          diem_chu: detail.diem_chu,
          diem_hp: detail.diem_hp,
          trang_thai: detail.trang_thai || (detail.diem_hp >= 4.0 ? 'Hoàn thành' : 'Chưa đạt'),
          ngay_cap_nhat: detail.ngay_cap_nhat,
          ghi_chu: detail.ghi_chu
        });
      }
    });
    
    return result.sort((a, b) => {
      // Sắp xếp theo tên môn học, sau đó theo lần học
      if (a.ten_mon_hoc !== b.ten_mon_hoc) {
        return a.ten_mon_hoc.localeCompare(b.ten_mon_hoc);
      }
      return a.lan_hoc - b.lan_hoc;
    });
  };

  // Reset bộ lọc
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
    setPage(0);
  };

  // Export Excel cho sinh viên cụ thể
  const exportStudentGrades = () => {
    if (studentDetailGrades.length === 0) {
      toast.error('Không có dữ liệu để export!');
      return;
    }

    const worksheetData = studentDetailGrades.map((item, index) => ({
      'STT': index + 1,
      'Mã môn học': item.ma_mon_hoc,
      'Tên môn học': item.ten_mon_hoc,
      'Số tín chỉ': item.so_tin_chi,
      'Kỳ học': item.ky_hoc,
      'Đợt học': item.dot_hoc,
      'Lần học': item.lan_hoc,
      'Lần thi': item.lan_thi || '-',
      'Điểm TP1': item.diem_tp1 ?? '-',
      'Điểm TP2': item.diem_tp2 ?? '-',
      'Điểm GK': item.diem_gk ?? '-',
      'Điểm CK': item.diem_ck ?? '-',
      'Điểm CK lần 2': item.diem_ck2 ?? '-',
      'Điểm hệ 4': item.diem_he_4 ?? '-',
      'Điểm chữ': item.diem_chu || '-',
      'Điểm HP': item.diem_hp ?? '-',
      'Trạng thái': item.trang_thai || '-',
      'Ngày cập nhật': item.ngay_cap_nhat ? new Date(item.ngay_cap_nhat).toLocaleDateString('vi-VN') : '-',
      'Ghi chú': item.ghi_chu || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng điểm sinh viên');
    
    const fileName = `BangDiem_${selectedStudent?.ma_sinh_vien || 'SinhVien'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Xử lý phân trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render bảng danh sách sinh viên
  const renderStudentTable = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = thongKeTongQuan.slice(startIndex, endIndex);

    const isAllKy = filterKyHoc === 'all';
    const kyHocList = isAllKy ? semesterOptions.filter(ky => ky.id !== 'all').map(ky => ky.id) : [];

    return (
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">
            Danh sách sinh viên ({thongKeTongQuan.length})
          </Typography>
        </Box>
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
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
              {paginatedData.map((sv, index) => (
                <TableRow 
                  key={sv.ma_sinh_vien} 
                  sx={{ backgroundColor: index % 2 ? '#fafafa' : 'white' }}
                >
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>{sv.ma_sinh_vien}</TableCell>
                  <TableCell>{sv.ho_ten}</TableCell>
                  <TableCell>{sv.gioi_tinh}</TableCell>
                  {isAllKy ? kyHocList.map(ky => (
                    <TableCell key={ky}>{sv.diem_tb_ky[ky]?.toFixed(2) || '-'}</TableCell>
                  )) : <TableCell>{sv.diem_tb_ky[filterKyHoc]?.toFixed(2) || '-'}</TableCell>}
                  <TableCell>{sv.diem_tb_tich_luy_he10?.toFixed(2) || '-'}</TableCell>
                  <TableCell>{sv.diem_tb_tich_luy_he4?.toFixed(2) || '-'}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewStudentDetail(sv)}
                      sx={{ fontSize: '0.75rem', p: 0.5 }}
                    >
                      Xem chi tiết điểm
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={thongKeTongQuan.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>
    );
  };

  // Render dialog chi tiết điểm sinh viên
  const renderGradeDetailDialog = () => {
    return (
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <PersonIcon />
            <Box>
              <Typography variant="h6">
                Chi tiết bảng điểm - {selectedStudent?.ho_ten}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Mã SV: {selectedStudent?.ma_sinh_vien} | ĐTB tích lũy: {selectedStudent?.diem_tb_tich_luy_he10?.toFixed(2)} (hệ 10) - {selectedStudent?.diem_tb_tich_luy_he4?.toFixed(2)} (hệ 4)
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Box sx={{ my: 4 }}>
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mã môn</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên môn học</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>TC</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kỳ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đợt</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lần học</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lần thi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ĐTP1</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ĐTP2</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đ.GK</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đ.CK</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đ.CK2</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đ.Hệ 4</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đ.Chữ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Đ.HP</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày cập nhật</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentDetailGrades.map((item, index) => {
                    const isRetake = item.lan_hoc > 1;
                    return (
                      <TableRow 
                        key={`${item.ma_mon_hoc}-${item.lan_hoc}-${index}`}
                        sx={{ 
                          backgroundColor: isRetake ? '#fff3e0' : (index % 2 ? '#fafafa' : 'white'),
                          borderLeft: isRetake ? '4px solid #ff9800' : 'none'
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.ma_mon_hoc}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {item.ten_mon_hoc}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.so_tin_chi}</TableCell>
                        <TableCell>{item.ky_hoc}</TableCell>
                        <TableCell>{item.dot_hoc}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`Lần ${item.lan_hoc}`}
                            size="small"
                            color={isRetake ? "warning" : "default"}
                            variant={isRetake ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell>{item.lan_thi || 1}</TableCell>
                        <TableCell>{item.diem_tp1 ?? '-'}</TableCell>
                        <TableCell>{item.diem_tp2 ?? '-'}</TableCell>
                        <TableCell>{item.diem_gk ?? '-'}</TableCell>
                        <TableCell>{item.diem_ck ?? '-'}</TableCell>
                        <TableCell>{item.diem_ck2 ?? '-'}</TableCell>
                        <TableCell>{item.diem_he_4 ?? '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.diem_chu || 'N/A'}
                            size="small"
                            color={item.diem_chu && ['A', 'B', 'C', 'D'].includes(item.diem_chu) ? "success" : "error"}
                          />
                        </TableCell>
                        <TableCell>{item.diem_hp ?? '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.trang_thai || 'N/A'}
                            size="small"
                            color={item.trang_thai === 'Hoàn thành' ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          {item.ngay_cap_nhat ? 
                            new Date(item.ngay_cap_nhat).toLocaleDateString('vi-VN') : 
                            '-'
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!loadingDetail && studentDetailGrades.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              Không có dữ liệu điểm cho sinh viên này
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportStudentGrades}
            disabled={studentDetailGrades.length === 0}
          >
            Xuất Excel
          </Button>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
      {/* Bộ lọc - giữ nguyên như cũ */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" gutterBottom>
            Bộ lọc thống kê điểm theo sinh viên
          </Typography>
          
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

      {/* Danh sách sinh viên */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <Box sx={{ my: 4 }}>
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={50} />
            </Box>
          ) : thongKeTongQuan.length > 0 ? (
            renderStudentTable()
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              Chưa có dữ liệu. Vui lòng chọn bộ lọc và nhấn "Xem thống kê"
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Dialog chi tiết điểm */}
      {renderGradeDetailDialog()}
    </Grid>
  );
};

export default ThongKeDiemTheoSinhVien;
