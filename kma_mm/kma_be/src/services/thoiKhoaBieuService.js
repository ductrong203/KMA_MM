const { thoi_khoa_bieu, lop, mon_hoc, giang_vien } = require('../models');

class ThoiKhoaBieuService {
  static async getAll() {
    return await thoi_khoa_bieu.findAll();
  }

  static async getById(id) {
    return await thoi_khoa_bieu.findByPk(id);
  }

  static async getByPage(page = 1, pageSize = 10) {
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

  static async create(data) {
    const { lop_id, mon_hoc_id, giang_vien_id, phong_hoc, tiet_hoc, trang_thai, ky_hoc } = data;

    const lopExist = await lop.findByPk(lop_id);
    if (!lopExist) throw new Error('Lớp không tồn tại.');

    const monHocExist = await mon_hoc.findByPk(mon_hoc_id);
    if (!monHocExist) throw new Error('Môn học không tồn tại.');

    const giangVienExist = await giang_vien.findByPk(giang_vien_id);
    if (!giangVienExist) throw new Error('Giảng viên không tồn tại.');

    return await thoi_khoa_bieu.create({ lop_id, mon_hoc_id, giang_vien_id, phong_hoc, tiet_hoc, trang_thai, ky_hoc });
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
