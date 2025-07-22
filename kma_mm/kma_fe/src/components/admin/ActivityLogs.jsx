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
} from "@mui/material";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from 'react-modal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon quay lại
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

    const rowsPerPage = 8;

    const handleDateChange = async (value) => {
        setDateRange(value); 
        console.log(dateRange);
        setIsModalOpen(false); // Đóng modal sau khi chọn
        // if (value[0] && value[1]) {
        //     try {
        //         const startDate = value[0].toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
        //         const endDate = value[1].toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
        //         // const role = selectedRole;
        //         // Gọi API getLogActivity
        //         // const response = await getLogActivity();
        //         // setLogs(response.data); // Lưu dữ liệu logs từ API
        //         // console.log('Logs:', response.data);
        //     } catch (error) {
        //         console.error('Lỗi khi lấy logs:', error);
        //     }
        // }
    };
    // Hàm mở modal
    const openModal = () => {
        setIsModalOpen(true);
    };


    // Hàm đóng modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

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
            const matchesDate = dateRange[0] &&  dateRange[1] 
                ? ( (convertUTCToVietnamTime(log?.created_at)?.split(" ")[1] >= convertUTCToVietnamTime(dateRange[0]?.toISOString())?.split(" ")[1]) &&
                    (convertUTCToVietnamTime(log?.created_at)?.split(" ")[1]  <= convertUTCToVietnamTime(dateRange[1]?.toISOString())?.split(" ")[1]))
                : false;
                // console.log();
            if (matchesDate && matchesRole){ 
                return  matchesDate && matchesRole;
            }
            else{
                console.log("date", matchesDate);
                console.log("role", matchesRole );
                if (matchesDate) { 
                    return matchesDate
                }
               else if (matchesRole){
                    return matchesRole;
               }
            }
        });
        console.log(filtered);
        setFilteredLogs(filtered);
    }, [dateRange, selectedRole, logs]); // Khi users, searchTerm hoặc selectedRole thay đổi

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
                <Typography variant="h5">Activity Logs</Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center" marginBottom={2}>
                {/* Bộ lọc Role */}
                <TextField
                    select
                    label="xét theo quyền"
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
                            <TableCell>Username</TableCell>
                            <TableCell>Quyền</TableCell>
                            <TableCell>Thực hiện</TableCell>
                            <TableCell>endpoint</TableCell>
                            <TableCell>Dữ liệu yêu cầu</TableCell>
                            <TableCell>Trạng thái trả về</TableCell>
                            {/* <TableCell>ip_address</TableCell> */}
                            <TableCell>Vào hồi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentLogs.map((log, index) => (
                            <TableRow key={log.ID}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{log.Username}</TableCell>
                                <TableCell>{roleMapping[log.Role]}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{log.endpoint}</TableCell>
                                <TableCell>{JSON.stringify(log.request_data)}</TableCell>
                                <TableCell>{log.response_status}</TableCell>
                                <TableCell>{convertUTCToVietnamTime(log.created_at)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
