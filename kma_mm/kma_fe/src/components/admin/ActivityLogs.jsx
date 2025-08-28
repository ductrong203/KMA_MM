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
} from "@mui/material";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from 'react-modal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { getLogActivity } from "../../Api_controller/Service/adminService";

Modal.setAppElement('#root');

// Component GradeChangesTable
const GradeChangesTable = ({ data }) => {
    // Nếu không có data hoặc không phải là data thay đổi điểm
    if (!data || !data.changed_students) {
        return null;
    }

    const { course, semester, class: className, total_students, changed_students } = data;

    // Lấy tất cả các loại điểm có thể có từ tất cả sinh viên
    const getAllGradeTypes = () => {
        const gradeTypes = new Set();
        changed_students.forEach(student => {
            Object.keys(student.changes).forEach(gradeType => {
                gradeTypes.add(gradeType);
            });
        });
        return Array.from(gradeTypes).sort();
    };

    const gradeTypes = getAllGradeTypes();

    // Mapping tên điểm tiếng Việt
    const gradeTypeMapping = {
        'diem_tp1': 'TP1',
        'diem_tp2': 'TP2',
        'diem_tp3': 'TP3',
        'diem_gk': 'Giữa kỳ',
        'diem_ck': 'Cuối kỳ',
        'diem_tb': 'Trung bình'
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Thay đổi điểm số
            </Typography>
            
            {/* Thông tin khóa học */}
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
                    <Typography variant="body2">
                        <strong>Môn học:</strong> {course}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Học kỳ:</strong> {semester}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Lớp:</strong> {className}
                    </Typography>
                    <Typography variant="body2">
                        <strong>SV thay đổi:</strong> {total_students}
                    </Typography>
                </Box>
            </Box>

            {/* Bảng thay đổi điểm */}
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
                            {gradeTypes.map(gradeType => (
                                <TableCell 
                                    key={gradeType} 
                                    sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}
                                >
                                    {gradeTypeMapping[gradeType] || gradeType.toUpperCase()}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {changed_students.map((student, index) => (
                            <TableRow 
                                key={student.ma_sinh_vien}
                                sx={{ 
                                    '&:nth-of-type(odd)': { backgroundColor: 'grey.50' },
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }}
                            >
                                <TableCell sx={{ fontWeight: 'medium' }}>
                                    {student.ma_sinh_vien}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'medium' }}>
                                    {`${student.ho_dem} ${student.ten}`}
                                </TableCell>
                                {gradeTypes.map(gradeType => {
                                    const change = student.changes[gradeType];
                                    return (
                                        <TableCell key={gradeType} sx={{ textAlign: 'center' }}>
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
                                                        {change.old}
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
                                                        {change.new}
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
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'warning.light', borderRadius: 1, border: 1, borderColor: 'warning.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography component="span" sx={{ color: 'error.main', textDecoration: 'line-through', fontWeight: 'medium' }}>
                            9.5
                        </Typography>
                        <Typography variant="body2">: Điểm cũ</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            9.6
                        </Typography>
                        <Typography variant="body2">: Điểm mới</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const rowsPerPage = 8;

    const handleDateChange = async (value) => {
        setDateRange(value);
        console.log(dateRange);
        setIsModalOpen(false);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const openDetailModal = (log) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedLog(null);
    };

    // Hàm kiểm tra xem dữ liệu có phải là thay đổi điểm không
    const isGradeChangeData = (data) => {
        return data && 
               typeof data === 'object' && 
               data.changed_students && 
               Array.isArray(data.changed_students) &&
               data.course &&
               data.semester !== undefined &&
               data.class;
    };

    const renderJsonData = (data, indent = 0) => {
        if (typeof data !== "object" || data === null) {
            return (
                <Typography variant="body2" sx={{ ml: indent }}>
                    {String(data)}
                </Typography>
            );
        }

        // Kiểm tra nếu là dữ liệu thay đổi điểm số
        if (isGradeChangeData(data)) {
            return <GradeChangesTable data={data} />;
        }

        // Render JSON data thông thường
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                {Object.entries(data).map(([key, value]) => (
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
                ))}
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
                    console.log("check", logs);
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
            const start = new Date(dateRange[0]);
            const end = new Date(dateRange[1]);

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            const createdAt = new Date(log?.created_at);

            const matchesDate = (dateRange[0] && dateRange[1]) ? (createdAt >= start && createdAt <= end) : true;

            return matchesDate && matchesRole;
        });
        console.log(filtered);
        setFilteredLogs(filtered);
    }, [dateRange[0], dateRange[1], selectedRole, logs]);

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
        setDateRange([null, null]);
        setFilteredLogs(logs);
        console.log('Đã hủy lọc');
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton
                    color="primary"
                    onClick={handleBackToDashboard}
                    sx={{ mr: 2 }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5">Lịch sử hoạt động</Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center" marginBottom={2}>
                <TextField
                    select
                    label="Xét theo quyền"
                    variant="outlined"
                    fullWidth
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    sx={{ flex: 1 }}
                >
                    <MenuItem value="">Tất cả các quyền</MenuItem>
                    {Object.entries(roleMapping).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>

                <button
                    onClick={openModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Chọn Khoảng Ngày
                </button>
                <button
                    onClick={handleResetFilter}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Hủy Lọc
                </button>

                {dateRange[0] && dateRange[1] && (
                    <p className="mt-2">
                        Đã chọn: {dateRange[0].toLocaleDateString('vi-VN')} -{' '}
                        {dateRange[1].toLocaleDateString('vi-VN')}
                    </p>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    className="flex items-center justify-center"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    contentLabel="Chọn Khoảng Ngày"
                >
                    <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Chọn Khoảng Ngày</h3>
                        <Calendar
                            selectRange={true}
                            onChange={handleDateChange}
                            value={dateRange}
                            className="border rounded p-2"
                        />
                        <button
                            onClick={closeModal}
                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Đóng
                        </button>
                    </div>
                </Modal>
            </Box>

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
                        {currentLogs.map((log, index) => (
                            <TableRow key={log.ID}>
                                <TableCell>{index + 1}</TableCell>
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
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Box> 
                                </TableCell>
                                <TableCell>{convertUTCToVietnamTime(log.created_at)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
                                        {renderJsonData(selectedLog.request_data)}
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