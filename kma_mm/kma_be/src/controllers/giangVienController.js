const express = require("express");
const giangVienService = require("../services/giangVienService");

const createGiangVien = async (req, res) => {
  try {
    console.log(req.body);
    const { maGiangVien, username, hoTen, thuocKhoa, laGiangVienMoi, maPhongBan } = req.body;

    // Kiểm tra các trường bắt buộc
    const missingFields = [];

    if (!maGiangVien) missingFields.push('maGiangVien');
    if (!username) missingFields.push('username');
    if (!hoTen) missingFields.push('hoTen');

    // Nếu không phải giảng viên mới thì phải có thuocKhoa và maPhongBan
    if (laGiangVienMoi === 0) {
      if (thuocKhoa === undefined || thuocKhoa === null) missingFields.push('thuocKhoa');
      if (!maPhongBan || maPhongBan.trim() === '') missingFields.push('maPhongBan');
    }

    // Nếu thiếu trường nào, trả về thông báo lỗi
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        status: "ERR",
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    console.log('Processing createGiangVien...');
    const response = await giangVienService.createGiangVien(req.body);
    return res.status(201).json(response);
  } catch (e) {
    console.error("Error creating giang vien:", e);
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
};


const getGiangVien = async (req, res) => {
  try {
    const response = await giangVienService.getGiangVien();
    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}

const updateGiangVien = async (req, res) => {
  try {
    const response = await giangVienService.updateGiangVien(req.params.ma_giang_vien, req.body);
    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}
module.exports = {
  createGiangVien,
  getGiangVien,
  updateGiangVien
};
