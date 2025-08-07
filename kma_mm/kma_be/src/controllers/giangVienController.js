const express = require("express");
const giangVienService = require("../services/giangVienService");
const { phong_ban } = require("../models");

const {logActivity} = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const {users} = require("../models");
const {getDiffData} = require("../utils/getDiffData");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
        1: "daoTao",
        2: "khaoThi",
        3: "quanLiSinhVien",
        5: "giamDoc",
        6: "sinhVien",
        7: "admin"

      }
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
    const token = req.headers.authorization?.split(" ")[1];
    // console.log(token);
    let user = verifyAccessToken(token);
    let userN  = await  getFieldById("users", user.id, "username");
    let  userR = await  getFieldById("users", user.id, "role");

      if (response) {      
      var strRes = "";
      if (laGiangVienMoi===1 || thuocKhoa === null ) {
          strRes = `Giảng viên mời có mã giảng viên là ${maGiangVien} với tên tài khoản là ${username}`;
      }
      else if (maPhongBan !== "" || maPhongBan){
        
        const  khoa =   await phong_ban.findAll({ where: { ma_phong_ban: maPhongBan }});

        if (laGiangVienMoi===0 && thuocKhoa===false) {
          strRes = `Nhân viên có mã giảng viên là ${maGiangVien} với tên tài khoản là ${username} thuộc phòng ban ${khoa[0].ten_phong_ban}`;
      }
      else if (laGiangVienMoi ===1  && thuocKhoa === false) {
          strRes = `Giảng viên mời có mã giảng viên là ${maGiangVien} với tên tài khoản là ${username} ở thuộc phòng ban ${khoa[0].ten_phong_ban}`;
      }
      else if (laGiangVienMoi===0 && thuocKhoa ===true) {
          strRes = `Giảng viên cơ hữu có mã giảng viên là ${maGiangVien} với tên tài khoản là ${username}  thuộc khoa ${khoa[0].ten_phong_ban}`
      }
      else if (laGiangVienMoi===1 && thuocKhoa ===true) {
          strRes = `Giảng viên mời có mã giảng viên là ${maGiangVien} với tên tài khoản là ${username}  thuộc khoa ${khoa[0].ten_phong_ban}`
      }
      }
      let inforActivity = {
        username:   userN,
        role: mapRole[userR],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN} đã thêm ${strRes}`,
        response_status: 200,
        resData: "Thêm giảng viên thành công",
        ip:  req._remoteAddress,

      }
        await logActivity(inforActivity);
      }

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
