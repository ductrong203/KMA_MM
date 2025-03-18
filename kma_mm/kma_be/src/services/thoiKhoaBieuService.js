const { thoi_khoa_bieu, lop, mon_hoc } = require('../models');

class ThoiKhoaBieuService {
  static async getAll() {
    return await thoi_khoa_bieu.findAll();
  }

  static async getById(id) {
    return await thoi_khoa_bieu.findByPk(id);
  }

  static async getByPage({page = 1, pageSize = 10}) {
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const { count, rows } = await thoi_khoa_bieu.findAndCountAll({
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']]
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
      data: rows
    };
  }

  static async filter({ ky_hoc, ma_mon_hoc, ma_lop, page = 1, pageSize = 10 }) {
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const whereClause = {};  

    if (ma_lop) {
      const foundLop = await lop.findOne({ where: { ma_lop } });
      if (foundLop) {
          whereClause.lop_id = foundLop.id;
      } else {
          return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
      }
  }

    if (ma_mon_hoc) {
        const monHoc = await mon_hoc.findOne({ where: { ma_mon_hoc } });
        if (monHoc) {
            whereClause.mon_hoc_id = monHoc.id; 
        } else {
            return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
        }
    }

    if (ky_hoc) {
        whereClause.ky_hoc = ky_hoc; 
    }

    const { count, rows } = await thoi_khoa_bieu.findAndCountAll({
        where: whereClause, 
        limit: pageSize,
        offset: offset,
        order: [['id', 'DESC']]
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize: pageSize,
        data: rows
    };
}

  static async create(data) {
    const { lop_id, mon_hoc_id, giang_vien, phong_hoc, tiet_hoc, trang_thai, ky_hoc } = data;

    const lopExist = await lop.findByPk(lop_id);
    if (!lopExist) throw new Error('Lớp không tồn tại.');

    const monHocExist = await mon_hoc.findByPk(mon_hoc_id);
    if (!monHocExist) throw new Error('Môn học không tồn tại.');

    return await thoi_khoa_bieu.create({ lop_id, mon_hoc_id, giang_vien, phong_hoc, tiet_hoc, trang_thai, ky_hoc });
  }

  static async update(id, data) {
    const record = await thoi_khoa_bieu.findByPk(id);
    if (!record) throw new Error('Thời khóa biểu không tồn tại.');

    return await record.update(data);
  }

  static async delete(id) {
    const record = await thoi_khoa_bieu.findByPk(id);
    if (!record) throw new Error('Thời khóa biểu không tồn tại.');

    await record.destroy();
    return { message: 'Xóa thành công!' };
  }
}

module.exports = ThoiKhoaBieuService;
