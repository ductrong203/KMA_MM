const db = require('../models');
const { logActivity } = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const { verifyAccessToken } = require("../utils/decodedToken");
const { getDiffData } = require("../utils/getDiffData");
const mapRole = {
  1: "daoTao",
  2: "khaoThi",
  3: "quanLiSinhVien",
  5: "giamDoc",
  6: "sinhVien",
  7: "admin"
}

const { QuyDinhDiem } = db;
// Sử dụng console thay vì logger vì module logger chưa được cài đặt đúng cách
// const logger = require('../logs');

exports.getGradeSettings = async (req, res) => {
  try {
    // Hệ thống chỉ nên có một bản ghi cài đặt điểm
    let settings = await QuyDinhDiem.findOne();

    if (!settings) {
      // Nếu không tồn tại cài đặt, tạo cài đặt mặc định
      settings = await QuyDinhDiem.create({
        diemThiToiThieu: 2.0,
        diemTrungBinhDat: 4.0,
        diemGiuaKyToiThieu: 4.0,
        diemChuyenCanToiThieu: 4.0,
        chinhSachHienTai: 'moi',
        chinhSachTuychinh: false
      });
    }

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getGradeSettings:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tải thiết lập điểm',
      error: error.message
    });
  }
};

exports.updateGradeSettings = async (req, res) => {
  try {
    const {
      diemThiToiThieu,
      diemTrungBinhDat,
      diemGiuaKyToiThieu,
      diemChuyenCanToiThieu,
      chinhSachHienTai,
      chinhSachTuychinh
    } = req.body;

    // Validate input
    if (
      diemThiToiThieu < 0 || diemThiToiThieu > 10 ||
      diemTrungBinhDat < 0 || diemTrungBinhDat > 10 ||
      diemGiuaKyToiThieu < 0 || diemGiuaKyToiThieu > 10 ||
      diemChuyenCanToiThieu < 0 || diemChuyenCanToiThieu > 10
    ) {
      return res.status(400).json({
        success: false,
        message: 'Điểm số không hợp lệ. Điểm phải nằm trong khoảng từ 0 đến 10.'
      });
    }

    // Lấy cài đặt hiện tại (chỉ nên có một bản ghi)
    let settings = await QuyDinhDiem.findOne();

    const oldData = settings
      ? JSON.parse(JSON.stringify(settings.get({ plain: true })))
      : {};
    Object.freeze(oldData);

    // console.log("OLD BEFORE UPDATE:", oldData);

    if (!settings) {
      settings = await QuyDinhDiem.create({
        diemThiToiThieu,
        diemTrungBinhDat,
        diemGiuaKyToiThieu,
        diemChuyenCanToiThieu,
        chinhSachHienTai,
        chinhSachTuychinh
      });
    } else {
      await settings.update({
        diemThiToiThieu,
        diemTrungBinhDat,
        diemGiuaKyToiThieu,
        diemChuyenCanToiThieu,
        chinhSachHienTai,
        chinhSachTuychinh
      });

      var newData = settings.get({ plain: true });
    }

    // console.log("OLD FINAL:", oldData);
    // console.log("NEW FINAL:", newData);

    // Ghi log hành động
    // console.info(`Người dùng ${req.user?.id || 'Không xác định'} đã cập nhật thiết lập điểm`, {
    //   userId: req.user?.id,
    //   settings: req.body
    // });
    try {
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      
      if (settings) {
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: getDiffData(newData, oldData),
          response_status: 200,
          resData: `Thiết lập quy định điểm đã được cập nhật.`,
          ip: req._remoteAddress,
          is_list: 0

        }
        await logActivity(inforActivity);
      }
    } catch (error) {
      console.error("Lỗi kìa ní:", error.message);
    }
    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật thiết lập điểm thành công',
      data: settings
    });
  } catch (error) {
    console.error('Error in updateGradeSettings:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật thiết lập điểm',
      error: error.message
    });
  }
};
