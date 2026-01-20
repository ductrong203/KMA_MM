const { tot_nghiep, sinh_vien, lop, khoa_dao_tao, danh_muc_dao_tao } = require('../models/init-models')(require('../models').sequelize);
const { Op } = require('sequelize');

class TotNghiepService {
  // Tạo bản ghi tốt nghiệp mới
  async createGraduation(graduationData) {
    try {
      const graduation = await tot_nghiep.create(graduationData);
      return graduation;
    } catch (error) {
      throw new Error(`Lỗi khi tạo bản ghi tốt nghiệp: ${error.message}`);
    }
  }

  // Xét duyệt tốt nghiệp cho nhiều sinh viên
  async approveGraduation(graduationData) {
    try {
      const {
        sinh_vien_ids,
        lop_id,
        khoa_dao_tao_id,
        he_dao_tao_id,
        graduation_results
      } = graduationData;

      const graduations = [];

      for (let i = 0; i < sinh_vien_ids.length; i++) {
        const sinh_vien_id = sinh_vien_ids[i];
        const graduationInfo = graduation_results[i]; // Lấy theo index thay vì key

        // Kiểm tra xem sinh viên đã có bản ghi tốt nghiệp chưa
        const existingGraduation = await tot_nghiep.findOne({
          where: {
            sinh_vien_id,
            khoa_dao_tao_id
          }
        });

        if (existingGraduation) {
          // Cập nhật bản ghi hiện có
          await existingGraduation.update({
            trang_thai: 'da_duyet',
            ngay_xet_duyet: new Date(),
            tong_tin_chi: graduationInfo?.tong_tin_chi || 0,
            du_tin_chi: graduationInfo?.dieu_kien_tot_nghiep?.du_tin_chi || false,
            co_chung_chi: graduationInfo?.dieu_kien_tot_nghiep?.co_chung_chi_xet_tot_nghiep || false,
            du_dieu_kien: graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien || false,
            diem_trung_binh_tich_luy: graduationInfo?.diem_trung_binh_tich_luy || null,
            dung_han: graduationInfo?.dung_han || 0
          });
          graduations.push(existingGraduation);
        } else {
          // Tạo bản ghi mới
          const newGraduation = await tot_nghiep.create({
            sinh_vien_id,
            lop_id,
            khoa_dao_tao_id,
            he_dao_tao_id,
            trang_thai: 'da_duyet',
            ngay_xet_duyet: new Date(),
            tong_tin_chi: graduationInfo?.tong_tin_chi || 0,
            du_tin_chi: graduationInfo?.dieu_kien_tot_nghiep?.du_tin_chi || false,
            co_chung_chi: graduationInfo?.dieu_kien_tot_nghiep?.co_chung_chi_xet_tot_nghiep || false,
            du_dieu_kien: graduationInfo?.dieu_kien_tot_nghiep?.du_dieu_kien || false,
            diem_trung_binh_tich_luy: graduationInfo?.diem_trung_binh_tich_luy || null,
            dung_han: graduationInfo?.dung_han || 0
          });
          graduations.push(newGraduation);
        }
      }

      return graduations;
    } catch (error) {
      throw new Error(`Lỗi khi xét duyệt tốt nghiệp: ${error.message}`);
    }
  }

