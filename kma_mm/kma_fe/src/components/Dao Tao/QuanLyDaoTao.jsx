import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Paper, FormLabel, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TablePagination } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createTraining, fetchDanhSachHeDaoTao, updateTraining } from "../../Api_controller/Service/trainingService";
import { toast } from 'react-toastify';
import PageHeader from '../../layout/PageHeader';

function QuanLyDaoTao() {
    const [openAddTraining, setOpenAddTraining] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingTraining, setEditingTraining] = useState(null);
    const [newTraining, setNewTraining] = useState({
        code: '',
        name: '',
        active: true,
    });
    const [trainingTypes, setTrainingTypes] = useState([]);
    // Thêm trạng thái cho phân trang
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // Fetch training types from API on component mount
    useEffect(() => {
        fetchTrainingTypes();
    }, []);

    // Function to fetch training types from API
    const fetchTrainingTypes = async () => {
        setLoading(true);
        try {
            const response = await fetchDanhSachHeDaoTao();
            setTrainingTypes(response);
            setPage(0); // Reset về trang đầu khi dữ liệu mới được tải
        } catch (error) {
            console.error('Error fetching training types:', error);
            toast.error('Không thể tải danh sách hệ đào tạo. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTraining = async () => {
        // Validate code length
        if (newTraining.code.length > 5) {
            toast.error('Mã hệ đào tạo không được vượt quá 5 ký tự!');
            return;
        }

        // Validate required fields
        if (!newTraining.code || !newTraining.name) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        setLoading(true);
        try {
            if (editingTraining) {
                // Update existing training
                await updateTraining(editingTraining.ma_he_dao_tao, newTraining);
                toast.success('Cập nhật hệ đào tạo thành công!');
            } else {
                // Add new training
                await createTraining(newTraining);
                toast.success('Thêm hệ đào tạo thành công!');
            }

            // Refresh the list
            fetchTrainingTypes();

            // Close dialog and reset form
            setOpenAddTraining(false);
            setEditingTraining(null);
            setNewTraining({ code: '', name: '', active: true });
        } catch (error) {
            console.error('Error adding/updating training:', error);
            toast.error('Đã xảy ra lỗi! Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditTraining = (training) => {
        setEditingTraining(training);
        setNewTraining({
            code: training.ma_he_dao_tao,
            name: training.ten_he_dao_tao,
            active: training.trang_thai
        });
        setOpenAddTraining(true);
    };

    const handleToggleTrainingStatus = async (id) => {
        setLoading(true);
        try {
            // Giả sử bạn có hàm toggleTrainingStatus được định nghĩa
            await toggleTrainingStatus(id);
            fetchTrainingTypes(); // Refresh the list after toggling
            toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
            console.error('Error toggling training status:', error);
            toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Xử lý thay đổi số hàng mỗi trang
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset về trang đầu khi thay đổi số hàng mỗi trang
    };

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const paginatedTrainingTypes = trainingTypes.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <PageHeader
                    title="Hệ đào tạo"
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddTraining(true)}
                    sx={{ mb: 3 }}
                    disabled={loading}
                >
                    Thêm hệ đào tạo
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold' }}>Mã hệ đào tạo</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Tên hệ đào tạo</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTrainingTypes.length > 0 ? (
                                    paginatedTrainingTypes.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell>{type.ma_he_dao_tao}</TableCell>
                                            <TableCell>{type.ten_he_dao_tao}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => handleEditTraining(type)}
                                                    disabled={loading}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            Không có dữ liệu hệ đào tạo
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* Thêm TablePagination */}
                    <TablePagination
                        rowsPerPageOptions={[15, 25, 50]}
                        component="div"
                        count={trainingTypes.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Số hàng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} của ${count}`}
                    />
                </>
            )}

            {/* Add/Edit Training Type Dialog */}
            <Dialog
                open={openAddTraining}
                onClose={() => {
                    setOpenAddTraining(false);
                    setEditingTraining(null);
                    setNewTraining({ code: '', name: '', active: true });
                }}
            >
                <DialogTitle>
                    {editingTraining ? 'Sửa hệ đào tạo' : 'Thêm hệ đào tạo'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '500px' }}>
                    <FormLabel component="legend">Mã hệ đào tạo</FormLabel>
                    <TextField
                        label="Mã hệ đào tạo"
                        fullWidth
                        margin=""
                        value={newTraining.code}
                        onChange={(e) => setNewTraining({ ...newTraining, code: e.target.value })}
                        inputProps={{ maxLength: 5 }}
                        helperText="Tối đa 5 ký tự"
                        required
                        error={!newTraining.code}
                        disabled={loading}
                    />
                    <FormLabel component="legend">Tên hệ đào tạo</FormLabel>
                    <TextField
                        label="Tên hệ đào tạo"
                        fullWidth
                        margin=""
                        value={newTraining.name}
                        onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
                        required
                        error={!newTraining.name}
                        disabled={loading}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={newTraining.active}
                                onChange={(e) => setNewTraining({ ...newTraining, active: e.target.checked })}
                                disabled={loading}
                            />
                        }
                        label="Hoạt động"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpenAddTraining(false);
                            setEditingTraining(null);
                            setNewTraining({ code: '', name: '', active: true });
                        }}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleAddTraining}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : (editingTraining ? 'Cập nhật' : 'Thêm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default QuanLyDaoTao;