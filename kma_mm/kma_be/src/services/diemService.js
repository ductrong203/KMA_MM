const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { diem, sinh_vien, mon_hoc } = models;

class DiemService {
    static async getAll({ page = 1, pageSize = 10, ma_sinh_vien, ma_mon_hoc }) {
        const offset = (page - 1) * pageSize;
        const whereClause = {};
    
        // Kiểm tra sinh viên nếu có ma_sinh_vien
        if (ma_sinh_vien) {
            const sinhVien = await sinh_vien.findOne({ where: { ma_sinh_vien } });
            if (sinhVien) {
                whereClause.sinh_vien_id = sinhVien.id;
            } else {
                return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
            }
        }
    
        // Kiểm tra môn học nếu có ma_mon_hoc
        if (ma_mon_hoc) {
            const monHoc = await mon_hoc.findOne({ where: { ma_mon_hoc } });
            if (monHoc) {
                whereClause.mon_hoc_id = monHoc.id;
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
                { model: sinh_vien, as: 'sinh_vien', attributes: ['id', 'ma_sinh_vien', 'ten'] },
                { model: mon_hoc, as: 'mon_hoc', attributes: ['id', 'ma_mon_hoc', 'ten_mon_hoc'] }
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
    
    static async getByPage({ page = 1, pageSize = 10 }) {
        page = parseInt(page) || 1;
        pageSize = parseInt(pageSize) || 10;
        const offset = (page - 1) * pageSize;
    
        try {
            const { count, rows } = await diem.findAndCountAll({
                limit: pageSize,
                offset: offset,
                order: [['id', 'DESC']],
                include: [
                    { model: sinh_vien, as: 'sinh_vien', attributes: ['id', 'ma_sinh_vien', 'ten'] },
                    { model: mon_hoc, as: 'mon_hoc', attributes: ['id', 'ma_mon_hoc', 'ten_mon_hoc'] }
                ]
            });
    
            return {
                totalItems: count,
                totalPages: Math.ceil(count / pageSize),
                currentPage: page,
                pageSize: pageSize,
                data: rows
            };
        } catch (error) {
            console.error("Lỗi truy vấn điểm:", error);
            return { error: "Đã xảy ra lỗi khi truy vấn dữ liệu" };
        }
    }
    

  static async getById(id) {
    return await diem.findByPk(id, {
      include: [
        { model: sinh_vien, attributes: ['ma_sinh_vien', 'ten_sinh_vien'] },
        { model: mon_hoc, attributes: ['ma_mon_hoc', 'ten_mon_hoc'] }
      ]
    });
  }

  static async create(data) {
    const { sinh_vien_id, mon_hoc_id } = data;

    const sinhVienExists = await sinh_vien.findByPk(sinh_vien_id);
    const monHocExists = await mon_hoc.findByPk(mon_hoc_id);

    if (!sinhVienExists || !monHocExists) {
      throw new Error('Sinh viên hoặc Môn học không tồn tại!');
    }

    return await diem.create(data);
  }

  static async update(id, data) {
    const diemData = await diem.findByPk(id);
    if (!diemData) throw new Error('Không tìm thấy điểm!');

    await diem.update(data, { where: { id } });
    return await diem.findByPk(id);
  }

  static async delete(id) {
    const deleted = await diem.destroy({ where: { id } });
    if (!deleted) throw new Error('Không tìm thấy điểm!');
    return { message: 'Xóa thành công!' };
  }
}

module.exports = DiemService;
