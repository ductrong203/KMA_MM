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
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const data = await ThoiKhoaBieuService.getByPage(page, pageSize);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await ThoiKhoaBieuService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await ThoiKhoaBieuService.update(req.params.id, req.body);
      res.json(data);
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
}

module.exports = ThoiKhoaBieuController;
