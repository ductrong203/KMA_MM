import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  FormHelperText
} from '@mui/material';

const MonHocTheoHeDaoTao = ({ open, onClose, mapping, subjects, curriculums, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: null,
    subjectId: '',
    curriculumId: '',
    semester: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form data when mapping prop changes
  useEffect(() => {
    if (mapping) {
      setFormData({ ...mapping });
    }
  }, [mapping]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Vui lòng chọn môn học';
    }
    
    if (!formData.curriculumId) {
      newErrors.curriculumId = 'Vui lòng chọn chương trình đào tạo';
    }
    
    if (formData.semester <= 0) {
      newErrors.semester = 'Học kỳ phải lớn hơn 0';
    }
    
    // Check for duplicate mapping
    if (!formData.id && !newErrors.subjectId && !newErrors.curriculumId) {
      const isDuplicate = subjects.some(
        s => s.subjectId === formData.subjectId && s.curriculumId === formData.curriculumId
      );
      
      if (isDuplicate) {
        newErrors.subjectId = 'Môn học này đã được thêm vào chương trình đào tạo này';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form on close
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formData.id ? 'Cập nhật ánh xạ' : 'Thêm ánh xạ mới'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl 
            fullWidth 
            margin="dense" 
            error={!!errors.subjectId}
            disabled={loading}
          >
            <InputLabel>Môn học</InputLabel>
            <Select
              name="subjectId"
              value={formData.subjectId}
              label="Môn học"
              onChange={handleChange}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.subjectCode} - {subject.subjectName}
                </MenuItem>
              ))}
            </Select>
            {errors.subjectId && <FormHelperText>{errors.subjectId}</FormHelperText>}
          </FormControl>
          
          <FormControl 
            fullWidth 
            margin="dense"
            error={!!errors.curriculumId}
            disabled={loading}
          >
            <InputLabel>Chương trình đào tạo</InputLabel>
            <Select
              name="curriculumId"
              value={formData.curriculumId}
              label="Chương trình đào tạo"
              onChange={handleChange}
            >
              {curriculums.map((curriculum) => (
                <MenuItem key={curriculum.id} value={curriculum.id}>
                  {curriculum.name}
                </MenuItem>
              ))}
            </Select>
            {errors.curriculumId && <FormHelperText>{errors.curriculumId}</FormHelperText>}
          </FormControl>
          
          <TextField
            margin="dense"
            name="semester"
            label="Học kỳ"
            type="number"
            fullWidth
            value={formData.semester}
            onChange={handleChange}
            error={!!errors.semester}
            helperText={errors.semester}
            disabled={loading}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Hủy</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (formData.id ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonHocTheoHeDaoTao;