const ChuongTrinhDaoTaoService = require('../services/chuongTrinhDaoTaoService');
const { chuong_trinh_dao_tao, danh_muc_dao_tao, khoa_dao_tao, mon_hoc } = require('../models');

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
class ChuongTrinhDaoTaoController {
  static async createChuongTrinhDaoTao(req, res) {
    try {
      const data = req.body;

      const chuongTrinhs = await ChuongTrinhDaoTaoService.createChuongTrinhDaoTao(data);
      let userN = await getFieldById("users", req.user.id, "username");
      let heDaoTao = await getFieldById("danh_muc_dao_tao", req.body.he_dao_tao_id, "ten_he_dao_tao");
      let khoaDaoTao = await getFieldById("khoa_dao_tao", req.body.khoa_dao_tao_id, "ten_khoa");
      if (chuongTrinhs) {
        let inforActivity = {
          username: userN,
          role: mapRole[req.user.role],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `Người dùng ${userN} đã tạo chương trình đào tạo cho khoa đào tạo ${khoaDaoTao} thuộc hệ đào tạo ${heDaoTao}`,
          response_status: 200,
          resData: "Tạo chương trình đào tạo thành công",
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }
      return res.status(201).json({
        message: 'Tạo chương trình đào tạo thành công',
        data: chuongTrinhs,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || 'Có lỗi xảy ra khi tạo chương trình đào tạo',
      });
    }
  }

  static async getChuongTrinhDaoTao(req, res) {
    try {
      const filters = req.query; // Lấy các tham số từ query string
      const result = await ChuongTrinhDaoTaoService.getChuongTrinhDaoTao(filters);
      return res.status(200).json({
        message: 'Lấy danh sách chương trình đào tạo thành công',
        data: result.data,
        pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || 'Có lỗi xảy ra khi lấy danh sách chương trình đào tạo',
      });
    }
  }
  static async updateChuongTrinhDaoTao(req, res) {
    try {

      const data = req.body;
      const { he_dao_tao_id, khoa_dao_tao_id } = data;
      const heDaoTao = await getFieldById("danh_muc_dao_tao", he_dao_tao_id, "ten_he_dao_tao");
      const khoaDaoTao = await getFieldById("khoa_dao_tao", khoa_dao_tao_id, "ten_khoa");

      const oldData = await chuong_trinh_dao_tao.findAll({
        where: {
          he_dao_tao_id,
          khoa_dao_tao_id,
        },
        attributes: ['so_quyet_dinh', 'ngay_ra_quyet_dinh'],
      });

      var arrMonHoc = await chuong_trinh_dao_tao.findAll({
        where: {
          he_dao_tao_id,
          khoa_dao_tao_id,
        },
        attributes: ['mon_hoc_id'],
      });
      console.log("########1", arrMonHoc.length);

      const oldArrMonHocId = (arrMonHoc || []).map((monHoc) => {
        return monHoc.mon_hoc_id;
      }).filter(Boolean);
      console.log("##oldarr", oldArrMonHocId);


      const chuongTrinhs = await ChuongTrinhDaoTaoService.updateChuongTrinhDaoTao(data);

      try{
    
      arrMonHoc = await chuong_trinh_dao_tao.findAll({
        where: {
          he_dao_tao_id,
          khoa_dao_tao_id,
        },
        attributes: ['mon_hoc_id'],
      });
      console.log("########2", arrMonHoc.length);

      const newArrMonHocId = (arrMonHoc || []).map((monHoc) => {
        return monHoc.mon_hoc_id;
      }).filter(Boolean);

      console.log("#####$$$checkkk", oldData[0] );

      const oldResult = oldArrMonHocId?.filter(x => !newArrMonHocId.includes(x));
      const newResult = newArrMonHocId?.filter(x => !oldArrMonHocId.includes(x));

      const oldPromises = oldResult?.map(async (id) => {
        return await getFieldById("mon_hoc", id, "ten_mon_hoc");
      })
      const oldNames = await Promise.all(oldPromises);

      const newPromises = newResult?.map(async (id) => {
        return await getFieldById("mon_hoc", id, "ten_mon_hoc");
      })
      const newNames = await Promise.all(newPromises);

      // const temp1 =   

      const xoa_mon_str = oldNames?.length === 0 ? "" : `đã bỏ các môn: ${oldNames?.join(" , ")} `;
      const them_mon_str = newNames?.length === 0 ? "" : `đã thêm các môn: ${newNames?.join(" , ")}`;


      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      if (chuongTrinhs) {
        const newData = await chuong_trinh_dao_tao.findAll({
          where: {
            he_dao_tao_id,
            khoa_dao_tao_id,
          },
          attributes: ['so_quyet_dinh', 'ngay_ra_quyet_dinh'],
        });
        if(!oldData[0] || !newData[0]){
                var strRes = !oldData[0] && newData[0] ? `đã tạo chương trình đào tạo này`: "đã xóa chương trình đào tạo này";
                  
        }
        else {
                    strRes = `${getDiffData(oldData[0].dataValues, newData[0].dataValues)}`; 
        }
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: `${strRes}  ${xoa_mon_str} ${them_mon_str}`,
          response_status: 200,
          resData: `Người dùng ${userN} đã chỉnh sửa chương trình đào tạo của khoa đào tạo ${khoaDaoTao} thuộc hệ đào tạo ${heDaoTao} thành công`,
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }
    }
    catch (error){
          console.error("Lỗi ghi log activity:", error.message); 
    }

      return res.status(200).json({
        message: 'Cập nhật chương trình đào tạo thành công',
        data: chuongTrinhs,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || 'Có lỗi xảy ra khi cập nhật chương trình đào tạo',
      });
    }
  }
}

module.exports = ChuongTrinhDaoTaoController;