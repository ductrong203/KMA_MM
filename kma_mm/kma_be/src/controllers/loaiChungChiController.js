const LoaiChungChiService = require('../services/loaiChungChiService');

class LoaiChungChiController {
  /**
   * Lấy danh sách loại chứng chỉ
   * GET /api/loai-chung-chi
   */
  static async layDanhSachLoaiChungChi(req, res) {
    try {
      const { tinh_trang } = req.query;
      
      const result = await LoaiChungChiService.layDanhSachLoaiChungChi(tinh_trang);
      
      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách loại chứng chỉ thành công',
        ...result,
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách loại chứng chỉ:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * Lấy chi tiết loại chứng chỉ theo ID
   * GET /api/loai-chung-chi/:id
   */
  static async layChiTietLoaiChungChi(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID loại chứng chỉ không hợp lệ',
          data: null,
        });
      }

      const result = await LoaiChungChiService.layChiTietLoaiChungChi(parseInt(id));
      
      return res.status(200).json({
        success: true,
        message: 'Lấy chi tiết loại chứng chỉ thành công',
        ...result,
      });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết loại chứng chỉ:', error);
      const statusCode = error.message.includes('không tồn tại') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * Tạo loại chứng chỉ mới
   * POST /api/loai-chung-chi
   */
  static async taoLoaiChungChi(req, res) {
    try {
      const data = req.body;
      
      const result = await LoaiChungChiService.taoLoaiChungChi(data);
      
      return res.status(201).json({
        success: true,
        message: 'Tạo loại chứng chỉ thành công',
        ...result,
      });
    } catch (error) {
      console.error('Lỗi khi tạo loại chứng chỉ:', error);
      const statusCode = error.message.includes('đã tồn tại') ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * Cập nhật loại chứng chỉ
   * PUT /api/loai-chung-chi/:id
   */
  static async capNhatLoaiChungChi(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID loại chứng chỉ không hợp lệ',
          data: null,
        });
      }

      const result = await LoaiChungChiService.capNhatLoaiChungChi(parseInt(id), data);
      
      return res.status(200).json({
        success: true,
        message: 'Cập nhật loại chứng chỉ thành công',
        ...result,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật loại chứng chỉ:', error);
      let statusCode = 500;
      if (error.message.includes('không tồn tại')) {
        statusCode = 404;
      } else if (error.message.includes('đã tồn tại')) {
        statusCode = 409;
      }
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * Xóa loại chứng chỉ
   * DELETE /api/loai-chung-chi/:id
   */
  static async xoaLoaiChungChi(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID loại chứng chỉ không hợp lệ',
          data: null,
        });
      }

      const result = await LoaiChungChiService.xoaLoaiChungChi(parseInt(id));
      
      return res.status(200).json({
        success: true,
        message: 'Xóa loại chứng chỉ thành công',
        ...result,
      });
    } catch (error) {
      console.error('Lỗi khi xóa loại chứng chỉ:', error);
      let statusCode = 500;
      if (error.message.includes('không tồn tại')) {
        statusCode = 404;
      } else if (error.message.includes('đang có chứng chỉ sử dụng')) {
        statusCode = 409;
      }
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * Tìm kiếm loại chứng chỉ
   * GET /api/loai-chung-chi/tim-kiem
   */
  static async timKiemLoaiChungChi(req, res) {
    try {
      const { tu_khoa } = req.query;
      
      if (!tu_khoa) {
        return res.status(400).json({
          success: false,
          message: 'Từ khóa tìm kiếm là bắt buộc',
          data: null,
        });
      }

      const result = await LoaiChungChiService.timKiemLoaiChungChi(tu_khoa);
      
      return res.status(200).json({
        success: true,
        message: 'Tìm kiếm loại chứng chỉ thành công',
        ...result,
      });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm loại chứng chỉ:', error);
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  /**
   * Thay đổi trạng thái loại chứng chỉ
   * PATCH /api/loai-chung-chi/:id/trang-thai
   */
  static async thayDoiTrangThaiLoaiChungChi(req, res) {
    try {
      const { id } = req.params;
      const { tinh_trang } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID loại chứng chỉ không hợp lệ',
          data: null,
        });
      }

      const result = await LoaiChungChiService.thayDoiTrangThaiLoaiChungChi(parseInt(id), tinh_trang);
      
      return res.status(200).json({
        success: true,
        message: 'Thay đổi trạng thái loại chứng chỉ thành công',
        ...result,
      });
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái loại chứng chỉ:', error);
      const statusCode = error.message.includes('không tồn tại') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
}

module.exports = LoaiChungChiController;
