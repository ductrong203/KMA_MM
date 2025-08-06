const KhoaDaoTaoService = require("../services/khoaDaoTaoService");
const { khoa_dao_tao, danh_muc_dao_tao } = require("../models");

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

class KhoaDaoTaoController {
  static async create(req, res) {
    try {
      console.log("###");
      const khoaDaoTao = await KhoaDaoTaoService.createKhoaDaoTao(req.body);
      const token = req.headers.authorization?.split(" ")[1];
    // console.log(token);
    let user = verifyAccessToken(token);
    let userN  = await  getFieldById("users", user.id, "username");
    let  userR = await  getFieldById("users", user.id, "role");
      if (khoaDaoTao) {
      let inforActivity = {
        username:   userN,
        role: mapRole[userR],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN}  đã tạo thành công khoa đào tạo  ${khoaDaoTao.ten_khoa} `,
        response_status: 200,
        resData: "Tạo khoa đào tạo thành công",
        ip:  req._remoteAddress,

      }
        await logActivity(inforActivity);
      }

      res.status(201).json(
        {message: "Tạo khoa đào tạo thành công ", 
        data:khoaDaoTao});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const khoaList = await KhoaDaoTaoService.getAllKhoaDaoTao();
      res.json(khoaList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const khoa = await KhoaDaoTaoService.getKhoaDaoTaoById(id);
      if (!khoa) return res.status(404).json({ error: "Không tìm thấy khoá đào tạo" });
      res.json(khoa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getKhoaDaoTaoByDanhMuc(req, res) {
    const { danhmucdaotaoid } = req.params;
    try {
      const khoaDaoTaoList = await KhoaDaoTaoService.getKhoaDaoTaoByDanhMucId(danhmucdaotaoid);
      if (khoaDaoTaoList.length === 0) {
        return res.status(404).json({ message: 'Không có khóa đào tạo nào cho danh mục này' });
      }
      res.status(200).json(khoaDaoTaoList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const oldData = await khoa_dao_tao.findByPk(id);
      const updatedKhoa = await KhoaDaoTaoService.updateKhoaDaoTao(id, req.body);
      const newData = updatedKhoa;
      const token = req.headers.authorization?.split(" ")[1];
          // console.log(token);
          let user = verifyAccessToken(token);
          let userN  = await  getFieldById("users", user.id, "username");
          let  userR = await  getFieldById("users", user.id, "role");
          let  maKhoa = await  getFieldById("khoa_dao_tao", id, "ma_khoa");
            if (updatedKhoa) {
            let inforActivity = {
              username:   userN,
              role: mapRole[userR],
              action: req.method,
              endpoint: req.originalUrl,
              reqData: `${getDiffData(oldData.dataValues, newData.dataValues)}`,
              response_status: 200,
              resData: `Người dùng ${userN} cập nhật khoa đào tạo có mã ${maKhoa} thành công`,
              ip:  req._remoteAddress,
      
            }
              await logActivity(inforActivity);
            }
      
      res.json(
        {message: "Cập nhật khoa đào tạo thành công", 
        data: updatedKhoa
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization?.split(" ")[1];
          // console.log(token);
          
          const result = await KhoaDaoTaoService.deleteKhoaDaoTao(id);
          let user = verifyAccessToken(token);
          let userN  = await  getFieldById("users", user.id, "username");
          let  userR = await  getFieldById("users", user.id, "role");
          let khoaDaoTao = await getFieldById("khoa_dao_tao", id, "ten_khoa")
            if (result) {
            let inforActivity = {
              username:   userN,
              role: mapRole[userR],
              action: req.method,
              endpoint: req.originalUrl,
              reqData: `Người dùng ${userN}  đã xóa thành công khoa đào tạo  ${khoaDaoTao} `,
              response_status: 200,
              resData: "Xóa khoa đào tạo thành công.",
              ip:  req._remoteAddress,
      
            }
              await logActivity(inforActivity);
            }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = KhoaDaoTaoController;
