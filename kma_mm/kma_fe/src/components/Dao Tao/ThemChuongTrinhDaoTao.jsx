import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-toastify';
import { getMonHoc } from '../../Api_controller/Service/monHocService';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService';
import { getDanhSachKhoaTheoDanhMucDaoTao } from '../../Api_controller/Service/khoaService';
import { getChuongTrinhDaoTao, updateChuongTrinhDaoTao } from '../../Api_controller/Service/chuongTrinhDaoTaoService';

const getMonHocInChuongTrinh = async (he_dao_tao_id, khoa_dao_tao_id) => {
  console.log('getMonHocInChuongTrinh called with:', { he_dao_tao_id, khoa_dao_tao_id });
  try {
    const response = await getChuongTrinhDaoTao({ he_dao_tao_id, khoa_dao_tao_id });
    console.log('API response:', response.data);
    const monHocIds = response.data.map((item) => Number(item.mon_hoc_id));
    console.log('monHocIds:', monHocIds);
    return monHocIds;
  } catch (error) {
    console.error('Error in getMonHocInChuongTrinh:', error.response || error.message);
    throw new Error('Lỗi khi lấy danh sách môn học trong chương trình: ' + error.message);
  }
};
const ThemChuongTrinhDaoTao = () => {
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [heDaoTaoId, setHeDaoTaoId] = useState('');
  const [soQuyetDinh, setSoQuyetDinh] = useState('');
  const [ngayRaQuyetDinh, setNgayRaQuyetDinh] = useState(null);
  const [khoaId, setKhoaId] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [existingSubjectIds, setExistingSubjectIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const role = localStorage.getItem('role') || '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subjectsRes = await getMonHoc();
      setSubjects(subjectsRes);
      const curriculumsRes = await fetchDanhSachHeDaoTao();
      setCurriculums(curriculumsRes);
      setFilteredSubjects(subjectsRes);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchKhoaByHeDaoTao = async () => {
      if (heDaoTaoId) {
        try {
          const khoaRes = await getDanhSachKhoaTheoDanhMucDaoTao(heDaoTaoId);
          setKhoaList(khoaRes || []);
          setKhoaId('');
          if (khoaRes.length === 0) {
            toast.info('Không có khóa đào tạo nào cho hệ đào tạo này');
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách khóa đào tạo: ' + error.message);
          setKhoaList([]);
        }
      } else {
        setKhoaList([]);
        setKhoaId('');
      }
    };
    fetchKhoaByHeDaoTao();
  }, [heDaoTaoId]);

  useEffect(() => {
    const fetchSubjectsAndExisting = async () => {
      setLoading(true);
      try {
        let filtered = subjects;
        console.log('subjects:', subjects);
        if (heDaoTaoId) {
          filtered = subjects.filter((subject) => subject.he_dao_tao_id === parseInt(heDaoTaoId));
          console.log('filteredSubjects:', filtered);
          setFilteredSubjects(filtered);
          if (filtered.length === 0 && subjects.length > 0) {
            toast.info('Không có môn học nào thuộc hệ đào tạo này');
          }
        } else {
          setFilteredSubjects(subjects);
        }

        if (heDaoTaoId && khoaId) {
          const existingIds = await getMonHocInChuongTrinh(heDaoTaoId, khoaId);
          console.log('existingIds:', existingIds);
          setExistingSubjectIds(existingIds || []);
          setSelectedSubjectIds(existingIds || []);
          console.log('selectedSubjectIds:', existingIds);
        } else {
          setExistingSubjectIds([]);
          setSelectedSubjectIds([]);
        }

        setPage(0);
      } catch (error) {
        toast.error('Lỗi khi xử lý dữ liệu: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjectsAndExisting();
  }, [subjects, heDaoTaoId, khoaId]);

  const handleHeDaoTaoChange = (event) => {
    if (selectedSubjectIds.length > 0) {
      toast.warn('Danh sách môn học đã chọn sẽ bị xóa khi thay đổi hệ đào tạo');
    }
    setHeDaoTaoId(event.target.value);
    setSelectedSubjectIds([]);
    setExistingSubjectIds([]);
    setPage(0);
  };

  const handleKhoaChange = (event) => {
    setKhoaId(event.target.value);
    setSelectedSubjectIds([]);
    setExistingSubjectIds([]);
    setPage(0);
  };

  const handleSave = async () => {
    if (role === 'examination') {
      toast.warn('Bạn không có quyền lưu chương trình đào tạo!');
      return;
    }

    if (!heDaoTaoId || !soQuyetDinh || !ngayRaQuyetDinh || !khoaId) {
      const missingFields = [];
      if (!heDaoTaoId) missingFields.push('Hệ đào tạo');
      if (!soQuyetDinh) missingFields.push('Số quyết định');
      if (!ngayRaQuyetDinh) missingFields.push('Ngày ra quyết định');
      if (!khoaId) missingFields.push('Khóa đào tạo');
      toast.warn(`Vui lòng điền đầy đủ: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const chuongTrinhData = {
        he_dao_tao_id: parseInt(heDaoTaoId),
        khoa_dao_tao_id: parseInt(khoaId),
        so_quyet_dinh: soQuyetDinh,
        ngay_ra_quyet_dinh: ngayRaQuyetDinh.toISOString().split('T')[0],
        mon_hoc_ids: selectedSubjectIds,
      };
      console.log('Saving chuong trinh dao tao:', chuongTrinhData);
      await updateChuongTrinhDaoTao(chuongTrinhData);
      toast.success('Lưu chương trình đào tạo thành công!');
      setHeDaoTaoId('');
      setSoQuyetDinh('');
      setNgayRaQuyetDinh(null);
      setKhoaId('');
      setSelectedSubjectIds([]);
      setExistingSubjectIds([]);
    } catch (error) {
      toast.error('Lỗi khi lưu chương trình đào tạo: ' + error.message);
    }
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
        return curriculum ? curriculum.ten_he_dao_tao : params.value;
      },
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
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '1.1rem' }}>Hệ đào tạo</InputLabel>
              <Select
                value={heDaoTaoId}
                label="Hệ đào tạo"
                onChange={handleHeDaoTaoChange}
                disabled={role === 'examination'}
                sx={inputFieldSx}
              >
                <MenuItem value="">Chọn hệ đào tạo</MenuItem>
                {curriculums.map((curriculum) => (
                  <MenuItem key={curriculum.id} value={curriculum.id}>
                    {curriculum.ten_he_dao_tao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '1.1rem' }}>Quyết định có hiệu lực từ khóa</InputLabel>
              <Select
                value={khoaId}
                label="Quyết định có hiệu lực từ khóa"
                onChange={handleKhoaChange}
                disabled={role === 'examination' || !heDaoTaoId}
                sx={inputFieldSx}
              >
                <MenuItem value="">Chọn khóa đào tạo</MenuItem>
                {khoaList.map((khoa) => (
                  <MenuItem key={khoa.id} value={khoa.id}>
                    {khoa.ten_khoa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Số quyết định"
              value={soQuyetDinh}
              onChange={(e) => setSoQuyetDinh(e.target.value)}
              fullWidth
              disabled={role === 'examination'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Ngày ra quyết định"
              value={ngayRaQuyetDinh}
              onChange={(newValue) => setNgayRaQuyetDinh(newValue)}
              disabled={role === 'examination'}
              format="dd/MM/yyyy"
              slotProps={{ textField: { fullWidth: true, sx: inputFieldSx } }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel sx={{ fontSize: '1.1rem' }}>Lọc môn học theo hệ đào tạo</InputLabel>
          <Select
            value={heDaoTaoId}
            label="Lọc môn học theo hệ đào tạo"
            onChange={handleHeDaoTaoChange}
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
      </Box> */}

      <DataGrid
        rows={filteredSubjects}
        getRowId={(row) => row.id}
        columns={subjectColumns}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => setSelectedSubjectIds(newSelection)}
        rowSelectionModel={selectedSubjectIds}
        loading={loading}
        autoHeight
        pagination
        pageSizeOptions={[15, 25, 50]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(newModel) => {
          setPage(newModel.page);
          setPageSize(newModel.pageSize);
        }}
        paginationMode="client"
        sx={{ mb: 2 }}
      />

      {role !== 'examination' && (
        <Button variant="contained" color="primary" onClick={handleSave}>
          Lưu chương trình đào tạo
        </Button>
      )}
    </Paper>
  );
};

export default ThemChuongTrinhDaoTao;