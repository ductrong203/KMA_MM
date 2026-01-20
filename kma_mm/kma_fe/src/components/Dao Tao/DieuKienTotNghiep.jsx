import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Checkbox,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  Info,
  School,
  Assignment,
  VerifiedUser,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import PageHeader from '../../layout/PageHeader';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { getDanhSachKhoaTheoDanhMucDaoTao, updateKhoa } from '../../Api_controller/Service/khoaService';
import { getDanhSachSinhVienTheoLop } from '../../Api_controller/Service/sinhVienService';
import { getDanhSachLopTheoKhoaDaoTao } from '../../Api_controller/Service/lopService';
import { kiemTraTotNghiep } from '../../Api_controller/Service/sinhVienService';
import {
  approveGraduation,
  getGraduationStatistics,
  getGraduationList,
  checkGraduationStatus
} from '../../Api_controller/Service/totNghiepService';

function DieuKienTotNghiep() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTrainingSystem, setSelectedTrainingSystem] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [graduationResults, setGraduationResults] = useState({});
  const [trainingSystems, setTrainingSystems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [requiredCredits, setRequiredCredits] = useState(130);
  const [graduationStatus, setGraduationStatus] = useState({
    isApproved: false,
    approvedCount: 0,
    approvedStudents: [],
    approvalDate: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  // State quản lý trạng thái đúng hạn (mapping studentId -> boolean)
  const [dungHanStatus, setDungHanStatus] = useState({});

  const graduationSteps = ['Kiểm tra điều kiện', 'Xét duyệt', 'Hoàn thành'];

  // Lấy danh sách hệ đào tạo khi component mount
  useEffect(() => {
    const fetchTrainingSystems = async () => {
      setLoading(true);
      try {
        const response = await fetchDanhSachHeDaoTao();
        const data = Array.isArray(response) ? response : [];
        setTrainingSystems(data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Lỗi khi tải danh sách hệ đào tạo',
          severity: 'error',
        });
        setTrainingSystems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainingSystems();
  }, []);

  // Lấy danh sách khóa đào tạo khi chọn hệ đào tạo
  useEffect(() => {
    if (selectedTrainingSystem?.id) {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const response = await getDanhSachKhoaTheoDanhMucDaoTao(selectedTrainingSystem.id);
          const data = Array.isArray(response) ? response : [];
          setCourses(data);
          // Reset các state phụ thuộc
          setClasses([]);
          setStudents([]);
          setSelectedCourse(null);
          setSelectedClass(null);
          setGraduationResults({});
          setRequiredCredits(130); // Reset về giá trị mặc định
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi tải danh sách khóa đào tạo',
            severity: 'error',
          });
          setCourses([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    } else {
      // Reset tất cả khi không có hệ đào tạo được chọn
      setCourses([]);
      setClasses([]);
      setStudents([]);
      setSelectedCourse(null);
      setSelectedClass(null);
      setGraduationResults({});
      setRequiredCredits(130); // Reset về giá trị mặc định
    }
  }, [selectedTrainingSystem]);

  // Lấy danh sách lớp khi chọn khóa đào tạo
  useEffect(() => {
    if (selectedCourse?.id) {
      const fetchClasses = async () => {
        setLoading(true);
        try {
          const response = await getDanhSachLopTheoKhoaDaoTao(selectedCourse.id);
          const data = Array.isArray(response) ? response : [];
          setClasses(data);
          // Cập nhật giá trị tín chỉ yêu cầu từ khóa đào tạo được chọn
          if (selectedCourse.tong_tin_chi_yeu_cau) {
            setRequiredCredits(selectedCourse.tong_tin_chi_yeu_cau);
          }
          // Reset các state phụ thuộc
          setStudents([]);
          setSelectedClass(null);
          setGraduationResults({});
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi tải danh sách lớp',
            severity: 'error',
          });
          setClasses([]);
        } finally {
          setLoading(false);
        }
      };
      fetchClasses();
    } else {
      // Reset khi không có khóa đào tạo được chọn
      setClasses([]);
      setStudents([]);
      setSelectedClass(null);
      setGraduationResults({});
    }
  }, [selectedCourse]);

  // Lấy danh sách sinh viên và kiểm tra điều kiện tốt nghiệp khi chọn lớp
  useEffect(() => {
    if (selectedClass?.id) {
      const fetchStudentsAndCheckGraduation = async () => {
        setLoading(true);
        try {
          // Kiểm tra trạng thái xét duyệt của lớp trước
          const statusResponse = await checkGraduationStatus({
            lop_id: selectedClass.id,
            khoa_dao_tao_id: selectedCourse.id,
            he_dao_tao_id: selectedTrainingSystem.id
          });

          setGraduationStatus({
            isApproved: statusResponse.data.is_approved,
            approvedCount: statusResponse.data.approved_count,
            approvedStudents: statusResponse.data.approved_students || [],
            approvalDate: statusResponse.data.approval_date
          });

          // Lấy danh sách sinh viên
          const response = await getDanhSachSinhVienTheoLop(selectedClass.id);
          const data = Array.isArray(response.data) ? response.data : [];
          setStudents(data);

          // Kiểm tra điều kiện tốt nghiệp cho từng sinh viên
          const results = {};
          for (const student of data) {
            try {
              // Pass the required credits to the API
              const gradResponse = await kiemTraTotNghiep(
                student.sinh_vien_id || student.id,
                selectedCourse?.tong_tin_chi_yeu_cau || requiredCredits
              );
              results[student.sinh_vien_id || student.id] = gradResponse.data;
            } catch {
              // Xử lý lỗi khi kiểm tra tốt nghiệp
              results[student.sinh_vien_id || student.id] = null;
            }
          }
          setGraduationResults(results);
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi tải thông tin lớp',
            severity: 'error',
          });
          setStudents([]);
          setGraduationStatus({
            isApproved: false,
            approvedCount: 0,
            approvedStudents: [],
            approvalDate: null
          });
        } finally {
          setLoading(false);
        }
      };
      fetchStudentsAndCheckGraduation();
    } else {
      // Reset khi không có lớp được chọn
      setStudents([]);
      setGraduationResults({});
      setGraduationStatus({
        isApproved: false,
        approvedCount: 0,
        approvedStudents: [],
        approvalDate: null
      });
    }
  }, [selectedClass, selectedCourse, selectedTrainingSystem, requiredCredits]);

  const handleNext = () => {
    // Chỉ chuyển step, không gọi API
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Hàm cập nhật tín chỉ yêu cầu cho khóa đào tạo
  const handleUpdateRequiredCredits = async () => {
    if (!selectedCourse?.id) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn khóa đào tạo trước khi cập nhật tín chỉ yêu cầu',
        severity: 'warning',
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Xác nhận cập nhật tín chỉ yêu cầu',
      content: `Bạn có chắc chắn muốn cập nhật số tín chỉ yêu cầu để xét tốt nghiệp của khóa ${selectedCourse.ma_khoa} - ${selectedCourse.ten_khoa} thành ${requiredCredits} tín chỉ?`,
      onConfirm: async () => {
        try {
          setLoading(true);

          // Chuẩn bị dữ liệu cập nhật
          const updateData = {
            ...selectedCourse,
            tong_tin_chi_yeu_cau: requiredCredits
          };

          // Gọi API cập nhật
          await updateKhoa(selectedCourse.id, updateData);

          // Cập nhật khóa đào tạo trong state
          setCourses(prevCourses =>
            prevCourses.map(course =>
              course.id === selectedCourse.id
                ? { ...course, tong_tin_chi_yeu_cau: requiredCredits }
                : course
            )
          );

          // Cập nhật selectedCourse
          setSelectedCourse(prev => ({ ...prev, tong_tin_chi_yeu_cau: requiredCredits }));

          setSnackbar({
            open: true,
            message: 'Cập nhật số tín chỉ yêu cầu thành công',
            severity: 'success',
          });

          // Cập nhật lại thông tin xét tốt nghiệp nếu đã có sinh viên được chọn
          if (students.length > 0 && selectedClass?.id) {
            // Gọi lại API kiểm tra điều kiện tốt nghiệp cho từng sinh viên
            const results = {};
            for (const student of students) {
              try {
                const gradResponse = await kiemTraTotNghiep(
                  student.sinh_vien_id || student.id,
                  requiredCredits
                );
                results[student.sinh_vien_id || student.id] = gradResponse.data;
              } catch {
                results[student.sinh_vien_id || student.id] = null;
              }
            }
            setGraduationResults(results);
          }

        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi cập nhật số tín chỉ yêu cầu',
            severity: 'error',
          });
        } finally {
          setLoading(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      }
    });
  };

  // Function in bằng tốt nghiệp cho sinh viên đã xét duyệt
  const handlePrintDiploma = (student) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận in bằng tốt nghiệp',
      content: `Bạn có chắc chắn muốn in bằng tốt nghiệp cho sinh viên ${student.ma_sinh_vien} - ${`${student.ho_dem || ''} ${student.ten || ''}`.trim()}?`,
      onConfirm: async () => {
        try {
          setLoading(true);

          // TODO: Gọi API in bằng tốt nghiệp
          // await printDiploma(student.sinh_vien_id || student.id);

          setSnackbar({
            open: true,
            message: `Đã gửi yêu cầu in bằng tốt nghiệp cho sinh viên ${student.ma_sinh_vien}`,
            severity: 'success'
          });

        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi in bằng tốt nghiệp',
            severity: 'error'
          });
        } finally {
          setLoading(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      }
    });
  };

  // Function xem chi tiết xét duyệt
  const handleViewGraduationDetails = (student) => {
    const graduationInfo = graduationResults[student.sinh_vien_id || student.id];

    if (!graduationInfo) {
      setSnackbar({
        open: true,
        message: 'Không tìm thấy thông tin xét duyệt của sinh viên này',
        severity: 'warning'
      });
      return;
    }

    // Hiển thị dialog chi tiết
    setConfirmDialog({
      open: true,
      title: `Chi tiết xét duyệt - ${student.ma_sinh_vien}`,
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {`${student.ho_dem || ''} ${student.ten || ''}`.trim()}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Thông tin học tập:
            </Typography>
            <Typography variant="body2">
              • Tổng tín chỉ: {graduationInfo.tong_tin_chi || 0}/{selectedCourse?.tong_tin_chi_yeu_cau || requiredCredits}
            </Typography>
            <Typography variant="body2">
              • Điểm trung bình tích lũy: {graduationInfo.diem_trung_binh_tich_luy || 'Chưa có'}
            </Typography>
            <Typography variant="body2">
              • Đủ tín chỉ: {graduationInfo.dieu_kien_tot_nghiep?.du_tin_chi ? '✅ Có' : '❌ Không'}
            </Typography>
            <Typography variant="body2">
              • Đủ chứng chỉ: {graduationInfo.dieu_kien_tot_nghiep?.co_chung_chi_xet_tot_nghiep ? '✅ Có' : '❌ Không'}
            </Typography>
          </Box>
          {(() => {

            let isDungHan = false;
            if (student.hasOwnProperty('dung_han')) {
              isDungHan = student.dung_han === 1;
            } else {
              isDungHan = !!dungHanStatus[student.sinh_vien_id || student.id];
            }

            return (
              <Typography variant="body2" sx={{ mt: 1 }}>
                • {isDungHan ? 'Tốt nghiệp đúng hạn' : 'Tốt nghiệp không đúng hạn'}
              </Typography>
            );
          })()}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              🏆 Chứng chỉ đã có:
            </Typography>
            <Typography variant="body2">
              {renderCertificates(graduationInfo.chung_chi_tot_nghiep)}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ✅ Kết quả xét duyệt:
            </Typography>
            <Chip
              label={graduationInfo.dieu_kien_tot_nghiep?.du_dieu_kien ? 'ĐẠT - Đủ điều kiện tốt nghiệp' : 'KHÔNG ĐẠT'}
              color={graduationInfo.dieu_kien_tot_nghiep?.du_dieu_kien ? 'success' : 'error'}
              icon={graduationInfo.dieu_kien_tot_nghiep?.du_dieu_kien ? <CheckCircle /> : <Cancel />}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      ),
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  // Function in bằng hàng loạt
  const handleBatchPrintDiplomas = () => {
    if (graduationStatus.approvedCount === 0) {
      setSnackbar({
        open: true,
        message: 'Không có sinh viên nào đã được xét duyệt để in bằng',
        severity: 'warning'
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Xác nhận in bằng hàng loạt',
      content: `Bạn có chắc chắn muốn in bằng tốt nghiệp cho tất cả ${graduationStatus.approvedCount} sinh viên đã được xét duyệt trong lớp ${selectedClass?.ma_lop}?`,
      onConfirm: async () => {
        try {
          setLoading(true);

          // TODO: Gọi API in bằng hàng loạt
          // await batchPrintDiplomas(graduationStatus.approvedStudents.map(s => s.sinh_vien_id || s.id));

          setSnackbar({
            open: true,
            message: `Đã gửi yêu cầu in bằng tốt nghiệp cho ${graduationStatus.approvedCount} sinh viên`,
            severity: 'success'
          });

        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi in bằng hàng loạt',
            severity: 'error'
          });
        } finally {
          setLoading(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      }
    });
  };

  // Function xét duyệt tốt nghiệp
  const handleApproveGraduation = async () => {
    // Lấy danh sách sinh viên đủ điều kiện tốt nghiệp nhưng chưa được xét duyệt
    const eligibleStudents = students.filter(student => {
      const studentId = student.sinh_vien_id || student.id;

      // Kiểm tra xem sinh viên đã được xét duyệt chưa
      const isAlreadyApproved = graduationStatus.approvedStudents.some(
        approvedStudent => approvedStudent.id === studentId
      );

      if (isAlreadyApproved) return false;

      // Kiểm tra điều kiện tốt nghiệp
      const graduationInfo = graduationResults[studentId];
      return graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien;
    });

    if (eligibleStudents.length === 0) {
      setSnackbar({
        open: true,
        message: 'Không có sinh viên nào còn lại để xét duyệt tốt nghiệp',
        severity: 'warning'
      });
      return;
    }

    // Hiển thị dialog xác nhận
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xét duyệt tốt nghiệp',
      content: `Bạn có chắc chắn muốn xét duyệt tốt nghiệp cho ${eligibleStudents.length} sinh viên còn lại trong lớp ${selectedClass?.ma_lop}?`,
      onConfirm: async () => {
        try {
          setLoading(true);

          // Chuẩn bị dữ liệu để gửi API xét duyệt
          const graduationData = {
            sinh_vien_ids: eligibleStudents.map(student => student.sinh_vien_id || student.id),
            lop_id: selectedClass.id,
            khoa_dao_tao_id: selectedCourse.id,
            he_dao_tao_id: selectedTrainingSystem.id,
            graduation_results: eligibleStudents.map(student => {
              const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
              return {
                sinh_vien_id: student.sinh_vien_id || student.id,
                dieu_kien_tot_nghiep: graduationInfo.dieu_kien_tot_nghiep,
                certificates: graduationInfo.chung_chi || [],
                dung_han: dungHanStatus[student.sinh_vien_id || student.id] ? 1 : 0
              };
            })
          };

          // Gọi API xét duyệt tốt nghiệp
          await approveGraduation(graduationData);

          // Cập nhật trạng thái đã xét duyệt
          setGraduationStatus(prevStatus => ({
            ...prevStatus,
            isApproved: true,
            approvedCount: prevStatus.approvedCount + eligibleStudents.length,
            approvedStudents: [...prevStatus.approvedStudents, ...eligibleStudents],
            approvalDate: new Date()
          }));

          setSnackbar({
            open: true,
            message: `Đã xét duyệt tốt nghiệp thành công cho ${eligibleStudents.length} sinh viên`,
            severity: 'success'
          });

          // Chỉ chuyển sang step 3 nếu đây là lần xét duyệt đầu tiên (chưa có ai được xét trước đó)
          // Nếu đã có sinh viên được xét duyệt trước đó, chỉ ở lại Step 2
          const wasFirstApproval = graduationStatus.approvedCount === 0;
          const totalEligibleStudents = students.filter(student => {
            const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
            return graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien;
          });

          if (wasFirstApproval && graduationStatus.approvedCount + eligibleStudents.length >= totalEligibleStudents.length) {
            // Chỉ chuyển sang Step 3 nếu đây là lần xét duyệt đầu tiên và xét hết tất cả sinh viên
            setActiveStep(2);
          }

        } catch (error) {
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Lỗi khi xét duyệt tốt nghiệp',
            severity: 'error'
          });
        } finally {
          setLoading(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      }
    });
  };

  // Hiển thị trạng thái điều kiện tốt nghiệp
  const getGraduationStatus = (graduationInfo, student) => {
    // Kiểm tra xem sinh viên đã được xét duyệt chưa
    const isApproved = graduationStatus.approvedStudents.some(
      approvedStudent => approvedStudent.id === (student.sinh_vien_id || student.id)
    );

    if (isApproved) {
      return { text: 'Đã xét duyệt', color: 'info' };
    }

    if (!graduationInfo) return { text: 'Đang kiểm tra...', color: 'default' };

    const condition = graduationInfo.dieu_kien_tot_nghiep;
    if (condition?.du_dieu_kien) {
      return { text: 'Đủ điều kiện', color: 'success' };
    } else {
      return { text: 'Không đủ điều kiện', color: 'error' };
    }
  };

  // Hiển thị danh sách chứng chỉ theo format mới
  const renderCertificates = (certificates, showDetails = false) => {
    if (!certificates || certificates.length === 0) return 'Chưa có';

    const validCerts = certificates.filter((cert) => cert.tinh_trang === 'tốt nghiệp');
    if (validCerts.length === 0) return 'Chưa có';

    if (!showDetails) {
      return validCerts
        .map((cert) => cert.loai_chung_chi || cert.loaiChungChi?.ten_loai_chung_chi)
        .join(', ');
    } else {
      // Hiển thị chi tiết chứng chỉ
      return validCerts.map((cert, index) => {
        const certName = cert.loai_chung_chi || cert.loaiChungChi?.ten_loai_chung_chi || 'Chứng chỉ';
        const formattedDate = cert.ngay_ky_quyet_dinh ? new Date(cert.ngay_ky_quyet_dinh).toLocaleDateString('vi-VN') : 'N/A';

        return (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            <strong>{certName}</strong>: {
              `Điểm TB: ${cert.diem_trung_binh || 'N/A'}; ` +
              `Xếp loại: ${cert.xep_loai || 'N/A'}; ` +
              `Tình trạng: ${cert.tinh_trang || 'N/A'}; ` +
              `Số QĐ: ${cert.so_quyet_dinh || 'N/A'}; ` +
              `Ngày ký: ${formattedDate}; ` +
              `Ghi chú: ${cert.ghi_chu || 'N/A'}; `
            }
          </Typography>
        );
      });
    }
  };

  // Toggle chi tiết sinh viên
  const toggleRowExpansion = (studentId) => {
    setExpandedRows(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Render chi tiết điều kiện tốt nghiệp
  const renderGraduationDetails = (graduationInfo) => {
    if (!graduationInfo?.dieu_kien_tot_nghiep) return null;

    const details = graduationInfo.dieu_kien_tot_nghiep.chi_tiet;

    return (
      <Box sx={{ p: 2, bgcolor: 'grey.50', mt: 1, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              <School sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Tín chỉ
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Hiện tại: {details?.tong_tin_chi_hien_tai || 0}/{details?.tong_tin_chi_yeu_cau || selectedCourse?.tong_tin_chi_yeu_cau || requiredCredits} tín chỉ
            </Typography>
            <Chip
              size="small"
              label={graduationInfo.dieu_kien_tot_nghiep.du_tin_chi ? 'Đủ tín chỉ' : 'Thiếu tín chỉ'}
              color={graduationInfo.dieu_kien_tot_nghiep.du_tin_chi ? 'success' : 'error'}
              icon={graduationInfo.dieu_kien_tot_nghiep.du_tin_chi ? <CheckCircle /> : <Cancel />}
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              <Assignment sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Chứng chỉ
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Đã có: {details?.so_loai_chung_chi_da_co || 0}/{details?.so_loai_chung_chi_yeu_cau || 0} loại
            </Typography>
            <Chip
              size="small"
              label={graduationInfo.dieu_kien_tot_nghiep.co_chung_chi_xet_tot_nghiep ? 'Đủ chứng chỉ' : 'Thiếu chứng chỉ'}
              color={graduationInfo.dieu_kien_tot_nghiep.co_chung_chi_xet_tot_nghiep ? 'success' : 'error'}
              icon={graduationInfo.dieu_kien_tot_nghiep.co_chung_chi_xet_tot_nghiep ? <CheckCircle /> : <Cancel />}
              sx={{ mt: 0.5 }}
            />
          </Grid>

          {details?.loai_chung_chi_con_thieu && details.loai_chung_chi_con_thieu.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Chứng chỉ còn thiếu:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {details.loai_chung_chi_con_thieu.map((cert, index) => (
                  <Chip
                    key={index}
                    size="small"
                    label={cert.ten_loai_chung_chi}
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          )}

          {/* Hiển thị chi tiết chứng chỉ đã có */}
          {graduationInfo.chung_chi_tot_nghiep && graduationInfo.chung_chi_tot_nghiep.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                <VerifiedUser sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Chi tiết chứng chỉ đã có:
              </Typography>
              <Box sx={{ pl: 1, borderLeft: '2px solid #2196f3', mt: 1 }}>
                {renderCertificates(graduationInfo.chung_chi_tot_nghiep, true)}
              </Box>
            </Grid>
          )}

          {details?.tat_ca_loai_chung_chi_yeu_cau && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tất cả chứng chỉ yêu cầu:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {details.tat_ca_loai_chung_chi_yeu_cau.map((cert) => (
                  <Chip
                    key={cert.id}
                    size="small"
                    label={cert.ten_loai_chung_chi}
                    color={cert.da_co ? 'success' : 'default'}
                    icon={cert.da_co ? <CheckCircle /> : <Cancel />}
                    variant={cert.da_co ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <PageHeader title="Xét tốt nghiệp" />

            <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
              {graduationSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && (
              <Box sx={{ mt: 2 }}>
                {activeStep === 0 && (
                  <Box>
                    {/* Chọn hệ đào tạo */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Autocomplete
                        key="training-system-select"
                        options={trainingSystems}
                        getOptionLabel={(option) => option.ten_he_dao_tao || option.name || ''}
                        renderInput={(params) => <TextField {...params} label="Hệ đào tạo" />}
                        onChange={(event, newValue) => setSelectedTrainingSystem(newValue)}
                        value={selectedTrainingSystem}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                      />
                    </FormControl>

                    {/* Chọn khóa đào tạo */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Autocomplete
                        key={`course-select-${selectedTrainingSystem?.id || 'none'}`}
                        options={courses}
                        getOptionLabel={(option) => option.ten_khoa || option.name || ''}
                        renderInput={(params) => <TextField {...params} label="Khóa đào tạo" />}
                        onChange={(event, newValue) => setSelectedCourse(newValue)}
                        value={selectedCourse}
                        disabled={!selectedTrainingSystem}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                      />
                    </FormControl>

                    {/* Chọn lớp */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Autocomplete
                        key={`class-select-${selectedCourse?.id || 'none'}`}
                        options={classes}
                        getOptionLabel={(option) => option.ma_lop || option.name || ''}
                        renderInput={(params) => <TextField {...params} label="Lớp" />}
                        onChange={(event, newValue) => setSelectedClass(newValue)}
                        value={selectedClass}
                        disabled={!selectedCourse}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                      />
                    </FormControl>

                    {/* Danh sách sinh viên */}
                    {selectedClass && students.length > 0 && (
                      <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell width="40px"></TableCell>
                              <TableCell>Mã SV</TableCell>
                              <TableCell>Họ tên</TableCell>
                              <TableCell>Tín chỉ</TableCell>
                              <TableCell>Chứng chỉ</TableCell>
                              <TableCell>Trạng thái</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {students.map((student) => {
                              const studentId = student.sinh_vien_id || student.id;
                              const graduationInfo = graduationResults[studentId];
                              const isExpanded = expandedRows[studentId];
                              const status = getGraduationStatus(graduationInfo, student);

                              return (
                                <>
                                  <TableRow key={studentId}>
                                    <TableCell>
                                      <Tooltip title="Xem chi tiết">
                                        <IconButton
                                          size="small"
                                          onClick={() => toggleRowExpansion(studentId)}
                                          disabled={!graduationInfo}
                                        >
                                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight="medium">
                                        {student.ma_sinh_vien || student.code}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {`${student.ho_dem || ''} ${student.ten || ''}`.trim()}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">
                                          {graduationInfo ?
                                            `${graduationInfo.tong_tin_chi || 0}/${selectedCourse?.tong_tin_chi_yeu_cau || requiredCredits}` :
                                            '-'
                                          }
                                        </Typography>
                                        {graduationInfo?.dieu_kien_tot_nghiep && (
                                          <Chip
                                            size="small"
                                            label={graduationInfo.dieu_kien_tot_nghiep.du_tin_chi ? "Đủ" : "Thiếu"}
                                            color={graduationInfo.dieu_kien_tot_nghiep.du_tin_chi ? "success" : "error"}
                                            sx={{ minWidth: 50 }}
                                          />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {graduationInfo ? renderCertificates(graduationInfo.chung_chi_tot_nghiep) : '-'}
                                        </Typography>
                                        {graduationInfo?.dieu_kien_tot_nghiep && (
                                          <Chip
                                            size="small"
                                            label={graduationInfo.dieu_kien_tot_nghiep.co_chung_chi_xet_tot_nghiep ? "Đủ" : "Thiếu"}
                                            color={graduationInfo.dieu_kien_tot_nghiep.co_chung_chi_xet_tot_nghiep ? "success" : "error"}
                                            sx={{ minWidth: 50 }}
                                          />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        size="medium"
                                        label={status.text}
                                        color={status.color}
                                        icon={status.color === 'success' ? <CheckCircle /> : <Cancel />}
                                        sx={{ fontWeight: 'medium' }}
                                      />
                                    </TableCell>
                                  </TableRow>

                                  {/* Chi tiết mở rộng */}
                                  {isExpanded && graduationInfo && (
                                    <TableRow>
                                      <TableCell colSpan={6} sx={{ py: 0 }}>
                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                          {renderGraduationDetails(graduationInfo)}
                                        </Collapse>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {!loading && students.length === 0 && selectedClass && (
                      <Typography color="textSecondary" sx={{ mt: 2 }}>
                        Không tìm thấy sinh viên trong lớp này.
                      </Typography>
                    )}
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box>

                    <Typography variant="body1" sx={{ mb: 3 }}>
                      Xác nhận xét tốt nghiệp cho các sinh viên đủ điều kiện trong lớp {selectedClass?.ma_lop}.
                    </Typography>

                    {/* Cảnh báo nếu đã có sinh viên được xét duyệt */}


                    {/* Danh sách sinh viên đủ điều kiện nhưng chưa xét duyệt */}
                    {(() => {
                      const eligibleStudents = students.filter(student => {
                        const studentId = student.sinh_vien_id || student.id;

                        // Kiểm tra xem sinh viên đã được xét duyệt chưa
                        const isAlreadyApproved = graduationStatus.approvedStudents.some(
                          approvedStudent => approvedStudent.id === studentId
                        );

                        if (isAlreadyApproved) return false;

                        // Kiểm tra điều kiện tốt nghiệp
                        const graduationInfo = graduationResults[studentId];
                        return graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien;
                      });

                      const totalEligibleStudents = students.filter(student => {
                        const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                        return graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien;
                      });

                      if (totalEligibleStudents.length === 0) {
                        return (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            Không có sinh viên nào đủ điều kiện tốt nghiệp trong lớp này.
                          </Alert>
                        );
                      }

                      if (eligibleStudents.length === 0) {
                        return (
                          <Box>


                            {/* Hiển thị danh sách sinh viên đã xét duyệt */}
                            {graduationStatus.approvedCount > 0 && (
                              <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                  📋 Danh sách sinh viên đã xét duyệt:
                                </Typography>

                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                  <Table>
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                                        <TableCell>STT</TableCell>
                                        <TableCell>Mã SV</TableCell>
                                        <TableCell>Họ tên</TableCell>
                                        <TableCell>Tín chỉ</TableCell>
                                        <TableCell>Chứng chỉ</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Hành động</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {graduationStatus.approvedStudents.map((student, index) => {
                                        const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                                        return (
                                          <TableRow key={student.sinh_vien_id || student.id} sx={{ bgcolor: 'success.light', opacity: 0.7 }}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                              <Typography variant="body2" fontWeight="medium">
                                                {student.ma_sinh_vien || student.code}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="body2">
                                                {`${student.ho_dem || ''} ${student.ten || ''}`.trim()}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="body2">
                                                {graduationInfo?.tong_tin_chi || 0}/130
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="body2">
                                                {renderCertificates(graduationInfo?.chung_chi_tot_nghiep)}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Chip
                                                size="small"
                                                label="Đã xét duyệt"
                                                color="info"
                                                icon={<CheckCircle />}
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  color="primary"
                                                  startIcon={<Assignment />}
                                                  onClick={() => handlePrintDiploma(student)}
                                                >
                                                  In bằng
                                                </Button>
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  color="secondary"
                                                  startIcon={<Info />}
                                                  onClick={() => handleViewGraduationDetails(student)}
                                                >
                                                  Chi tiết
                                                </Button>
                                              </Box>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </TableContainer>

                                {/* Nút hành động hàng loạt */}
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<Assignment />}
                                    onClick={handleBatchPrintDiplomas}
                                    disabled={graduationStatus.approvedCount === 0}
                                  >
                                    In bằng hàng loạt ({graduationStatus.approvedCount})
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="info"
                                    startIcon={<School />}
                                    onClick={() => {
                                      setSnackbar({
                                        open: true,
                                        message: 'Tính năng xuất danh sách sinh viên đang được phát triển',
                                        severity: 'info'
                                      });
                                    }}
                                  >
                                    Xuất danh sách
                                  </Button>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        );
                      }

                      return (
                        <Box>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            Có {eligibleStudents.length} sinh viên đủ điều kiện chưa được xét duyệt.
                            <br />
                            Tổng đủ điều kiện: {totalEligibleStudents.length}/{students.length} sinh viên.
                            <br />
                            Đã xét duyệt: {graduationStatus.approvedCount} sinh viên.
                          </Alert>

                          <Typography variant="h6" gutterBottom>
                            Danh sách sinh viên chưa xét duyệt:
                          </Typography>

                          <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>STT</TableCell>
                                  <TableCell>Mã SV</TableCell>
                                  <TableCell>Họ tên</TableCell>
                                  <TableCell>Tín chỉ</TableCell>
                                  <TableCell>Chứng chỉ</TableCell>
                                  <TableCell>Trạng thái</TableCell>
                                  <TableCell align="center">Đúng hạn</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {eligibleStudents.map((student, index) => {
                                  const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                                  return (
                                    <TableRow key={student.sinh_vien_id || student.id}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                          {student.ma_sinh_vien || student.code}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {`${student.ho_dem || ''} ${student.ten || ''}`.trim()}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {graduationInfo?.tong_tin_chi || 0}/130
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {renderCertificates(graduationInfo?.chung_chi_tot_nghiep)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          size="small"
                                          label="Đủ điều kiện"
                                          color="success"
                                          icon={<CheckCircle />}
                                        />
                                      </TableCell>
                                      <TableCell align="center">
                                        <Checkbox
                                          checked={!!dungHanStatus[student.sinh_vien_id || student.id]}
                                          onChange={(e) => {
                                            const studentId = student.sinh_vien_id || student.id;
                                            setDungHanStatus(prev => ({
                                              ...prev,
                                              [studentId]: e.target.checked
                                            }));
                                          }}
                                          color="primary"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {/* Danh sách sinh viên đã xét duyệt */}
                          {graduationStatus.approvedCount > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="h6" gutterBottom>
                                Danh sách sinh viên đã xét duyệt:
                              </Typography>

                              <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table>
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                      <TableCell>STT</TableCell>
                                      <TableCell>Mã SV</TableCell>
                                      <TableCell>Họ tên</TableCell>
                                      <TableCell>Trạng thái</TableCell>
                                      <TableCell>Hành động</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {graduationStatus.approvedStudents.map((student, index) => (
                                      <TableRow key={student.sinh_vien_id || student.id} sx={{ bgcolor: 'success.light', opacity: 0.7 }}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                          <Typography variant="body2" fontWeight="medium">
                                            {student.ma_sinh_vien || student.code}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {`${student.ho_dem || ''} ${student.ten || ''}`.trim()}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            size="small"
                                            label="Đã xét duyệt"
                                            color="info"
                                            icon={<CheckCircle />}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="primary"
                                              startIcon={<Assignment />}
                                              onClick={() => handlePrintDiploma(student)}
                                            >
                                              In bằng
                                            </Button>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="secondary"
                                              startIcon={<Info />}
                                              onClick={() => handleViewGraduationDetails(student)}
                                            >
                                              Chi tiết
                                            </Button>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}
                        </Box>
                      );
                    })()}
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>🎉 Hoàn thành xét tốt nghiệp</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Quy trình xét tốt nghiệp cho lớp {selectedClass?.ma_lop} đã hoàn tất thành công.
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      💡 <strong>Lưu ý:</strong> Step 3 chỉ hiển thị khi xét duyệt tất cả sinh viên trong lần đầu tiên.
                      Các lần xét duyệt tiếp theo sẽ dừng tại Step 2 để thực hiện các hành động cụ thể cho từng sinh viên.
                    </Alert>


                    {(() => {
                      const eligibleStudents = students.filter(student => {
                        const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                        return graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien;
                      });

                      if (eligibleStudents.length === 0) {
                        return (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            Không có sinh viên nào được xét tốt nghiệp trong lớp {selectedClass?.ma_lop}.
                          </Alert>
                        );
                      }

                      return (
                        <Box>
                          <Alert severity="success" sx={{ mb: 3 }}>
                            Đã hoàn thành xét tốt nghiệp cho {graduationStatus.approvedCount} sinh viên trong lớp {selectedClass?.ma_lop}.
                          </Alert>

                          {/* Danh sách sinh viên đã xét duyệt với tính năng in bằng */}
                          {graduationStatus.approvedCount > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="h6" gutterBottom>
                                📋 Danh sách sinh viên đã xét duyệt:
                              </Typography>

                              <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table>
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: 'success.light' }}>
                                      <TableCell>STT</TableCell>
                                      <TableCell>Mã SV</TableCell>
                                      <TableCell>Họ tên</TableCell>
                                      <TableCell>Trạng thái</TableCell>
                                      <TableCell>Hành động</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {graduationStatus.approvedStudents.map((student, index) => (
                                      <TableRow key={student.sinh_vien_id || student.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                          <Typography variant="body2" fontWeight="medium">
                                            {student.ma_sinh_vien || student.code}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {`${student.ho_dem || ''} ${student.ten || ''}`.trim()}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            size="small"
                                            label="Đã xét duyệt"
                                            color="success"
                                            icon={<CheckCircle />}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                              size="small"
                                              variant="contained"
                                              color="primary"
                                              startIcon={<Assignment />}
                                              onClick={() => handlePrintDiploma(student)}
                                            >
                                              In bằng
                                            </Button>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="info"
                                              startIcon={<Info />}
                                              onClick={() => handleViewGraduationDetails(student)}
                                            >
                                              Chi tiết
                                            </Button>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}

                          <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              🎯 Các hành động có thể thực hiện:
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} md={3}>
                                <Button
                                  variant="contained"
                                  fullWidth
                                  startIcon={<Assignment />}
                                  sx={{ mb: 1 }}
                                  onClick={() => {
                                    // TODO: Implement export graduation decision
                                    setSnackbar({
                                      open: true,
                                      message: 'Tính năng xuất quyết định tốt nghiệp đang được phát triển',
                                      severity: 'info'
                                    });
                                  }}
                                >
                                  Xuất quyết định
                                </Button>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  startIcon={<School />}
                                  sx={{ mb: 1 }}
                                  onClick={() => {
                                    // TODO: Implement export student list
                                    setSnackbar({
                                      open: true,
                                      message: 'Tính năng xuất danh sách sinh viên đang được phát triển',
                                      severity: 'info'
                                    });
                                  }}
                                >
                                  Danh sách SV
                                </Button>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Button
                                  variant="contained"
                                  fullWidth
                                  startIcon={<Info />}
                                  sx={{ mb: 1 }}
                                  color="success"
                                  onClick={handleBatchPrintDiplomas}
                                  disabled={graduationStatus.approvedCount === 0}
                                >
                                  In bằng hàng loạt
                                </Button>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  color="secondary"
                                  startIcon={<CheckCircle />}
                                  sx={{ mb: 1 }}
                                  onClick={() => {
                                    // Reset to start over
                                    setActiveStep(0);
                                    setSelectedTrainingSystem(null);
                                    setSelectedCourse(null);
                                    setSelectedClass(null);
                                    setStudents([]);
                                    setGraduationResults({});
                                    setExpandedRows({});
                                  }}
                                >
                                  Xét lớp khác
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      );
                    })()}
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  {activeStep > 0 && (
                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                      Quay lại
                    </Button>
                  )}
                  {(() => {
                    // Logic hiển thị button dựa trên trạng thái xét duyệt
                    const eligibleStudents = students.filter(student => {
                      const studentId = student.sinh_vien_id || student.id;

                      // Kiểm tra xem sinh viên đã được xét duyệt chưa
                      const isAlreadyApproved = graduationStatus.approvedStudents.some(
                        approvedStudent => approvedStudent.id === studentId
                      );

                      if (isAlreadyApproved) return false;

                      // Kiểm tra điều kiện tốt nghiệp
                      const graduationInfo = graduationResults[studentId];
                      return graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien;
                    });

                    // Kiểm tra xem có sinh viên nào đã được xét duyệt không
                    const hasApprovedStudents = graduationStatus.approvedCount > 0;

                    if (activeStep === 0) {
                      // Step 0: Luôn hiển thị button "Xét duyệt"
                      return (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={!selectedClass || students.length === 0}
                        >
                          Xét duyệt
                        </Button>
                      );
                    } else if (activeStep === 1) {
                      // Step 1: Hiển thị button tùy theo trạng thái
                      if (eligibleStudents.length > 0) {
                        // Còn sinh viên chưa xét duyệt
                        return (
                          <Button
                            variant="contained"
                            onClick={handleApproveGraduation}
                          >
                            Xét duyệt ({eligibleStudents.length})
                          </Button>
                        );
                      } else if (hasApprovedStudents) {
                        // Tất cả sinh viên đã xét duyệt - không hiển thị button đến Step 3
                        // Chỉ có thể thực hiện các hành động in bằng, xem chi tiết
                        return null;
                      } else {
                        // Không có sinh viên nào đủ điều kiện
                        return null;
                      }
                    } else if (activeStep === 2) {
                      // Step 2: Chỉ hiển thị khi có sinh viên mới được xét duyệt (chưa có sinh viên nào được xét trước đó)
                      // Step này chỉ dành cho trường hợp xét duyệt lần đầu
                      return null;
                    }

                    return null;
                  })()}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
              Điều kiện tốt nghiệp
            </Typography>

            {/* Thiết lập tín chỉ yêu cầu */}
            {selectedCourse && (
              <Box sx={{ mt: 2, mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Thiết lập tín chỉ yêu cầu:
                </Typography>
                <TextField
                  label="Tín chỉ yêu cầu để xét tốt nghiệp"
                  type="number"
                  value={requiredCredits}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setRequiredCredits(value > 0 ? value : 0);
                  }}
                  InputProps={{
                    endAdornment: <Typography variant="body2" color="textSecondary">tín chỉ</Typography>,
                    inputProps: { min: 0 }
                  }}
                  fullWidth
                  size="small"
                  helperText={`Giá trị hiện tại: ${selectedCourse.tong_tin_chi_yeu_cau || 130} tín chỉ`}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateRequiredCredits}
                  disabled={!selectedCourse || requiredCredits === selectedCourse.tong_tin_chi_yeu_cau}
                  fullWidth
                  size="small"
                >
                  Cập nhật tín chỉ yêu cầu
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ fontSize: 16, mr: 1 }} />
                Tích lũy đủ {selectedCourse?.tong_tin_chi_yeu_cau || requiredCredits} tín chỉ
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ fontSize: 16, mr: 1 }} />
                Có đủ các chứng chỉ theo yêu cầu
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
                Hoàn thành tất cả môn học bắt buộc
              </Typography>
            </Box>
          </Paper>

          {/* Thống kê tổng quan */}
          {selectedClass && students.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                📊 Thống kê lớp {selectedClass?.ma_lop}
              </Typography>

              {(() => {
                const totalStudents = students.length;
                const totalEligibleStudents = students.filter(student => {
                  const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                  return graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien;
                });

                const eligibleCount = totalEligibleStudents.length;
                const approvedCount = graduationStatus.approvedCount;
                const pendingCount = eligibleCount - approvedCount;

                const sufficientCreditsCount = students.filter(student => {
                  const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                  return graduationInfo?.dieu_kien_tot_nghiep?.du_tin_chi;
                }).length;

                const sufficientCertificatesCount = students.filter(student => {
                  const graduationInfo = graduationResults[student.sinh_vien_id || student.id];
                  return graduationInfo?.dieu_kien_tot_nghiep?.co_chung_chi_xet_tot_nghiep;
                }).length;

                return (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Tổng số sinh viên:</Typography>
                      <Chip label={totalStudents} color="primary" size="small" />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Đủ điều kiện:</Typography>
                      <Chip
                        label={`${eligibleCount}/${totalStudents}`}
                        color={eligibleCount === totalStudents ? "success" : "warning"}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Đã xét duyệt:</Typography>
                      <Chip
                        label={`${approvedCount}/${eligibleCount}`}
                        color={approvedCount === eligibleCount ? "success" : "info"}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Đủ tín chỉ:</Typography>
                      <Chip
                        label={`${sufficientCreditsCount}/${totalStudents}`}
                        color={sufficientCreditsCount === totalStudents ? "success" : "warning"}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Đủ chứng chỉ:</Typography>
                      <Chip
                        label={`${sufficientCertificatesCount}/${totalStudents}`}
                        color={sufficientCertificatesCount === totalStudents ? "success" : "warning"}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mt: 3, p: 2, bgcolor: pendingCount === 0 ? 'success.light' : 'info.light', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="medium" textAlign="center">
                        {pendingCount === 0
                          ? `🎉 Tất cả sinh viên đủ điều kiện đã được xét duyệt!`
                          : `⏳ Còn ${pendingCount} sinh viên đủ điều kiện chờ xét duyệt`
                        }
                      </Typography>
                    </Box>
                  </Box>
                );
              })()}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Dialog xác nhận */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          {typeof confirmDialog.content === 'string' ? (
            <DialogContentText id="confirm-dialog-description">
              {confirmDialog.content}
            </DialogContentText>
          ) : (
            confirmDialog.content
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DieuKienTotNghiep;