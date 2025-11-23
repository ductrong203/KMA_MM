import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  Tooltip,
  IconButton,
  Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createGiangVien, updateGiangVien } from '../../Api_controller/Service/giangVienService';
import { getPhongBan } from '../../Api_controller/Service/phongBanService';
import { ToastContainer, toast } from 'react-toastify';

// Hàm chuyển đổi chuỗi thành chữ thường, không dấu, viết liền
const normalizeUsername = (input) => {
  let result = input.toLowerCase();
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/[^a-z0-9]/g, '');
  return result;
};

const FormGiangVien = ({ giangVien, onSubmit, onClose }) => {
  const isEditMode = !!giangVien;
  const [danhSachPhongBan, setDanhSachPhongBan] = useState([]);
  const [errors, setErrors] = useState({
    username: '',
    maGiangVien: '',
    hoTen: '',
    maPhongBan: '',
  });

  const [formData, setFormData] = useState({
    maGiangVien: '',
    username: '',
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
    ngaySinh: '',
    gioiTinh: '',
    maPhongBan: '',
    laGiangVienMoi: 0,
    hocHam: '',
    hocVi: '',
    chuyenMon: '',
    trangThai: 1,
    thuocKhoa: false,
    cccd: '',
    ngayCap: '',
    noiCap: '',
    noiOHienNay: '',
    ngayVaoLam: '',
  });

  useEffect(() => {
    const fetchDanhSachPhongBan = async () => {
      try {
        const response = await getPhongBan();
        setDanhSachPhongBan(response);
      } catch (error) {
        console.error('Error fetching danh sach phong ban:', error);
        toast.error('Lỗi khi tải danh sách phòng ban');
      }
    };
    fetchDanhSachPhongBan();
  }, []);

  useEffect(() => {
    if (giangVien) {
      const phongBan = danhSachPhongBan.find(pb => pb.id === giangVien.phong_ban_id) || {};
      setFormData({
        maGiangVien: giangVien.ma_giang_vien || '',
        hoTen: giangVien.ho_ten || '',
        username: giangVien.username || '',
        email: giangVien.email || '',
        soDienThoai: giangVien.so_dien_thoai || '',
        diaChi: giangVien.dia_chi || '',
        ngaySinh: giangVien.ngay_sinh || '',
        gioiTinh: giangVien.gioi_tinh || '',
        maPhongBan: phongBan.ma_phong_ban || '',
        laGiangVienMoi: giangVien.la_giang_vien_moi ?? 0,
        hocHam: giangVien.hoc_ham || '',
        hocVi: giangVien.hoc_vi || '',
        chuyenMon: giangVien.chuyen_mon || '',
        trangThai: giangVien.trang_thai ?? 1,
        thuocKhoa: giangVien.la_giang_vien_moi === 1 ? null : (giangVien.thuoc_khoa ?? false),
        cccd: giangVien.cccd || '',
        ngayCap: giangVien.ngay_cap || '',
        noiCap: giangVien.noi_cap || '',
        noiOHienNay: giangVien.noi_o_hien_nay || '',
        ngayVaoLam: giangVien.ngay_vao_lam || '',
      });
    }
  }, [giangVien, danhSachPhongBan]);

  const getTenPhongBan = (maPhongBan) => {
    const phongBan = danhSachPhongBan.find(pb =>
      pb.id === maPhongBan || pb.ma_phong_ban === maPhongBan
    );
    return phongBan ? phongBan.ten_phong_ban : 'Không xác định';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      const normalizedValue = normalizeUsername(value);
      setFormData(prev => ({ ...prev, [name]: normalizedValue }));
      setErrors(prev => ({
        ...prev,
        username: normalizedValue.length === 0 && value.length > 0
          ? 'Tên đăng nhập chỉ được chứa chữ cái thường (a-z) và số (0-9), không dấu, không khoảng trắng.'
          : '',
      }));
    } else if (name === 'laGiangVienMoi') {
      const isGiangVienMoi = parseInt(value) === 1;
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value),
        thuocKhoa: isGiangVienMoi ? null : false,
        maPhongBan: isGiangVienMoi ? '' : prev.maPhongBan,
      }));
      setErrors(prev => ({ ...prev, maPhongBan: '' }));
    } else if (name === 'thuocKhoa') {
      if (formData.laGiangVienMoi !== 1) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          maPhongBan: '',
        }));
        setErrors(prev => ({ ...prev, maPhongBan: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      maGiangVien: '',
      username: '',
      hoTen: '',
      maPhongBan: '',
    };
    let isValid = true;

    if (!formData.maGiangVien) {
      newErrors.maGiangVien = 'Mã giảng viên không được để trống.';
      isValid = false;
    }
    if (!formData.username) {
      newErrors.username = 'Tên đăng nhập không được để trống.';
      isValid = false;
    }
    if (!formData.hoTen) {
      newErrors.hoTen = 'Họ và tên không được để trống.';
      isValid = false;
    }
    if (formData.laGiangVienMoi === 0 && !formData.maPhongBan) {
      newErrors.maPhongBan = 'Vui lòng chọn khoa hoặc phòng ban.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    const finalFormData = {
      ...formData,
      thuocKhoa: formData.laGiangVienMoi === 1 ? null : (formData.thuocKhoa ?? false),
    };

    try {
      const apiCall = giangVien
        ? updateGiangVien(giangVien.ma_giang_vien, finalFormData)
        : createGiangVien(finalFormData);
      const response = await apiCall;
      toast.success(isEditMode ? 'Cập nhật giảng viên thành công' : 'Thêm giảng viên thành công');
      onSubmit(response);
      onClose(true);
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error);
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const isCoHuu = formData.laGiangVienMoi === 0;
  const isSmallScreen = useMediaQuery('(max-height: 1200px)');

  const basicFields = (
    <>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Mã giảng viên"
          name="maGiangVien"
          value={formData.maGiangVien}
          onChange={handleChange}
          required
          error={!!errors.maGiangVien}
          helperText={errors.maGiangVien}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Tên đăng nhập"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          error={!!errors.username}
          helperText={errors.username}
          InputProps={{
            endAdornment: (
              <Tooltip title="Tên đăng nhập phải viết thường, không dấu, không khoảng trắng. Ví dụ: Nguyễn Văn A -> nguyenvana">
                <IconButton
                  sx={{
                    backgroundColor: '#e0e0e0',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: '#d0d0d0',
                    },
                  }}
                >
                  <Typography color="primary" fontSize={16}>!</Typography>
                </IconButton>
              </Tooltip>
            ),
          }}
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
          error={!!errors.hoTen}
          helperText={errors.hoTen}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Loại giảng viên</InputLabel>
          <Select
            name="laGiangVienMoi"
            value={formData.laGiangVienMoi}
            onChange={handleChange}
            label="Loại giảng viên"
            required
          >
            <MenuItem value={0}>{formData.thuocKhoa ? 'Giảng viên cơ hữu' : 'Nhân viên'}</MenuItem>
            <MenuItem value={1}>Giảng viên thỉnh giảng</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {isCoHuu && (
        <>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.thuocKhoa}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: 'thuocKhoa',
                        value: e.target.checked,
                      },
                    })
                  }
                  disabled={formData.laGiangVienMoi === 1}
                />
              }
              label={formData.thuocKhoa ? 'Thuộc khoa' : 'Thuộc phòng ban'}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{formData.thuocKhoa ? 'Khoa' : 'Phòng ban'}</InputLabel>
              <Select
                name="maPhongBan"
                value={formData.maPhongBan}
                onChange={handleChange}
                label={formData.thuocKhoa ? 'Khoa' : 'Phòng ban'}
                renderValue={(selected) => getTenPhongBan(selected)}
                required={formData.laGiangVienMoi === 0}
                disabled={formData.laGiangVienMoi === 1}
                error={!!errors.maPhongBan}
              >
                {danhSachPhongBan && danhSachPhongBan.length > 0 ? (
                  danhSachPhongBan
                    .filter((phongBan) => {
                      const isMatchingType = formData.thuocKhoa
                        ? phongBan.thuoc_khoa === 1 || phongBan.thuoc_khoa === true
                        : phongBan.thuoc_khoa === 0 || phongBan.thuoc_khoa === false;
                      return isMatchingType;
                    })
                    .map((phongBan) => (
                      <MenuItem key={phongBan.ma_phong_ban} value={phongBan.ma_phong_ban}>
                        {phongBan.ten_phong_ban}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>Không có dữ liệu</MenuItem>
                )}
              </Select>
              {!!errors.maPhongBan && (
                <Typography color="error" variant="caption">
                  {errors.maPhongBan}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </>
      )}
    </>
  );

  const detailFields = (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
          Thông tin chi tiết
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
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
          label="Số CCCD"
          name="cccd"
          value={formData.cccd}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Ngày cấp"
          name="ngayCap"
          type="date"
          value={formData.ngayCap}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nơi cấp"
          name="noiCap"
          value={formData.noiCap}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nơi ở hiện nay"
          name="noiOHienNay"
          value={formData.noiOHienNay}
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

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Học hàm</InputLabel>
          <Select
            name="hocHam"
            value={formData.hocHam}
            onChange={handleChange}
            label="Học hàm"
          >
            <MenuItem value="">Không chọn</MenuItem>
            <MenuItem value="Phó giáo sư">Phó giáo sư</MenuItem>
            <MenuItem value="Giáo sư">Giáo sư</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Học vị</InputLabel>
          <Select
            name="hocVi"
            value={formData.hocVi}
            onChange={handleChange}
            label="Học vị"
          >
            <MenuItem value="">Không chọn</MenuItem>
            <MenuItem value="Tiến sĩ">Tiến sĩ</MenuItem>
            <MenuItem value="Thạc sĩ">Thạc sĩ</MenuItem>
            <MenuItem value="Kỹ sư">Kỹ sư</MenuItem>
            <MenuItem value="Cử nhân">Cử nhân</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Chuyên môn"
          name="chuyenMon"
          value={formData.chuyenMon}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Ngày vào làm"
          name="ngayVaoLam"
          type="date"
          value={formData.ngayVaoLam}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </>
  );

  return (
    <Card sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <CardHeader
        title={isEditMode ? 'Cập nhật thông tin giảng viên' : 'Thêm giảng viên mới'}
      />
      <Divider />
      <form onSubmit={handleSubmit}>
        <CardContent
          sx={{
            maxHeight: isSmallScreen ? '80vh' : 'unset',
            overflowY: isSmallScreen ? 'auto' : 'unset',
            padding: 3,
            pb: 10,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Thông tin cơ bản</Typography>
            </Grid>
            {basicFields}
            {detailFields}
          </Grid>
        </CardContent>
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            padding: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            zIndex: 1,
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Box>
      </form>
      
    </Card>
  );
};

export default FormGiangVien;