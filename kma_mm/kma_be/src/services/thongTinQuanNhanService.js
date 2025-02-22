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

      const existingRecord = await thong_tin_quan_nhan.findOne({
        where: { sinh_vien_id }
      });
      if (existingRecord) {
        throw new Error("Sinh viên này đã có thông tin quân nhân");
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

  static async getThongTinByIdSinhVien(idSinhVien) {
    return await thong_tin_quan_nhan.findOne({
      where: { sinh_vien_id: idSinhVien }
    });
  }

  static async updateThongTin(id, data) {
    const thongTin = await thong_tin_quan_nhan.findByPk(id);
    if (!thongTin) return null;

    if (data.sinh_vien_id && data.sinh_vien_id !== thongTin.sinh_vien_id) {
      const sinhVien = await sinh_vien.findByPk(data.sinh_vien_id);
      if (!sinhVien) {
        throw new Error("Sinh viên không tồn tại");
      }

      const existingRecord = await thong_tin_quan_nhan.findOne({
        where: { sinh_vien_id: data.sinh_vien_id }
      });
      if (existingRecord) {
        throw new Error("Sinh viên này đã có thông tin quân nhân");
      }
    }

    return await thongTin.update(data);
  }

  static async updateThongTinByIdSinhVien(idSinhVien, data) {
    const thongTin = await thong_tin_quan_nhan.findOne({
      where: { sinh_vien_id: idSinhVien }
    });
  
    if (!thongTin) return null;

    if (data.sinh_vien_id && data.sinh_vien_id !== thongTin.sinh_vien_id) {
      const sinhVien = await sinh_vien.findByPk(data.sinh_vien_id);
      if (!sinhVien) {
        throw new Error("Sinh viên không tồn tại");
      }

      const existingRecord = await thong_tin_quan_nhan.findOne({
        where: { sinh_vien_id: data.sinh_vien_id }
      });
      if (existingRecord) {
        throw new Error("Sinh viên này đã có thông tin quân nhân");
      }
    }

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
