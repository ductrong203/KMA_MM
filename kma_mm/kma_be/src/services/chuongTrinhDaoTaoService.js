const { chuong_trinh_dao_tao, danh_muc_dao_tao, khoa_dao_tao, mon_hoc } = require('../models');
const { Op } = require('sequelize');

class ChuongTrinhDaoTaoService {
  static async createChuongTrinhDaoTao(data) {
    const { he_dao_tao_id, khoa_dao_tao_id, ngay_ra_quyet_dinh, so_quyet_dinh, mon_hoc_ids } = data;

    // Kiểm tra dữ liệu đầu vào
    if (!he_dao_tao_id || !khoa_dao_tao_id || !mon_hoc_ids || !Array.isArray(mon_hoc_ids) || mon_hoc_ids.length === 0) {
      throw new Error('Thiếu hoặc không hợp lệ: he_dao_tao_id, khoa_dao_tao_id, hoặc mon_hoc_ids');
    }

    // Kiểm tra sự tồn tại của he_dao_tao_id
    const heDaoTao = await danh_muc_dao_tao.findOne({ where: { id: he_dao_tao_id } });
    if (!heDaoTao) {
      throw new Error('Hệ đào tạo không tồn tại');
    }

    // Kiểm tra sự tồn tại của khoa_dao_tao_id
    const khoaDaoTao = await khoa_dao_tao.findOne({ where: { id: khoa_dao_tao_id } });
    if (!khoaDaoTao) {
      throw new Error('Khóa đào tạo không tồn tại');
    }

    // Kiểm tra sự tồn tại của tất cả mon_hoc_id
    const monHocRecords = await mon_hoc.findAll({
      where: { id: { [Op.in]: mon_hoc_ids } },
      attributes: ['id', 'ma_mon_hoc', 'ten_mon_hoc'],
    });
    if (monHocRecords.length !== mon_hoc_ids.length) {
      throw new Error('Một hoặc nhiều môn học không tồn tại');
    }

    // Kiểm tra trùng lặp môn học trong chương trình đào tạo
    const existingRecords = await chuong_trinh_dao_tao.findAll({
      where: {
        he_dao_tao_id,
        khoa_dao_tao_id,
        so_quyet_dinh,
        mon_hoc_id: { [Op.in]: mon_hoc_ids },
      },
      include: [
        {
          model: mon_hoc,
          as: 'monHoc', // Thêm alias để khớp với định nghĩa trong model
          attributes: ['ma_mon_hoc', 'ten_mon_hoc'],
        },
      ],
    });

    if (existingRecords.length > 0) {
      const duplicateSubjects = existingRecords.map(
        (record) => `${record.monHoc.ma_mon_hoc} - ${record.monHoc.ten_mon_hoc}`
      );
      throw new Error(`Các môn học sau đã tồn tại trong chương trình đào tạo: ${duplicateSubjects.join(', ')}`);
    }

    // Chuẩn bị dữ liệu để tạo nhiều bản ghi
    const chuongTrinhData = mon_hoc_ids.map((mon_hoc_id) => ({
      he_dao_tao_id,
      khoa_dao_tao_id,
      ngay_ra_quyet_dinh: ngay_ra_quyet_dinh ? new Date(ngay_ra_quyet_dinh) : null,
      so_quyet_dinh,
      mon_hoc_id,
    }));

    // Tạo các bản ghi trong bảng chuong_trinh_dao_tao
    const chuongTrinhs = await chuong_trinh_dao_tao.bulkCreate(chuongTrinhData);

    return chuongTrinhs;
  }

