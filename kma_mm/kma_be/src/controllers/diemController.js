const DiemService = require('../services/diemService');
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

class DiemController {
  static async filter(req, res) {
    try {
      // Xử lý tham số bao_ve_do_an
      let queryParams = { ...req.query };
      if (queryParams.bao_ve_do_an !== undefined) {
        if (queryParams.bao_ve_do_an === 'true') {
          queryParams.bao_ve_do_an = true;
        } else if (queryParams.bao_ve_do_an === 'false') {
          queryParams.bao_ve_do_an = false;
        } else if (queryParams.bao_ve_do_an === 'null' || queryParams.bao_ve_do_an === '') {
          queryParams.bao_ve_do_an = null;
        }
      }

      const data = await DiemService.filter(queryParams);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await DiemService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Không tìm thấy điểm.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByKhoaDaoTaoIdVaMonHocId(req, res) {
    try {
      const { khoa_dao_tao_id, mon_hoc_id } = req.params;
      if (!khoa_dao_tao_id || !mon_hoc_id) {
        return res.status(400).json({ error: 'Thiếu khoa_dao_tao_id hoặc mon_hoc_id.' });
      }
      const data = await DiemService.getByKhoaIdVaMonId(khoa_dao_tao_id, mon_hoc_id);
      if (!data) return res.status(404).json({ error: 'Không tìm thấy điểm.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await DiemService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createDiemForClass(req, res) {
    try {
      const { thoi_khoa_bieu_id, bao_ve_do_an } = req.body;
      if (!thoi_khoa_bieu_id) {
        return res.status(400).json({ message: "Thiếu thoi_khoa_bieu_id!" });
      }

      // Chuyển đổi bao_ve_do_an thành boolean hoặc null
      let baoVeDoAnValue = null;
      if (bao_ve_do_an !== undefined && bao_ve_do_an !== null) {
        if (typeof bao_ve_do_an === 'string') {
          baoVeDoAnValue = bao_ve_do_an.toLowerCase() === 'true';
        } else {
          baoVeDoAnValue = Boolean(bao_ve_do_an);
        }
      }

      const result = await DiemService.createDiemForClass(thoi_khoa_bieu_id, baoVeDoAnValue);
      try {
              const token = req.headers.authorization?.split(" ")[1];
                  // console.log(token);
                  let user = verifyAccessToken(token);
                  let userN  = await  getFieldById("users", user.id, "username");
                  let  userR = await  getFieldById("users", user.id, "role");
                  let kyHoc = await  getFieldById("thoi_khoa_bieu", thoi_khoa_bieu_id, "ky_hoc"); 
                  let lopId = await  getFieldById("thoi_khoa_bieu", thoi_khoa_bieu_id, "lop_id"); 
                  let monHocId = await  getFieldById("thoi_khoa_bieu", thoi_khoa_bieu_id, "mon_hoc_id"); 
                  let lop = await  getFieldById("lop", lopId, "ma_lop"); 
                  let monHoc = await  getFieldById("mon_hoc", monHocId, "ten_mon_hoc"); 
                    if (result) {
                    let inforActivity = {
                      username:   userN,
                      role: mapRole[userR],
                      action: req.method,
                      endpoint: req.originalUrl,
                      reqData: `Người dùng ${userN} đã tạo bảng điểm kỳ ${kyHoc} cho học phần ${monHoc} của lớp ${lop} `,
                      response_status: 200,
                      resData: "Tạo bảng điểm thành công",
                      ip:  req._remoteAddress,
              
                    }
                      await logActivity(inforActivity);
                    }
           } catch (error) {
              console.error("Lỗi kìa ní:", error.message);
           }
      
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await DiemService.update(req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async themSinhVienHocLaiVaoLop(req, res) {
    try {
      const { thoi_khoa_bieu_id, ma_sinh_vien } = req.body;
      const result = await DiemService.themSinhVienHocLaiVaoLop(thoi_khoa_bieu_id, ma_sinh_vien);
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const result = await DiemService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async importExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });
      }
      const { lop_id, mon_hoc_id } = req.body;
      const filePath = req.file.path;

      const result = await DiemService.importExcel(filePath, { lop_id, mon_hoc_id });
      const data = await DiemService.update(result);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async importExcelCuoiKy(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });
      }
      const {mon_hoc_id, khoa_dao_tao_id, lop_id } = req.body;
      const filePath = req.file.path;
      const result = await DiemService.importExcelCuoiKy(filePath, {mon_hoc_id, khoa_dao_tao_id, lop_id });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getThongKeDiem(req, res) {
    try {
      const { he_dao_tao_id, khoa_dao_tao_id, lop_id, ky_hoc_id } = req.query;
      const data = await DiemService.getThongKeDiem({
        he_dao_tao_id: he_dao_tao_id ? parseInt(he_dao_tao_id) : undefined,
        khoa_dao_tao_id: khoa_dao_tao_id ? parseInt(khoa_dao_tao_id) : undefined,
        lop_id: parseInt(lop_id),
        ky_hoc_id: ky_hoc_id || 'all', // Mặc định là 'all' nếu không cung cấp
      });

      return res.status(200).json(data);
    } catch (error) {
      console.error('Lỗi trong getThongKeDiem:', error);
      return res.status(500).json({ error: error.message || 'Không thể lấy thống kê điểm' });
    }
  }
}

module.exports = DiemController;