
/* eslint-disable react/prop-types */
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GradeIcon from '@mui/icons-material/Grade';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { useState } from 'react';

// Mock data
const mockGrades = [
  { subject: 'Toán cao cấp', grade: 8.5, credits: 3 },
  { subject: 'Lập trình cơ bản', grade: 9.0, credits: 4 },
  { subject: 'Tiếng Anh', grade: 8.0, credits: 3 },
  { subject: 'Vật lý đại cương', grade: 8.8, credits: 4 },
];

const mockSchedule = [
  { day: 'Thứ 2', subject: 'Toán cao cấp', time: '7:30 - 9:30', room: 'A101' },
  { day: 'Thứ 3', subject: 'Lập trình cơ bản', time: '9:45 - 11:45', room: 'B202' },
  { day: 'Thứ 4', subject: 'Tiếng Anh', time: '13:30 - 15:30', room: 'C303' },
];

const mockAwards = [
  { type: 'Khen thưởng', description: 'Sinh viên xuất sắc học kỳ 1', date: '15/01/2024' },
  { type: 'Học bổng', description: 'Học bổng khuyến khích học tập', date: '20/01/2024' },
];

const studentInfo = {
  name: 'Nguyễn Văn A',
  studentId: 'SV001',
  class: 'K65-CNTT',
  gpa: 8.5,
};

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ p: 3 }}>{children}</Box>;
}

function StudentDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [openLeaveRequest, setOpenLeaveRequest] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleLeaveRequest = () => {
    setShowSuccessAlert(true);
    setOpenLeaveRequest(false);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('role')
    localStorage.removeItem('access_token')
    console.log('Logging out...');
    window.location.href = '/login'
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>


      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {showSuccessAlert && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            Đơn xin nghỉ phép đã được gửi thành công!
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: '#1976d2' }}>
                    <Typography variant="h4">{studentInfo.name[0]}</Typography>
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {studentInfo.name}
                  </Typography>
                  <Divider flexItem />
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Mã sinh viên: {studentInfo.studentId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lớp: {studentInfo.class}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      GPA: {studentInfo.gpa}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setOpenLeaveRequest(true)}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Xin nghỉ phép
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                sx={{
                  bgcolor: 'background.paper',
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 64,
                  }
                }}
              >
                <Tab icon={<GradeIcon />} label="Điểm số" iconPosition="start" />
                <Tab icon={<CalendarMonthIcon />} label="Thời khóa biểu" iconPosition="start" />
                <Tab icon={<EmojiEventsIcon />} label="Thông tin khác" iconPosition="start" />
              </Tabs>

              <TabPanel value={currentTab} index={0}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Môn học</TableCell>
                        <TableCell align="center">Số tín chỉ</TableCell>
                        <TableCell align="right">Điểm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockGrades.map((row) => (
                        <TableRow key={row.subject}>
                          <TableCell>{row.subject}</TableCell>
                          <TableCell align="center">{row.credits}</TableCell>
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 'bold',
                                color: row.grade >= 8 ? '#2e7d32' : 'inherit'
                              }}
                            >
                              {row.grade}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Thứ</TableCell>
                        <TableCell>Môn học</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Phòng</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockSchedule.map((row) => (
                        <TableRow key={row.day + row.subject}>
                          <TableCell>{row.day}</TableCell>
                          <TableCell>{row.subject}</TableCell>
                          <TableCell>{row.time}</TableCell>
                          <TableCell>{row.room}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Loại</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Ngày</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockAwards.map((row) => (
                        <TableRow key={row.description}>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell>{row.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>

        <Dialog
          open={openLeaveRequest}
          onClose={() => setOpenLeaveRequest(false)}
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Đơn xin nghỉ phép</DialogTitle>
          <DialogContent>
            <TextField
              label="Từ ngày"
              type="date"
              fullWidth
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              value={leaveRequest.fromDate}
              onChange={(e) =>
                setLeaveRequest({ ...leaveRequest, fromDate: e.target.value })
              }
            />
            <TextField
              label="Đến ngày"
              type="date"
              fullWidth
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              value={leaveRequest.toDate}
              onChange={(e) =>
                setLeaveRequest({ ...leaveRequest, toDate: e.target.value })
              }
            />
            <TextField
              label="Lý do"
              multiline
              rows={4}
              fullWidth
              sx={{ mt: 2 }}
              value={leaveRequest.reason}
              onChange={(e) =>
                setLeaveRequest({ ...leaveRequest, reason: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenLeaveRequest(false)}
              sx={{
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleLeaveRequest}
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Gửi đơn
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default StudentDashboard;

