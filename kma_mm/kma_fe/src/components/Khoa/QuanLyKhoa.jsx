import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import {
  createKhoa,
  fetchDanhSachKhoa,
  updateKhoa,
} from "../../Api_controller/Service/khoaService";
import { fetchDanhSachHeDaoTao } from "../../Api_controller/Service/trainingService";
import { toast } from 'react-toastify';
import PageHeader from "../../layout/PageHeader";

// Component chính quản lý danh sách khóa
const QuanLyKhoa = () => {
  // States
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [formData, setFormData] = useState({
    ma_khoa: "",
    ten_khoa: "",
    he_dao_tao_id: null,
    nam_bat_dau: "",
    nam_ket_thuc: "",
    so_ky_hoc: "",
  });
  const [selectedHeDaoTao, setSelectedHeDaoTao] = useState(null);

  // State xử lý loading và phân trang
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // State cho bộ lọc
  const [filterHeDaoTao, setFilterHeDaoTao] = useState("");

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    getDanhSachKhoa();
    getDanhSachHeDaoTao();
  }, []);

  // Hàm lấy danh sách khóa từ API
  const getDanhSachKhoa = async () => {
    setLoadingData(true);
    try {
      const response = await fetchDanhSachKhoa();
      setDanhSachKhoa(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa:", error);
      toast.error("Không thể lấy danh sách khóa. Vui lòng thử lại sau.");
    } finally {
      setLoadingData(false);
    }
  };

  // Hàm lấy danh sách hệ đào tạo từ API
  const getDanhSachHeDaoTao = async () => {
    try {
      const response = await fetchDanhSachHeDaoTao();
      setDanhSachHeDaoTao(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hệ đào tạo:", error);
      toast.error("Không thể lấy danh sách hệ đào tạo. Vui lòng thử lại sau.");
    }
  };

  // Xử lý mở form thêm khóa
  const handleOpenForm = () => {
    setOpenForm(true);
    setFormData({
      ma_khoa: "",
      ten_khoa: "",
      he_dao_tao_id: null,
      nam_bat_dau: "",
      nam_ket_thuc: "",
      so_ky_hoc: "",
    });
    setSelectedHeDaoTao(null);
  };

  // Xử lý đóng form
  const handleCloseForm = () => {
    setSelectedKhoa(null);
    setOpenForm(false);
  };

  // Xử lý thay đổi giá trị trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý khi chọn hệ đào tạo
  const handleHeDaoTaoChange = (event, newValue) => {
    setSelectedHeDaoTao(newValue);
    setFormData({
      ...formData,
      he_dao_tao_id: newValue ? newValue.id : null,
    });
  };

  // Chuyển đổi nam_bat_dau và nam_ket_thuc thành nam_hoc
  const convertToNamHoc = (namBatDau, namKetThuc) => {
    if (!namBatDau || !namKetThuc) return "";
    return `${namBatDau}-${namKetThuc}`;
  };

  // Xử lý thêm hoặc cập nhật khóa
  const handleSubmit = async () => {
    if (
      !formData.ma_khoa ||
      !formData.ten_khoa ||
      !formData.he_dao_tao_id ||
      !formData.nam_bat_dau ||
      !formData.nam_ket_thuc ||
      !formData.so_ky_hoc
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Kiểm tra năm bắt đầu < năm kết thúc
    if (parseInt(formData.nam_bat_dau) >= parseInt(formData.nam_ket_thuc)) {
      toast.error("Năm bắt đầu phải nhỏ hơn năm kết thúc!");
      return;
    }

    // Kiểm tra số kỳ học là số dương
    if (parseInt(formData.so_ky_hoc) <= 0) {
      toast.error("Số kỳ học phải là số dương!");
      return;
    }

    // Chuyển đổi dữ liệu trước khi gửi lên API
    const dataToSubmit = {
      ma_khoa: formData.ma_khoa,
      ten_khoa: formData.ten_khoa,
      he_dao_tao_id: formData.he_dao_tao_id,
      nam_hoc: convertToNamHoc(formData.nam_bat_dau, formData.nam_ket_thuc),
      so_ky_hoc: formData.so_ky_hoc,
    };

    setLoading(true);
    try {
      if (selectedKhoa) {
        await updateKhoa(selectedKhoa.id, dataToSubmit);
        toast.success("Cập nhật khóa thành công!");
      } else {
        await createKhoa(dataToSubmit);
        toast.success("Thêm khóa mới thành công!");
      }
      const updatedData = await fetchDanhSachKhoa();
      setDanhSachKhoa(updatedData);
      handleCloseForm();
    } catch (error) {
      console.error("Lỗi khi xử lý dữ liệu khóa:", error);
      toast.error("Không thể lưu dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy tên hệ đào tạo dựa trên ID
  const getHeDaoTaoName = (id) => {
    const heDaoTao = danhSachHeDaoTao.find((item) => item.id === id);
    return heDaoTao ? heDaoTao.ten_he_dao_tao : "Không xác định";
  };

  // Tách nam_hoc thành nam_bat_dau và nam_ket_thuc khi chỉnh sửa
  const parseNamHoc = (namHoc) => {
    if (!namHoc || typeof namHoc !== "string") return { nam_bat_dau: "", nam_ket_thuc: "" };
    const [namBatDau, namKetThuc] = namHoc.split("-");
    return { nam_bat_dau: namBatDau || "", nam_ket_thuc: namKetThuc || "" };
  };

  // Xử lý chỉnh sửa khóa
  const handleEdit = (khoa) => {
    const { nam_bat_dau, nam_ket_thuc } = parseNamHoc(khoa.nam_hoc);
    setSelectedKhoa(khoa);
    setFormData({
      ma_khoa: khoa.ma_khoa || "",
      ten_khoa: khoa.ten_khoa || "",
      he_dao_tao_id: khoa.he_dao_tao_id || null,
      nam_bat_dau: nam_bat_dau,
      nam_ket_thuc: nam_ket_thuc,
      so_ky_hoc: khoa.so_ky_hoc || "",
    });
    const heDaoTao = danhSachHeDaoTao.find((item) => item.id === khoa.he_dao_tao_id);
    setSelectedHeDaoTao(heDaoTao || null);
    setOpenForm(true);
  };

  // Xử lý thay đổi bộ lọc hệ đào tạo
  const handleFilterChange = (event) => {
    setFilterHeDaoTao(event.target.value);
    setPage(0); // Reset về trang đầu tiên khi thay đổi bộ lọc
  };

  // Lọc danh sách khóa theo hệ đào tạo
  const filteredKhoa = danhSachKhoa.filter((khoa) =>
    filterHeDaoTao ? khoa.he_dao_tao_id === filterHeDaoTao : true
  );

  // Tính toán dữ liệu hiển thị trên trang hiện tại
  const indexOfLastItem = (page + 1) * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentKhoa = filteredKhoa.slice(indexOfFirstItem, indexOfLastItem);

  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Xử lý thay đổi số dòng mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số dòng
  };

  return (
    <Container maxWidth="" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageHeader title="Danh sách khóa đào tạo" />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenForm}>
          Thêm khóa đào tạo mới
        </Button>
      </Box>

      {/* Bộ lọc hệ đào tạo */}
      <Box mb={3}>
        <FormControl variant="outlined" sx={{ minWidth: 300 }}>
          <InputLabel id="filter-he-dao-tao-label">Lọc theo hệ đào tạo</InputLabel>
          <Select
            labelId="filter-he-dao-tao-label"
            id="filter-he-dao-tao"
            value={filterHeDaoTao}
            onChange={handleFilterChange}
            label="Lọc theo hệ đào tạo"
          >
            <MenuItem value="">
              <em>Tất cả</em>
            </MenuItem>
            {danhSachHeDaoTao.map((heDaoTao) => (
              <MenuItem key={heDaoTao.id} value={heDaoTao.id}>
                {heDaoTao.ten_he_dao_tao}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Bảng hiển thị danh sách khóa */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }} width="5%">STT</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} width="15%">Mã khóa đào tạo</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} width="20%">Tên khóa</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} width="20%">Hệ đào tạo</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} width="15%">Niên khóa</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} width="10%">Số kỳ học</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} width="15%">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingData ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : currentKhoa.length > 0 ? (
              currentKhoa.map((khoa, index) => (
                <TableRow key={khoa.id}>
                  <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                  <TableCell>{khoa.ma_khoa}</TableCell>
                  <TableCell>{khoa.ten_khoa}</TableCell>
                  <TableCell>{getHeDaoTaoName(khoa.he_dao_tao_id)}</TableCell>
                  <TableCell>{khoa.nam_hoc}</TableCell>
                  <TableCell>{khoa.so_ky_hoc}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(khoa)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[15, 25, 50]}
          component="div"
          count={filteredKhoa.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage="Số hàng mỗi trang"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`}
        />
      </TableContainer>

      {/* Form thêm/cập nhật khóa */}

      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{selectedKhoa ? "Chỉnh sửa khóa đào tạo" : "Thêm khóa đào tạo mới"}</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Hệ đào tạo
            </Typography>
            <Autocomplete
              options={danhSachHeDaoTao}
              getOptionLabel={(option) => option.ten_he_dao_tao}
              value={selectedHeDaoTao}
              onChange={handleHeDaoTaoChange}
              renderInput={(params) => (
                <TextField {...params} label="Hệ đào tạo" margin="normal" variant="outlined" fullWidth />
              )}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
              Mã ký hiệu khóa đào tạo
            </Typography>
            <TextField
              fullWidth
              label="Mã khóa"
              name="ma_khoa"
              value={formData.ma_khoa}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
              Tên khóa đào tạo
            </Typography>
            <TextField
              fullWidth
              label="Tên khóa"
              name="ten_khoa"
              value={formData.ten_khoa}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
              Năm bắt đầu
            </Typography>
            <TextField
              fullWidth
              label="Năm bắt đầu"
              name="nam_bat_dau"
              value={formData.nam_bat_dau}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              type="number"
              inputProps={{ min: 2000, max: 2100 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
              Năm kết thúc
            </Typography>
            <TextField
              fullWidth
              label="Năm kết thúc"
              name="nam_ket_thuc"
              value={formData.nam_ket_thuc}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              type="number"
              inputProps={{ min: 2000, max: 2100 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
              Số kỳ học
            </Typography>
            <TextField
              fullWidth
              label="Số kỳ học"
              name="so_ky_hoc"
              value={formData.so_ky_hoc}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              type="number"
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="inherit" disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Đang lưu..." : selectedKhoa ? "Cập nhật" : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuanLyKhoa;