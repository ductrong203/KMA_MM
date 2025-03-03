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
  Typography,
  Box,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  getAlldanhmuckhenkyluat,
  createdanhmuckhenkyluat,
  updateDanhMucKhenKyLuat,
  deleteDanhMucKhenKyLuat,
} from "../../Api_controller/Service/DM_khen_KL_Service";

export default function QuanLyKhenKyLuat() {
  const [danhMuc, setDanhMuc] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    ma_danh_muc: "",
    ten_danh_muc: "",
    loai: "",
    mo_ta: "",
    trang_thai: "",
  });

  const fetchDanhMuc = async () => {
    try {
      const response = await getAlldanhmuckhenkyluat();
      setDanhMuc(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu danh mục", error);
    }
  };
  useEffect(() => {
    fetchDanhMuc();
  }, []);
  const handleOpenDialog = (record = null) => {
    setEditingRecord(record);
    setFormData(
      record || {
        ma_danh_muc: "",
        ten_danh_muc: "",
        loai: "",
        mo_ta: "",
        trang_thai: "",
      }
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRecord) {
        await updateDanhMucKhenKyLuat(editingRecord.id, formData);
      } else {
        await createdanhmuckhenkyluat(formData);
      }
      fetchDanhMuc();
      setDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu danh mục", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await deleteDanhMucKhenKyLuat(id);
        fetchDanhMuc();
        alert("Xóa danh mục thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa danh mục", error);
      }
    }
  };

  return (
    <div>
      {/* <Typography variant="h5" gutterBottom>
        📊 Quản lý khen thưởng/kỷ luật
      </Typography> */}

      <Tabs
        value={tabIndex}
        onChange={(event, newValue) => setTabIndex(newValue)}
      >
        <Tab label="Danh mục khen thưởng/kỷ luật" />
        <Tab label="Khen thưởng/kỷ luật" />
      </Tabs>

      {tabIndex === 0 && (
        <div>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
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
                {danhMuc.map((dm) => (
                  <TableRow key={dm.id}>
                    <TableCell>{dm.ma_danh_muc}</TableCell>
                    <TableCell>{dm.ten_danh_muc}</TableCell>
                    <TableCell>
                      {dm.loai === "khen_thuong" ? "Khen thưởng" : "Kỷ luật"}
                    </TableCell>
                    <TableCell>{dm.mo_ta}</TableCell>
                    <TableCell>
                      {dm.trang_thai ? "Hoạt động" : "Không hoạt động"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleOpenDialog(dm)}
                      >
                        <Edit />
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(dm.id)}
                      >
                        <Delete />
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingRecord ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Mã danh mục"
            fullWidth
            margin="normal"
            value={formData.ma_danh_muc}
            onChange={(e) =>
              setFormData({ ...formData, ma_danh_muc: e.target.value })
            }
          />
          <TextField
            label="Tên danh mục"
            fullWidth
            margin="normal"
            value={formData.ten_danh_muc}
            onChange={(e) =>
              setFormData({ ...formData, ten_danh_muc: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Loại</InputLabel>
            <Select
              value={formData.loai}
              onChange={(e) =>
                setFormData({ ...formData, loai: e.target.value })
              }
            >
              <MenuItem value="khen_thuong">Khen thưởng</MenuItem>
              <MenuItem value="ky_luat">Kỷ luật</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Mô tả"
            multiline
            fullWidth
            margin="normal"
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
              <MenuItem value={1}>Hoạt động</MenuItem>
              <MenuItem value={0}>Không hoạt động</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleSave} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
