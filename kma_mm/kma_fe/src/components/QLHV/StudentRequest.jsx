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
  Typography,
  Select,
  MenuItem,
} from "@mui/material";

const StudentRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      student: "Nguyễn Văn A",
      type: "Xin nghỉ phép",
      status: "Chờ duyệt",
    },
    {
      id: 2,
      student: "Trần Thị B",
      type: "Xin nghỉ phép",
      status: "Chờ duyệt",
    },
    { id: 3, student: "Lê Văn C", type: "Đơn khác", status: "Chờ duyệt" },
  ]);

  const [filter, setFilter] = useState("Tất cả");

  // Cập nhật trạng thái đơn
  const handleUpdateStatus = (id, newStatus) => {
    const updatedRequests = requests.map((req) =>
      req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
  };

  // Lọc đơn theo trạng thái
  const filteredRequests =
    filter === "Tất cả"
      ? requests
      : requests.filter((req) => req.status === filter);

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom>
        Quản lý đơn từ học viên
      </Typography>

      {/* Bộ lọc đơn từ */}
      <Select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 20 }}
      >
        <MenuItem value="Tất cả">Tất cả</MenuItem>
        <MenuItem value="Chờ duyệt">Chờ duyệt</MenuItem>
        <MenuItem value="Đã duyệt">Đã duyệt</MenuItem>
        <MenuItem value="Bị từ chối">Bị từ chối</MenuItem>
      </Select>

      {/* Bảng danh sách đơn */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Học viên</TableCell>
              <TableCell>Loại đơn</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.student}</TableCell>
                <TableCell>{request.type}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  {request.status === "Chờ duyệt" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() =>
                          handleUpdateStatus(request.id, "Đã duyệt")
                        }
                        style={{ marginRight: 10 }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() =>
                          handleUpdateStatus(request.id, "Bị từ chối")
                        }
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default StudentRequests;
