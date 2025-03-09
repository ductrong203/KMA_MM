const { ke_hoach_mon_hoc, danh_muc_dao_tao, mon_hoc } = require('../models');

class KeHoachMonHocService {
  static async getAll() {
    return await ke_hoach_mon_hoc.findAll();
  }

  static async getById(id) {
    return await ke_hoach_mon_hoc.findByPk(id);
  }

  static async create(data) {
    const { danh_muc_id, mon_hoc_id, ky_hoc, bat_buoc } = data;

    const danhMuc = await danh_muc_dao_tao.findByPk(danh_muc_id);
    if (!danhMuc) throw new Error('Danh mục đào tạo không tồn tại.');

    const monHoc = await mon_hoc.findByPk(mon_hoc_id);
    if (!monHoc) throw new Error('Môn học không tồn tại.');

    return await ke_hoach_mon_hoc.create({ danh_muc_id, mon_hoc_id, ky_hoc, bat_buoc });
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
}

module.exports = KeHoachMonHocService;
