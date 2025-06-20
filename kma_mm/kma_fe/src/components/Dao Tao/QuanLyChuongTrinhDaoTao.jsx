import React, { useState, useMemo } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeader from '../../layout/PageHeader';
import ThemChuongTrinhDaoTao from './ThemChuongTrinhDaoTao';
import DanhSachChuongTrinhDaoTao from './DanhSachChuongTrinhDaoTao';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import vi from 'date-fns/locale/vi';

const QuanLyChuongTrinhDaoTao = () => {
  const [tabValue, setTabValue] = useState(0);
  const [chuongTrinhList, setChuongTrinhList] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const refreshChuongTrinhList = (newChuongTrinh) => {
    setChuongTrinhList((prev) => {
      const existing = prev.find((ct) => ct.so_quyet_dinh === newChuongTrinh.so_quyet_dinh);
      if (existing) {
        return prev.map((ct) =>
          ct.so_quyet_dinh === newChuongTrinh.so_quyet_dinh
            ? { ...ct, mon_hoc_ids: [...new Set([...ct.mon_hoc_ids, ...newChuongTrinh.mon_hoc_ids])] }
            : ct
        );
      }
      return [...prev, newChuongTrinh];
    });
  };

  // Memoize chuongTrinhList để tránh tạo mảng mới
  const memoizedChuongTrinhList = useMemo(() => chuongTrinhList, [chuongTrinhList]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box sx={{ p: 3 }}>
        <PageHeader title="Quản lý chương trình đào tạo" />
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Thêm chương trình đào tạo" />
            <Tab label="Danh sách chương trình đào tạo" />
          </Tabs>
        </Box>

        {tabValue === 0 && <ThemChuongTrinhDaoTao onChuongTrinhAdded={refreshChuongTrinhList} />}
        {tabValue === 1 && <DanhSachChuongTrinhDaoTao chuongTrinhList={memoizedChuongTrinhList} />}

        <ToastContainer
          position="bottom-right"
          autoClose={6000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Box>
    </LocalizationProvider>
  );
};

export default QuanLyChuongTrinhDaoTao;