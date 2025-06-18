import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { getMonHoc } from '../../Api_controller/Service/monHocService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getChuongTrinhDaoTao } from '../../Api_controller/Service/chuongTrinhDaoTaoService';

const DanhSachChuongTrinhDaoTao = ({ chuongTrinhList: propChuongTrinhList = [] }) => {
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [chuongTrinhList, setChuongTrinhList] = useState(propChuongTrinhList);
  const [filteredChuongTrinhList, setFilteredChuongTrinhList] = useState([]);
  const [heDaoTaoFilter, setHeDaoTaoFilter] = useState('');
  const [khoaFilter, setKhoaFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChuongTrinh, setSelectedChuongTrinh] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldFetchChuongTrinh, setShouldFetchChuongTrinh] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [page, setPage] = useState(0); // State cho trang của DataGrid chính
  const [pageSize, setPageSize] = useState(10); // State cho kích thước trang của DataGrid chính
  const [dialogPage, setDialogPage] = useState(0); // State cho trang của DataGrid trong Dialog
  const [dialogPageSize, setDialogPageSize] = useState(10); // State cho kích thước trang của DataGrid trong Dialog

  // Hàm fetchData thông thường
  async function fetchData(filters = {}) {
    setLoading(true);
    try {
      const { he_dao_tao_id, khoa_dao_tao_id } = filters;
      const promises = [
        getMonHoc(),
        fetchDanhSachHeDaoTao(),
      ];

      // Chỉ gọi getChuongTrinhDaoTao nếu cả hai bộ lọc có giá trị
      if (he_dao_tao_id && khoa_dao_tao_id) {
        promises.push(getChuongTrinhDaoTao({ he_dao_tao_id, khoa_dao_tao_id }));
      }

      const [subjectsRes, curriculumsRes, chuongTrinhRes] = await Promise.all(promises);

      console.log('Curriculums from API:', curriculumsRes); // Debug API response
      setSubjects(subjectsRes);
      setCurriculums(Array.isArray(curriculumsRes) ? curriculumsRes : []);
      if (!curriculumsRes || curriculumsRes.length === 0) {
        toast.info('Không có hệ đào tạo nào được tìm thấy');
      }

      if (chuongTrinhRes) {
        const normalizedChuongTrinh = chuongTrinhRes.data.reduce((acc, item) => {
          const existing = acc.find((ct) => ct.so_quyet_dinh === item.so_quyet_dinh);
          if (existing) {
            existing.mon_hoc_ids.push(item.mon_hoc_id);
          } else {
            acc.push({
              id: item.id,
              so_quyet_dinh: item.so_quyet_dinh,
              ngay_ra_quyet_dinh: item.ngay_ra_quyet_dinh.split('T')[0],
              khoa: item.khoaDaoTao?.ten_khoa || 'Unknown',
              mon_hoc_ids: [item.mon_hoc_id],
            });
          }
          return acc;
        }, []);

        setChuongTrinhList(normalizedChuongTrinh);
        setFilteredChuongTrinhList(normalizedChuongTrinh);
        setPage(0); // Reset trang khi dữ liệu thay đổi
      } else {
        setChuongTrinhList([]);
        setFilteredChuongTrinhList([]);
        setPage(0); // Reset trang khi không có dữ liệu
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
      setShouldFetchChuongTrinh(false); // Reset sau khi fetch
    }
  }

  // Hàm fetchKhoa thông thường
  async function fetchKhoa(heDaoTaoId) {
    try {
      const khoaRes = await getDanhSachKhoaTheoDanhMucDaoTao(heDaoTaoId);
      console.log('Khoa from API:', khoaRes); // Debug API response
      setKhoaList(Array.isArray(khoaRes) ? khoaRes : []);
      if (!khoaRes || khoaRes.length === 0) {
        toast.info('Không có khóa đào tạo nào cho hệ này');
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khóa: ' + error.message);
      setKhoaList([]);
    }
  }

  // Initial fetch khi component mount
  useEffect(() => {
    console.log('Initial useEffect triggered, propChuongTrinhList:', propChuongTrinhList);
    if (isInitialFetch && propChuongTrinhList.length === 0) {
      fetchData();
      setIsInitialFetch(false); // Chỉ fetch một lần
    } else if (propChuongTrinhList.length > 0) {
      setChuongTrinhList(propChuongTrinhList);
      setFilteredChuongTrinhList(propChuongTrinhList);
      setPage(0); // Reset trang khi prop thay đổi
    }
  }, [propChuongTrinhList, isInitialFetch]);

  // Fetch chương trình đào tạo khi cả hai bộ lọc được chọn
  useEffect(() => {
    console.log('ChuongTrinh useEffect triggered:', { shouldFetchChuongTrinh, heDaoTaoFilter, khoaFilter });
    if (shouldFetchChuongTrinh && heDaoTaoFilter && khoaFilter) {
      fetchData({ he_dao_tao_id: heDaoTaoFilter, khoa_dao_tao_id: khoaFilter });
    }
  }, [heDaoTaoFilter, khoaFilter, shouldFetchChuongTrinh]);

  // Fetch khóa khi heDaoTaoFilter thay đổi
  useEffect(() => {
    console.log('Khoa useEffect triggered, heDaoTaoFilter:', heDaoTaoFilter);
    if (heDaoTaoFilter) {
      fetchKhoa(heDaoTaoFilter);
    } else {
      setKhoaList([]);
      setKhoaFilter('');
      setShouldFetchChuongTrinh(false);
    }
  }, [heDaoTaoFilter]);

  const handleHeDaoTaoFilterChange = (event) => {
    const value = event.target.value;
    setHeDaoTaoFilter(value);
    setKhoaFilter('');
    setShouldFetchChuongTrinh(false); // Không fetch khi chỉ chọn hệ
    setPage(0); // Reset trang khi thay đổi bộ lọc
  };

  const handleKhoaFilterChange = (event) => {
    const value = event.target.value;
    setKhoaFilter(value);
    if (value) {
      setShouldFetchChuongTrinh(true); // Chỉ fetch khi cả hệ và khóa được chọn
    }
    setPage(0); // Reset trang khi thay đổi bộ lọc
  };

  const handleViewDetails = (chuongTrinh) => {
    setSelectedChuongTrinh(chuongTrinh);
    setOpenDialog(true);
    setDialogPage(0); // Reset trang của Dialog khi mở
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedChuongTrinh(null);
    setDialogPage(0); // Reset trang của Dialog khi đóng
  };

  const subjectColumns = [
    { field: 'ma_mon_hoc', headerName: 'Mã môn học', width: 100 },
    { field: 'ten_mon_hoc', headerName: 'Tên môn học', width: 200 },
    { field: 'so_tin_chi', headerName: 'Số tín chỉ', width: 80 },
    {
      field: 'he_dao_tao_id',
      headerName: 'Hệ đào tạo',
      width: 150,
      renderCell: (params) => {
        const curriculum = curriculums.find((c) => c.id === params.value);
        return curriculum ? curriculum.ten_he_dao_tao : params.value || 'N/A';
      },
    },
  ];

  const chuongTrinhColumns = [
    { field: 'so_quyet_dinh', headerName: 'Số quyết định', width: 150 },
    { field: 'ngay_ra_quyet_dinh', headerName: 'Ngày ra quyết định', width: 150 },
    { field: 'khoa', headerName: 'Khóa đào tạo', width: 200 },
    {
      field: 'actions',
      headerName: 'Chi tiết',
      width: 100,
      renderCell: (params) => (
        <IconButton onClick={() => handleViewDetails(params.row)} color="primary">
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  const inputFieldSx = {
    '& .MuiInputBase-root': {
      height: '48px',
      fontSize: '1.1rem',
      padding: '0 14px',
    },
    '& .MuiInputLabel-root': {
      fontSize: '1.1rem',
      transform: 'translate(14px, 12px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.75)',
      },
    },
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Hệ đào tạo</InputLabel>
          <Select
            value={heDaoTaoFilter}
            label="Hệ đào tạo"
            onChange={handleHeDaoTaoFilterChange}
            sx={inputFieldSx}
          >
            <MenuItem value="">Tất cả hệ đào tạo</MenuItem>
            {curriculums.map((curriculum) => (
              <MenuItem key={curriculum.id} value={curriculum.id}>
                {curriculum.ten_he_dao_tao}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Lọc theo khóa đào tạo</InputLabel>
          <Select
            value={khoaFilter}
            label="Lọc theo khóa đào tạo"
            onChange={handleKhoaFilterChange}
            sx={inputFieldSx}
            disabled={!heDaoTaoFilter}
          >
            <MenuItem value="">Tất cả khóa đào tạo</MenuItem>
            {khoaList.map((khoa) => (
              <MenuItem key={khoa.id} value={khoa.id}>
                {khoa.ten_khoa}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DataGrid
        rows={filteredChuongTrinhList}
        getRowId={(row) => row.id}
        columns={chuongTrinhColumns}
        loading={loading}
        autoHeight
        pagination
        pageSizeOptions={[10, 15, 25, 50]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(newModel) => {
          setPage(newModel.page);
          setPageSize(newModel.pageSize);
        }}
        paginationMode="client"
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết chương trình đào tạo</DialogTitle>
        <DialogContent>
          {selectedChuongTrinh && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Số quyết định:</strong> {selectedChuongTrinh.so_quyet_dinh}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Ngày ra quyết định:</strong> {selectedChuongTrinh.ngay_ra_quyet_dinh}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Khóa:</strong> {selectedChuongTrinh.khoa}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Danh sách môn học
              </Typography>
              <DataGrid
                rows={subjects.filter((s) => selectedChuongTrinh.mon_hoc_ids.includes(s.id))}
                getRowId={(row) => row.id}
                columns={subjectColumns}
                autoHeight
                pagination
                pageSizeOptions={[10, 20, 50]}
                paginationModel={{ page: dialogPage, pageSize: dialogPageSize }}
                onPaginationModelChange={(newModel) => {
                  setDialogPage(newModel.page);
                  setDialogPageSize(newModel.pageSize);
                }}
                paginationMode="client"
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default DanhSachChuongTrinhDaoTao;