const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { ke_hoach_mon_hoc, khoa_dao_tao, mon_hoc } = models;

class KeHoachMonHocService {
  static async getAll() {
    return await ke_hoach_mon_hoc.findAll();
  }

  static async getById(id) {
    return await ke_hoach_mon_hoc.findByPk(id);
  }

  static async getByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc = null) {
    try {
      const whereClause = { khoa_dao_tao_id };
      if (ky_hoc) {
        whereClause.ky_hoc = ky_hoc;
      }
      
      const data = await ke_hoach_mon_hoc.findAll({ where: whereClause });
      return data;
    } catch (error) {
      throw new Error("Lỗi khi lấy dữ liệu kế hoạch môn học");
    }
  }

  static async getMonHocByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc) {
    try {
      const keHoachMonHocList = await ke_hoach_mon_hoc.findAll({
        where: { khoa_dao_tao_id, ky_hoc },
        attributes: ["mon_hoc_id"],
      });

      const monHocIds = keHoachMonHocList.map(kh => kh.mon_hoc_id);

      if (monHocIds.length === 0) return [];

      const danhSachMonHoc = await mon_hoc.findAll({
        where: { id: monHocIds },
        attributes: ["id", "ma_mon_hoc", "ten_mon_hoc", "so_tin_chi","tinh_diem"],
      });

      return danhSachMonHoc;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách môn học");
    }
  }

  static async create(data) {
    const { khoa_dao_tao_id, mon_hoc_id, ky_hoc, bat_buoc } = data;

    const khoa = await khoa_dao_tao.findByPk(khoa_dao_tao_id);
    if (!khoa) throw new Error('Khoá đào tạo không tồn tại.');

    const monHoc = await mon_hoc.findByPk(mon_hoc_id);
    if (!monHoc) throw new Error('Môn học không tồn tại.');

    const existingKeHoach = await ke_hoach_mon_hoc.findOne({
      where: { khoa_dao_tao_id, mon_hoc_id, ky_hoc },
    });
    if (existingKeHoach) {
      throw new Error('Kế hoạch môn học đã tồn tại cho khoá đào tạo, môn học và kỳ học này.');
    }
    
    return await ke_hoach_mon_hoc.create({ khoa_dao_tao_id, mon_hoc_id, ky_hoc, bat_buoc });
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

  static async getMHByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc) {
    try {
      const data = await ke_hoach_mon_hoc.findAll({
        where: { khoa_dao_tao_id, ky_hoc },
      });
      return data;
    } catch (error) {
      throw new Error("Lỗi khi lấy dữ liệu kế hoạch môn học");
    }
  }

  static async getAllByKhoaDaoTao(khoa_dao_tao_id) {
    try {
      if (!khoa_dao_tao_id) {
        throw new Error("Thiếu khoa_dao_tao_id");
      }

      // Kiểm tra khóa đào tạo có tồn tại không
      const khoa = await khoa_dao_tao.findByPk(khoa_dao_tao_id);
      if (!khoa) {
        throw new Error('Khóa đào tạo không tồn tại.');
      }

      const data = await ke_hoach_mon_hoc.findAll({
        where: { khoa_dao_tao_id },
        include: [
          {
            model: mon_hoc,
            as: 'mon_hoc',
            attributes: ['id', 'ma_mon_hoc', 'ten_mon_hoc', 'so_tin_chi','he_dao_tao_id'],
          },
          {
            model: khoa_dao_tao,
            as: 'khoa_dao_tao',
            attributes: ['id', 'ma_khoa', 'ten_khoa', 'nam_hoc']
          }
        ],
        order: [['ky_hoc', 'ASC'], ['mon_hoc_id', 'ASC']]
      });

      return data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy kế hoạch môn học theo khóa đào tạo: ${error.message}`);
    }
  }

  static async copyKeHoachMonHoc(fromKhoaDaoTaoId, toKhoaDaoTaoId, heDaoTaoId) {
    try {
      // Kiểm tra khóa đào tạo nguồn có tồn tại không
      const fromKhoa = await khoa_dao_tao.findByPk(fromKhoaDaoTaoId);
      if (!fromKhoa) {
        throw new Error('Khóa đào tạo nguồn không tồn tại.');
      }

      // Kiểm tra khóa đào tạo đích có tồn tại không
      const toKhoa = await khoa_dao_tao.findByPk(toKhoaDaoTaoId);
      if (!toKhoa) {
        throw new Error('Khóa đào tạo đích không tồn tại.');
      }

      // Kiểm tra 2 khóa đào tạo có cùng hệ đào tạo không
      if (fromKhoa.he_dao_tao_id !== heDaoTaoId || toKhoa.he_dao_tao_id !== heDaoTaoId) {
        throw new Error('Hai khóa đào tạo phải cùng hệ đào tạo để có thể sao chép kế hoạch môn học.');
      }

      // Lấy toàn bộ kế hoạch môn học của khóa nguồn
      const sourceKeHoach = await ke_hoach_mon_hoc.findAll({
        where: { khoa_dao_tao_id: fromKhoaDaoTaoId },
        include: [{
          model: mon_hoc,
          as: 'mon_hoc',
          where: { he_dao_tao_id: heDaoTaoId }
        }]
      });

      if (sourceKeHoach.length === 0) {
        throw new Error('Không có kế hoạch môn học nào để sao chép từ khóa đào tạo nguồn.');
      }

      // Tạo danh sách kế hoạch môn học cho khóa đích
      const newKeHoachData = sourceKeHoach.map(keHoach => ({
        khoa_dao_tao_id: toKhoaDaoTaoId,
        mon_hoc_id: keHoach.mon_hoc_id,
        ky_hoc: keHoach.ky_hoc,
        bat_buoc: keHoach.bat_buoc
      }));

      // Kiểm tra và loại bỏ các kế hoạch môn học đã tồn tại ở khóa đích
      const existingKeHoach = await ke_hoach_mon_hoc.findAll({
        where: { khoa_dao_tao_id: toKhoaDaoTaoId },
        attributes: ['mon_hoc_id', 'ky_hoc']
      });

      const existingKeys = existingKeHoach.map(kh => `${kh.mon_hoc_id}_${kh.ky_hoc}`);
      
      const filteredKeHoachData = newKeHoachData.filter(kh => {
        const key = `${kh.mon_hoc_id}_${kh.ky_hoc}`;
        return !existingKeys.includes(key);
      });

      if (filteredKeHoachData.length === 0) {
        return {
          message: 'Tất cả kế hoạch môn học đã tồn tại ở khóa đào tạo đích.',
          copied: 0,
          skipped: newKeHoachData.length
        };
      }

      // Tạo bản sao kế hoạch môn học cho khóa đích
      const createdKeHoach = await ke_hoach_mon_hoc.bulkCreate(filteredKeHoachData);

      return {
        message: `Sao chép kế hoạch môn học thành công!`,
        copied: createdKeHoach.length,
        skipped: newKeHoachData.length - filteredKeHoachData.length,
        total: newKeHoachData.length
      };

    } catch (error) {
      throw new Error(`Lỗi khi sao chép kế hoạch môn học: ${error.message}`);
    }
  }

}

module.exports = KeHoachMonHocService;
