const DiemService = require('../services/diemService');

class DiemController {
  static async getAll(req, res) {
    try {
      const result = await DiemService.getAll(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByPage(req, res) {
    try {
      const result = await DiemService.getByPage(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const result = await DiemService.getById(req.params.id);
      if (!result) return res.status(404).json({ error: 'Không tìm thấy điểm!' });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const result = await DiemService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const result = await DiemService.update(req.params.id, req.body);
      res.json(result);
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
}

module.exports = DiemController;
