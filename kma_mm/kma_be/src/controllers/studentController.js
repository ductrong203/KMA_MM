const SinhVienService = require("../services/studentService");
const {sinh_vien} = require("../models");

const path = require("path");
const fs = require("fs");
const { logActivity } = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const { users } = require("../models");
const { getDiffData } = require("../utils/getDiffData");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
  1: "daoTao",
  2: "khaoThi",
  3: "quanLiSinhVien",
  5: "giamDoc",
  6: "sinhVien",
  7: "admin"

}
// Đảm bảo thư mục exports/sinhvien tồn tại
const exportDir = path.join(__dirname, "..", "exports", "sinhvien");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

class SinhVienController {
  static async create(req, res) {
    try {
      const sinhVien = await SinhVienService.createSinhVien(req.body);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        let lop = await getFieldById("lop", sinhVien.lop_id, "ma_lop");
        let doiTuong = await getFieldById("doi_tuong_quan_ly", req.body.doi_tuong_id, "ten_doi_tuong");
        if (sinhVien) {
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `Người dùng ${userN}  đã thêm thành công sinh viên có mã ${req.body.ma_sinh_vien} lớp ${lop} thuộc đối tượng quản lý ${doiTuong}`,
            response_status: 200,
            resData: "Thêm sinh viên thành công",
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      res.status(201).json(
        {
          message: "Thêm sinh viên thành công",
          data: sinhVien
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const sinhViens = await SinhVienService.getAllSinhViens();
      res.json(sinhViens);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllPhanTrang(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await SinhVienService.getAllSinhVienPhanTrang(
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByLopId(req, res) {
    try {
      const { lop_id } = req.params;
      const students = await SinhVienService.getStudentsByLopId(lop_id);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByDoiTuongId(req, res) {
    try {
      const { doi_tuong_id } = req.params;
      const students = await SinhVienService.getStudentsByDoiTuongId(doi_tuong_id);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const sinhVien = await SinhVienService.getSinhVienById(req.params.id);
      if (!sinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json(sinhVien);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const oldDataRaw = await sinh_vien.findByPk(req.params.id);
      const oldData = {
        "Mã sinh viên": oldDataRaw.ma_sinh_vien,
        "Giới tính": oldDataRaw.gioi_tinh === 1? "nam" : "nữ",
        "Quê quán": oldDataRaw.que_quan,
        "lớp": await getFieldById("lop", oldDataRaw.lop_id, "ten_lop"),
        "Đối tượng": await getFieldById("doi_tuong_quan_ly", oldDataRaw.doi_tuong_id, "ten_doi_tuong"),
        "đang học": oldDataRaw.dang_hoc ===1 ? "có": "không",
        "Ghi chú": oldDataRaw.ghi_chu,
        "họ đệm": oldDataRaw.ho_dem,
        "tên": oldDataRaw.ten,
        "số tài khoản": oldDataRaw.so_tai_khoan,
        "ngân hàng": oldDataRaw.ngan_hang,
        "chuc_vu": oldDataRaw.chuc_vu,
        "CCCD": oldDataRaw.CCCD,
        "ngay_cap_CCCD": oldDataRaw.ngay_cap_CCCD,
        "noi_cap_CCCD": oldDataRaw.noi_cap_CCCD,
        "ky_nhap_hoc": oldDataRaw.ky_nhap_hoc,
        "ngay_vao_doan": oldDataRaw.ngay_vao_doan,
        "ngay_vao_dang": oldDataRaw.ngay_vao_dang,
        "ngay_vao_truong": oldDataRaw.ngay_vao_truong,
        "ngay_ra_truong": oldDataRaw.ngay_ra_truong,
        "tinh_thanh": oldDataRaw.tinh_thanh,
        "quan_huyen": oldDataRaw.quan_huyen,
        "phuong_xa_khoi": oldDataRaw.phuong_xa_khoi,
        "dan_toc": oldDataRaw.dan_toc,
        "ton_giao": oldDataRaw.ton_giao,
        "quoc_tich": oldDataRaw.quoc_tich,
        "trung_tuyen_theo_nguyen_vong": oldDataRaw.trung_tuyen_theo_nguyen_vong,
        "nam_tot_nghiep_PTTH": oldDataRaw.nam_tot_nghiep_PTTH,
        "thanh_phan_gia_dinh": oldDataRaw.thanh_phan_gia_dinh,
        "dv_lien_ket_dao_tao": oldDataRaw.dv_lien_ket_dao_tao,
        "so_dien_thoai": oldDataRaw.so_dien_thoai,
        "dien_thoai_gia_dinh": oldDataRaw.dien_thoai_gia_dinh,
        "dien_thoai_CQ": oldDataRaw.dien_thoai_CQ,
        "email": oldDataRaw.email,
        "khi_can_bao_tin_cho_ai": oldDataRaw.khi_can_bao_tin_cho_ai,
        "noi_tru": oldDataRaw.noi_tru,
        "ngoai_tru": oldDataRaw.ngoai_tru,

      }
      const updatedSinhVien = await SinhVienService.updateSinhVien(req.params.id, req.body);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        if (updatedSinhVien) {
          const newDataRaw = await sinh_vien.findByPk(req.params.id);
         const newData = {
        "Mã sinh viên": newDataRaw.ma_sinh_vien,
        "Giới tính": newDataRaw.gioi_tinh === 1? "nam" : "nữ",
        "Quê quán": newDataRaw.que_quan,
        "lớp": await getFieldById("lop", newDataRaw.lop_id, "ten_lop"),
        "Đối tượng": await getFieldById("doi_tuong_quan_ly", newDataRaw.doi_tuong_id, "ten_doi_tuong"),
        "đang học": newDataRaw.dang_hoc ===1 ? "có": "không",
        "Ghi chú": newDataRaw.ghi_chu,
        "họ đệm": newDataRaw.ho_dem,
        "tên": newDataRaw.ten,
        "số tài khoản": newDataRaw.so_tai_khoan,
        "ngân hàng": newDataRaw.ngan_hang,
        "chuc_vu": newDataRaw.chuc_vu,
        "CCCD": newDataRaw.CCCD,
        "ngay_cap_CCCD": newDataRaw.ngay_cap_CCCD,
        "noi_cap_CCCD": newDataRaw.noi_cap_CCCD,
        "ky_nhap_hoc": newDataRaw.ky_nhap_hoc,
        "ngay_vao_doan": newDataRaw.ngay_vao_doan,
        "ngay_vao_dang": newDataRaw.ngay_vao_dang,
        "ngay_vao_truong": newDataRaw.ngay_vao_truong,
        "ngay_ra_truong": newDataRaw.ngay_ra_truong,
        "tinh_thanh": newDataRaw.tinh_thanh,
        "quan_huyen": newDataRaw.quan_huyen,
        "phuong_xa_khoi": newDataRaw.phuong_xa_khoi,
        "dan_toc": newDataRaw.dan_toc,
        "ton_giao": newDataRaw.ton_giao,
        "quoc_tich": newDataRaw.quoc_tich,
        "trung_tuyen_theo_nguyen_vong": newDataRaw.trung_tuyen_theo_nguyen_vong,
        "nam_tot_nghiep_PTTH": newDataRaw.nam_tot_nghiep_PTTH,
        "thanh_phan_gia_dinh": newDataRaw.thanh_phan_gia_dinh,
        "dv_lien_ket_dao_tao": newDataRaw.dv_lien_ket_dao_tao,
        "so_dien_thoai": newDataRaw.so_dien_thoai,
        "dien_thoai_gia_dinh": newDataRaw.dien_thoai_gia_dinh,
        "dien_thoai_CQ": newDataRaw.dien_thoai_CQ,
        "email": newDataRaw.email,
        "khi_can_bao_tin_cho_ai": newDataRaw.khi_can_bao_tin_cho_ai,
        "noi_tru": newDataRaw.noi_tru,
        "ngoai_tru": newDataRaw.ngoai_tru,

      }
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: `${getDiffData(oldData, newData)}`,
            response_status: 200,
            resData: `Cập nhật thành công sinh viên mã ${req.body.ma_sinh_vien}`,
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      if (!updatedSinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json(
        {
          message: "Cập nhật sinh viên thành công ",
          data: updatedSinhVien
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deletedSinhVien = await SinhVienService.deleteSinhVien(req.params.id);
      if (!deletedSinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json({ message: "Đã xóa sinh viên" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async timSinhVienTheoMaHoacFilter(req, res) {
    try {
      const filters = req.query; // Lấy tất cả query params
      console.log(filters)
      const sinhVienList = await SinhVienService.timSinhVienTheoMaHoacFilter(filters);

      res.status(200).json({
        success: true,
        data: sinhVienList,
      });
    } catch (error) {
      console.error('Error in timSinhVienTheoMaHoacFilter:', error);
      res.status(error.message === 'Không tìm thấy sinh viên phù hợp' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // static async exportToExcel(req, res) {
  //   try {
  //     const sinhVienData = await SinhVienService.getDanhSachSinhVienExcel(req.body);
  //     res.status(200).json({ success: true, data: sinhVienData });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // }


  static async exportToExcel(req, res) {
    try {
      const buffer = await SinhVienService.exportSinhVienToExcel(req.body);

      // Tạo tên file với timestamp để tránh trùng lặp
      const fileName = `danh_sach_sinh_vien_${Date.now()}.xlsx`;
      const filePath = path.join(exportDir, fileName);

      // Lưu file vào thư mục exports/excel
      await fs.promises.writeFile(filePath, buffer);

      // Gửi file về client
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Lỗi khi gửi file:", err);
          return res.status(500).json({ success: false, message: "Không thể tải file" });
        }
        console.log("File đã được lưu vĩnh viễn tại:", filePath);
        // Không xóa file để lưu vĩnh viễn
      });
    } catch (error) {
      console.error("Lỗi trong controller:", error);
      res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  static async importSinhVien(req, res) {
    try {
      const { lop_id, ghi_de } = req.body;
      const filePath = req.file.path; // Giả sử sử dụng middleware như multer để upload file
      const result = await SinhVienService.importSinhVien({ lop_id, filePath, ghi_de });
      try {
        const token = req.headers.authorization?.split(" ")[1];
            // console.log(token);
            let user = verifyAccessToken(token);
            let userN  = await  getFieldById("users", user.id, "username");
            let  userR = await  getFieldById("users", user.id, "role");
            let lop = await getFieldById("lop", lop_id, "ma_lop")
              if (result) {
              let inforActivity = {
                username:   userN,
                role: mapRole[userR],
                action: req.method,
                endpoint: req.originalUrl,
                reqData: `Người dùng ${userN}  đã nhập danh sách gồm ${result.newCount} sinh viên vào lớp có mã ${lop} `,
                response_status: 200,
                resData: "import danh sách sinh viên từ file excel",
                ip:  req._remoteAddress,
        
              }
                await logActivity(inforActivity);
              }
     } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
     }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async timSinhVienTheoMaHoacFilter(req, res) {
    try {
      const filters = req.query; // Lấy tất cả query params
      console.log(filters)
      const sinhVienList = await SinhVienService.timSinhVienTheoMaHoacFilter(filters);

      res.status(200).json({
        success: true,
        data: sinhVienList,
      });
    } catch (error) {
      console.error('Error in timSinhVienTheoMaHoacFilter:', error);
      res.status(error.message === 'Không tìm thấy sinh viên phù hợp' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async kiemTraTonTai(req, res) {
    try {
      const { lop_id } = req.body;
      const filePath = req.file.path; // Giả sử sử dụng middleware như multer để upload file
      const result = await SinhVienService.kiemTraTonTai({ lop_id, filePath });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async checkGraduationConditions(req, res) {
    try {
      const sinhVienId = req.params.sinhVienId;
      // Lấy số tín chỉ yêu cầu từ query string nếu có
      const requiredCredits = req.query.requiredCredits ? parseInt(req.query.requiredCredits) : null;
      const result = await SinhVienService.checkGraduationConditions(sinhVienId, requiredCredits);
      return res.status(200).json({
        status: 'success',
        message: 'Kiểm tra điều kiện tốt nghiệp thành công',
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  static async checkMultipleGraduationConditions(req, res) {
    try {
      const { sinhVienIds } = req.body;
      // Lấy số tín chỉ yêu cầu từ body nếu có
      const requiredCredits = req.body.requiredCredits ? parseInt(req.body.requiredCredits) : null;

      if (!sinhVienIds || !Array.isArray(sinhVienIds)) {
        return res.status(400).json({
          status: 'error',
          message: 'Danh sách ID sinh viên không hợp lệ. Cần truyền mảng sinhVienIds.',
        });
      }

      const result = await SinhVienService.checkMultipleStudentsGraduationConditions(sinhVienIds, requiredCredits);
      return res.status(200).json({
        status: 'success',
        message: 'Kiểm tra điều kiện tốt nghiệp cho nhiều sinh viên thành công',
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  static async getByKhoaDaoTaoId(req, res) {
    try {
      const { khoa_dao_tao_id } = req.params;
      if (!khoa_dao_tao_id) {
        return res.status(400).json({ success: false, message: "Thiếu khoa_dao_tao_id" });
      }

      const result = await SinhVienService.getStudentsByKhoaDaoTaoId(khoa_dao_tao_id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  static async updateSinhVienByKhoaDaoTao(req, res) {
    try {
      const { khoa_dao_tao_id } = req.params;
      const { sinh_vien_list } = req.body;

      if (!khoa_dao_tao_id || isNaN(khoa_dao_tao_id)) {
        return res.status(400).json({ message: "Khóa đào tạo ID không hợp lệ" });
      }

      if (!sinh_vien_list || !Array.isArray(sinh_vien_list)) {
        return res.status(400).json({ message: "Danh sách sinh viên không hợp lệ" });
      }
      // const oldData = await 
      const result = await SinhVienService.updateSinhVienByKhoaDaoTao(khoa_dao_tao_id, sinh_vien_list);
      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        let lop = await getFieldById("lop", sinhVien.lop_id, "ma_lop")
        if (result) {
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: ``,
            response_status: 200,
            resData: `Người dùng ${userN} đã cập nhật thông tin cho sinh viên có mã ${req.body.ma_sinh_vien}`,
            ip: req._remoteAddress,

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = SinhVienController;
