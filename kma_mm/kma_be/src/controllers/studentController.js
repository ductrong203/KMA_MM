const SinhVienService = require("../services/studentService");

class SinhVienController {
  static async create(req, res) {
    try {
      const sinhVien = await SinhVienService.createSinhVien(req.body);
      res.status(201).json(sinhVien);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const sinhViens = await SinhVienService.getAllSinhViens();
      res.json(sinhViens);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const sinhVien = await SinhVienService.getSinhVienById(req.params.id);
      if (!sinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json(sinhVien);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const updatedSinhVien = await SinhVienService.updateSinhVien(req.params.id, req.body);
      if (!updatedSinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json(updatedSinhVien);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deletedSinhVien = await SinhVienService.deleteSinhVien(req.params.id);
      if (!deletedSinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json({ message: "Đã xóa sinh viên" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = SinhVienController;