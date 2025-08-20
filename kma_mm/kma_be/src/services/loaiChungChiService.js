const { loai_chung_chi } = require('../models');
const { Op } = require('sequelize');

class LoaiChungChiService {
  /**
   * Lấy danh sách tất cả loại chứng chỉ
   */
  static async layDanhSachLoaiChungChi(tinhTrang = null) {
    try {
      const dieuKien = {};
      
      if (tinhTrang) {
        dieuKien.tinh_trang = tinhTrang;
      }

      const danhSach = await loai_chung_chi.findAll({
        where: dieuKien,
        order: [['ten_loai_chung_chi', 'ASC']],
      });

      return {
        data: danhSach,
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại chứng chỉ:", error);
      throw new Error(`Lỗi khi lấy danh sách loại chứng chỉ: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết loại chứng chỉ theo ID
   */
  static async layChiTietLoaiChungChi(id) {
    try {
      const loaiChungChi = await loai_chung_chi.findByPk(id);
      
      if (!loaiChungChi) {
        throw new Error(`Loại chứng chỉ với id ${id} không tồn tại`);
      }

      return {
        data: loaiChungChi,
      };
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết loại chứng chỉ:", error);
      throw error;
    }
  }

  /**
   * Tạo loại chứng chỉ mới
   */
  static async taoLoaiChungChi(data) {
    try {
      const { ten_loai_chung_chi, mo_ta, xet_tot_nghiep, tinh_trang } = data;

      // Kiểm tra dữ liệu đầu vào
      if (!ten_loai_chung_chi || typeof ten_loai_chung_chi !== 'string' || ten_loai_chung_chi.trim() === '') {
        throw new Error('Tên loại chứng chỉ không được để trống và phải là chuỗi hợp lệ');
      }

      // Kiểm tra tên loại chứng chỉ đã tồn tại chưa
      const tenLoaiChungChiTonTai = await loai_chung_chi.findOne({
        where: {
          ten_loai_chung_chi: ten_loai_chung_chi.trim(),
        },
      });

      if (tenLoaiChungChiTonTai) {
        throw new Error(`Tên loại chứng chỉ "${ten_loai_chung_chi}" đã tồn tại`);
      }

      // Tạo loại chứng chỉ mới
      const loaiChungChiMoi = await loai_chung_chi.create({
        ten_loai_chung_chi: ten_loai_chung_chi.trim(),
        mo_ta: mo_ta ? mo_ta.trim() : null,
        xet_tot_nghiep: xet_tot_nghiep || false,
        tinh_trang: tinh_trang || 'hoạt động',
      });

      return {
        data: loaiChungChiMoi,
      };
    } catch (error) {
      console.error("Lỗi khi tạo loại chứng chỉ:", error);
      throw error;
    }
  }

  /**
   * Cập nhật loại chứng chỉ
   */
  static async capNhatLoaiChungChi(id, data) {
    try {
      const { ten_loai_chung_chi, mo_ta, xet_tot_nghiep, tinh_trang } = data;

      // Kiểm tra loại chứng chỉ tồn tại
      const loaiChungChi = await loai_chung_chi.findByPk(id);
      if (!loaiChungChi) {
        throw new Error(`Loại chứng chỉ với id ${id} không tồn tại`);
      }

      // Kiểm tra tên loại chứng chỉ (nếu có thay đổi)
      if (ten_loai_chung_chi && ten_loai_chung_chi !== loaiChungChi.ten_loai_chung_chi) {
        const tenLoaiChungChiTonTai = await loai_chung_chi.findOne({
          where: {
            ten_loai_chung_chi: ten_loai_chung_chi.trim(),
            id: { [Op.ne]: id },
          },
        });

        if (tenLoaiChungChiTonTai) {
          throw new Error(`Tên loại chứng chỉ "${ten_loai_chung_chi}" đã tồn tại`);
        }
      }

      // Cập nhật loại chứng chỉ
      await loaiChungChi.update({
        ten_loai_chung_chi: ten_loai_chung_chi ? ten_loai_chung_chi.trim() : loaiChungChi.ten_loai_chung_chi,
        mo_ta: mo_ta !== undefined ? (mo_ta ? mo_ta.trim() : null) : loaiChungChi.mo_ta,
        xet_tot_nghiep: xet_tot_nghiep !== undefined ? xet_tot_nghiep : loaiChungChi.xet_tot_nghiep,
        tinh_trang: tinh_trang !== undefined ? tinh_trang : loaiChungChi.tinh_trang,
      });

      return {
        data: loaiChungChi,
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật loại chứng chỉ:", error);
      throw error;
    }
  }

  /**
   * Xóa loại chứng chỉ
   */
  static async xoaLoaiChungChi(id) {
    try {
      // Kiểm tra loại chứng chỉ tồn tại
      const loaiChungChi = await loai_chung_chi.findByPk(id);
      if (!loaiChungChi) {
        throw new Error(`Loại chứng chỉ với id ${id} không tồn tại`);
      }

      // Kiểm tra xem có chứng chỉ nào đang sử dụng loại này không
      const { chung_chi } = require('../models');
      const chungChiDangSuDung = await chung_chi.findOne({
        where: {
          loai_chung_chi_id: id,
        },
      });

      if (chungChiDangSuDung) {
        throw new Error('Không thể xóa loại chứng chỉ này vì đang có chứng chỉ sử dụng');
      }

      // Xóa loại chứng chỉ
      await loaiChungChi.destroy();

      return {
        data: { id },
      };
    } catch (error) {
      console.error("Lỗi khi xóa loại chứng chỉ:", error);
      throw error;
    }
  }

  /**
   * Tìm kiếm loại chứng chỉ
   */
  static async timKiemLoaiChungChi(tuKhoa) {
    try {
      if (!tuKhoa || typeof tuKhoa !== 'string' || tuKhoa.trim() === '') {
        throw new Error('Từ khóa tìm kiếm không được để trống');
      }

      const danhSach = await loai_chung_chi.findAll({
        where: {
          [Op.or]: [
            {
              ten_loai_chung_chi: {
                [Op.like]: `%${tuKhoa.trim()}%`,
              },
            },
            {
              mo_ta: {
                [Op.like]: `%${tuKhoa.trim()}%`,
              },
            },
          ],
        },
        order: [['ten_loai_chung_chi', 'ASC']],
      });

      return {
        data: danhSach,
      };
    } catch (error) {
      console.error("Lỗi khi tìm kiếm loại chứng chỉ:", error);
      throw error;
    }
  }

  /**
   * Thay đổi trạng thái loại chứng chỉ
   */
  static async thayDoiTrangThaiLoaiChungChi(id, tinhTrang) {
    try {
      // Kiểm tra loại chứng chỉ tồn tại
      const loaiChungChi = await loai_chung_chi.findByPk(id);
      if (!loaiChungChi) {
        throw new Error(`Loại chứng chỉ với id ${id} không tồn tại`);
      }

      // Kiểm tra tình trạng hợp lệ
      const tinhTrangHopLe = ['hoạt động', 'tạm dừng'];
      if (!tinhTrang || !tinhTrangHopLe.includes(tinhTrang)) {
        throw new Error(`Tình trạng phải là một trong các giá trị: ${tinhTrangHopLe.join(', ')}`);
      }

      // Cập nhật trạng thái
      await loaiChungChi.update({
        tinh_trang: tinhTrang,
      });

      return {
        data: loaiChungChi,
      };
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái loại chứng chỉ:", error);
      throw error;
    }
  }
}

module.exports = LoaiChungChiService;
