const express = require("express");
const UserService = require("../services/authService");
const jwtService = require("../services/jwtService");
const register = async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (confirmPassword !== password) {
      return res.status(400).json({
        status: "ERR",
        message: "The confirmPassword must match password",
      });
    }

    // Giả sử UserService.register trả về dữ liệu người dùng mới đã được tạo
    const response = await UserService.register(req.body);
    return res.status(201).json(response); // Trả về status 201 cho yêu cầu thành công khi tạo người dùng
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
};
// Login User
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "username and password is required!",
      });
    }
    const response = await UserService.loginUser(req.body);
    const { refresh_token, ...newReponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      samesite: "strict",
    });
    return res.status(200).json(newReponse);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (token == null) {
      return res.status(200).json({
        message: "token is required!",
      });
    }
    const response = await jwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json({ message: e });
  }
};

module.exports = {
  loginUser,
  refreshToken,
  register,
};
