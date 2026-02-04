import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx-js-style';
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
import { getGradeSettings } from '../../Api_controller/Service/gradeSettingsService';
import { getConversionRules } from '../../Api_controller/gradeSettingsApi';
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

  // Grade settings state
  const [conversionRules, setConversionRules] = useState([]);
  const [gradeSettings, setGradeSettings] = useState({
    diemThiToiThieu: 2.0,
    diemTrungBinhDat: 4.0,
    diemGiuaKyToiThieu: 4.0,
    diemChuyenCanToiThieu: 4.0
  });

  // Fetch grade settings when educationType changes
  useEffect(() => {
    if (!educationType) return;

    const fetchGradeSettings = async () => {
      try {
        const params = { he_dao_tao_id: educationType };
        const response = await getGradeSettings(params);

        let settings = {};
        if (response && typeof response === 'object') {
          settings = response;
        }

        const normalizedSettings = {
          diemThiToiThieu: settings.diemThiToiThieu ?? settings.diem_thi_toi_thieu ?? 2.0,
          diemTrungBinhDat: settings.diemTrungBinhDat ?? settings.diem_trung_binh_dat ?? 4.0,
          diemGiuaKyToiThieu: settings.diemGiuaKyToiThieu ?? settings.diem_giua_ky_toi_thieu ?? 4.0,
          diemChuyenCanToiThieu: settings.diemChuyenCanToiThieu ?? settings.diem_chuyen_can_toi_thieu ?? 4.0,
          heDaoTaoId: settings.heDaoTaoId ?? settings.he_dao_tao_id ?? educationType,
        };

        // Fetch conversion rules
        try {
          const ruleResponse = await getConversionRules({ he_dao_tao_id: educationType });
          if (ruleResponse && ruleResponse.data && ruleResponse.data.data) {
            const r = ruleResponse.data.data;
            r.sort((a, b) => b.diemMin - a.diemMin);
            setConversionRules(r);
          } else {
            setConversionRules([]);
          }
        } catch (err) {
          console.error('Error fetching conversion rules:', err);
          setConversionRules([]);
        }

        setGradeSettings(normalizedSettings);
      } catch (error) {
        console.error('Error fetching grade settings:', error);
        toast.error('Không thể tải thiết lập điểm. Sử dụng giá trị mặc định.');
      }
    };
    fetchGradeSettings();
  }, [educationType]);

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
      toast.error('Vui lòng chọn đầy đủ thông tin để tìm kiếm học viên.');
      return;
    }

    if (!scheduleId) {
      toast.error('Không tìm thấy thời khóa biểu. Vui lòng kiểm tra lại thông tin.');
      return;
    }

    setLoadingStudents(true);
    try {
      const response = await layDanhSachSinhVienTheoTKB(scheduleId);
      console.log('API Response:', response);

      if (!response.data || response.data.length === 0) {
        toast.warning('Không tìm thấy dữ liệu sinh viên cho thời khóa biểu này.');
        setStudents([]);
        setLoadingStudents(false);
        return;
      }

      // Sort by Student Code (Mã SV)
      response.data.sort((a, b) => {
        const svA = a.sinh_vien || a;
        const svB = b.sinh_vien || b;
        const codeA = svA.ma_sinh_vien || '';
        const codeB = svB.ma_sinh_vien || '';
        return codeA.localeCompare(codeB);
      });

      const formattedStudents = await Promise.all(
        response.data.map(async (student) => {
          // Handle potential missing data
          const sinhVien = student.sinh_vien || {};
          const lopInfo = sinhVien.lop_id ? await getLopHocById(sinhVien.lop_id) : null;
          const maLop = lopInfo?.ma_lop || student.lop_id || 'N/A';

          // Mapping status from Database (trang_thai)
          const rawStatus = student.trang_thai || student.diem?.trang_thai || '';
          let trangThai = rawStatus;
          if (rawStatus === 'qua_mon') trangThai = 'Qua môn';
          else if (rawStatus === 'hoc_lai') trangThai = 'Học lại';
          else if (rawStatus === 'rot_mon' || rawStatus === 'trượt môn' || rawStatus === 'truot_mon') trangThai = 'Trượt môn';

          if (!trangThai) {
            // Fallback logic for legacy data if needed, or just empty
            trangThai = '-';
          }

          return {
            id: student.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            sinh_vien_id: student.sinh_vien_id || '',
            ma_sinh_vien: sinhVien.ma_sinh_vien || '',
            ho_dem: sinhVien.ho_dem || '',
            ten: sinhVien.ten || '',
            lop: maLop,
            lan_hoc: student.lan_hoc ? 'Học lần ' + student.lan_hoc : 'Học lần 1',
            diem: {
              TP1: student.diem_tp1 !== undefined ? student.diem_tp1 : null,
              TP2: student.diem_tp2 !== undefined ? student.diem_tp2 : null,
              CK1: student.diem_ck !== undefined ? student.diem_ck : null,
              CK2: student.diem_ck2 !== undefined ? student.diem_ck2 : null,
            },
            ghi_chu: student.ghi_chu || '',
            trang_thai: trangThai,
            retakeRegistered: student.retakeRegistered || false,
          };
        })
      );
      setStudents(formattedStudents);
      toast.success(`Đã tìm thấy ${formattedStudents.length} học viên.`);
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm học viên. Vui lòng thử lại.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Hàm xử lý xuất dữ liệu
  const handleExportData = () => {
    if (students.length === 0) {
      toast.warning("Không có dữ liệu để xuất.");
      return;
    }

    const dataToExport = students.map((s, index) => {
      // Use DB status directly
      const displayStatus = s.trang_thai || '';

      // Recalc Total for display only if needed
      const tp1 = s.diem.TP1 !== null && s.diem.TP1 !== undefined ? parseFloat(s.diem.TP1) : 0;
      const tp2 = s.diem.TP2 !== null && s.diem.TP2 !== undefined ? parseFloat(s.diem.TP2) : 0;
      const ck1 = s.diem.CK1 !== null ? parseFloat(s.diem.CK1) : null;
      const ck2 = s.diem.CK2 !== null ? parseFloat(s.diem.CK2) : null;
      const finalExamScore = ck2 !== null ? ck2 : (ck1 !== null ? ck1 : 0);
      let totalScore = 0;
      if (tp1 >= 0 && tp2 >= 0 && finalExamScore >= 0) {
        totalScore = (tp1 * 0.7 + tp2 * 0.3) * 0.3 + finalExamScore * 0.7;
        totalScore = Math.round((totalScore + 1e-9) * 10) / 10;
      }

      const displayCK1 = s.diem.CK1 !== null ? s.diem.CK1 : '';
      const displayCK2 = s.diem.CK2 !== null ? s.diem.CK2 : '';

      return {
        stt: index + 1,
        ma_sv: s.ma_sinh_vien,
        ho_dem: s.ho_dem,
        ten: s.ten,
        lop: s.lop,
        lan_hoc: s.lan_hoc,
        tp1: s.diem.TP1 !== null ? s.diem.TP1 : '',
        tp2: s.diem.TP2 !== null ? s.diem.TP2 : '',
        ck1: displayCK1,
        ck2: displayCK2,
        tk: totalScore > 0 ? totalScore.toFixed(1) : '',
        status: displayStatus,
        ghi_chu: s.ghi_chu
      };
    });

    // Create Worksheet
    const ws = XLSX.utils.json_to_sheet([]);

    // Custom Headers
    XLSX.utils.sheet_add_aoa(ws, [[
      "STT", "Mã SV", "Họ đệm", "Tên", "Lớp", "Lần học",
      "TP1", "TP2", "CK lần 1", "CK lần 2", "Điểm TK", "Trạng thái", "Ghi chú"
    ]], { origin: "A1" });

    // Add Data
    const dataRows = dataToExport.map(item => [
      item.stt, item.ma_sv, item.ho_dem, item.ten, item.lop, item.lan_hoc,
      item.tp1, item.tp2, item.ck1, item.ck2, item.tk, item.status, item.ghi_chu
    ]);
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A2" });

    // Styling
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 1; R <= range.e.r; ++R) { // Start from row 1 (index 0 is header)
      // Check status column (Index 11 -> L column)
      const statusCell = ws[XLSX.utils.encode_cell({ c: 11, r: R })];
      if (statusCell) {
        const statusVal = statusCell.v;
        let fileColor = null;
        if (statusVal === 'Học lại' || statusVal === 'Trượt môn') {
          const colorHex = statusVal === 'Học lại' ? "FFCC80" : "FFCDD2"; // Orange / Red

          for (let C = 0; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' }; // Ensure cell exists
            ws[cellRef].s = {
              fill: { fgColor: { rgb: colorHex } },
              border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
              },
              alignment: (C >= 6 && C <= 10) ? { horizontal: "center", vertical: "center" } : { vertical: "center" }
            };
          }
        } else {
          // Default border for others
          for (let C = 0; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
            ws[cellRef].s = {
              border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
              },
              alignment: (C >= 6 && C <= 10) ? { horizontal: "center", vertical: "center" } : { vertical: "center" }
            };
          }
        }
      }
    }

    // Header Style
    for (let C = 0; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: 0 });
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "E0E0E0" } }, // Grey header
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      };
    }

    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 10 },
      { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachDiem");
    XLSX.writeFile(wb, `DanhSachDiem_${course}_${classGroup}.xlsx`);
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
      handleSearch(); // Cập nhật danh sách học viên
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

      {loadingStudents ? (
        <Box sx={{ width: '100%', textAlign: 'center', py: 3 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Đang tải dữ liệu sinh viên...
          </Typography>
        </Box>
      ) : (
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
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ghi chú</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => {
                  const displayStatus = student.trang_thai;

                  // Recalc Total for display only
                  const tp1 = student.diem.TP1 !== null && student.diem.TP1 !== undefined ? parseFloat(student.diem.TP1) : 0;
                  const tp2 = student.diem.TP2 !== null && student.diem.TP2 !== undefined ? parseFloat(student.diem.TP2) : 0;
                  const ck1 = student.diem.CK1 !== null ? parseFloat(student.diem.CK1) : null;
                  const ck2 = student.diem.CK2 !== null ? parseFloat(student.diem.CK2) : null;
                  const finalExamScore = ck2 !== null ? ck2 : (ck1 !== null ? ck1 : 0);
                  let totalScore = 0;

                  // Only calculate if we have valid scores
                  if (tp1 >= 0 && tp2 >= 0 && finalExamScore >= 0) {
                    totalScore = (tp1 * 0.7 + tp2 * 0.3) * 0.3 + finalExamScore * 0.7;
                    totalScore = Math.round((totalScore + 1e-9) * 10) / 10; // Rounding like backend
                  }

                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.ma_sinh_vien}</TableCell>
                      <TableCell>{student.ho_dem}</TableCell>
                      <TableCell>{student.ten}</TableCell>
                      <TableCell>{student.lop}</TableCell>
                      <TableCell>{student.lan_hoc}</TableCell>
                      <TableCell>{student.diem.TP1 !== null ? student.diem.TP1 : '-'}</TableCell>
                      <TableCell>{student.diem.TP2 !== null ? student.diem.TP2 : '-'}</TableCell>
                      <TableCell>{student.diem.CK1 !== null ? student.diem.CK1 : '-'}</TableCell>
                      <TableCell>{student.diem.CK2 !== null ? student.diem.CK2 : '-'}</TableCell>
                      <TableCell>{totalScore > 0 ? totalScore.toFixed(1) : '-'}</TableCell>
                      <TableCell>
                        {displayStatus === 'Qua môn' ? (
                          <span style={{ color: 'green', fontWeight: 'bold' }}>{displayStatus}</span>
                        ) : displayStatus === 'Trượt môn' ? (
                          <span style={{ color: 'red', fontWeight: 'bold' }}>{displayStatus}</span>
                        ) : displayStatus === 'Học lại' ? (
                          <span style={{ color: 'orange', fontWeight: 'bold' }}>{displayStatus}</span>
                        ) : (
                          displayStatus
                        )}
                      </TableCell>
                      <TableCell>{student.ghi_chu}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">Không có dữ liệu sinh viên</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default XemDanhSachDiem;