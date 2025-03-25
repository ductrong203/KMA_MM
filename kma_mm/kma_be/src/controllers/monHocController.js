const express = require("express");
const monHocService = require("../services/monHocService");

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
        const response = await monHocService.updateMonHoc(req.params.ma_mon_hoc, req.body);
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
