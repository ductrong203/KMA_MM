const { lop, khoa_dao_tao } = require("../models");

class LopService {

  static async createLop(khoa_dao_tao_id) {
    try {
      const khoa = await khoa_dao_tao.findByPk(khoa_dao_tao_id);
      if (!khoa) {
        throw new Error("Khoá đào tạo không tồn tại");
      }
      if (khoa.ma_khoa == null){
        throw new Error("Mã khoá đào tạo không tồn tại");
      }
      const count = await lop.count({ where: { khoa_dao_tao_id } });
      console.log("count", count);
      const maLop = `${khoa.ma_khoa}${String(count+1).padStart(2, "0")}`;

      const newLop = await lop.create({
        ma_lop: maLop,
        khoa_dao_tao_id,
        trang_thai: 1
      });
      return newLop;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllLops() {
    return await lop.findAll();
  }

  static async getLopById(id) {
    return await lop.findByPk(id);
  }

  static async updateLop(id, data) {
    const lopItem = await lop.findByPk(id);
    if (!lopItem) return null;
    return await lopItem.update(data);
  }

  static async deleteLop(id) {
    const lopItem = await lop.findByPk(id);
    if (!lopItem) return null;
    await lopItem.destroy();
    return lopItem;
  }
}

module.exports = LopService;
