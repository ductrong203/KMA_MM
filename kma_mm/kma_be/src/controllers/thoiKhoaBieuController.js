const ThoiKhoaBieuService = require('../services/thoiKhoaBieuService');
const { thoi_khoa_bieu, lop, mon_hoc } = require('../models');


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

class ThoiKhoaBieuController {
  static async getAll(req, res) {
    try {
      const data = await ThoiKhoaBieuService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
      
    }
  }

  static async getById(req, res) {
    try {
      const data = await ThoiKhoaBieuService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Không tìm thấy thời khóa biểu.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByPage(req, res) {
    try {
      const data = await ThoiKhoaBieuService.getByPage(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async filter(req, res) {
    try {
      const data = await ThoiKhoaBieuService.filter(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async filterbyid(req, res) {
    try {
      const data = await ThoiKhoaBieuService.filterbyid(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await ThoiKhoaBieuService.create(req.body);
      try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
            let monHoc = await  getFieldById("mon_hoc", req.body.mon_hoc_id, "ten_mon_hoc");
            let  lop = await  getFieldById("lop", req.body.lop_id, "ma_lop");
              if (data) {
              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `Người dùng ${userN}  đã tạo thời khóa biểu kì ${req.body.ky_hoc} môn ${monHoc} cho lớp ${lop} `,
                response_status: 200,
                resData: "Tạo thời khóa biểu thành công",
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }

      res.status(201).json(
        {message: "Tạo thời khoá biểu thành công ", 
        data});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createAll(req, res) {
    try {
      const data = await ThoiKhoaBieuService.createAll(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const oldDataRaw = await thoi_khoa_bieu.findByPk(req.params.id);
      const oldData = {
        "Kỳ học": oldDataRaw.ky_hoc,
        "Lớp": await getFieldById("lop", oldDataRaw.lop_id, "ma_lop"),
"Môn học": await getFieldById("mon_hoc", oldDataRaw.mon_hoc_id, "ten_mon_hoc"),
        "Giảng Viên": oldDataRaw.giang_vien,
        "Phòng học": oldDataRaw.phong_hoc,
        "Tiết học": oldDataRaw.tiet_hoc,
        "Trạng thái": oldDataRaw.trang_thai == 1 ? "Hoạt động" : "Tạm dừng"
      }
      const data = await ThoiKhoaBieuService.update(req.params.id, req.body);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN  = await  getFieldById("users", user.id, "username");
        let  userR = await  getFieldById("users", user.id, "role");
        if (data) {
                      const newDataRaw = await thoi_khoa_bieu.findByPk(req.params.id);
                      const newData = {
        "Kỳ học": newDataRaw.ky_hoc,
"Lớp": await getFieldById("lop", newDataRaw.lop_id, "ma_lop"),
"Môn học": await getFieldById("mon_hoc", newDataRaw.mon_hoc_id, "ten_mon_hoc"),
"Giảng Viên": newDataRaw.giang_vien,
"Phòng học": newDataRaw.phong_hoc,
"Tiết học": newDataRaw.tiet_hoc,
"Trạng thái": newDataRaw.trang_thai == 1 ? "Hoạt động" : "Tạm dừng"
      }
                    let inforActivity = {
                      username:   userN,
                      role: mapRole[userR],
                      action: req.method,
                      endpoint: req.originalUrl,
                      reqData: `${getDiffData(oldData, newData)}`,
                      response_status: 200,
                      resData: `Người dùng ${userN}  đã cập nhật thời khóa biểu của kì ${oldData["Kỳ học"]} môn ${oldData["Môn học"]} của lớp ${oldData["Lớp"]} `,
                      ip:  req._remoteAddress,
              
                    }
                      await logActivity(inforActivity);
                    }
           } catch (error) {
              console.error("Lỗi kìa ní:", error.message);
           }
      
      res.json(
        {message: "Cập nhật thời khoá biểu thành công  " ,
        data});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      let kyHoc = await  getFieldById("thoi_khoa_bieu", req.params.id, "ky_hoc");
            let monHocId  = await  getFieldById("thoi_khoa_bieu", req.params.id, "mon_hoc_id");
            let lopId  = await  getFieldById("thoi_khoa_bieu", req.params.id, "lop_id");
            let monHoc = await  getFieldById("mon_hoc", monHocId, "ten_mon_hoc");
            let lop = await  getFieldById("lop", lopId, "ma_lop");
      const result = await ThoiKhoaBieuService.delete(req.params.id);
      try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
            
              if (result) {

              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `Người dùng ${userN}  đã xóa thời khóa biểu kì ${kyHoc} môn ${monHoc} của lớp ${lop}`,
                response_status: 200,
                resData: "Xóa thời khóa biểu thành công",
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ThoiKhoaBieuController;
