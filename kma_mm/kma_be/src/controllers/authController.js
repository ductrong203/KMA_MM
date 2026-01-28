const UserService = require("../services/authService");
const jwtService = require("../services/jwtService");
const { logActivity } = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const { users } = require("../models");
const { getDiffData } = require("../utils/getDiffData");
const mapRole = {
  1: "daoTao",
  2: "khaoThi",
  3: "quanLiSinhVien",
  5: "giamDoc",
  6: "sinhVien",
  7: "admin",
  8: "duyetDiem"
}
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
        message: "The confirmPassword must match 1password",
      });
    }
    // Giả sử UserService.register trả về dữ liệu người dùng mới đã được tạo
    const response = await UserService.register(req.body);

    console.log("res#######", req);
    let userN = await getFieldById("users", req.user.id, "username");
    if (response) {
      let inforActivity = {
        username: userN,
        role: mapRole[req.user.role],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN} đã tạo tài khoản ${username} cho hệ ${mapRole[response?.data?.role]} `,
        response_status: 200,
        resData: "Đăng kí thành công",
        ip: req._remoteAddress,

      }
      await logActivity(inforActivity);
    }
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
    console.log(req.user.id)
    if (!idUser) {
      return res.status(200).json({
        status: "ERR",
        message: "Users ID is required!",
      });
    }
    let userN1 = await getFieldById("users", req.user.id, "username");
    let userN2 = await getFieldById("users", idUser, "username");
    let roleN2 = await getFieldById("users", idUser, "role");
    const reponse = await UserService.deleteUser(idUser);
    if (reponse) {
      let inforActivity = {
        username: userN1,
        role: mapRole[req.user.role],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN1} đã xóa tài khoản ${userN2} của hệ ${mapRole[roleN2]} `,
        response_status: 200,
        resData: "Xóa tài khoản thành công",
        ip: req._remoteAddress,

      }
      await logActivity(inforActivity);
    }
    return res.status(200).json(reponse);
  } catch (e) {
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
  } catch (e) {
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
    let userN1 = await getFieldById("users", req.user.id, "username");
    let userN2 = await getFieldById("users", id, "username");
    let roleN2 = await getFieldById("users", id, "role");
    // console.log("###########",roleN2);
    let oldData = await users.findOne({ where: { id } });
    const reponse = await UserService.updateUser(id, data);
    if (reponse) {
      let newData = reponse.data;
      console.log(oldData.dataValues, "$$$$", newData.dataValues);
      let inforActivity = {
        username: userN1,
        role: mapRole[req.user.role],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: getDiffData(oldData.dataValues, newData.dataValues),
        response_status: 200,
        resData: `Cập nhật tài khoản ${userN2} của hệ ${mapRole[roleN2]} thành công`,
        ip: req._remoteAddress,

      }
      await logActivity(inforActivity);
    }

    return res.status(200).json(reponse);
  } catch (e) {
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
  } catch (e) {
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

const get_logs = async (req, res) => {
  try {
    // const page = parseInt(req.query.page) || 1 ;
    // const limit = parseInt(req.query.limit) || 10;
    // if (limit > 100) {
    //   return res.status(400).json({
    //     status: "ERR",
    //     message: "Max limit"
    //   })
    // }
    // const offset = (page -1 ) *limit;

    // const response = await UserService.get_logs(limit, offset, page);
    const { role, startDate, endDate } = req.query;

    console.log(role, startDate, endDate);
    if (startDate > endDate) {
      throw new Error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc.");

    }
    const response = await UserService.get_logs(role, startDate, endDate);

    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({
      status: "ERR",
      message: error.message || "Error fetching logs"
    });
  }


}

module.exports = {
  loginUser,
  refreshToken,
  register,
  getAllUser,
  getDetailUser,
  deleteUser,
  updateUser,
  changePassword,
  get_logs,

};
