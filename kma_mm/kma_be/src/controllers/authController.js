const express = require("express");
const UserService = require("../services/authService");
const jwtService = require("../services/jwtService");
const register = async (req, res) => {
  try {
    const { username, password, confirmPassword, ho_ten } = req.body;

    if (!username || !password || !confirmPassword || !ho_ten) {
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
const deleteUser = async (req, res) => {
  try {
    const idUser = req.params.id;
    if (!idUser) {
      return res.status(200).json({
        status: "ERR",
        message: "Users ID is required!",
      });
    }
    const reponse = await UserService.deleteUser(idUser);
    return res.status(200).json(reponse);
  } catch (error) {
    return res.status(404).json({ message: e });
  }
};
const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: e });
  }
};
const getDetailUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(200)
        .json({ status: "ERR", message: "User ID is required!" });
    }
    const response = await UserService.getDetailUser(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: e });
  }
};
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      res.status(202).json({
        status: "ERR",
        message: "Users ID is required!",
      });
    }
    const reponse = await UserService.updateUser(id, data);
    return res.status(200).json(reponse);
  } catch (error) {
    return res.status(404).json({ message: e });
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
const changePassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (!id) {
      return res.status(400).json({
        status: "ERR",
        message: "User ID is required!",
      });
    }
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        status: "ERR",
        message:
          " oldPassword,newPassword and confirmNewPassword are required!",
      });
    } else if (confirmNewPassword !== newPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "The confirmNewPassword must match password",
      });
    }
    const response = await UserService.changePassword(
      id,
      oldPassword,
      newPassword
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Something went wrong!",
    });
  }
};

module.exports = {
  loginUser,
  refreshToken,
  register,
  getAllUser,
  getDetailUser,
  deleteUser,
  updateUser,
  changePassword,
};
