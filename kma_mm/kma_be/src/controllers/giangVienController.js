const express = require("express");
const giangVienService = require("../services/giangVienService");
const { phong_ban } = require("../models");
const { giang_vien } = require("../models");


const { logActivity } = require("../services/activityLogService");
const { getFieldById, getChucVuDiaDiem } = require("../utils/detailData");
const { users } = require("../models");
const { getDiffData } = require("../utils/getDiffData");
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
    const [chucVu, diaDiem] = await getChucVuDiaDiem(laGiangVienMoi, thuocKhoa, maPhongBan);
    // console.log(token);
    let user = verifyAccessToken(token);
    let userN = await getFieldById("users", user.id, "username");
    let userR = await getFieldById("users", user.id, "role");

    if (response) {

      let inforActivity = {
        username: userN,
        role: mapRole[userR],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN} đã thêm ${chucVu} có mã giảng viên là ${maGiangVien} với tên tài khoản là ${username} ; ${diaDiem}`,
        response_status: 200,
        resData: "Thêm giảng viên thành công",
        ip: req._remoteAddress,

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
    const oldData = await giang_vien.findOne({ where: { ma_giang_vien: req.params.ma_giang_vien } });
    const maPhongBanOld = await getFieldById("phong_ban", oldData.phong_ban_id, "ma_phong_ban");
    const [oldChucVu, oldDiaDiem] = await getChucVuDiaDiem(oldData.la_giang_vien_moi, oldData.thuoc_khoa, maPhongBanOld);
    console.log("$######old", oldChucVu, oldDiaDiem)
    const response = await giangVienService.updateGiangVien(req.params.ma_giang_vien, req.body);

    try {
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      if (response) {
        const newData = await giang_vien.findOne({ where: { ma_giang_vien: req.body.maGiangVien } });
        const [newChucVu, newDiaDiem] = await getChucVuDiaDiem(newData.la_giang_vien_moi, newData.thuoc_khoa, req.body.maPhongBan);
        console.log("$######new", newChucVu, newDiaDiem  )
        let oldD = {
          ma_giang_vien: oldData.ma_giang_vien,
          ho_ten: oldData.ho_ten,
          dia_chi: oldData.dia_chi,
          so_dien_thoai: oldData.so_dien_thoai,
          username: oldData.username,
          password: oldData.password,
          hoc_ham: oldData.hoc_ham,
          hoc_vi: oldData.hoc_vi,
          chuyen_mon: oldData.chuyen_mon,
          trang_thai: oldData.trang_thai,
          gioi_tinh: oldData.gioi_tinh,
          ngay_sinh: oldData.ngay_sinh,
          email: oldData.email,
          cccd: oldData.cccd,
          ngay_cap: oldData.ngay_cap,
          noi_cap: oldData.noi_cap,
          noi_o_hien_nay: oldData.noi_o_hien_nay
        };

        let newD = {
          ma_giang_vien: newData.ma_giang_vien,
          ho_ten: newData.ho_ten,
          dia_chi: newData.dia_chi,
          so_dien_thoai: newData.so_dien_thoai,
          username: newData.username,
          hoc_ham: newData.hoc_ham,
          hoc_vi: newData.hoc_vi,
          chuyen_mon: newData.chuyen_mon,
          trang_thai: newData.trang_thai,
          gioi_tinh: newData.gioi_tinh,
          ngay_sinh: newData.ngay_sinh,
          email: newData.email,
          cccd: newData.cccd,
          ngay_cap: newData.ngay_cap,
          noi_cap: newData.noi_cap,
          noi_o_hien_nay: newData.noi_o_hien_nay
        }

        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `${getDiffData(oldD, newD)} ; ${getDiffData({"Chức vụ" : oldChucVu, "Vị trí": oldDiaDiem}, {"Chức vụ": newChucVu, "Vị trí": newDiaDiem})}`,
          response_status: 200,
          resData: `Người dùng ${userN} đã cập nhật giảng viên có mã ${req.params.ma_giang_vien} thành công`,
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }
    } catch (error) {
      console.error("log không được ní ơiii:", error.message);

    }
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
