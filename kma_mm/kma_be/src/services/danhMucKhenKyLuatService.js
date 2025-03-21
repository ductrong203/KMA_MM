const { danh_muc_khen_ky_luat } = require("../models");

class DanhMucKhenKyLuatService {
  static async createDanhMucKhenKyLuat(data) {
    try {
      return await danh_muc_khen_ky_luat.create(data);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  static async getAllDanhMucKhenKyLuat() {
    return await danh_muc_khen_ky_luat.findAll();
  }

  static async getDanhMucKhenKyLuatById(id) {
    return await danh_muc_khen_ky_luat.findByPk(id);
  }

  static async updateDanhMucKhenKyLuat(id, data) {
    const danhMucKhenKyLuat = await danh_muc_khen_ky_luat.findByPk(id);
    if (!danhMucKhenKyLuat) return null;
    return await danhMucKhenKyLuat.update(data);
  }

  static async deleteDanhMucKhenKyLuat(id) {
    const danhMucKhenKyLuat = await danh_muc_khen_ky_luat.findByPk(id);
    if (!danhMucKhenKyLuat) return null;
    await danhMucKhenKyLuat.destroy();
    return danhMucKhenKyLuat;
  }
}
module.exports = DanhMucKhenKyLuatService;
