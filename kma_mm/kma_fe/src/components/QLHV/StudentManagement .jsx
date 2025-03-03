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
    FormHelperText
} from "@mui/material";

import { createMilitaryInfo, createNewStudent, getAllMiri, getAllStudent, getMilitaryInfoByStudentId, updateMilitaryInfoByStudentId, updateStudentById } from "../../Api_controller/Service/qlhvService";
import { fetchDanhSachHeDaoTao } from "../../Api_controller/Service/trainingService";
import { getAllDoiTuongQuanLy } from "../../Api_controller/Service/dtqlService";
import { getDanhSachLop } from "../../Api_controller/Service/lopService";
import { fetchDanhSachKhoa } from "../../Api_controller/Service/khoaService";

const StudentManagement = () => {

    const [students, setStudents] = useState([

    ]
    );
    const [open, setOpen] = useState(false);
    const [onClose, setOnclose] = useState(false);
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
        // của quân nhân
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
        suc_khoe: ""
    });


    const [militarys, setMilitary] = useState({
        // của quân nhân
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
        suc_khoe: ""
    });
    const [openMilitaryPopup, setOpenMilitaryPopup] = useState(false);




    const handleCloseMiPopup = () => {
        setOpenMilitaryPopup(false); // Đóng popup
    };
    const [danhSachHeDaoTao, setDanhSachHeDaoTao] = useState([]);
    const [danhSachDoiTuongQL, setDanhSachDoiTuongQL] = useState([]);
    const [danhSachLop, setDanhSachLop] = useState([]);
    const [danhSachKhoa, setDanhSachKhoa] = useState([]);



    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await getAllStudent(); // Gọi API
                const data2 = await getAllMiri(); // gọi api lấy tất cả thông tin quân nhân
                const data3 = await fetchDanhSachHeDaoTao()
                const data4 = await getAllDoiTuongQuanLy()
                const data5 = await getDanhSachLop()
                const data6 = await fetchDanhSachKhoa()
                console.log(data)
                console.log(data2)
                console.log("danh sach he dao tao", data3)
                console.log("danh doi tuong quan ly", data4)
                console.log("danh sách lop", data5)
                console.log("danh sách khoa", data6)
                setMilitary(data2);
                setStudents(data); // Cập nhật danh sách học viên
                setDanhSachHeDaoTao(data3);
                setDanhSachDoiTuongQL(data4)
                setDanhSachLop(data5);
                setDanhSachKhoa(data6);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách học viên:", error);
            }
        };

        fetchStudents();
    }, []);




    const generateMaSinhVien = (lop_id = lop_tu_sinh?.lop_id) => {
        if (!lop_id) return "";

        // Tìm lớp theo ID
        const lop = danhSachLop.find(l => l.id === lop_id);
        if (!lop) return "";

        // Đếm số lượng sinh viên thuộc lớp này
        const soLuongSinhVien = students.filter(sv => sv.lop_id === lop_id).length;

        // Tạo mã sinh viên mới: [Mã lớp] + [Số thứ tự]
        return `${lop.ma_lop}${String(soLuongSinhVien + 1).padStart(2, '0')}`;
    };







    const handleOpen = (index = null) => {
        setEditIndex(index);

        if (index !== null) {
            setStudentData(students[index]);
            console.log(students[index])
        } else {

            // Nếu thêm mới, tạo mã sinh viên theo số lượng sinh viên hiện có
            const newMaSinhVien = generateMaSinhVien();


            setStudentData({

                ma_sinh_vien: newMaSinhVien,
                ngay_sinh: "",
                gioi_tinh: false,
                que_quan: "",
                lop_id: lop_tu_sinh.lop_id,
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
            setMilitaryData({
                // đoạn sau này của quân nhân
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
                suc_khoe: ""
            });
        }
        setOpen(true);
    };


    const handleOpenDetail = (index) => {
        setStudentData(students[index]);
        setOpenDetail(true);
    };

    const handleClose = () => {
        setOpen(false);
        //setOpenMilitaryPopup(true)
    };




    const handleCloseDetail = () => {
        setOpenDetail(false);
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [lop_tu_sinh, setLop_ts] = useState({ lop_id: "", ma_lop: "" });
    const filteredStudents = students.filter(student => {
        return (
            (student.ho_dem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.ma_sinh_vien.includes(searchTerm))
        );
    });

    const handleGenderChange = (event) => {
        setStudentData((prev) => ({
            ...prev,
            gioi_tinh: event.target.value === "Nam", // Chuyển đổi thành boolean
        }));
    };
    const [errors, setErrors] = useState("");

    const handleSave = async () => {
        try {
            let newErrors = {};

            // 1️⃣ Kiểm tra lỗi dữ liệu trước khi lưu
            if (!studentData.ho_dem) newErrors.ho_dem = "Họ đệm không được để trống";
            if (!studentData.ten) newErrors.ten = "Tên không được để trống";
            if (!studentData.ma_sinh_vien) newErrors.ma_sinh_vien = "Mã sinh viên không được để trống";
            if (!studentData.ngay_sinh) newErrors.ngay_sinh = "Ngày sinh không được để trống";
            if (!studentData.email) newErrors.email = "Email không được để trống";
            if (!studentData.so_dien_thoai) newErrors.so_dien_thoai = "Số điện thoại không được để trống";
            if (!studentData.lop_id) newErrors.lop_id = "Lớp không được để trống";
            if (!studentData.gioi_tinh) newErrors.gioi_tinh = "Giới tính không được để trống";
            if (!studentData.doi_tuong_id) newErrors.doi_tuong_id = "Đối tượng không được để trống";
            if (!studentData.que_quan) newErrors.que_quan = "Quê quán không được để trống";
            if (!studentData.dan_toc) newErrors.dan_toc = "Dân tộc không được để trống";
            if (!studentData.CCCD) newErrors.CCCD = "CCCD không được để trống";
            // 2️⃣ Kiểm tra email hợp lệ
            if (studentData.email && !/^\S+@\S+\.\S+$/.test(studentData.email)) {
                newErrors.email = "Email không hợp lệ";
            }

            // 3️⃣ Kiểm tra số điện thoại hợp lệ
            if (studentData.so_dien_thoai && !/^\d{10,11}$/.test(studentData.so_dien_thoai)) {
                newErrors.so_dien_thoai = "Số điện thoại phải có 10-11 chữ số";
            }

            // 4️⃣ Kiểm tra ngày tháng hợp lệ
            ["ngay_sinh", "ngay_cap_CCCD", "ngay_vao_truong"].forEach(field => {
                if (studentData[field] && isNaN(Date.parse(studentData[field]))) {
                    newErrors[field] = "Ngày không hợp lệ";
                }
            });

            // Nếu có lỗi, hiển thị thông báo lỗi và dừng lại
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            const formattedStudentData = {
                ...studentData,
                ngay_sinh: studentData.ngay_sinh ? new Date(studentData.ngay_sinh).toISOString().split('T')[0] : null,
                ngay_cap_CCCD: studentData.ngay_cap_CCCD ? new Date(studentData.ngay_cap_CCCD).toISOString().split('T')[0] : null,
                ky_nhap_hoc: studentData.ky_nhap_hoc ? new Date(studentData.ky_nhap_hoc).toISOString().split('T')[0] : null,
                ngay_vao_doan: studentData.ngay_vao_doan ? new Date(studentData.ngay_vao_doan).toISOString().split('T')[0] : null,
                ngay_vao_dang: studentData.ngay_vao_dang ? new Date(studentData.ngay_vao_dang).toISOString().split('T')[0] : null,
                ngay_vao_truong: studentData.ngay_vao_truong ? new Date(studentData.ngay_vao_truong).toISOString().split('T')[0] : null,
                ngay_ra_truong: studentData.ngay_ra_truong ? new Date(studentData.ngay_ra_truong).toISOString().split('T')[0] : null,
                nam_tot_nghiep_PTTH: studentData.ngay_ra_truong ? new Date(studentData.ngay_ra_truong).toISOString().split('T')[0] : null
            };


            console.log("Dữ liệu gửi đi:", formattedStudentData);

            // 6️⃣ Lưu sinh viên vào hệ thống
            let res;
            if (editIndex === null) {
                res = await createNewStudent(formattedStudentData);
                setStudents([...students, res]);
            } else {
                res = await updateStudentById(formattedStudentData, formattedStudentData.id);
                const updatedStudents = [...students];
                updatedStudents[editIndex] = res;
                setStudents(updatedStudents);
            }

            // 7️⃣ Kiểm tra nếu đối tượng là quân nhân, mở popup nhập thông tin quân nhân
            const quanNhanList = ["quân đội", "công an", "đảng chính quyền"];
            const doiTuong = danhSachDoiTuongQL.find(item => item.id === res.doi_tuong_id);

            if (doiTuong && quanNhanList.includes(doiTuong.ten_doi_tuong.toLowerCase())) {
                setOpenMilitaryPopup(true);
                setMilitaryData(prev => ({ ...prev, sinh_vien_id: res.id }));
            }

            setOpen(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật học viên:", error);
        }
    };







    // const doiTuongDaoTaoList = [
    //     { id: 1, ten_doi_tuong: "Quân Đội" },
    //     { id: 2, ten_doi_tuong: "Công An" },
    //     { id: 3, ten_doi_tuong: "Đảng chính quyền" },
    //     { id: 4, ten_doi_tuong: "Quốc tế - Lào" },
    //     { id: 5, ten_doi_tuong: "Quốc tế - Campuchia" },
    //     { id: 6, ten_doi_tuong: "Quốc tế - Cuba" }
    // ];

    const getDoiTuongName = (id) => {
        const doiTuong = danhSachDoiTuongQL.find(item => item.id === Number(id)); // Ép kiểu về số
        return doiTuong ? doiTuong.ten_doi_tuong : "Không xác định";
    };


    // Hàm lấy mã lớp từ danhSachLop
    const getMaLop = (id) => {
        const lop = danhSachLop.find(item => item.id === Number(id)); // Ép kiểu nếu cần
        return lop ? lop.ma_lop : "Không xác định";
    };


    useEffect(() => {
        const fetchMilitaryInfo = async () => {
            if (tabIndex === 1 && studentData.id) {
                try {
                    const data = await getMilitaryInfoByStudentId(studentData.id);
                    setMilitaryData(data);
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin quân nhân:", error);
                    setMilitaryData([]);
                }
            }
        };

        fetchMilitaryInfo();
    }, [tabIndex, studentData.id]);




    const handleSaveMilitary = async () => {
        try {
            console.log("Dữ liệu quân nhân cần lưu:", militaryData.sinh_vien_id);

            // Chuyển đổi các trường ngày từ string sang định dạng phù hợp
            const formattedData = {
                ...militaryData,
                ngay_nhap_ngu: militaryData.ngay_nhap_ngu ? new Date(militaryData.ngay_nhap_ngu).toISOString() : null,
                ngay_nhan_luong: militaryData.ngay_nhan_luong ? new Date(militaryData.ngay_nhan_luong).toISOString() : null,
            };

            if (editIndex !== null) {
                await updateMilitaryInfoByStudentId(militaryData.sinh_vien_id, formattedData);
                console.log("Cập nhật thông tin quân nhân thành công!");
            } else {
                await createMilitaryInfo(formattedData);
                console.log("Thêm mới thông tin quân nhân thành công!");
            }

            setOpenMilitaryPopup(false);
        } catch (error) {
            console.error("Lỗi khi lưu thông tin quân nhân:", error);
        }
    };









    const renderField = (field) => (
        <Grid item xs={12} sm={4} key={field.key}>
            {/* Trường select (chọn từ danh sách có sẵn) */}
            {field.type === "select" ? (
                <FormControl fullWidth margin="normal" required={field.required} error={!!errors[field.key]}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                        value={studentData[field.key] || ""}
                        onChange={(e) => {
                            setStudentData({
                                ...studentData,
                                [field.key]: e.target.value
                            });

                            // Xóa lỗi khi chọn lại giá trị
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

            ) : field.type === "api" ? ( // Trường lấy dữ liệu từ API
                <FormControl fullWidth margin="normal" required={field.required} error={!!errors[field.key]}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                        value={studentData[field.key] || ""}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            const updatedData = { ...studentData, [field.key]: newValue };

                            // Nếu thay đổi lớp, cập nhật mã sinh viên tự động
                            if (field.key === "lop_id") {
                                updatedData.ma_sinh_vien = generateMaSinhVien(newValue);
                            }

                            setStudentData(updatedData);

                            // Xóa lỗi khi chọn lại giá trị
                            setErrors((prev) => ({ ...prev, [field.key]: "" }));
                        }}
                    >
                        <MenuItem value="">Chọn...</MenuItem> {/* Mặc định */}
                        {field.options.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item[field.optionLabel]}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors[field.key] && <FormHelperText>{errors[field.key]}</FormHelperText>}
                </FormControl>

            ) : field.type === "date" ? ( // Trường ngày tháng
                <TextField
                    label={field.label}
                    type="date"
                    value={studentData[field.key] || ""}
                    onChange={(e) => {
                        setStudentData({ ...studentData, [field.key]: e.target.value });

                        // Xóa lỗi khi chọn ngày hợp lệ
                        setErrors((prev) => ({ ...prev, [field.key]: "" }));
                    }}
                    fullWidth
                    margin="normal"
                    error={!!errors[field.key]}
                    helperText={errors[field.key]}
                    InputLabelProps={{ shrink: true }}
                />

            ) : ( // Trường nhập văn bản bình thường
                <TextField
                    label={field.label}
                    value={studentData[field.key] || ""}
                    onChange={(e) => {
                        setStudentData({ ...studentData, [field.key]: e.target.value });

                        // Xóa lỗi khi nhập lại
                        setErrors((prev) => ({ ...prev, [field.key]: "" }));
                    }}
                    fullWidth
                    margin="normal"
                    error={!!errors[field.key]}
                    helperText={errors[field.key]}
                />
            )}
        </Grid>
    );




    // Quản lý trạng thái phân trang
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Số dòng mỗi trang

    // Cắt danh sách sinh viên dựa trên trang hiện tại
    const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Xử lý thay đổi trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Xử lý thay đổi số dòng trên mỗi trang
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset về trang đầu tiên
    };




    return (
        <Container maxWidth="xl">
            <Typography variant="h5" gutterBottom style={{ fontWeight: 600, marginBottom: "20px" }}>
                Quản lý học viên
            </Typography>

            {/* Thanh tìm kiếm */}
            <TextField
                label="Tìm kiếm học viên..."
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Bộ lọc */}
            {/* Bộ lọc */}
            <Grid container spacing={2} alignItems="center" sx={{ marginTop: "4px" }}>




                {/* Chọn Hệ đào tạo */}
                {/* <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }}>Hệ đào tạo</InputLabel>
                        <Select
                            value={filter.he_dao_tao}
                            onChange={(e) => setFilter({ ...filter, he_dao_tao: e.target.value })}
                        >
                            {danhSachHeDaoTao.map(item => {
                                return <MenuItem key={item.id} value={item.ma_he_dao_tao}>{item.ten_he_dao_tao}</MenuItem>;
                            })}
                        </Select>

                    </FormControl>
                </Grid> */}

                {/* Chọn Khóa học */}
                {/* <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }}>Khóa học</InputLabel>
                        <Select
                            value={filter.khoa_hoc}
                            onChange={(e) => setFilter({ ...filter, khoa_hoc: e.target.value })}
                        >
                            {danhSachKhoa.map(item => {
                                return <MenuItem key={item.id} value={item.ma_khoa}>{item.ma_khoa}</MenuItem>;
                            })}
                        </Select>
                    </FormControl>
                </Grid> */}

                {/* Chọn Lớp */}
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }}>Lớp</InputLabel>
                        <Select
                            value={lop_tu_sinh.lop_id || ""}  // Tránh giá trị undefined
                            onChange={(e) => {
                                const selectedLop = e.target.value;
                                setLop_ts({ ...lop_tu_sinh, lop_id: selectedLop });
                                setStudentData({ ...studentData, lop_id: selectedLop });
                            }}

                        >
                            {danhSachLop.map(item => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.ma_lop}
                                </MenuItem>
                            ))}
                        </Select>

                    </FormControl>
                </Grid>

            </Grid>

            <Button
                sx={{ marginTop: "8px" }}
                variant="contained" color="primary" onClick={() => handleOpen()}>
                Thêm học viên
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
                    <TableBody>
                        {paginatedStudents.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.ho_dem} {student.ten}</TableCell>
                                <TableCell>{student.ma_sinh_vien}</TableCell>
                                <TableCell>{student.gioi_tinh === 0 ? "Nữ" : "Nam"}</TableCell>
                                <TableCell>{getMaLop(student.lop_id)}</TableCell>
                                <TableCell>{getDoiTuongName(student.doi_tuong_id)}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" onClick={() => handleOpenDetail(student?.id - 1)}>Xem chi tiết</Button>
                                    <Button variant="outlined" onClick={() => handleOpen(student?.id - 1)} style={{ marginLeft: 10 }}>Chỉnh sửa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Phân trang */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 20]} // Các tùy chọn số dòng mỗi trang
                    component="div"
                    count={filteredStudents.length} // Tổng số dòng
                    rowsPerPage={rowsPerPage} // Số dòng mỗi trang
                    page={page} // Trang hiện tại
                    onPageChange={handleChangePage} // Khi chuyển trang
                    onRowsPerPageChange={handleChangeRowsPerPage} // Khi thay đổi số dòng mỗi trang
                    labelRowsPerPage="Số dòng mỗi trang" // Đổi sang tiếng Việt
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
                                { label: "Tên", value: studentData.ho_dem + " " + studentData.ten },
                                { label: "Mã sinh viên", value: studentData.ma_sinh_vien },
                                { label: "Ngày sinh", value: studentData.ngay_sinh },
                                { label: "Giới tính", value: studentData.gioi_tinh ? "Nam" : "Nữ" },
                                { label: "Quê quán", value: studentData.que_quan },
                                { label: "Lớp ID", value: getMaLop(studentData.lop_id) },
                                { label: "Đối tượng ID", value: getDoiTuongName(studentData.doi_tuong_id) },
                                { label: "Đang học", value: studentData.dang_hoc ? "Có" : "Không" },
                                { label: "Ghi chú", value: studentData.ghi_chu },
                                { label: "Số tài khoản", value: studentData.so_tai_khoan },
                                { label: "Ngân hàng", value: studentData.ngan_hang },
                                { label: "Chức vụ", value: studentData.chuc_vu },
                                { label: "CCCD", value: studentData.CCCD },
                                { label: "Ngày cấp CCCD", value: studentData.ngay_cap_CCCD },
                                { label: "Nơi cấp CCCD", value: studentData.noi_cap_CCCD },
                                { label: "Kỳ nhập học", value: studentData.ky_nhap_hoc },
                                { label: "Ngày vào đoàn", value: studentData.ngay_vao_doan },
                                { label: "Ngày vào đảng", value: studentData.ngay_vao_dang },
                                { label: "Ngày vào trường", value: studentData.ngay_vao_truong },
                                { label: "Ngày ra trường", value: studentData.ngay_ra_truong },
                                { label: "Tỉnh thành", value: studentData.tinh_thanh },
                                { label: "Quận huyện", value: studentData.quan_huyen },
                                { label: "Phường xã khối", value: studentData.phuong_xa_khoi },
                                { label: "Dân tộc", value: studentData.dan_toc },
                                { label: "Tôn giáo", value: studentData.ton_giao },
                                { label: "Quốc tịch", value: studentData.quoc_tich },
                                { label: "Trúng tuyển theo nguyện vọng", value: studentData.trung_tuyen_theo_nguyen_vong },
                                { label: "Năm tốt nghiệp PTTH", value: studentData.nam_tot_nghiep_PTTH },
                                { label: "Thành phần gia đình", value: studentData.thanh_phan_gia_dinh },
                                { label: "Đối tượng đào tạo", value: studentData.doi_tuong_dao_tao },
                                { label: "DV liên kết đào tạo", value: studentData.dv_lien_ket_dao_tao },
                                { label: "Số điện thoại", value: studentData.so_dien_thoai },
                                { label: "Số điện thoại gia đình", value: studentData.dien_thoai_gia_dinh },
                                { label: "Điện thoại cơ quan", value: studentData.dien_thoai_CQ },
                                { label: "Email", value: studentData.email },
                                { label: "Khi cần báo tin cho ai", value: studentData.khi_can_bao_tin_cho_ai },
                                { label: "Nội trú", value: studentData.noi_tru ? "Có" : "Không" },
                                { label: "Ngoại trú", value: studentData.ngoai_tru ? "Có" : "Không" }
                            ].map((item, index) =>
                                item.value ? (
                                    <Grid item xs={12} sm={3} key={index}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                            {item.label}:
                                        </Typography>
                                        <Typography variant="body1">{item.value}</Typography>
                                    </Grid>
                                ) : null
                            )}
                        </Grid>
                    )}

                    {tabIndex === 1 && studentData.doi_tuong_id && (
                        <Grid maxWidth="" xs={12} sm={3} container spacing={2}>
                            {[
                                { label: "Sinh viên ID", value: militaryData.sinh_vien_id },
                                { label: "Ngày nhập ngũ", value: militaryData.ngay_nhap_ngu },
                                { label: "Cấp bậc", value: militaryData.cap_bac },
                                { label: "Trình độ văn hóa", value: militaryData.trinh_do_van_hoa },
                                { label: "Nơi ở hiện nay", value: militaryData.noi_o_hien_nay },
                                { label: "Đơn vị cử đi học", value: militaryData.don_vi_cu_di_hoc },
                                { label: "Loại lương", value: militaryData.loai_luong },
                                { label: "Nhóm lương", value: militaryData.nhom_luong },
                                { label: "Bậc lương", value: militaryData.bac_luong },
                                { label: "Ngày nhận lương", value: militaryData.ngay_nhap_ngu },
                                { label: "Chức vụ", value: militaryData.chuc_vu },
                                { label: "Sức khỏe", value: militaryData.suc_khoe },
                            ].map((item, index) =>
                                item.value ? (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                            {item.label}:
                                        </Typography>
                                        <Typography variant="body1">{item.value}</Typography>
                                    </Grid>
                                ) : null
                            )}
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
                    {editIndex !== null ? `Chỉnh sửa sinh viên: ${studentData.ho_dem + " " + studentData.ten}` : `Thêm sinh viên`}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>

                        {/* Thông tin cá nhân */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin cá nhân</Typography>
                        </Grid>
                        {[
                            { label: "Họ đệm", key: "ho_dem" },
                            { label: "Tên", key: "ten" },
                            { label: "Mã sinh viên", key: "ma_sinh_vien" },
                            { label: "Ngày sinh", key: "ngay_sinh", type: "date" },
                            { label: "Giới tính", key: "gioi_tinh", type: "select", options: [{ value: 1, label: "Nam" }, { value: 0, label: "Nữ" }] },
                            { label: "Quê quán", key: "que_quan" },
                            { label: "Dân tộc", key: "dan_toc" },
                            { label: "Tôn giáo", key: "ton_giao" },
                            { label: "Quốc tịch", key: "quoc_tich" }
                        ].map(renderField)}

                        {/* Thông tin học tập */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin học tập</Typography>
                        </Grid>
                        {[
                            { label: "Lớp", key: "lop_id", type: "api", options: danhSachLop, optionLabel: "ma_lop" },
                            { label: "Đối tượng", key: "doi_tuong_id", type: "api", options: danhSachDoiTuongQL, optionLabel: "chi_tiet_doi_tuong" },
                            { label: "Đang học", key: "dang_hoc", type: "select", options: [{ value: 1, label: "Có" }, { value: 0, label: "Không" }] },
                            { label: "Ghi chú", key: "ghi_chu" },
                            { label: "Kỳ nhập học", key: "ky_nhap_hoc" },
                            { label: "Ngày vào trường", key: "ngay_vao_truong", type: "date" },
                            { label: "Ngày ra trường", key: "ngay_ra_truong", type: "date" },
                            { label: "Trúng tuyển theo nguyện vọng", key: "trung_tuyen_theo_nguyen_vong" },
                            { label: "Năm tốt nghiệp PTTH", key: "nam_tot_nghiep_PTTH" },
                            { label: "Thành phần gia đình", key: "thanh_phan_gia_dinh" },
                            { label: "Đối tượng đào tạo", key: "doi_tuong_dao_tao" },
                            { label: "Đơn vị liên kết đào tạo", key: "dv_lien_ket_dao_tao" }
                        ].map(renderField)}

                        {/* Thông tin liên hệ */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin liên hệ</Typography>
                        </Grid>
                        {[
                            { label: "Số điện thoại", key: "so_dien_thoai" },
                            { label: "Điện thoại gia đình", key: "dien_thoai_gia_dinh" },
                            { label: "Điện thoại cơ quan", key: "dien_thoai_CQ" },
                            { label: "Email", key: "email" },
                            { label: "Khi cần báo tin cho ai", key: "khi_can_bao_tin_cho_ai" }
                        ].map(renderField)}

                        {/* Thông tin cư trú */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin cư trú</Typography>
                        </Grid>
                        {[
                            { label: "Nội trú", key: "noi_tru", type: "select", options: [{ value: 1, label: "Có" }, { value: 0, label: "Không" }] },
                            { label: "Ngoại trú", key: "ngoai_tru", type: "select", options: [{ value: 1, label: "Có" }, { value: 0, label: "Không" }] },
                            { label: "Tỉnh thành", key: "tinh_thanh" },
                            { label: "Quận huyện", key: "quan_huyen" },
                            { label: "Phường xã khối", key: "phuong_xa_khoi" }
                        ].map(renderField)}

                        {/* Thông tin chính trị - đoàn thể */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>Thông tin chính trị - đoàn thể</Typography>
                        </Grid>
                        {[
                            { label: "Ngày vào đoàn", key: "ngay_vao_doan", type: "date" },
                            { label: "Ngày vào đảng", key: "ngay_vao_dang", type: "date" },
                            { label: "CCCD", key: "CCCD" },
                            { label: "Ngày cấp CCCD", key: "ngay_cap_CCCD", type: "date" }
                        ].map(renderField)}

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Hủy</Button>
                    <Button onClick={handleSave} color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>





            {/* Dialog Chỉnh Sửa thong tin quân nhân  */}
            <Dialog maxWidth="xl" open={openMilitaryPopup} onClose={handleCloseMiPopup} disableEscapeKeyDown={false}>


                <DialogTitle>{editIndex !== null ? `Chỉnh sửa sinh viên: ${studentData.ho_dem + " " + studentData.ten}` : `Thêm sinh viên`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {[
                            { label: "Ngày nhập ngũ", key: "ngay_nhap_ngu" },
                            { label: "Cấp bậc", key: "cap_bac" },
                            { label: "Trình độ văn hóa", key: "trinh_do_van_hoa" },
                            { label: "Nơi ở hiện nay", key: "noi_o_hien_nay" },
                            { label: "Đơn vị cử đi học", key: "don_vi_cu_di_hoc" },
                            { label: "Loại lương", key: "loai_luong" },  // Không phải date
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
                                        type={isDateField ? "date" : "text"}  // Đúng trường mới là date
                                        value={isDateField
                                            ? (militaryData[key] ? militaryData[key].slice(0, 10) : "")
                                            : (militaryData[key] || "")
                                        }
                                        onChange={(e) =>
                                            setMilitaryData(prev => ({
                                                ...prev,
                                                [key]: isDateField
                                                    ? (e.target.value && !isNaN(Date.parse(e.target.value))
                                                        ? new Date(e.target.value).toISOString()
                                                        : e.target.value)
                                                    : e.target.value // Nếu không phải ngày thì lưu nguyên
                                            }))
                                        }
                                        fullWidth
                                        margin="normal"
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }} // Giữ label luôn ở trên
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
