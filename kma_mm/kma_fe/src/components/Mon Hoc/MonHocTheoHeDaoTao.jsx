import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, List, ListItem, ListItemText, IconButton,
  FormControl, InputLabel, Select, MenuItem, Paper, Chip, Divider,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
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
  updateSubjectPlan
} from '../../Api_controller/Service/keHoachMonHoc';

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
    mon_hoc_id: '',
    ky_hoc: '',
    bat_buoc: 0
  });
  const [changedSubjects, setChangedSubjects] = useState([]);
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
    }
  }, [selectedBatch, batches, subjects]);

  const handleCurriculumChange = (event) => setSelectedCurriculum(event.target.value);
  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
    setSelectedSemester('');
  };
  const handleSemesterChange = (event) => setSelectedSemester(event.target.value);

  const handleRemoveSubject = async (semester, subjectId) => {
    try {
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
      console.error('Lỗi khi xóa môn học:', error);
      toast.error('Không thể xóa môn học. Vui lòng thử lại!');
    }
  };

  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({ khoa_dao_tao_id: selectedBatch, mon_hoc_id: '', ky_hoc: '', bat_buoc: 0 });
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
    try {
      const newSubjectPlan = await createSubjectPlan(formData);
      const newSubject = {
        ...newSubjectPlan,
        ten_mon_hoc: subjects.find(s => s.id === formData.mon_hoc_id)?.ten_mon_hoc || 'Không xác định'
      };
      setSubjectsBySemester(prev => ({
        ...prev,
        [formData.ky_hoc]: [...(prev[formData.ky_hoc] || []), newSubject]
      }));
      setInitialSubjectsBySemester(prev => ({
        ...prev,
        [formData.ky_hoc]: [...(prev[formData.ky_hoc] || []), newSubject]
      }));
      handleCloseForm();
    } catch (error) {
      console.error('Lỗi khi thêm kế hoạch:', error);
    }
  };

  const handleResetSemester = () => setSelectedSemester('');

  const DraggableSubject = ({ subject, semester }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subject.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: 'grab'
    };

    return (
      <ListItem
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        secondaryAction={
          <IconButton edge="end" onClick={() => handleRemoveSubject(semester, subject.id)}>
            <DeleteIcon />
          </IconButton>
        }
      >
        <ListItemText
          primary={subject.ten_mon_hoc}
          secondary={<Chip label={`${subject.bat_buoc ? 'Bắt buộc' : 'Tùy chọn'}`} size="small" color={subject.bat_buoc ? 'primary' : 'default'} />}
        />
      </ListItem>
    );
  };

  const SemesterDroppable = ({ semester, subjects }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `droppable-${semester}`,
      data: { semester }
    });

    const style = {
      backgroundColor: isOver ? '#e0f7fa' : 'white',
    };

    return (
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Paper ref={setNodeRef} style={style} sx={{ p: 2, height: "100%", borderRadius: 3, elevation: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: "center", fontWeight: 600, color: "#1565C0" }}>
            Học kỳ {semester}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {subjects.length > 0 ? (
            <List>
              {subjects.map(subject => (
                <DraggableSubject key={subject.id} subject={subject} semester={semester} />
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
              Chưa có môn học
            </Typography>
          )}
        </Paper>
      </Grid>
    );
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overSemester = over.id.replace('droppable-', '');
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
      setChangedSubjects(prev => [...prev.filter(s => s.id !== subjectToMove.id), { ...subjectToMove, ky_hoc: parseInt(overSemester) }]);
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

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Hệ đào tạo</InputLabel>
            <Select value={selectedCurriculum} label="Hệ đào tạo" onChange={handleCurriculumChange}>
              {curriculums.map((curriculum) => (
                <MenuItem key={curriculum.id} value={curriculum.id}>
                  {curriculum.ten_he_dao_tao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth disabled={!selectedCurriculum}>
            <InputLabel>Khóa đào tạo</InputLabel>
            <Select value={selectedBatch} label="Khóa đào tạo" onChange={handleBatchChange}>
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.ten_khoa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <FormControl fullWidth disabled={!selectedBatch}>
            <InputLabel>Kỳ học</InputLabel>
            <Select value={selectedSemester} label="Kỳ học" onChange={handleSemesterChange}>
              {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((ky) => (
                <MenuItem key={ky} value={ky}>Học kỳ {ky}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          {(role !== "examination" && role !== "student_manage") && (
            <Button variant="contained" onClick={handleOpenForm} disabled={!selectedBatch}>
              Tạo kế hoạch
            </Button>
          )}
        </Grid>
      </Grid>

      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>Thêm kế hoạch môn học</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Kỳ học</InputLabel>
              <Select name="ky_hoc" value={formData.ky_hoc} onChange={handleFormChange} required>
                <MenuItem value="">Chọn kỳ học</MenuItem>
                {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(ky => (
                  <MenuItem key={ky} value={ky}>Học kỳ {ky}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Môn học</InputLabel>
              <Select name="mon_hoc_id" value={formData.mon_hoc_id} onChange={handleFormChange} required>
                <MenuItem value="">Chọn môn học</MenuItem>
                {subjectsByCurriculum.map(subject => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.ten_mon_hoc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Checkbox name="bat_buoc" checked={formData.bat_buoc === 1} onChange={handleFormChange} />
              <Typography component="span">Bắt buộc</Typography>
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>

      {selectedBatch && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Danh sách môn học theo kỳ
            </Typography>
            <Box>
              {selectedSemester && (
                <Button variant="outlined" onClick={handleResetSemester} sx={{ mr: 2 }}>
                  Trở về trạng thái bình thường
                </Button>
              )}
              {changedSubjects.length > 0 && (
                <>
                  <Button variant="contained" onClick={handleConfirmChanges} sx={{ mr: 2 }}>
                    Xác nhận thay đổi
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleCancelChanges}>
                    Hủy thay đổi
                  </Button>
                </>
              )}
            </Box>
          </Box>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
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