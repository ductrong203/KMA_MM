const chungChiService = require('../services/chungChiService');
const loaiChungChiService = require('../services/loaiChungChiService');
const { chung_chi, lop, khoa_dao_tao } = require('../models');


const {logActivity} = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const {users} = require("../models");
const {getDiffData} = require("../utils/getDiffData");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
        1: "daoTao",
        2: "khaoThi",
        3: "quanLiSinhVien",
        5: "giamDoc",
        6: "sinhVien",
        7: "admin"

      }

exports.layDanhSachLoaiChungChi = async (req, res) => {
  try {
    const danhSachLoai = await loaiChungChiService.layDanhSachLoaiChungChi();
    return res.status(200).json({
      thongBao: 'Lấy danh sách loại chứng chỉ thành công',
      data: danhSachLoai.data,
    });
  } catch (error) {
    return res.status(500).json({
      thongBao: 'Lỗi khi lấy danh sách loại chứng chỉ',
      loi: error.message,
    });
  }
};

exports.layDanhSachChungChiTheoHeKhoaLop = async (req, res) => {
  try {
    const { heDaoTaoId, khoaDaoTaoId, lopId } = req.query;

    const params = {
      heDaoTaoId: heDaoTaoId ? parseInt(heDaoTaoId) : null,
      khoaDaoTaoId: khoaDaoTaoId ? parseInt(khoaDaoTaoId) : null,
      lopId: lopId ? parseInt(lopId) : null,
    };

    // Kiểm tra tham số đầu vào
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && (isNaN(value) || value <= 0)) {
        return res.status(400).json({
          thongBao: `Tham số ${key} phải là số nguyên dương`,
        });
      }
    }

    // Gọi phương thức từ service (sửa tên phương thức cho khớp)
    const ketQua = await chungChiService.layDanhSachChungChi(
      params.heDaoTaoId,
      params.khoaDaoTaoId,
      params.lopId
    );

    return res.status(200).json({
      thongBao: 'Lấy danh sách chứng chỉ thành công',
      data: ketQua.data,
    });
  } catch (error) {
    return res.status(500).json({
      thongBao: 'Lỗi khi lấy danh sách chứng chỉ',
      loi: error.message,
    });
  }
};

exports.taoChungChi = async (req, res) => {
  try {
    const { ma_sinh_vien, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, loai_chung_chi_id, ngay_ky_quyet_dinh, tinh_trang } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!ma_sinh_vien || typeof ma_sinh_vien !== 'string' || ma_sinh_vien.trim() === '') {
      return res.status(400).json({
        thongBao: 'Tham số ma_sinh_vien là bắt buộc và phải là chuỗi không rỗng',
      });
    }

    // Kiểm tra diem_trung_binh (nếu có)
    if (diem_trung_binh !== null && (isNaN(diem_trung_binh) || diem_trung_binh < 0)) {
      return res.status(400).json({
        thongBao: 'Tham số diem_trung_binh phải là số không âm',
      });
    }

    // Kiểm tra ngay_ky_quyet_dinh (nếu có)
    if (ngay_ky_quyet_dinh && isNaN(new Date(ngay_ky_quyet_dinh).getTime())) {
      return res.status(400).json({
        thongBao: 'Tham số ngay_ky_quyet_dinh không hợp lệ',
      });
    }

    // Kiểm tra tinh_trang
    const tinhTrangHopLe = ['tốt nghiệp', 'bình thường'];
    if (!tinh_trang || !tinhTrangHopLe.includes(tinh_trang)) {
      return res.status(400).json({
        thongBao: `Tham số tinh_trang phải là một trong các giá trị: ${tinhTrangHopLe.join(', ')}`,
      });
    }

    // Tạo đối tượng dữ liệu
    const data = {
      ma_sinh_vien,
      diem_trung_binh: diem_trung_binh !== null ? parseFloat(diem_trung_binh) : null,
      xep_loai: xep_loai || null,
      ghi_chu: ghi_chu || null,
      so_quyet_dinh: so_quyet_dinh || null,
      loai_chung_chi: loai_chung_chi || null,
      loai_chung_chi_id: loai_chung_chi_id || null, // Thêm loai_chung_chi_id
      ngay_ky_quyet_dinh: ngay_ky_quyet_dinh || null,
      tinh_trang,
    };

    // Gọi phương thức từ service
    const ketQua = await chungChiService.taoChungChi(data);
    try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
            // console.log("$$$$$",ketQua.data);
            const { hoTen, lop, loaiChungChi, tinhTrang } = ketQua.data;
              if (ketQua) {
              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `Người dùng ${userN}  đã tạo chứng chỉ ${loaiChungChi} (${tinhTrang}) cho sinh viên ${hoTen} lớp ${lop} `,
                response_status: 200,
                resData: `Tạo thành công chứng chỉ cho sinh viên ${ma_sinh_vien}`,
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }
    return res.status(201).json({
      thongBao: 'Tạo chứng chỉ thành công',
      duLieu: ketQua.data,
    });
  } catch (error) {
    return res.status(500).json({
      thongBao: 'Lỗi khi tạo chứng chỉ',
      loi: error.message,
    });
  }
};

