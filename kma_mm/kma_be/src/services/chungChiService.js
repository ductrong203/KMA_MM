const { chung_chi, sinh_vien, lop, khoa_dao_tao, danh_muc_dao_tao } = require('../models');
const { Op } = require('sequelize');

class ChungChiService {
  static async layDanhSachLoaiChungChi() {
    try {
      const danhSachLoai = await chung_chi.findAll({
        attributes: [[chung_chi.sequelize.fn('DISTINCT', chung_chi.sequelize.col('loai_chung_chi')), 'loai_chung_chi']],
        where: {
          loai_chung_chi: {
            [Op.ne]: null,
          },
        },
        raw: true,
      });
      console.log(danhSachLoai);

      const loaiChungChi = danhSachLoai.map(item => item.loai_chung_chi).filter(type => type);
      return loaiChungChi;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách loại chứng chỉ: ${error.message}`);
    }
  }

  static async layDanhSachChungChi(heDaoTaoId, khoaDaoTaoId, lopId) {
    try {
      let khoaDaoTaos = [];
      if (heDaoTaoId) {
        khoaDaoTaos = await khoa_dao_tao.findAll({
          where: {
            he_dao_tao_id: heDaoTaoId,
          },
          attributes: ['id'],
        });

        if (khoaDaoTaos.length === 0) {
          throw new Error(`Không tìm thấy khóa đào tạo nào thuộc chương trình đào tạo id ${heDaoTaoId}`);
        }
      }

      const khoaDaoTaoIds = khoaDaoTaos.length > 0 ? khoaDaoTaos.map(item => item.id) : null;

      let lops = [];
      if (khoaDaoTaoId || khoaDaoTaoIds) {
        const dieuKienLop = {};
        if (khoaDaoTaoId) {
          dieuKienLop.khoa_dao_tao_id = khoaDaoTaoId;
        } else if (khoaDaoTaoIds) {
          dieuKienLop.khoa_dao_tao_id = khoaDaoTaoIds;
        }

        lops = await lop.findAll({
          where: dieuKienLop,
          attributes: ['id'],
        });

        if (lops.length === 0) {
          throw new Error(`Không tìm thấy lớp nào thuộc khóa đào tạo id ${khoaDaoTaoId || khoaDaoTaoIds}`);
        }
      }

      const lopIds = lops.length > 0 ? lops.map(item => item.id) : null;

      let sinhViens = [];
      if (lopId || lopIds) {
        const dieuKienSinhVien = {};
        if (lopId) {
          dieuKienSinhVien.lop_id = lopId;
        } else if (lopIds) {
          dieuKienSinhVien.lop_id = lopIds;
        }

        sinhViens = await sinh_vien.findAll({
          where: dieuKienSinhVien,
          attributes: ['id', 'ma_sinh_vien', 'ho_dem', 'ten', 'lop_id'],
        });

        if (sinhViens.length === 0) {
          throw new Error(`Không tìm thấy sinh viên nào thuộc lớp id ${lopId || lopIds}`);
        }
      }

      const sinhVienIds = sinhViens.length > 0 ? sinhViens.map(item => item.id) : null;

      let chungChis = [];
      if (sinhVienIds) {
        chungChis = await chung_chi.findAll({
          where: {
            sinh_vien_id: sinhVienIds,
          },
          order: [['id', 'DESC']],
        });
      }

      if (chungChis.length === 0) {
        return {
          data: [],
        };
      }

      const allLopIds = [...new Set(sinhViens.map(sv => sv.lop_id).filter(id => id))];
      const lopData = await lop.findAll({
        where: { id: allLopIds },
        attributes: ['id', 'ma_lop', 'khoa_dao_tao_id'],
      });

      const allKhoaDaoTaoIds = [...new Set(lopData.map(l => l.khoa_dao_tao_id).filter(id => id))];
      const khoaDaoTaoData = await khoa_dao_tao.findAll({
        where: { id: allKhoaDaoTaoIds },
        attributes: ['id', 'ma_khoa', 'ten_khoa', 'he_dao_tao_id'],
      });

      const allHeDaoTaoIds = [...new Set(khoaDaoTaoData.map(kdt => kdt.he_dao_tao_id).filter(id => id))];
      const danhMucDaoTaoData = await danh_muc_dao_tao.findAll({
        where: { id: allHeDaoTaoIds },
        attributes: ['id', 'ma_he_dao_tao', 'ten_he_dao_tao'],
      });

      const ketQua = chungChis.map(chungChi => {
        const sinhVien = sinhViens.find(sv => sv.id === chungChi.sinh_vien_id) || {};
        const lopSv = lopData.find(l => l.id === sinhVien.lop_id) || {};
        const khoaDaoTao = khoaDaoTaoData.find(kdt => kdt.id === lopSv.khoa_dao_tao_id) || {};
        const danhMucDaoTao = danhMucDaoTaoData.find(dmdt => dmdt.id === khoaDaoTao.he_dao_tao_id) || {};

        return {
          id: chungChi.id,
          maSinhVien: sinhVien.ma_sinh_vien || '',
          hoTen: `${sinhVien.ho_dem || ''} ${sinhVien.ten || ''}`.trim(),
          lop: lopSv.ma_lop || '',
          khoaDaoTao: khoaDaoTao.ten_khoa || '',
          chuongTrinhDaoTao: danhMucDaoTao.ten_he_dao_tao || '',
          diemTrungBinh: chungChi.diem_trung_binh,
          xepLoai: chungChi.xep_loai,
          ghiChu: chungChi.ghi_chu,
          soQuyetDinh: chungChi.so_quyet_dinh,
          ngayKyQuyetDinh: chungChi.ngay_ky_quyet_dinh,
          tinhTrang: chungChi.tinh_trang,
          loaiChungChi: chungChi.loai_chung_chi,
        };
      });

      return {
        data: ketQua,
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chứng chỉ:", error);
      throw error;
    }
  }
}

// Export class thay vì instance
module.exports = ChungChiService;