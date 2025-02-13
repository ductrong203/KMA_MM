const express = require("express");
const trainingService = require("../services/trainingService");

const createTraining = async (req, res) => {
try {
    const { code, name } = req.body;

    if (!code || !name ) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    }
    if (code.length >5) {
        return res.status(400).json({
          status: "ERR",
          message: "code must less than 5 letters",
        });
      }
    // Giả sử UserService.register trả về dữ liệu người dùng mới đã được tạo
    const response = await trainingService.createTraining(req.body);
    return res.status(201).json(response); // Trả về status 201 cho yêu cầu thành công khi tạo người dùng
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}

module.exports = {
    createTraining
  };
  