  // Lấy danh sách sinh viên tốt nghiệp
  async getGraduationList(filters = {}) {
    try {
      const whereClause = {};

      if (filters.he_dao_tao_id) {
        whereClause.he_dao_tao_id = filters.he_dao_tao_id;
      }

      if (filters.khoa_dao_tao_id) {
        whereClause.khoa_dao_tao_id = filters.khoa_dao_tao_id;
      }

      if (filters.lop_id) {
        whereClause.lop_id = filters.lop_id;
      }

      if (filters.trang_thai) {
        whereClause.trang_thai = filters.trang_thai;
      }

      if (filters.from_date && filters.to_date) {
        whereClause.ngay_xet_duyet = {
          [Op.between]: [filters.from_date, filters.to_date]
        };
      }

      const graduations = await tot_nghiep.findAll({
        where: whereClause,
        include: [
          {
            model: sinh_vien,
            as: 'sinh_vien',
            attributes: ['id', 'ma_sinh_vien', 'ho_dem', 'ten', 'ngay_sinh', 'gioi_tinh']
          },
          {
            model: lop,
            as: 'lop',
            attributes: ['id', 'ma_lop', 'ten_lop']
          },
          {
            model: khoa_dao_tao,
            as: 'khoa_dao_tao',
            attributes: ['id', 'ten_khoa', 'nam_bat_dau', 'nam_ket_thuc']
          },
          {
            model: danh_muc_dao_tao,
            as: 'he_dao_tao',
            attributes: ['id', 'ten_he_dao_tao']
          }
        ],
        order: [['ngay_xet_duyet', 'DESC']]
      });

      return graduations;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách tốt nghiệp: ${error.message}`);
    }
  }

  // Lấy thông tin tốt nghiệp của một sinh viên
  async getStudentGraduation(sinh_vien_id, khoa_dao_tao_id = null) {
    try {
      const whereClause = { sinh_vien_id };

      if (khoa_dao_tao_id) {
        whereClause.khoa_dao_tao_id = khoa_dao_tao_id;
      }

      const graduation = await tot_nghiep.findOne({
        where: whereClause,
        include: [
          {
            model: sinh_vien,
            as: 'sinh_vien',
            attributes: ['id', 'ma_sinh_vien', 'ho_dem', 'ten']
          },
          {
            model: lop,
            as: 'lop',
            attributes: ['id', 'ma_lop', 'ten_lop']
          },
          {
            model: khoa_dao_tao,
            as: 'khoa_dao_tao',
            attributes: ['id', 'ten_khoa']
          },
          {
            model: danh_muc_dao_tao,
            as: 'he_dao_tao',
            attributes: ['id', 'ten_he_dao_tao']
          }
        ]
      });

      return graduation;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin tốt nghiệp: ${error.message}`);
    }
  }

  // Cập nhật thông tin bằng tốt nghiệp
  async updateGraduationCertificate(graduation_id, certificateData) {
    try {
      const graduation = await tot_nghiep.findByPk(graduation_id);

      if (!graduation) {
        throw new Error('Không tìm thấy bản ghi tốt nghiệp');
      }

      await graduation.update({
        so_hieu_bang: certificateData.so_hieu_bang,
        xep_loai: certificateData.xep_loai,
        ngay_cap_bang: certificateData.ngay_cap_bang,
        noi_cap_bang: certificateData.noi_cap_bang,
        ghi_chu: certificateData.ghi_chu
      });

      return graduation;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật thông tin bằng: ${error.message}`);
    }
  }

  // Thống kê tốt nghiệp
  async getGraduationStatistics(filters = {}) {
    try {
      const whereClause = {};

      if (filters.he_dao_tao_id) {
        whereClause.he_dao_tao_id = filters.he_dao_tao_id;
      }

      if (filters.khoa_dao_tao_id) {
        whereClause.khoa_dao_tao_id = filters.khoa_dao_tao_id;
      }

      if (filters.year) {
        whereClause.ngay_xet_duyet = {
          [Op.between]: [
            new Date(`${filters.year}-01-01`),
            new Date(`${filters.year}-12-31`)
          ]
        };
      }

      const statistics = await tot_nghiep.findAll({
        where: whereClause,
        attributes: [
          'trang_thai',
          'xep_loai',
          [tot_nghiep.sequelize.fn('COUNT', tot_nghiep.sequelize.col('id')), 'count']
        ],
        group: ['trang_thai', 'xep_loai']
      });

      return statistics;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê tốt nghiệp: ${error.message}`);
    }
  }

  // Xóa bản ghi tốt nghiệp
  async deleteGraduation(graduation_id) {
    try {
      const graduation = await tot_nghiep.findByPk(graduation_id);

      if (!graduation) {
        throw new Error('Không tìm thấy bản ghi tốt nghiệp');
      }

      await graduation.destroy();
      return { message: 'Đã xóa bản ghi tốt nghiệp thành công' };
    } catch (error) {
      throw new Error(`Lỗi khi xóa bản ghi tốt nghiệp: ${error.message}`);
    }
  }

  // Kiểm tra trạng thái xét duyệt của lớp
  async checkGraduationStatus(filters) {
    try {
      const { lop_id, khoa_dao_tao_id, he_dao_tao_id } = filters;

      // Kiểm tra xem có sinh viên nào trong lớp đã được xét duyệt chưa
      const existingGraduations = await tot_nghiep.findAll({
        where: {
          lop_id,
          khoa_dao_tao_id,
          he_dao_tao_id,
          trang_thai: 'da_duyet'
        },
        include: [
          {
            model: sinh_vien,
            as: 'sinh_vien',
            attributes: ['id', 'ma_sinh_vien', 'ho_dem', 'ten']
          }
        ]
      });

      const isApproved = existingGraduations.length > 0;
      const approvedStudents = existingGraduations.map(grad => ({
        ...grad.sinh_vien.toJSON(),
        dung_han: grad.dung_han
      }));

      return {
        is_approved: isApproved,
        approved_count: existingGraduations.length,
        approved_students: approvedStudents,
        approval_date: isApproved ? existingGraduations[0].ngay_xet_duyet : null
      };
    } catch (error) {
      throw new Error(`Lỗi khi kiểm tra trạng thái xét duyệt: ${error.message}`);
    }
  }
}

module.exports = new TotNghiepService();
