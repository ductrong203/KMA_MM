const ThoiKhoaBieuService = require('../services/thoiKhoaBieuService');

class ThoiKhoaBieuController {
  static async getAll(req, res) {
    try {
      const data = await ThoiKhoaBieuService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await ThoiKhoaBieuService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Không tìm thấy thời khóa biểu.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByPage(req, res) {
    try {
      const data = await ThoiKhoaBieuService.getByPage(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async filter(req, res) {
    try {
      const data = await ThoiKhoaBieuService.filter(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async filterbyid(req, res) {
    try {
      const data = await ThoiKhoaBieuService.filterbyid(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const result = await ThoiKhoaBieuService.create(req.body);

      if (result.skipped) {
        return res.status(200).json({
          message: result.message,
          data: null,
          skipped: true
        });
      }

      res.status(201).json({
        message: "Tạo thời khoá biểu thành công ",
        data: result.data
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createAll(req, res) {
    try {
      const data = await ThoiKhoaBieuService.createAll(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await ThoiKhoaBieuService.update(req.params.id, req.body);
      res.json(
        {
          message: "Cập nhật thời khoá biểu thành công  ",
          data
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await ThoiKhoaBieuService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Lấy danh sách môn học có trong TKB nhưng chưa có trong KHMH
   */
  static async getMissingMonHocInKeHoach(req, res) {
    try {
      const { khoa_dao_tao_id, ky_hoc } = req.params;

      if (!khoa_dao_tao_id) {
        return res.status(400).json({ error: 'Thiếu khoa_dao_tao_id' });
      }

      const result = await ThoiKhoaBieuService.getMissingMonHocInKeHoach(
        parseInt(khoa_dao_tao_id),
        ky_hoc ? parseInt(ky_hoc) : null
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ThoiKhoaBieuController;