exports.chinhSuaChungChi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { ma_sinh_vien, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, loai_chung_chi_id, ngay_ky_quyet_dinh, tinh_trang } = req.body;

    // Kiểm tra id hợp lệ
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        thongBao: 'Tham số id phải là số nguyên dương',
      });
    }

    // Kiểm tra ma_sinh_vien (nếu có)
    if (ma_sinh_vien !== undefined && (typeof ma_sinh_vien !== 'string' || ma_sinh_vien.trim() === '')) {
      return res.status(400).json({
        thongBao: 'Tham số ma_sinh_vien phải là chuỗi không rỗng',
      });
    }

    // Kiểm tra diem_trung_binh (nếu có)
    if (diem_trung_binh !== undefined && diem_trung_binh !== null && (isNaN(diem_trung_binh) || diem_trung_binh < 0)) {
      return res.status(400).json({
        thongBao: 'Tham số diem_trung_binh phải là số không âm',
      });
    }

    // Kiểm tra ngay_ky_quyet_dinh (nếu có)
    if (ngay_ky_quyet_dinh && isNaN(new Date(ngay_ky_quyet_dinh).getTime())) {
      return res.status(400).json({
        thongBao: 'Tham số ngay_ky_quyet_dinh không hợp lệ',
      });
    }

    // Kiểm tra tinh_trang (nếu có)
    if (tinh_trang) {
      const tinhTrangHopLe = ['tốt nghiệp', 'bình thường'];
      if (!tinhTrangHopLe.includes(tinh_trang)) {
        return res.status(400).json({
          thongBao: `Tham số tinh_trang phải là một trong các giá trị: ${tinhTrangHopLe.join(', ')}`,
        });
      }
    }

    // Tạo đối tượng dữ liệu
    const data = {
      ma_sinh_vien,
      diem_trung_binh,
      xep_loai,
      ghi_chu,
      so_quyet_dinh,
      loai_chung_chi,
      loai_chung_chi_id, // Thêm loai_chung_chi_id
      ngay_ky_quyet_dinh,
      tinh_trang,
    };
    // Gọi phương thức từ service
    const oldDataRaw = await chung_chi.findByPk(id);
    console.log("######", oldDataRaw);
    const oldData = {
        "Họ tên sinh viên": await getFieldById("sinh_vien", oldDataRaw.sinh_vien_id, "ma_sinh_vien"),
  "Điểm trung bình": oldDataRaw.diem_trung_binh,
  "Xếp loại": oldDataRaw.xep_loai,
  "ghi chú": oldDataRaw.ghi_chu,
  "quyết định": oldDataRaw.so_quyet_dinh,
  "ngày ký quyết định": oldDataRaw.ngay_ky_quyet_dinh,
  "tình trạng": oldDataRaw.tinh_trang,
  "loại chứng chỉ": oldDataRaw.loai_chung_chi,
    }
    const ketQua = await chungChiService.chinhSuaChungChi(id, data);
   try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
              if (ketQua) {
                const newDataRaw = await chung_chi.findByPk(id);
    console.log("######", newDataRaw);
    const newData = {
        "Họ tên sinh viên": await getFieldById("sinh_vien", newDataRaw.sinh_vien_id, "ma_sinh_vien"),
  "Điểm trung bình": newDataRaw.diem_trung_binh,
  "Xếp loại": newDataRaw.xep_loai,
  "ghi chú": newDataRaw.ghi_chu,
  "quyết định": newDataRaw.so_quyet_dinh,
  "ngày ký quyết định": newDataRaw.ngay_ky_quyet_dinh,
  "tình trạng": newDataRaw.tinh_trang,
  "loại chứng chỉ": newDataRaw.loai_chung_chi,
    }
              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `${getDiffData(oldData, newData)}`,
                response_status: 200,
                resData: `Người dùng ${userN} đã chỉnh sửa chứng chỉ cho sinh viên có mã ${req.body.ma_sinh_vien} `,
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }
    return res.status(200).json({
      thongBao: 'Chỉnh sửa chứng chỉ thành công',
      duLieu: ketQua.data,
    });
  } catch (error) {
    return res.status(500).json({
      thongBao: 'Lỗi khi chỉnh sửa chứng chỉ',
      loi: error.message,
    });
  }
};

