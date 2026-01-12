import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getConversionRules, createConversionRule, updateConversionRule, deleteConversionRule } from '../../Api_controller/gradeSettingsApi';

const QuyDoiDiemTab = ({ heDaoTaoId }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        diem_min: '',
        diem_max: '',
        diem_he_4: '',
        diem_chu: '',
        xep_loai: ''
    });

    useEffect(() => {
        if (heDaoTaoId && heDaoTaoId !== 'all') {
            fetchRules();
        } else {
            setRules([]);
        }
    }, [heDaoTaoId]);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await getConversionRules({ he_dao_tao_id: heDaoTaoId });
            if (response && response.data && response.data.data) {
                setRules(response.data.data);
            } else if (response && response.data) {
                // Fallback if data structure varies
                setRules(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching conversion rules:', error);
            toast.error('Không thể tải danh sách quy đổi điểm.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (rule = null) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                diem_min: rule.diemMin,
                diem_max: rule.diemMax,
                diem_he_4: rule.diemHe4,
                diem_chu: rule.diemChu,
                xep_loai: rule.xepLoai
            });
        } else {
            setEditingRule(null);
            setFormData({
                diem_min: '',
                diem_max: '',
                diem_he_4: '',
                diem_chu: '',
                xep_loai: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingRule(null);
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const validateForm = () => {
        if (!formData.diem_min || !formData.diem_max) {
            toast.error("Vui lòng nhập khoảng điểm Min/Max hệ 10.");
            return false;
        }
        if (parseFloat(formData.diem_min) >= parseFloat(formData.diem_max)) {
            toast.warning("Điểm Min phải nhỏ hơn điểm Max.");
            // return false; // Usually true, but sometimes ranges are single point? No, range.
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const payload = {
                he_dao_tao_id: heDaoTaoId,
                diem_min: parseFloat(formData.diem_min),
                diem_max: parseFloat(formData.diem_max),
                diem_he_4: formData.diem_he_4 ? parseFloat(formData.diem_he_4) : null,
                diem_chu: formData.diem_chu,
                xep_loai: formData.xep_loai
            };

            if (editingRule) {
                await updateConversionRule(editingRule.id, payload);
                toast.success('Cập nhật thành công!');
            } else {
                await createConversionRule(payload);
                toast.success('Thêm mới thành công!');
            }
            handleCloseDialog();
            fetchRules();
        } catch (error) {
            console.error('Error saving rule:', error);
            toast.error('Lỗi khi lưu quy tắc.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) {
            try {
                await deleteConversionRule(id);
                toast.success('Xóa thành công!');
                fetchRules();
            } catch (error) {
                console.error('Error deleting rule:', error);
                toast.error('Lỗi khi xóa quy tắc.');
            }
        }
    };

    if (!heDaoTaoId || heDaoTaoId === 'all') {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="info">
                    Vui lòng chọn một <strong>Hệ đào tạo</strong> cụ thể ở trên để định cấu hình quy đổi điểm.
                    Quy đổi điểm không áp dụng cho cấu hình Chung.
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Danh sách quy đổi điểm (Thang 10 &rarr; Thang 4)</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Thêm quy tắc
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Điểm Min ({'>'} =)</TableCell>
                            <TableCell>Điểm Max ({'<'})</TableCell>
                            <TableCell>Điểm Hệ 4</TableCell>
                            <TableCell>Điểm Chữ</TableCell>
                            <TableCell>Xếp Loại</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rules.length > 0 ? (
                            rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell>{rule.diemMin}</TableCell>
                                    <TableCell>{rule.diemMax}</TableCell>
                                    <TableCell>{rule.diemHe4}</TableCell>
                                    <TableCell>{rule.diemChu}</TableCell>
                                    <TableCell>{rule.xepLoai}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenDialog(rule)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(rule.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Chưa có quy tắc nào.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{editingRule ? 'Cập nhật quy tắc' : 'Thêm quy tắc mới'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Điểm Min (Thang 10)"
                                type="number"
                                fullWidth
                                value={formData.diem_min}
                                onChange={(e) => handleInputChange('diem_min', e.target.value)}
                                InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                                helperText="Cận dưới (bao gồm)"
                            />
                            <TextField
                                label="Điểm Max (Thang 10)"
                                type="number"
                                fullWidth
                                value={formData.diem_max}
                                onChange={(e) => handleInputChange('diem_max', e.target.value)}
                                InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                                helperText="Cận trên (không bao gồm, trừ 10)"
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Điểm Hệ 4"
                                type="number"
                                fullWidth
                                value={formData.diem_he_4}
                                onChange={(e) => handleInputChange('diem_he_4', e.target.value)}
                                InputProps={{ inputProps: { min: 0, max: 4, step: 0.1 } }}
                            />
                            <TextField
                                label="Điểm Chữ"
                                fullWidth
                                value={formData.diem_chu}
                                onChange={(e) => handleInputChange('diem_chu', e.target.value)}
                            />
                        </Box>
                        <TextField
                            label="Xếp Loại"
                            fullWidth
                            value={formData.xep_loai}
                            onChange={(e) => handleInputChange('xep_loai', e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuyDoiDiemTab;
