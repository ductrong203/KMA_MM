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

  static async getAllPhanTrang(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await SinhVienService.getAllSinhVienPhanTrang(
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByLopId(req, res) {
    try {
      const { lop_id } = req.params;
      const students = await SinhVienService.getStudentsByLopId(lop_id);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByDoiTuongId(req, res) {
    try {
      const { doi_tuong_id } = req.params;
      const students = await SinhVienService.getStudentsByDoiTuongId(doi_tuong_id);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
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

  static async timSinhVienTheoMaHoacFilter(req, res) {
    try {
      const filters = req.query; // Lấy tất cả query params
      console.log(filters)
      const sinhVienList = await SinhVienService.timSinhVienTheoMaHoacFilter(filters);

      res.status(200).json({
        success: true,
        data: sinhVienList,
      });
    } catch (error) {
      console.error('Error in timSinhVienTheoMaHoacFilter:', error);
      res.status(error.message === 'Không tìm thấy sinh viên phù hợp' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = SinhVienController;