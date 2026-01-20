const { sinh_vien, lop, khoa_dao_tao, danh_muc_dao_tao, tot_nghiep, mon_hoc } = require('../models');
const { Op } = require('sequelize');

class StatisticController {
  // Thống kê tốt nghiệp - sử dụng bảng tot_nghiep
  static async getThongKeTotNghiep(req, res) {
    try {
      const { he_dao_tao_id, khoa_dao_tao_id, lop_id } = req.body;

      // Debug log để kiểm tra request
      console.log('getThongKeTotNghiep - Request body:', req.body);
      console.log('Parameters:', { he_dao_tao_id, khoa_dao_tao_id, lop_id });

      // Xây dựng điều kiện where cho bảng tot_nghiep
      let whereCondition = {};
      let includeConditions = [];

      if (lop_id) {
        whereCondition.lop_id = lop_id;
      } else if (khoa_dao_tao_id) {
        whereCondition.khoa_dao_tao_id = khoa_dao_tao_id;
      } else if (he_dao_tao_id) {
        whereCondition.he_dao_tao_id = he_dao_tao_id;
      }

      console.log('Where condition:', whereCondition);

      // Đếm sinh viên đã tốt nghiệp (trang_thai = 'da_duyet')
      const totNghiep = await tot_nghiep.count({
        where: {
          ...whereCondition,
          trang_thai: 'da_duyet'
        }
      });

      // Đếm sinh viên chờ duyệt tốt nghiệp (trang_thai = 'cho_duyet')
      const choDuyet = await tot_nghiep.count({
        where: {
          ...whereCondition,
          trang_thai: 'cho_duyet'
        }
      });

      // Đếm sinh viên bị từ chối tốt nghiệp (trang_thai = 'tu_choi')
      const tuChoi = await tot_nghiep.count({
        where: {
          ...whereCondition,
          trang_thai: 'tu_choi'
        }
      });

      res.json({
        success: true,
        data: {
          totNghiep,
          choDuyet,
          tuChoi,
          total: totNghiep + choDuyet + tuChoi
        }
      });
    } catch (error) {
      console.error('Error in getThongKeTotNghiep:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thống kê tốt nghiệp',
        error: error.message
      });
    }
  }

  // Thống kê sinh viên đủ điều kiện làm đồ án - sử dụng bảng tot_nghiep và kiểm tra điều kiện
  static async getThongKeDoAn(req, res) {
    try {
      const { he_dao_tao_id, khoa_dao_tao_id, lop_id } = req.body;

      // Debug log để kiểm tra request
      console.log('getThongKeDoAn - Request body:', req.body);
      console.log('Parameters:', { he_dao_tao_id, khoa_dao_tao_id, lop_id });

      // Xây dựng điều kiện where cho bảng tot_nghiep
      let whereCondition = {};

      if (lop_id) {
        whereCondition.lop_id = lop_id;
      } else if (khoa_dao_tao_id) {
        whereCondition.khoa_dao_tao_id = khoa_dao_tao_id;
      } else if (he_dao_tao_id) {
        whereCondition.he_dao_tao_id = he_dao_tao_id;
      }

      console.log('Where condition (DoAn):', whereCondition);

      // Đếm sinh viên đủ điều kiện làm đồ án (du_dieu_kien = true)
      const duDieuKien = await tot_nghiep.count({
        where: {
          ...whereCondition,
          du_dieu_kien: true
        }
      });

      // Đếm sinh viên không đủ điều kiện làm đồ án (du_dieu_kien = false)
      const khongDuDieuKien = await tot_nghiep.count({
        where: {
          ...whereCondition,
          du_dieu_kien: false
        }
      });

      res.json({
        success: true,
        data: {
          duDieuKien,
          khongDuDieuKien,
          total: duDieuKien + khongDuDieuKien
        }
      });
    } catch (error) {
      console.error('Error in getThongKeDoAn:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thống kê đồ án',
        error: error.message
      });
    }
  }

  // API debug để kiểm tra dữ liệu thô trong bảng tot_nghiep
  static async getDebugData(req, res) {
    try {
      // Lấy tất cả dữ liệu từ bảng tot_nghiep
      const allData = await tot_nghiep.findAll({
        attributes: ['id', 'sinh_vien_id', 'lop_id', 'khoa_dao_tao_id', 'he_dao_tao_id', 'trang_thai', 'du_dieu_kien'],
        limit: 10 // Giới hạn 10 records để không quá nhiều dữ liệu
      });

      // Đếm theo từng trạng thái
      const counts = {
        total: await tot_nghiep.count(),
        da_duyet: await tot_nghiep.count({ where: { trang_thai: 'da_duyet' } }),
        cho_duyet: await tot_nghiep.count({ where: { trang_thai: 'cho_duyet' } }),
        tu_choi: await tot_nghiep.count({ where: { trang_thai: 'tu_choi' } }),
        du_dieu_kien: await tot_nghiep.count({ where: { du_dieu_kien: true } }),
        khong_du_dieu_kien: await tot_nghiep.count({ where: { du_dieu_kien: false } })
      };

      res.json({
        success: true,
        data: {
          counts,
          sampleData: allData
        }
      });
    } catch (error) {
      console.error('Error in getDebugData:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy dữ liệu debug',
        error: error.message
      });
    }
  }

  // Helper: Lấy dữ liệu báo cáo (dùng chung cho Preview và Export)
  static async _getReportData(he_dao_tao_id, khoa_dao_tao_id) {
    let whereCondition = {};
    if (khoa_dao_tao_id) whereCondition.id = khoa_dao_tao_id;
    if (he_dao_tao_id) whereCondition.he_dao_tao_id = he_dao_tao_id;

    const khoas = await khoa_dao_tao.findAll({
      where: whereCondition,
      include: [{
        model: danh_muc_dao_tao,
        as: 'he_dao_tao',
        attributes: ['id', 'ten_he_dao_tao']
      }],
      order: [['id', 'ASC']]
    });

    return await Promise.all(khoas.map(async (k, index) => {
      const khoaId = k.id;
      const heId = k.he_dao_tao_id;

      const [
        soHocVienDauVao,
        soTotNghiepDungHan,
        soTotNghiepKhongDungHan,
        khoiLuongCTDT,
        khoiLuongHPDieuKien,
        soLop
      ] = await Promise.all([
        sinh_vien.count({
          include: [{
            model: lop,
            as: 'lop',
            where: { khoa_dao_tao_id: khoaId },
            required: true
          }]
        }),
        tot_nghiep.count({ where: { khoa_dao_tao_id: khoaId, dung_han: 1, trang_thai: 'da_duyet' } }),
        tot_nghiep.count({ where: { khoa_dao_tao_id: khoaId, dung_han: 0, trang_thai: 'da_duyet' } }),
        mon_hoc.sum('so_tin_chi', { where: { he_dao_tao_id: heId } }),
        mon_hoc.sum('so_tin_chi', { where: { he_dao_tao_id: heId, tinh_diem: 0 } }),
        lop.count({ where: { khoa_dao_tao_id: khoaId } })
      ]);

      let thoiGianDaoTao = '';
      if (k.so_ky_hoc && k.so_ky_hoc_1_nam && k.so_ky_hoc_1_nam > 0) {
        const nam = k.so_ky_hoc / k.so_ky_hoc_1_nam;
        thoiGianDaoTao = `${nam} năm`;
      }

      return {
        stt: index + 1,
        ma_khoa: k.ma_khoa,
        ten_khoa: k.ten_khoa,
        he_dao_tao: k.he_dao_tao ? k.he_dao_tao.ten_he_dao_tao : '',
        nien_khoa: k.nam_hoc || '',
        so_hv_dau_vao: soHocVienDauVao || 0,
        so_hv_tot_nghiep_dung_han: soTotNghiepDungHan || 0,
        so_hv_tot_nghiep_khong_dung_han: soTotNghiepKhongDungHan || 0,
        khoi_luong_ctdt: (khoiLuongCTDT || 0) + ' tín chỉ',
        khoi_luong_hp_dieu_kien: (khoiLuongHPDieuKien || 0) + ' tín chỉ',
        thoi_gian_dao_tao: thoiGianDaoTao,
        tong_so_hoc_ky: k.so_ky_hoc || 0,
        so_lop: soLop || 0
      };
    }));
  }

  // API lấy dữ liệu preview (JSON)
  static async getPreviewReport(req, res) {
    try {
      const { he_dao_tao_id, khoa_dao_tao_id } = req.body;
      const reportData = await StatisticController._getReportData(he_dao_tao_id, khoa_dao_tao_id);

      res.json({
        success: true,
        data: reportData
      });
    } catch (error) {
      console.error('Error in getPreviewReport:', error);
      res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu preview', error: error.message });
    }
  }

  // API lấy dữ liệu xuất báo cáo thống kê Excel với định dạng đẹp
  static async exportThongKeBaoCao(req, res) {
    try {
      const { he_dao_tao_id, khoa_dao_tao_id } = req.body;
      const ExcelJS = require('exceljs');

      // Reuse logic lấy dữ liệu
      const reportData = await StatisticController._getReportData(he_dao_tao_id, khoa_dao_tao_id);

      // 3. Tạo file Excel với ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Báo cáo tổng hợp');

      // Định nghĩa các cột
      worksheet.columns = [
        { header: 'STT', key: 'stt', width: 5 },
        { header: 'Mã khóa', key: 'ma_khoa', width: 10 },
        { header: 'Tên khóa', key: 'ten_khoa', width: 25 },
        { header: 'Hệ đào tạo', key: 'he_dao_tao', width: 25 },
        { header: 'Niên khóa', key: 'nien_khoa', width: 12 },
        { header: 'Số HV đầu vào', key: 'so_hv_dau_vao', width: 15 },
        { header: 'Số HV tốt nghiệp đúng hạn', key: 'so_hv_tot_nghiep_dung_han', width: 20 },
        { header: 'Số HV tốt nghiệp không đúng hạn', key: 'so_hv_tot_nghiep_khong_dung_han', width: 20 },
        { header: 'Khối lượng CTĐT', key: 'khoi_luong_ctdt', width: 15 },
        { header: 'Khối lượng các hp điều kiện', key: 'khoi_luong_hp_dieu_kien', width: 15 },
        { header: 'Thời gian đào tạo', key: 'thoi_gian_dao_tao', width: 15 },
        { header: 'Tổng số học kỳ', key: 'tong_so_hoc_ky', width: 15 },
        { header: 'Số lớp/khóa', key: 'so_lop', width: 15 }
      ];

      // Thêm dữ liệu
      worksheet.addRows(reportData);

      // --- STYLING ---

      // 1. Header Style
      const headerRow = worksheet.getRow(1);
      headerRow.height = 50; // Tăng chiều cao header
      headerRow.font = { name: 'Times New Roman', size: 11, bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      // Tô màu header theo nhóm (dựa trên ảnh mẫu)
      // STT -> Niên khóa : Màu Cam nhạt 'FFE699'
      for (let i = 1; i <= 5; i++) {
        headerRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE699' } };
      }
      // Số liệu sinh viên: Màu Xanh lá nhạt 'E2EFDA' (Cột 6-8)
      for (let i = 6; i <= 8; i++) {
        headerRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
      }
      // Thông tin đào tạo: Màu Xanh dương nhạt 'DDEBF7' (Cột 9-11)
      for (let i = 9; i <= 11; i++) {
        headerRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
      }
      // Các cột còn lại: Màu Xám nhạt 'EDEDED'
      for (let i = 12; i <= 13; i++) {
        headerRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDEDED' } };
      }

      // 2. Data Style (Borders & Font)
      worksheet.eachRow((row, rowNumber) => {
        row.font = { name: 'Times New Roman', size: 11 }; // Set font cho toàn bộ dòng

        if (rowNumber > 1) { // Data rows
          row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Response file Excel
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=BaoCaoTongHop.xlsx');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error in exportThongKeBaoCao:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xuất báo cáo',
        error: error.message
      });
    }
  }
}

module.exports = StatisticController;