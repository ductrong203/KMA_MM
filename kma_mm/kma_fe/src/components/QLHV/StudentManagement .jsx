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
    TablePagination
} from "@mui/material";

import { createMilitaryInfo, createNewStudent, getAllMiri, getAllStudent, updateMilitaryInfoByStudentId, updateStudentById } from "../../Api_controller/Service/qlhvService";

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



    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await getAllStudent(); // Gọi API
                const data2 = await getAllMiri(); // gọi api lấy tất cả thông tin quân nhân
                console.log(data)
                console.log(data2)
                setMilitary(data2);
                setStudents(data); // Cập nhật danh sách học viên
            } catch (error) {
                console.error("Lỗi khi lấy danh sách học viên:", error);
            }
        };

        fetchStudents();
    }, []);


    const handleOpen = (index = null) => {
        setEditIndex(index);

        if (index !== null) {
            setStudentData(students[index]);
            console.log(students[index])
        } else {
            setStudentData({

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
    const [filter, setFilter] = useState({ lop_id: "", dang_hoc: "", noi_tru: "" });
    const filteredStudents = students.filter(student => {
        return (
            (student.ho_dem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.ma_sinh_vien.includes(searchTerm)) &&
            (filter.lop_id === "" || student.lop_id.toString() === filter.lop_id) &&
            (filter.dang_hoc === "" || student.dang_hoc.toString() === filter.dang_hoc) &&
            (filter.noi_tru === "" || student.noi_tru.toString() === filter.noi_tru)
        );
    });

    const handleGenderChange = (event) => {
        setStudentData((prev) => ({
            ...prev,
            gioi_tinh: event.target.value === "Nam", // Chuyển đổi thành boolean
        }));
    };

    const handleSave = async () => {
        try {
            let res; // Khai báo biến res để tránh lỗi ReferenceError

            if (editIndex === null) {
                // Form tạo mới sinh viên
                res = await createNewStudent(studentData);
                setStudents([...students, res]);
            } else {
                // Form chỉnh sửa sinh viên
                res = await updateStudentById(studentData, studentData.id);
                const updatedStudents = [...students];
                updatedStudents[editIndex] = res;
                setStudents(updatedStudents);
            }

            // Nếu đối tượng có id > 2 thì mở popup và set dữ liệu quân nhân
            if (res.doi_tuong_id > 2) {
                setOpenMilitaryPopup(true);
                setMilitaryData(prev => ({ ...prev, sinh_vien_id: res.id }));
            }

            setOpen(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật học viên:", error);
        }
    };




    useEffect(() => {
        const fetchMilitaryInfo = async () => {
            if (tabIndex === 1 && studentData.id) {
                try {
                    const data = await getMilitaryInfoByStudentId(studentData.id);
                    setMilitaryData(data);
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin quân nhân:", error);
                }
            }
        };

        fetchMilitaryInfo();
    }, [tabIndex, studentData.id]);




    const handleSaveMilitary = async () => {
        try {
            console.log("Dữ liệu quân nhân cần lưu:", militaryData.sinh_vien_id);

            if (editIndex !== null) {
                // Nếu đang chỉnh sửa thì gọi API cập nhật
                await updateMilitaryInfoByStudentId(militaryData.sinh_vien_id, militaryData);
                console.log("Cập nhật thông tin quân nhân thành công!");
            } else {
                // Nếu thêm mới thì gọi API tạo mới
                await createMilitaryInfo(militaryData);
                console.log("Thêm mới thông tin quân nhân thành công!");
            }

            setOpenMilitaryPopup(false);
        } catch (error) {
            console.error("Lỗi khi lưu thông tin quân nhân:", error);
        }
    };



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
            <Grid
                sx={{ marginTop: "4px" }}
                container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }} >Lớp</InputLabel>
                        <Select
                            value={filter.lop_id}
                            onChange={(e) => setFilter({ ...filter, lop_id: e.target.value })}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="101">Lớp 101</MenuItem>
                            <MenuItem value="102">Lớp 102</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }}  >Trạng thái</InputLabel>
                        <Select
                            value={filter.dang_hoc}
                            onChange={(e) => setFilter({ ...filter, dang_hoc: e.target.value })}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="1">Đang học</MenuItem>
                            <MenuItem value="0">Đã tốt nghiệp</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ padding: "0 2px", backgroundColor: "white" }} >Nội trú</InputLabel>
                        <Select
                            value={filter.noi_tru}
                            onChange={(e) => setFilter({ ...filter, noi_tru: e.target.value })}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="1">Nội trú</MenuItem>
                            <MenuItem value="0">Ngoại trú</MenuItem>
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
                                <TableCell>{student.lop_id}</TableCell>
                                <TableCell>{student.doi_tuong_dao_tao}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" onClick={() => handleOpenDetail(index)}>Xem chi tiết</Button>
                                    <Button variant="outlined" onClick={() => handleOpen(index)} style={{ marginLeft: 10 }}>Chỉnh sửa</Button>
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
                                { label: "Lớp ID", value: studentData.lop_id },
                                { label: "Đối tượng ID", value: studentData.doi_tuong_id },
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
                <DialogTitle>{editIndex !== null ? `Chỉnh sửa sinh viên: ${studentData.ho_dem + " " + studentData.ten}` : `Thêm sinh viên`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {[
                            { label: "Họ đệm", key: "ho_dem" },
                            { label: "Tên", key: "ten" },
                            { label: "Mã sinh viên", key: "ma_sinh_vien" },
                            { label: "Ngày sinh", key: "ngay_sinh" },
                            { label: "Giới tính", key: "gioi_tinh" },
                            { label: "Quê quán", key: "que_quan" },
                            { label: "Lớp ID", key: "lop_id" },
                            { label: "Đối tượng ID", key: "doi_tuong_id" },
                            { label: "Đang học", key: "dang_hoc" },
                            { label: "Ghi chú", key: "ghi_chu" },
                            { label: "Số tài khoản", key: "so_tai_khoan" },
                            { label: "Ngân hàng", key: "ngan_hang" },
                            { label: "Chức vụ", key: "chuc_vu" },
                            { label: "CCCD", key: "CCCD" },
                            { label: "Ngày cấp CCCD", key: "ngay_cap_CCCD" },
                            { label: "Kỳ nhập học", key: "ky_nhap_hoc" },
                            { label: "Ngày vào đoàn", key: "ngay_vao_doan" },
                            { label: "Ngày vào đảng", key: "ngay_vao_dang" },
                            { label: "Ngày vào trường", key: "ngay_vao_truong" },
                            { label: "Ngày ra trường", key: "ngay_ra_truong" },
                            { label: "Tỉnh thành", key: "tinh_thanh" },
                            { label: "Quận huyện", key: "quan_huyen" },
                            { label: "Phường xã khối", key: "phuong_xa_khoi" },
                            { label: "Dân tộc", key: "dan_toc" },
                            { label: "Tôn giáo", key: "ton_giao" },
                            { label: "Quốc tịch", key: "quoc_tich" },
                            { label: "Trúng tuyển theo nguyện vọng", key: "trung_tuyen_theo_nguyen_vong" },
                            { label: "Năm tốt nghiệp PTTH", key: "nam_tot_nghiep_PTTH" },
                            { label: "Thành phần gia đình", key: "thanh_phan_gia_dinh" },
                            { label: "Đối tượng đào tạo", key: "doi_tuong_dao_tao" },
                            { label: "Đơn vị liên kết đào tạo", key: "dv_lien_ket_dao_tao" },
                            { label: "Số điện thoại", key: "so_dien_thoai" },
                            { label: "Điện thoại gia đình", key: "dien_thoai_gia_dinh" },
                            { label: "Điện thoại cơ quan", key: "dien_thoai_CQ" },
                            { label: "Email", key: "email" },
                            { label: "Khi cần báo tin cho ai", key: "khi_can_bao_tin_cho_ai" },
                            { label: "Nội trú", key: "noi_tru" },
                            { label: "Ngoại trú", key: "ngoai_tru" }
                        ].map((field) => (
                            <Grid item xs={12} sm={4} key={field.key}>
                                {field.key === "gioi_tinh" ? (
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel sx={{ backgroundColor: "white" }}>Giới tính</InputLabel>
                                        <Select
                                            value={studentData.gioi_tinh}
                                            onChange={(e) => setStudentData({ ...studentData, gioi_tinh: e.target.value })}
                                        >
                                            <MenuItem value={1}>Nam</MenuItem>
                                            <MenuItem value={0}>Nữ</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) :
                                    field.key === "dang_hoc" ? (
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel sx={{ backgroundColor: "white" }}>Đang học</InputLabel>
                                            <Select
                                                value={studentData.dang_hoc}
                                                onChange={(e) => setStudentData({ ...studentData, dang_hoc: e.target.value })}
                                            >
                                                <MenuItem value={1}>Có</MenuItem>
                                                <MenuItem value={0}>Không</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )
                                        :
                                        field.key === "noi_tru" ? (
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel sx={{ backgroundColor: "white" }}>Nội trú</InputLabel>
                                                <Select
                                                    value={studentData.noi_tru}
                                                    onChange={(e) => setStudentData({ ...studentData, noi_tru: e.target.value })}
                                                >
                                                    <MenuItem value={1}>Có</MenuItem>
                                                    <MenuItem value={0}>Không</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )
                                            :
                                            field.key === "ngoai_tru" ? (
                                                <FormControl fullWidth margin="normal">
                                                    <InputLabel sx={{ backgroundColor: "white" }}>Ngoại trú</InputLabel>
                                                    <Select
                                                        value={studentData.ngoai_tru}
                                                        onChange={(e) => setStudentData({ ...studentData, ngoai_tru: e.target.value })}
                                                    >
                                                        <MenuItem value={1}>Có</MenuItem>
                                                        <MenuItem value={0}>Không</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )
                                                :

                                                // đoạn này sau sẽ dùng api để render id và tên
                                                field.key === "doi_tuong_id" ? (
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel sx={{ backgroundColor: "white" }}>Đối tượng ID</InputLabel>
                                                        <Select
                                                            value={studentData.doi_tuong_id}
                                                            onChange={(e) => setStudentData({ ...studentData, doi_tuong_id: e.target.value })}
                                                        >
                                                            <MenuItem value={0}>Không</MenuItem>
                                                            <MenuItem value={1}>Cảnh sát</MenuItem>
                                                            <MenuItem value={2}>Nội bộ</MenuItem>
                                                            <MenuItem value={3}>Bộ đội</MenuItem>

                                                        </Select>
                                                    </FormControl>
                                                )

                                                    : (
                                                        <TextField
                                                            label={field.label}
                                                            value={studentData[field.key] || ""}
                                                            onChange={(e) => setStudentData({ ...studentData, [field.key]: e.target.value })}
                                                            fullWidth
                                                            margin="normal"
                                                        />
                                                    )}
                            </Grid>
                        ))}

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
                            //  { label: "Sinh viên ID", key: "sinh_vien_id" },
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
                        ].map(({ label, key }) => (
                            <Grid item xs={12} sm={6} key={key}>
                                <TextField
                                    label={label}
                                    value={militaryData[key] || ""}
                                    onChange={(e) => setMilitaryData(prev => ({ ...prev, [key]: e.target.value }))}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                />
                            </Grid>
                        ))}

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
