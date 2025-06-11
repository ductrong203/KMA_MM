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

  static async taoChungChi(data) {
    try {
      const { ma_sinh_vien, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, ngay_ky_quyet_dinh, tinh_trang } = data;

      // Kiểm tra ma_sinh_vien có tồn tại
      const sinhVien = await sinh_vien.findOne({ where: { ma_sinh_vien } });
      if (!sinhVien) {
        throw new Error(`Sinh viên với mã ${ma_sinh_vien} không tồn tại`);
      }

      // Kiểm tra tinh_trang hợp lệ
      const tinhTrangHopLe = ['tốt nghiệp', 'bình thường'];
      if (!tinh_trang || !tinhTrangHopLe.includes(tinh_trang)) {
        throw new Error(`Tình trạng phải là một trong các giá trị: ${tinhTrangHopLe.join(', ')}`);
      }

      // Xử lý ngay_ky_quyet_dinh
      let ngayKyQuyetDinh = ngay_ky_quyet_dinh ? new Date(ngay_ky_quyet_dinh) : null;
      if (ngay_ky_quyet_dinh && isNaN(ngayKyQuyetDinh.getTime())) {
        throw new Error('Ngày ký quyết định không hợp lệ');
      }

      // Tạo chứng chỉ mới
      const chungChiMoi = await chung_chi.create({
        sinh_vien_id: sinhVien.id, // Sử dụng id của sinh viên tìm được
        diem_trung_binh,
        xep_loai,
        ghi_chu,
        so_quyet_dinh,
        loai_chung_chi,
        ngay_ky_quyet_dinh: ngayKyQuyetDinh,
        tinh_trang,
      });

      // Lấy thông tin sinh viên và các bảng liên quan để trả về
      const lopSv = await lop.findByPk(sinhVien.lop_id, {
        attributes: ['id', 'ma_lop', 'khoa_dao_tao_id'],
      });

      const khoaDaoTao = await khoa_dao_tao.findByPk(lopSv?.khoa_dao_tao_id, {
        attributes: ['id', 'ma_khoa', 'ten_khoa', 'he_dao_tao_id'],
      });

      const danhMucDaoTao = await danh_muc_dao_tao.findByPk(khoaDaoTao?.he_dao_tao_id, {
        attributes: ['id', 'ma_he_dao_tao', 'ten_he_dao_tao'],
      });

      // Định dạng kết quả trả về
      const ketQua = {
        id: chungChiMoi.id,
        maSinhVien: sinhVien.ma_sinh_vien || '',
        hoTen: `${sinhVien.ho_dem || ''} ${sinhVien.ten || ''}`.trim(),
        lop: lopSv?.ma_lop || '',
        khoaDaoTao: khoaDaoTao?.ten_khoa || '',
        chuongTrinhDaoTao: danhMucDaoTao?.ten_he_dao_tao || '',
        diemTrungBinh: chungChiMoi.diem_trung_binh,
        xepLoai: chungChiMoi.xep_loai,
        ghiChu: chungChiMoi.ghi_chu,
        soQuyetDinh: chungChiMoi.so_quyet_dinh,
        ngayKyQuyetDinh: chungChiMoi.ngay_ky_quyet_dinh,
        tinhTrang: chungChiMoi.tinh_trang,
        loaiChungChi: chungChiMoi.loai_chung_chi,
      };

      return {
        data: ketQua,
      };
    } catch (error) {
      console.error("Lỗi khi tạo chứng chỉ:", error);
      throw error;
    }
  }

  static async chinhSuaChungChi(id, data) {
    try {
      const { ma_sinh_vien, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, ngay_ky_quyet_dinh, tinh_trang } = data;

      // Kiểm tra chứng chỉ tồn tại
      const chungChi = await chung_chi.findByPk(id);
      if (!chungChi) {
        throw new Error(`Chứng chỉ với id ${id} không tồn tại`);
      }

      // Kiểm tra ma_sinh_vien (nếu có)
      let sinhVienId = chungChi.sinh_vien_id;
      if (ma_sinh_vien) {
        const sinhVien = await sinh_vien.findOne({ where: { ma_sinh_vien } });
        if (!sinhVien) {
          throw new Error(`Sinh viên với mã ${ma_sinh_vien} không tồn tại`);
        }
        sinhVienId = sinhVien.id; // Cập nhật sinh_vien_id nếu ma_sinh_vien hợp lệ
      }

      // Kiểm tra tinh_trang (nếu có)
      if (tinh_trang) {
        const tinhTrangHopLe = ['tốt nghiệp', 'bình thường'];
        if (!tinhTrangHopLe.includes(tinh_trang)) {
          throw new Error(`Tình trạng phải là một trong các giá trị: ${tinhTrangHopLe.join(', ')}`);
        }
      }

      // Kiểm tra ngay_ky_quyet_dinh (nếu có)
      let ngayKyQuyetDinh;
      if (ngay_ky_quyet_dinh !== undefined) {
        ngayKyQuyetDinh = ngay_ky_quyet_dinh ? new Date(ngay_ky_quyet_dinh) : null;
        if (ngay_ky_quyet_dinh && isNaN(ngayKyQuyetDinh.getTime())) {
          throw new Error('Ngày ký quyết định không hợp lệ');
        }
      }

      // Cập nhật chứng chỉ
      await chungChi.update({
        sinh_vien_id: sinhVienId, // Sử dụng sinhVienId đã xác định
        diem_trung_binh: diem_trung_binh !== undefined ? diem_trung_binh : chungChi.diem_trung_binh,
        xep_loai: xep_loai !== undefined ? xep_loai : chungChi.xep_loai,
        ghi_chu: ghi_chu !== undefined ? ghi_chu : chungChi.ghi_chu,
        so_quyet_dinh: so_quyet_dinh !== undefined ? so_quyet_dinh : chungChi.so_quyet_dinh,
        loai_chung_chi: loai_chung_chi !== undefined ? loai_chung_chi : chungChi.loai_chung_chi,
        ngay_ky_quyet_dinh: ngayKyQuyetDinh !== undefined ? ngayKyQuyetDinh : chungChi.ngay_ky_quyet_dinh,
        tinh_trang: tinh_trang !== undefined ? tinh_trang : chungChi.tinh_trang,
      });

      // Lấy thông tin sinh viên và các bảng liên quan để trả về
      const sinhVien = await sinh_vien.findByPk(sinhVienId);
      const lopSv = await lop.findByPk(sinhVien.lop_id, {
        attributes: ['id', 'ma_lop', 'khoa_dao_tao_id'],
      });

      const khoaDaoTao = await khoa_dao_tao.findByPk(lopSv?.khoa_dao_tao_id, {
        attributes: ['id', 'ma_khoa', 'ten_khoa', 'he_dao_tao_id'],
      });

      const danhMucDaoTao = await danh_muc_dao_tao.findByPk(khoaDaoTao?.he_dao_tao_id, {
        attributes: ['id', 'ma_he_dao_tao', 'ten_he_dao_tao'],
      });

      // Định dạng kết quả trả về
      const ketQua = {
        id: chungChi.id,
        maSinhVien: sinhVien.ma_sinh_vien || '',
        hoTen: `${sinhVien.ho_dem || ''} ${sinhVien.ten || ''}`.trim(),
        lop: lopSv?.ma_lop || '',
        khoaDaoTao: khoaDaoTao?.ten_khoa || '',
        chuongTrinhDaoTao: danhMucDaoTao?.ten_he_dao_tao || '',
        diemTrungBinh: chungChi.diem_trung_binh,
        xepLoai: chungChi.xep_loai,
        ghiChu: chungChi.ghi_chu,
        soQuyetDinh: chungChi.so_quyet_dinh,
        ngayKyQuyetDinh: chungChi.ngay_ky_quyet_dinh,
        tinhTrang: chungChi.tinh_trang,
        loaiChungChi: chungChi.loai_chung_chi,
      };

      return {
        data: ketQua,
      };
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa chứng chỉ:", error);
      throw error;
    }
  }

  static async xoaChungChi(id) {
    try {
      // Kiểm tra chứng chỉ tồn tại
      const chungChi = await chung_chi.findByPk(id);
      if (!chungChi) {
        throw new Error(`Chứng chỉ với id ${id} không tồn tại`);
      }

      // Xóa chứng chỉ
      await chungChi.destroy();

      return {
        data: { id },
      };
    } catch (error) {
      console.error("Lỗi khi xóa chứng chỉ:", error);
      throw error;
    }
  }
}

// Export class thay vì instance
module.exports = ChungChiService;