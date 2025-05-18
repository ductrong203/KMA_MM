import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  Typography,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Pagination,
  Box,
} from "@mui/material";
import ObjectModal from "./ObjectModal";
import {
  getAllDoiTuongQuanLy,
  deleteDoiTuongQuanLy,
} from "../../Api_controller/Service/dtqlService";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

const ManageObjects = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const fetchData = async () => {
    try {
      const response = await getAllDoiTuongQuanLy();
      if (response) {
        setData(response);
      } else {
        console.error("Failed to fetch data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleDelete = async (Id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đối tượng này?")) {
      try {
        const response = await deleteDoiTuongQuanLy(Id);

        if (response.message === "Da xoa doi tuong quan ly") {
          setData((prevData) => {
            const updatedData = prevData.filter((item) => item.id !== Id);
            return updatedData;
          });
          alert("Xóa đối tượng thành công!");
        } else {
          alert("Không thể xóa đối tượng này. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Lỗi khi xóa đối tượng:", error);
        alert("Có lỗi xảy ra khi xóa đối tượng.");
      }
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsCreating(false);
    setOpenModal(true);
  };
  const handleAdd = () => {
    setSelectedItem(null);
    setIsCreating(true);
    setOpenModal(true);
  };
  const handleUpdated = async (updatedData) => {
    const updatedList = await getAllDoiTuongQuanLy();
    setData(updatedList);
    setOpenModal(false);
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          <IconButton
            color="primary"
            onClick={handleBackToDashboard}
            sx={{ mr: 1, mb: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          Quản lý đối tượng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Tạo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="bg-blue-100 text-white">
              <TableCell>Mã đối tượng</TableCell>
              <TableCell>Tên đối tượng</TableCell>
              <TableCell>Chi tiết đối tượng</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData && currentData.length > 0
              ? currentData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.ma_doi_tuong}</TableCell>
                  <TableCell>{item.ten_doi_tuong}</TableCell>
                  <TableCell>{item.chi_tiet_doi_tuong}</TableCell>
                  <TableCell>{item.ghi_chu}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(item)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDelete(item.id)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      <Pagination
        count={Math.ceil(data.length / rowsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />

      {/* Modal thêm/ chỉnh sửa đối tượng */}
      <ObjectModal
        item={selectedItem}
        open={openModal}
        onClose={() => setOpenModal(false)}
        onUpdated={handleUpdated}
        isCreating={isCreating}
      />
    </div>
  );
};

export default ManageObjects;
