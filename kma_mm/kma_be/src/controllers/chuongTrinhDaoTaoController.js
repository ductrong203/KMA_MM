const ChuongTrinhDaoTaoService = require('../services/chuongTrinhDaoTaoService');

class ChuongTrinhDaoTaoController {
  static async createChuongTrinhDaoTao(req, res) {
    try {
      const data = req.body;
      const chuongTrinhs = await ChuongTrinhDaoTaoService.createChuongTrinhDaoTao(data);
      return res.status(201).json({
        message: 'Tạo chương trình đào tạo thành công',
        data: chuongTrinhs,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || 'Có lỗi xảy ra khi tạo chương trình đào tạo',
      });
    }
  }

  static async getChuongTrinhDaoTao(req, res) {
    try {
      const filters = req.query; // Lấy các tham số từ query string
      const result = await ChuongTrinhDaoTaoService.getChuongTrinhDaoTao(filters);
      return res.status(200).json({
        message: 'Lấy danh sách chương trình đào tạo thành công',
        data: result.data,
        pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || 'Có lỗi xảy ra khi lấy danh sách chương trình đào tạo',
      });
    }
  }
  static async updateChuongTrinhDaoTao(req, res) {
  try {
    const data = req.body;
    const chuongTrinhs = await ChuongTrinhDaoTaoService.updateChuongTrinhDaoTao(data);
    return res.status(200).json({
      message: 'Cập nhật chương trình đào tạo thành công',
      data: chuongTrinhs,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Có lỗi xảy ra khi cập nhật chương trình đào tạo',
    });
  }
}
}

module.exports = ChuongTrinhDaoTaoController;