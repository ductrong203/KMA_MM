const { khoa_dao_tao, danh_muc_dao_tao } = require("../models");

class KhoaDaoTaoService {
  static async createKhoaDaoTao(data) {
    try {
      const {he_dao_tao_id, ma_khoa, ten_khoa, nam_hoc, so_ky_hoc} = data
      
      const danhMuc = await danh_muc_dao_tao.findByPk(he_dao_tao_id);
      if (!danhMuc) {
        throw new Error("Danh mục đào tạo không tồn tại");
      }
      if (!danhMuc.ma_he_dao_tao) {
        throw new Error("Mã hệ đào tạo không tồn tại");
      }

      // const count = await khoa_dao_tao.count({ where: { he_dao_tao_id } });
      // const maKhoa = `${danhMuc.ma_he_dao_tao}${String(count + 1).padStart(2, "0")}`;

      const newKhoa = await khoa_dao_tao.create({
        ma_khoa,
        ten_khoa,
        nam_hoc,
        he_dao_tao_id,
        so_ky_hoc
      });
      return newKhoa;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllKhoaDaoTao() {
    return await khoa_dao_tao.findAll();
  }

  static async getKhoaDaoTaoById(id) {
    return await khoa_dao_tao.findByPk(id);
  }

  static async getKhoaDaoTaoByDanhMucId(danhMucId) {
    try {
      return await khoa_dao_tao.findAll({
        where: { he_dao_tao_id: danhMucId },
      });
    } catch (error) {
      throw new Error('Lỗi khi lấy danh sách khóa đào tạo theo danh mục đào tạo');
    }
  }

  static async updateKhoaDaoTao(id, updateData) {
    try {
      const khoa = await khoa_dao_tao.findByPk(id);
      if (!khoa) {
        throw new Error("Không tìm thấy khoá đào tạo");
      }
      await khoa.update(updateData);
      return khoa;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteKhoaDaoTao(id) {
    try {
      const khoa = await khoa_dao_tao.findByPk(id);
      if (!khoa) {
        throw new Error("Không tìm thấy khoá đào tạo");
      }
      await khoa.destroy();
      return { message: "Xoá khoá đào tạo thành công" };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = KhoaDaoTaoService;