const DiemService = require('../services/diemService');

class DiemController {
  static async filter(req, res) {
    try {
      const data = await DiemService.filter(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await DiemService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Không tìm thấy điểm.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await DiemService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createDiemForClass(req, res) {
    try {
      const { thoi_khoa_bieu_id } = req.body;
      if (!thoi_khoa_bieu_id) {
        return res.status(400).json({ message: "Thiếu thoi_khoa_bieu_id!" });
      }

      const result = await DiemService.createDiemForClass(thoi_khoa_bieu_id);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await DiemService.update(req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }


  static async delete(req, res) {
    try {
      const result = await DiemService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async importExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });
      }
      const result = await DiemService.importExcel(req.file.path);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async importExcelCuoiKy(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });
      }
      const result = await DiemService.importExcelCuoiKy(req.file.path);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = DiemController;