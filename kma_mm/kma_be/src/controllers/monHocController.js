const express = require("express");
const monHocService = require("../services/monHocService");
const { mon_hoc, danh_muc_dao_tao } = require("../models");

const {logActivity} = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const {users} = require("../models");
const {getDiffData} = require("../utils/getDiffData");
const { verifyAccessToken } = require("../utils/decodedToken");
const { text } = require("body-parser");
const mapRole = {
        1: "daoTao",
        2: "khaoThi",
        3: "quanLiSinhVien",
        5: "giamDoc",
        6: "sinhVien",
        7: "admin"

      }

const createMonHoc = async (req, res) => {
    try {
        console.log(req.body);
        const { ma_mon_hoc, ten_mon_hoc, so_tin_chi, tinh_diem, ghi_chu } = req.body;

        // Kiểm tra các trường bắt buộc
        const missingFields = [];

        if (!ma_mon_hoc) missingFields.push('ma_mon_hoc');
        if (!ten_mon_hoc) missingFields.push('ten_mon_hoc');
        if (!so_tin_chi) missingFields.push('so_tin_chi');
        if (!tinh_diem) missingFields.push('tinh_diem');

        // Nếu thiếu trường nào, trả về thông báo lỗi
        if (missingFields.length > 0) {
            console.error(`Missing required fields: ${missingFields.join(', ')}`);
            return res.status(400).json({
                status: "ERR",
                message: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }

        console.log('Processing create monHoc...');
        const response = await monHocService.createMonHoc(req.body);
        const token = req.headers.authorization?.split(" ")[1];
    console.log(response.data);
    let user = verifyAccessToken(token);
    let userN  = await  getFieldById("users", user.id, "username");
    let  userR = await  getFieldById("users", user.id, "role");
    let maHeDaoTao = await  getFieldById("danh_muc_dao_tao", response.data[0].he_dao_tao_id, "ma_he_dao_tao");
      if (response) {
      let inforActivity = {
        username:   userN,
        role: mapRole[userR],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN}  đã tạo thành công môn học ${response.data[0].ten_mon_hoc} thuộc mã hệ đào tạo ${maHeDaoTao} `,
        response_status: 200,
        resData: "Tạo môn học thành công",
        ip:  req._remoteAddress,

      }
        await logActivity(inforActivity);
      }


        return res.status(201).json(response);
    } catch (e) {
        console.error("Error creating mon hoc:", e);
        return res.status(500).json({
            message: e.message || "Server error",
        });
    }
};


const getMonHoc = async (req, res) => {
    try {
        const response = await monHocService.getMonHoc();
        return res.status(201).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e.message || "Server error",
        });
    }
}

const getMonHocByIds = async (req, res) => {
    try {
        const { ids } = req.query; // Lấy param 'ids' từ query string
        if (!ids) {
            return res.status(400).json({
                status: "ERROR",
                message: "Vui lòng cung cấp danh sách ID"
            });
        }

        const result = await monHocService.getMonHocByIds(ids);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
            status: "ERROR",
            message: error.message
        });
    }
}

const updateMonHoc = async (req, res) => {
    try {
        console.log(req.params.ma_mon_hoc)
        console.log(req.body);
        const oldData =  await mon_hoc.findOne({
            where: { id: req.params.ma_mon_hoc },
            attributes: ["id","ma_mon_hoc","ten_mon_hoc","so_tin_chi","tinh_diem","trang_thai","ghi_chu"],
            
        });
        const response = await monHocService.updateMonHoc(req.params.ma_mon_hoc, req.body);
          const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
            const newData =  await mon_hoc.findOne({
            where: { id: req.params.ma_mon_hoc },
            attributes: ["id","ma_mon_hoc","ten_mon_hoc","so_tin_chi","tinh_diem","trang_thai","ghi_chu"],
        });
        console.log(newData)
              if (response) {
              
              if (req.body.curriculumIds.length>0) {
                    let heDaoTaosPromise = req.body.curriculumIds.map(async (he_dao_tao_id) => {
                        let temp = await  getFieldById("danh_muc_dao_tao", he_dao_tao_id, "ma_he_dao_tao");
                        return temp;
                    })
                    let heDaoTaoNames = await Promise.all(heDaoTaosPromise);
                    let heDaoTaos = heDaoTaoNames.join(" , ");
                    console.log("####", heDaoTaos);
                    var temp = await heDaoTaos.length > 0 ?  ` các mã hệ đào tạo mới gồm ${heDaoTaos}` : "";
              }
              let inforActivity = { 
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `${getDiffData(oldData.dataValues, newData.dataValues) === null ? "" : getDiffData(oldData.dataValues, newData.dataValues)}  ${temp}`,
                response_status: 200,
                resData: `Người dùng ${userN} đã cập nhật môn học có id ${newData.id} là  thành công`,
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
        
        return res.status(201).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e.message || "Server error",
        });
    }
}

const getTrainingById = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra input
        if (!id) {
            return res.status(400).json({
                status: "ERR",
                message: "Training id is required",
            });
        }

        // Giả sử service có hàm findById hoặc dùng findOne
        const training = await monHocService.fetchSubjectsByTrainingId(id);

        // Kiểm tra nếu không tìm thấy
        if (!training) {
            return res.status(404).json({
                status: "ERR",
                message: "Training system not found",
            });
        }

        return res.status(200).json({
            status: "OK",
            message: "Success",
            data: training
        }); // 200: OK cho việc lấy dữ liệu
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Internal server error",
        });
    }
}
module.exports = {
    createMonHoc,
    getMonHoc,
    updateMonHoc,
    getMonHocByIds,
    getTrainingById
};
