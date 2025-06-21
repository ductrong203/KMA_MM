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
  try {
    const response = await getChuongTrinhDaoTao({ he_dao_tao_id, khoa_dao_tao_id });
    if (!response?.data) {
      return [];
    }
    return response.data.map((item) => Number(item.mon_hoc_id)) || [];
  } catch (error) {
    console.error('Error in getMonHocInChuongTrinh:', error);
    return [];
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
    fetchData();
  }, []);

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
      // Lọc môn học theo hệ đào tạo
      const filtered = heDaoTaoId
        ? subjects.filter((subject) => subject.he_dao_tao_id === parseInt(heDaoTaoId))
        : subjects;
      setFilteredSubjects(filtered);
      if (heDaoTaoId && filtered.length === 0 && subjects.length > 0) {
        toast.info('Không có môn học nào thuộc hệ đào tạo này');
      }

      // Lấy chương trình đào tạo của khóa hiện tại hoặc khóa trước
      if (heDaoTaoId && khoaId) {
        let monHocIds = await getMonHocInChuongTrinh(heDaoTaoId, khoaId);

        // Nếu không có chương trình cho khóa hiện tại, tìm khóa gần nhất có chương trình
        if (monHocIds.length === 0) {
          // Sắp xếp theo ma_khoa
          const sortedKhoaList = [...khoaList].sort((a, b) => {
            if (!a.ma_khoa || !b.ma_khoa) {
              console.warn('ma_khoa không hợp lệ:', a, b);
              return a.id - b.id; // Dự phòng
            }
            return a.ma_khoa.localeCompare(b.ma_khoa);
          });
          const currentKhoaIndex = sortedKhoaList.findIndex((khoa) => khoa.id === parseInt(khoaId));
          if (currentKhoaIndex === -1) {
            toast.error('Không tìm thấy khóa đào tạo hiện tại');
            return;
          }
          if (currentKhoaIndex > 0) {
            // Duyệt ngược từ khóa trước để tìm khóa có chương trình đào tạo
            for (let i = currentKhoaIndex - 1; i >= 0; i--) {
              const previousKhoa = sortedKhoaList[i];
              const previousMonHocIds = await getMonHocInChuongTrinh(heDaoTaoId, previousKhoa.id);
              if (previousMonHocIds.length > 0) {
               
                toast.info(`Đã tải chương trình đào tạo từ khóa ${previousKhoa.ten_khoa}`);
                monHocIds = previousMonHocIds;
                break;
              }
            }
            if (monHocIds.length === 0) {
              toast.info('Không có khóa trước nào có chương trình đào tạo để kế thừa');
            }
          } else {
            toast.info('Không có khóa trước để kế thừa chương trình đào tạo');
          }
        }

        setExistingSubjectIds(monHocIds);
        setSelectedSubjectIds(monHocIds);
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
}, [subjects, heDaoTaoId, khoaId, khoaList]);

  const handleHeDaoTaoChange = (event) => {
    if (selectedSubjectIds.length > 0) {
      const confirm = window.confirm(
        'Danh sách môn học đã chọn sẽ bị xóa khi thay đổi hệ đào tạo. Bạn có muốn tiếp tục?'
      );
      if (!confirm) return;
    }
    setHeDaoTaoId(event.target.value);
    setSelectedSubjectIds([]);
    setExistingSubjectIds([]);
    setKhoaId('');
    setSoQuyetDinh('');
    setNgayRaQuyetDinh(null);
    setPage(0);
  };

  const handleKhoaChange = (event) => {
    setKhoaId(event.target.value);
    setSoQuyetDinh('');
    setNgayRaQuyetDinh(null);
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

    setLoading(true);
    try {
      const chuongTrinhData = {
        he_dao_tao_id: parseInt(heDaoTaoId),
        khoa_dao_tao_id: parseInt(khoaId),
        so_quyet_dinh: soQuyetDinh,
        ngay_ra_quyet_dinh: ngayRaQuyetDinh.toISOString().split('T')[0],
        mon_hoc_ids: selectedSubjectIds,
      };
      await updateChuongTrinhDaoTao(chuongTrinhData);
      toast.success('Lưu chương trình đào tạo thành công!');
      setSoQuyetDinh('');
      setNgayRaQuyetDinh(null);
    } catch (error) {
      toast.error('Lỗi khi lưu chương trình đào tạo: ' + error.message);
    } finally {
      setLoading(false);
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu chương trình đào tạo'}
        </Button>
      )}
    </Paper>
  );
};

export default ThemChuongTrinhDaoTao;