import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import {
  createDoiTuongQuanLy,
  updateDoiTuongQuanLy,
} from "../../Api_controller/Service/dtqlService";

const ObjectModal = ({ item, open, onClose, onUpdated, isCreating }) => {
  const [formData, setFormData] = useState({
    ma_doi_tuong: "",
    ten_doi_tuong: "",
    chi_tiet_doi_tuong: "",
    ghi_chu: "",
  });

  useEffect(() => {
    if (item && !isCreating) {
      setFormData({
        ma_doi_tuong: item.ma_doi_tuong,
        ten_doi_tuong: item.ten_doi_tuong,
        chi_tiet_doi_tuong: item.chi_tiet_doi_tuong,
        ghi_chu: item.ghi_chu,
      });
    } else {
      setFormData({
        ma_doi_tuong: "",
        ten_doi_tuong: "",
        chi_tiet_doi_tuong: "",
        ghi_chu: "",
      });
    }
  }, [item, isCreating]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isCreating) {
        const response = await createDoiTuongQuanLy(formData);
        if (response) {
          onUpdated(response.data);
        }
      } else {
        const response = await updateDoiTuongQuanLy(item.id, formData);
        if (response && response.success) {
          onUpdated({ ...item, ...formData });
        }
      }

      onClose();
      setFormData({
        ma_doi_tuong: "",
        ten_doi_tuong: "",
        chi_tiet_doi_tuong: "",
        ghi_chu: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isCreating ? "Tạo mới đối tượng" : "Chỉnh sửa đối tượng"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Mã đối tượng"
          name="ma_doi_tuong"
          value={formData.ma_doi_tuong || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tên đối tượng"
          name="ten_doi_tuong"
          value={formData.ten_doi_tuong || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Chi tiết đối tượng"
          name="chi_tiet_doi_tuong"
          value={formData.chi_tiet_doi_tuong || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Ghi chú"
          name="ghi_chu"
          value={formData.ghi_chu || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObjectModal;
