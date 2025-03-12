const KeHoachMonHocService = require('../services/keHoachMonHocService');

class KeHoachMonHocController {
  static async getAll(req, res) {
    try {
      const data = await KeHoachMonHocService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await KeHoachMonHocService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Không tìm thấy kế hoạch môn học.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await KeHoachMonHocService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await KeHoachMonHocService.update(req.params.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await KeHoachMonHocService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = KeHoachMonHocController;
