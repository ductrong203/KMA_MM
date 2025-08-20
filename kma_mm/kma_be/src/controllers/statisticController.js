const { sinh_vien, lop, khoa_dao_tao, danh_muc_dao_tao, tot_nghiep, mon_hoc } = require('../models');
const { Op } = require('sequelize');

class StatisticController {
  // Thống kê tốt nghiệp - sử dụng bảng tot_nghiep
  static async getThongKeTotNghiep(req, res) {
    try {
      const { he_dao_tao_id, khoa_dao_tao_id, lop_id } = req.body;
      
      // Debug log để kiểm tra request
      console.log('getThongKeTotNghiep - Request body:', req.body);
      console.log('Parameters:', { he_dao_tao_id, khoa_dao_tao_id, lop_id });

      // Xây dựng điều kiện where cho bảng tot_nghiep
      let whereCondition = {};
      let includeConditions = [];

      if (lop_id) {
        whereCondition.lop_id = lop_id;
      } else if (khoa_dao_tao_id) {
        whereCondition.khoa_dao_tao_id = khoa_dao_tao_id;
      } else if (he_dao_tao_id) {
        whereCondition.he_dao_tao_id = he_dao_tao_id;
      }

      console.log('Where condition:', whereCondition);

      // Đếm sinh viên đã tốt nghiệp (trang_thai = 'da_duyet')
      const totNghiep = await tot_nghiep.count({
        where: {
          ...whereCondition,
          trang_thai: 'da_duyet'
        }
      });

      // Đếm sinh viên chờ duyệt tốt nghiệp (trang_thai = 'cho_duyet')
      const choDuyet = await tot_nghiep.count({
        where: {
          ...whereCondition,
          trang_thai: 'cho_duyet'
        }
      });

      // Đếm sinh viên bị từ chối tốt nghiệp (trang_thai = 'tu_choi')
      const tuChoi = await tot_nghiep.count({
        where: {
          ...whereCondition,
          trang_thai: 'tu_choi'
        }
      });

      res.json({
        success: true,
        data: {
          totNghiep,
          choDuyet,
          tuChoi,
          total: totNghiep + choDuyet + tuChoi
        }
      });
    } catch (error) {
      console.error('Error in getThongKeTotNghiep:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thống kê tốt nghiệp',
        error: error.message
      });
    }
  }

  // Thống kê sinh viên đủ điều kiện làm đồ án - sử dụng bảng tot_nghiep và kiểm tra điều kiện
  static async getThongKeDoAn(req, res) {
    try {
      const { he_dao_tao_id, khoa_dao_tao_id, lop_id } = req.body;
      
      // Debug log để kiểm tra request
      console.log('getThongKeDoAn - Request body:', req.body);
      console.log('Parameters:', { he_dao_tao_id, khoa_dao_tao_id, lop_id });

      // Xây dựng điều kiện where cho bảng tot_nghiep
      let whereCondition = {};

      if (lop_id) {
        whereCondition.lop_id = lop_id;
      } else if (khoa_dao_tao_id) {
        whereCondition.khoa_dao_tao_id = khoa_dao_tao_id;
      } else if (he_dao_tao_id) {
        whereCondition.he_dao_tao_id = he_dao_tao_id;
      }

      console.log('Where condition (DoAn):', whereCondition);

      // Đếm sinh viên đủ điều kiện làm đồ án (du_dieu_kien = true)
      const duDieuKien = await tot_nghiep.count({
        where: {
          ...whereCondition,
          du_dieu_kien: true
        }
      });

      // Đếm sinh viên không đủ điều kiện làm đồ án (du_dieu_kien = false)
      const khongDuDieuKien = await tot_nghiep.count({
        where: {
          ...whereCondition,
          du_dieu_kien: false
        }
      });

      res.json({
        success: true,
        data: {
          duDieuKien,
          khongDuDieuKien,
          total: duDieuKien + khongDuDieuKien
        }
      });
    } catch (error) {
      console.error('Error in getThongKeDoAn:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thống kê đồ án',
        error: error.message
      });
    }
  }

  // API debug để kiểm tra dữ liệu thô trong bảng tot_nghiep
  static async getDebugData(req, res) {
    try {
      // Lấy tất cả dữ liệu từ bảng tot_nghiep
      const allData = await tot_nghiep.findAll({
        attributes: ['id', 'sinh_vien_id', 'lop_id', 'khoa_dao_tao_id', 'he_dao_tao_id', 'trang_thai', 'du_dieu_kien'],
        limit: 10 // Giới hạn 10 records để không quá nhiều dữ liệu
      });

      // Đếm theo từng trạng thái
      const counts = {
        total: await tot_nghiep.count(),
        da_duyet: await tot_nghiep.count({ where: { trang_thai: 'da_duyet' } }),
        cho_duyet: await tot_nghiep.count({ where: { trang_thai: 'cho_duyet' } }),
        tu_choi: await tot_nghiep.count({ where: { trang_thai: 'tu_choi' } }),
        du_dieu_kien: await tot_nghiep.count({ where: { du_dieu_kien: true } }),
        khong_du_dieu_kien: await tot_nghiep.count({ where: { du_dieu_kien: false } })
      };

      res.json({
        success: true,
        data: {
          counts,
          sampleData: allData
        }
      });
    } catch (error) {
      console.error('Error in getDebugData:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy dữ liệu debug',
        error: error.message
      });
    }
  }
}

module.exports = StatisticController;