exports.xoaChungChi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Kiểm tra id hợp lệ
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        thongBao: 'Tham số id phải là số nguyên dương',
      });
    }
let sinhVienId =   await  getFieldById("chung_chi", id, "sinh_vien_id");
            let loaiChungChi =  await  getFieldById("chung_chi", id, "loai_chung_chi");
            let maSinhVien =  await  getFieldById("sinh_vien", sinhVienId, "ma_sinh_vien");
            let hoTen = await  getFieldById("sinh_vien", sinhVienId, "ho_dem") + " " + await  getFieldById("sinh_vien", sinhVienId, "ten");
    // Gọi phương thức từ service
    const ketQua = await chungChiService.xoaChungChi(id);
    try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
            
              if (ketQua) {
              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `Người dùng ${userN}  đã xóa chứng chỉ ${loaiChungChi} của sinh viên ${hoTen}`,
                response_status: 200,
                resData: `Xóa chứng chỉ cho sinh viên có mã ${maSinhVien}`,
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }

    return res.status(200).json({
      thongBao: 'Xóa chứng chỉ thành công',
      duLieu: ketQua.data,
    });
  } catch (error) {
    return res.status(500).json({
      thongBao: 'Lỗi khi xóa chứng chỉ',
      loi: error.message,
    });
  }
};

exports.taoLoaiChungChi = async (req, res) => {
    try {
      const ketQua = await loaiChungChiService.taoLoaiChungChi(req.body);
      try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");

              if (ketQua) {
              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `Người dùng ${userN} đã tạo thành công chứng chỉ ${req.body.ten_loai_chung_chi} ${req.body.xet_tot_nghiep==false ? "không xét tốt nghiệp": "xét tốt nghiệp"}`,
                response_status: 200,
                resData: "Tạo loại chứng chỉ thành công",
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }
      res.status(201).json({
        success: true,
        message: "Đã tạo loại chứng chỉ thành công ",
        data: ketQua.data,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

exports.layChiTietLoaiChungChi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID không hợp lệ',
      });
    }

    const ketQua = await loaiChungChiService.layChiTietLoaiChungChi(id);
    res.status(200).json({
      success: true,
      data: ketQua.data,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

exports.capNhatLoaiChungChi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID không hợp lệ',
      });
    }

    const ketQua = await loaiChungChiService.capNhatLoaiChungChi(id, req.body);
    res.status(200).json({
      success: true,
      data: ketQua.data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.xoaLoaiChungChi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID không hợp lệ',
      });
    }

    const ketQua = await loaiChungChiService.xoaLoaiChungChi(id);
    try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
            let loaiChungChi = await  getFieldById("loai_chung_chi", id, "ten_loai_chung_chi");
              if (ketQua) {
              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `Người dùng ${userN}  đã xóa thành công loại chứng chỉ ${loaiChungChi}`,
                response_status: 200,
                resData: "Xóa loại chứng chỉ thành công",
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }
    res.status(200).json({
      success: true,
      data: ketQua.data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};