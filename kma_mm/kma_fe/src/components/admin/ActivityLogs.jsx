import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    Typography,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Pagination,
    TextField,
    MenuItem,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Badge,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { getLogActivity } from "../../Api_controller/Service/adminService";

// Component hiển thị bảng động cho is_list = 1
const DynamicTableView = ({ data }) => {
    // console.log("###########################################", data)
    
    if (data.is_list == 1) {
        return (
            <Typography variant="body2" color="text.secondary">
                Không có dữ liệu để hiển thị
            </Typography>
        );
    }

    const { course, semester, class: className, total_students, changed_students } = data;

    // Lấy tất cả các loại thay đổi (các cột)
    const getAllChangeTypes = () => {
        const changeTypes = new Set();
        changed_students.forEach(student => {
            Object.keys(student.changes).forEach(changeType => {
                changeTypes.add(changeType);
            });
        });
        return Array.from(changeTypes).sort();
    };

    const changeTypes = getAllChangeTypes();

    // Mapping tên cột tiếng Việt (có thể tùy chỉnh)
    const columnMapping = {
        'diem_tp1': 'TP1',
        'diem_tp2': 'TP2',
        'diem_tp3': 'TP3',
        'diem_gk': 'Giữa kỳ',
        'diem_ck2': 'Điểm thi lại',
        'diem_chu': 'Điểm chữ',
        'diem_ck': 'Cuối kỳ',
        'diem_tb': 'Trung bình',
        'diem_hp': 'Điểm học phần',
        'trang_thai': 'Trạng thái',
        'diem_he_4': 'Điểm hệ 4'
    };

    // Hàm format tên cột: nếu có trong mapping thì dùng, không thì capitalize
    const formatColumnName = (key) => {
        if (columnMapping[key]) return columnMapping[key];
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Bảng thay đổi dữ liệu
            </Typography>
            
            {/* Thông tin tổng quan */}
            {(course || semester || className || total_students) && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
                        {course && (
                            <Typography variant="body2">
                                <strong>Môn học:</strong> {course}
                            </Typography>
                        )}
                        {semester && (
                            <Typography variant="body2">
                                <strong>Học kỳ:</strong> {semester}
                            </Typography>
                        )}
                        {className && (
                            <Typography variant="body2">
                                <strong>Lớp:</strong> {className}
                            </Typography>
                        )}
                        {total_students && (
                            <Typography variant="body2">
                                <strong>Số lượng thay đổi:</strong> {total_students}
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}

            {/* Bảng dữ liệu */}
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                                Mã sinh viên
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                                Tên sinh viên
                            </TableCell>
                            {changeTypes.map(changeType => (
                                <TableCell 
                                    key={changeType} 
                                    sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}
                                >
                                    {formatColumnName(changeType)}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {changed_students.map((student, index) => (
                            <TableRow 
                                key={student.ma_sinh_vien || index}
                                sx={{ 
                                    '&:nth-of-type(odd)': { backgroundColor: 'grey.50' },
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }}
                            >
                                <TableCell sx={{ fontWeight: 'medium' }}>
                                    {student.ma_sinh_vien || '-'}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'medium' }}>
                                    {student.ho_dem && student.ten 
                                        ? `${student.ho_dem} ${student.ten}`
                                        : student.name || '-'
                                    }
                                </TableCell>
                                {changeTypes.map(changeType => {
                                    const change = student.changes[changeType];
                                    return (
                                        <TableCell key={changeType} sx={{ textAlign: 'center' }}>
                                            {change ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    <Typography 
                                                        component="span" 
                                                        sx={{ 
                                                            color: 'error.main',
                                                            textDecoration: 'line-through',
                                                            fontWeight: 'medium'
                                                        }}
                                                    >
                                                        {change.old !== null && change.old !== undefined ? change.old : '-'}
                                                    </Typography>
                                                    <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                        ||
                                                    </Typography>
                                                    <Typography 
                                                        component="span" 
                                                        sx={{ 
                                                            color: 'success.main',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {change.new !== null && change.new !== undefined ? change.new : '-'}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography sx={{ color: 'text.disabled' }}>
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Chú thích */}
          
        </Box>
    );
};

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [oldLogsCount, setOldLogsCount] = useState(0);

    const rowsPerPage = 8;

    // Hàm tính số lượng log cũ hơn 30 ngày
    const countOldLogs = (logsData) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const count = logsData.filter(log => {
            const logDate = new Date(log.created_at);
            return logDate < thirtyDaysAgo;
        }).length;

        setOldLogsCount(count);
    };

    const openDetailModal = (log) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedLog(null);
    };

    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    };

    const handleDeleteLogs = async () => {
        try {
            //Gọi APIII
            // await deleteLogsOlderThan30Days();
            
            // Sau khi xóa thành công, fetch lại dữ liệu
            const response = await getLogActivity();
            if (response.status === 200) {
                setLogs(response.data.data);
                setFilteredLogs(response.data.data);
                countOldLogs(response.data.data);
            }
            
            closeDeleteDialog();
            console.log('Đã xóa dữ liệu log cũ hơn 30 ngày');
        } catch (error) {
            console.error("Error deleting logs:", error);
        }
    };

    // Hàm render dữ liệu dựa trên is_list
    const renderJsonData = (data, isList, indent = 0) => {
        // Parse nếu là string
    // console.log("##############################",isList)
        if (typeof data === 'string') {
            try {
                const parsedData = JSON.parse(data);
                return renderJsonData(parsedData, isList, indent);
            } catch (e) {
                return (
                    <Typography variant="body2" sx={{ ml: indent }}>
                        {data}
                    </Typography>
                );
            }
        }

        // Kiểm tra null hoặc không phải object
        if (typeof data !== "object" || data === null) {
            return (
                <Typography variant="body2" sx={{ ml: indent }}>
                    {String(data)}
                </Typography>
            );
        }

        // Kiểm tra is_list = 1 để hiển thị bảng
        if (isList===1) {
            return <DynamicTableView data={data} />;
        }

        // Hiển thị dạng box thông thường cho is_list = 0 hoặc không có is_list
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                {Object.entries(data).map(([key, value]) => {
                    // Bỏ qua trường is_list khi hiển thị
                    if (key === 'is_list') return null;
                    
                    return (
                        <Box
                            key={key}
                            sx={{
                                minWidth: '200px',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#f5f5f5',
                                p: 1.5,
                                borderRadius: 1,
                                boxShadow: 1,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 'bold', marginRight: 1, whiteSpace: 'nowrap' }}
                            >
                                {key}:
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    const navigate = useNavigate();
    const roleMapping = {
        daoTao: "Đào tạo",
        khaoThi: "Khảo thí",
        quanLiSinhVien: "Quản lý sinh viên",
        unknown: "Ẩn danh",
        giamDoc: "Giám đốc",
        sinhVien: "Sinh viên",
        admin: "Admin",
    };

    const actionMap = {
        POST: "Tạo mới",
        PUT: "Chỉnh sửa",
        DELETE: "Xoá",
    };

    const handleBackToDashboard = () => {
        navigate('/admin/dashboard');
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await getLogActivity();
                if (response.status === 200) {
                    setLogs(response.data.data);
                    setFilteredLogs(response.data.data);
                    countOldLogs(response.data.data);
                } else {
                    console.error("Failed to fetch logs:", response.message);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    useEffect(() => {
        const filtered = logs.filter((log) => {
            const matchesRole = selectedRole
                ? log?.Role === selectedRole
                : true;

            if (!startDate) {
                return matchesRole;
            }

            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const createdAt = new Date(log?.created_at);

            if (!endDate) {
                const dayEnd = new Date(startDate);
                dayEnd.setHours(23, 59, 59, 999);
                return matchesRole && createdAt >= start && createdAt <= dayEnd;
            }

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            const matchesDate = createdAt >= start && createdAt <= end;

            return matchesDate && matchesRole;
        });
        
        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [startDate, endDate, selectedRole, logs]);

    const convertUTCToVietnamTime = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        return utcDate.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    const indexOfLastLog = currentPage * rowsPerPage;
    const indexOfFirstLog = indexOfLastLog - rowsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleResetFilter = () => {
        setSelectedRole("");
        setStartDate('');
        setEndDate('');
        setFilteredLogs(logs);
        console.log('Đã hủy lọc');
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                    <IconButton
                        color="primary"
                        onClick={handleBackToDashboard}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">Lịch sử hoạt động</Typography>
                </Box>
                
                <Badge 
                    badgeContent={oldLogsCount} 
                    color="error"
                    max={999}
                    sx={{
                        '& .MuiBadge-badge': {
                            right: -3,
                            top: 3,
                            border: '2px solid white',
                            padding: '0 4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                        }
                    }}
                >
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={openDeleteDialog}
                        disabled={oldLogsCount === 0}
                        sx={{
                            opacity: oldLogsCount === 0 ? 0.6 : 1,
                            cursor: oldLogsCount === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Xóa dữ liệu cũ
                    </Button>
                </Badge>
            </Box>

            <Box display="flex" gap={2} alignItems="center" marginBottom={2} flexWrap="wrap">
                <TextField
                    select
                    label="Xét theo quyền"
                    variant="outlined"
                    fullWidth
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    sx={{ flex: 1, minWidth: '200px' }}
                >
                    <MenuItem value="">Tất cả các quyền</MenuItem>
                    {Object.entries(roleMapping).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Ngày bắt đầu"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    sx={{ minWidth: '200px' }}
                />

                <TextField
                    label="Ngày kết thúc"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min: startDate
                    }}
                    disabled={!startDate}
                    sx={{ minWidth: '200px' }}
                />

                <Button
                    variant="contained"
                    color="error"
                    onClick={handleResetFilter}
                    sx={{ minWidth: '120px' }}
                >
                    Hủy Lọc
                </Button>
            </Box>

            {startDate && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {endDate 
                            ? `Đang lọc từ: ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}`
                            : `Đang lọc theo ngày: ${new Date(startDate).toLocaleDateString('vi-VN')}`
                        }
                    </Typography>
                </Box>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow className="bg-blue-100 text-white">
                            <TableCell>STT</TableCell>
                            <TableCell>Tên tài khoản</TableCell>
                            <TableCell>Quyền</TableCell>
                            <TableCell>Hành động</TableCell>
                            <TableCell>Mô tả ngắn gọn</TableCell>
                            <TableCell>Thời gian</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentLogs.length > 0 ? (
                            currentLogs.map((log, index) => (
                                <TableRow key={log.ID}>
                                    <TableCell>{indexOfFirstLog + index + 1}</TableCell>
                                    <TableCell>{log.Username}</TableCell>
                                    <TableCell>{roleMapping[log.Role]}</TableCell>
                                    <TableCell>{actionMap[(log.action).split(":")[0].trim()]}</TableCell>
                                    <TableCell>
                                        <Box 
                                            display="flex" 
                                            alignItems="center" 
                                            gap={1}
                                            sx={{ minHeight: '48px' }}
                                        >
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    maxWidth: '200px', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    lineHeight: 1.2,
                                                    flex: 1
                                                }}
                                            >
                                                {log.resonse_data}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => openDetailModal(log)}
                                                title="Xem chi tiết"
                                                sx={{
                                                    padding: '4px',
                                                    alignSelf: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Box> 
                                    </TableCell>
                                    <TableCell>{convertUTCToVietnamTime(log.created_at)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Không tìm thấy dữ liệu phù hợp
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog xem chi tiết */}
            <Dialog
                open={isDetailModalOpen}
                onClose={closeDetailModal}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '400px' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Mô tả chi tiết</Typography>
                    <IconButton
                        onClick={closeDetailModal}
                        sx={{ color: 'grey.500' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedLog && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Thông tin cơ bản:
                                </Typography>
                                <Box sx={{ pl: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>ID:</strong> {selectedLog.ID}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>Tên tài khoản:</strong> {selectedLog.Username}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>Quyền:</strong> {roleMapping[selectedLog.Role]}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>Hành động:</strong> {actionMap[(selectedLog.action).split(":")[0].trim()]}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>Thời gian:</strong> {convertUTCToVietnamTime(selectedLog.created_at)}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Mô tả hành động
                                </Typography>
                                <Paper 
                                    sx={{ 
                                        p: 2, 
                                        backgroundColor: 'grey.50', 
                                        maxHeight: '200px', 
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                >
                                    <Typography variant="body2">
                                        {selectedLog.resonse_data || 'Không có mô tả chi tiết'}
                                    </Typography>
                                </Paper>
                            </Box>

                            {selectedLog.request_data && (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Chi tiết thực hiện:
                                    </Typography>
                                    <Paper 
                                        sx={{ 
                                            p: 2, 
                                            backgroundColor: 'grey.50', 
                                            maxHeight: '400px', 
                                            overflow: 'auto',
                                            whiteSpace: 'pre-wrap'
                                        }}
                                    >
                                        {renderJsonData(selectedLog.request_data, selectedLog.is_list)}
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDetailModal} variant="contained" color="primary">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={closeDeleteDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <DeleteIcon />
                    Xác nhận xóa dữ liệu
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Cảnh báo: Hành động này không thể hoàn tác!
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Có <strong style={{ color: '#d32f2f' }}>{oldLogsCount}</strong> bản ghi log cũ hơn 30 ngày sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Bạn có chắc chắn muốn tiếp tục?
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={closeDeleteDialog} 
                        variant="outlined"
                        color="inherit"
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleDeleteLogs} 
                        variant="contained" 
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Xác nhận xóa
                    </Button>
                </DialogActions>
            </Dialog>

            <Pagination
                count={Math.ceil(filteredLogs.length / rowsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            />
        </Box>
    );
};

export default ActivityLogs;