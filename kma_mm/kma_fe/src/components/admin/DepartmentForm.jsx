/* eslint-disable react/prop-types */
// DepartmentForm.jsx
import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { createPhongBan, updatePhongBan } from '../../Api_controller/Service/phongBanService';

const DepartmentForm = ({ department, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    notes: '',
    thuocKhoa: false
  });

  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (department) {
      setFormData({
        code: department.ma_phong_ban || '',  // Hiển thị mã phòng nếu có
        name: department.ten_phong_ban || '',  // Hiển thị tên phòng nếu có
        notes: department.ghi_chu || '',
        thuocKhoa: department.thuoc_khoa || false
      });
    }
  }, [department]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code) newErrors.code = 'Vui lòng nhập mã phòng ban';
    if (!formData.name) newErrors.name = 'Vui lòng nhập tên phòng ban';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const apiCall = department
      ? updatePhongBan(department.ma_phong_ban, formData) // Nếu có `department`, gọi API cập nhật
      : createPhongBan(formData); // Nếu không có, gọi API tạo mới

    apiCall
      .then((response) => {
        onSubmit(response); // Cập nhật danh sách ngay lập tức
        onClose(true); // Đóng form sau khi thành công
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
console.log(formData)
  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>
        {department ? 'Sửa phòng ban' : 'Tạo phòng ban mới'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            name="code"
            label="Mã phòng ban"
            value={formData.code}
            onChange={handleChange}
            error={!!errors.code}
            helperText={errors.code}
            required
            fullWidth
          />
          <TextField
            name="name"
            label="Tên phòng ban"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
          />
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.thuocKhoa}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'thuocKhoa',
                      value: e.target.checked
                    }
                  })}
                />
              }
              label={formData.thuocKhoa ? "Thuộc khoa" : "Thuộc phòng ban"}
            />
          </Grid>
          <TextField
            name="notes"
            label="Ghi chú"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button type="submit" variant="contained" color="primary">
          {department ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default DepartmentForm;