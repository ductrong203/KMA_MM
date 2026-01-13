import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Button,
} from '@mui/material';
import { toast } from 'react-toastify';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getDanhSachSinhVienTheoKhoa } from '../../Api_controller/Service/sinhVienService';
import { capNhatDanhSachSinhVien } from '../../Api_controller/Service/sinhVienService';
import { getDanhSachLopTheoKhoaDaoTao } from '../../Api_controller/Service/lopService';
import { DataGrid } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';

const GraduationManagement = ({ curriculums, role }) => {
  const [students, setStudents] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [lopList, setLopList] = useState([]);
  const [heDaoTaoFilter, setHeDaoTaoFilter] = useState('');
  const [khoaFilter, setKhoaFilter] = useState('');
  const [lopFilter, setLopFilter] = useState('');
  const [filterType, setFilterType] = useState('lop'); // 'khoa' hoặc 'lop' - mặc định là lớp
  const [loading, setLoading] = useState(false);
  const [sortModel, setSortModel] = useState([{ field: 'tong_tin_chi', sort: 'desc' }]);
  const [pageSize, setPageSize] = useState(15);
  const [pendingChanges, setPendingChanges] = useState({});

  const fetchKhoaList = useCallback(async () => {
    try {
      const response = await getDanhSachKhoaTheoDanhMucDaoTao(heDaoTaoFilter);
      setKhoaList(response);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khóa: ' + error.message);
    }
  }, [heDaoTaoFilter]);

  const fetchLopList = useCallback(async () => {
    if (!khoaFilter) return;
    try {
      const response = await getDanhSachLopTheoKhoaDaoTao(khoaFilter);
      setLopList(response.data || response);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lớp: ' + error.message);
    }
  }, [khoaFilter]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDanhSachSinhVienTheoKhoa(khoaFilter);
      setStudents(response.data.students);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sinh viên: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [khoaFilter]);

  const fetchStudentsByLop = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDanhSachSinhVienTheoKhoa(khoaFilter);
      const allStudents = response.data.students;
      const filteredStudents = allStudents.filter(student => student.lop_id === parseInt(lopFilter));
      setStudents(filteredStudents);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sinh viên theo lớp: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [khoaFilter, lopFilter]);

  useEffect(() => {
    if (heDaoTaoFilter) {
      fetchKhoaList();
    } else {
      setKhoaList([]);
      setLopList([]);
      setKhoaFilter('');
      setLopFilter('');
      setStudents([]);
    }
  }, [heDaoTaoFilter, fetchKhoaList]);

  useEffect(() => {
    if (filterType === 'khoa' && khoaFilter) {
      fetchStudents();
    } else if (filterType === 'lop' && khoaFilter) {
      fetchLopList();
    } else {
      setStudents([]);
    }
  }, [khoaFilter, filterType, fetchStudents, fetchLopList]);

  useEffect(() => {
    if (filterType === 'lop' && lopFilter) {
      fetchStudentsByLop();
    }
  }, [lopFilter, filterType, fetchStudentsByLop]);

  const handleFilterTypeChange = (newFilterType) => {
    setFilterType(newFilterType);
    setLopFilter('');
    setStudents([]);
    if (newFilterType === 'khoa') {
      setLopList([]);
    } else if (newFilterType === 'lop' && khoaFilter) {
      fetchLopList();
    }
  };

  const handleCheckboxChange = (studentId, baoVeDoAn) => {
    if (role === 'examination') {
      toast.warning('Bạn không có quyền thực hiện thao tác này!');
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
      toast.warning('Bạn không có quyền thực hiện thao tác này!');
      return;
    }
    try {
      const sinhVienList = Object.entries(pendingChanges).map(([studentId, changes]) => ({
        id: parseInt(studentId),
        bao_ve_do_an: changes.bao_ve_do_an,
      }));

      if (sinhVienList.length === 0) {
        toast.warning('Không có thay đổi để lưu!');
        return;
      }

      await capNhatDanhSachSinhVien(khoaFilter, sinhVienList);

      setPendingChanges({});
      toast.success('Lưu tất cả thay đổi thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu thay đổi: ' + error.message);
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
        <Checkbox
          checked={params.row.bao_ve_do_an === true}
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked)}
          disabled={role === 'examination'}
        />
      ),
    },
    {
      field: 'thi_tot_nghiep',
      headerName: 'Thi tốt nghiệp',
      width: 150,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.bao_ve_do_an === false}
          onChange={(e) => handleCheckboxChange(params.row.id, !e.target.checked)}
          disabled={role === 'examination'}
        />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Quản lý đồ án tốt nghiệp 
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Chọn khóa đào tạo</InputLabel>
          <Select
            value={heDaoTaoFilter}
            label="Chọn khóa đào tạo"
            onChange={(e) => setHeDaoTaoFilter(e.target.value)}
          >
            <MenuItem value="">Chọn khóa đào tạo</MenuItem>
            {curriculums.map((curriculum) => (
              <MenuItem key={curriculum.id} value={curriculum.id}>
                {curriculum.ten_he_dao_tao}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} disabled={!heDaoTaoFilter}>
          <InputLabel>Chọn khóa đào tạo</InputLabel>
          <Select
            value={khoaFilter}
            label="Chọn khóa đào tạo"
            onChange={(e) => setKhoaFilter(e.target.value)}
          >
            <MenuItem value="">Chọn khóa đào tạo</MenuItem>
            {khoaList.map((khoa) => (
              <MenuItem key={khoa.id} value={khoa.id}>
                {khoa.ten_khoa}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }} disabled={!khoaFilter}>
          <InputLabel>Lọc theo</InputLabel>
          <Select
            value={filterType}
            label="Lọc theo"
            onChange={(e) => handleFilterTypeChange(e.target.value)}
          >
            <MenuItem value="lop">Lớp</MenuItem>
            <MenuItem value="khoa">Khóa đào tạo</MenuItem>
          </Select>
        </FormControl>

        {filterType === 'lop' && (
          <FormControl sx={{ minWidth: 200 }} disabled={!khoaFilter}>
            <InputLabel>Chọn lớp</InputLabel>
            <Select
              value={lopFilter}
              label="Chọn lớp"
              onChange={(e) => setLopFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả lớp</MenuItem>
              {lopList.map((lop) => (
                <MenuItem key={lop.id} value={lop.id}>
                  {lop.ma_lop}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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