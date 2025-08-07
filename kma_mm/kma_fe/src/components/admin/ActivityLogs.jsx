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
import CloseIcon from '@mui/icons-material/Close';// Icon quay lại
import { useNavigate } from 'react-router-dom';
import { getLogActivity } from "../../Api_controller/Service/adminService";

Modal.setAppElement('#root');

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
        setIsModalOpen(false); // Đóng modal sau khi chọn
        
    };
    // Hàm mở modal
    const openModal = () => {
        setIsModalOpen(true);
    };


    // Hàm đóng modal
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
  }
  const renderJsonData = (data, indent=0) => {
    if (typeof data !== "object" || data === null) {
      return (
          <Typography variant = "body2" sx= {{ml: indent}}>
              {String(data)}
          </Typography>
      )
    }

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
    </Box>          )

  }
    const navigate = useNavigate(); // Hook điều hướng
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
        POST: "Tạo mới ",
        PUT: "Chỉnh sửa",
        DELETE: "Xoá",
    }
    const handleBackToDashboard = () => {
        navigate('/admin/dashboard'); // Điều hướng đến trang AdminDashboard
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
        // console.log(!selectedRole);

        const filtered = logs.filter((log) => {
            const matchesRole = selectedRole
                ? log?.Role === selectedRole
                : true;
            const start = new Date(dateRange[0]);
            const end = new Date(dateRange[1]);

 
            start.setHours(0, 0, 0, 0);

            end.setHours(23, 59, 59, 999);
            const createdAt = new Date(log?.created_at); 

            const matchesDate = (dateRange[0] && dateRange[1])  ? (createdAt >= start && createdAt <= end): true ;
       

            return  matchesDate && matchesRole;

        });
        console.log(filtered);
        setFilteredLogs(filtered);
    }, [dateRange[0], dateRange[1], selectedRole, logs]); // Khi users, searchTerm hoặc selectedRole thay đổi

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

    // const vietnamTime = convertUTCToVietnamTime(utcTime);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    const indexOfLastLog = currentPage * rowsPerPage;
    const indexOfFirstLog = indexOfLastLog - rowsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    // console.log(logs);   

    // Hàm hủy lọc
    const handleResetFilter = () => {
        setSelectedRole(""); // Đặt lại role về mặc định
        setDateRange([null, null]); // Đặt lại khoảng ngày
        setFilteredLogs(logs)
        // setLogs([]); // Xóa dữ liệu logs
        // fetchLogs();
        console.log('Đã hủy lọc');
    };
    return (
        <Box sx={{ padding: 2 }}>
            {/* Icon Button back to Dashboard */}
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton
                    color="primary"
                    onClick={handleBackToDashboard}
                    sx={{ mr: 2 }} // Khoảng cách giữa icon và tiêu đề
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5">Lịch sử hoạt động</Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center" marginBottom={2}>
                {/* Bộ lọc Role */}
                <TextField
                    select
                    label="Xét theo quyền"
                    variant="outlined"
                    fullWidth
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    sx={{ flex: 1 }} // Chiếm 1 phần tỉ lệ
                >
                    <MenuItem value="">Tất cả các quyền</MenuItem>
                    {Object.entries(roleMapping).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Bộ lọc ngày */}
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

                {/* Modal chứa react-calendar */}
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
            {/* Danh sách hoạt động */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow className="bg-blue-100 text-white">
                            <TableCell>STT</TableCell>
                            <TableCell>Tên tài khoản</TableCell>
                            <TableCell>Quyền</TableCell>
                            <TableCell>Hành động </TableCell>
                            <TableCell>Mô tả </TableCell>
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
                                        sx={{ minHeight: '48px' }} // Ensure consistent row height
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
{/* Detail Modal */}
            <Dialog
                open={isDetailModalOpen}
                onClose={closeDetailModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '400px' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Chi tiết hoạt động</Typography>
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
                                        <strong>Action chi tiết:</strong> {selectedLog.action.split("/").join(" ")}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>Thời gian:</strong> {convertUTCToVietnamTime(selectedLog.created_at)}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Mô tả chi tiết:
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

                            {/* Additional fields if available */}
                            {selectedLog.request_data && (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Dữ liệu yêu cầu:
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
