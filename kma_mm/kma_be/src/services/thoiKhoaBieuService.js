const { thoi_khoa_bieu, lop, mon_hoc } = require('../models');
const KeHoachMonHocService = require('./keHoachMonHocService');

class ThoiKhoaBieuService {
  static async getAll() {
    return await thoi_khoa_bieu.findAll();
  }

  static async getById(id) {
    return await thoi_khoa_bieu.findByPk(id);
  }

  static async getByPage({page = 1, pageSize = 10}) {
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const { count, rows } = await thoi_khoa_bieu.findAndCountAll({
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']]
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
      data: rows
    };
  }

  static async filter({ ky_hoc, ma_mon_hoc, ma_lop, page = 1, pageSize = 10 }) {
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const whereClause = {};  

    if (ma_lop) {
      const foundLop = await lop.findOne({ where: { ma_lop } });
      if (foundLop) {
          whereClause.lop_id = foundLop.id;
      } else {
          return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
      }
    }

    if (ma_mon_hoc) {
        const monHoc = await mon_hoc.findOne({ where: { ma_mon_hoc } });
        if (monHoc) {
            whereClause.mon_hoc_id = monHoc.id; 
        } else {
            return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
        }
    }

    if (ky_hoc) {
        whereClause.ky_hoc = ky_hoc; 
    }

    const { count, rows } = await thoi_khoa_bieu.findAndCountAll({
        where: whereClause, 
        limit: pageSize,
        offset: offset,
        order: [['id', 'DESC']]
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize: pageSize,
        data: rows
    };
  }

  static async filterbyid({ ky_hoc, lop_id, mon_hoc_id, page = 1, pageSize = 10 }) {
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const whereClause = {};

    if (lop_id) {
        whereClause.lop_id = lop_id;
    }

    if (mon_hoc_id) {
        whereClause.mon_hoc_id = mon_hoc_id;
    }

    if (ky_hoc) {
        whereClause.ky_hoc = ky_hoc;
    }

    const { count, rows } = await thoi_khoa_bieu.findAndCountAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: [['id', 'DESC']]
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize: pageSize,
        data: rows
    };
  }

  static async create(data) {
    const { lop_id, mon_hoc_id, giang_vien, phong_hoc, tiet_hoc, trang_thai, ky_hoc } = data;

    const lopExist = await lop.findByPk(lop_id);
    if (!lopExist) throw new Error('Lớp không tồn tại.');

    const monHocExist = await mon_hoc.findByPk(mon_hoc_id);
    if (!monHocExist) throw new Error('Môn học không tồn tại.');

    const existingTKB = await thoi_khoa_bieu.findOne({
      where: { lop_id, mon_hoc_id, ky_hoc },
    });
    if (existingTKB) {
      throw new Error('Thời khóa biểu đã tồn tại cho lớp, môn học, kỳ học này.');
    }

    return await thoi_khoa_bieu.create({ lop_id, mon_hoc_id, giang_vien, phong_hoc, tiet_hoc, trang_thai, ky_hoc });
  }

  static async createAll({ lop_id, giang_vien, phong_hoc, tiet_hoc, trang_thai, ky_hoc, khoa_dao_tao_id }) {
    try {
      // Kiểm tra các trường bắt buộc
      if (!lop_id || !ky_hoc || !khoa_dao_tao_id) {
        throw new Error('Thiếu thông tin bắt buộc: lop_id, ky_hoc hoặc khoa_dao_tao_id.');
      }
  
      // Kiểm tra lớp tồn tại
      const lopExist = await lop.findByPk(lop_id);
      if (!lopExist) throw new Error('Lớp không tồn tại.');
  
      // Lấy danh sách môn học từ kế hoạch môn học
      const danhSachMonHoc = await KeHoachMonHocService.getMonHocByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
      if (!danhSachMonHoc || danhSachMonHoc.length === 0) {
        throw new Error('Không tìm thấy môn học phù hợp với kế hoạch.');
      }
  
      // Tạo thời khóa biểu cho từng môn, bỏ qua môn đã tồn tại
      const results = await Promise.all(
        danhSachMonHoc.map(async (mon) => {
          try {
            // Kiểm tra môn học đã tồn tại trong thời khóa biểu
            const existingTKB = await thoi_khoa_bieu.findOne({
              where: { lop_id, mon_hoc_id: mon.id, ky_hoc, tiet_hoc },
            });
  
            if (existingTKB) {
              return {
                mon_hoc_id: mon.id,
                status: 'skipped',
                message: `Thời khóa biểu đã tồn tại cho môn học id ${mon.id}, lớp học id ${lop_id} trong kỳ học ${ky_hoc}.`,
              };
            }
  
            // Tạo thời khóa biểu
            const newTKB = await thoi_khoa_bieu.create({
              lop_id,
              mon_hoc_id: mon.id,
              giang_vien,
              phong_hoc,
              tiet_hoc,
              trang_thai: trang_thai || '1', // Giá trị mặc định
              ky_hoc,
            });
  
            return {
              mon_hoc_id: mon.id,
              status: 'created',
              data: newTKB,
            };
          } catch (error) {
            return {
              mon_hoc_id: mon.id,
              status: 'error',
              message: `Lỗi khi tạo thời khóa biểu cho môn học ${mon.id}: ${error.message}`,
            };
          }
        })
      );
  
      // Tách kết quả để báo cáo
      const created = results.filter((r) => r.status === 'created').map((r) => r.data);
      const skipped = results.filter((r) => r.status === 'skipped');
      const errors = results.filter((r) => r.status === 'error');
  
      // Nếu có lỗi, trả về thông tin chi tiết
      if (errors.length > 0) {
        throw new Error(
          `Tạo thời khóa biểu hoàn tất với ${created.length} thành công, ${skipped.length} bị bỏ qua, ${errors.length} lỗi. Chi tiết lỗi: ${errors.map((e) => e.message).join('; ')}`
        );
      }
  
      return {
        created,
        skipped,
        message: `Tạo thời khóa biểu hoàn tất: ${created.length} thành công, ${skipped.length} bị bỏ qua.`,
      };
    } catch (error) {
      throw new Error(`Lỗi khi tạo thời khóa biểu hàng loạt: ${error.message}`);
    }
  }

  static async update(id, data) {
    const record = await thoi_khoa_bieu.findByPk(id);
    if (!record) throw new Error('Thời khóa biểu không tồn tại.');

    return await record.update(data);
  }

  static async delete(id) {
    const record = await thoi_khoa_bieu.findByPk(id);
    if (!record) throw new Error('Thời khóa biểu không tồn tại.');

    await record.destroy();
    return { message: 'Xóa thành công!' };
  }
}

module.exports = ThoiKhoaBieuService;
