import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Button,
} from '@mui/material';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getDanhSachSinhVienTheoKhoa } from '../../Api_controller/Service/sinhVienService';
import { capNhatDanhSachSinhVien } from '../../Api_controller/Service/sinhVienService';
import { DataGrid } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';

const GraduationManagement = ({ curriculums, role, setNotification }) => {
  const [students, setStudents] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [heDaoTaoFilter, setHeDaoTaoFilter] = useState('');
  const [khoaFilter, setKhoaFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortModel, setSortModel] = useState([{ field: 'tong_tin_chi', sort: 'desc' }]);
  const [pageSize, setPageSize] = useState(15);
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    if (heDaoTaoFilter) {
      fetchKhoaList();
    } else {
      setKhoaList([]);
      setKhoaFilter('');
      setStudents([]);
    }
  }, [heDaoTaoFilter]);

  useEffect(() => {
    if (khoaFilter) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [khoaFilter]);

  const fetchKhoaList = async () => {
    try {
      const response = await getDanhSachKhoaTheoDanhMucDaoTao(heDaoTaoFilter);
      setKhoaList(response);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Lỗi khi tải danh sách khóa: ' + error.message,
        severity: 'error',
      });
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await getDanhSachSinhVienTheoKhoa(khoaFilter);
      setStudents(response.data.students);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Lỗi khi tải danh sách sinh viên: ' + error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (studentId, baoVeDoAn) => {
    if (role === 'examination') {
      setNotification({
        open: true,
        message: 'Bạn không có quyền thực hiện thao tác này!',
        severity: 'warning',
      });
      return;
    }
    // Cập nhật pendingChanges
    setPendingChanges((prev) => ({
      ...prev,
      [studentId]: {
        bao_ve_do_an: baoVeDoAn,
      },
    }));
    // Cập nhật students ngay lập tức
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId
          ? { ...student, bao_ve_do_an: baoVeDoAn }
          : student
      )
    );
  };

  const handleSaveChanges = async () => {
    if (role === 'examination') {
      setNotification({
        open: true,
        message: 'Bạn không có quyền thực hiện thao tác này!',
        severity: 'warning',
      });
      return;
    }
    try {
      const sinhVienList = Object.entries(pendingChanges).map(([studentId, changes]) => ({
        id: parseInt(studentId),
        bao_ve_do_an: changes.bao_ve_do_an,
      }));

      if (sinhVienList.length === 0) {
        setNotification({
          open: true,
          message: 'Không có thay đổi để lưu!',
          severity: 'warning',
        });
        return;
      }

      await capNhatDanhSachSinhVien(khoaFilter, sinhVienList);

      setPendingChanges({});
      setNotification({
        open: true,
        message: 'Lưu tất cả thay đổi thành công!',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Lỗi khi lưu thay đổi: ' + error.message,
        severity: 'error',
      });
    }
  };

  const excelData = students.map((student) => ({
    'Mã sinh viên': student.ma_sinh_vien,
    'Họ đệm': student.ho_dem,
    'Tên': student.ten,
    'Tổng tín chỉ': student.tong_tin_chi,
    'ĐTB Tích lũy': student.diem_trung_binh_tich_luy || 'N/A',
    'ĐTB Hệ 4': student.diem_trung_binh_he_4 || 'N/A',
    'Hình thức tốt nghiệp': student.bao_ve_do_an ? 'Bảo vệ đồ án' : 'Thi tốt nghiệp',
  }));

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachSinhVien');
    XLSX.writeFile(wb, 'danh_sach_sinh_vien.xlsx');
  };

  const columns = [
    { field: 'ma_sinh_vien', headerName: 'Mã sinh viên', width: 120 },
    { field: 'ho_dem', headerName: 'Họ đệm', width: 200 },
    { field: 'ten', headerName: 'Tên', width: 200 },
    { field: 'tong_tin_chi', headerName: 'Tổng tín chỉ', width: 120, sortable: true },
    {
      field: 'diem_trung_binh_tich_luy',
      headerName: 'ĐTB Tích lũy',
      width: 120,
      sortable: true,
    },
    {
      field: 'diem_trung_binh_he_4',
      headerName: 'ĐTB Hệ 4',
      width: 120,
      sortable: true,
    },
    {
      field: 'bao_ve_do_an',
      headerName: 'Bảo vệ đồ án',
      width: 150,
      renderCell: (params) => (
        params.row.bao_ve_do_an ? (
          <Checkbox
            checked={params.row.bao_ve_do_an}
            onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked)}
            disabled={role === 'examination'}
          />
        ) : null
      ),
    },
    {
      field: 'thi_tot_nghiep',
      headerName: 'Thi tốt nghiệp',
      width: 150,
      renderCell: (params) => (
        !params.row.bao_ve_do_an ? (
          <Checkbox
            checked={!params.row.bao_ve_do_an}
            onChange={(e) => handleCheckboxChange(params.row.id, !e.target.checked)}
            disabled={role === 'examination'}
          />
        ) : null
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Quản lý đồ án tốt nghiệp
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo hệ đào tạo</InputLabel>
          <Select
            value={heDaoTaoFilter}
            label="Lọc theo hệ đào tạo"
            onChange={(e) => setHeDaoTaoFilter(e.target.value)}
          >
            <MenuItem value="">Tất cả hệ đào tạo</MenuItem>
            {curriculums.map((curriculum) => (
              <MenuItem key={curriculum.id} value={curriculum.id}>
                {curriculum.ten_he_dao_tao}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }} disabled={!heDaoTaoFilter}>
          <InputLabel>Lọc theo khóa</InputLabel>
          <Select
            value={khoaFilter}
            label="Lọc theo khóa"
            onChange={(e) => setKhoaFilter(e.target.value)}
          >
            <MenuItem value="">Tất cả khóa</MenuItem>
            {khoaList.map((khoa) => (
              <MenuItem key={khoa.id} value={khoa.id}>
                {khoa.ten_khoa}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <DataGrid
        rows={students}
        getRowId={(row) => row.id}
        columns={columns}
        loading={loading}
        sortModel={sortModel}
        onSortModelChange={(newModel) => setSortModel(newModel)}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[15, 25, 50]}
        pagination
        autoHeight
        disableRowSelectionOnClick
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSaveChanges}
          disabled={Object.keys(pendingChanges).length === 0 || role === 'examination'}
        >
          Lưu thay đổi
        </Button>
        <Button
          variant="contained"
          onClick={handleExportExcel}
          sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
        >
          Xuất Excel
        </Button>
      </Box>
    </Box>
  );
};

export default GraduationManagement;