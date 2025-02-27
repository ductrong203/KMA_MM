const { Model } = require("sequelize");
const KhenThuongKyLuatService = require("../services/khenThuongKyLuatService");

class KhenThuongKyLuatController {
  static async create(req, res) {
    try {
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.createKhenThuongKyLuat(req.body);
      res.status(201).json(KhenThuongKyLuat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const danhSachKhenThuongKyLuat =
        await KhenThuongKyLuatService.getAllKhenThuongKyLuat();
      res.json(danhSachKhenThuongKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.getKhenThuongKyLuatById(req.params.id);
      if (!KhenThuongKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(KhenThuongKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.updateKhenThuongKyLuat(
          req.params.id,
          req.body
        );
      if (!KhenThuongKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(KhenThuongKyLuat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const KhenThuongKyLuat =
        await KhenThuongKyLuatService.deleteKhenThuongKyLuat(req.params.id);
      if (!KhenThuongKyLuat)
        return res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json({ message: "Da xoa danh muc khen thuong ky luat" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = KhenThuongKyLuatController;
