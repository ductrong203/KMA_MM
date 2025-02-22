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
    FormControlLabel, FormControl, InputLabel, Select, MenuItem,

    Grid
} from "@mui/material";
import { createNewStudent, getAllStudent } from "../../Api_controller/Service/qlhvService";

const StudentManagement = () => {

    const [students, setStudents] = useState([

    ]
    );



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




    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await getAllStudent(); // Gọi API
                console.log(data)
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




    const handleSave = async () => {
        try {
            if (editIndex === null) {
                // Gọi API để thêm học viên mới
                const newStudent = await createNewStudent(studentData);

                // Cập nhật danh sách học viên sau khi thêm thành công
                setStudents([...students, newStudent]);
            } else {
                // Cập nhật học viên trong danh sách
                const updatedStudents = [...students];
                updatedStudents[editIndex] = studentData;
                setStudents(updatedStudents);
            }
            setOpen(false);
        } catch (error) {
            console.error("Lỗi khi thêm học viên:", error);
        }
    };

    return (
        <Container maxWidth="md">
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
                            <TableCell>giới tính</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.ho_dem} {student.ten}</TableCell>
                                <TableCell>{student.ma_sinh_vien}</TableCell>
                                <TableCell>
                                    {student.gioi_tinh == 0 ? "nữ" : "nam"}
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" onClick={() => handleOpenDetail(index)}>Xem chi tiết</Button>
                                    <Button variant="outlined" onClick={() => handleOpen(index)} style={{ marginLeft: 10 }}>Chỉnh sửa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Chi Tiết */}
            <Dialog open={openDetail} onClose={handleCloseDetail}>
                <DialogTitle>Chi tiết học viên</DialogTitle>
                <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)}>
                    <Tab label="Chi tiết học viên" />
                    {filteredStudents.doi_tuong_id > 1 && <Tab label="Chi tiết quân nhân" />}
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
                                { label: "Đối tượng", value: studentData.doi_tuong_id },
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
                    {tabIndex === 1 && studentData.doi_tuong_id > 2 && (
                        <Grid container spacing={2}>
                            {[

                                { label: "Sinh viên ID", value: studentData.sinh_vien_id },
                                { label: "Ngày nhập ngũ", value: studentData.ngay_nhap_ngu },
                                { label: "Cấp bậc", value: studentData.cap_bac },
                                { label: "Trình độ văn hóa", value: studentData.trinh_do_van_hoa },
                                { label: "Nơi ở hiện nay", value: studentData.noi_o_hien_nay },
                                { label: "Đơn vị cử đi học", value: studentData.don_vi_cu_di_hoc },
                                { label: "Loại lương", value: studentData.loai_luong },
                                { label: "Nhóm lương", value: studentData.nhom_luong },
                                { label: "Bậc lương", value: studentData.bac_luong },
                                { label: "Ngày nhận lương", value: studentData.ngay_nhap_ngu },
                                { label: "Chức vụ", value: studentData.chuc_vu },
                                { label: "Sức khỏe", value: studentData.suc_khoe },

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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editIndex !== null ? "Chỉnh sửa sinh viên" : "Thêm sinh viên"}</DialogTitle>
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
                            { label: "Đối tượng", key: "doi_tuong_id" },
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
                            <Grid item xs={12} sm={6} key={field.key}>
                                <TextField
                                    label={field.label}
                                    value={studentData[field.key]}
                                    onChange={(e) => setStudentData({ ...studentData, [field.key]: e.target.value })}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={studentData.doi_tuong_id > 1}
                                        onChange={(e) => setStudentData({ ...studentData, doi_tuong_id: e.target.checked ? "2" : "1" })}
                                    />
                                }
                                label="Là quân nhân"
                            />
                        </Grid>

                        {studentData.doi_tuong_id > 1 && (
                            <Grid container spacing={2}>
                                {[
                                    { label: "Sinh viên ID", key: "sinh_vien_id" },
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
                                            value={studentData[key] || ""}
                                            onChange={(e) => setStudentData((prev) => ({ ...prev, [key]: e.target.value }))}
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Hủy</Button>
                    <Button onClick={handleSave} color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentManagement;
