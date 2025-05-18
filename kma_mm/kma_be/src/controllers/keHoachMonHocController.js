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

  static async getByKhoaDaoTaoAndKyHoc(req, res) {
    try {
      const { khoa_dao_tao_id, ky_hoc } = req.params;

      if (!khoa_dao_tao_id) {
        return res.status(400).json({ message: "Thiếu khoa_dao_tao_id" });
      }
      
      const data = await KeHoachMonHocService.getByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getMonHocByKhoaDaoTaoAndKyHoc(req, res) {
    try {
      const { khoa_dao_tao_id, ky_hoc } = req.body;

      if (!khoa_dao_tao_id || !ky_hoc) {
        return res.status(400).json({ message: "Thiếu khoa_dao_tao_id hoặc ky_hoc" });
      }

      const monHocList = await KeHoachMonHocService.getMonHocByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
      return res.json(monHocList);
    } catch (error) {
      return res.status(500).json({ message: error.message });
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

  static async getMHByKhoaDaoTaoAndKyHoc(req, res) {
    try {
      const { khoa_dao_tao_id, ky_hoc } = req.body;

      if (!khoa_dao_tao_id || !ky_hoc) {
        return res.status(400).json({ message: "Thiếu khoa_dao_tao_id hoặc ky_hoc" });
      }

      const data = await KeHoachMonHocService.getMHByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}



module.exports = KeHoachMonHocController;
