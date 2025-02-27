import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';
import { LOAI_GIANG_VIEN, TRANG_THAI } from '../../constants/teacherTypes';

const FormGiangVien = ({ dataGiangVien, onSubmit, danhSachDonVi, onClose }) => {
  const [formData, setFormData] = useState({
    maGiangVien: '',
    tenDangNhap: '',
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
    ngaySinh: '',
    gioiTinh: 'NAM',
    maDonVi: '',
    loaiGiangVien: LOAI_GIANG_VIEN.CO_HUU,
    hocHam: '',    // Giáo sư, Phó giáo sư
    hocVi: '',     // Tiến sĩ, Thạc sĩ
    chuyenMon: '', // Chuyên môn giảng dạy
    ngayVaoLam: '',
    trangThai: TRANG_THAI.HOAT_DONG,
    thuocKhoa: true, // true: thuộc khoa, false: thuộc phòng
  });

  useEffect(() => {
    if (dataGiangVien) {
      setFormData(dataGiangVien);
    }
  }, [dataGiangVien]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      matKhau: dataGiangVien ? formData.matKhau : '1' // Mật khẩu mặc định là 1
    });
  };

  return (
    <Card>
      <CardHeader
        title={dataGiangVien ? "Cập nhật thông tin giảng viên" : "Thêm giảng viên mới"}
      />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Thông tin cơ bản</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã giảng viên"
                name="maGiangVien"
                value={formData.maGiangVien}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="tenDangNhap"
                value={formData.tenDangNhap}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày sinh"
                name="ngaySinh"
                type="date"
                value={formData.ngaySinh}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Thông tin chuyên môn */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>Thông tin chuyên môn</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại giảng viên</InputLabel>
                <Select
                  name="loaiGiangVien"
                  value={formData.loaiGiangVien}
                  onChange={handleChange}
                  label="Loại giảng viên"
                >
                  <MenuItem value={LOAI_GIANG_VIEN.CO_HUU}>Giảng viên cơ hữu</MenuItem>
                  <MenuItem value={LOAI_GIANG_VIEN.THINH_GIANG}>Giảng viên thỉnh giảng</MenuItem>
                </Select>
              </FormControl>
            </Grid>

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

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{formData.thuocKhoa ? "Khoa" : "Phòng ban"}</InputLabel>
                {/* <Select
                  name="maDonVi"
                  value={formData.maDonVi}
                  onChange={handleChange}
                  label={formData.thuocKhoa ? "Khoa" : "Phòng ban"}
                  required
                >
                  {danhSachDonVi
                    .filter(donVi => donVi.loaiDonVi === (formData.thuocKhoa ? 'KHOA' : 'PHONG'))
                    .map(donVi => (
                      <MenuItem key={donVi.maDonVi} value={donVi.maDonVi}>
                        {donVi.tenDonVi}
                      </MenuItem>
                    ))
                  }
                </Select> */}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Học hàm"
                name="hocHam"
                value={formData.hocHam}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Học vị"
                name="hocVi"
                value={formData.hocVi}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chuyên môn"
                name="chuyenMon"
                value={formData.chuyenMon}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {dataGiangVien ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormGiangVien