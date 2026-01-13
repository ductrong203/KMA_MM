const giangVienService = require("../services/giangVienService");
const { giang_vien } = require("../models");

const { logActivity } = require("../services/activityLogService");
const { getFieldById, getChucVuDiaDiem } = require("../utils/detailData");
const { users } = require("../models");
const { getDiffData, getDiffDataDetailed} = require("../utils/getDiffData");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
  1: "daoTao",
  2: "khaoThi",
  3: "quanLiSinhVien",
  5: "giamDoc",
  6: "sinhVien",
  7: "admin"

}
const createGiangVien = async (req, res) => {
  try {
    console.log(req.body);
    const { maGiangVien, username, hoTen, thuocKhoa, laGiangVienMoi, maPhongBan } = req.body;

    // Kiểm tra các trường bắt buộc
    const missingFields = [];

    if (!maGiangVien) missingFields.push('maGiangVien');
    if (!username) missingFields.push('username');
    if (!hoTen) missingFields.push('hoTen');

    // Nếu không phải giảng viên mới thì phải có thuocKhoa và maPhongBan
    if (laGiangVienMoi === 0) {
      if (thuocKhoa === undefined || thuocKhoa === null) missingFields.push('thuocKhoa');
      if (!maPhongBan || maPhongBan.trim() === '') missingFields.push('maPhongBan');
    }

    // Nếu thiếu trường nào, trả về thông báo lỗi
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        status: "ERR",
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    console.log('Processing createGiangVien...');
    const response = await giangVienService.createGiangVien(req.body);
    const token = req.headers.authorization?.split(" ")[1];
    const [chucVu, diaDiem] = await getChucVuDiaDiem(laGiangVienMoi, thuocKhoa, maPhongBan);
    let user = verifyAccessToken(token);
    let userN = await getFieldById("users", user.id, "username");
    let userR = await getFieldById("users", user.id, "role");

    if (response) {

      let inforActivity = {
        username: userN,
        role: mapRole[userR],
        action: req.method,
        endpoint: req.originalUrl,
        reqData: `Người dùng ${userN} đã thêm ${chucVu} có mã giảng viên là ${maGiangVien} với tên tài khoản là ${username} ; ${diaDiem}`,
        response_status: 200,
        resData: "Thêm giảng viên thành công",
        ip: req._remoteAddress,

      }
      await logActivity(inforActivity);
    }

    return res.status(201).json(response);
  } catch (e) {
    console.error("Error creating giang vien:", e);
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
};


const getGiangVien = async (req, res) => {
  try {
    const response = await giangVienService.getGiangVien();
    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}

const updateGiangVien = async (req, res) => {
  try {
    const oldData = await giang_vien.findOne({ where: { ma_giang_vien: req.params.ma_giang_vien } });
    const maPhongBanOld = await getFieldById("phong_ban", oldData.phong_ban_id, "ma_phong_ban");
    const [oldChucVu, oldDiaDiem] = await getChucVuDiaDiem(oldData.la_giang_vien_moi, oldData.thuoc_khoa, maPhongBanOld);
    // console.log("$######old", oldChucVu, oldDiaDiem)
    const response = await giangVienService.updateGiangVien(req.params.ma_giang_vien, req.body);

    try {
      const token = req.headers.authorization?.split(" ")[1];
      // console.log(token);
      let user = verifyAccessToken(token);
      let userN = await getFieldById("users", user.id, "username");
      let userR = await getFieldById("users", user.id, "role");
      if (response) {
        const newData = await giang_vien.findOne({ where: { ma_giang_vien: req.body.maGiangVien } });
        const [newChucVu, newDiaDiem] = await getChucVuDiaDiem(newData.la_giang_vien_moi, newData.thuoc_khoa, req.body.maPhongBan);
        // console.log("$######new", newChucVu, newDiaDiem)
        let oldD = {
          "mã giảng viên": oldData.ma_giang_vien,
          "họ tên": oldData.ho_ten,
          "địa chỉ": oldData.dia_chi,
          "số điện thoại": oldData.so_dien_thoai,
          "tên tài khoản": oldData.username,
          "học hàm": oldData.hoc_ham,
          "học vị": oldData.hoc_vi,
          "chuyên môn": oldData.chuyen_mon,
          "trạng thái": oldData.trang_thai,
          "giới tính": oldData.gioi_tinh,
          "ngày sinh": oldData.ngay_sinh,
          "email": oldData.email,
          "cccd": oldData.cccd,
          "ngày cấp": oldData.ngay_cap,
          "nơi cấp": oldData.noi_cap,
          "nơi ở hiện nay": oldData.noi_o_hien_nay,
          "Chức vụ": oldChucVu, 
          "Vị trí": oldDiaDiem,
        };

        let newD = {
          "mã giảng viên": newData.ma_giang_vien,
          "họ tên": newData.ho_ten,
          "địa chỉ": newData.dia_chi,
          "số điện thoại": newData.so_dien_thoai,
          "tên tài khoản": newData.username,
          "học hàm": newData.hoc_ham,
          "học vị": newData.hoc_vi,
          "chuyên môn": newData.chuyen_mon,
          "trạng thái": newData.trang_thai,
          "giới tính": newData.gioi_tinh,
          "ngày sinh": newData.ngay_sinh,
          "email": newData.email,
          "cccd": newData.cccd,
          "ngày cấp": newData.ngay_cap,
          "nơi cấp": newData.noi_cap,
          "nơi ở hiện nay": newData.noi_o_hien_nay,
          "Chức vụ": newChucVu, 
          "Vị trí": newDiaDiem 
        }
        console.log("#################################", getDiffDataDetailed(oldD, newD));
        let inforActivity = {
          username: userN,
          role: mapRole[userR],
          action: req.method,
          endpoint: req.originalUrl,
          reqData: getDiffData(oldD, newD),
          response_status: 200,
          resData: `Người dùng ${userN} đã cập nhật giảng viên có mã ${req.params.ma_giang_vien} thành công`,
          ip: req._remoteAddress,

        }
        await logActivity(inforActivity);
      }
    } catch (error) {
      console.error("log không được ní ơiii:", error.message);

    }
    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Server error",
    });
  }
}
module.exports = {
  createGiangVien,
  getGiangVien,
  updateGiangVien
};
