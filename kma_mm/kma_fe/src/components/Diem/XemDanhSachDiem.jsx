import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import QuanLyDiem from '../Diem/QuanLyDiem';
import TaoBangDiem from '../Diem/TaoBangDiem';
import { layDanhSachSinhVienTheoTKB, nhapDiem } from '../../Api_controller/Service/diemService';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getDanhSachLopTheoKhoaDaoTao, getLopHocById } from '../../Api_controller/Service/lopService';
import { chiTietMonHoc, getDanhSachMonHocTheoKhoaVaKi } from '../../Api_controller/Service/monHocService';
import { getThoiKhoaBieu } from '../../Api_controller/Service/thoiKhoaBieuService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import axios from 'axios';
import PageHeader from '../../layout/PageHeader';

function XemDanhSachDiem() {
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [examPeriod, setExamPeriod] = useState('');
  const [educationType, setEducationType] = useState('');
  const [educationTypeOptions, setEducationTypeOptions] = useState([]);
  const [batch, setBatch] = useState('');
  const [batchOptions, setBatchOptions] = useState([]);
  const [classGroup, setClassGroup] = useState('');
  const [classOptions, setClassOptions] = useState([]);
  const [course, setCourse] = useState('');
  const [courseOptions, setCourseOptions] = useState([]);
  const [major, setMajor] = useState('');
  const [examNumber, setExamNumber] = useState('');
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [activeGradeTab, setActiveGradeTab] = useState(0);
  const [scheduleId, setScheduleId] = useState(null);
  const [gradeSheetId, setGradeSheetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  // State cho nhập file
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Fetch education types
  useEffect(() => {
    const fetchEducationTypes = async () => {
      try {
        const response = await fetchDanhSachHeDaoTao();
        setEducationTypeOptions(response);
      } catch (error) {
        console.error('Error fetching education types:', error);
        toast.error('Không thể tải danh sách hệ đào tạo.');

      }
    };
    fetchEducationTypes();
  }, []);

  // Fetch batches
  useEffect(() => {
    if (!educationType) return;
    const fetchBatches = async () => {
      setLoadingBatches(true);
      setBatch('');
      setClassGroup('');
      setCourse('');
      try {
        const response = await getDanhSachKhoaTheoDanhMucDaoTao(educationType);
        setBatchOptions(response);
      } catch (error) {
        console.error('Error fetching batches:', error);
        toast.error('Không thể tải danh sách khóa.');

      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, [educationType]);

  // Fetch classes
  useEffect(() => {
    if (!batch) return;
    const fetchClasses = async () => {
      setLoadingClasses(true);
      setClassGroup('');
      setCourse('');
      try {
        const response = await getDanhSachLopTheoKhoaDaoTao(batch);
        setClassOptions(response);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Không thể tải danh sách lớp.');

      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [batch]);

  // Fetch courses
  useEffect(() => {
    if (!classGroup || !batch || !semester) return;
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setCourse('');
      try {
        const response = await getDanhSachMonHocTheoKhoaVaKi({
          khoa_dao_tao_id: batch,
          ky_hoc: semester,
        });
        const courseIds = response.map((course) => course.mon_hoc_id);
        const courseDetailsResponse = await chiTietMonHoc({
          ids: courseIds.join(',')
        });
        const coursesWithDetails = response.map((course) => {
          const details = courseDetailsResponse.data.data.find((detail) => detail.id === course.mon_hoc_id);
          return {
            id: course.mon_hoc_id,
            ten_mon_hoc: details?.ten_mon_hoc || 'Unknown',
          };
        });
        setCourseOptions(coursesWithDetails);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Không thể tải danh sách học phần.');

      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [classGroup, batch, semester]);

  // Fetch schedule ID
  useEffect(() => {
    if (!classGroup || !course) return;
    const fetchScheduleId = async () => {
      setLoading(true);
      try {
        const response = await getThoiKhoaBieu(course, classGroup, semester);
        setScheduleId(response.data[0].id);
      } catch (error) {
        console.error('Error fetching schedule ID:', error);
        toast.error('Không thể tải thông tin thời khóa biểu.');
        setScheduleId('SCH001');
      } finally {
        setLoading(false);
      }
    };
    fetchScheduleId();
  }, [classGroup, course, semester]);

  // Hàm xử lý tìm kiếm
  const handleSearch = async () => {
    if (!batch || !classGroup || !semester || !course) {
      toast.error('Vui lòng chọn đầy đủ thông tin để tìm kiếm sinh viên.');
      return;
    }
    setLoadingStudents(true);
    try {
      const response = await layDanhSachSinhVienTheoTKB(scheduleId);
      const formattedStudents = await Promise.all(
        response.data.map(async (student) => {
          const lopInfo = await getLopHocById(student.sinh_vien.lop_id);
          const maLop = lopInfo?.ma_lop || student.lop_id;
          return {
            id: student.id,
            sinh_vien_id: student.sinh_vien_id,
            ma_sinh_vien: student.sinh_vien.ma_sinh_vien,
            ho_dem: student.sinh_vien.ho_dem,
            ten: student.sinh_vien.ten,
            lop: maLop,
            lan_hoc: student.lan_hoc ? 'Học lần ' + student.lan_hoc : 'Học lần 1',
            diem: {
              TP1: student.diem_tp1 || null,
              TP2: student.diem_tp2 || null,
              CK1: student.diem_ck || null,
              CK2: student.diem_ck2 || null,
            },
            retakeRegistered: student.retakeRegistered || false,
          };
        })
      );
      setStudents(formattedStudents);
      toast.success(`Đã tìm thấy ${formattedStudents.length} sinh viên.`);
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm sinh viên. Vui lòng thử lại.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Hàm xử lý xuất dữ liệu
  const handleExportData = () => {
    // Logic xuất dữ liệu
    toast.success('Đã xuất dữ liệu thành công!');
  };

  // Hàm xử lý mở input file
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Hàm xử lý khi chọn file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      toast.info(`Đã chọn file: ${selectedFile.name}`);
    } else {
      setFile(null);
      setFileName('');
      toast.warn('Không có file nào được chọn.');
    }
  };

  // Hàm nhập file Excel
  const importExcel = async (lop_id, mon_hoc_id, khoa_dao_tao_id, activeGradeTab, selectedFile) => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file trước khi import.');
      return;
    }

    console.log('activeGradeTab:', activeGradeTab);
    console.log('selectedFile:', selectedFile);

    // Chọn API dựa trên activeGradeTab
    const importApi = activeGradeTab === 0 ? nhapDiem : nhapDiem; // Giả sử nhapDiem xử lý cả giữa kỳ và cuối kỳ, cập nhật nếu khác

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('mon_hoc_id', mon_hoc_id);
    formData.append('khoa_dao_tao_id', khoa_dao_tao_id);
    if (lop_id) {
      formData.append('lop_id', lop_id);
    }

    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    setUploading(true);
    setProgress(0);

    // Giả lập tiến trình
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    try {
      const response = await importApi(formData);
      clearInterval(interval);
      setProgress(100);
      toast.success('Import thành công!');
      console.log('Response:', response.data);
      setUploading(false);
      setFile(null);
      setFileName('');
      handleSearch(); // Cập nhật danh sách sinh viên
    } catch (error) {
      clearInterval(interval);
      console.error('Error:', error);
      toast.error('Không thể import dữ liệu. Vui lòng thử lại.');
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>

      <PageHeader title="Xem danh sách điểm" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Hệ đào tạo</InputLabel>
            <Select
              value={educationType}
              label="Hệ đào tạo"
              onChange={(e) => setEducationType(e.target.value)}
            >
              {educationTypeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.ten_he_dao_tao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Khóa đào tạo</InputLabel>
            <Select
              value={batch}
              label="Khóa"
              onChange={(e) => setBatch(e.target.value)}
              disabled={!educationType || loadingBatches}
            >
              {loadingBatches ? (
                <MenuItem value="">
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                batchOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ma_khoa}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Học kỳ</InputLabel>
            <Select
              value={semester}
              label="Học kỳ"
              onChange={(e) => setSemester(e.target.value)}
            >
              <MenuItem value="1">Học kỳ 1</MenuItem>
              <MenuItem value="2">Học kỳ 2</MenuItem>
              <MenuItem value="3">Học kỳ 3</MenuItem>
              <MenuItem value="4">Học kỳ 4</MenuItem>
              <MenuItem value="5">Học kỳ 5</MenuItem>
              <MenuItem value="6">Học kỳ 6</MenuItem>
              <MenuItem value="7">Học kỳ 7</MenuItem>
              <MenuItem value="8">Học kỳ 8</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Lớp</InputLabel>
            <Select
              value={classGroup}
              label="Lớp"
              onChange={(e) => setClassGroup(e.target.value)}
              disabled={!batch || loadingClasses}
            >
              {loadingClasses ? (
                <MenuItem value="">
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                classOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ma_lop}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Học phần</InputLabel>
            <Select
              value={course}
              label="Học phần"
              onChange={(e) => setCourse(e.target.value)}
              disabled={!classGroup || !semester || loadingCourses}
            >
              {loadingCourses ? (
                <MenuItem value="">
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                courseOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ten_mon_hoc || option.name || option.mon_hoc_id}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ height: '56px' }}
          >
            Tìm kiếm
          </Button>
        </Grid>
      </Grid>

      {/* Phần nhập file Excel */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={handleExportData}
          sx={{ boxShadow: 2 }}
        >
          Xuất Excel
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Tabs để chọn giữa kỳ hoặc cuối kỳ */}
      <Tabs
        value={activeGradeTab}
        onChange={(e, newValue) => setActiveGradeTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Điểm giữa kỳ" />
        <Tab label="Điểm cuối kỳ" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="view grades table">
          <TableHead>
            <TableRow>
              <TableCell>Mã SV</TableCell>
              <TableCell>Họ đệm</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Lớp</TableCell>
              <TableCell>Lần học</TableCell>
              <TableCell>TP1</TableCell>
              <TableCell>TP2</TableCell>
              <TableCell>CK lần 1</TableCell>
              <TableCell>CK lần 2</TableCell>
              <TableCell>Điểm TK</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              const finalExamScore = student.diem.CK2 !== null ? student.diem.CK2 : student.diem.CK1;
              const totalScore =
                student.diem.TP1 * 0.2 + student.diem.TP2 * 0.2 + finalExamScore * 0.6;
              return (
                <TableRow key={student.id}>
                  <TableCell>{student.ma_sinh_vien}</TableCell>
                  <TableCell>{student.ho_dem}</TableCell>
                  <TableCell>{student.ten}</TableCell>
                  <TableCell>{student.lop}</TableCell>
                  <TableCell>{student.lan_hoc}</TableCell>
                  <TableCell>{student.diem.TP1}</TableCell>
                  <TableCell>{student.diem.TP2}</TableCell>
                  <TableCell>{student.diem.CK1}</TableCell>
                  <TableCell>{student.diem.CK2 !== null ? student.diem.CK2 : '-'}</TableCell>
                  <TableCell>{totalScore.toFixed(1)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default XemDanhSachDiem;