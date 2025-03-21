const { Model } = require("sequelize");
const DanhMucKhenKyLuatService = require("../services/danhMucKhenKyLuatService");

class DanhMucKhenKyLuatController {
  static async create(req, res) {
    try {
      const DanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.createDanhMucKhenKyLuat(req.body);
      res.status(201).json(DanhMucKhenKyLuat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const danhSachDanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.getAllDanhMucKhenKyLuat();
      res.json(danhSachDanhMucKhenKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const DanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.getDanhMucKhenKyLuatById(req.params.id);
      if (!DanhMucKhenKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(DanhMucKhenKyLuat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const DanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.updateDanhMucKhenKyLuat(
          req.params.id,
          req.body
        );
      if (!DanhMucKhenKyLuat)
        return await res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json(DanhMucKhenKyLuat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const DanhMucKhenKyLuat =
        await DanhMucKhenKyLuatService.deleteDanhMucKhenKyLuat(req.params.id);
      if (!DanhMucKhenKyLuat)
        return res
          .status(404)
          .json({ message: "Khong tim thay danh muc khen thuong ky luat" });
      res.json({ message: "Da xoa danh muc khen thuong ky luat" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = DanhMucKhenKyLuatController;
