const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { doi_tuong_quan_ly, sinh_vien, lop,khoa_dao_tao,danh_muc_dao_tao } = models;

class SinhVienService {
  static async createSinhVien(data) {
    try {
      const lopInfo = await lop.findByPk(data.lop_id);
      if (!lopInfo) {
        throw new Error("Lớp không tồn tại");
      }

      const count = await sinh_vien.count({ where: { lop_id: data.lop_id } });
      const maSinhVien = `${lopInfo.ma_lop}${String(count + 1).padStart(2, "0")}`;
      data.ma_sinh_vien = maSinhVien;
      const sinhVien = await sinh_vien.create(data);
        
      // Chuyển đối tượng thành JSON và xóa password
      const sinhVienData = sinhVien.toJSON();
      delete sinhVienData.password;

      return sinhVienData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllSinhViens() {
    return await sinh_vien.findAll({
      include: [
        {
          model: doi_tuong_quan_ly,
          as: "doi_tuong",
          attributes: ["ten_doi_tuong"],
        },
      ],
    });
  }

  static async getAllSinhVienPhanTrang(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const { rows, count } = await sinh_vien.findAndCountAll({
        offset,
        limit,
      });
      if (!rows || rows.length === 0) {
        return { message: "Không tìm thấy sinh viên", students: [], total: count };
      }

      return {
        students: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên");
    }
  }

  static async getStudentsByLopId(lopId) {
    try {
      return await sinh_vien.findAll({ where: { lop_id: lopId } });
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên theo lop_id");
    }
  }

  static async getStudentsByDoiTuongId(doiTuongId) {
    try {
      return await sinh_vien.findAll({ where: { doi_tuong_id: doiTuongId } });
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên theo doi_tuong_id");
    }
  }

  static async getSinhVienById(id) {
    return await sinh_vien.findByPk(id, {
      include: [
        {
          model: doi_tuong_quan_ly,
          as: "doi_tuong",
          attributes: ["ten_doi_tuong"],
        },
      ],
    });
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
  
  static async timSinhVienTheoMaHoacFilter(filters) {
    try {
      const { ma_sinh_vien, he_dao_tao_id, khoa_id, lop_id } = filters;
      const where = {};
      if (ma_sinh_vien) where.ma_sinh_vien = ma_sinh_vien;
      if (lop_id) where.lop_id = lop_id;

      const lopWhere = {};
      if (khoa_id) lopWhere.khoa_dao_tao_id = khoa_id;

      const khoaWhere = {};
      if (he_dao_tao_id) khoaWhere.he_dao_tao_id = he_dao_tao_id;

      const sinhVienList = await sinh_vien.findAll({
        where,
        include: [
          {
            model: lop,
            as: 'lop',
            attributes: ['ma_lop'],
            where: lopWhere,
            include: [
              {
                model: khoa_dao_tao,
                as: 'khoa_dao_tao',
                attributes: ['ma_khoa'],
                where: khoaWhere,
                include: [
                  {
                    model: danh_muc_dao_tao,
                    as: 'he_dao_tao',
                    attributes: ['id', 'ten_he_dao_tao'], // Thêm 'id'
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!sinhVienList || sinhVienList.length === 0) {
        throw new Error('Không tìm thấy sinh viên phù hợp');
      }

      return sinhVienList.map(sv => ({
        ma_sinh_vien: sv.ma_sinh_vien,
        ho_dem: sv.ho_dem,
        ten: sv.ten,
        lop: sv.lop?.ma_lop || sv.lop_id,
        khoa: sv.lop?.khoa_dao_tao?.ma_khoa || null,
        he_dao_tao_id: sv.lop?.khoa_dao_tao?.he_dao_tao?.id || null, // Lấy từ id của danh_muc_dao_tao
        ten_he_dao_tao: sv.lop?.khoa_dao_tao?.he_dao_tao?.ten_he_dao_tao || null,
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = SinhVienService;
