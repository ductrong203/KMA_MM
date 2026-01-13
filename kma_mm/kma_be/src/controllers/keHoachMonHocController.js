const KeHoachMonHocService = require('../services/keHoachMonHocService');
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
class KeHoachMonHocController {
  static async getAll(req, res) {
    try {
      const data = await KeHoachMonHocService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await KeHoachMonHocService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Không tìm thấy kế hoạch môn học.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByKhoaDaoTaoAndKyHoc(req, res) {
    try {
      const { khoa_dao_tao_id, ky_hoc } = req.params;

      if (!khoa_dao_tao_id) {
        return res.status(400).json({ message: "Thiếu khoa_dao_tao_id" });
      }

      const data = await KeHoachMonHocService.getByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getMonHocByKhoaDaoTaoAndKyHoc(req, res) {
    try {
      const { khoa_dao_tao_id, ky_hoc } = req.body;

      if (!khoa_dao_tao_id || !ky_hoc) {
        return res.status(400).json({ message: "Thiếu khoa_dao_tao_id hoặc ky_hoc" });
      }

      const monHocList = await KeHoachMonHocService.getMonHocByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
      return res.json(monHocList);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async create(req, res) {
    try {

      const data = await KeHoachMonHocService.create(req.body);
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      let monHoc = await getFieldById("mon_hoc", data.mon_hoc_id, "ten_mon_hoc");
      let khoaDaoTao = await getFieldById("khoa_dao_tao", data.khoa_dao_tao_id, "ten_khoa");
      if (data) {
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `Người dùng ${userN} đã tạo thành công kế hoạch cho  môn học ${monHoc} của kì ${data.ky_hoc} thuộc khoa đào tạo ${khoaDaoTao} `,
          response_status: 200,
          resData: "Tạo kế hoạch môn học thành công.",
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const oldData = await getFieldById("ke_hoach_mon_hoc", req.params.id, "ky_hoc");
      const data = await KeHoachMonHocService.update(req.params.id, req.body);
      const newData = data.ky_hoc
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      if (data) {
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `kế hoạch môn học này được chuyển từ chuyển từ kỳ học ${oldData} sang kỳ học ${newData} `,
          response_status: 200,
          resData: `Người dùng ${userN} đã cập nhật kế hoạch môn học thành công`,
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      let monHocId = await getFieldById("ke_hoach_mon_hoc", req.params.id, "mon_hoc_id");
      let kyHoc = await getFieldById("ke_hoach_mon_hoc", req.params.id, "ky_hoc");
      let monHoc = await getFieldById("mon_hoc", monHocId, "ten_mon_hoc");
      console.log("###############", monHocId);
      const result = await KeHoachMonHocService.delete(req.params.id);
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      if (result) {
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `Người dùng ${userN}  đã xóa thành công kế hoạch môn học cho môn ${monHoc} kỳ học ${kyHoc}`,
          response_status: 200,
          resData: "Xóa kế hoạch môn học thành công",
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getMHByKhoaDaoTaoAndKyHoc(req, res) {
    try {
      const { khoa_dao_tao_id, ky_hoc } = req.body;

      if (!khoa_dao_tao_id || !ky_hoc) {
        return res.status(400).json({ message: "Thiếu khoa_dao_tao_id hoặc ky_hoc" });
      }

      const data = await KeHoachMonHocService.getMHByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getAllByKhoaDaoTao(req, res) {
    try {
      const { khoa_dao_tao_id } = req.params;

      if (!khoa_dao_tao_id) {
        return res.status(400).json({
          success: false,
          message: "Thiếu khoa_dao_tao_id"
        });
      }

      const data = await KeHoachMonHocService.getAllByKhoaDaoTao(khoa_dao_tao_id);

      return res.json({
        success: true,
        data: data,
        total: data.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async copyKeHoachMonHoc(req, res) {
    try {
      const { fromKhoaDaoTaoId, toKhoaDaoTaoId, heDaoTaoId } = req.body;

      // Validation input
      if (!fromKhoaDaoTaoId || !toKhoaDaoTaoId || !heDaoTaoId) {
        return res.status(400).json({
          error: "Thiếu thông tin bắt buộc: fromKhoaDaoTaoId, toKhoaDaoTaoId, heDaoTaoId"
        });
      }

      // Kiểm tra không được sao chép từ chính nó
      if (fromKhoaDaoTaoId === toKhoaDaoTaoId) {
        return res.status(400).json({
          error: "Không thể sao chép kế hoạch môn học từ chính khóa đào tạo đó"
        });
      }

      const result = await KeHoachMonHocService.copyKeHoachMonHoc(
        fromKhoaDaoTaoId,
        toKhoaDaoTaoId,
        heDaoTaoId
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Thêm một hoặc nhiều môn học vào kế hoạch môn học nếu chưa tồn tại
   */
  static async bulkCreateIfNotExists(req, res) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Thiếu danh sách môn học cần thêm'
        });
      }

      // Validate từng item
      for (const item of items) {
        if (!item.khoa_dao_tao_id || !item.mon_hoc_id || !item.ky_hoc) {
          return res.status(400).json({
            success: false,
            error: 'Mỗi môn học cần có khoa_dao_tao_id, mon_hoc_id và ky_hoc'
          });
        }
      }

      const result = await KeHoachMonHocService.bulkCreateIfNotExists(items);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = KeHoachMonHocController;
