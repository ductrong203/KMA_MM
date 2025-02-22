const express = require("express");
const phongBanService = require("../services/phongBanService");

const createPhongBan = async (req, res) => {
try {
    const { code, name } = req.body;

    if (!code || !name ) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    }
    
    const response = await phongBanService.createPhongBan(req.body);
    return res.status(201).json(response); 
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}
const getPhongBan = async (req, res) => {
  try {
      const response = await phongBanService.getPhongBan();
      return res.status(201).json(response); 
    } catch (e) {
      return res.status(500).json({
        message: e.message || "Server error",
      });
    }
  }

  const updatePhongBan = async (req, res) => {
    try {
        const response = await phongBanService.updatePhongBan(req.params.code, req.body);
        return res.status(201).json(response); 
      } catch (e) {
        return res.status(500).json({
          message: e.message || "Server error",
        });
      }
    }
module.exports = {
    createPhongBan,
    getPhongBan,
    updatePhongBan
  };
  