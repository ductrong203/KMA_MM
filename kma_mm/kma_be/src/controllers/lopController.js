const LopService = require("../services/lopService");
const { lop, khoa_dao_tao } = require("../models");

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

class LopController {
  static async create(req, res) {
    try {
      const { khoa_dao_tao_id } = req.body;

      if (!khoa_dao_tao_id) {
        return res.status(400).json({ message: "khoa_dao_tao_id là bắt buộc" });
      }

      const newLop = await LopService.createLop(khoa_dao_tao_id);
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      if (newLop) {
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `Người dùng ${userN}  đã tạo thành công lớp có mã ${newLop.ma_lop} `,
          response_status: 200,
          resData: "Tạo lớp thành công",
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }

      return res.status(201).json(
        {
          message: "Tạo lớp thành công ",
          data: newLop
        });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const lop = await LopService.getAllLops();
      res.json(lop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const lop = await LopService.getLopById(req.params.id);
      if (!lop) return res.status(404).json({ message: "Lớp không tồn tại" });
      res.json(lop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByKhoaDaoTaoId(req, res) {
    try {
      const { khoa_dao_tao_id } = req.query;
      if (!khoa_dao_tao_id) {
        return res.status(400).json({ message: "Thiếu khoa_dao_tao_id" });
      }

      const danhSachLop = await LopService.getByKhoaDaoTaoId(khoa_dao_tao_id);
      return res.json(danhSachLop);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const oldKhoaDaoTaoId = await getFieldById("lop", req.params.id, "khoa_dao_tao_id");
      const oldTenKhoa = await getFieldById("khoa_dao_tao", oldKhoaDaoTaoId, "ten_khoa");
      
      const updatedLop = await LopService.updateLop(req.params.id, req.body);
      const newKhoaDaoTaoId = await getFieldById("lop", req.params.id, "khoa_dao_tao_id");
      const newTenKhoa = await getFieldById("khoa_dao_tao", newKhoaDaoTaoId, "ten_khoa");
            const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      let maLop = await getFieldById("lop", req.params.id, "ma_lop");

      if (updatedLop) {
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `Chuyển khoa đào tạo: ${oldTenKhoa} => ${newTenKhoa}`,
          response_status: 200,
          resData: `Người dùng ${userN} đã cập nhật thành công cho lớp có mã ${maLop}`,
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }

      if (!updatedLop) return res.status(404).json({ message: "Lớp không tồn tại" });
      res.json(
        {
          message: "Cập nhật lớp thành công ",
          data: updatedLop
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deletedLop = await LopService.deleteLop(req.params.id);
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      let maLop = await getFieldById("lop", req.params.id, "ma_lop");
      if (deletedLop) {
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `Người dùng ${userN}  đã xóa thành công mã lớp ${maLop} `,
          response_status: 200,
          resData: "Xóa lớp thành công",
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }

      if (!deletedLop) return res.status(404).json({ message: "Lớp không tồn tại" });
      res.json({ message: "Xóa lớp thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LopController;
