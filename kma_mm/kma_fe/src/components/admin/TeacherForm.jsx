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
  useMediaQuery
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createGiangVien, updateGiangVien } from '../../Api_controller/Service/giangVienService';
import { getPhongBan } from '../../Api_controller/Service/phongBanService';

const FormGiangVien = ({ giangVien, onSubmit, onClose }) => {
  const isEditMode = !!giangVien;
  const [danhSachPhongBan, setDanhSachPhongBan] = useState([]);

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
    thuocKhoa: null,
  });
  useEffect(() => {
    const fetchDanhSachPhongBan = async () => {
      try {
        const response = await getPhongBan(); // Giả sử API trả về một danh sách phòng ban
        setDanhSachPhongBan(response); // Cập nhật danh sách phòng ban vào state
      } catch (error) {
        console.error('Error fetching danh sach phong ban:', error);
      }
    };
    fetchDanhSachPhongBan();
  }, []); // Chạy một lần khi component mount
  useEffect(() => {
    if (giangVien ) {
      const phongBan = danhSachPhongBan.find(pb => pb.id === giangVien.phong_ban_id) || {};

      setFormData({
        maGiangVien: giangVien.ma_giang_vien,
        hoTen: giangVien.ho_ten,
        username: giangVien.username,
        email: giangVien.email,
        soDienThoai: giangVien.so_dien_thoai,
        diaChi: giangVien.dia_chi,
        ngaySinh: giangVien.ngau_sinh,
        gioiTinh: giangVien.gioi_tinh,
        maPhongBan: phongBan.ma_phong_ban,
        laGiangVienMoi: giangVien.la_giang_vien_moi,
        hocHam: giangVien.hoc_ham,
        hocVi: giangVien.hoc_vi,
        chuyenMon: giangVien.chuyen_mon,
        trangThai: giangVien.trang_thai,
        thuocKhoa: giangVien.thuoc_khoa,
      });

    }
  }, [giangVien, danhSachPhongBan]);

  const getTenPhongBan = (maPhongBan) => {
    const phongBan = danhSachPhongBan.find(pb =>
      pb.id === maPhongBan || pb.ma_phong_ban === maPhongBan
    );
    return phongBan ? phongBan.ten_phong_ban : "Không xác định";
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiCall = giangVien
      ? updateGiangVien(giangVien.ma_giang_vien, formData)
      : createGiangVien(formData); // Nếu không có, gọi API tạo mới

    apiCall
      .then((response) => {
        onSubmit(response); // Cập nhật danh sách ngay lập tức
        onClose(true); // Đóng form sau khi thành công
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const isCoHuu = formData.laGiangVienMoi === 0;

  // Các trường bắt buộc khi tạo mới
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
        <FormControl fullWidth>
          <InputLabel>Loại giảng viên</InputLabel>
          <Select
            name="laGiangVienMoi"
            value={formData.laGiangVienMoi}
            onChange={handleChange}
            label="Loại giảng viên"
            required
          >
            <MenuItem value={0}>Giảng viên cơ hữu</MenuItem>
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
              <Select
                name="maPhongBan"
                value={formData.maPhongBan}
                onChange={handleChange}
                label={formData.thuocKhoa ? "Khoa" : "Phòng ban"}
                renderValue={(selected) => getTenPhongBan(selected)}
                required
              >
                {danhSachPhongBan && danhSachPhongBan.length > 0 ? (
                  danhSachPhongBan
                    .filter(phongBan => {
                      const isMatchingType = formData.thuocKhoa ?
                        (phongBan.thuoc_khoa === 1 || phongBan.thuoc_khoa === true) :
                        (phongBan.thuoc_khoa === 0 || phongBan.thuoc_khoa === false);

                      return isMatchingType;
                    })
                    .map(phongBan => (
                      <MenuItem key={phongBan.ma_phong_ban} value={phongBan.ma_phong_ban}>
                        {phongBan.ten_phong_ban}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>Không có dữ liệu</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </>
      )}
    </>
  );

  // Các trường chi tiết chỉ hiển thị khi chỉnh sửa
  const detailFields = (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>Thông tin chi tiết</Typography>
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
  const isSmallScreen = useMediaQuery("(max-height: 900px)"); // Kiểm tra màn hình nhỏ

  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader
        title={isEditMode ? "Cập nhật thông tin giảng viên" : "Thêm giảng viên mới"}
      />
      <Divider />
      <CardContent
        sx={{
          maxHeight: isSmallScreen ? "70vh" : "unset", // Chỉ giới hạn chiều cao trên màn hình nhỏ
          overflowY: isSmallScreen ? "auto" : "unset", // Chỉ có thanh cuộn khi màn hình nhỏ
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Thông tin cơ bản</Typography>
            </Grid>

            {/* Các trường nhập thông tin */}
            {basicFields}
            {isEditMode && detailFields}

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {isEditMode ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormGiangVien;