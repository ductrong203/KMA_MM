const ThongTinQuanNhanService = require("../services/thongTinQuanNhanService");

class ThongTinQuanNhanController {
  static async create(req, res) {
    try {
      const thongTin = await ThongTinQuanNhanService.createThongTin(req.body);
      return res.status(201).json(thongTin);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const data = await ThongTinQuanNhanService.getAllThongTin();
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const thongTin = await ThongTinQuanNhanService.getThongTinById(id);
      if (!thongTin) {
        return res.status(404).json({ error: "Không tìm thấy thông tin quân nhân" });
      }
      return res.json(thongTin);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getByIdSinhVien(req, res) {
    try {
      const { id } = req.params;
      const thongTin = await ThongTinQuanNhanService.getThongTinByIdSinhVien(id);
      if (!thongTin) {
        return res.status(404).json({ error: "Không tìm thấy thông tin quân nhân" });
      }
      return res.json(thongTin);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await ThongTinQuanNhanService.updateThongTin(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy thông tin quân nhân" });
      }
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateByIdSinhVien(req, res) {
    try {
      const { id } = req.params;
      const updated = await ThongTinQuanNhanService.updateThongTinByIdSinhVien(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy thông tin quân nhân" });
      }
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ThongTinQuanNhanService.deleteThongTin(id);
      if (!deleted) {
        return res.status(404).json({ error: "Không tìm thấy thông tin quân nhân" });
      }
      return res.json({ message: "Xóa thành công" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ThongTinQuanNhanController;
