const { Model } = require("sequelize");
const DanhMucKhenKyLuatService = require("../services/danhMucKhenKyLuatService");
const { danh_muc_khen_ky_luat } = require("../models");

const { logActivity } = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
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

class DanhMucKhenKyLuatController {
  static async create(req, res) {
    try {
      const DanhMucKhenKyLuat = await DanhMucKhenKyLuatService.createDanhMucKhenKyLuat(req.body);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        if (DanhMucKhenKyLuat) {
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `Người dùng ${userN}  đã thêm thành công danh mục ${DanhMucKhenKyLuat.loai === "khen_thuong" ? "khen thưởng" : "kỷ luật"} ${DanhMucKhenKyLuat.ten_danh_muc} `,
            response_status: 200,
            resData: "Thêm danh mục thành công",
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      res.status(201).json(
        {
          message: "Tạo danh mục khen kỷ luật thành công ",
          data: DanhMucKhenKyLuat
        });

    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const danhSachDanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.getAllDanhMucKhenKyLuat();
      res.json(danhSachDanhMucKhenKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const DanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.getDanhMucKhenKyLuatById(req.params.id);
      if (!DanhMucKhenKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(DanhMucKhenKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const oldDataRaw = await danh_muc_khen_ky_luat.findByPk(req.params.id);
      const oldData = {
        "mã danh mục": oldDataRaw.ma_danh_muc,
        "tên danh mục": oldDataRaw.ten_danh_muc,
        "loại": oldDataRaw.loai==="khen_thuong"? "khen thưởng" : "kỷ luật",
        "mô tả": oldDataRaw.mo_ta,
        "trạng thái": oldDataRaw.trang_thai === 1 ? "mở" : "đóng",
      }
      const DanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.updateDanhMucKhenKyLuat(
          req.params.id,
          req.body
        );
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        if (DanhMucKhenKyLuat) {
          const newDataRaw = await danh_muc_khen_ky_luat.findByPk(req.params.id);
          const newData = {
        "mã danh mục": newDataRaw.ma_danh_muc,
        "tên danh mục": newDataRaw.ten_danh_muc,
        "loại": newDataRaw.loai==="khen_thuong"? "khen thưởng" : "kỷ luật",
        "mô tả": newDataRaw.mo_ta,
        "trạng thái": newDataRaw.trang_thai === 1 ? "mở" : "đóng",
      }
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: getDiffData(oldData, newData),
            response_status: 200,
            resData: `Người dùng ${userN}  đã chỉnh sửa danh mục ${req.body.loai==="khen_thuong"? "khen thưởng" : "kỷ luật"} ${req.body.ten_danh_muc}`,
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      if (!DanhMucKhenKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(DanhMucKhenKyLuat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      let tenDanhMuc = await getFieldById("danh_muc_khen_ky_luat", req.params.id, "ten_danh_muc");
      const DanhMucKhenKyLuat = await DanhMucKhenKyLuatService.deleteDanhMucKhenKyLuat(req.params.id);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        let loai = await getFieldById("danh_muc_khen_ky_luat", req.params.id, "loai");
        if (DanhMucKhenKyLuat) {
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `Người dùng ${userN} đã xóa thành công danh mục ${loai === "khen_thuong" ? "khen thưởng" : "kỷ luật"} ${tenDanhMuc} `,
            response_status: 200,
            resData: "Xóa danh mục thành công !",
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      if (!DanhMucKhenKyLuat)
        return res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json({ message: "Da xoa danh muc khen thuong ky luat" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = DanhMucKhenKyLuatController;
