import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  createKhoa,
  fetchDanhSachKhoa,
  updateKhoa,
} from "../../Api_controller/Service/khoaService";
import { fetchDanhSachHeDaoTao } from "../../Api_controller/Service/trainingService";
import { TablePagination } from "@mui/material";

// URL API (thay thế bằng URL thực của bạn)
const API_URL = "https://api.example.com";

// Component chính quản lý danh sách khóa
const QuanLyKhoa = () => {
  // States
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [formData, setFormData] = useState({
    ten_khoa: "",
    he_dao_tao_id: null,
    nam_hoc: "",
  });
  const [selectedHeDaoTao, setSelectedHeDaoTao] = useState(null);

  // State xử lý loading và thông báo
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [page, setPage] = useState(1); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(5); // Số dòng mỗi trang
  const indexOfLastItem = page * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentKhoa = danhSachKhoa.slice(indexOfFirstItem, indexOfLastItem);

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    getDanhSachKhoa();
    getDanhSachHeDaoTao();
  }, []);
  //   console.log(danhSachKhoa)
  //   console.log(danhSachHeDaoTao)

  // Hàm lấy danh sách khóa từ API
  const getDanhSachKhoa = async () => {
    setLoadingData(true);
    try {
      const response = await fetchDanhSachKhoa();
      setDanhSachKhoa(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa:", error);
      showSnackbar(
        "Không thể lấy danh sách khóa. Vui lòng thử lại sau.",
        "error"
      );
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
      showSnackbar(
        "Không thể lấy danh sách hệ đào tạo. Vui lòng thử lại sau.",
        "error"
      );
    }
  };

  // Hiển thị thông báo
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Đóng thông báo
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Xử lý mở form thêm khóa
  const handleOpenForm = () => {
    setOpenForm(true);
    setFormData({
      ten_khoa: "",
      he_dao_tao_id: null,
      nam_hoc: "",
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Xử lý khi chọn hệ đào tạo
  const handleHeDaoTaoChange = (event, newValue) => {
    setSelectedHeDaoTao(newValue);
    if (newValue) {
      setFormData({
        ...formData,
        he_dao_tao_id: newValue.id,
      });
    } else {
      setFormData({
        ...formData,
        he_dao_tao_id: null,
      });
    }
  };

  // Xử lý thêm khóa mới thông qua API
  const handleSubmit = async () => {
    // Kiểm tra dữ liệu
    if (!formData.ten_khoa || !formData.he_dao_tao_id || !formData.nam_hoc) {
      showSnackbar("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    setLoading(true);
    try {
      if (selectedKhoa) {
        // Chỉnh sửa khóa
        await updateKhoa(selectedKhoa.id, formData);
        showSnackbar("Cập nhật khóa thành công!");
      } else {
        // Thêm mới khóa
        await createKhoa(formData);
        showSnackbar("Thêm khóa mới thành công!");
      }

      // Cập nhật danh sách khóa
      const updatedData = await fetchDanhSachKhoa();
      setDanhSachKhoa(updatedData);

      // Đóng form
      setSelectedKhoa(null);
      handleCloseForm();
    } catch (error) {
      console.error("Lỗi khi xử lý dữ liệu khóa:", error);
      showSnackbar("Không thể lưu dữ liệu. Vui lòng thử lại sau.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getHeDaoTaoName = (id) => {
    if (!id || !danhSachHeDaoTao || danhSachHeDaoTao.length === 0) {
      return "Không xác định";
    }
    console.log("Tìm hệ đào tạo với ID:", id);
    console.log("Danh sách hệ đào tạo:", danhSachHeDaoTao);

    const heDaoTao = danhSachHeDaoTao.find((item) => item.id === id);
    return heDaoTao ? heDaoTao.ten_he_dao_tao : "Không xác định";
  };

  const handleEdit = (khoa) => {
    setSelectedKhoa(khoa);
    setFormData({
      ten_khoa: khoa.ten_khoa || "",
      he_dao_tao_id: khoa.he_dao_tao_id || null,
      nam_hoc: khoa.nam_hoc || "",
    });

    const heDaoTao = danhSachHeDaoTao.find(
      (item) => item.id === khoa.he_dao_tao_id
    );
    setSelectedHeDaoTao(heDaoTao || null);

    setOpenForm(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Danh sách khóa
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
        >
          Thêm khóa
        </Button>
      </Box>

      {/* Bảng hiển thị danh sách khóa */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%">STT</TableCell>
              <TableCell width="20%">Mã khóa</TableCell>
              <TableCell width="20%">Tên khóa</TableCell>
              <TableCell width="20%">Hệ đào tạo</TableCell>
              <TableCell width="20%">Niên khóa</TableCell>
              <TableCell width="20%">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingData ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : currentKhoa.length > 0 ? (
              currentKhoa.map((khoa, index) => (
                <TableRow key={khoa.id}>
                  <TableCell>{indexOfFirstItem + 1}</TableCell>
                  <TableCell>{khoa.ma_khoa}</TableCell>
                  <TableCell>{khoa.ten_khoa}</TableCell>
                  <TableCell>{getHeDaoTaoName(khoa.he_dao_tao_id)}</TableCell>
                  <TableCell>{khoa.nam_hoc}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(khoa)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={danhSachKhoa.length} // Tổng số khóa
          rowsPerPage={rowsPerPage}
          page={page - 1} // MUI bắt đầu từ 0
          labelRowsPerPage="Số dòng mỗi trang"
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1); // Quay lại trang đầu khi đổi số dòng
          }}
        />
      </TableContainer>

      {/* Form thêm khóa mới */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedKhoa ? "Chỉnh sửa khóa" : "Thêm khóa mới"}
        </DialogTitle>

        <DialogContent>
          <Box py={2}>
            <TextField
              fullWidth
              label="Tên khóa"
              name="ten_khoa"
              value={formData.ten_khoa}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />

            <Autocomplete
              options={danhSachHeDaoTao}
              getOptionLabel={(option) => option.ten_he_dao_tao}
              value={selectedHeDaoTao}
              onChange={handleHeDaoTaoChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Hệ đào tạo"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                />
              )}
            />

            <TextField
              fullWidth
              label="Niên khóa"
              name="nam_hoc"
              value={formData.nam_hoc}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
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

      {/* Snackbar hiển thị thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QuanLyKhoa;
