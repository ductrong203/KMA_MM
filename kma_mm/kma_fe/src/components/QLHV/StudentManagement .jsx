import React, { useState } from "react";
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
    Grid
} from "@mui/material";

const StudentManagement = () => {
    const [students, setStudents] = useState([
        {
            id: 1,
            ma_sinh_vien: "SV123456",
            ngay_sinh: "2002-08-15",
            gioi_tinh: 1,
            que_quan: "Hà Nội",
            lop_id: 101,
            doi_tuong_id: 3,
            dang_hoc: 1,
            ghi_chu: "Học viên chăm chỉ",
            ho_dem: "Nguyễn Văn",
            ten: "A",
            so_tai_khoan: "123456789",
            ngan_hang: "Vietcombank",
            chuc_vu: "Lớp trưởng",
            CCCD: "0123456789",
            ngay_cap_CCCD: "2020-05-20",
            noi_cap_CCCD: "Hà Nội",
            ky_nhap_hoc: "2022",
            ngay_vao_doan: "2018-09-15",
            ngay_vao_dang: null,
            ngay_vao_truong: "2022-09-05",
            ngay_ra_truong: "2026-06-30",
            tinh_thanh: "Hà Nội",
            quan_huyen: "Cầu Giấy",
            phuong_xa_khoi: "Dịch Vọng",
            dan_toc: "Kinh",
            ton_giao: "Không",
            quoc_tich: "Việt Nam",
            trung_tuyen_theo_nguyen_vong: "1",
            nam_tot_nghiep_PTTH: "2022",
            thanh_phan_gia_dinh: "Công nhân viên chức",
            doi_tuong_dao_tao: "Chính quy",
            dv_lien_ket_dao_tao: null,
            so_dien_thoai: "0987654321",
            dien_thoai_gia_dinh: "0123456789",
            dien_thoai_CQ: null,
            email: "nguyenvana@example.com",
            khi_can_bao_tin_cho_ai: "Nguyễn Văn Bố - 0912345678",
            noi_tru: 1,
            ngoai_tru: 0
        },
        {
            id: 2,
            ma_sinh_vien: "SV654321",
            ngay_sinh: "2003-03-10",
            gioi_tinh: 0,
            que_quan: "TP. Hồ Chí Minh",
            lop_id: 102,
            doi_tuong_id: 4,
            dang_hoc: 1,
            ghi_chu: "Thành viên tích cực",
            ho_dem: "Trần Thị",
            ten: "B",
            so_tai_khoan: "987654321",
            ngan_hang: "Techcombank",
            chuc_vu: "Bí thư",
            CCCD: "9876543210",
            ngay_cap_CCCD: "2021-07-15",
            noi_cap_CCCD: "TP. Hồ Chí Minh",
            ky_nhap_hoc: "2022",
            ngay_vao_doan: "2019-06-10",
            ngay_vao_dang: null,
            ngay_vao_truong: "2022-09-05",
            ngay_ra_truong: "2026-06-30",
            tinh_thanh: "TP. Hồ Chí Minh",
            quan_huyen: "Quận 1",
            phuong_xa_khoi: "Bến Nghé",
            dan_toc: "Kinh",
            ton_giao: "Không",
            quoc_tich: "Việt Nam",
            trung_tuyen_theo_nguyen_vong: "2",
            nam_tot_nghiep_PTTH: "2022",
            thanh_phan_gia_dinh: "Kinh doanh",
            doi_tuong_dao_tao: "Chính quy",
            dv_lien_ket_dao_tao: null,
            so_dien_thoai: "0908765432",
            dien_thoai_gia_dinh: "0123987654",
            dien_thoai_CQ: null,
            email: "tranthib@example.com",
            khi_can_bao_tin_cho_ai: "Trần Văn C - 0987123456",
            noi_tru: 0,
            ngoai_tru: 1
        }
    ]
    );

    const [open, setOpen] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [studentData, setStudentData] = useState({
        id: "",
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
        ngoai_tru: false
    });

    const handleOpen = (index = null) => {
        setEditIndex(index);
        if (index !== null) {
            setStudentData(students[index]);
        } else {
            setStudentData({ name: "", credits: "", completedRules: false, isSoldier: false, militaryInfo: "" });
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

    const handleSave = () => {
        if (editIndex !== null) {
            const updatedStudents = [...students];
            updatedStudents[editIndex] = studentData;
            setStudents(updatedStudents);
        } else {
            setStudents([...students, { ...studentData, id: students.length + 1 }]);
        }
        setOpen(false);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h5" gutterBottom>
                Quản lý học viên
            </Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
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
                    {studentData.isSoldier && <Tab label="Chi tiết quân nhân" />}
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
                    {tabIndex === 1 && studentData.isSoldier && (
                        <Typography variant="body1">{studentData.militaryInfo}</Typography>
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
                                        checked={studentData.isSoldier}
                                        onChange={(e) => setStudentData({ ...studentData, isSoldier: e.target.checked })}
                                    />
                                }
                                label="Là quân nhân"
                            />
                        </Grid>

                        {studentData.isSoldier && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Thông tin quân nhân"
                                    value={studentData.militaryInfo}
                                    onChange={(e) => setStudentData({ ...studentData, militaryInfo: e.target.value })}
                                    fullWidth
                                    margin="normal"
                                />
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
