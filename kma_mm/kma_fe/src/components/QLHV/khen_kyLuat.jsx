import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
  Box,
  Autocomplete,
  TablePagination,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  getAlldanhmuckhenkyluat,
  createdanhmuckhenkyluat,
  updateDanhMucKhenKyLuat,
  deleteDanhMucKhenKyLuat,
} from "../../Api_controller/Service/DM_khen_KL_Service";
import {
  getAllKhenKyLuat,
  createKhenKyLuat,
  updateKhenKyLuat,
  deleteKhenKyLuat,
} from "../../Api_controller/Service/khen_KL_Service";

import { getAllStudent } from "../../Api_controller/Service/qlhvService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import { getDanhSachSinhVienTheoLop } from "../../Api_controller/Service/sinhVienService";

export default function QuanLyKhenKyLuat() {
  const [danhMuc, setDanhMuc] = useState([]);
  const [khenKyLuat, setKhenKyLuat] = useState([]);
  const [sinhVien, setSinhVien] = useState([]);
  const [sinhVienTheoLop, setSinhVienTheoLop] = useState([]);
  const [dsLop, setDSLop] = useState([]);
  const [lopChon, setLopChon] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null); // 'Danh mục' hoặc 'Khen thưởng/Kỷ luật'
  const [editingRecord, setEditingRecord] = useState(null);
  const [tabIndex, setTabIndex] = useState(0); // Quản lý Tab
  const [errors, setErrors] = useState({});
  const [pageKhenKyLuat, setPageKhenKyLuat] = useState(0);
  const [rowsPerPageKhenKyLuat, setRowsPerPageKhenKyLuat] = useState(5);
  const [pageDanhMuc, setPageDanhMuc] = useState(0);
  const [rowsPerPageDanhMuc, setRowsPerPageDanhMuc] = useState(5);

  const [formData, setFormData] = useState({
    ma_danh_muc: "",
    ten_danh_muc: "",
    loai: "",
    mo_ta: "",
    trang_thai: "",
    sinh_vien_id: "",
    danh_muc_id: "",
    ly_do: "",
    muc_thuong_phat: "",
    ngay_quyet_dinh: "",
    so_quyet_dinh: "",
    nguoi_ky: "",
    hinh_thuc: "",
    ghi_chu: "",
  });

  const fetchDanhMuc = async () => {
    try {
      const response = await getAlldanhmuckhenkyluat();
      setDanhMuc(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu danh mục", error);
    }
  };

  const fetchKhenKyLuat = async () => {
    try {
      const response = await getAllKhenKyLuat();
      setKhenKyLuat(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khen thưởng/kỷ luật", error);
    }
  };

  const fetchSinhVien = async () => {
    try {
      const response = await getAllStudent();
      setSinhVien(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sinh viên", error);
    }
  };
  const fetchLop = async () => {
    try {
      const response = await getDanhSachLop();
      setDSLop(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lớp", error);
    }
  };
  const fetchSinhVienTheoLop = async (lop_id) => {
    try {
      const response = await getDanhSachSinhVienTheoLop(lop_id);
      setSinhVienTheoLop(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu học viên theo lớp", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDanhMuc();
      await fetchKhenKyLuat();
      await fetchLop();
      await fetchSinhVien();
    };
    fetchData();
  }, []);
  const handleCloseDialog = () => {
    setErrors({});
    setDialogOpen(false);
  };
  // Xử lý mở Dialog cho cả hai loại
  const handleOpenDialog = (record = null, type = "Danh mục") => {
    setDialogType(type);
    setEditingRecord(record);
    if (type === "Danh mục") {
      setFormData(
        record || {
          ma_danh_muc: "",
          ten_danh_muc: "",
          loai: "",
          mo_ta: "",
          trang_thai: "1",
        }
      );
    } else if (type === "Khen thưởng/Kỷ luật") {
      if (record) {
        // Tìm thông tin lớp của sinh viên
        const selectedSinhVien = sinhVien.find(
          (sv) => sv.id === record.sinh_vien_id
        );
        const selectedLop = selectedSinhVien
          ? dsLop.find((lop) => lop.id === selectedSinhVien.lop_id)
          : null;

        setLopChon(selectedLop ? selectedLop.id : null);
        fetchSinhVienTheoLop(selectedLop.id);
        setFormData({
          ...record,
          sinh_vien_id: selectedSinhVien ? selectedSinhVien.id : "",
          lop_id: selectedLop ? selectedLop.id : "",
        });
      } else {
        setLopChon(null);
        setFormData({
          sinh_vien_id: "",
          danh_muc_id: "",
          ly_do: "",
          muc_thuong_phat: "",
          ngay_quyet_dinh: "",
          so_quyet_dinh: "",
          nguoi_ky: "",
          hinh_thuc: "",
          ghi_chu: "",
        });
      }
    }
    setDialogOpen(true);
  };

  const validateForm = () => {
    let validationErrors = {};
    if (dialogType === "Danh mục") {
      if (!formData.ma_danh_muc) {
        validationErrors.ma_danh_muc = "Vui lòng chọn mã danh mục.";
      }
      if (!formData.ten_danh_muc) {
        validationErrors.ten_danh_muc = "Vui lòng chọn tên danh mục.";
      }
      if (!formData.loai) {
        validationErrors.loai = "Vui lòng chọn loại khen thưởng/ kỷ luật.";
      }
    } else {
      if (!formData.danh_muc_id) {
        validationErrors.danh_muc_id =
          "Vui lòng chọn danh mục khen thưởng/ kỷ luật.";
      }
      if (!formData.sinh_vien_id) {
        validationErrors.sinh_vien_id = "Vui lòng chọn học viên.";
      }
      if (!formData.ngay_quyet_dinh) {
        validationErrors.ngay_quyet_dinh = "Vui lòng chọn ngày quyết định.";
      }
      if (
        !formData.muc_thuong_phat ||
        isNaN(parseFloat(formData.muc_thuong_phat)) ||
        parseFloat(formData.muc_thuong_phat) <= 0
      ) {
        validationErrors.muc_thuong_phat =
          "Vui lòng chọn mức thưởng phạt hợp lệ.";
      }
      if (!formData.ly_do) {
        validationErrors.ly_do = "Vui lòng chọn lý do.";
      }
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      if (dialogType === "Danh mục") {
        if (editingRecord) {
          await updateDanhMucKhenKyLuat(editingRecord.id, formData);
        } else {
          await createdanhmuckhenkyluat(formData);
        }
        fetchDanhMuc();
        alert("Lưu thành công!");
      } else if (dialogType === "Khen thưởng/Kỷ luật") {
        if (editingRecord) {
          await updateKhenKyLuat(editingRecord.id, formData);
        } else {
          await createKhenKyLuat(formData);
        }
        fetchKhenKyLuat();
        alert("Lưu thành công!");
      }
      setDialogOpen(false);
      setErrors({});
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };
  // Xóa dữ liệu
  const handleDelete = async (id, dialogType) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa?");
    if (!confirm) return;

    try {
      if (dialogType === "Danh mục") {
        await deleteDanhMucKhenKyLuat(id);
        fetchDanhMuc();
        alert("Xóa danh mục thành công!");
      } else if (dialogType === "Khen thưởng/Kỷ luật") {
        await deleteKhenKyLuat(id);
        fetchKhenKyLuat();
        alert("Xóa khen thưởng/kỷ luật thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa", error);
      alert("Có lỗi xảy ra khi xóa.");
    }
  };

  return (
    <div>
      <Tabs
        value={tabIndex}
        onChange={(event, newValue) => setTabIndex(newValue)}
      >
        <Tab label="Danh mục khen thưởng/kỷ luật" />
        <Tab label="Khen thưởng/kỷ luật" />
      </Tabs>

      {/* Tab Danh mục khen thưởng/kỷ luật */}
      {tabIndex === 0 && (
        <div>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog(null, "Danh mục")}
            >
              Thêm danh mục
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã danh mục</TableCell>
                  <TableCell>Tên danh mục</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhMuc
                  .slice(
                    pageDanhMuc * rowsPerPageDanhMuc,
                    pageDanhMuc * rowsPerPageDanhMuc + rowsPerPageDanhMuc
                  )
                  .map((dm) => (
                    <TableRow key={dm.id}>
                      <TableCell>{dm.ma_danh_muc}</TableCell>
                      <TableCell>{dm.ten_danh_muc}</TableCell>
                      <TableCell>
                        {dm.loai === "khen_thuong" ? "Khen thưởng" : "Kỷ luật"}
                      </TableCell>
                      <TableCell>{dm.mo_ta}</TableCell>
                      <TableCell>
                        {dm.trang_thai ? "Đang mở" : "Đã đóng"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenDialog(dm, "Danh mục")}
                        >
                          <Edit /> Sửa
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(dm.id, "Danh mục")}
                        >
                          <Delete /> Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={danhMuc.length}
            rowsPerPage={rowsPerPageDanhMuc}
            page={pageDanhMuc}
            onPageChange={(event, newPage) => setPageDanhMuc(newPage)}
            onRowsPerPageChange={(event) =>
              setRowsPerPageDanhMuc(parseInt(event.target.value, 10))
            }
            labelRowsPerPage="Số dòng mỗi trang"
          />
        </div>
      )}

      {/* Tab Khen thưởng/Kỷ luật */}
      {tabIndex === 1 && (
        <div>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog(null, "Khen thưởng/Kỷ luật")}
            >
              Thêm Khen thưởng/Kỷ luật
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Mức thưởng/phạt</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {khenKyLuat
                  .slice(
                    pageKhenKyLuat * rowsPerPageKhenKyLuat,
                    pageKhenKyLuat * rowsPerPageKhenKyLuat +
                      rowsPerPageKhenKyLuat
                  )
                  .map((record) => {
                    // Tìm sinh viên và danh mục theo ID
                    const ho_dem_SV = sinhVien.find(
                      (sv) => sv.id === record.sinh_vien_id
                    )?.ho_dem;
                    const ten_SV = sinhVien.find(
                      (sv) => sv.id === record.sinh_vien_id
                    )?.ten;
                    const danhMucName = danhMuc.find(
                      (dm) => dm.id === record.danh_muc_id
                    )?.ten_danh_muc;
                    const sinhVienName = `${ho_dem_SV} ${ten_SV}`;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          {sinhVienName || "Không tìm thấy"}
                        </TableCell>
                        <TableCell>{danhMucName || "Không tìm thấy"}</TableCell>
                        <TableCell>{record.ly_do}</TableCell>
                        <TableCell>{record.muc_thuong_phat}</TableCell>

                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleOpenDialog(record, "Khen thưởng/Kỷ luật")
                            }
                          >
                            <Edit /> Sửa
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              handleDelete(record.id, "Khen thưởng/Kỷ luật")
                            }
                          >
                            <Delete /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={khenKyLuat.length}
            rowsPerPage={rowsPerPageKhenKyLuat}
            page={pageKhenKyLuat}
            onPageChange={(event, newPage) => setPageKhenKyLuat(newPage)}
            onRowsPerPageChange={(event) =>
              setRowsPerPageKhenKyLuat(parseInt(event.target.value, 10))
            }
            labelRowsPerPage="Số dòng mỗi trang"
          />
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingRecord ? `Chỉnh sửa ${dialogType}` : `Thêm ${dialogType}`}
        </DialogTitle>
        <DialogContent>
          {dialogType === "Danh mục" && (
            <>
              <TextField
                label="Mã danh mục"
                fullWidth
                required
                margin="normal"
                value={formData.ma_danh_muc}
                onChange={(e) =>
                  setFormData({ ...formData, ma_danh_muc: e.target.value })
                }
                error={!!errors.ma_danh_muc}
                helperText={errors.ma_danh_muc}
              />
              <TextField
                label="Tên danh mục"
                fullWidth
                required
                margin="normal"
                value={formData.ten_danh_muc}
                onChange={(e) =>
                  setFormData({ ...formData, ten_danh_muc: e.target.value })
                }
                error={!!errors.ten_danh_muc}
                helperText={errors.ten_danh_muc}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel required>Loại</InputLabel>
                <Select
                  value={formData.loai}
                  onChange={(e) =>
                    setFormData({ ...formData, loai: e.target.value })
                  }
                  error={!!errors.loai}
                >
                  <MenuItem value="khen_thuong">Khen thưởng</MenuItem>
                  <MenuItem value="ky_luat">Kỷ luật</MenuItem>
                </Select>
                {errors.loai && (
                  <span style={{ color: "red" }}>{errors.loai}</span>
                )}
              </FormControl>
              <TextField
                label="Mô tả"
                fullWidth
                margin="normal"
                multiline
                value={formData.mo_ta}
                onChange={(e) =>
                  setFormData({ ...formData, mo_ta: e.target.value })
                }
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.trang_thai}
                  onChange={(e) =>
                    setFormData({ ...formData, trang_thai: e.target.value })
                  }
                >
                  <MenuItem value={1}>Mở</MenuItem>
                  <MenuItem value={0}>Đóng</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {dialogType === "Khen thưởng/Kỷ luật" && (
            <>
              <Autocomplete
                options={danhMuc.filter((dm) => dm.trang_thai === 1)}
                getOptionLabel={(option) => option.ten_danh_muc}
                value={
                  danhMuc.find((dm) => dm.id === formData.danh_muc_id) || null
                }
                onChange={(e, newValue) =>
                  setFormData({ ...formData, danh_muc_id: newValue?.id || "" })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Danh mục"
                    margin="normal"
                    required
                    error={!!errors.danh_muc_id}
                    helperText={errors.danh_muc_id}
                  />
                )}
              />
              <Autocomplete
                options={dsLop}
                getOptionLabel={(option) => option.ma_lop}
                value={dsLop.find((lop) => lop.id === lopChon) || null}
                onChange={async (e, newValue) => {
                  setLopChon(newValue?.id || null);

                  if (newValue) {
                    try {
                      const response = await getDanhSachSinhVienTheoLop(
                        newValue.id
                      );
                      setSinhVienTheoLop(response.data);
                    } catch (error) {
                      console.error("Lỗi khi tải danh sách sinh viên:", error);
                    }
                  } else {
                    setSinhVienTheoLop([]);
                  }

                  setFormData({ ...formData, sinh_vien_id: "" });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Lớp" margin="normal" required />
                )}
              />

              <Autocomplete
                options={sinhVienTheoLop}
                getOptionLabel={(option) =>
                  `${option.ho_dem} ${option.ten} - ${option.ma_sinh_vien}`
                }
                value={
                  sinhVienTheoLop.find(
                    (sv) => sv.id === formData.sinh_vien_id
                  ) || null
                }
                onChange={(e, newValue) =>
                  setFormData({ ...formData, sinh_vien_id: newValue?.id || "" })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Học viên"
                    margin="normal"
                    required
                    error={!!errors.sinh_vien_id}
                    helperText={errors.sinh_vien_id}
                  />
                )}
              />
              <TextField
                label="Lý do"
                fullWidth
                required
                margin="normal"
                value={formData.ly_do}
                onChange={(e) =>
                  setFormData({ ...formData, ly_do: e.target.value })
                }
                error={!!errors.ly_do}
                helperText={errors.ly_do}
              />
              <TextField
                label="Mức thưởng/phạt"
                fullWidth
                required
                margin="normal"
                value={formData.muc_thuong_phat}
                onChange={(e) =>
                  setFormData({ ...formData, muc_thuong_phat: e.target.value })
                }
                error={!!errors.muc_thuong_phat}
                helperText={errors.muc_thuong_phat}
              />
              <TextField
                fullWidth
                required
                margin="normal"
                label="Ngày quyết định"
                type="date"
                value={formData.ngay_quyet_dinh}
                onChange={(e) =>
                  setFormData({ ...formData, ngay_quyet_dinh: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.ngay_quyet_dinh}
                helperText={errors.ngay_quyet_dinh}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Số quyết định"
                value={formData.so_quyet_dinh}
                onChange={(e) =>
                  setFormData({ ...formData, so_quyet_dinh: e.target.value })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Người ký"
                value={formData.nguoi_ky}
                onChange={(e) =>
                  setFormData({ ...formData, nguoi_ky: e.target.value })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Hình thức"
                value={formData.hinh_thuc}
                onChange={(e) =>
                  setFormData({ ...formData, hinh_thuc: e.target.value })
                }
              />

              <TextField
                fullWidth
                margin="normal"
                label="Ghi chú"
                multiline
                rows={2}
                value={formData.ghi_chu}
                onChange={(e) =>
                  setFormData({ ...formData, ghi_chu: e.target.value })
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>

          <Button onClick={handleSave} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
