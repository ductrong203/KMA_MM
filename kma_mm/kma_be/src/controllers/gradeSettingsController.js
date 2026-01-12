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
    const { he_dao_tao_id } = req.query;
    const whereClause = isNaN(parseInt(he_dao_tao_id)) ? { heDaoTaoId: null } : { heDaoTaoId: he_dao_tao_id };

    // Tìm kiếm cài đặt theo hệ đào tạo
    let settings = await QuyDinhDiem.findOne({
      where: whereClause
    });

    if (!settings && !he_dao_tao_id) {
      // Nếu không tồn tại cài đặt chung (heDaoTaoId = null), tạo mặc định
      settings = await QuyDinhDiem.create({
        diemThiToiThieu: 2.0,
        diemTrungBinhDat: 4.0,
        diemGiuaKyToiThieu: 4.0,
        diemChuyenCanToiThieu: 4.0,
        chinhSachHienTai: 'moi',
        chinhSachTuychinh: false,
        heDaoTaoId: null
      });
    } else if (!settings && he_dao_tao_id) {
      // Nếu chưa có cài đặt riêng cho hệ này, trả về null hoặc trả về cài đặt mặc định để frontend hiển thị?
      // Tốt nhất là trả về cài đặt chung để frontend fill vào form, nhưng kèm theo flag là chưa có
      const defaultSettings = await QuyDinhDiem.findOne({ where: { heDaoTaoId: null } });
      return res.status(200).json({
        success: true,
        data: defaultSettings || {},
        isInherited: true // Flag để frontend biết đây là dữ liệu kế thừa
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
      isInherited: false
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
      chinhSachTuychinh,
      he_dao_tao_id
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

    const heDaoTaoIdVal = isNaN(parseInt(he_dao_tao_id)) ? null : parseInt(he_dao_tao_id);

    // Tìm setting hiện tại cho hệ này (hoặc chung)
    let settings = await QuyDinhDiem.findOne({
      where: { heDaoTaoId: heDaoTaoIdVal }
    });

    const oldData = settings
      ? JSON.parse(JSON.stringify(settings.get({ plain: true })))
      : {};
    Object.freeze(oldData);

    // console.log("OLD BEFORE UPDATE:", oldData);

    if (!settings) {
      // Nếu chưa có thì tạo mới
      settings = await QuyDinhDiem.create({
        diemThiToiThieu,
        diemTrungBinhDat,
        diemGiuaKyToiThieu,
        diemChuyenCanToiThieu,
        chinhSachHienTai,
        chinhSachTuychinh,
        heDaoTaoId: heDaoTaoIdVal
      });
    } else {
      // Nếu có rồi thì update
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
