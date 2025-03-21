import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createTraining, fetchDanhSachHeDaoTao, updateTraining } from "../../Api_controller/Service/trainingService";
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

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };
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
        } catch (error) {
            console.error('Error fetching training types:', error);
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách hệ đào tạo. Vui lòng thử lại!',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddTraining = async () => {
        // Validate code length
        if (newTraining.code.length > 5) {
            setSnackbar({
                open: true,
                message: 'Ký hiệu hệ đào tạo không được vượt quá 5 ký tự!',
                severity: 'error'
            });
            return;
        }

        // Validate required fields
        if (!newTraining.code || !newTraining.name) {
            setSnackbar({
                open: true,
                message: 'Vui lòng điền đầy đủ thông tin!',
                severity: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            if (editingTraining) {
                // Update existing training
                console.log(newTraining)
                console.log(editingTraining)
                await updateTraining(editingTraining.ma_he_dao_tao, newTraining);
                setSnackbar({
                    open: true,
                    message: 'Cập nhật hệ đào tạo thành công!',
                    severity: 'success'
                });
            } else {
                // Add new training
                await createTraining(newTraining);
                setSnackbar({
                    open: true,
                    message: 'Thêm hệ đào tạo thành công!',
                    severity: 'success'
                });
            }

            // Refresh the list
            fetchTrainingTypes();

            // Close dialog and reset form
            setOpenAddTraining(false);
            setEditingTraining(null);
            setNewTraining({ code: '', name: '', active: true });
        } catch (error) {
            console.error('Error adding/updating training:', error);
            setSnackbar({
                open: true,
                message: 'Đã xảy ra lỗi! Vui lòng thử lại.',
                severity: 'error'
            });
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
            await toggleTrainingStatus(id);
            fetchTrainingTypes(); // Refresh the list after toggling
            setSnackbar({
                open: true,
                message: 'Cập nhật trạng thái thành công!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error toggling training status:', error);
            setSnackbar({
                open: true,
                message: 'Không thể cập nhật trạng thái. Vui lòng thử lại!',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddTraining(true)}
                sx={{ mb: 3 }}
                disabled={loading}
            >
                Thêm hệ đào tạo
            </Button>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ký hiệu</TableCell>
                                <TableCell>Tên hệ đào tạo</TableCell>
                                <TableCell >Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trainingTypes.length > 0 ? (
                                trainingTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell>{type.ma_he_dao_tao}</TableCell>
                                        <TableCell>{type.ten_he_dao_tao}</TableCell>

                                        <TableCell >
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
                                    <TableCell colSpan={4} align="center">
                                        Không có dữ liệu hệ đào tạo
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

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
                <DialogContent>
                    <TextField
                        label="Ký hiệu"
                        fullWidth
                        margin="normal"
                        value={newTraining.code}
                        onChange={(e) => setNewTraining({ ...newTraining, code: e.target.value })}
                        inputProps={{ maxLength: 5 }}
                        helperText="Tối đa 5 ký tự"
                        required
                        error={!newTraining.code}
                        disabled={loading}
                    />
                    <TextField
                        label="Tên hệ đào tạo"
                        fullWidth
                        margin="normal"
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
    )
}

export default QuanLyDaoTao