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
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { getAllUser } from "../../Api_controller/Service/adminService";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { deleteUserById } from "../../Api_controller/Service/authService";
import EditUserModal from "./EditUserModal"; // Import modal

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // State để lưu người dùng đang chỉnh sửa
  const [openModal, setOpenModal] = useState(false); // Điều khiển việc mở modal
  const rowsPerPage = 5;
  const navigate = useNavigate();

  const roleMapping = {
    1: "đào tạo",
    2: "khảo thí",
    3: "quản lý sinh viên",
    4: "thư viện",
    5: "giám đốc",
    6: "sinh viên",
    7: "admin",
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  // Fetch dữ liệu người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUser();
        if (response.status === 200) {
          setUsers(response.data.data);
          setFilteredUsers(response.data.data);
        } else {
          console.error("Failed to fetch users:", response.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await deleteUserById(userId);
        if (response.status === "OK") {
          // Cập nhật danh sách người dùng sau khi xóa
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.filter((user) => user.id !== userId);
            return updatedUsers;
          });

          // Không cần cập nhật filteredUsers ở đây, vì useEffect sẽ tự động xử lý
          alert("Xóa người dùng thành công!");
        } else {
          alert("Không thể xóa người dùng. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        alert("Có lỗi xảy ra khi xóa người dùng.");
      }
    }
  };

  // Lọc danh sách người dùng khi tìm kiếm hoặc thay đổi vai trò
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesUsername = user.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole
        ? user.role === parseInt(selectedRole)
        : true;
      return matchesUsername && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]); // Khi users, searchTerm hoặc selectedRole thay đổi

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenModal(true); // Mở modal chỉnh sửa
  };

  const handleUserUpdated = (updatedUser) => {
    //console.log("Updated user:", updatedUser);
    // Cập nhật danh sách người dùng mà không gọi lại API
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        <IconButton
          color="primary"
          onClick={handleBackToDashboard}
          sx={{ mr: 1, mb: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        Quản lý tài khoản
      </Typography>
      <Box display="flex" gap={2} alignItems="center" marginBottom={2}>
        {/* Thanh tìm kiếm */}
        <TextField
          label="Tìm kiếm bằng Username"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 2 }} // Chiếm 2 phần tỉ lệ
        />
        {/* Bộ lọc Role */}
        <TextField
          select
          label="xét theo quyền"
          variant="outlined"
          fullWidth
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          sx={{ flex: 1 }} // Chiếm 1 phần tỉ lệ
        >
          <MenuItem value="">Tất cả các quyền</MenuItem>
          {Object.entries(roleMapping).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="bg-blue-100 text-white">
              <TableCell>Username</TableCell>
              <TableCell>Quyền</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentUsers.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.username}</TableCell>
                <TableCell>{roleMapping[account.role]}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditUser(account)} // Mở modal chỉnh sửa
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteUser(account.id)} // Sửa lại id cho đúng
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      <Pagination
        count={Math.ceil(filteredUsers.length / rowsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />

      {/* Modal chỉnh sửa người dùng */}
      <EditUserModal
        user={selectedUser}
        open={openModal}
        onClose={() => setOpenModal(false)} // Đóng modal
        onUserUpdated={handleUserUpdated} // Cập nhật dữ liệu người dùng sau khi sửa
      />
    </div>
  );
};

export default ManageAccounts;
