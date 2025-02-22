const { Model } = require("sequelize")
const DoiTuongQuanLyService = require("../services/doiTuongQuanLyService")

class DoiTuongQuanLyController{
    static async create(req, res){
        try {
            const doiTuongQuanLy = await DoiTuongQuanLyService.createDoiTuongQuanLy(req.body);
            res.status(201).json(doiTuongQuanLy);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getAll(req, res){
        try {
            const danhSachDoiTuongQuanLy = await DoiTuongQuanLyService.getAllDoiTuongQuanLy();
            res.json(danhSachDoiTuongQuanLy);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req, res){
        try {
            const doiTuongQuanLy = await DoiTuongQuanLyService.getDoiTuongQuanLyById(req.params.id);
            if(!doiTuongQuanLy) return await res.status(404).json({ message: "Khong tim thay doi tuong quan ly"});
            res.json(doiTuongQuanLy);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const doiTuongQuanLy = await DoiTuongQuanLyService.updateDoiTuongQuanLy(req.params.id, req.body);
            if(!doiTuongQuanLy) return await res.status(404).json({ message: "Khong tim thay doi tuong quan ly"});
            res.json(doiTuongQuanLy);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const doiTuongQuanLy = await DoiTuongQuanLyService.deleteDoiTuongQuanLy(req.params.id);
            if (!doiTuongQuanLy) return res.status(404).json({ message: "Khong tim thay doi tuong quan ly" });
            res.json({ message: "Da xoa doi tuong quan ly" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
module.exports = DoiTuongQuanLyController;