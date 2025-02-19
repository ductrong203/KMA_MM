const { lop } = require("../models");
const { danh_muc_dao_tao } = require("../models");

class LopService {

  static async createLop(danh_muc_dao_tao_id) {
    try {
      const danhMuc = await danh_muc_dao_tao.findByPk(danh_muc_dao_tao_id);
      if (!danhMuc) {
        throw new Error("Danh mục đào tạo không tồn tại");
      }
      if (danhMuc.ma_he_dao_tao == null){
        throw new Error("Mã hệ đào tạo không tồn tại");
      }
      const count = await lop.count({ where: { danh_muc_dao_tao_id } });
      console.log("count", count);
      const maLop = `${danhMuc.ma_he_dao_tao}${String(count+1).padStart(2, "0")}`;

      const newLop = await lop.create({
        ma_lop: maLop,
        danh_muc_dao_tao_id,
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
