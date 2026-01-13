import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

// This will need to be created/updated in your API services
import { getGradeSettings, updateGradeSettings } from '../../Api_controller/gradeSettingsApi';
import { fetchDanhSachHeDaoTao } from '../../Api_controller/Service/trainingService'; // Import API lấy hệ đào tạo
import QuyDoiDiemTab from './QuyDoiDiemTab';

const GradeSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    diemThiToiThieu: 2.0,         // Điểm thi cuối kỳ tối thiểu
    diemTrungBinhDat: 4.0,        // Điểm trung bình để qua môn
    diemGiuaKyToiThieu: 4.0,      // Điểm giữa kỳ tối thiểu
    diemChuyenCanToiThieu: 4.0,   // Điểm chuyên cần tối thiểu
    chinhSachHienTai: 'moi',      // 'moi' hoặc 'cu'
    chinhSachTuyChinh: false,     // Có sử dụng chính sách tùy chỉnh hay không
    he_dao_tao_id: null           // ID hệ đào tạo đang chọn
  });
  const [trainingSystems, setTrainingSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState("all"); // 'all' hoặc id của hệ đào tạo

  useEffect(() => {
    fetchTrainingSystems();
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [selectedSystem]);

  const fetchTrainingSystems = async () => {
    try {
      const response = await fetchDanhSachHeDaoTao();
      if (Array.isArray(response)) {
        setTrainingSystems(response);
      } else if (response && response.data) {
        setTrainingSystems(response.data);
      }
    } catch (error) {
      console.error('Error fetching training systems:', error);
      toast.error('Không thể tải danh sách hệ đào tạo.');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const params = selectedSystem !== "all" ? { he_dao_tao_id: selectedSystem } : {};
      const response = await getGradeSettings(params);
      console.log('Fetched settings:', response);

      if (response && response.data && response.data.data) {
        // Đúng cấu trúc phản hồi từ API: { success: true, data: {...} }
        const settingsData = response.data.data;
        setSettings({
          ...settingsData,
          he_dao_tao_id: selectedSystem !== "all" ? selectedSystem : null
        });
        if (response.data.isInherited && selectedSystem !== "all") {
          toast.info("Hệ đào tạo này chưa có thiết lập riêng. Đang hiển thị thiết lập mặc định.");
        }
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
      const dataToSave = {
        ...settings,
        he_dao_tao_id: selectedSystem !== "all" ? selectedSystem : null
      };
      const response = await updateGradeSettings(dataToSave);
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

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setSettings({
        ...settings,
        [field]: numValue
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        </Typography>
      </Paper>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="training-system-select-label">Hệ đào tạo</InputLabel>
                <Select
                  labelId="training-system-select-label"
                  id="training-system-select"
                  value={selectedSystem}
                  label="Hệ đào tạo"
                  onChange={(e) => setSelectedSystem(e.target.value)}
                >
                  <MenuItem value="all">Chung (Mặc định cho tất cả)</MenuItem>
                  {trainingSystems.map((system) => (
                    <MenuItem key={system.id} value={system.id}>
                      {system.ten_he_dao_tao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                {selectedSystem === "all"
                  ? "Thiết lập này sẽ áp dụng cho tất cả các hệ đào tạo chưa có cấu hình riêng."
                  : "Chọn hệ đào tạo để cấu hình quy định điểm và bảng quy đổi điểm riêng."}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="grade settings tabs">
          <Tab label="Quy định chung" />
          <Tab label="Quy đổi điểm" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quy định chung về điểm qua môn
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
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
        </>
      )}

      {activeTab === 1 && (
        <QuyDoiDiemTab heDaoTaoId={selectedSystem} />
      )}
    </Box>
  );
};

export default GradeSettings;
