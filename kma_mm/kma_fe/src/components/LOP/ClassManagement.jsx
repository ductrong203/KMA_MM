import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, TablePagination } from "@mui/material";
import axios from "axios";
import { getAllClassList } from "../../Api_controller/Service/trainingService";

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [classData, setClassData] = useState({ ma_lop: "", danh_muc_dao_tao_id: "" });

    // Phân trang
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchClasses();
        fetchCategories();
    }, []);

    // Lấy danh sách lớp từ API
    const fetchClasses = async () => {
        // try {
        //     const res = await getAllClassList();
        //     setClasses(res.data);
        // } catch (error) {
        //     console.error("Lỗi khi lấy danh sách lớp:", error);
        // }
    };

    // Lấy danh mục đào tạo từ API
    const fetchCategories = async () => {
        // try {
        //     const res = await axios.get("http://localhost:8000/categories");
        //     setCategories(res.data);
        // } catch (error) {
        //     console.error("Lỗi khi lấy danh mục đào tạo:", error);
        // }
    };

    // Mở form (Thêm hoặc Chỉnh sửa)
    const handleOpen = (index = null) => {
        if (index !== null) {
            setEditIndex(index);
            setClassData(classes[index]);
        } else {
            setEditIndex(null);
            setClassData({ ma_lop: "", danh_muc_dao_tao_id: "" });
        }
        setOpen(true);
    };

    // Đóng form
    const handleClose = () => setOpen(false);

    // Xử lý nhập dữ liệu
    const handleChange = (e) => {
        setClassData({ ...classData, [e.target.name]: e.target.value });
    };

    // Lưu lớp mới hoặc cập nhật lớp
    const handleSave = async () => {
        // try {
        //     if (editIndex === null) {
        //         // Thêm lớp mới
        //         const res = await axios.post("http://localhost:8000/classes", classData);
        //         setClasses([...classes, res.data]);
        //     } else {
        //         // Cập nhật lớp
        //         const res = await axios.put(`http://localhost:8000/classes/${classes[editIndex].id}`, classData);
        //         const updatedClasses = [...classes];
        //         updatedClasses[editIndex] = res.data;
        //         setClasses(updatedClasses);
        //     }
        //     handleClose();
        // } catch (error) {
        //     console.error("Lỗi khi lưu lớp:", error);
        // }
    };

    // Xóa lớp
    const handleDelete = async (index) => {
        // try {
        //     await axios.delete(`http://localhost:8000/classes/${classes[index].id}`);
        //     setClasses(classes.filter((_, i) => i !== index));
        // } catch (error) {
        //     console.error("Lỗi khi xóa lớp:", error);
        // }
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                Thêm lớp
            </Button>

            {/* Bảng hiển thị danh sách lớp */}
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã lớp</TableCell>
                            <TableCell>Danh mục đào tạo</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {classes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cls, index) => (
                            <TableRow key={index}>
                                <TableCell>{cls.ma_lop}</TableCell>
                                <TableCell>{categories.find(c => c.id === cls.danh_muc_dao_tao_id)?.ten || "N/A"}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" onClick={() => handleOpen(index)}>Chỉnh sửa</Button>
                                    <Button variant="outlined" color="error" onClick={() => handleDelete(index)} style={{ marginLeft: 10 }}>
                                        Xóa
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Phân trang */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={classes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                labelRowsPerPage="Số dòng mỗi trang"
            />

            {/* Dialog Thêm/Sửa lớp */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editIndex === null ? "Thêm lớp" : "Chỉnh sửa lớp"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Mã lớp"
                        name="ma_lop"
                        value={classData.ma_lop}
                        onChange={handleChange}
                        fullWidth
                        margin="dense"
                    />
                    <Select
                        name="danh_muc_dao_tao_id"
                        value={classData.danh_muc_dao_tao_id}
                        onChange={handleChange}
                        fullWidth
                        margin="dense"
                        displayEmpty
                    >
                        <MenuItem value="" disabled>Chọn danh mục đào tạo</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.ten}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ClassManagement;