  static async getChuongTrinhDaoTao(filters = {}) {
    const { he_dao_tao_id, khoa_dao_tao_id, so_quyet_dinh, page = 1, limit = 10 } = filters;

    // Xây dựng điều kiện where dựa trên các bộ lọc
    const where = {};
    if (he_dao_tao_id) {
      where.he_dao_tao_id = he_dao_tao_id;
    }
    if (khoa_dao_tao_id) {
      where.khoa_dao_tao_id = khoa_dao_tao_id;
    }
    if (so_quyet_dinh) {
      where.so_quyet_dinh = { [Op.like]: `%${so_quyet_dinh}%` };
    }

    // Tính toán phân trang
    const offset = (page - 1) * limit;

    // Lấy danh sách chương trình đào tạo
    const chuongTrinhs = await chuong_trinh_dao_tao.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: danh_muc_dao_tao,
          as: 'heDaoTao', // Giả sử alias đã được định nghĩa trong model
          attributes: ['id', 'ten_he_dao_tao'],
        },
        {
          model: khoa_dao_tao,
          as: 'khoaDaoTao', // Giả sử alias đã được định nghĩa trong model
          attributes: ['id', 'ten_khoa'],
        },
        {
          model: mon_hoc,
          as: 'monHoc', // Alias đã được sử dụng trong create
          attributes: ['id', 'ma_mon_hoc', 'ten_mon_hoc'],
        },
      ],
      order: [['ngay_ra_quyet_dinh', 'DESC']],
    });

    // Trả về kết quả với thông tin phân trang
    return {
      totalItems: chuongTrinhs.count,
      totalPages: Math.ceil(chuongTrinhs.count / limit),
      currentPage: parseInt(page),
      data: chuongTrinhs.rows,
    };
  }

  static async updateChuongTrinhDaoTao(data) {
  const { he_dao_tao_id, khoa_dao_tao_id, so_quyet_dinh, ngay_ra_quyet_dinh, mon_hoc_ids } = data;

  // Kiểm tra dữ liệu đầu vào
  if (!he_dao_tao_id || !khoa_dao_tao_id || !so_quyet_dinh || !ngay_ra_quyet_dinh || !Array.isArray(mon_hoc_ids)) {
    throw new Error('Thiếu hoặc không hợp lệ: he_dao_tao_id, khoa_dao_tao_id, so_quyet_dinh, ngay_ra_quyet_dinh, hoặc mon_hoc_ids');
  }

  // Kiểm tra sự tồn tại của he_dao_tao_id
  const heDaoTao = await danh_muc_dao_tao.findOne({ where: { id: he_dao_tao_id } });
  if (!heDaoTao) {
    throw new Error('Hệ đào tạo không tồn tại');
  }

  // Kiểm tra sự tồn tại của khoa_dao_tao_id
  const khoaDaoTao = await khoa_dao_tao.findOne({ where: { id: khoa_dao_tao_id } });
  if (!khoaDaoTao) {
    throw new Error('Khóa đào tạo không tồn tại');
  }

  // Kiểm tra sự tồn tại của tất cả mon_hoc_id
  if (mon_hoc_ids.length > 0) {
    const monHocRecords = await mon_hoc.findAll({
      where: { id: { [Op.in]: mon_hoc_ids } },
      attributes: ['id'],
    });
    if (monHocRecords.length !== mon_hoc_ids.length) {
      throw new Error('Một hoặc nhiều môn học không tồn tại');
    }
  }

  // Lấy danh sách môn học hiện tại trong chương trình
  const existingRecords = await chuong_trinh_dao_tao.findAll({
    where: {
      he_dao_tao_id,
      khoa_dao_tao_id,
    },
    attributes: ['mon_hoc_id'],
  });
  const existingMonHocIds = existingRecords.map((record) => record.mon_hoc_id);

  // Xác định môn học cần thêm và cần xóa
  const monHocIdsToAdd = mon_hoc_ids.filter((id) => !existingMonHocIds.includes(id));
  const monHocIdsToRemove = existingMonHocIds.filter((id) => !mon_hoc_ids.includes(id));

  // Thêm môn học mới
  const newRecords = monHocIdsToAdd.map((mon_hoc_id) => ({
    he_dao_tao_id,
    khoa_dao_tao_id,
    so_quyet_dinh,
    ngay_ra_quyet_dinh: new Date(ngay_ra_quyet_dinh),
    mon_hoc_id,
    created_at: new Date(),
    updated_at: new Date(),
  }));
  if (newRecords.length > 0) {
    await chuong_trinh_dao_tao.bulkCreate(newRecords);
  }

  // Xóa môn học không còn trong danh sách
  if (monHocIdsToRemove.length > 0) {
    await chuong_trinh_dao_tao.destroy({
      where: {
        he_dao_tao_id,
        khoa_dao_tao_id,
        mon_hoc_id: { [Op.in]: monHocIdsToRemove },
      },
    });
  }

  // Cập nhật thông tin chương trình (so_quyet_dinh, ngay_ra_quyet_dinh) nếu có bản ghi
  if (existingRecords.length > 0 || newRecords.length > 0) {
    await chuong_trinh_dao_tao.update(
      {
        so_quyet_dinh,
        ngay_ra_quyet_dinh: new Date(ngay_ra_quyet_dinh),
        updated_at: new Date(),
      },
      {
        where: {
          he_dao_tao_id,
          khoa_dao_tao_id,
        },
      }
    );
  }

  // Trả về danh sách môn học hiện tại
  const updatedRecords = await chuong_trinh_dao_tao.findAll({
    where: {
      he_dao_tao_id,
      khoa_dao_tao_id,
    },
    include: [
      {
        model: mon_hoc,
        as: 'monHoc',
        attributes: ['id', 'ma_mon_hoc', 'ten_mon_hoc'],
      },
      {
        model: danh_muc_dao_tao,
        as: 'heDaoTao',
        attributes: ['id', 'ten_he_dao_tao'],
      },
      {
        model: khoa_dao_tao,
        as: 'khoaDaoTao',
        attributes: ['id', 'ten_khoa'],
      },
    ],
  });

  return updatedRecords;
}

}

module.exports = ChuongTrinhDaoTaoService;