const express = require("express");
const { phong_ban } = require("../models");
const phongBanService = require("../services/phongBanService");

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

const createPhongBan = async (req, res) => {
try {
    const { code, name } = req.body;

    if (!code || !name ) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    }
    
    const response = await phongBanService.createPhongBan(req.body);
    const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN  = await  getFieldById("users", user.id, "username");
        let  userR = await  getFieldById("users", user.id, "role");
        let temp = response.data.thuoc_khoa === true ? "thuộc khoa" : "thuộc phòng ban" || "";
          if (response) {
          let inforActivity = {
            username:   userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `Người dùng ${userN}  đã tạo thành công phòng ban  ${response.data.ten_phong_ban} ${temp}`,
            response_status: 200,
            resData: "Tạo phòng ban thành công",
            ip:  req._remoteAddress,
    
          }
            await logActivity(inforActivity);
          }

    return res.status(201).json(response); 
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}
const getPhongBan = async (req, res) => {
  try {
      const response = await phongBanService.getPhongBan();
      return res.status(201).json(response); 
    } catch (e) {
      return res.status(500).json({
        message: e.message || "Server error",
      });
    }
  }

  const updatePhongBan = async (req, res) => {
    try {
      const oldData =    await phong_ban.findAll({ where: { ma_phong_ban:req.params.code }});
      const response = await phongBanService.updatePhongBan(req.params.code, req.body);
      const newData =    await phong_ban.findAll({ where: { ma_phong_ban:req.body.code }});
    console.log( newData.dataValues, "$$$###", oldData.dataValues)
        const token = req.headers.authorization?.split(" ")[1];
    // console.log(token);
    let user = verifyAccessToken(token);
    let userN  = await  getFieldById("users", user.id, "username");
    let  userR = await  getFieldById("users", user.id, "role");
      if (response) {
      let inforActivity = {
        username:   userN,
        role: mapRole[userR],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: getDiffData(oldData[0].dataValues, newData[0].dataValues),
        response_status: 200,
        resData: `Người dùng ${userN} đã cập nhật phòng ban có mã ${req.params.code} thành công`,
        ip:  req._remoteAddress,

      }
        await logActivity(inforActivity);
      }
        return res.status(201).json(
      {message: "Cập nhật phòng ban thành công ",
      data: response}); 
      } catch (e) {
        return res.status(500).json({
          message: e.message || "Server error",
        });
      }
    }
module.exports = {
    createPhongBan,
    getPhongBan,
    updatePhongBan
  };
  
