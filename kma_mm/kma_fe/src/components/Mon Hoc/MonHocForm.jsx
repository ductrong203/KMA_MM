import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  CircularProgress,
  MenuItem,
  ListItemText,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { toast } from 'react-toastify';

const MonHocForm = ({ open, onClose, subject, onSubmit, curriculums }) => {
  const [formData, setFormData] = useState({
    id: null,
    ma_mon_hoc: '',
    ten_mon_hoc: '',
    so_tin_chi: 0,
    ghi_chu: '',
    tinh_diem: true,
    curriculumIds: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form data when subject prop changes
  useEffect(() => {
    if (subject) {
      setFormData({ ...subject, curriculumIds: subject.he_dao_tao_id ? [subject.he_dao_tao_id] : [] });
    }
  }, [subject]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.ma_mon_hoc.trim()) {
      newErrors.ma_mon_hoc = 'Mã môn học không được để trống';
    }

    if (!formData.ten_mon_hoc.trim()) {
      newErrors.ten_mon_hoc = 'Tên môn học không được để trống';
    }

    if (formData.so_tin_chi <= 0) {
      newErrors.so_tin_chi = 'Số tín chỉ phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleCurriculumChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      curriculumIds: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra và điền đầy đủ thông tin hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(formData.id ? "Cập nhật môn học thành công!" : "Thêm môn học mới thành công!");
      handleClose(); // Close dialog on success
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu môn học. Vui lòng thử lại!");
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
      <DialogTitle>{formData.id ? 'Cập nhật môn học' : 'Thêm môn học mới'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            name="ma_mon_hoc"
            label="Mã môn học"
            fullWidth
            value={formData.ma_mon_hoc}
            onChange={handleChange}
            error={!!errors.ma_mon_hoc}
            helperText={errors.ma_mon_hoc}
            disabled={loading}
          />
          <TextField
            margin="dense"
            name="ten_mon_hoc"
            label="Tên môn học"
            fullWidth
            value={formData.ten_mon_hoc}
            onChange={handleChange}
            error={!!errors.ten_mon_hoc}
            helperText={errors.ten_mon_hoc}
            disabled={loading}
          />
          <TextField
            margin="dense"
            name="so_tin_chi"
            label="Số tín chỉ"
            type="number"
            fullWidth
            value={formData.so_tin_chi}
            onChange={handleChange}
            error={!!errors.so_tin_chi}
            helperText={errors.so_tin_chi}
            disabled={loading}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Hệ đào tạo</InputLabel>
            <Select
              multiple
              name="curriculumIds"
              value={formData.curriculumIds}
              onChange={handleCurriculumChange}
              renderValue={(selected) =>
                selected.map(id => curriculums.find(c => c.id === id)?.ten_he_dao_tao).join(', ')
              }
            >
              {curriculums.map((curriculum) => (
                <MenuItem key={curriculum.id} value={curriculum.id}>
                  <Checkbox checked={formData.curriculumIds.indexOf(curriculum.id) > -1} />
                  <ListItemText primary={curriculum.ten_he_dao_tao} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="ghi_chu"
            label="Ghi chú"
            fullWidth
            multiline
            rows={2}
            value={formData.ghi_chu}
            onChange={handleChange}
            disabled={loading}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="tinh_diem"
                checked={formData.tinh_diem}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Tính vào điểm trung bình chung"
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

export default MonHocForm;