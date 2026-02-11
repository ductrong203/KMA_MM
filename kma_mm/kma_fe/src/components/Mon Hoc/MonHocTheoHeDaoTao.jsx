import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, List, ListItem, ListItemText, IconButton,
  FormControl, InputLabel, Select, MenuItem, Paper, Chip, Divider,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox,
  Autocomplete, TextField, Collapse, Badge
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  DndContext,
  closestCenter,
  closestCorners,
  rectIntersection,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  getAllTrainingSystems,
  getBatchesByCurriculumId,
  getAllSubjects,
  getSubjectsByCurriculumId,
  getSubjectPlansByBatch,
  createSubjectPlan,
  deleteSubjectPlan,
  updateSubjectPlan,
  copySubjectPlans
} from '../../Api_controller/Service/keHoachMonHoc';
import { getMissingMonHocInKeHoach, bulkAddToKeHoachMonHoc } from '../../Api_controller/Service/thoiKhoaBieuService';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MonHocTheoHeDaoTao = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [curriculums, setCurriculums] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjectsBySemester, setSubjectsBySemester] = useState({});
  const [initialSubjectsBySemester, setInitialSubjectsBySemester] = useState({});
  const [maxSemesters, setMaxSemesters] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [subjectsByCurriculum, setSubjectsByCurriculum] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    khoa_dao_tao_id: '',
    mon_hoc_ids: [], // Thay đổi từ mon_hoc_id thành mon_hoc_ids (array)
    ky_hoc: '',
    bat_buoc: 0
  });
  const [changedSubjects, setChangedSubjects] = useState([]);
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [copyData, setCopyData] = useState({
    fromKhoaDaoTaoId: '',
    toKhoaDaoTaoId: '',
    heDaoTaoId: ''
  });
  // State cho tính năng phát hiện môn thiếu
  const [missingSubjects, setMissingSubjects] = useState([]);
  const [loadingMissing, setLoadingMissing] = useState(false);
  const [expandMissing, setExpandMissing] = useState(false);
  const role = localStorage.getItem("role") || "";
  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const data = await getAllTrainingSystems();
        setCurriculums(data);
      } catch (error) {
        toast.error('Không thể lấy danh sách hệ đào tạo. Vui lòng thử lại!');
      }
    };
    fetchCurriculums();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      if (selectedCurriculum) {
        try {
          const data = await getBatchesByCurriculumId(selectedCurriculum);
          setBatches(data);
          setSelectedBatch('');
          setSelectedSemester('');
          setSubjectsBySemester({});
          setInitialSubjectsBySemester({});
        } catch (error) {
          toast.error('Không thể lấy danh sách khóa đào tạo. Vui lòng thử lại!');
        }
      }
    };
    fetchBatches();
  }, [selectedCurriculum]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubjects();
        setSubjects(data);
      } catch (error) {
        console.error('Lỗi khi lấy toàn bộ môn học:', error);
        toast.error('Không thể lấy danh sách môn học. Vui lòng thử lại!');
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchSubjectsByCurriculum = async () => {
      if (selectedCurriculum) {
        try {
          const data = await getSubjectsByCurriculumId(selectedCurriculum);
          setSubjectsByCurriculum(data);
        } catch (error) {
          console.error('Lỗi khi lấy môn học theo hệ đào tạo:', error);
          toast.error('Không thể lấy môn học theo hệ đào tạo. Vui lòng thử lại!');
        }
      } else {
        setSubjectsByCurriculum([]);
      }
    };
    fetchSubjectsByCurriculum();
  }, [selectedCurriculum]);

  useEffect(() => {
    if (selectedBatch) {
      const selectedBatchData = batches.find(batch => batch.id === selectedBatch);
      const numSemesters = selectedBatchData?.so_ky_hoc || 9;
      setMaxSemesters(numSemesters);
      setFormData(prev => ({ ...prev, khoa_dao_tao_id: selectedBatch }));

      const fetchSubjectPlans = async () => {
        try {
          const plans = await getSubjectPlansByBatch(selectedBatch);
          const enrichedPlans = plans.map(plan => ({
            ...plan,
            ten_mon_hoc: subjects.find(subject => subject.id === plan.mon_hoc_id)?.ten_mon_hoc || 'Không xác định'
          }));
          const subjectsPerSemester = {};
          for (let ky = 1; ky <= numSemesters; ky++) {
            subjectsPerSemester[ky] = enrichedPlans.filter(subject => subject.ky_hoc === ky);
          }
          setSubjectsBySemester(subjectsPerSemester);
          setInitialSubjectsBySemester(JSON.parse(JSON.stringify(subjectsPerSemester)));
        } catch (error) {
          console.error('Lỗi khi lấy kế hoạch môn học:', error);
          toast.error('Không thể lấy kế hoạch môn học. Vui lòng thử lại!');
        }
      };
      fetchSubjectPlans();

      // Fetch missing subjects
      const fetchMissingSubjects = async () => {
        setLoadingMissing(true);
        try {
          const result = await getMissingMonHocInKeHoach(selectedBatch);
          setMissingSubjects(result.data || []);
        } catch (error) {
          console.error('Lỗi khi kiểm tra môn thiếu:', error);
          setMissingSubjects([]);
        } finally {
          setLoadingMissing(false);
        }
      };
      fetchMissingSubjects();
    }
  }, [selectedBatch, batches, subjects]);

  const handleCurriculumChange = (event) => setSelectedCurriculum(event.target.value);
  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
    setSelectedSemester('');
  };
  const handleSemesterChange = (event) => setSelectedSemester(event.target.value);

  const handleRemoveSubject = async (semester, subjectId) => {
    if (!semester || !subjectId) {
      console.error('Thiếu tham số:', { semester, subjectId });
      toast.error('Lỗi: Thiếu thông tin cần thiết để xóa môn học');
      return;
    }
    // Thêm alert xác nhận trước khi xóa
    const isConfirmed = window.confirm('Bạn có muốn xóa môn học này không?');

    if (!isConfirmed) {
      return; // Nếu người dùng chọn Cancel thì không thực hiện xóa
    }

    try {
      console.log('Đang xóa môn học:', { semester, subjectId });
      await deleteSubjectPlan(subjectId);
      setSubjectsBySemester(prev => ({
        ...prev,
        [semester]: prev[semester].filter(subject => subject.id !== subjectId)
      }));
      setInitialSubjectsBySemester(prev => ({
        ...prev,
        [semester]: prev[semester].filter(subject => subject.id !== subjectId)
      }));
      toast.success('Xóa môn học khỏi kế hoạch thành công!');
    } catch (error) {
      console.error('Chi tiết lỗi khi xóa môn học:', error);
      toast.error('Không thể xóa môn học. Vui lòng thử lại!');
    }
  };

  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({ khoa_dao_tao_id: selectedBatch, mon_hoc_ids: [], ky_hoc: '', bat_buoc: 0 });
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.mon_hoc_ids.length === 0) {
      toast.error('Vui lòng chọn ít nhất một môn học!');
      return;
    }

    try {
      // Tạo promise cho tất cả môn học được chọn
      const createPromises = formData.mon_hoc_ids.map(mon_hoc_id =>
        createSubjectPlan({
          ...formData,
          mon_hoc_id: mon_hoc_id
        })
      );

      const results = await Promise.all(createPromises);

      // Cập nhật state với tất cả môn học mới
      const newSubjects = results.map((newSubjectPlan, index) => ({
        ...newSubjectPlan,
        ten_mon_hoc: subjects.find(s => s.id === formData.mon_hoc_ids[index])?.ten_mon_hoc || 'Không xác định'
      }));

      setSubjectsBySemester(prev => ({
        ...prev,
        [formData.ky_hoc]: [...(prev[formData.ky_hoc] || []), ...newSubjects]
      }));

      setInitialSubjectsBySemester(prev => ({
        ...prev,
        [formData.ky_hoc]: [...(prev[formData.ky_hoc] || []), ...newSubjects]
      }));

      toast.success(`Đã thêm thành công ${newSubjects.length} môn học vào kế hoạch!`);
      handleCloseForm();
    } catch (error) {
      console.error('Lỗi khi thêm kế hoạch:', error);
      toast.error('Có lỗi xảy ra khi thêm kế hoạch môn học!');
    }
  };

  const handleResetSemester = () => setSelectedSemester('');

  // Thêm hàm tính tổng tín chỉ cho từng học kỳ
  const getCreditsBySemester = (semester) => {
    const semesterSubjects = subjectsBySemester[semester] || [];
    return semesterSubjects.reduce((total, subject) => {
      const subjectData = subjects.find(s => s.id === subject.mon_hoc_id);
      return total + (subjectData?.so_tin_chi || 0);
    }, 0);
  };

  // Cập nhật hàm getTotalSubjects để trả về cả số môn học và tín chỉ
  const getTotalSubjects = () => {
    return Object.values(subjectsBySemester).reduce((total, subjects) => total + subjects.length, 0);
  };

  const getTotalCredits = () => {
    return Object.values(subjectsBySemester).reduce((total, semesterSubjects) => {
      const semesterCredits = semesterSubjects.reduce((semTotal, subject) => {
        const subjectData = subjects.find(s => s.id === subject.mon_hoc_id);
        return semTotal + (subjectData?.so_tin_chi || 0);
      }, 0);
      return total + semesterCredits;
    }, 0);
  };

  const DraggableSubject = ({ subject, semester }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: subject.id
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.7 : 1,
      zIndex: isDragging ? 1000 : 'auto'
    };

    const handleDelete = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleRemoveSubject(semester, subject.id);
    };

    // Lấy thông tin tín chỉ từ subjects
    const subjectData = subjects.find(s => s.id === subject.mon_hoc_id);
    const credits = subjectData?.so_tin_chi || 0;

    return (
      <ListItem
        ref={setNodeRef}
        style={style}
        sx={{
          border: isDragging ? '2px solid #1976d2' : '1px solid transparent',
          borderRadius: 1,
          backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            cursor: 'grab'
          },
          py: 0.5,
          px: 1,
          alignItems: 'flex-start'
        }}
        secondaryAction={
          <IconButton
            edge="end"
            onClick={handleDelete}
            size="small"
            sx={{
              opacity: 0.7,
              mt: 0.5,
              '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(244, 67, 54, 0.1)'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            cursor: isDragging ? 'grabbing' : 'grab',
            py: 1,
            borderRadius: 1,
            pr: 1 // Thêm padding right để không đè lên icon xóa
          }}
        >
          <ListItemText
            primary={
              <Typography variant="body2" sx={{
                fontWeight: 500,
                mb: 0.5,
                lineHeight: 1.3
              }}>
                {subject.ten_mon_hoc}
              </Typography>
            }
            secondary={
              <Box sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <Chip
                  label={`${subject.bat_buoc ? 'Bắt buộc' : 'Tùy chọn'}`}
                  size="small"
                  color={subject.bat_buoc ? 'primary' : 'default'}
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
                <Chip
                  label={`${credits} TC`}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: 'success.main',
                    borderColor: 'success.main',
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>
            }
            sx={{
              margin: 0,
              '& .MuiListItemText-primary': { mb: 0.5 },
              '& .MuiListItemText-secondary': { mt: 0 }
            }}
          />
        </Box>
      </ListItem>
    );
  };

  const SemesterDroppable = ({ semester, subjects }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `droppable-${semester}`,
      data: {
        current: {
          semester: parseInt(semester)
        }
      }
    });

    const semesterCredits = getCreditsBySemester(semester);

    return (
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Paper
          ref={setNodeRef}
          sx={{
            p: 2,
            minHeight: 280,
            borderRadius: 3,
            elevation: isOver ? 6 : 3,
            border: isOver ? '3px solid #1976d2' : '1px solid #e0e0e0',
            backgroundColor: isOver ? '#e3f2fd' : 'white',
            transition: 'all 0.2s ease',
            position: 'relative',
            '&::after': isOver ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              borderRadius: 3,
              pointerEvents: 'none',
              zIndex: 1
            } : {}
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1565C0" }}>
              Học kỳ {semester}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Chip
                label={`${subjects.length} môn`}
                size="small"
                sx={{
                  backgroundColor: subjects.length > 0 ? '#e3f2fd' : '#f5f5f5',
                  color: subjects.length > 0 ? '#1565C0' : '#757575',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label={`${semesterCredits} TC`}
                size="small"
                variant="outlined"
                sx={{
                  color: semesterCredits > 0 ? '#1565C0' : '#757575',
                  borderColor: semesterCredits > 0 ? '#1565C0' : '#757575',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {isOver && subjects.length > 0 && (
            <Box sx={{
              position: 'absolute',
              top: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'primary.main',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: 'bold',
              zIndex: 2,
              boxShadow: 2
            }}>
              📚 Thả môn học vào đây
            </Box>
          )}

          <Box sx={{ position: 'relative', minHeight: 200 }}>
            {subjects.length > 0 ? (
              <>
                <List dense sx={{
                  pb: 3,
                  '& .MuiListItem-root': {
                    mb: 1
                  }
                }}>
                  {subjects.map(subject => (
                    <DraggableSubject key={subject.id} subject={subject} semester={semester} />
                  ))}
                </List>

                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  backgroundColor: isOver ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  border: isOver ? '2px dashed #1976d2' : '2px dashed transparent',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {isOver && (
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                      Thả vào đây
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: "center",
                border: isOver ? '2px dashed #1976d2' : '2px dashed #e0e0e0',
                borderRadius: 2,
                backgroundColor: isOver ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                transition: 'all 0.2s ease'
              }}>
                {isOver ? (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      📚
                    </Typography>
                    <Typography variant="body1" color="primary.main" fontWeight="bold">
                      Thả môn học vào đây
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có môn học
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;

    let overSemester;
    if (typeof over.id === 'string') {
      overSemester = over.id.replace('droppable-', '');
    } else if (over.data?.current?.semester) {
      overSemester = over.data.current.semester;
    } else {
      console.error('Không thể xác định kỳ học đích', over);
      return;
    }

    const activeSemester = Object.keys(subjectsBySemester).find(sem =>
      subjectsBySemester[sem].some(subject => subject.id === activeId)
    );

    if (activeSemester && activeSemester !== overSemester) {
      const subjectToMove = subjectsBySemester[activeSemester].find(s => s.id === activeId);
      setSubjectsBySemester(prev => ({
        ...prev,
        [activeSemester]: prev[activeSemester].filter(s => s.id !== activeId),
        [overSemester]: [...(prev[overSemester] || []), { ...subjectToMove, ky_hoc: parseInt(overSemester) }]
      }));
      setChangedSubjects(prev => [...prev.filter(s => s.id !== subjectToMove.id),
      { ...subjectToMove, ky_hoc: parseInt(overSemester) }]);
    }
  };

  const handleConfirmChanges = async () => {
    try {
      const updates = changedSubjects.map(subject =>
        updateSubjectPlan(subject.id, { ...subject, ky_hoc: subject.ky_hoc })
      );
      await Promise.all(updates);
      setInitialSubjectsBySemester(JSON.parse(JSON.stringify(subjectsBySemester)));
      setChangedSubjects([]);
      alert('Cập nhật kỳ học thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật kỳ học:', error);
    }
  };

  const handleCancelChanges = () => {
    setSubjectsBySemester(JSON.parse(JSON.stringify(initialSubjectsBySemester)));
    setChangedSubjects([]);
  };

  const handleOpenCopyDialog = () => {
    setCopyData({
      fromKhoaDaoTaoId: selectedBatch,
      toKhoaDaoTaoId: '',
      heDaoTaoId: selectedCurriculum
    });
    setOpenCopyDialog(true);
  };

  const handleCloseCopyDialog = () => {
    setOpenCopyDialog(false);
    setCopyData({
      fromKhoaDaoTaoId: '',
      toKhoaDaoTaoId: '',
      heDaoTaoId: ''
    });
  };

  const handleCopyFormChange = (event) => {
    const { name, value } = event.target;
    setCopyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopySubmit = async () => {
    if (!copyData.fromKhoaDaoTaoId || !copyData.toKhoaDaoTaoId || !copyData.heDaoTaoId) {
      toast.error('Vui lòng chọn đầy đủ thông tin!');
      return;
    }

    if (copyData.fromKhoaDaoTaoId === copyData.toKhoaDaoTaoId) {
      toast.error('Không thể sao chép trong cùng một khóa đào tạo!');
      return;
    }

    try {
      const result = await copySubjectPlans(
        parseInt(copyData.fromKhoaDaoTaoId),
        parseInt(copyData.toKhoaDaoTaoId),
        parseInt(copyData.heDaoTaoId)
      );

      if (result.success) {
        toast.success(`${result.data.message}. Đã sao chép ${result.data.copied}/${result.data.total} môn học!`);
        handleCloseCopyDialog();
      } else {
        toast.error('Có lỗi xảy ra khi sao chép kế hoạch môn học!');
      }
    } catch (error) {
      console.error('Lỗi khi sao chép kế hoạch:', error);
      toast.error('Không thể sao chép kế hoạch môn học. Vui lòng thử lại!');
    }
  };

  // Xử lý thêm một môn thiếu vào KHMH
  const handleAddMissingSubject = async (subject) => {
    try {
      const result = await bulkAddToKeHoachMonHoc([{
        khoa_dao_tao_id: selectedBatch,
        mon_hoc_id: subject.mon_hoc_id,
        ky_hoc: subject.ky_hoc,
        bat_buoc: 0
      }]);

      if (result.success) {
        toast.success(`Đã thêm môn "${subject.ten_mon_hoc}" vào kế hoạch kỳ ${subject.ky_hoc}`);
        // Refresh missing subjects
        const updatedMissing = await getMissingMonHocInKeHoach(selectedBatch);
        setMissingSubjects(updatedMissing.data || []);
        // Refresh subject plans
        const plans = await getSubjectPlansByBatch(selectedBatch);
        const enrichedPlans = plans.map(plan => ({
          ...plan,
          ten_mon_hoc: subjects.find(s => s.id === plan.mon_hoc_id)?.ten_mon_hoc || 'Không xác định'
        }));
        const subjectsPerSemester = {};
        for (let ky = 1; ky <= maxSemesters; ky++) {
          subjectsPerSemester[ky] = enrichedPlans.filter(s => s.ky_hoc === ky);
        }
        setSubjectsBySemester(subjectsPerSemester);
      }
    } catch (error) {
      console.error('Lỗi khi thêm môn:', error);
      toast.error('Không thể thêm môn học. Vui lòng thử lại!');
    }
  };

  // Xử lý thêm tất cả môn thiếu vào KHMH
  const handleAddAllMissingSubjects = async () => {
    if (missingSubjects.length === 0) return;

    try {
      const items = missingSubjects.map(subject => ({
        khoa_dao_tao_id: selectedBatch,
        mon_hoc_id: subject.mon_hoc_id,
        ky_hoc: subject.ky_hoc,
        bat_buoc: 0
      }));

      const result = await bulkAddToKeHoachMonHoc(items);

      if (result.success) {
        toast.success(result.message);
        // Refresh missing subjects
        const updatedMissing = await getMissingMonHocInKeHoach(selectedBatch);
        setMissingSubjects(updatedMissing.data || []);
        // Refresh subject plans
        const plans = await getSubjectPlansByBatch(selectedBatch);
        const enrichedPlans = plans.map(plan => ({
          ...plan,
          ten_mon_hoc: subjects.find(s => s.id === plan.mon_hoc_id)?.ten_mon_hoc || 'Không xác định'
        }));
        const subjectsPerSemester = {};
        for (let ky = 1; ky <= maxSemesters; ky++) {
          subjectsPerSemester[ky] = enrichedPlans.filter(s => s.ky_hoc === ky);
        }
        setSubjectsBySemester(subjectsPerSemester);
      }
    } catch (error) {
      console.error('Lỗi khi thêm tất cả môn:', error);
      toast.error('Không thể thêm môn học. Vui lòng thử lại!');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
        Quản lý kế hoạch môn học theo hệ đào tạo
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          Bộ lọc
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="medium">
              <InputLabel>Hệ đào tạo</InputLabel>
              <Select
                value={selectedCurriculum}
                label="Hệ đào tạo"
                onChange={handleCurriculumChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {curriculums.map((curriculum) => (
                  <MenuItem key={curriculum.id} value={curriculum.id}>
                    {curriculum.ten_he_dao_tao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="medium" disabled={!selectedCurriculum}>
              <InputLabel>Khóa đào tạo</InputLabel>
              <Select
                value={selectedBatch}
                label="Khóa đào tạo"
                onChange={handleBatchChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {batches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.ten_khoa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="medium" disabled={!selectedBatch}>
              <InputLabel>Kỳ học</InputLabel>
              <Select
                value={selectedSemester}
                label="Kỳ học"
                onChange={handleSemesterChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((ky) => (
                  <MenuItem key={ky} value={ky}>Học kỳ {ky}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{
              display: 'flex',
              gap: 2,
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              flexWrap: 'wrap'
            }}>
              {(role !== "examination" && role !== "student_manage") && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenForm}
                    disabled={!selectedBatch}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Tạo kế hoạch
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleOpenCopyDialog}
                    disabled={!selectedBatch}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Sao chép kế hoạch
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Compact Alert Bar - Hiển thị khi có môn thiếu */}
      {selectedBatch && missingSubjects.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #ff9800'
          }}
        >
          {/* Header - Luôn hiển thị */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              bgcolor: '#fff3e0',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#ffe0b2' }
            }}
            onClick={() => setExpandMissing(!expandMissing)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon sx={{ color: '#e65100', fontSize: 22 }} />
              <Typography variant="body1" sx={{ color: '#e65100', fontWeight: 600 }}>
                Phát hiện {missingSubjects.length} môn thiếu trong Kế hoạch
              </Typography>
              <Chip
                label="Chưa thể nhập điểm"
                size="small"
                sx={{ bgcolor: '#ffcc80', color: '#e65100', fontSize: '0.7rem', height: 20 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                color="warning"
                onClick={(e) => { e.stopPropagation(); handleAddAllMissingSubjects(); }}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Thêm tất cả
              </Button>
              <IconButton size="small">
                {expandMissing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Content - Có thể thu gọn */}
          <Collapse in={expandMissing}>
            <Divider />
            <Box sx={{ maxHeight: 250, overflow: 'auto', bgcolor: 'white' }}>
              <List dense>
                {missingSubjects.map((subject, index) => (
                  <ListItem
                    key={`${subject.mon_hoc_id}_${subject.ky_hoc}`}
                    divider={index < missingSubjects.length - 1}
                    sx={{ py: 1 }}
                    secondaryAction={
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() => handleAddMissingSubject(subject)}
                        sx={{ textTransform: 'none', fontSize: '0.7rem', py: 0.25 }}
                      >
                        Thêm
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {subject.ten_mon_hoc}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          <Chip label={subject.ma_mon_hoc} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                          <Chip label={`Kỳ ${subject.ky_hoc}`} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                          <Chip label={`${subject.so_tin_chi} TC`} size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        </Paper>
      )}

      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 600
        }}>
          Thêm kế hoạch môn học
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Kỳ học</InputLabel>
              <Select
                name="ky_hoc"
                value={formData.ky_hoc}
                onChange={handleFormChange}
                required
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Chọn kỳ học</MenuItem>
                {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(ky => (
                  <MenuItem key={ky} value={ky}>Học kỳ {ky}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <Autocomplete
                multiple
                options={subjectsByCurriculum.filter(subject => {
                  // Lọc bỏ những môn đã có trong kế hoạch của BẤT KỲ kỳ nào
                  const allPlannedMonHocIds = Object.values(subjectsBySemester)
                    .flat()
                    .map(existing => existing.mon_hoc_id);
                  return !allPlannedMonHocIds.includes(subject.id);
                })}
                getOptionLabel={(option) => option.ten_mon_hoc}
                value={formData.mon_hoc_ids.map(id =>
                  subjectsByCurriculum.find(subject => subject.id === id)
                ).filter(Boolean)}
                onChange={(event, newValue) => {
                  const selectedIds = newValue.map(subject => subject.id);
                  setFormData(prev => ({
                    ...prev,
                    mon_hoc_ids: selectedIds
                  }));
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const subjectData = subjects.find(s => s.id === option.id);
                    const credits = subjectData?.so_tin_chi || 0;
                    return (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={`${option.ten_mon_hoc} (${credits} TC)`}
                        size="small"
                        sx={{
                          backgroundColor: 'primary.light',
                          color: 'white',
                          '& .MuiChip-deleteIcon': {
                            color: 'white'
                          }
                        }}
                      />
                    );
                  })
                }
                renderOption={(props, option, { selected }) => {
                  const subjectData = subjects.find(s => s.id === option.id);
                  const credits = subjectData?.so_tin_chi || 0;
                  return (
                    <li {...props}>
                      <Checkbox
                        checked={selected}
                        sx={{ mr: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {option.ten_mon_hoc}
                        </Typography>
                        <Chip
                          label={`${credits} TC`}
                          size="small"
                          variant="outlined"
                          sx={{
                            ml: 1,
                            height: 20,
                            fontSize: '0.65rem',
                            color: 'primary.main',
                            borderColor: 'primary.main'
                          }}
                        />
                      </Box>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Môn học"
                    placeholder="Tìm kiếm và chọn môn học..."
                    required={formData.mon_hoc_ids.length === 0}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                    helperText={`${formData.mon_hoc_ids.length} môn học đã chọn`}
                  />
                )}
                noOptionsText="Không tìm thấy môn học phù hợp"
                filterOptions={(options, { inputValue }) => {
                  // Custom filter để tìm kiếm cả tên môn học và mã môn học
                  const filterValue = inputValue.toLowerCase();
                  return options.filter(option =>
                    option.ten_mon_hoc.toLowerCase().includes(filterValue) ||
                    (option.ma_mon_hoc && option.ma_mon_hoc.toLowerCase().includes(filterValue))
                  );
                }}
                sx={{
                  '& .MuiAutocomplete-tag': {
                    maxWidth: '100%'
                  }
                }}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
              <Checkbox
                name="bat_buoc"
                checked={formData.bat_buoc === 1}
                onChange={handleFormChange}
                sx={{ mr: 1 }}
              />
              <Typography component="span" variant="body1">
                Môn học bắt buộc (áp dụng cho tất cả môn được chọn)
              </Typography>
            </Box>

            {formData.mon_hoc_ids.length > 0 && (
              <Box sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Tóm tắt:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    label={`${formData.mon_hoc_ids.length} môn học`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${formData.mon_hoc_ids.reduce((total, id) => {
                      const subject = subjects.find(s => s.id === id);
                      return total + (subject?.so_tin_chi || 0);
                    }, 0)} tín chỉ`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={formData.bat_buoc ? 'Bắt buộc' : 'Tùy chọn'}
                    size="small"
                    color={formData.bat_buoc ? 'primary' : 'default'}
                  />
                </Box>
              </Box>
            )}
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseForm}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formData.mon_hoc_ids.length === 0}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Thêm {formData.mon_hoc_ids.length > 0 ? `(${formData.mon_hoc_ids.length} môn)` : ''}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCopyDialog}
        onClose={handleCloseCopyDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          Sao chép kế hoạch môn học
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sao chép kế hoạch môn học từ khóa hiện tại sang khóa đào tạo khác
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Từ khóa đào tạo</InputLabel>
            <Select
              name="fromKhoaDaoTaoId"
              value={copyData.fromKhoaDaoTaoId}
              onChange={handleCopyFormChange}
              disabled
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.ten_khoa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Đến khóa đào tạo</InputLabel>
            <Select
              name="toKhoaDaoTaoId"
              value={copyData.toKhoaDaoTaoId}
              onChange={handleCopyFormChange}
              required
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            >
              <MenuItem value="">Chọn khóa đào tạo đích</MenuItem>
              {batches
                .filter(batch => batch.id !== selectedBatch)
                .map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.ten_khoa}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Box sx={{
            mt: 3,
            p: 2,
            backgroundColor: 'grey.100',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              <strong>Lưu ý:</strong> Các môn học đã tồn tại trong khóa đích sẽ được bỏ qua
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseCopyDialog}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCopySubmit}
            variant="contained"
            startIcon={<ContentCopyIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Sao chép
          </Button>
        </DialogActions>
      </Dialog>

      {selectedBatch && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                📚 Tổng kết
              </Typography>
              <Chip
                label={`${getTotalSubjects()} môn học`}
                variant="outlined"
                color="primary"
                sx={{
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
              <Chip
                label={`${getTotalCredits()} tín chỉ`}
                variant="filled"
                color="primary"
                sx={{
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedSemester && (
                <Button
                  variant="outlined"
                  onClick={handleResetSemester}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Hiển thị tất cả kỳ
                </Button>
              )}
              {changedSubjects.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    onClick={handleConfirmChanges}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Xác nhận thay đổi ({changedSubjects.length})
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancelChanges}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Hủy thay đổi
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragEnd={handleDragEnd}
            onDragOver={({ over }) => {
              if (over) {
                console.log('Dragging over:', over.id);
              }
            }}
          >
            <Grid container spacing={2}>
              {selectedSemester ? (
                <SemesterDroppable semester={selectedSemester} subjects={subjectsBySemester[selectedSemester] || []} />
              ) : (
                Object.keys(subjectsBySemester).map(semester => (
                  <SemesterDroppable key={semester} semester={semester} subjects={subjectsBySemester[semester]} />
                ))
              )}
            </Grid>
          </DndContext>
        </Box>
      )}
    </Box>
  );
};

export default MonHocTheoHeDaoTao;