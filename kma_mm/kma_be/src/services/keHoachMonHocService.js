const { ke_hoach_mon_hoc, khoa_dao_tao, mon_hoc } = require('../models');

class KeHoachMonHocService {
  static async getAll() {
    return await ke_hoach_mon_hoc.findAll();
  }

  static async getById(id) {
    return await ke_hoach_mon_hoc.findByPk(id);
  }

  static async getByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc = null) {
    try {
      const whereClause = { khoa_dao_tao_id };
      if (ky_hoc) {
        whereClause.ky_hoc = ky_hoc;
      }
      
      const data = await ke_hoach_mon_hoc.findAll({ where: whereClause });
      return data;
    } catch (error) {
      throw new Error("Lỗi khi lấy dữ liệu kế hoạch môn học");
    }
  }

  static async getMonHocByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc) {
    try {
      const keHoachMonHocList = await ke_hoach_mon_hoc.findAll({
        where: { khoa_dao_tao_id, ky_hoc },
        attributes: ["mon_hoc_id"],
      });

      const monHocIds = keHoachMonHocList.map(kh => kh.mon_hoc_id);

      if (monHocIds.length === 0) return [];

      const danhSachMonHoc = await mon_hoc.findAll({
        where: { id: monHocIds },
        attributes: ["id", "ma_mon_hoc", "ten_mon_hoc", "so_tin_chi"],
      });

      return danhSachMonHoc;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách môn học");
    }
  }

  static async create(data) {
    const { khoa_dao_tao_id, mon_hoc_id, ky_hoc, bat_buoc } = data;

    const khoa = await khoa_dao_tao.findByPk(khoa_dao_tao_id);
    if (!khoa) throw new Error('Khoá đào tạo không tồn tại.');

    const monHoc = await mon_hoc.findByPk(mon_hoc_id);
    if (!monHoc) throw new Error('Môn học không tồn tại.');

    const existingKeHoach = await ke_hoach_mon_hoc.findOne({
      where: { khoa_dao_tao_id, mon_hoc_id, ky_hoc },
    });
    if (existingKeHoach) {
      throw new Error('Kế hoạch môn học đã tồn tại cho khoá đào tạo, môn học và kỳ học này.');
    }
    
    return await ke_hoach_mon_hoc.create({ khoa_dao_tao_id, mon_hoc_id, ky_hoc, bat_buoc });
  }

  static async update(id, data) {
    const record = await ke_hoach_mon_hoc.findByPk(id);
    if (!record) throw new Error('Kế hoạch môn học không tồn tại.');

    return await record.update(data);
  }

  static async delete(id) {
    const record = await ke_hoach_mon_hoc.findByPk(id);
    if (!record) throw new Error('Kế hoạch môn học không tồn tại.');

    await record.destroy();
    return { message: 'Xóa thành công!' };
  }

  static async getMHByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc) {
    try {
      const data = await ke_hoach_mon_hoc.findAll({
        where: { khoa_dao_tao_id, ky_hoc },
      });
      return data;
    } catch (error) {
      throw new Error("Lỗi khi lấy dữ liệu kế hoạch môn học");
    }
  }

}

module.exports = KeHoachMonHocService;
