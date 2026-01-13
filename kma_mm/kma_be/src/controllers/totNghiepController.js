const totNghiepService = require('../services/totNghiepService');
const { extraDanhSachTotNghiep } = require("../utils/extraList");

const { logActivity } = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
  1: "daoTao",
  2: "khaoThi",
  3: "quanLiSinhVien",
  5: "giamDoc",
  6: "sinhVien",
  7: "admin"

};
class TotNghiepController {
  // Xét duyệt tốt nghiệp
  async approveGraduation(req, res) {
    try {
      const {
        sinh_vien_ids,
        lop_id,
        khoa_dao_tao_id,
        he_dao_tao_id,
        graduation_results
      } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!sinh_vien_ids || !Array.isArray(sinh_vien_ids) || sinh_vien_ids.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Danh sách sinh viên không được để trống'
        });
      }

      if (!lop_id || !khoa_dao_tao_id || !he_dao_tao_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Thiếu thông tin lớp, khóa đào tạo hoặc hệ đào tạo'
        });
      }

      const nguoi_duyet_id = req.user?.id; // Lấy từ token authentication

      const graduationData = {
        sinh_vien_ids,
        lop_id,
        khoa_dao_tao_id,
        he_dao_tao_id,
        nguoi_duyet_id,
        graduation_results
      };

      const result = await totNghiepService.approveGraduation(graduationData);

      try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token);
        let user = verifyAccessToken(token);
        let userN = await getFieldById("users", user.id, "username");
        let userR = await getFieldById("users", user.id, "role");
        let maLop = await getFieldById("lop", lop_id, "ma_lop");
        let maKhoa = await getFieldById("khoa_dao_tao", khoa_dao_tao_id, "ma_khoa");
        const extraList = await extraDanhSachTotNghiep(result, maLop, maKhoa);
        if (result) {
          let inforActivity = {
            username: userN,
            role: mapRole[userR],
            action: req.method,
            endpoint: req.originalUrl,
            reqData: extraList,
            response_status: 200,
            resData: `Đã xét duyệt tốt nghiệp cho ${result.length} sinh viên trong lớp ${maLop} - khóa đào tạo ${maKhoa}`,
            ip: req._remoteAddress,
            is_list: 1

          }
          await logActivity(inforActivity);
        }
      } catch (error) {
        console.error("Lỗi kìa ní:", error.message);
      }
      res.status(200).json({
        status: 'success',
        message: `Đã xét duyệt tốt nghiệp cho ${result.length} sinh viên`,
        data: result
      });
    } catch (error) {
      console.error('Error in approveGraduation:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi xét duyệt tốt nghiệp'
      });
    }
  }

  // Lấy danh sách sinh viên tốt nghiệp
  async getGraduationList(req, res) {
    try {
      const filters = {
        he_dao_tao_id: req.query.he_dao_tao_id,
        khoa_dao_tao_id: req.query.khoa_dao_tao_id,
        lop_id: req.query.lop_id,
        trang_thai: req.query.trang_thai,
        from_date: req.query.from_date,
        to_date: req.query.to_date
      };

      // Loại bỏ các filter undefined
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const graduations = await totNghiepService.getGraduationList(filters);

      res.status(200).json({
        status: 'success',
        message: 'Lấy danh sách tốt nghiệp thành công',
        data: graduations
      });
    } catch (error) {
      console.error('Error in getGraduationList:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi lấy danh sách tốt nghiệp'
      });
    }
  }

  // Lấy thông tin tốt nghiệp của một sinh viên
  async getStudentGraduation(req, res) {
    try {
      const { sinh_vien_id } = req.params;
      const { khoa_dao_tao_id } = req.query;

      if (!sinh_vien_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Thiếu ID sinh viên'
        });
      }

      const graduation = await totNghiepService.getStudentGraduation(
        parseInt(sinh_vien_id),
        khoa_dao_tao_id ? parseInt(khoa_dao_tao_id) : null
      );

      if (!graduation) {
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy thông tin tốt nghiệp của sinh viên'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Lấy thông tin tốt nghiệp thành công',
        data: graduation
      });
    } catch (error) {
      console.error('Error in getStudentGraduation:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi lấy thông tin tốt nghiệp'
      });
    }
  }

  // Cập nhật thông tin bằng tốt nghiệp
  async updateGraduationCertificate(req, res) {
    try {
      const { graduation_id } = req.params;
      const certificateData = req.body;

      if (!graduation_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Thiếu ID bản ghi tốt nghiệp'
        });
      }

      const result = await totNghiepService.updateGraduationCertificate(
        parseInt(graduation_id),
        certificateData
      );

      res.status(200).json({
        status: 'success',
        message: 'Cập nhật thông tin bằng tốt nghiệp thành công',
        data: result
      });
    } catch (error) {
      console.error('Error in updateGraduationCertificate:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi cập nhật thông tin bằng'
      });
    }
  }

  // Lấy thống kê tốt nghiệp
  async getGraduationStatistics(req, res) {
    try {
      const filters = {
        he_dao_tao_id: req.query.he_dao_tao_id,
        khoa_dao_tao_id: req.query.khoa_dao_tao_id,
        year: req.query.year
      };

      // Loại bỏ các filter undefined
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const statistics = await totNghiepService.getGraduationStatistics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Lấy thống kê tốt nghiệp thành công',
        data: statistics
      });
    } catch (error) {
      console.error('Error in getGraduationStatistics:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi lấy thống kê tốt nghiệp'
      });
    }
  }

  // Xóa bản ghi tốt nghiệp
  async deleteGraduation(req, res) {
    try {
      const { graduation_id } = req.params;

      if (!graduation_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Thiếu ID bản ghi tốt nghiệp'
        });
      }

      const result = await totNghiepService.deleteGraduation(parseInt(graduation_id));

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      console.error('Error in deleteGraduation:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi xóa bản ghi tốt nghiệp'
      });
    }
  }

  // Tạo bản ghi tốt nghiệp mới
  async createGraduation(req, res) {
    try {
      const graduationData = req.body;

      // Validation cơ bản
      const requiredFields = ['sinh_vien_id', 'lop_id', 'khoa_dao_tao_id', 'he_dao_tao_id'];
      for (const field of requiredFields) {
        if (!graduationData[field]) {
          return res.status(400).json({
            status: 'error',
            message: `Thiếu trường bắt buộc: ${field}`
          });
        }
      }

      graduationData.nguoi_duyet_id = req.user?.id;

      const result = await totNghiepService.createGraduation(graduationData);

      res.status(201).json({
        status: 'success',
        message: 'Tạo bản ghi tốt nghiệp thành công',
        data: result
      });
    } catch (error) {
      console.error('Error in createGraduation:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi tạo bản ghi tốt nghiệp'
      });
    }
  }

  // Kiểm tra trạng thái xét duyệt của lớp
  async checkGraduationStatus(req, res) {
    try {
      const { lop_id, khoa_dao_tao_id, he_dao_tao_id } = req.query;

      if (!lop_id || !khoa_dao_tao_id || !he_dao_tao_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Thiếu thông tin lớp, khóa đào tạo hoặc hệ đào tạo'
        });
      }

      const result = await totNghiepService.checkGraduationStatus({
        lop_id: parseInt(lop_id),
        khoa_dao_tao_id: parseInt(khoa_dao_tao_id),
        he_dao_tao_id: parseInt(he_dao_tao_id)
      });

      res.status(200).json({
        status: 'success',
        message: 'Kiểm tra trạng thái xét duyệt thành công',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Lỗi khi kiểm tra trạng thái xét duyệt',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = new TotNghiepController();
