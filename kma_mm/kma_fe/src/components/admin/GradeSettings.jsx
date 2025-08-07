import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Paper
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

// This will need to be created/updated in your API services
import { getGradeSettings, updateGradeSettings } from '../../Api_controller/gradeSettingsApi';

const GradeSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    diemThiToiThieu: 2.0,         // Điểm thi cuối kỳ tối thiểu
    diemTrungBinhDat: 4.0,        // Điểm trung bình để qua môn
    diemGiuaKyToiThieu: 4.0,      // Điểm giữa kỳ tối thiểu
    diemChuyenCanToiThieu: 4.0,   // Điểm chuyên cần tối thiểu
    chinhSachHienTai: 'moi',      // 'moi' hoặc 'cu'
    chinhSachTuyChinh: false      // Có sử dụng chính sách tùy chỉnh hay không
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await getGradeSettings();
      console.log('Fetched settings:', response);
      
      if (response && response.data && response.data.data) {
        // Đúng cấu trúc phản hồi từ API: { success: true, data: {...} }
        const settingsData = response.data.data;
        setSettings(settingsData);
      } else if (response && response.data) {
        // Cấu trúc phản hồi trực tiếp: data: {...}
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching grade settings:', error);
      toast.error('Không thể tải cài đặt điểm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Sending data to server:', settings); // Log dữ liệu gửi đi
      const response = await updateGradeSettings(settings);
      console.log('Server response:', response); // Log phản hồi từ server
      toast.success('Đã lưu thiết lập điểm thành công!');
    } catch (error) {
      console.error('Error saving grade settings:', error);
      // Hiển thị thông tin lỗi chi tiết hơn
      if (error.response) {
        // Server trả về lỗi với status code
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        toast.error(`Lỗi ${error.response.status}: ${error.response.data.message || 'Có lỗi xảy ra khi lưu thiết lập điểm'}`);
      } else if (error.request) {
        // Yêu cầu đã được gửi nhưng không nhận được phản hồi
        console.error('Request sent but no response received');
        toast.error('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng hoặc trạng thái máy chủ.');
      } else {
        // Lỗi trong quá trình thiết lập yêu cầu
        toast.error(`Lỗi: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePolicyChange = (event) => {
    const policy = event.target.value;
    if (policy === 'new') {
      setSettings({
        ...settings,
        chinhSachHienTai: 'moi',
        diemThiToiThieu: 2.0,
        diemTrungBinhDat: 4.0,
        chinhSachTuychinh: false
      });
    } else if (policy === 'old') {
      setSettings({
        ...settings,
        chinhSachHienTai: 'cu',
        diemThiToiThieu: 4.0,
        diemTrungBinhDat: 4.0,
        diemGiuaKyToiThieu: 4.0,  // Đảm bảo giá trị quy định cũ được đặt
        diemChuyenCanToiThieu: 4.0, // Đảm bảo giá trị quy định cũ được đặt
        chinhSachTuychinh: false
      });
    } else if (policy === 'custom') {
      setSettings({
        ...settings,
        chinhSachHienTai: 'tuy_chinh',
        chinhSachTuychinh: true
      });
    }
  };

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setSettings({
        ...settings,
        [field]: numValue
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Thiết lập quy định điểm
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Điều chỉnh các quy định về điểm số áp dụng cho toàn bộ hệ thống.
          Những thay đổi này sẽ ảnh hưởng đến cách tính điểm và xác định học viên qua môn.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quy định chung về điểm qua môn
              </Typography>
              <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
                <InputLabel>Chọn quy định</InputLabel>
                <Select
                  value={settings.chinhSachTuychinh ? 'custom' : settings.chinhSachHienTai === 'moi' ? 'new' : 'old'}
                  onChange={handlePolicyChange}
                  label="Chọn quy định"
                >
                  <MenuItem value="new">Quy định mới (CK ≥ 2.0 và TB ≥ 4.0)</MenuItem>
                  <MenuItem value="old">Quy định cũ (CK ≥ 4.0 và TB ≥ 4.0)</MenuItem>
                  <MenuItem value="custom">Quy định tùy chỉnh</MenuItem>
                </Select>
              </FormControl>

              {settings.chinhSachTuychinh && (
                <>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Bạn đang sử dụng quy định tùy chỉnh. Vui lòng nhập các giá trị điểm tối thiểu bên dưới.
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Điểm thi cuối kỳ tối thiểu"
                        type="number"
                        value={settings.diemThiToiThieu}
                        onChange={(e) => handleInputChange('diemThiToiThieu', e.target.value)}
                        InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                        helperText="Điểm thi cuối kỳ (CK) tối thiểu để đạt"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Điểm trung bình tối thiểu"
                        type="number"
                        value={settings.diemTrungBinhDat}
                        onChange={(e) => handleInputChange('diemTrungBinhDat', e.target.value)}
                        InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                        helperText="Điểm trung bình tối thiểu để qua môn"
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Quy định về điểm thành phần
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Điểm giữa kỳ (TP1) tối thiểu"
                    type="number"
                    value={settings.diemGiuaKyToiThieu}
                    onChange={(e) => handleInputChange('diemGiuaKyToiThieu', e.target.value)}
                    InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                    helperText="Điểm giữa kỳ tối thiểu để đủ điều kiện thi cuối kỳ"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Điểm chuyên cần (TP2) tối thiểu"
                    type="number"
                    value={settings.diemChuyenCanToiThieu}
                    onChange={(e) => handleInputChange('diemChuyenCanToiThieu', e.target.value)}
                    InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                    helperText="Điểm chuyên cần tối thiểu để đủ điều kiện thi cuối kỳ"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tóm tắt thiết lập hiện tại
              </Typography>
              <Box sx={{ mt: 2, backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Quy định đang áp dụng:</strong> {
                    settings.chinhSachTuychinh ? 'Quy định tùy chỉnh' :
                    (settings.chinhSachHienTai === 'moi' ? 'Quy định mới' : 'Quy định cũ')
                  }
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Điều kiện qua môn:</strong>
                </Typography>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Điểm thi cuối kỳ (CK): ≥ {(settings.diemThiToiThieu || 0).toFixed(1)}
                </Typography>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Điểm trung bình: ≥ {(settings.diemTrungBinhDat || 0).toFixed(1)}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Điều kiện đủ điều kiện thi cuối kỳ:</strong>
                </Typography>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Điểm giữa kỳ (TP1): ≥ {(settings.diemGiuaKyToiThieu || 0).toFixed(1)}
                </Typography>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Điểm chuyên cần (TP2): ≥ {(settings.diemChuyenCanToiThieu || 0).toFixed(1)}
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mt: 3 }}>
                Lưu ý: Thay đổi quy định điểm sẽ ảnh hưởng đến tất cả các học phần trong hệ thống.
                Nên áp dụng vào đầu kỳ học để tránh xung đột.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Lưu thiết lập'}
        </Button>
      </Box>
    </Box>
  );
};

export default GradeSettings;
