const KhoaDaoTaoService = require("../services/khoaDaoTaoService");

class KhoaDaoTaoController {
  static async create(req, res) {
    try {
      const khoaDaoTao = await KhoaDaoTaoService.createKhoaDaoTao(req.body);
      res.status(201).json(khoaDaoTao);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const khoaList = await KhoaDaoTaoService.getAllKhoaDaoTao();
      res.json(khoaList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const khoa = await KhoaDaoTaoService.getKhoaDaoTaoById(id);
      if (!khoa) return res.status(404).json({ error: "Không tìm thấy khoá đào tạo" });
      res.json(khoa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getKhoaDaoTaoByDanhMuc(req, res) {
    const { danhmucdaotaoid } = req.params;
    try {
      const khoaDaoTaoList = await KhoaDaoTaoService.getKhoaDaoTaoByDanhMucId(danhmucdaotaoid);
      if (khoaDaoTaoList.length === 0) {
        return res.status(404).json({ message: 'Không có khóa đào tạo nào cho danh mục này' });
      }
      res.status(200).json(khoaDaoTaoList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedKhoa = await KhoaDaoTaoService.updateKhoaDaoTao(id, req.body);
      res.json(updatedKhoa);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await KhoaDaoTaoService.deleteKhoaDaoTao(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = KhoaDaoTaoController;