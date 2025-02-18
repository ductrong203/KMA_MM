const { sinh_vien } = require("../models");

class SinhVienService {
  static async createSinhVien(data) {
    try {
      return await sinh_vien.create(data);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllSinhViens() {
    return await sinh_vien.findAll();
  }

  static async getSinhVienById(id) {
    return await sinh_vien.findByPk(id);
  }

  static async updateSinhVien(id, data) {
    const sinhVien = await sinh_vien.findByPk(id);
    if (!sinhVien) return null;
    return await sinhVien.update(data);
  }

  static async deleteSinhVien(id) {
    const sinhVien = await sinh_vien.findByPk(id);
    if (!sinhVien) return null;
    await sinhVien.destroy();
    return sinhVien;
  }
}

module.exports = SinhVienService;
