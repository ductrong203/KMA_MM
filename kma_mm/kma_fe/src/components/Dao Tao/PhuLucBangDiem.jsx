import { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { getDanhSachLopTheoKhoaDaoTao } from '../../Api_controller/Service/lopService';
import { getDanhSachSinhVienTheoLop } from '../../Api_controller/Service/sinhVienService';
import { exportPhuLucBangDiem } from '../../Api_controller/Service/excelService';


const PhuLucBangDiem = () => {
  const [selectedHeDaoTao, setSelectedHeDaoTao] = useState('');
  const [selectedKhoa, setSelectedKhoa] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // State cho danh sách dữ liệu
  const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [danhSachLop, setDanhSachLop] = useState([]);
  
  // Loading state cho từng dropdown
  const [loadingHeDaoTao, setLoadingHeDaoTao] = useState(false);
  const [loadingKhoa, setLoadingKhoa] = useState(false);
  const [loadingLop, setLoadingLop] = useState(false);

  // Lấy danh sách hệ đào tạo khi component được mount
  useEffect(() => {
    const fetchHeDaoTao = async () => {
      setLoadingHeDaoTao(true);
      try {
        const data = await fetchDanhSachHeDaoTao();
        setDanhSachHeDaoTao(data);
      } catch (error) {
        console.error('Error fetching hệ đào tạo:', error);
        alert('Không thể lấy danh sách hệ đào tạo. Vui lòng thử lại sau.');
      } finally {
        setLoadingHeDaoTao(false);
      }
    };

    fetchHeDaoTao();
  }, []);

  // Lấy danh sách khóa khi hệ đào tạo thay đổi
  useEffect(() => {
    const fetchKhoa = async () => {
      if (!selectedHeDaoTao) {
        setDanhSachKhoa([]);
        return;
      }
      
      setLoadingKhoa(true);
      try {
        const data = await getDanhSachKhoaTheoDanhMucDaoTao(selectedHeDaoTao);
        setDanhSachKhoa(data);
      } catch (error) {
        console.error('Error fetching khóa:', error);
        alert('Không thể lấy danh sách khóa. Vui lòng thử lại sau.');
      } finally {
        setLoadingKhoa(false);
      }
    };

    fetchKhoa();
  }, [selectedHeDaoTao]);

  // Lấy danh sách lớp khi khóa thay đổi
  useEffect(() => {
    const fetchLop = async () => {
      if (!selectedKhoa) {
        setDanhSachLop([]);
        return;
      }
      
      setLoadingLop(true);
      try {
        const data = await getDanhSachLopTheoKhoaDaoTao(selectedKhoa);
        setDanhSachLop(data);
      } catch (error) {
        console.error('Error fetching lớp:', error);
        alert('Không thể lấy danh sách lớp. Vui lòng thử lại sau.');
      } finally {
        setLoadingLop(false);
      }
    };

    fetchLop();
  }, [selectedKhoa]);

  // Lấy danh sách sinh viên khi lớp thay đổi
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await getDanhSachSinhVienTheoLop(selectedClass);
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        alert('Không thể lấy danh sách sinh viên. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleHeDaoTaoChange = (event) => {
    const heDaoTao = event.target.value;
    setSelectedHeDaoTao(heDaoTao);
    setSelectedKhoa('');
    setSelectedClass('');
    setStudents([]);
  };

  const handleKhoaChange = (event) => {
    const khoa = event.target.value;
    setSelectedKhoa(khoa);
    setSelectedClass('');
    setStudents([]);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

 const handleExportReport = async (studentId) => {
  if (!studentId) {
    alert('Không tìm thấy mã sinh viên.');
    return;
  }

  setExportLoading(true);

  try {
    
    const response = await exportPhuLucBangDiem(studentId);

    if (!response || !response.data) {
      throw new Error('Không có dữ liệu trả về từ server.');
    }

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `phu-luc-bang-diem-${studentId}.xlsx`;

    document.body.appendChild(link);
    link.click();

    // Giải phóng tài nguyên
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Không thể xuất báo cáo. Vui lòng thử lại sau.');
  } finally {
    setExportLoading(false);
  }
};


  return (
    <Grid item xs={12} md={12}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" marginBottom={2}>
          Phụ lục văn bằng
        </Typography>
        
         <Stack direction="row" spacing={2} mb={3}>
          <FormControl sx={{ width: '33%' }}>
            <InputLabel>Hệ đào tạo</InputLabel>
            <Select
              value={selectedHeDaoTao}
              label="Hệ đào tạo"
              onChange={handleHeDaoTaoChange}
              disabled={loadingHeDaoTao}
            >
              {danhSachHeDaoTao.map(heDaoTao => (
                <MenuItem key={heDaoTao.id} value={heDaoTao.id}>
                  {heDaoTao.ten_he_dao_tao}
                </MenuItem>
              ))}
            </Select>
            {loadingHeDaoTao && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </FormControl>
          
          <FormControl sx={{ width: '33%' }} disabled={!selectedHeDaoTao || loadingKhoa}>
            <InputLabel>Khóa</InputLabel>
            <Select
              value={selectedKhoa}
              label="Khóa"
              onChange={handleKhoaChange}
            >
              {danhSachKhoa.map(khoa => (
                <MenuItem key={khoa.id} value={khoa.id}>
                  {khoa.ma_khoa}
                </MenuItem>
              ))}
            </Select>
            {loadingKhoa && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </FormControl>
          
          <FormControl sx={{ width: '33%' }} disabled={!selectedKhoa || loadingLop}>
            <InputLabel>Lớp</InputLabel>
            <Select
              value={selectedClass}
              label="Lớp"
              onChange={handleClassChange}
            >
              {danhSachLop.map(lop => (
                <MenuItem key={lop.id} value={lop.id}>
                  {lop.ma_lop}
                </MenuItem>
              ))}
            </Select>
            {loadingLop && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </FormControl>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : students.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 3, mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã sinh viên</TableCell>
                  <TableCell>Họ đệm</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>Giới tính</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.ma_sinh_vien}</TableCell>
                    <TableCell>{student.ho_dem}</TableCell>
                    <TableCell>{student.ten}</TableCell>
                    <TableCell>{new Date(student.ngay_sinh).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{student.gioi_tinh == 1 ? 'Nam' : 'Nữ'}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          p: 0.5, 
                          borderRadius: 1, 
                          display: 'inline-block',
                          bgcolor: student.dang_hoc === 1 ? 'success.light' : 'warning.light',
                          color: 'white'
                        }}
                      >
                        {student.dang_hoc === 1 ? 'Đang học' : 'Thôi học'}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => handleExportReport(student.id)}
                        disabled={exportLoading}
                      >
                        Xuất báo cáo
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : selectedClass ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Không có sinh viên nào trong lớp này.
            </Typography>
          </Box>
        ) : null}

      </Paper>
    </Grid>
  );
};

export default PhuLucBangDiem;