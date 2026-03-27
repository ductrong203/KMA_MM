import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Typography,
  Tabs,
  Tab,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TablePagination,
  FormHelperText,
  Box,
  Chip,
  Alert,
  DialogContentText,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";

import {
  createMilitaryInfo,
  createNewStudent,
  getAllMiri,
  getAllStudent,
  getListClassByKhoaDaoTaoId,
  getMilitaryInfoByStudentId,
  updateMilitaryInfoByStudentId,
  updateStudentById,
  updateMilitaryInfo,
} from "../../Api_controller/Service/qlhvService";
import { exportStudentsToExcel, importStudentsFromExcel } from "../../Api_controller/Service/excelService";
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import { getAllDoiTuongQuanLy } from "../../Api_controller/Service/dtqlService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import { fetchDanhSachKhoa } from "../../Api_controller/Service/khoaService";
import { toast } from "react-toastify";
import PageHeader from "../../layout/PageHeader";
import { checkExistingStudents, getDanhSachSinhVienTheoLop } from "../../Api_controller/Service/sinhVienService";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [studentData, setStudentData] = useState({
    ma_sinh_vien: "",
    ngay_sinh: "",
    gioi_tinh: false,
    que_quan: "",
    lop_id: "",
    doi_tuong_id: "",
    dang_hoc: 1,
    ghi_chu: "",
    ho_dem: "",
    ten: "",
    so_tai_khoan: "",
    ngan_hang: "",
    chuc_vu: "",
    CCCD: "",
    ngay_cap_CCCD: "",
    noi_cap_CCCD: "",
    ky_nhap_hoc: "",
    ngay_vao_doan: "",
    ngay_vao_dang: "",
    ngay_vao_truong: "",
    ngay_ra_truong: "",
    tinh_thanh: "",
    quan_huyen: "",
    phuong_xa_khoi: "",
    dan_toc: "",
    ton_giao: "",
    quoc_tich: "",
    to_hop_xet_tuyen: "",
    diem_trung_tuyen: "",
    nam_tot_nghiep_PTTH: "",
    thanh_phan_gia_dinh: "",
    doi_tuong_dao_tao: "",
    dv_lien_ket_dao_tao: "",
    so_dien_thoai: "",
    dien_thoai_gia_dinh: "",
    dien_thoai_CQ: "",
    email: "",
    khi_can_bao_tin_cho_ai: "",
    noi_tru: false,
    ngoai_tru: false,
  });

  const [militaryData, setMilitaryData] = useState({
    sinh_vien_id: null,
    ngay_nhap_ngu: "",
    cap_bac: "",
    trinh_do_van_hoa: "",
    noi_o_hien_nay: "",
    don_vi_cu_di_hoc: "",
    loai_luong: "",
    nhom_luong: "",
    bac_luong: "",
    he_so_luong: "",
    ngay_nhan_luong: "",
    chuc_vu: "",
    suc_khoe: "",
  });

  // THÊM STATE MỚI cho danh sách military records
  const [militarys, setMilitary] = useState([]);

  const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
  const [danhSachDoiTuongQL, setDanhSachDoiTuongQL] = useState([]);
  const [danhSachLop, setDanhSachLop] = useState([]);
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [originalLopList, setOriginalLopList] = useState([]);

  // State cho bộ lọc
  const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
  const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
  const [lopFilter, setLopFilter_] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lop_tu_sinh, setLop_ts] = useState({ lop_id: "", ma_lop: "" });
  const [errors, setErrors] = useState("");

  // State phân trang - THAY ĐỔI MẶC ĐỊNH THÀNH 40
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(40);

  // State cho bộ lọc mới
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [displayStudents, setDisplayStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // State cho dialog
  const [existingCount, setExistingCount] = useState(0); // Lưu số lượng học viên tồn tại
  const [importData, setImportData] = useState(null); // Lưu dữ liệu để import
  const role = localStorage.getItem("role") || "";

  // Logic fetch data ban đầu - THAY ĐỔI: Không lấy tất cả sinh viên nữa
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Chỉ lấy các danh sách reference, không lấy sinh viên
        const data3 = await fetchDanhSachHeDaoTao();
        const data4 = await getAllDoiTuongQuanLy();
        const data5 = await getDanhSachLop();
        const data6 = await fetchDanhSachKhoa();

        console.log("danh sach he dao tao", data3);
        console.log("danh doi tuong quan ly", data4);
        console.log("danh sách lop", data5);
        console.log("danh sách khoa", data6);

        setDanhSachHeDaoTao(data3);
        setDanhSachDoiTuongQL(data4);
        setDanhSachLop(data5);
        setOriginalLopList(data5);
        setDanhSachKhoa(data6);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu ban đầu:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Lọc khóa đào tạo theo hệ đào tạo (giữ nguyên)
  useEffect(() => {
    const fetchKhoaDaoTao = async () => {
      if (heDaoTaoFilter) {
        try {
          const data = await getDanhSachKhoaDaoTaobyId(heDaoTaoFilter);
          setDanhSachKhoa(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách khóa đào tạo:", error);
          setDanhSachKhoa([]);
        }
      } else {
        setDanhSachKhoa([]);
        setDanhSachLop(originalLopList);
      }
    };
    fetchKhoaDaoTao();
  }, [heDaoTaoFilter, originalLopList]);

  // Lọc lớp theo khóa đào tạo (giữ nguyên)
  useEffect(() => {
    const fetchLopByKhoaDaoTao = async () => {
      if (khoaDaoTaoFilter) {
        try {
          const data = await getListClassByKhoaDaoTaoId(khoaDaoTaoFilter);
          setDanhSachLop(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách lớp theo khóa đào tạo:", error);
          setDanhSachLop(originalLopList);
        }
      } else {
        setDanhSachLop(originalLopList);
      }
    };
    fetchLopByKhoaDaoTao();
  }, [khoaDaoTaoFilter, originalLopList]);

  // THÊM MỚI: Logic áp dụng bộ lọc - sử dụng API getbylopid
  const handleApplyFilter = async () => {
    try {
      let filtered = [];

      // Nếu có chọn lớp cụ thể, gọi API getbylopid
      if (lopFilter) {
        console.log(`Gọi API getbylopid với lop_id: ${lopFilter}`);
        const studentsFromAPI = await getDanhSachSinhVienTheoLop(lopFilter);
        console.log("Dữ liệu từ API getbylopid:", studentsFromAPI);

        // SỬA LỖI: Lấy data từ response object
        filtered = studentsFromAPI?.data || studentsFromAPI || [];

        // THÊM: Cập nhật cả students state để các hàm khác có thể tìm thấy
        setStudents(filtered);

        // Lọc thêm theo từ khóa tìm kiếm nếu có
        if (searchTerm) {
          filtered = filtered.filter((student) => {
            const fullName = `${student.ho_dem} ${student.ten}`.toLowerCase();
            const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
            const matchesSearch =
              searchWords.every((word) => fullName.includes(word)) ||
              student.ma_sinh_vien.includes(searchTerm);
            return matchesSearch;
          });
        }
      } else {
        // Nếu không chọn lớp cụ thể, lấy tất cả sinh viên và lọc
        console.log("Lấy tất cả sinh viên và lọc");
        const allStudents = await getAllStudent();
        setStudents(allStudents); // Cập nhật students state
        filtered = allStudents;

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
          filtered = filtered.filter((student) => {
            const fullName = `${student.ho_dem} ${student.ten}`.toLowerCase();
            const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
            const matchesSearch =
              searchWords.every((word) => fullName.includes(word)) ||
              student.ma_sinh_vien.includes(searchTerm);
            return matchesSearch;
          });
        }
      }

      setDisplayStudents(filtered);
      setIsFilterApplied(true);
      setPage(0);
      toast.success(`Đã tìm thấy ${filtered.length} học viên phù hợp`);
    } catch (error) {
      console.error("Lỗi khi áp dụng bộ lọc:", error);
      toast.error(`Lỗi khi lấy danh sách học viên: ${error.message || error}`);
    }
  };

  // THÊM MỚI: Hủy bộ lọc - reset về trạng thái ban đầu
  const handleClearFilter = () => {
    setHeDaoTaoFilter("");
    setKhoaDaoTaoFilter("");
    setLopFilter_("");
    setSearchTerm("");
    setDisplayStudents([]);
    setIsFilterApplied(false);
    setStudents([]); // Reset students array
    setPage(0);
    toast.info("Đã hủy bộ lọc");
  };

  // Logic generateMaSinhVien (giữ nguyên)
  const generateMaSinhVien = (lop_id) => {
    const finalLopId = lop_id || lopFilter;

    if (!finalLopId) return "";
    const lop = danhSachLop.find((l) => l.id === finalLopId);
    if (!lop) return "";
    const soLuongSinhVien = students.filter((sv) => sv.lop_id === finalLopId).length;
    return `${lop.ma_lop}${String(soLuongSinhVien + 1).padStart(2, "0")}`;
  };

  // THÊM MỚI: Function lấy tên hệ đào tạo
  const getHeDaoTaoName = (lop_id) => {
    const lop = originalLopList.find(l => l.id === lop_id);
    if (!lop) return "Chưa xác định";

    const khoa = danhSachKhoa.find(k => k.id === lop.khoa_dao_tao_id);
    if (!khoa) return "Chưa xác định";

    const heDaoTao = danhSachHeDaoTao.find(h => h.id === khoa.he_dao_tao_id);
    return heDaoTao ? heDaoTao.ten_he_dao_tao : "Chưa xác định";
  };

  // Utility functions (giữ nguyên)
  const getDoiTuongName = (id) => {
    const doiTuong = danhSachDoiTuongQL.find((item) => item.id === Number(id));
    return doiTuong ? doiTuong.ten_doi_tuong : "Không xác định";
  };

  const getMaLop = (id) => {
    const lop = danhSachLop.find((item) => item.id === Number(id));
    return lop ? lop.ma_lop : "Không xác định";
  };

  // Thêm function này sau các helper function khác (sau getMaLop)
  const isQuanNhan = (doiTuongId) => {
    if (!doiTuongId) return false;
    const doiTuong = danhSachDoiTuongQL.find(item => item.id === doiTuongId);
    if (!doiTuong) return false;

    const quanNhanList = ["quân đội", "công an", "đảng chính quyền"];
    return quanNhanList.includes(doiTuong.ten_doi_tuong.toLowerCase());
  };

  // THAY ĐỔI: Logic hiển thị dữ liệu
  const filteredStudents = isFilterApplied ? displayStudents : students;
  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Pagination handlers (giữ nguyên)
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  // handleOpen (giữ nguyên)
  const handleOpen = async (student = null) => {
    setErrors({});
    if (student) {
      // Editing existing student
      setEditIndex(student.id);
      setStudentData({ ...student });

      // THÊM MỚI: Load thông tin quân nhân nếu là đối tượng quân nhân
      if (isQuanNhan(student.doi_tuong_id)) {
        try {
          const militaryInfo = await getMilitaryInfoByStudentId(student.id);
          if (militaryInfo) {
            setMilitaryData(militaryInfo);
          } else {
            // Reset military data nếu chưa có
            setMilitaryData({
              sinh_vien_id: student.id,
              ngay_nhap_ngu: "",
              cap_bac: "",
              trinh_do_van_hoa: "",
              noi_o_hien_nay: "",
              don_vi_cu_di_hoc: "",
              loai_luong: "",
              nhom_luong: "",
              bac_luong: "",
              he_so_luong: "",
              ngay_nhan_luong: "",
              chuc_vu: "",
              suc_khoe: "",
            });
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin quân nhân:", error);
          // Reset military data nếu có lỗi
          setMilitaryData({
            sinh_vien_id: student.id,
            ngay_nhap_ngu: "",
            cap_bac: "",
            trinh_do_van_hoa: "",
            noi_o_hien_nay: "",
            don_vi_cu_di_hoc: "",
            loai_luong: "",
            nhom_luong: "",
            bac_luong: "",
            he_so_luong: "",
            ngay_nhan_luong: "",
            chuc_vu: "",
            suc_khoe: "",
          });
        }
      }
    } else {
      // Adding new student
      setEditIndex(null);

      // ✅ Truyền lopFilter trực tiếp vào generateMaSinhVien
      const newMaSinhVien = lopFilter ? generateMaSinhVien(lopFilter) : "";

      setStudentData({
        ma_sinh_vien: newMaSinhVien,
        ngay_sinh: "",
        gioi_tinh: 1,
        que_quan: "",
        lop_id: lopFilter || "",
        doi_tuong_id: "",
        dang_hoc: 1,
        ghi_chu: "",
        ho_dem: "",
        ten: "",
        so_tai_khoan: "",
        ngan_hang: "",
        chuc_vu: "",
        CCCD: "",
        ngay_cap_CCCD: "",
        noi_cap_CCCD: "",
        ky_nhap_hoc: "",
        ngay_vao_doan: "",
        ngay_vao_dang: "",
        ngay_vao_truong: "",
        ngay_ra_truong: "",
        tinh_thanh: "",
        quan_huyen: "",
        phuong_xa_khoi: "",
        dan_toc: "Kinh",
        ton_giao: "Không",
        quoc_tich: "",
        to_hop_xet_tuyen: "",
        diem_trung_tuyen: "",
        nam_tot_nghiep_PTTH: "",
        thanh_phan_gia_dinh: "",
        doi_tuong_dao_tao: "",
        dv_lien_ket_dao_tao: "",
        so_dien_thoai: "",
        dien_thoai_gia_dinh: "",
        dien_thoai_CQ: "",
        email: "",
        khi_can_bao_tin_cho_ai: "",
        noi_tru: false,
        ngoai_tru: false,
      });

      // Reset military data
      setMilitaryData({
        sinh_vien_id: null,
        ngay_nhap_ngu: "",
        cap_bac: "",
        trinh_do_van_hoa: "",
        noi_o_hien_nay: "",
        don_vi_cu_di_hoc: "",
        loai_luong: "",
        nhom_luong: "",
        bac_luong: "",
        he_so_luong: "",
        ngay_nhan_luong: "",
        chuc_vu: "",
        suc_khoe: "",
      });
    }
    setOpen(true);
  };

  // handleOpenDetail - SỬA: Tìm từ đúng nguồn dữ liệu
  const handleOpenDetail = async (studentId) => {
    try {
      if (!studentId) {
        toast.error("ID học viên không hợp lệ!");
        return;
      }

      // SỬA: Tìm từ displayStudents nếu filter được áp dụng, ngược lại tìm từ students
      const searchList = isFilterApplied ? displayStudents : students;
      const student = searchList.find((s) => s.id === studentId);
      if (!student) {
        toast.error("Không tìm thấy học viên!");
        return;
      }

      setStudentData({
        ma_sinh_vien: student.ma_sinh_vien || "",
        ngay_sinh: student.ngay_sinh || "",
        gioi_tinh: student.gioi_tinh ?? false,
        que_quan: student.que_quan || "",
        lop_id: student.lop_id || "",
        doi_tuong_id: student.doi_tuong_id || "",
        dang_hoc: student.dang_hoc ?? 1,
        ghi_chu: student.ghi_chu || "",
        ho_dem: student.ho_dem || "",
        ten: student.ten || "",
        so_tai_khoan: student.so_tai_khoan || "",
        ngan_hang: student.ngan_hang || "",
        chuc_vu: student.chuc_vu || "",
        CCCD: student.CCCD || "",
        ngay_cap_CCCD: student.ngay_cap_CCCD || "",
        noi_cap_CCCD: student.noi_cap_CCCD || "",
        ky_nhap_hoc: student.ky_nhap_hoc || "",
        ngay_vao_doan: student.ngay_vao_doan || "",
        ngay_vao_dang: student.ngay_vao_dang || "",
        ngay_vao_truong: student.ngay_vao_truong || "",
        ngay_ra_truong: student.ngay_ra_truong || "",
        tinh_thanh: student.tinh_thanh || "",
        quan_huyen: student.quan_huyen || "",
        phuong_xa_khoi: student.phuong_xa_khoi || "",
        dan_toc: student.dan_toc || "",
        ton_giao: student.ton_giao || "",
        quoc_tich: student.quoc_tich || "",
        to_hop_xet_tuyen: student.to_hop_xet_tuyen || "",
        diem_trung_tuyen: student.diem_trung_tuyen || "",
        nam_tot_nghiep_PTTH: student.nam_tot_nghiep_PTTH || "",
        thanh_phan_gia_dinh: student.thanh_phan_gia_dinh || "",
        doi_tuong_dao_tao: student.doi_tuong_dao_tao || "",
        dv_lien_ket_dao_tao: student.dv_lien_ket_dao_tao || "",
        so_dien_thoai: student.so_dien_thoai || "",
        dien_thoai_gia_dinh: student.dien_thoai_gia_dinh || "",
        dien_thoai_CQ: student.dien_thoai_CQ || "",
        email: student.email || "",
        khi_can_bao_tin_cho_ai: student.khi_can_bao_tin_cho_ai || "",
        noi_tru: student.noi_tru ?? false,
        ngoai_tru: student.ngoai_tru ?? false,
        id: student.id || "",
      });

      if (student.doi_tuong_id) {
        try {
          const militaryInfo = await getMilitaryInfoByStudentId(studentId);
          setMilitaryData({
            sinh_vien_id: militaryInfo?.sinh_vien_id || null,
            ngay_nhap_ngu: militaryInfo?.ngay_nhap_ngu || "",
            cap_bac: militaryInfo?.cap_bac || "",
            trinh_do_van_hoa: militaryInfo?.trinh_do_van_hoa || "",
            noi_o_hien_nay: militaryInfo?.noi_o_hien_nay || "",
            don_vi_cu_di_hoc: militaryInfo?.don_vi_cu_di_hoc || "",
            loai_luong: militaryInfo?.loai_luong || "",
            nhom_luong: militaryInfo?.nhom_luong || "",
            bac_luong: militaryInfo?.bac_luong || "",
            he_so_luong: militaryInfo?.he_so_luong || "",
            ngay_nhan_luong: militaryInfo?.ngay_nhan_luong || "",
            chuc_vu: militaryInfo?.chuc_vu || "",
            suc_khoe: militaryInfo?.suc_khoe || "",
          });
        } catch (error) {
          console.error("Lỗi khi lấy thông tin quân nhân:", error);
          setMilitaryData({
            sinh_vien_id: null,
            ngay_nhap_ngu: "",
            cap_bac: "",
            trinh_do_van_hoa: "",
            noi_o_hien_nay: "",
            don_vi_cu_di_hoc: "",
            loai_luong: "",
            nhom_luong: "",
            bac_luong: "",
            he_so_luong: "",
            ngay_nhan_luong: "",
            chuc_vu: "",
            suc_khoe: "",
          });
        }
      }

      setOpenDetail(true);
    } catch (error) {
      console.error("Lỗi khi xem chi tiết học viên:", error);
      toast.error(`Lỗi khi tải thông tin chi tiết: ${error.message || error}`);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  const handleGenderChange = (event) => {
    setStudentData((prev) => ({
      ...prev,
      gioi_tinh: Number(event.target.value),
    }));
  };

  // handleSave (giữ nguyên, chỉ thêm refresh data sau khi save)
  const handleSave = async () => {
    try {
      // Validation cho thông tin sinh viên (giữ nguyên)
      let newErrors = {};
      if (!studentData.ho_dem) newErrors.ho_dem = "Họ đệm không được để trống";
      if (!studentData.ten) newErrors.ten = "Tên không được để trống";
      if (!studentData.ma_sinh_vien)
        newErrors.ma_sinh_vien = "Mã học viên không được để trống";
      if (!studentData.ngay_sinh)
        newErrors.ngay_sinh = "Ngày sinh không được để trống";
      if (!studentData.so_dien_thoai)
        newErrors.so_dien_thoai = "Số điện thoại không được để trống";
      if (!studentData.lop_id) newErrors.lop_id = "Lớp không được để trống";
      if (studentData.gioi_tinh === undefined || studentData.gioi_tinh === null)
        newErrors.gioi_tinh = "Giới tính không được để trống";
      if (!studentData.doi_tuong_id)
        newErrors.doi_tuong_id = "Đối tượng không được để trống";
      if (!studentData.que_quan)
        newErrors.que_quan = "Nơi sinh không được để trống";
      if (!studentData.dan_toc)
        newErrors.dan_toc = "Dân tộc không được để trống";
      if (!studentData.CCCD) newErrors.CCCD = "CCCD không được để trống";

      if (studentData.email && !/^\S+@\S+\.\S+$/.test(studentData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
      if (
        studentData.so_dien_thoai &&
        !/^\d{10,11}$/.test(studentData.so_dien_thoai)
      ) {
        newErrors.so_dien_thoai = "Số điện thoại phải có 10-11 chữ số";
      }

      ["ngay_sinh", "ngay_cap_CCCD", "ngay_vao_truong"].forEach((field) => {
        if (studentData[field] && isNaN(Date.parse(studentData[field]))) {
          newErrors[field] = "Ngày không hợp lệ";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Format dữ liệu sinh viên (giữ nguyên logic)
      const formattedStudentData = {
        ...studentData,
        ngay_sinh: studentData.ngay_sinh
          ? new Date(studentData.ngay_sinh).toISOString().split("T")[0]
          : null,
        ngay_cap_CCCD: studentData.ngay_cap_CCCD
          ? new Date(studentData.ngay_cap_CCCD).toISOString().split("T")[0]
          : null,
        ky_nhap_hoc: studentData.ky_nhap_hoc
          ? new Date(studentData.ky_nhap_hoc).toISOString().split("T")[0]
          : null,
        ngay_vao_doan: studentData.ngay_vao_doan
          ? new Date(studentData.ngay_vao_doan).toISOString().split("T")[0]
          : null,
        ngay_vao_dang: studentData.ngay_vao_dang
          ? new Date(studentData.ngay_vao_dang).toISOString().split("T")[0]
          : null,
        ngay_vao_truong: studentData.ngay_vao_truong
          ? new Date(studentData.ngay_vao_truong).toISOString().split("T")[0]
          : null,
        ngay_ra_truong: studentData.ngay_ra_truong
          ? new Date(studentData.ngay_ra_truong).toISOString().split("T")[0]
          : null,
        nam_tot_nghiep_PTTH: studentData.nam_tot_nghiep_PTTH // Keep as string or date? Form uses text field for year? No, code used string earlier
          ? studentData.nam_tot_nghiep_PTTH // Assuming it's just a year string or text from previous code
          : "",
      };

      console.log("Dữ liệu học viên gửi đi:", formattedStudentData);

      // Lưu thông tin sinh viên
      let res;

      if (!studentData.id) {
        res = await createNewStudent(formattedStudentData);
        toast.success("Thêm học viên thành công!");

        // SỬA LỖI: Trích xuất dữ liệu sinh viên từ response (API trả về {message, data})
        const newStudent = res.data || res;

        // Cập nhật cả students và displayStudents để UI hiển thị ngay lập tức
        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);

        // Cập nhật displayStudents nếu đang áp dụng filter
        if (isFilterApplied) {
          const updatedDisplayStudents = [...displayStudents, newStudent];
          setDisplayStudents(updatedDisplayStudents);
        }
      } else {
        res = await updateStudentById(formattedStudentData, formattedStudentData.id);
        toast.success("Cập nhật học viên thành công!");

        // SỬA LỖI: Trích xuất dữ liệu sinh viên từ response (API trả về {message, data})
        const updatedStudent = res.data || res;

        // Cập nhật cả students và displayStudents để UI hiển thị ngay lập tức
        const updatedStudents = students.map(student =>
          student.id === updatedStudent.id ? updatedStudent : student
        );
        setStudents(updatedStudents);

        // Cập nhật displayStudents nếu đang áp dụng filter
        if (isFilterApplied) {
          const updatedDisplayStudents = displayStudents.map(student =>
            student.id === updatedStudent.id ? updatedStudent : student
          );
          setDisplayStudents(updatedDisplayStudents);
        }
      }

      // DEBUG: Kiểm tra toàn bộ flow
      console.log("=== SAVE STUDENT DEBUG ===");
      console.log("studentData:", studentData);
      console.log("res sau khi save:", res);

      // SỬA: Lấy data từ res.data thay vì res
      const actualStudentData = res.data || res;
      console.log("actualStudentData:", actualStudentData);
      console.log("actualStudentData.doi_tuong_id:", actualStudentData.doi_tuong_id);

      const doiTuongFound = danhSachDoiTuongQL.find(item => item.id === actualStudentData.doi_tuong_id);
      console.log("doiTuongFound:", doiTuongFound);

      if (doiTuongFound) {
        console.log("ten_doi_tuong:", doiTuongFound.ten_doi_tuong);
        console.log("ten_doi_tuong.toLowerCase():", doiTuongFound.ten_doi_tuong.toLowerCase());

        const quanNhanList = ["quân đội", "công an", "đảng chính quyền"];
        const isMatch = quanNhanList.includes(doiTuongFound.ten_doi_tuong.toLowerCase());
        console.log("isMatch với quân nhân list:", isMatch);
      }

      const isQuanNhanResult = isQuanNhan(actualStudentData.doi_tuong_id);
      console.log("isQuanNhan result:", isQuanNhanResult);

      // THÊM MỚI: Xử lý thông tin quân nhân nếu là đối tượng quân nhân
      if (isQuanNhan(actualStudentData.doi_tuong_id)) {
        console.log("🎯 BẮT ĐẦU XỬ LÝ THÔNG TIN QUÂN NHÂN");
        try {
          // Kiểm tra xem sinh viên đã có record quân nhân chưa
          const existingMilitaryRecord = await checkMilitaryRecordExists(actualStudentData.id);
          console.log("Existing military record:", existingMilitaryRecord);

          const formattedMilitaryData = {
            ...militaryData,
            sinh_vien_id: actualStudentData.id, // ← SỬA: Dùng actualStudentData.id
            ngay_nhap_ngu: militaryData.ngay_nhap_ngu
              ? new Date(militaryData.ngay_nhap_ngu).toISOString()
              : null,
            ngay_nhan_luong: militaryData.ngay_nhan_luong
              ? new Date(militaryData.ngay_nhan_luong).toISOString()
              : null,
          };

          console.log("Dữ liệu quân nhân gửi đi:", formattedMilitaryData);
          console.log("militaryData hiện tại:", militaryData);

          // Kiểm tra xem có dữ liệu quân nhân nào để cập nhật không (loại bỏ id và sinh_vien_id)
          const hasAnyMilitaryData = Object.keys(militaryData).some(key =>
            key !== 'sinh_vien_id' && key !== 'id' && militaryData[key] && militaryData[key] !== ''
          );

          console.log("hasAnyMilitaryData:", hasAnyMilitaryData);

          if (existingMilitaryRecord) {
            // ĐÃ CÓ RECORD → Luôn cập nhật bằng military record ID
            console.log("Đã có record quân nhân, thực hiện cập nhật với ID:", existingMilitaryRecord.id);
            try {
              // SỬA: Luôn gọi update API khi đã có record (bỏ điều kiện hasAnyMilitaryData)
              const updateResult = await updateMilitaryInfo(formattedMilitaryData, existingMilitaryRecord.id);
              console.log("Cập nhật thông tin quân nhân thành công!", updateResult);
              toast.success("Cập nhật thông tin quân nhân thành công!");
            } catch (updateError) {
              console.log("Lỗi cập nhật:", updateError);
              toast.error("Lỗi khi cập nhật thông tin quân nhân!");
            }
          } else {
            // CHƯA CÓ RECORD → Tạo mới
            console.log("Chưa có record quân nhân, tạo mới...");
            // SỬA: Sử dụng actualStudentData.id thay vì res.id
            const newMilitaryData = hasAnyMilitaryData
              ? formattedMilitaryData
              : {
                sinh_vien_id: actualStudentData.id,
                ngay_nhap_ngu: null,
                cap_bac: '',
                trinh_do_van_hoa: '',
                noi_o_hien_nay: '',
                don_vi_cu_di_hoc: '',
                loai_luong: '',
                nhom_luong: '',
                bac_luong: '',
                he_so_luong: '',
                ngay_nhan_luong: null,
                chuc_vu: '',
                suc_khoe: '',
              };

            try {
              const createResult = await createMilitaryInfo(newMilitaryData);
              console.log("Tạo mới record thông tin quân nhân thành công!", createResult);
              toast.success("Tạo mới thông tin quân nhân thành công!");

              // Cập nhật state militarys để có dữ liệu mới
              setMilitary(prev => [...prev, createResult]);
            } catch (createError) {
              console.log("Lỗi tạo mới:", createError);
              toast.warning("Chưa có thông tin quân nhân");
            }
          }
        } catch (error) {
          console.error("Lỗi khi xử lý thông tin quân nhân:", error);
          toast.error(`Lỗi khi lưu thông tin quân nhân: ${error.message || error}`);
        }
      }

      setOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật học viên:", error);
      toast.error(`Lỗi khi lưu học viên: ${error.message || error}`);
    }
  };

  // handleSaveMilitary - SỬA LỖI
  const handleSaveMilitary = async () => {
    try {
      console.log("Dữ liệu quân nhân cần lưu:", militaryData.sinh_vien_id);
      const formattedData = {
        ...militaryData,
        ngay_nhap_ngu: militaryData.ngay_nhap_ngu
          ? new Date(militaryData.ngay_nhap_ngu).toISOString()
          : null,
        ngay_nhan_luong: militaryData.ngay_nhan_luong
          ? new Date(militaryData.ngay_nhan_luong).toISOString()
          : null,
      };

      if (militaryData.sinh_vien_id) {
        try {
          const res = await updateMilitaryInfoByStudentId(militaryData.sinh_vien_id, formattedData);
          console.log("Cập nhật thông tin quân nhân thành công!", res);
          toast.success("Cập nhật thông tin quân nhân thành công!");
        } catch (updateError) {
          console.log("Lỗi khi cập nhật:", updateError);
          console.log("Thử tạo mới thông tin quân nhân...");
          await createMilitaryInfo(formattedData);
          console.log("Đã tạo mới thông tin quân nhân thành công!");
          toast.success("Tạo mới thông tin quân nhân thành công!");
        }
      } else {
        await createMilitaryInfo(formattedData);
        console.log("Thêm mới thông tin quân nhân thành công!");
        toast.success("Thêm mới thông tin quân nhân thành công!");
      }

      // SỬA: Xóa dòng lỗi này
      // setOpenMilitaryPopup(false);

    } catch (error) {
      console.error("Lỗi khi xử lý thông tin quân nhân:", error);
      toast.error(`Lỗi khi lưu thông tin quân nhân: ${error.message || error}`);
    }
  };

  // renderField (giữ nguyên)
  const renderField = (field) => (
    <Grid item xs={12} sm={4} key={field.key}>
      {field.type === "select" ? (
        <FormControl fullWidth margin="normal" required={field.required} error={!!errors[field.key]}>
          <InputLabel sx={{ backgroundColor: "white" }}>{field.label}</InputLabel>
          <Select
            value={studentData[field.key] !== undefined ? studentData[field.key] : ""}
            onChange={(e) => {
              setStudentData({
                ...studentData,
                [field.key]: e.target.value,
              });
              setErrors((prev) => ({ ...prev, [field.key]: "" }));
            }}
          >
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors[field.key] && <FormHelperText>{errors[field.key]}</FormHelperText>}
        </FormControl>
      ) : field.type === "api" ? (
        <FormControl fullWidth margin="normal" required={field.required} error={!!errors[field.key]}>
          <InputLabel sx={{ backgroundColor: "white" }}>{field.label}</InputLabel>
          <Select
            value={studentData[field.key] || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              const updatedData = { ...studentData, [field.key]: newValue };
              if (field.key === "lop_id") {
                updatedData.ma_sinh_vien = generateMaSinhVien(newValue);
              }
              setStudentData(updatedData);
              setErrors((prev) => ({ ...prev, [field.key]: "" }));
            }}
          >
            <MenuItem value="">Chọn...</MenuItem>
            {field.options.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item[field.optionLabel]}
              </MenuItem>
            ))}
          </Select>
          {errors[field.key] && <FormHelperText>{errors[field.key]}</FormHelperText>}
        </FormControl>
      ) : field.type === "date" ? (
        <TextField
          label={field.label}
          type="date"
          value={studentData[field.key] || ""}
          onChange={(e) => {
            setStudentData({ ...studentData, [field.key]: e.target.value });
            setErrors((prev) => ({ ...prev, [field.key]: "" }));
          }}
          fullWidth
          margin="normal"
          error={!!errors[field.key]}
          helperText={errors[field.key]}
          InputLabelProps={{ shrink: true }}
          required={field.required}
        />
      ) : (
        <TextField
          label={field.label}
          value={studentData[field.key] || ""}
          onChange={(e) => {
            setStudentData({ ...studentData, [field.key]: e.target.value });
            setErrors((prev) => ({ ...prev, [field.key]: "" }));
          }}
          fullWidth
          margin="normal"
          error={!!errors[field.key]}
          helperText={errors[field.key]}
          required={field.required}
        />
      )}
    </Grid>
  );

  // Thêm function này sau renderField function
  const renderMilitaryField = (field) => (
    <Grid item xs={12} sm={4} key={field.key}>
      {field.type === "date" ? (
        <TextField
          label={field.label}
          type="date"
          value={militaryData[field.key] ? militaryData[field.key].slice(0, 10) : ""}
          onChange={(e) => {
            setMilitaryData(prev => ({
              ...prev,
              [field.key]: e.target.value && !isNaN(Date.parse(e.target.value))
                ? new Date(e.target.value).toISOString()
                : e.target.value
            }));
          }}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required={field.required}
        />
      ) : (
        <TextField
          label={field.label}
          value={militaryData[field.key] || ""}
          onChange={(e) => {
            setMilitaryData(prev => ({
              ...prev,
              [field.key]: e.target.value
            }));
          }}
          fullWidth
          margin="normal"
          required={field.required}
        />
      )}
    </Grid>
  );

  // THAY ĐỔI: handleExportToExcel - chỉ xuất dữ liệu đã lọc
  const handleExportToExcel = async () => {
    if (!isFilterApplied) {
      toast.warning("Vui lòng áp dụng bộ lọc và có dữ liệu trước khi xuất Excel.");
      return;
    }

    try {
      const payload = {};
      if (lopFilter) payload.lop_id = lopFilter;
      else if (khoaDaoTaoFilter) payload.khoa_dao_tao_id = khoaDaoTaoFilter;
      else if (heDaoTaoFilter) payload.doi_tuong_quan_ly_id = heDaoTaoFilter;

      const response = await exportStudentsToExcel(payload);
      const blob = response.data;

      const lop = danhSachLop.find((item) => item.id === lopFilter);
      const maLop = lop ? lop.ma_lop : "tat_ca";
      const fileName = `Danh_sach_sinh_vien-${maLop}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Xuất danh sách học viên thành công: ${fileName}`);
    } catch (error) {
      console.error("Lỗi khi xuất danh sách học viên:", error);
      toast.error(`Có lỗi xảy ra khi xuất file Excel: ${error.message || error}`);
    }
  };



  const handleImportFromExcel = async (event) => {
    const file = event.target.files[0];
    if (!file || !lopFilter) {
      toast.warn('Vui lòng chọn file Excel và lớp để nhập!');
      return;
    }

    try {
      // Bước 1: Kiểm tra sinh viên tồn tại
      const checkFormData = new FormData();
      checkFormData.append('file', file);
      checkFormData.append('lop_id', lopFilter);

      const checkResponse = await checkExistingStudents(checkFormData);
      const checkResult = checkResponse.data;

      if (!checkResult.success) {
        throw new Error(checkResult.message || 'Kiểm tra học viên thất bại');
      }

      const { existingCount } = checkResult.data;

      if (existingCount > 0) {
        // Lưu dữ liệu và mở dialog
        setExistingCount(existingCount);
        setImportData({ file, lopFilter });
        setOpenDialog(true);
        event.target.value = null;
      } else {
        // Không có sinh viên tồn tại, import trực tiếp với ghi_de = 0
        await performImport(file, lopFilter, 0, event);
        event.target.value = null;
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra học viên:', error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Lỗi dữ liệu đầu vào. Vui lòng kiểm tra file Excel.");
      } else {
        const msg = error.response?.data?.message || error.message || error;
        toast.error(`Có lỗi xảy ra khi kiểm tra file Excel: ${msg}`);
      }
      event.target.value = null; // Reset input file
    }
  };

  const performImport = async (file, lop_id, ghi_de, event) => {
    try {
      const importFormData = new FormData();
      importFormData.append('file', file);
      importFormData.append('lop_id', lop_id);
      importFormData.append('ghi_de', ghi_de);

      const importResponse = await importStudentsFromExcel(importFormData);
      const importResult = importResponse.data;

      if (importResult.success) {
        toast.success(
          `${importResult.data.message}\nSố học viên mới: ${importResult.data.newCount}\nSố thông tin quân nhân: ${importResult.data.thongTinQuanNhanCount}`
        );

        // Lấy dữ liệu mới và update
        const updatedStudents = await getAllStudent();
        setStudents(updatedStudents);

        // Update displayStudents với dữ liệu mới
        if (isFilterApplied) {
          let filtered = updatedStudents;

          if (searchTerm) {
            filtered = filtered.filter((student) => {
              const fullName = `${student.ho_dem} ${student.ten}`.toLowerCase();
              const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
              const matchesSearch =
                searchWords.every((word) => fullName.includes(word)) ||
                student.ma_sinh_vien.includes(searchTerm);
              return matchesSearch;
            });
          }

          if (lopFilter) {
            filtered = filtered.filter((student) => student.lop_id === lopFilter);
          }

          setDisplayStudents(filtered);
        }
      } else {
        throw new Error(importResult.message || 'Nhập danh sách không thành công');
      }
    } catch (error) {
      console.error('Lỗi khi nhập danh sách học viên:', error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Lỗi dữ liệu đầu vào. Vui lòng kiểm tra file Excel.");
      } else {
        const msg = error.response?.data?.message || error.message || error;
        toast.error(`Có lỗi xảy ra khi nhập file Excel: ${msg}`);
      }
    } finally {
      if (event && event.target) event.target.value = null; // Reset input file safely
    }
  };

  const handleDialogClose = (action) => { // Removed 'event' param
    setOpenDialog(false);
    if (action === 'ghi_de') {
      performImport(importData.file, importData.lopFilter, 1, null);
    } else if (action === 'them_moi') {
      performImport(importData.file, importData.lopFilter, 0, null);
    }
    // No event reset needed here as it was done in handleImportFromExcel
  };

  // Sửa function này
  const checkMilitaryRecordExists = async (sinhVienId) => {
    try {
      const militaryInfo = await getMilitaryInfoByStudentId(sinhVienId);
      return militaryInfo;
    } catch (error) {
      return null; // Không có record
    }
  };

  return (
    <Container maxWidth="xl">
      {/* THAY ĐỔI: Header với màu đẹp hơn */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0} mt={2}>
        <PageHeader title="Quản lý học viên" />
      </Box>

      {/* THAY ĐỔI: Bộ lọc ở trên, có nút áp dụng/hủy */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Bộ lọc tìm kiếm
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }}>Hệ đào tạo</InputLabel>
              <Select
                value={heDaoTaoFilter}
                onChange={(e) => setHeDaoTaoFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhSachHeDaoTao.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.ten_he_dao_tao}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }}>Khóa đào tạo</InputLabel>
              <Select
                value={khoaDaoTaoFilter}
                onChange={(e) => setKhoaDaoTaoFilter(e.target.value)}
                disabled={!heDaoTaoFilter}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhSachKhoa.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.ten_khoa}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }}>Lớp</InputLabel>
              <Select
                value={lopFilter}
                onChange={(e) => {
                  const selectedLop = e.target.value;
                  setLopFilter_(selectedLop);
                  setLop_ts({ ...lop_tu_sinh, lop_id: selectedLop });
                  setStudentData({ ...studentData, lop_id: selectedLop });
                }}
                disabled={!khoaDaoTaoFilter}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {danhSachLop.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.ma_lop}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Tìm kiếm theo mã SV hoặc tên"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={handleApplyFilter}
            disabled={!heDaoTaoFilter && !khoaDaoTaoFilter && !lopFilter && !searchTerm}
          >
            Áp dụng bộ lọc
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={handleClearFilter}
            disabled={!isFilterApplied}
          >
            Hủy bộ lọc
          </Button>

          {isFilterApplied && (
            <Chip
              label={`Đã lọc: ${displayStudents.length} học viên`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* THAY ĐỔI: Action buttons với layout mới */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          {role !== "examination" && (

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{ mr: 1 }}
            >
              Thêm học viên
            </Button>
          )}
          {isFilterApplied && (
            <Alert severity="info" sx={{ my: 2 }}>
              Vui lòng chọn xuất excel để lấy form nhập danh sách học viên nếu chưa có học viên!
            </Alert>
          )}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<UploadIcon />}
            component="label"
          >
            Nhập Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              hidden
              onChange={handleImportFromExcel}
            />
          </Button>
          <Dialog
            open={openDialog}
            onClose={() => handleDialogClose('huy', event)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Học viên đã tồn tại</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Có {existingCount} Học viên đã tồn tại. Bạn muốn làm gì?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDialogClose('huy')} color="inherit">
                Hủy
              </Button>
              <Button onClick={() => handleDialogClose('them_moi')} color="primary">
                Thêm mới
              </Button>
              <Button onClick={() => handleDialogClose('ghi_de')} color="primary" variant="contained">
                Ghi đè
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={handleExportToExcel}
          disabled={!isFilterApplied}
        >
          Xuất Excel
        </Button>
      </Box>

      {/* THAY ĐỔI: Hướng dẫn khi chưa áp dụng bộ lọc */}
      {!isFilterApplied && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '', borderRadius: 1 }}>
          <Typography variant="body2" color="gray">
            💡 Vui lòng chọn bộ lọc và nhấn "Áp dụng bộ lọc" để hiển thị danh sách học viên hoặc điền thông tin đầy đủ vào bộ lọc để tiến hành thêm học viên.
          </Typography>
        </Box>
      )}
      {/* THAY ĐỔI: Bảng chỉ hiển thị khi đã áp dụng bộ lọc, với cấu trúc cột mới */}
      {isFilterApplied && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {/* THAY ĐỔI: Thứ tự cột mới */}
                <TableCell style={{ fontWeight: 'bold' }}>STT</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Mã học viên</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Họ và tên</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Giới tính</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Hệ đào tạo</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Lớp</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Đối tượng quản lý</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    {/* THAY ĐỔI: STT bắt đầu từ 1, theo pagination */}
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{student.ma_sinh_vien}</TableCell>
                    <TableCell>{student.ho_dem} {student.ten}</TableCell>
                    <TableCell>{student.gioi_tinh === 0 ? "Nữ" : "Nam"}</TableCell>
                    {/* THÊM MỚI: Cột hệ đào tạo */}
                    <TableCell>{getHeDaoTaoName(student.lop_id)}</TableCell>
                    <TableCell>{getMaLop(student.lop_id)}</TableCell>
                    <TableCell>{getDoiTuongName(student.doi_tuong_id)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDetail(student.id)}
                        sx={{ mr: 1 }}
                      >
                        Xem chi tiết
                      </Button>
                      {role !== "examination" && (

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpen(student)}
                        >
                          Chỉnh sửa
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      Không tìm thấy học viên nào phù hợp với bộ lọc
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* THAY ĐỔI: Phân trang với nhiều lựa chọn hơn */}
          {filteredStudents.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 20, 40, 50, 100]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`
              }
            />
          )}
        </TableContainer>
      )}

      {/* Dialog Chi tiết học viên - CHỈ SỬA PHẦN NÀY */}
      <Dialog fullWidth maxWidth="xl" open={openDetail} onClose={handleCloseDetail}>
        <DialogTitle sx={{
          backgroundColor: "primary.main",
          color: "white",
          textAlign: "center"
        }}>
          Chi tiết học viên: {studentData.ho_dem} {studentData.ten}
        </DialogTitle>

        <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)}>
          <Tab label="Chi tiết học viên" />
          {studentData.doi_tuong_id && isQuanNhan(studentData.doi_tuong_id) && (
            <Tab label="Chi tiết quân nhân" />
          )}
        </Tabs>

        <DialogContent>
          {tabIndex === 0 && (
            <Grid container spacing={2}>
              {[
                { label: "Tên", value: `${studentData.ho_dem || ""} ${studentData.ten || ""}` || "Chưa cập nhật" },
                { label: "Mã học viên", value: studentData.ma_sinh_vien || "Chưa cập nhật" },
                { label: "Ngày sinh", value: studentData.ngay_sinh || "Chưa cập nhật" },
                { label: "Giới tính", value: studentData.gioi_tinh ? "Nam" : "Nữ" || "Chưa cập nhật" },
                { label: "Nơi sinh", value: studentData.que_quan || "Chưa cập nhật" },
                { label: "Lớp", value: getMaLop(studentData.lop_id) || "Chưa cập nhật" },
                { label: "Hệ đào tạo", value: getHeDaoTaoName(studentData.lop_id) || "Chưa cập nhật" },
                { label: "Đối tượng", value: getDoiTuongName(studentData.doi_tuong_id) || "Chưa cập nhật" },
                { label: "Tình trạng", value: studentData.dang_hoc === 1 ? "Đang học" : studentData.dang_hoc === 2 ? "Bảo lưu" : studentData.dang_hoc === 3 ? "Thôi học" : studentData.dang_hoc === 4 ? "Tốt nghiệp" : studentData.dang_hoc === 5 ? "Chuyển trường" : "Chưa cập nhật" },
                { label: "Ghi chú", value: studentData.ghi_chu || "Chưa cập nhật" },
                { label: "Số tài khoản", value: studentData.so_tai_khoan || "Chưa cập nhật" },
                { label: "Ngân hàng", value: studentData.ngan_hang || "Chưa cập nhật" },
                { label: "Chức vụ", value: studentData.chuc_vu || "Chưa cập nhật" },
                { label: "CCCD", value: studentData.CCCD || "Chưa cập nhật" },
                { label: "Ngày cấp CCCD", value: studentData.ngay_cap_CCCD || "Chưa cập nhật" },
                { label: "Nơi cấp CCCD", value: studentData.noi_cap_CCCD || "Chưa cập nhật" },
                { label: "Kỳ nhập học", value: studentData.ky_nhap_hoc || "Chưa cập nhật" },
                { label: "Ngày vào đoàn", value: studentData.ngay_vao_doan || "Chưa cập nhật" },
                { label: "Ngày vào đảng", value: studentData.ngay_vao_dang || "Chưa cập nhật" },
                { label: "Ngày vào trường", value: studentData.ngay_vao_truong || "Chưa cập nhật" },
                { label: "Ngày ra trường", value: studentData.ngay_ra_truong || "Chưa cập nhật" },
                { label: "Tỉnh thành", value: studentData.tinh_thanh || "Chưa cập nhật" },
                { label: "Quận huyện", value: studentData.quan_huyen || "Chưa cập nhật" },
                { label: "Phường xã khối", value: studentData.phuong_xa_khoi || "Chưa cập nhật" },
                { label: "Dân tộc", value: studentData.dan_toc || "Chưa cập nhật" },
                { label: "Tôn giáo", value: studentData.ton_giao || "Chưa cập nhật" },
                { label: "Quốc tịch", value: studentData.quoc_tich || "Chưa cập nhật" },
                { label: "Tổ hợp xét tuyển", value: studentData.to_hop_xet_tuyen || "Chưa cập nhật" },
                { label: "Điểm trúng tuyển", value: studentData.diem_trung_tuyen || "Chưa cập nhật" },
                { label: "Năm tốt nghiệp THPT", value: studentData.nam_tot_nghiep_PTTH || "Chưa cập nhật" },
                { label: "Thành phần gia đình", value: studentData.thanh_phan_gia_dinh || "Chưa cập nhật" },
                //  { label: "Đối tượng đào tạo", value: studentData.doi_tuong_dao_tao || "Chưa cập nhật" },
                { label: "DV liên kết đào tạo", value: studentData.dv_lien_ket_dao_tao || "Chưa cập nhật" },
                { label: "Số điện thoại", value: studentData.so_dien_thoai || "Chưa cập nhật" },
                { label: "Số điện thoại gia đình", value: studentData.dien_thoai_gia_dinh || "Chưa cập nhật" },
                { label: "Điện thoại cơ quan", value: studentData.dien_thoai_CQ || "Chưa cập nhật" },
                { label: "Email", value: studentData.email || "Chưa cập nhật" },
                { label: "Khi cần báo tin cho ai", value: studentData.khi_can_bao_tin_cho_ai || "Chưa cập nhật" },
                { label: "Nội trú", value: studentData.noi_tru ? "Có" : "Không" || "Chưa cập nhật" },
                { label: "Ngoại trú", value: studentData.ngoai_tru ? "Có" : "Không" || "Chưa cập nhật" },
              ].map((item, index) => (
                <Grid item xs={12} sm={3} key={index}>
                  <Box sx={{
                    p: 1.5,
                    backgroundColor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.200",
                    height: "100%"
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                      {item.label}:
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {tabIndex === 1 && studentData.doi_tuong_id && isQuanNhan(studentData.doi_tuong_id) && (
            <Box>
              {militaryData.sinh_vien_id ? (
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Ngày nhập ngũ",
                      value: militaryData.ngay_nhap_ngu
                        ? new Date(militaryData.ngay_nhap_ngu).toLocaleDateString('vi-VN')
                        : "Chưa cập nhật"
                    },
                    { label: "Cấp bậc", value: militaryData.cap_bac || "Chưa cập nhật" },
                    { label: "Trình độ văn hóa", value: militaryData.trinh_do_van_hoa || "Chưa cập nhật" },
                    { label: "Nơi ở hiện nay", value: militaryData.noi_o_hien_nay || "Chưa cập nhật" },
                    { label: "Đơn vị cử đi học", value: militaryData.don_vi_cu_di_hoc || "Chưa cập nhật" },
                    { label: "Loại lương", value: militaryData.loai_luong || "Chưa cập nhật" },
                    { label: "Nhóm lương", value: militaryData.nhom_luong || "Chưa cập nhật" },
                    { label: "Bậc lương", value: militaryData.bac_luong || "Chưa cập nhật" },
                    { label: "Hệ số lương", value: militaryData.he_so_luong || "Chưa cập nhật" },
                    {
                      label: "Ngày nhận lương",
                      value: militaryData.ngay_nhan_luong
                        ? new Date(militaryData.ngay_nhan_luong).toLocaleDateString('vi-VN')
                        : "Chưa cập nhật"
                    },
                    { label: "Chức vụ", value: militaryData.chuc_vu || "Chưa cập nhật" },
                    { label: "Sức khỏe", value: militaryData.suc_khoe || "Chưa cập nhật" },
                  ].map((item, index) => (
                    <Grid item xs={12} sm={3} key={index}>
                      <Box sx={{
                        p: 1.5,
                        backgroundColor: "grey.50",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "grey.200",
                        height: "100%"
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                          {item.label}:
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    ⚠️ Chưa có thông tin quân nhân
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Học viên này thuộc đối tượng quân nhân nhưng chưa cập nhật thông tin chi tiết.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetail} color="secondary">Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Form thêm/sửa học viên - CẬP NHẬT */}
      <Dialog maxWidth="xl" open={open} onClose={handleClose}>
        <DialogTitle>
          {editIndex !== null
            ? `Chỉnh sửa học viên: ${studentData.ho_dem + " " + studentData.ten}`
            : `Thêm học viên`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin cá nhân</Typography>
            </Grid>
            {[
              { label: "Họ đệm", key: "ho_dem", required: true },
              { label: "Tên", key: "ten", required: true },
              { label: "Mã học viên", key: "ma_sinh_vien", required: true },
              { label: "Ngày sinh", key: "ngay_sinh", type: "date", required: true },
              { label: "Giới tính", key: "gioi_tinh", type: "select", options: [{ value: 1, label: "Nam" }, { value: 0, label: "Nữ" }], required: true },
              { label: "Nơi sinh", key: "que_quan", required: true },
              { label: "Dân tộc", key: "dan_toc", required: true },
              { label: "Tôn giáo", key: "ton_giao" },
              { label: "Quốc tịch", key: "quoc_tich" },
              { label: "CCCD", key: "CCCD", required: true },
              { label: "Ngày cấp CCCD", key: "ngay_cap_CCCD", type: "date" },
              { label: "Nơi cấp CCCD", key: "noi_cap_CCCD" },
            ].map(renderField)}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin học tập</Typography>
            </Grid>
            {[
              { label: "Lớp", key: "lop_id", type: "api", options: danhSachLop, optionLabel: "ma_lop", required: true },
              { label: "Đối tượng", key: "doi_tuong_id", type: "api", options: danhSachDoiTuongQL, optionLabel: "ten_doi_tuong", required: true },
              { label: "Tình trạng", key: "dang_hoc", type: "select", options: [{ value: 1, label: "Đang học" }, { value: 2, label: "Bảo lưu" }, { value: 3, label: "Thôi học" }, { value: 4, label: "Tốt nghiệp" }, { value: 5, label: "Chuyển trường" }] },
              { label: "Ghi chú", key: "ghi_chu" },
              { label: "Kỳ nhập học", key: "ky_nhap_hoc" },
              { label: "Ngày vào trường", key: "ngay_vao_truong", type: "date" },
              { label: "Ngày ra trường", key: "ngay_ra_truong", type: "date" },
              { label: "Tổ hợp xét tuyển", key: "to_hop_xet_tuyen" },
              { label: "Điểm trúng tuyển", key: "diem_trung_tuyen" },
              { label: "Năm tốt nghiệp THPT", key: "nam_tot_nghiep_PTTH" },
              { label: "Thành phần gia đình", key: "thanh_phan_gia_dinh" },
              // { label: "Đối tượng đào tạo", key: "doi_tuong_dao_tao" },
              { label: "Đơn vị liên kết đào tạo", key: "dv_lien_ket_dao_tao" },
            ].map(renderField)}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin liên hệ</Typography>
            </Grid>
            {[
              { label: "Số điện thoại", key: "so_dien_thoai", required: true },
              { label: "Điện thoại gia đình", key: "dien_thoai_gia_dinh" },
              { label: "Điện thoại cơ quan", key: "dien_thoai_CQ" },
              { label: "Email", key: "email", required: true },
              { label: "Khi cần báo tin cho ai", key: "khi_can_bao_tin_cho_ai" },
            ].map(renderField)}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin cư trú</Typography>
            </Grid>
            {[
              { label: "Nội trú", key: "noi_tru", type: "select", options: [{ value: 1, label: "Có" }, { value: 0, label: "Không" }] },
              { label: "Ngoại trú", key: "ngoai_tru", type: "select", options: [{ value: 1, label: "Có" }, { value: 0, label: "Không" }] },
              { label: "Tỉnh thành", key: "tinh_thanh" },
              { label: "Quận huyện", key: "quan_huyen" },
              { label: "Phường xã khối", key: "phuong_xa_khoi" },
            ].map(renderField)}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin chính trị - đoàn thể</Typography>
            </Grid>
            {[
              { label: "Ngày vào đoàn", key: "ngay_vao_doan", type: "date" },
              { label: "Ngày vào đảng", key: "ngay_vao_dang", type: "date" },

            ].map(renderField)}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin tài chính</Typography>
            </Grid>
            {[
              { label: "Số tài khoản", key: "so_tai_khoan" },
              { label: "Ngân hàng", key: "ngan_hang" },
            ].map(renderField)}

            {/* THÊM MỚI: Section thông tin quân nhân hiển thị động */}
            {studentData.doi_tuong_id && isQuanNhan(studentData.doi_tuong_id) && (
              <>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mt: 3,
                      color: "primary.main",
                      borderTop: "2px solid",
                      borderColor: "primary.main",
                      pt: 2
                    }}
                  >
                    🎖️ Thông tin quân nhân
                  </Typography>
                </Grid>
                {[
                  { label: "Ngày nhập ngũ", key: "ngay_nhap_ngu", type: "date" },
                  { label: "Cấp bậc", key: "cap_bac" },
                  { label: "Trình độ văn hóa", key: "trinh_do_van_hoa" },
                  { label: "Nơi ở hiện nay", key: "noi_o_hien_nay" },
                  { label: "Đơn vị cử đi học", key: "don_vi_cu_di_hoc" },
                  { label: "Loại lương", key: "loai_luong" },
                  { label: "Nhóm lương", key: "nhom_luong" },
                  { label: "Bậc lương", key: "bac_luong" },
                  { label: "Hệ số lương", key: "he_so_luong" },
                  { label: "Ngày nhận lương", key: "ngay_nhan_luong", type: "date" },
                  { label: "Chức vụ", key: "chuc_vu" },
                  { label: "Sức khỏe", key: "suc_khoe" },
                ].map(renderMilitaryField)}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Hủy</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            {editIndex !== null ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentManagement;