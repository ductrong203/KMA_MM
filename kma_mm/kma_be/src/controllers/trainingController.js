const express = require("express");
const trainingService = require("../services/trainingService");
const { danh_muc_dao_tao } = require("../models");
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
const createTraining = async (req, res) => {
  try {
    const { code, name } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    }
    if (code.length > 5) {
      return res.status(400).json({
        status: "ERR",
        message: "code must less than 5 letters",
      });
    }
    // Giả sử UserService.register trả về dữ liệu người dùng mới đã được tạo
    const response = await trainingService.createTraining(req.body);
    
    const token = req.headers.authorization?.split(" ")[1];
    // console.log(token);
    let decoded = verifyAccessToken(token);
    // console.log(decoded)
    let userN  = await  getFieldById("users", decoded.id, "username");
    let  userR = await  getFieldById("users", decoded.id, "role");
      if (response) {
      let inforActivity = {
        username:   userN,
        role: mapRole[userR],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN}  đã tạo thành công hệ đào tạo  ${response.data.ten_he_dao_tao} `,
        response_status: 200,
        resData: "Tạo hệ đào tạo thành công",
        ip:  req._remoteAddress,

      }
        await logActivity(inforActivity);
      }

    return res.status(201).json(response); // Trả về status 201 cho yêu cầu thành công khi tạo người dùng
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}

const fetchDanhSachHeDaoTao = async (req, res) => {
  try {
    const response = await trainingService.fetchDanhSachHeDaoTao();
    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}

const updateTraining = async (req, res) => {
  try {
    const oldData =  await danh_muc_dao_tao.findOne({ where: { ma_he_dao_tao:req.params.code } });
    const response = await trainingService.updateTraining(req.params.code, req.body);
    const newData =  await danh_muc_dao_tao.findOne({ where: { ma_he_dao_tao:req.params.code } });
    const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN  = await  getFieldById("users", user.id, "username");
        let  userR = await  getFieldById("users", user.id, "role");
        console.log(userR);
          if (response) {
          let inforActivity = {
            username:   userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `${getDiffData(oldData.dataValues, newData.dataValues)}`,
            response_status: 200,
            resData: `Người dùng ${userN} đã cập nhật hệ đào tạo ${req.params.code} thành công`,
            ip:  req._remoteAddress,
    
          }
            await logActivity(inforActivity);
          }

    return res.status(201).json(
      {message: "Cập nhật hệ đào tạo thành công ",
      data: response});
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}

module.exports = {
  createTraining,
  fetchDanhSachHeDaoTao,
  updateTraining
};
