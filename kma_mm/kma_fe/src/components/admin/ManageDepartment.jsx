import {
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { getPhongBan } from '../../Api_controller/Service/phongBanService';
import DepartmentForm from './DepartmentForm';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Tạo hàm fetchDepartments với useCallback để tránh tạo lại hàm mới mỗi lần render
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await getPhongBan();
      setDepartments(response);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedDepartment(null);
  };

  const handleFormSubmit = async () => {
    try {
      // Sau khi form submit thành công, gọi lại API để lấy data mới nhất
      await fetchDepartments();
      
      // Đóng form
      setOpenForm(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('Error updating departments:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Department Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
          Add Department
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã Phòng Ban</TableCell>
              <TableCell>Tên Phòng Ban</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.ma_phong_ban}>
                <TableCell>{department.ma_phong_ban}</TableCell>
                <TableCell>{department.ten_phong_ban}</TableCell>
                <TableCell>{department.ghi_chu}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(department)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog aria-hidden="true" open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DepartmentForm department={selectedDepartment} onClose={handleCloseForm} onSubmit={handleFormSubmit} />
      </Dialog>
    </Container>
  );
};

export default ManageDepartments;