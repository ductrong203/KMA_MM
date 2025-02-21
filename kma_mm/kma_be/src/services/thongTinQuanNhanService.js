const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { thong_tin_quan_nhan, sinh_vien } = models;

class ThongTinQuanNhanService {
  static async createThongTin(data) {
    try {
      const { sinh_vien_id } = data;
      const sinhVien = await sinh_vien.findByPk(sinh_vien_id);
      if (!sinhVien) {
        throw new Error("Sinh viên không tồn tại");
      }
      return await thong_tin_quan_nhan.create(data);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllThongTin() {
    return await thong_tin_quan_nhan.findAll();
  }

  static async getThongTinById(id) {
    return await thong_tin_quan_nhan.findByPk(id);
  }

  static async updateThongTin(id, data) {
    const thongTin = await thong_tin_quan_nhan.findByPk(id);
    if (!thongTin) return null;
    return await thongTin.update(data);
  }

  static async deleteThongTin(id) {
    const thongTin = await thong_tin_quan_nhan.findByPk(id);
    if (!thongTin) return null;
    await thongTin.destroy();
    return thongTin;
  }
}

module.exports = ThongTinQuanNhanService;
