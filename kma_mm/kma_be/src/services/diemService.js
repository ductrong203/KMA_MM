const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { diem, sinh_vien, thoi_khoa_bieu } = models;

class DiemService {
  static async filter({ sinh_vien_id, thoi_khoa_bieu_id, page = 1, pageSize = 10 }) {
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const whereClause = {};

    if (sinh_vien_id) {
      const foundSinhVien = await sinh_vien.findByPk(sinh_vien_id);
      if (foundSinhVien) {
        whereClause.sinh_vien_id = sinh_vien_id;
      } else {
        return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
      }
    }

    if (thoi_khoa_bieu_id) {
      const foundTKB = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
      if (foundTKB) {
        whereClause.thoi_khoa_bieu_id = thoi_khoa_bieu_id;
      } else {
        return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
      }
    }

    const { count, rows } = await diem.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']],
      include: [
        {
            model: sinh_vien,
            as: 'sinh_vien',
            attributes: ['ma_sinh_vien', 'ho_dem', 'ten'] 
        }
      ]
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
      data: rows
    };
  }

  static async getById(id) {
    return await diem.findByPk(id);
  }

  static async create(data) {
    const { sinh_vien_id, thoi_khoa_bieu_id } = data;

    const sinhVienExist = await sinh_vien.findByPk(sinh_vien_id);
    if (!sinhVienExist) throw new Error('Sinh viên không tồn tại.');

    const tkbExist = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
    if (!tkbExist) throw new Error('Thời khóa biểu không tồn tại.');

    return await diem.create(data);
  }

  static async update(id, data) {
    const record = await diem.findByPk(id);
    if (!record) throw new Error('Điểm không tồn tại.');

    const { sinh_vien_id, thoi_khoa_bieu_id } = data;

    if (sinh_vien_id) {
      const sinhVienExist = await sinh_vien.findByPk(sinh_vien_id);
      if (!sinhVienExist) throw new Error('Sinh viên không tồn tại.');
    }

    if (thoi_khoa_bieu_id) {
      const tkbExist = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
      if (!tkbExist) throw new Error('Thời khóa biểu không tồn tại.');
    }

    return await record.update(data);
  }

  static async delete(id) {
    const record = await diem.findByPk(id);
    if (!record) throw new Error('Điểm không tồn tại.');
    await record.destroy();
    return { message: 'Xóa thành công!' };
  }
}

module.exports = DiemService;