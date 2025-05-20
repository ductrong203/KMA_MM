import { Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

const ThongKeTotNghiep = () => {
  return (
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Thống kê tốt nghiệp
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Khóa</InputLabel>
          <Select value="" label="Khóa">
            <MenuItem value="2020">2020</MenuItem>
            <MenuItem value="2021">2021</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<BarChartIcon />}>
          Xem biểu đồ
        </Button>
      </Paper>
    </Grid>
  );
};

export default ThongKeTotNghiep;