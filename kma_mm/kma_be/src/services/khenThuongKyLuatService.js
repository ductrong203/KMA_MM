const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { danh_muc_khen_ky_luat, khen_thuong_ky_luat, sinh_vien, lop } = models;

class KhenThuongKyLuatService {
  static async createKhenThuongKyLuat(data) {
    try {
      const { sinh_vien_id, danh_muc_id } = data;
      const sinhVien = await sinh_vien.findByPk(sinh_vien_id);
      if (!sinhVien) {
        throw new Error("Sinh viên không tồn tại");
      }
      const danhmuc = await danh_muc_khen_ky_luat.findByPk(danh_muc_id);
      if (!danhmuc) {
        throw new Error("danh muc khen - ky luat khong ton tai");
      }
      return await khen_thuong_ky_luat.create(data);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  static async getAllKhenThuongKyLuat() {
    return await khen_thuong_ky_luat.findAll({
      include: [
        {
          model: danh_muc_khen_ky_luat,
          as: "danh_muc",
          attributes: ["id", "ma_danh_muc", "ten_danh_muc", "loai"],
        },
        {
          model: sinh_vien,
          as: "sinh_vien",
          attributes: ["id", "ho_dem", "ten", "ma_sinh_vien"],
          include: [
            {
              model: lop,
              as: "lop",
              attributes: ["id", "ma_lop"],
            },
          ],
        },
      ],
    });
  }

  static async getKhenThuongKyLuatById(id) {
    return await khen_thuong_ky_luat.findByPk(id, {
      include: [
        {
          model: danh_muc_khen_ky_luat,
          as: "danh_muc",
          attributes: ["id", "ma_danh_muc", "ten_danh_muc", "loai"],
        },
        {
          model: sinh_vien,
          as: "sinh_vien",
          attributes: ["id", "ho_dem", "ten", "ma_sinh_vien"],
          include: [
            {
              model: lop,
              as: "lop",
              attributes: ["id", "ma_lop"],
            },
          ],
        },
      ],
    });
  }

  static async updateKhenThuongKyLuat(id, data) {
    const KhenThuongKyLuat = await khen_thuong_ky_luat.findByPk(id);
    if (!KhenThuongKyLuat) return null;
    return await KhenThuongKyLuat.update(data);
  }

  static async deleteKhenThuongKyLuat(id) {
    const KhenThuongKyLuat = await khen_thuong_ky_luat.findByPk(id);
    if (!KhenThuongKyLuat) return null;
    await KhenThuongKyLuat.destroy();
    return KhenThuongKyLuat;
  }
}
module.exports = KhenThuongKyLuatService;
