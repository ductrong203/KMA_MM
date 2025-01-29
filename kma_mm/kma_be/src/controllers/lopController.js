const LopService = require("../services/lopService");

class LopController {
  static async create(req, res) {
    try {
      const { danh_muc_dao_tao_id } = req.body;
  
      if (!danh_muc_dao_tao_id) {
        return res.status(400).json({ message: "danh_muc_dao_tao_id là bắt buộc" });
      }
  
      const newLop = await LopService.createLop(danh_muc_dao_tao_id);
      return res.status(201).json(newLop);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const lop = await LopService.getAllLops();
      res.json(lop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const lop = await LopService.getLopById(req.params.id);
      if (!lop) return res.status(404).json({ message: "Lớp không tồn tại" });
      res.json(lop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const updatedLop = await LopService.updateLop(req.params.id, req.body);
      if (!updatedLop) return res.status(404).json({ message: "Lớp không tồn tại" });
      res.json(updatedLop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deletedLop = await LopService.deleteLop(req.params.id);
      if (!deletedLop) return res.status(404).json({ message: "Lớp không tồn tại" });
      res.json({ message: "Xóa lớp thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LopController;
