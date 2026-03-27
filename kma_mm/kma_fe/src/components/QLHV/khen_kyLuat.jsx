import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
  Box,
  Autocomplete,
  TablePagination,
  Checkbox,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import {
  getAlldanhmuckhenkyluat,
  createdanhmuckhenkyluat,
  updateDanhMucKhenKyLuat,
  deleteDanhMucKhenKyLuat,
} from "../../Api_controller/Service/DM_khen_KL_Service";
import {
  getAllKhenKyLuat,
  createKhenKyLuat,
  updateKhenKyLuat,
  deleteKhenKyLuat,
} from "../../Api_controller/Service/khen_KL_Service";


import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import { getDanhSachSinhVienTheoLop } from "../../Api_controller/Service/sinhVienService";
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId, getDanhSachKhoaDaoTao } from "../../Api_controller/Service/trainingService";

import {
  getAllStudent,
  getListClassByKhoaDaoTaoId,
  updateStudentById
} from "../../Api_controller/Service/qlhvService";



export default function QuanLyKhenKyLuat() {
  const [danhMuc, setDanhMuc] = useState([]);
  const [khenKyLuat, setKhenKyLuat] = useState([]);
  const [sinhVien, setSinhVien] = useState([]);
  const [sinhVienTheoLop, setSinhVienTheoLop] = useState([]);
  const [dsLop, setDSLop] = useState([]);
  const [lopChon, setLopChon] = useState([]);
  const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [allKhoaDaoTao, setAllKhoaDaoTao] = useState([]);
  const [heDaoTaoChon, setHeDaoTaoChon] = useState("");
  const [khoaDaoTaoChon, setKhoaDaoTaoChon] = useState("");
  const [originalLopList, setOriginalLopList] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null); // 'Danh mục' hoặc 'Khen thưởng/Kỷ luật'
  const [editingRecord, setEditingRecord] = useState(null);
  const [tabIndex, setTabIndex] = useState(0); // Quản lý Tab
  const [errors, setErrors] = useState({});
  const [pageKhenThuong, setPageKhenThuong] = useState(0);
  const [rowsPerPageKhenThuong, setRowsPerPageKhenThuong] = useState(5);
  const [pageKyLuat, setPageKyLuat] = useState(0);
  const [rowsPerPageKyLuat, setRowsPerPageKyLuat] = useState(5);
  const [pageDanhMuc, setPageDanhMuc] = useState(0);
  const [rowsPerPageDanhMuc, setRowsPerPageDanhMuc] = useState(5);

  // Filter States
  const [filterHeDaoTao, setFilterHeDaoTao] = useState("");
  const [filterKhoaDaoTao, setFilterKhoaDaoTao] = useState("");
  const [filterLop, setFilterLop] = useState("");
  const [filterDanhMuc, setFilterDanhMuc] = useState("");
  const [danhSachKhoaFilter, setDanhSachKhoaFilter] = useState([]);
  const [dsLopFilter, setDsLopFilter] = useState([]);

  const [filteredKhenThuong, setFilteredKhenThuong] = useState([]);
  const [filteredKyLuat, setFilteredKyLuat] = useState([]);

  // States for "Xét thôi học" (Dropout)
  const [pageThoiHoc, setPageThoiHoc] = useState(0);
  const [rowsPerPageThoiHoc, setRowsPerPageThoiHoc] = useState(5);
  const [filteredThoiHocList, setFilteredThoiHocList] = useState([]);
  const [dialogThoiHocOpen, setDialogThoiHocOpen] = useState(false);
  const [selectedThoiHocList, setSelectedThoiHocList] = useState([]);
  const [lyDoThoiHoc, setLyDoThoiHoc] = useState("");
  const [errorsThoiHoc, setErrorsThoiHoc] = useState({});

  const [formData, setFormData] = useState({
    ma_danh_muc: "",
    ten_danh_muc: "",
    loai: "",
    mo_ta: "",
    trang_thai: "",
    sinh_vien_id: "",
    danh_muc_id: "",
    ly_do: "",
    muc_thuong_phat: "",
    ngay_quyet_dinh: "",
    so_quyet_dinh: "",
    nguoi_ky: "",
    hinh_thuc: "",
    ghi_chu: "",
  });

  const fetchDanhMuc = async () => {
    try {
      const response = await getAlldanhmuckhenkyluat();
      setDanhMuc(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu danh mục", error);
    }
  };

  const fetchKhenKyLuat = async () => {
    try {
      const response = await getAllKhenKyLuat();
      setKhenKyLuat(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khen thưởng/kỷ luật", error);
    }
  };

  const fetchSinhVien = async () => {
    try {
      const response = await getAllStudent();
      setSinhVien(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sinh viên", error);
    }
  };

  const fetchLop = async () => {
    try {
      const response = await getDanhSachLop();
      setDSLop(response);
      setOriginalLopList(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lớp", error);
    }
  };

  const fetchHeDaoTao = async () => {
    try {
      const response = await fetchDanhSachHeDaoTao();
      setDanhSachHeDaoTao(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hệ đào tạo", error);
    }
  };

  const fetchAllKhoaDaoTao = async () => {
    try {
      const data = await getDanhSachKhoaDaoTao();
      setAllKhoaDaoTao(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khoa dao tao", error);
    }
  };

  const fetchSinhVienTheoLop = async (lop_id) => {
    try {
      const response = await getDanhSachSinhVienTheoLop(lop_id);
      setSinhVienTheoLop(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu học viên theo lớp", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDanhMuc();
      await fetchKhenKyLuat();
      await fetchLop();
      await fetchSinhVien();
      await fetchHeDaoTao();
      await fetchAllKhoaDaoTao();
    };
    fetchData();
  }, []);

  // Filter Effects
  useEffect(() => {
    const fetchKhoaFilter = async () => {
      if (filterHeDaoTao) {
        try {
          const data = await getDanhSachKhoaDaoTaobyId(filterHeDaoTao);
          setDanhSachKhoaFilter(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách khóa filter:", error);
          setDanhSachKhoaFilter([]);
        }
      } else {
        setDanhSachKhoaFilter([]);
        setDsLopFilter(originalLopList);
      }
    };
    fetchKhoaFilter();
  }, [filterHeDaoTao, originalLopList]);

  useEffect(() => {
    const fetchLopFilter = async () => {
      if (filterKhoaDaoTao) {
        try {
          const data = await getListClassByKhoaDaoTaoId(filterKhoaDaoTao);
          setDsLopFilter(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách lớp filter:", error);
          setDsLopFilter(originalLopList);
        }
      } else {
        setDsLopFilter(originalLopList);
      }
    };
    fetchLopFilter();
  }, [filterKhoaDaoTao, originalLopList]);

  const handleFilter = () => {
    let resultKhenThuong = [];
    let resultKyLuat = [];

    khenKyLuat.forEach(record => {
      const dm = danhMuc.find(d => d.id === record.danh_muc_id);
      if (!dm) return;

      const sv = sinhVien.find(s => s.id === record.sinh_vien_id);
      if (!sv) return;

      const lopSV = originalLopList.find(l => l.id === sv.lop_id);
      if (!lopSV) return;

      const khoaDaoTaoId = lopSV.khoa_dao_tao_id;
      const heDaoTaoId = allKhoaDaoTao.find(k => k.id === khoaDaoTaoId)?.he_dao_tao_id;

      // Apply Filters
      if (filterHeDaoTao && heDaoTaoId !== filterHeDaoTao) return;
      if (filterKhoaDaoTao && khoaDaoTaoId !== filterKhoaDaoTao) return;
      if (filterLop && sv.lop_id !== filterLop) return;
      if (filterDanhMuc && record.danh_muc_id !== filterDanhMuc) return;

      if (dm.loai === 'khen_thuong') {
        resultKhenThuong.push(record);
      } else if (dm.loai === 'ky_luat') {
        resultKyLuat.push(record);
      }
    });

    setFilteredKhenThuong(resultKhenThuong);
    setFilteredKyLuat(resultKyLuat);
    setPageKhenThuong(0);
    setPageKyLuat(0);
  };

  const handleFilterThoiHoc = () => {
    let resultThoiHoc = [];

    sinhVien.forEach(sv => {
      const lopSV = originalLopList.find(l => l.id === sv.lop_id);
      if (!lopSV) return;

      const khoaDaoTaoId = lopSV.khoa_dao_tao_id;
      const heDaoTaoId = allKhoaDaoTao.find(k => k.id === khoaDaoTaoId)?.he_dao_tao_id;

      // Apply Filters
      if (sv.dang_hoc !== 1 && sv.dang_hoc !== 2) return; // Chỉ lấy sinh viên Đang học hoặc Bảo lưu

      if (filterHeDaoTao && heDaoTaoId !== filterHeDaoTao) return;
      if (filterKhoaDaoTao && khoaDaoTaoId !== filterKhoaDaoTao) return;
      if (filterLop && sv.lop_id !== filterLop) return;

      // Only add students meeting criteria
      resultThoiHoc.push({
        ...sv,
        nam_hoc: danhSachKhoa.find(k => k.id === khoaDaoTaoId)?.nam_hoc ||
          originalLopList.find(k => k.id === khoaDaoTaoId)?.nam_hoc || ""
      });
    });

    setFilteredThoiHocList(resultThoiHoc);
    setPageThoiHoc(0);
    setSelectedThoiHocList([]); // clear selection if filters change
  };

  const currentThoiHocPageData = filteredThoiHocList.slice(
    pageThoiHoc * rowsPerPageThoiHoc,
    pageThoiHoc * rowsPerPageThoiHoc + rowsPerPageThoiHoc
  );

  const isAllSelectedThoiHoc = currentThoiHocPageData.length > 0 && currentThoiHocPageData.every(sv => selectedThoiHocList.includes(sv.id));
  const isSomeSelectedThoiHoc = currentThoiHocPageData.some(sv => selectedThoiHocList.includes(sv.id)) && !isAllSelectedThoiHoc;

  const handleSelectAllThoiHoc = (event) => {
    if (event.target.checked) {
      const newSelecteds = currentThoiHocPageData.map((sv) => sv.id);
      setSelectedThoiHocList([...new Set([...selectedThoiHocList, ...newSelecteds])]);
    } else {
      const pageIds = currentThoiHocPageData.map(sv => sv.id);
      setSelectedThoiHocList(selectedThoiHocList.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectThoiHoc = (event, id) => {
    if (event.target.checked) {
      setSelectedThoiHocList([...selectedThoiHocList, id]);
    } else {
      setSelectedThoiHocList(selectedThoiHocList.filter((selectedId) => selectedId !== id));
    }
  };

  useEffect(() => {
    if (khenKyLuat.length > 0 && danhMuc.length > 0 && sinhVien.length > 0 && originalLopList.length > 0) {
      handleFilter();
      handleFilterThoiHoc();
    }
  }, [khenKyLuat, danhMuc, sinhVien, originalLopList]);

  // Dialog Effects
  useEffect(() => {
    const fetchKhoaDaoTao = async () => {
      if (heDaoTaoChon) {
        try {
          const data = await getDanhSachKhoaDaoTaobyId(heDaoTaoChon);
          setDanhSachKhoa(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
          setDanhSachKhoa([]);
        }
      } else {
        setDanhSachKhoa([]);
        setDSLop(originalLopList);
      }
    };
    fetchKhoaDaoTao();
  }, [heDaoTaoChon, originalLopList]);

  useEffect(() => {
    const fetchLopByKhoaDaoTao = async () => {
      if (khoaDaoTaoChon) {
        try {
          const data = await getListClassByKhoaDaoTaoId(khoaDaoTaoChon);
          setDSLop(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách lớp theo khóa đào tạo:", error);
          setDSLop(originalLopList);
        }
      } else {
        setDSLop(originalLopList);
      }
    };
    fetchLopByKhoaDaoTao();
  }, [khoaDaoTaoChon, originalLopList]);

  const handleCloseDialog = () => {
    setErrors({});
    setDialogOpen(false);
    setHeDaoTaoChon("");
    setKhoaDaoTaoChon("");
    setLopChon(null);
    setSinhVienTheoLop([]);
  };

  const handleOpenDialog = (record = null, type = "Danh mục") => {
    setDialogType(type);
    setEditingRecord(record);
    if (type === "Danh mục") {
      setFormData(
        record || {
          ma_danh_muc: "",
          ten_danh_muc: "",
          loai: "",
          mo_ta: "",
          trang_thai: "1",
        }
      );
    } else if (type === "Khen thưởng/Kỷ luật") {
      if (record) {
        const selectedSinhVien = sinhVien.find(
          (sv) => sv.id === record.sinh_vien_id
        );
        const selectedLop = selectedSinhVien
          ? originalLopList.find((lop) => lop.id === selectedSinhVien.lop_id)
          : null;

        if (selectedLop) {
          const selectedKhoa = danhSachKhoa.find(k => k.id === selectedLop.khoa_dao_tao_id);
          const selectedHeDaoTao = selectedKhoa
            ? danhSachHeDaoTao.find(h => h.id === selectedKhoa.he_dao_tao_id)
            : null;

          if (selectedHeDaoTao) {
            setHeDaoTaoChon(selectedHeDaoTao.id);
            getDanhSachKhoaDaoTaobyId(selectedHeDaoTao.id).then(khoaData => {
              setDanhSachKhoa(khoaData);
              if (selectedKhoa) {
                setKhoaDaoTaoChon(selectedKhoa.id);
                getListClassByKhoaDaoTaoId(selectedKhoa.id).then(lopData => {
                  setDSLop(lopData);
                  setLopChon(selectedLop.id);
                  fetchSinhVienTheoLop(selectedLop.id);
                });
              }
            });
          }
        }

        setFormData({
          ...record,
          sinh_vien_id: selectedSinhVien ? selectedSinhVien.id : "",
        });
      } else {
        setHeDaoTaoChon("");
        setKhoaDaoTaoChon("");
        setLopChon(null);
        setSinhVienTheoLop([]);
        setFormData({
          sinh_vien_id: "",
          danh_muc_id: "",
          ly_do: "",
          muc_thuong_phat: "",
          ngay_quyet_dinh: "",
          so_quyet_dinh: "",
          nguoi_ky: "",
          hinh_thuc: "",
          ghi_chu: "",
        });
      }
    }
    setDialogOpen(true);
  };

  const validateForm = () => {
    let validationErrors = {};
    if (dialogType === "Danh mục") {
      if (!formData.ma_danh_muc) {
        validationErrors.ma_danh_muc = "Vui lòng chọn mã danh mục.";
      }
      if (!formData.ten_danh_muc) {
        validationErrors.ten_danh_muc = "Vui lòng chọn tên danh mục.";
      }
      if (!formData.loai) {
        validationErrors.loai = "Vui lòng chọn loại khen thưởng/ kỷ luật.";
      }
    } else {
      if (!formData.danh_muc_id) {
        validationErrors.danh_muc_id =
          "Vui lòng chọn danh mục khen thưởng/ kỷ luật.";
      }
      if (!formData.sinh_vien_id) {
        validationErrors.sinh_vien_id = "Vui lòng chọn học viên.";
      }
      if (!formData.ly_do) {
        validationErrors.ly_do = "Vui lòng nhập lý do.";
      }
      if (!formData.muc_thuong_phat) {
        validationErrors.muc_thuong_phat = "Vui lòng nhập mức thưởng/ phạt.";
      }
      if (!formData.ngay_quyet_dinh) {
        validationErrors.ngay_quyet_dinh = "Vui lòng chọn ngày quyết định.";
      }
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (dialogType === "Danh mục") {
        if (editingRecord) {
          await updateDanhMucKhenKyLuat(editingRecord.id, formData);
        } else {
          await createdanhmuckhenkyluat(formData);
        }
        fetchDanhMuc();
      } else {
        if (editingRecord) {
          await updateKhenKyLuat(editingRecord.id, formData);
        } else {
          await createKhenKyLuat(formData);
        }
        fetchKhenKyLuat();
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleDelete = async (id, dialogType) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
      try {
        if (dialogType === "Danh mục") {
          await deleteDanhMucKhenKyLuat(id);
          fetchDanhMuc();
        } else {
          await deleteKhenKyLuat(id);
          fetchKhenKyLuat();
        }
      } catch (error) {
        console.error("Lỗi khi xóa dữ liệu:", error);
      }
    }
  };

  const handleThoiHocSave = async () => {
    let validationErrors = {};
    if (selectedThoiHocList.length === 0) {
      validationErrors.selectedThoiHocList = "Vui lòng chọn ít nhất một học viên.";
    }
    if (!lyDoThoiHoc.trim()) {
      validationErrors.lyDoThoiHoc = "Vui lòng nhập lý do thôi học.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorsThoiHoc(validationErrors);
      return;
    }

    try {
      await Promise.all(
        selectedThoiHocList.map(id => updateStudentById({ dang_hoc: 3, ghi_chu: lyDoThoiHoc }, id))
      );

      // Refresh Data
      await fetchSinhVien(); // this will trigger the effect that runs handleFilterThoiHoc

      setDialogThoiHocOpen(false);
      setSelectedThoiHocList([]);
      setLyDoThoiHoc("");
      setErrorsThoiHoc({});
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thôi học:", error);
    }
  };

  const renderKhenKyLuatTable = (data, page, setPage, rowsPerPage, setRowsPerPage) => (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã SV</TableCell>
              <TableCell>Học viên</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Lý do</TableCell>
              <TableCell>Mức thưởng/phạt</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((record) => {
                const ho_dem_SV = sinhVien.find(
                  (sv) => sv.id === record.sinh_vien_id
                )?.ho_dem;
                const ten_SV = sinhVien.find(
                  (sv) => sv.id === record.sinh_vien_id
                )?.ten;
                const danhMucName = danhMuc.find(
                  (dm) => dm.id === record.danh_muc_id
                )?.ten_danh_muc;
                const sinhVienName = `${ho_dem_SV} ${ten_SV}`;

                const ma_sv = sinhVien.find(
                  (sv) => sv.id === record.sinh_vien_id
                )?.ma_sinh_vien;
                return (
                  <TableRow key={record.id}>
                    <TableCell>{ma_sv || "Không tìm thấy"}</TableCell>
                    <TableCell>{sinhVienName || "Không tìm thấy"}</TableCell>
                    <TableCell>{danhMucName || "Không tìm thấy"}</TableCell>
                    <TableCell>{record.ly_do}</TableCell>
                    <TableCell>{record.muc_thuong_phat}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleOpenDialog(record, "Khen thưởng/Kỷ luật")}
                      >
                        <Edit /> Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(record.id, "Khen thưởng/Kỷ luật")}
                      >
                        <Delete /> Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
        labelRowsPerPage="Số dòng mỗi trang"
      />
    </Box>
  );

  return (
    <div>
      <Tabs value={tabIndex} onChange={(e, newValue) => {
        setTabIndex(newValue);
        setFilterHeDaoTao("");
        setFilterKhoaDaoTao("");
        setFilterLop("");
        setFilterDanhMuc("");
        handleFilter(); // Clear filters when changing tabs
        handleFilterThoiHoc();
      }}>
        <Tab label="Khen thưởng" />
        <Tab label="Kỷ luật" />
        <Tab label="Danh mục" />
        <Tab label="Xét thôi học" />
      </Tabs>

      {(tabIndex === 0 || tabIndex === 1) && (
        <Box mt={3}>
          <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Hệ đào tạo</InputLabel>
              <Select
                value={filterHeDaoTao}
                label="Hệ đào tạo"
                onChange={(e) => {
                  setFilterHeDaoTao(e.target.value);
                  setFilterKhoaDaoTao("");
                  setFilterLop("");
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhSachHeDaoTao.map((h) => (
                  <MenuItem key={h.id} value={h.id}>{h.ten_he_dao_tao}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Khóa đào tạo</InputLabel>
              <Select
                value={filterKhoaDaoTao}
                label="Khóa đào tạo"
                onChange={(e) => {
                  setFilterKhoaDaoTao(e.target.value);
                  setFilterLop("");
                }}
                disabled={!filterHeDaoTao}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhSachKhoaFilter.map((k) => (
                  <MenuItem key={k.id} value={k.id}>{k.ten_khoa}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Lớp</InputLabel>
              <Select
                value={filterLop}
                label="Lớp"
                onChange={(e) => setFilterLop(e.target.value)}
                disabled={!filterKhoaDaoTao}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {dsLopFilter.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.ma_lop}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={filterDanhMuc}
                label="Danh mục"
                onChange={(e) => setFilterDanhMuc(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhMuc
                  .filter(dm => dm.loai === (tabIndex === 0 ? "khen_thuong" : "ky_luat"))
                  .map(dm => (
                    <MenuItem key={dm.id} value={dm.id}>{dm.ten_danh_muc}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>

            <Button variant="contained" color="primary" onClick={handleFilter}>
              Lọc
            </Button>
          </Box>
        </Box>
      )}

      {tabIndex === 0 && (
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog(null, "Khen thưởng/Kỷ luật")}
            >
              Thêm Khen thưởng/Kỷ luật
            </Button>
          </Box>
          {renderKhenKyLuatTable(filteredKhenThuong, pageKhenThuong, setPageKhenThuong, rowsPerPageKhenThuong, setRowsPerPageKhenThuong)}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog(null, "Khen thưởng/Kỷ luật")}
            >
              Thêm Khen thưởng/Kỷ luật
            </Button>
          </Box>
          {renderKhenKyLuatTable(filteredKyLuat, pageKyLuat, setPageKyLuat, rowsPerPageKyLuat, setRowsPerPageKyLuat)}
        </Box>
      )}

      {tabIndex === 2 && (
        <div>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog(null, "Danh mục")}
            >
              Thêm danh mục
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã danh mục</TableCell>
                  <TableCell>Tên danh mục</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhMuc
                  .slice(
                    pageDanhMuc * rowsPerPageDanhMuc,
                    pageDanhMuc * rowsPerPageDanhMuc + rowsPerPageDanhMuc
                  )
                  .map((dm) => (
                    <TableRow key={dm.id}>
                      <TableCell>{dm.ma_danh_muc}</TableCell>
                      <TableCell>{dm.ten_danh_muc}</TableCell>
                      <TableCell>
                        {dm.loai === "khen_thuong" ? "Khen thưởng" : "Kỷ luật"}
                      </TableCell>
                      <TableCell>{dm.mo_ta}</TableCell>
                      <TableCell>
                        {dm.trang_thai ? "Đang mở" : "Đã đóng"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenDialog(dm, "Danh mục")}
                        >
                          <Edit /> Sửa
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(dm.id, "Danh mục")}
                        >
                          <Delete /> Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={danhMuc.length}
            rowsPerPage={rowsPerPageDanhMuc}
            page={pageDanhMuc}
            onPageChange={(event, newPage) => setPageDanhMuc(newPage)}
            onRowsPerPageChange={(event) =>
              setRowsPerPageDanhMuc(parseInt(event.target.value, 10))
            }
            labelRowsPerPage="Số dòng mỗi trang"
          />
        </div>
      )}

      {tabIndex === 3 && (
        <Box mt={3}>
          <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Hệ đào tạo</InputLabel>
              <Select
                value={filterHeDaoTao}
                label="Hệ đào tạo"
                onChange={(e) => {
                  setFilterHeDaoTao(e.target.value);
                  setFilterKhoaDaoTao("");
                  setFilterLop("");
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhSachHeDaoTao.map((h) => (
                  <MenuItem key={h.id} value={h.id}>{h.ten_he_dao_tao}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Khóa đào tạo</InputLabel>
              <Select
                value={filterKhoaDaoTao}
                label="Khóa đào tạo"
                onChange={(e) => {
                  setFilterKhoaDaoTao(e.target.value);
                  setFilterLop("");
                }}
                disabled={!filterHeDaoTao}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhSachKhoaFilter.map((k) => (
                  <MenuItem key={k.id} value={k.id}>{k.ten_khoa}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Lớp</InputLabel>
              <Select
                value={filterLop}
                label="Lớp"
                onChange={(e) => setFilterLop(e.target.value)}
                disabled={!filterKhoaDaoTao}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {dsLopFilter.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.ma_lop}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" color="primary" onClick={handleFilterThoiHoc}>
              Lọc
            </Button>
          </Box>

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="error"
              disabled={selectedThoiHocList.length === 0}
              onClick={() => {
                setDialogThoiHocOpen(true);
                setLyDoThoiHoc("");
                setErrorsThoiHoc({});
              }}
            >
              Thôi học
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={isSomeSelectedThoiHoc}
                      checked={isAllSelectedThoiHoc}
                      onChange={handleSelectAllThoiHoc}
                    />
                  </TableCell>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Năm học</TableCell>
                  <TableCell>Tình trạng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentThoiHocPageData.map((sv) => {
                  const statusLabel = sv.dang_hoc === 1 ? "Đang học" :
                    sv.dang_hoc === 2 ? "Bảo lưu" :
                      sv.dang_hoc === 3 ? "Thôi học" :
                        sv.dang_hoc === 4 ? "Tốt nghiệp" :
                          sv.dang_hoc === 5 ? "Chuyển trường" :
                            "Không xác định";
                  const isItemSelected = selectedThoiHocList.includes(sv.id);
                  return (
                    <TableRow key={sv.id} hover selected={isItemSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleSelectThoiHoc(event, sv.id)}
                        />
                      </TableCell>
                      <TableCell>{sv.ma_sinh_vien}</TableCell>
                      <TableCell>{`${sv.ho_dem} ${sv.ten}`}</TableCell>
                      <TableCell>{sv.nam_hoc}</TableCell>
                      <TableCell>{statusLabel}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={filteredThoiHocList.length}
            rowsPerPage={rowsPerPageThoiHoc}
            page={pageThoiHoc}
            onPageChange={(event, newPage) => setPageThoiHoc(newPage)}
            onRowsPerPageChange={(event) =>
              setRowsPerPageThoiHoc(parseInt(event.target.value, 10))
            }
            labelRowsPerPage="Số dòng mỗi trang"
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingRecord ? `Chỉnh sửa ${dialogType}` : `Thêm ${dialogType}`}
        </DialogTitle>
        <DialogContent>
          {dialogType === "Danh mục" && (
            <>
              <TextField
                label="Mã danh mục"
                fullWidth
                required
                margin="normal"
                value={formData.ma_danh_muc}
                onChange={(e) =>
                  setFormData({ ...formData, ma_danh_muc: e.target.value })
                }
                error={!!errors.ma_danh_muc}
                helperText={errors.ma_danh_muc}
              />
              <TextField
                label="Tên danh mục"
                fullWidth
                required
                margin="normal"
                value={formData.ten_danh_muc}
                onChange={(e) =>
                  setFormData({ ...formData, ten_danh_muc: e.target.value })
                }
                error={!!errors.ten_danh_muc}
                helperText={errors.ten_danh_muc}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel required>Loại</InputLabel>
                <Select
                  value={formData.loai}
                  onChange={(e) =>
                    setFormData({ ...formData, loai: e.target.value })
                  }
                  error={!!errors.loai}
                >
                  <MenuItem value="khen_thuong">Khen thưởng</MenuItem>
                  <MenuItem value="ky_luat">Kỷ luật</MenuItem>
                </Select>
                {errors.loai && (
                  <span style={{ color: "red" }}>{errors.loai}</span>
                )}
              </FormControl>
              <TextField
                label="Mô tả"
                fullWidth
                margin="normal"
                multiline
                value={formData.mo_ta}
                onChange={(e) =>
                  setFormData({ ...formData, mo_ta: e.target.value })
                }
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.trang_thai}
                  onChange={(e) =>
                    setFormData({ ...formData, trang_thai: e.target.value })
                  }
                >
                  <MenuItem value={1}>Mở</MenuItem>
                  <MenuItem value={0}>Đóng</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {dialogType === "Khen thưởng/Kỷ luật" && (
            <>
              <Autocomplete
                options={danhMuc.filter((dm) => dm.trang_thai === 1)}
                getOptionLabel={(option) => option.ten_danh_muc}
                value={
                  danhMuc.find((dm) => dm.id === formData.danh_muc_id) || null
                }
                onChange={(e, newValue) =>
                  setFormData({ ...formData, danh_muc_id: newValue?.id || "" })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Danh mục"
                    margin="normal"
                    required
                    error={!!errors.danh_muc_id}
                    helperText={errors.danh_muc_id}
                  />
                )}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Hệ đào tạo *</InputLabel>
                <Select
                  value={heDaoTaoChon}
                  onChange={(e) => {
                    const heDaoTaoId = e.target.value;
                    setHeDaoTaoChon(heDaoTaoId);
                    setKhoaDaoTaoChon("");
                    setLopChon(null);
                    setSinhVienTheoLop([]);
                    setFormData({ ...formData, sinh_vien_id: "" });
                  }}
                >
                  <MenuItem value="">Chọn hệ đào tạo</MenuItem>
                  {danhSachHeDaoTao.map((heDaoTao) => (
                    <MenuItem key={heDaoTao.id} value={heDaoTao.id}>
                      {heDaoTao.ten_he_dao_tao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Khóa đào tạo *</InputLabel>
                <Select
                  value={khoaDaoTaoChon}
                  onChange={(e) => {
                    const khoaDaoTaoId = e.target.value;
                    setKhoaDaoTaoChon(khoaDaoTaoId);
                    setLopChon(null);
                    setSinhVienTheoLop([]);
                    setFormData({ ...formData, sinh_vien_id: "" });
                  }}
                  disabled={!heDaoTaoChon}
                >
                  <MenuItem value="">Chọn khóa đào tạo</MenuItem>
                  {danhSachKhoa.map((khoa) => (
                    <MenuItem key={khoa.id} value={khoa.id}>
                      {khoa.ten_khoa}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                options={dsLop}
                getOptionLabel={(option) => option.ma_lop}
                value={dsLop.find((lop) => lop.id === lopChon) || null}
                onChange={async (e, newValue) => {
                  setLopChon(newValue?.id || null);

                  if (newValue) {
                    try {
                      const response = await getDanhSachSinhVienTheoLop(
                        newValue.id
                      );
                      setSinhVienTheoLop(response.data);
                    } catch (error) {
                      console.error("Lỗi khi tải danh sách sinh viên:", error);
                    }
                  } else {
                    setSinhVienTheoLop([]);
                  }

                  setFormData({ ...formData, sinh_vien_id: "" });
                }}
                disabled={!khoaDaoTaoChon}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Lớp *"
                    margin="normal"
                    required
                  />
                )}
              />

              <Autocomplete
                options={sinhVienTheoLop}
                getOptionLabel={(option) =>
                  `${option.ho_dem} ${option.ten} - ${option.ma_sinh_vien}`
                }
                value={
                  sinhVienTheoLop.find(
                    (sv) => sv.id === formData.sinh_vien_id
                  ) || null
                }
                onChange={(e, newValue) =>
                  setFormData({ ...formData, sinh_vien_id: newValue?.id || "" })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Học viên"
                    margin="normal"
                    required
                    error={!!errors.sinh_vien_id}
                    helperText={errors.sinh_vien_id}
                  />
                )}
              />

              <TextField
                label="Lý do"
                fullWidth
                required
                margin="normal"
                value={formData.ly_do}
                onChange={(e) =>
                  setFormData({ ...formData, ly_do: e.target.value })
                }
                error={!!errors.ly_do}
                helperText={errors.ly_do}
              />
              <TextField
                label="Mức thưởng/phạt"
                fullWidth
                required
                margin="normal"
                value={formData.muc_thuong_phat}
                onChange={(e) =>
                  setFormData({ ...formData, muc_thuong_phat: e.target.value })
                }
                error={!!errors.muc_thuong_phat}
                helperText={errors.muc_thuong_phat}
              />
              <TextField
                fullWidth
                required
                margin="normal"
                label="Ngày quyết định"
                type="date"
                value={formData.ngay_quyet_dinh}
                onChange={(e) =>
                  setFormData({ ...formData, ngay_quyet_dinh: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.ngay_quyet_dinh}
                helperText={errors.ngay_quyet_dinh}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Số quyết định"
                value={formData.so_quyet_dinh}
                onChange={(e) =>
                  setFormData({ ...formData, so_quyet_dinh: e.target.value })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Người ký"
                value={formData.nguoi_ky}
                onChange={(e) =>
                  setFormData({ ...formData, nguoi_ky: e.target.value })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Hình thức"
                value={formData.hinh_thuc}
                onChange={(e) =>
                  setFormData({ ...formData, hinh_thuc: e.target.value })
                }
              />

              <TextField
                fullWidth
                margin="normal"
                label="Ghi chú"
                multiline
                rows={2}
                value={formData.ghi_chu}
                onChange={(e) =>
                  setFormData({ ...formData, ghi_chu: e.target.value })
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Thôi học */}
      <Dialog open={dialogThoiHocOpen} onClose={() => setDialogThoiHocOpen(false)}>
        <DialogTitle>Xác nhận Thôi học</DialogTitle>
        <DialogContent>
          <Box mb={2} mt={1}>
            Đang chọn: {selectedThoiHocList.length} học viên
          </Box>
          <TextField
            label="Lý do"
            fullWidth
            required
            margin="normal"
            value={lyDoThoiHoc}
            onChange={(e) => setLyDoThoiHoc(e.target.value)}
            error={!!errorsThoiHoc.lyDoThoiHoc}
            helperText={errorsThoiHoc.lyDoThoiHoc}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogThoiHocOpen(false)}>Hủy</Button>
          <Button onClick={handleThoiHocSave} color="error" variant="contained">
            Xác nhận Thôi học
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
