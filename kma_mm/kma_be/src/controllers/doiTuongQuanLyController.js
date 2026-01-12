const { Model } = require("sequelize");
const DoiTuongQuanLyService = require("../services/doiTuongQuanLyService");
const { doi_tuong_quan_ly } = require("../models");


const { logActivity } = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const { users } = require("../models");
const { getDiffData } = require("../utils/getDiffData");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
    1: "daoTao",
    2: "khaoThi",
    3: "quanLiSinhVien",
    5: "giamDoc",
    6: "sinhVien",
    7: "admin"

}


class DoiTuongQuanLyController {
    static async create(req, res) {
        try {
            const doiTuongQuanLy = await DoiTuongQuanLyService.createDoiTuongQuanLy(req.body);
            try {
                const token = req.headers.authorization?.split(" ")[1];
                // console.log(token);
                let user = verifyAccessToken(token);
                let userN = await getFieldById("users", user.id, "username");
                let userR = await getFieldById("users", user.id, "role");
                if (doiTuongQuanLy) {
                    let inforActivity = {
                        username: userN,
                        role: mapRole[userR],
                        action: req.method,
                        endpoint: req.originalUrl,
                        reqData: `Người dùng ${userN}  đã tạo thành công đối tượng quản lí  ${doiTuongQuanLy.ten_doi_tuong} `,
                        response_status: 200,
                        resData: "Tạo đối tượng quản lí thành công",
                        ip: req._remoteAddress,

                    }
                    await logActivity(inforActivity);
                }


            } catch (error) {
                console.error("lỗi rồi kìa ní ơi: ", error.message);
            }
            res.status(201).json(
                {
                    message: "Tạo đối tượng quản lý thành công ",
                    data: doiTuongQuanLy
                });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const danhSachDoiTuongQuanLy = await DoiTuongQuanLyService.getAllDoiTuongQuanLy();
            res.json(danhSachDoiTuongQuanLy);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const doiTuongQuanLy = await DoiTuongQuanLyService.getDoiTuongQuanLyById(req.params.id);
            if (!doiTuongQuanLy) return await res.status(404).json({ message: "Khong tim thay doi tuong quan ly" });
            res.json(doiTuongQuanLy);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const oldData = await doi_tuong_quan_ly.findByPk(req.params.id);
            const doiTuongQuanLy = await DoiTuongQuanLyService.updateDoiTuongQuanLy(req.params.id, req.body);
            try {

                const tenDoiTuong = await getFieldById("doi_tuong_quan_ly", req.params.id, "ten_doi_tuong");
                const token = req.headers.authorization?.split(" ")[1];
                // console.log(token);
                let user = verifyAccessToken(token);
                let userN = await getFieldById("users", user.id, "username");
                let userR = await getFieldById("users", user.id, "role");
                if (tenDoiTuong) {
                    const newData = await doi_tuong_quan_ly.findByPk(req.params.id);
                    let inforActivity = {
                        username: userN,
                        role: mapRole[userR],
                        action: req.method,
                        endpoint: req.originalUrl,
                        reqData: getDiffData(oldData.dataValues, newData.dataValues),
                        response_status: 200,
                        resData: `Người dùng ${userN} đã cập nhật đối tượng quản lý ${tenDoiTuong} thành công`,
                        ip: req._remoteAddress,

                    }
                    await logActivity(inforActivity);
                }


            } catch (error) {
                console.error("lỗi rồi ní ơi: ", error.message);
            }
            if (!doiTuongQuanLy) return await res.status(404).json({ message: "Khong tim thay doi tuong quan ly" });
            res.json(
                {
                    messsage: "Cập nhật đối tượng quản lý thành công ",
                    data: doiTuongQuanLy
                });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const tenDoiTuong = await getFieldById("doi_tuong_quan_ly", req.params.id, "ten_doi_tuong");
            const doiTuongQuanLy = await DoiTuongQuanLyService.deleteDoiTuongQuanLy(req.params.id);
            try {
                const token = req.headers.authorization?.split(" ")[1];
                // console.log(token);
                let user = verifyAccessToken(token);
                let userN = await getFieldById("users", user.id, "username");
                let userR = await getFieldById("users", user.id, "role");
                if (doiTuongQuanLy) {
                    let inforActivity = {
                        username: userN,
                        role: mapRole[userR],
                        action: req.method,
                        endpoint: req.originalUrl,
                        reqData: `Người dùng ${userN}  đã xóa thành công đối tượng quản lí ${tenDoiTuong} `,
                        response_status: 200,
                        resData: "Đã xóa đối tượng quản lí thành công",
                        ip: req._remoteAddress,

                    }
                    await logActivity(inforActivity);
                }

            } catch (error) {
                console.error("lỗi rồi ní ơi: ", error.message);
            }
            if (!doiTuongQuanLy) return res.status(404).json({ message: "Khong tim thay doi tuong quan ly" });
            res.json({ message: "Da xoa doi tuong quan ly" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
module.exports = DoiTuongQuanLyController;
