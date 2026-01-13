const { Model } = require("sequelize");
const KhenThuongKyLuatService = require("../services/khenThuongKyLuatService");
const {khen_thuong_ky_luat} = require("../models");

const { logActivity } = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const { users } = require("../models");
const { getDiffData } = require("../utils/getDiffData");
const {formatDate } = require("../utils/formatDate");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
  1: "daoTao",
  2: "khaoThi",
  3: "quanLiSinhVien",
  5: "giamDoc",
  6: "sinhVien",
  7: "admin"

}


class KhenThuongKyLuatController {
  static async create(req, res) {
    try {
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.createKhenThuongKyLuat(req.body);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        let maSinhVien = await getFieldById("sinh_vien", req.body.sinh_vien_id, "ma_sinh_vien");
        let khen_phat = await getFieldById("danh_muc_khen_ky_luat", req.body.danh_muc_id, "loai");
        if (KhenThuongKyLuat) {
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `${khen_phat === "khen_thuong" ? "khen thưởng" : "kỷ luật"} với sinh viên có mã ${maSinhVien}`,
            response_status: 200,
            resData: `Người dùng ${userN} thêm khen thưởng/ kỷ luật thành công`,
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      res.status(201).json(
        {
          message: "Tạo khen thưởng kỷ luật thành công",
          data: KhenThuongKyLuat
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const danhSachKhenThuongKyLuat =
        await KhenThuongKyLuatService.getAllKhenThuongKyLuat();
      res.json(danhSachKhenThuongKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.getKhenThuongKyLuatById(req.params.id);
      if (!KhenThuongKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(KhenThuongKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const oldDataRaw = await khen_thuong_ky_luat.findByPk(req.params.id);
      const oldData = {
        "tên sinh viên": await getFieldById("sinh_vien", oldDataRaw.sinh_vien_id, "ho_dem") + await getFieldById("sinh_vien", oldDataRaw.sinh_vien_id, "ten"),
        "danh mục": await getFieldById("danh_muc_khen_ky_luat", oldDataRaw.danh_muc_id, "ten_danh_muc"),
        "ngày quyết định": oldDataRaw.ngay_quyet_dinh,
        "số quyết định": oldDataRaw.so_quyet_dinh,
        "người ký": oldDataRaw.nguoi_ky,
        "lý do": oldDataRaw.ly_do,
        "hình thức": oldDataRaw.hinh_thuc,
        "mức thưởng phạt": oldDataRaw.muc_thuong_phat,
        "ghi chú": oldDataRaw.ghi_chu,
        "ngày tạo": formatDate(oldDataRaw.ngay_tao),
      }
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.updateKhenThuongKyLuat(
          req.params.id,
          req.body
        );
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        let maSinhVien = await getFieldById("sinh_vien", req.body.sinh_vien_id, "ma_sinh_vien");
        let { loai, ten_danh_muc } = req.body.danh_muc;
        // console.log("######",loai);
        if (KhenThuongKyLuat) {
          const newDataRaw = await khen_thuong_ky_luat.findByPk(req.params.id);
          const newData = {
        "tên sinh viên": await getFieldById("sinh_vien", newDataRaw.sinh_vien_id, "ho_dem") + await getFieldById("sinh_vien", newDataRaw.sinh_vien_id, "ten"),
        "danh mục": await getFieldById("danh_muc_khen_ky_luat", newDataRaw.danh_muc_id, "ten_danh_muc"),
        "ngày quyết định": newDataRaw.ngay_quyet_dinh,
        "số quyết định": newDataRaw.so_quyet_dinh,
        "người ký": newDataRaw.nguoi_ky,
        "lý do": newDataRaw.ly_do,
        "hình thức": newDataRaw.hinh_thuc,
        "mức thưởng phạt": newDataRaw.muc_thuong_phat,
        "ghi chú": newDataRaw.ghi_chu,
        "ngày tạo": formatDate(newDataRaw.ngay_tao),
      }
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: getDiffData(oldData, newData),
            response_status: 200,
            resData: `Người dùng ${userN} đã cập nhật ${loai == "khen_thuong" ? "khen thưởng" : "kỷ luật"} ${ten_danh_muc} cho sinh viên có mã ${maSinhVien}`,
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }

      if (!KhenThuongKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(
        {
          message: "Cập nhật khen thuỏng kỷ luật thành công ",
          data: KhenThuongKyLuat
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const sinhVienId = await getFieldById("khen_thuong_ky_luat", req.params.id, "sinh_vien_id");
      const danhMucId = await getFieldById("khen_thuong_ky_luat", req.params.id, "danh_muc_id");
      const maSinhVien = await getFieldById("sinh_vien", sinhVienId, "ma_sinh_vien");
      const khen_phat = await getFieldById("danh_muc_khen_ky_luat", danhMucId, "loai");
      const danhMuc = await getFieldById("danh_muc_khen_ky_luat", danhMucId, "ten_danh_muc");
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.deleteKhenThuongKyLuat(req.params.id);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        // let maSinhVien = await getFieldById("sinh_vien", req.)
        if (KhenThuongKyLuat) {
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `Xóa ${khen_phat === "khen_thuong" ? "khen thưởng" : "kỷ luật"} ${danhMuc} với sinh viên có mã ${maSinhVien}`,
            response_status: 200,
            resData: `Người dùng ${userN} xóa khen thưởng/ kỷ luật thành công`,
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      if (!KhenThuongKyLuat)
        return res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json({ message: "Đã xoá danh mục khen thưởng kỷ luật " });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = KhenThuongKyLuatController;
