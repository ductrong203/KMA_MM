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

  static async getAllByKhoaDaoTao(req, res) {
    try {
      const { khoa_dao_tao_id } = req.params;

      if (!khoa_dao_tao_id) {
        return res.status(400).json({ 
          success: false,
          message: "Thiếu khoa_dao_tao_id" 
        });
      }

      const data = await KeHoachMonHocService.getAllByKhoaDaoTao(khoa_dao_tao_id);
      
      return res.json({
        success: true,
        data: data,
        total: data.length
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  static async copyKeHoachMonHoc(req, res) {
    try {
      const { fromKhoaDaoTaoId, toKhoaDaoTaoId, heDaoTaoId } = req.body;

      // Validation input
      if (!fromKhoaDaoTaoId || !toKhoaDaoTaoId || !heDaoTaoId) {
        return res.status(400).json({ 
          error: "Thiếu thông tin bắt buộc: fromKhoaDaoTaoId, toKhoaDaoTaoId, heDaoTaoId" 
        });
      }

      // Kiểm tra không được sao chép từ chính nó
      if (fromKhoaDaoTaoId === toKhoaDaoTaoId) {
        return res.status(400).json({ 
          error: "Không thể sao chép kế hoạch môn học từ chính khóa đào tạo đó" 
        });
      }

      const result = await KeHoachMonHocService.copyKeHoachMonHoc(
        fromKhoaDaoTaoId, 
        toKhoaDaoTaoId, 
        heDaoTaoId
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}

module.exports = KeHoachMonHocController;
