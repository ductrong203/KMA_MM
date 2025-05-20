
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
} from "@mui/material";

import {
  createMilitaryInfo,
  createNewStudent,
  getAllMiri,
  getAllStudent,
  getListClassByKhoaDaoTaoId,
  getMilitaryInfoByStudentId,
  updateMilitaryInfoByStudentId,
  updateStudentById,
} from "../../Api_controller/Service/qlhvService";
import { exportStudentsToExcel, importStudentsFromExcel } from "../../Api_controller/Service/excelService";
import { fetchDanhSachHeDaoTao, getDanhSachKhoaDaoTaobyId } from "../../Api_controller/Service/trainingService";
import { getAllDoiTuongQuanLy } from "../../Api_controller/Service/dtqlService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import { fetchDanhSachKhoa } from "../../Api_controller/Service/khoaService";
import { toast } from "react-toastify";

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
    dang_hoc: false,
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
    trung_tuyen_theo_nguyen_vong: "",
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

  const [militarys, setMilitary] = useState({
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
  const [openMilitaryPopup, setOpenMilitaryPopup] = useState(false);

  const handleCloseMiPopup = () => {
    setOpenMilitaryPopup(false);
  };
  const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
  const [danhSachDoiTuongQL, setDanhSachDoiTuongQL] = useState([]);
  const [danhSachLop, setDanhSachLop] = useState([]);
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [lop_filter, setLopFilter] = useState();
  const [originalLopList, setOriginalLopList] = useState([]); // Danh sách lớp gốc

  // State cho bộ lọc
  const [heDaoTaoFilter, setHeDaoTaoFilter] = useState("");
  const [khoaDaoTaoFilter, setKhoaDaoTaoFilter] = useState("");
  const [lopFilter, setLopFilter_] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getAllStudent();
        const data2 = await getAllMiri();
        const data3 = await fetchDanhSachHeDaoTao();
        const data4 = await getAllDoiTuongQuanLy();
        const data5 = await getDanhSachLop();
        const data6 = await fetchDanhSachKhoa();
        console.log(data);
        console.log(data2);
        console.log("danh sach he dao tao", data3);
        console.log("danh doi tuong quan ly", data4);
        console.log("danh sách lop", data5);
        console.log("danh sách khoa", data6);
        setMilitary(data2);
        setStudents(data);
        setDanhSachHeDaoTao(data3);
        setDanhSachDoiTuongQL(data4);
        setDanhSachLop(data5);
        setOriginalLopList(data5); // Lưu danh sách lớp gốc
        setDanhSachKhoa(data6);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách học viên:", error);
      }
    };

    fetchStudents();
  }, []);

  // Lọc khóa đào tạo theo hệ đào tạo
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
        setDanhSachLop(originalLopList); // Reset về danh sách lớp gốc
      }
    };
    fetchKhoaDaoTao();
  }, [heDaoTaoFilter, originalLopList]);

  // Lọc lớp theo khóa đào tạo
  useEffect(() => {
    const fetchLopByKhoaDaoTao = async () => {
      if (khoaDaoTaoFilter) {
        try {
          // const response = await fetch(`http://localhost:8000/lop/bykhoadaotao?khoa_dao_tao_id=${khoaDaoTaoFilter}`);

          const data = await getListClassByKhoaDaoTaoId(khoaDaoTaoFilter)
          setDanhSachLop(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách lớp theo khóa đào tạo:", error);
          setDanhSachLop(originalLopList); // Reset nếu lỗi
        }
      } else {
        setDanhSachLop(originalLopList); // Reset về danh sách lớp gốc
      }
    };
    fetchLopByKhoaDaoTao();
  }, [khoaDaoTaoFilter, originalLopList]);

  const generateMaSinhVien = (lop_id = lop_tu_sinh?.lop_id) => {
    if (!lop_id) return "";
    const lop = danhSachLop.find((l) => l.id === lop_id);
    if (!lop) return "";
    const soLuongSinhVien = students.filter((sv) => sv.lop_id === lop_id).length;
    return `${lop.ma_lop}${String(soLuongSinhVien + 1).padStart(2, "0")}`;
  };

  const handleOpen = (student = null) => {


    if (student !== null) {
      setStudentData(student);
      console.log(student);
    } else {
      const newMaSinhVien = generateMaSinhVien();
      setStudentData({
        ma_sinh_vien: newMaSinhVien,
        ngay_sinh: "",
        gioi_tinh: 1,
        que_quan: "",
        lop_id: lop_tu_sinh.lop_id,
        doi_tuong_id: "",
        dang_hoc: 1, // Mặc định là "Có"
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
        quoc_tich: "Việt Nam",
        trung_tuyen_theo_nguyen_vong: "",
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

  // const handleOpenDetail = (index) => {
  //   setStudentData(students[index]);
  //   setOpenDetail(true);
  // };
  const handleOpenDetail = async (studentId) => {
    try {
      if (!studentId) {
        toast.error("ID học viên không hợp lệ!");
        return;
      }

      const student = students.find((s) => s.id === studentId);
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
        dang_hoc: student.dang_hoc ?? false,
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
        trung_tuyen_theo_nguyen_vong: student.trung_tuyen_theo_nguyen_vong || "",
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
        id: student.id || "", // Lưu id để sử dụng trong tab quân nhân
      });

      // Tải thông tin quân nhân nếu cần
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

  const [searchTerm, setSearchTerm] = useState("");
  const [lop_tu_sinh, setLop_ts] = useState({ lop_id: "", ma_lop: "" });

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.ho_dem} ${student.ten}`.toLowerCase();
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    const matchesSearch =
      searchWords.every((word) => fullName.includes(word)) ||
      student.ma_sinh_vien.includes(searchTerm);
    const matchesLop = lopFilter ? student.lop_id === lopFilter : true;
    return matchesSearch && matchesLop;
  });

  const handleGenderChange = (event) => {
    setStudentData((prev) => ({
      ...prev,
      gioi_tinh: Number(event.target.value),
    }));
  };
  const [errors, setErrors] = useState("");

  const handleSave = async () => {
    try {
      let newErrors = {};
      if (!studentData.ho_dem) newErrors.ho_dem = "Họ đệm không được để trống";
      if (!studentData.ten) newErrors.ten = "Tên không được để trống";
      if (!studentData.ma_sinh_vien)
        newErrors.ma_sinh_vien = "Mã sinh viên không được để trống";
      if (!studentData.ngay_sinh)
        newErrors.ngay_sinh = "Ngày sinh không được để trống";
      if (!studentData.email) newErrors.email = "Email không được để trống";
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
        nam_tot_nghiep_PTTH: studentData.ngay_ra_truong
          ? new Date(studentData.ngay_ra_truong).toISOString().split("T")[0]
          : null,
      };

      console.log("Dữ liệu gửi đi:", formattedStudentData);

      let res;
      if (!studentData.id) {
        res = await createNewStudent(formattedStudentData);
        setStudents([...students, res]);
        toast.success("Thêm học viên thành công!");
      } else {
        res = await updateStudentById(formattedStudentData, formattedStudentData.id);//  formattedStudentData.id   studentData.id, formattedStudentData
        //const updatedStudents = [...students];
        //updatedStudents[editIndex] = res;
        // setStudents(updatedStudents);
        setStudents(prevStudents =>
          prevStudents.map(student =>
            student.id === res.id ? res : student
          )
        );


        toast.success("Cập nhật học viên thành công!");
      }

      const quanNhanList = ["quân đội", "công an", "đảng chính quyền"];
      const doiTuong = danhSachDoiTuongQL.find(
        (item) => item.id === res.doi_tuong_id
      );

      if (
        doiTuong &&
        quanNhanList.includes(doiTuong.ten_doi_tuong.toLowerCase())
      ) {
        setOpenMilitaryPopup(true);
        setMilitaryData((prev) => ({ ...prev, sinh_vien_id: res.id }));
      }

      setOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật học viên:", error);
      toast.error(`Lỗi khi lưu học viên: ${error.message || error}`);
    }
  };

  const getDoiTuongName = (id) => {
    const doiTuong = danhSachDoiTuongQL.find((item) => item.id === Number(id));
    return doiTuong ? doiTuong.ten_doi_tuong : "Không xác định";
  };

  const getMaLop = (id) => {
    const lop = danhSachLop.find((item) => item.id === Number(id));
    return lop ? lop.ma_lop : "Không xác định";
  };

  // useEffect(() => {
  //   const fetchMilitaryInfo = async () => {
  //     if (tabIndex === 1 && studentData.id) {
  //       try {
  //         const data = await getMilitaryInfoByStudentId(studentData.id);
  //         setMilitaryData(data);
  //       } catch (error) {
  //         console.error("Lỗi khi lấy thông tin quân nhân:", error);
  //         setMilitaryData([]);
  //       }
  //     }
  //   };

  //   fetchMilitaryInfo();
  // }, [tabIndex, studentData.id]);

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

      setOpenMilitaryPopup(false);
    } catch (error) {
      console.error("Lỗi khi xử lý thông tin quân nhân:", error);
      toast.error(`Lỗi khi lưu thông tin quân nhân: ${error.message || error}`);
    }
  };

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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleExportToExcel = async () => {
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

      toast.success(`Xuất danh sách sinh viên thành công: ${fileName}`);
    } catch (error) {
      console.error("Lỗi khi xuất danh sách học viên:", error);
      toast.error(`Có lỗi xảy ra khi xuất file Excel: ${error.message || error}`);
    }
  };

  const handleImportFromExcel = async (event) => {
    const file = event.target.files[0];
    if (!file || !lopFilter) {
      toast.warn("Vui lòng chọn file Excel và lớp để nhập!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lop_id", lopFilter);

      const response = await importStudentsFromExcel(formData);
      const result = response.data;
      if (result.success) {
        toast.success(
          `${result.data.message}\nSố học viên mới: ${result.data.newCount}\nSố thông tin quân nhân: ${result.data.thongTinQuanNhanCount}`
        );
        const updatedStudents = await getAllStudent();
        setStudents(updatedStudents);
      } else {
        throw new Error(result.message || "Nhập danh sách không thành công");
      }
    } catch (error) {
      console.error("Lỗi khi nhập danh sách học viên:", error);
      toast.error(`Có lỗi xảy ra khi nhập file Excel: ${error.message || error}`);
    }
  };
  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom style={{ fontWeight: 600, marginBottom: "20px" }}>
        Quản lý học viên
      </Typography>
      <TextField
        label="Tìm kiếm học viên..."
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Grid container spacing={2} alignItems="center" sx={{ marginTop: "4px" }}>
        <Grid item xs={4}>
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
        <Grid item xs={4}>
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
        <Grid item xs={4}>
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
      </Grid>
      <Button
        sx={{ marginTop: "8px" }}
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
      >
        Thêm học viên
      </Button>
      <Button
        sx={{ marginTop: "8px", marginLeft: "8px" }}
        variant="contained"
        color="primary"
        onClick={handleExportToExcel}
      >
        Xuất Excel
      </Button>
      <Button
        sx={{ marginTop: "8px", marginLeft: "8px" }}
        variant="contained"
        color="primary"
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
      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Mã học viên</TableCell>
              <TableCell>Giới tính</TableCell>
              <TableCell>Lớp</TableCell>
              <TableCell>Đối tượng quản lý</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          {/* <TableBody>
            {paginatedStudents.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell>{student.ho_dem} {student.ten}</TableCell>
                <TableCell>{student.ma_sinh_vien}</TableCell>
                <TableCell>{student.gioi_tinh === 0 ? "Nữ" : "Nam"}</TableCell>
                <TableCell>{getMaLop(student.lop_id)}</TableCell>
                <TableCell>{getDoiTuongName(student.doi_tuong_id)}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleOpenDetail(student?.id - 1)}>
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpen(student?.id - 1)}
                    style={{ marginLeft: 10 }}
                  >
                    Chỉnh sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
           */}
          <TableBody>
            {paginatedStudents.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell>{student.ho_dem} {student.ten}</TableCell>
                <TableCell>{student.ma_sinh_vien}</TableCell>
                <TableCell>{student.gioi_tinh === 0 ? "Nữ" : "Nam"}</TableCell>
                <TableCell>{getMaLop(student.lop_id)}</TableCell>
                <TableCell>{getDoiTuongName(student.doi_tuong_id)}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleOpenDetail(student.id)}>
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpen(student)} // Giữ nguyên vì handleOpen dùng index
                    style={{ marginLeft: 10 }}
                  >
                    Chỉnh sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang"
        />
      </TableContainer>

      {/* Dialog Chi Tiết */}
      <Dialog fullWidth maxWidth="xl" open={openDetail} onClose={handleCloseDetail}>
        <DialogTitle>Chi tiết học viên</DialogTitle>
        <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)}>
          <Tab label="Chi tiết học viên" />
          {studentData.doi_tuong_id && <Tab label="Chi tiết quân nhân" />}
        </Tabs>
        <DialogContent>
          {tabIndex === 0 && (
            <Grid container spacing={2}>
              {[
                { label: "Tên", value: `${studentData.ho_dem || ""} ${studentData.ten || ""}` || "Chưa cập nhật" },
                { label: "Mã sinh viên", value: studentData.ma_sinh_vien || "Chưa cập nhật" },
                { label: "Ngày sinh", value: studentData.ngay_sinh || "Chưa cập nhật" },
                { label: "Giới tính", value: studentData.gioi_tinh ? "Nam" : "Nữ" || "Chưa cập nhật" },
                { label: "Nơi sinh", value: studentData.que_quan || "Chưa cập nhật" },
                { label: "Lớp ID", value: getMaLop(studentData.lop_id) || "Chưa cập nhật" },
                { label: "Đối tượng ID", value: getDoiTuongName(studentData.doi_tuong_id) || "Chưa cập nhật" },
                { label: "Đang học", value: studentData.dang_hoc ? "Có" : "Không" || "Chưa cập nhật" },
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
                { label: "Trúng tuyển theo nguyện vọng", value: studentData.trung_tuyen_theo_nguyen_vong || "Chưa cập nhật" },
                { label: "Năm tốt nghiệp PTTH", value: studentData.nam_tot_nghiep_PTTH || "Chưa cập nhật" },
                { label: "Thành phần gia đình", value: studentData.thanh_phan_gia_dinh || "Chưa cập nhật" },
                { label: "Đối tượng đào tạo", value: studentData.doi_tuong_dao_tao || "Chưa cập nhật" },
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
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>{item.label}:</Typography>
                  <Typography variant="body1">{item.value}</Typography>
                </Grid>
              ))}
            </Grid>
          )}
          {tabIndex === 1 && studentData.doi_tuong_id && (
            <Grid maxWidth="" xs={12} sm={3} container spacing={2}>
              {[
                { label: "Sinh viên ID", value: militaryData.sinh_vien_id || "Chưa cập nhật" },
                { label: "Ngày nhập ngũ", value: militaryData.ngay_nhap_ngu || "Chưa cập nhật" },
                { label: "Cấp bậc", value: militaryData.cap_bac || "Chưa cập nhật" },
                { label: "Trình độ văn hóa", value: militaryData.trinh_do_van_hoa || "Chưa cập nhật" },
                { label: "Nơi ở hiện nay", value: militaryData.noi_o_hien_nay || "Chưa cập nhật" },
                { label: "Đơn vị cử đi học", value: militaryData.don_vi_cu_di_hoc || "Chưa cập nhật" },
                { label: "Loại lương", value: militaryData.loai_luong || "Chưa cập nhật" },
                { label: "Nhóm lương", value: militaryData.nhom_luong || "Chưa cập nhật" },
                { label: "Bậc lương", value: militaryData.bac_luong || "Chưa cập nhật" },
                { label: "Ngày nhận lương", value: militaryData.ngay_nhan_luong || "Chưa cập nhật" },
                { label: "Chức vụ", value: militaryData.chuc_vu || "Chưa cập nhật" },
                { label: "Sức khỏe", value: militaryData.suc_khoe || "Chưa cập nhật" },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>{item.label}:</Typography>
                  <Typography variant="body1">{item.value}</Typography>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} color="secondary">Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Chỉnh Sửa */}
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
              { label: "Mã sinh viên", key: "ma_sinh_vien", required: true },
              { label: "Ngày sinh", key: "ngay_sinh", type: "date", required: true },
              { label: "Giới tính", key: "gioi_tinh", type: "select", options: [{ value: 1, label: "Nam" }, { value: 0, label: "Nữ" }], required: true },
              { label: "Nơi sinh", key: "que_quan", required: true },
              { label: "Dân tộc", key: "dan_toc", required: true },
              { label: "Tôn giáo", key: "ton_giao" },
              { label: "Quốc tịch", key: "quoc_tich" },
            ].map(renderField)}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin học tập</Typography>
            </Grid>
            {[
              { label: "Lớp", key: "lop_id", type: "api", options: danhSachLop, optionLabel: "ma_lop", required: true },
              { label: "Đối tượng", key: "doi_tuong_id", type: "api", options: danhSachDoiTuongQL, optionLabel: "chi_tiet_doi_tuong", required: true },
              { label: "Đang học", key: "dang_hoc", type: "select", options: [{ value: 1, label: "Có" }, { value: 0, label: "Không" }] },
              { label: "Ghi chú", key: "ghi_chu" },
              { label: "Kỳ nhập học", key: "ky_nhap_hoc" },
              { label: "Ngày vào trường", key: "ngay_vao_truong", type: "date" },
              { label: "Ngày ra trường", key: "ngay_ra_truong", type: "date" },
              { label: "Trúng tuyển theo nguyện vọng", key: "trung_tuyen_theo_nguyen_vong" },
              { label: "Năm tốt nghiệp PTTH", key: "nam_tot_nghiep_PTTH" },
              { label: "Thành phần gia đình", key: "thanh_phan_gia_dinh" },
              { label: "Đối tượng đào tạo", key: "doi_tuong_dao_tao" },
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
              { label: "CCCD", key: "CCCD", required: true },
              { label: "Ngày cấp CCCD", key: "ngay_cap_CCCD", type: "date" },
            ].map(renderField)}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Hủy</Button>
          <Button onClick={handleSave} color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Chỉnh Sửa thông tin quân nhân */}
      <Dialog maxWidth="xl" open={openMilitaryPopup} onClose={handleCloseMiPopup} disableEscapeKeyDown={false}>
        <DialogTitle>
          {editIndex !== null
            ? `Chỉnh sửa học viên: ${studentData.ho_dem + " " + studentData.ten}`
            : `Thêm học viên`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {[
              { label: "Ngày nhập ngũ", key: "ngay_nhap_ngu" },
              { label: "Cấp bậc", key: "cap_bac" },
              { label: "Trình độ văn hóa", key: "trinh_do_van_hoa" },
              { label: "Nơi ở hiện nay", key: "noi_o_hien_nay" },
              { label: "Đơn vị cử đi học", key: "don_vi_cu_di_hoc" },
              { label: "Loại lương", key: "loai_luong" },
              { label: "Nhóm lương", key: "nhom_luong" },
              { label: "Bậc lương", key: "bac_luong" },
              { label: "Ngày nhận lương", key: "ngay_nhan_luong" },
              { label: "Chức vụ", key: "chuc_vu" },
              { label: "Sức khỏe", key: "suc_khoe" },
            ].map(({ label, key }) => {
              const isDateField = ["ngay_nhap_ngu", "ngay_nhan_luong"].includes(key);
              return (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    label={label}
                    type={isDateField ? "date" : "text"}
                    value={
                      isDateField
                        ? militaryData[key] ? militaryData[key].slice(0, 10) : ""
                        : militaryData[key] || ""
                    }
                    onChange={(e) =>
                      setMilitaryData((prev) => ({
                        ...prev,
                        [key]: isDateField
                          ? e.target.value && !isNaN(Date.parse(e.target.value))
                            ? new Date(e.target.value).toISOString()
                            : e.target.value
                          : e.target.value,
                      }))
                    }
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMiPopup} color="secondary">Hủy</Button>
          <Button onClick={handleSaveMilitary} color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentManagement;