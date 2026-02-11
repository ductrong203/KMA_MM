
const { chung_chi, sinh_vien, lop, khoa_dao_tao, danh_muc_dao_tao, loai_chung_chi: LoaiChungChiModel } = require('../models');
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
          order: [['id', 'ASC']],
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
      const { ma_sinh_vien, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, loai_chung_chi_id, ngay_ky_quyet_dinh, tinh_trang } = data;

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

      // Xác định loai_chung_chi_id
      let finalLoaiChungChiId = loai_chung_chi_id || null;

      // Nếu không có loai_chung_chi_id nhưng có loai_chung_chi, tìm ID dựa trên tên
      if (!finalLoaiChungChiId && loai_chung_chi) {
        const loaiChungChiRecord = await LoaiChungChiModel.findOne({
          where: { ten_loai_chung_chi: loai_chung_chi }
        });
        if (loaiChungChiRecord) {
          finalLoaiChungChiId = loaiChungChiRecord.id;
        }
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
        loai_chung_chi_id: finalLoaiChungChiId, // Sử dụng ID đã xác định
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
      const { ma_sinh_vien, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, loai_chung_chi_id, ngay_ky_quyet_dinh, tinh_trang } = data;

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

      // Xác định loai_chung_chi_id
      let loaiChungChiId = chungChi.loai_chung_chi_id; // Giữ nguyên giá trị cũ

      // Nếu có loai_chung_chi_id được gửi trực tiếp, sử dụng nó
      if (loai_chung_chi_id !== undefined) {
        loaiChungChiId = loai_chung_chi_id;
      }
      // Nếu không có loai_chung_chi_id nhưng có thay đổi loai_chung_chi
      else if (loai_chung_chi !== undefined && loai_chung_chi !== chungChi.loai_chung_chi) {
        if (loai_chung_chi) {
          const loaiChungChiRecord = await LoaiChungChiModel.findOne({
            where: { ten_loai_chung_chi: loai_chung_chi }
          });
          if (loaiChungChiRecord) {
            loaiChungChiId = loaiChungChiRecord.id;
          } else {
            loaiChungChiId = null; // Nếu không tìm thấy loại chứng chỉ
          }
        } else {
          loaiChungChiId = null; // Nếu loai_chung_chi là null/empty
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
        loai_chung_chi_id: loaiChungChiId, // Cập nhật loai_chung_chi_id
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

  static async taoLoaiChungChi(data) {
    try {
      const { loai_chung_chi, xet_tot_nghiep } = data;

      // Kiểm tra dữ liệu đầu vào
      if (!loai_chung_chi || typeof loai_chung_chi !== 'string' || loai_chung_chi.trim() === '') {
        throw new Error('Loại chứng chỉ không được để trống và phải là chuỗi hợp lệ');
      }

      // Kiểm tra xem loại chứng chỉ đã tồn tại chưa
      const loaiChungChiTonTai = await chung_chi.findOne({
        where: {
          loai_chung_chi: loai_chung_chi.trim(),
        },
      });

      if (loaiChungChiTonTai) {
        throw new Error(`Loại chứng chỉ "${loai_chung_chi}" đã tồn tại`);
      }

      // Tạo loại chứng chỉ mới bằng cách tạo một bản ghi chứng chỉ với loai_chung_chi
      const chungChiMoi = await chung_chi.create({
        loai_chung_chi: loai_chung_chi.trim(),
        // Các trường khác để null vì đây chỉ là bản ghi để lưu loại chứng chỉ
        sinh_vien_id: null,
        diem_trung_binh: null,
        xep_loai: null,
        ghi_chu: null,
        so_quyet_dinh: null,
        ngay_ky_quyet_dinh: null,
        tinh_trang: 'bình thường',
        xet_tot_nghiep: xet_tot_nghiep || false,
      });

      // Trả về thông tin loại chứng chỉ vừa tạo
      return {
        data: {
          loaiChungChi: chungChiMoi.loai_chung_chi,
          xetTotNghiep: chungChiMoi.xet_tot_nghiep,
        },
      };
    } catch (error) {
      console.error("Lỗi khi tạo loại chứng chỉ:", error);
      throw error;
    }
  }

  static async importChungChi(file, loaiChungChiDefault) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(file.buffer);
      const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      // Map column headers to keys (Case insensitive)
      // Assuming first row is header
      const headers = {};
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        const header = cell.text.toLowerCase().trim();
        if (header.includes('mã')) headers.maSinhVien = colNumber;
        else if (header.includes('điểm')) headers.diemTrungBinh = colNumber;
        else if (header.includes('xếp loại')) headers.xepLoai = colNumber;
        else if (header.includes('ghi chú')) headers.ghiChu = colNumber;
        else if (header.includes('số quyết định')) headers.soQuyetDinh = colNumber;
        else if (header.includes('ngày')) headers.ngayKy = colNumber;
        else if (header.includes('tình trạng')) headers.tinhTrang = colNumber;
        else if (header.includes('loại chứng chỉ')) headers.loaiChungChi = colNumber;
      });

      if (!headers.maSinhVien) {
        throw new Error("File thiếu cột 'Mã SV' hoặc 'Mã sinh viên'");
      }

      const rows = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        rows.push({ row, rowNumber });
      });

      for (const { row, rowNumber } of rows) {
        try {
          const ma_sinh_vien = row.getCell(headers.maSinhVien).text?.trim();
          if (!ma_sinh_vien) continue; // Skip empty rows

          // Validate student
          const sv = await sinh_vien.findOne({ where: { ma_sinh_vien } });
          if (!sv) {
            throw new Error(`Sinh viên mã ${ma_sinh_vien} không tồn tại`);
          }

          // Get other fields
          const diem_trung_binh = headers.diemTrungBinh ? parseFloat(row.getCell(headers.diemTrungBinh).text) : null;
          const xep_loai = headers.xepLoai ? row.getCell(headers.xepLoai).text?.trim() : null;
          const ghi_chu = headers.ghiChu ? row.getCell(headers.ghiChu).text?.trim() : null;
          const so_quyet_dinh = headers.soQuyetDinh ? row.getCell(headers.soQuyetDinh).text?.trim() : null;

          let ngay_ky_quyet_dinh = null;
          if (headers.ngayKy) {
            const dateCell = row.getCell(headers.ngayKy);
            // Handle Date object from Excel
            if (dateCell.value instanceof Date) {
              ngay_ky_quyet_dinh = dateCell.value;
            }
            // Handle string "dd/mm/yyyy" or other formats
            else if (typeof dateCell.value === 'string') {
              const dateStr = dateCell.value.trim();
              // Check for dd/mm/yyyy format
              if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                const part = dateStr.split('/');
                // Month is 0-indexed in JS Date
                ngay_ky_quyet_dinh = new Date(parseInt(part[2]), parseInt(part[1]) - 1, parseInt(part[0]));
              } else {
                // Try standard parsing
                ngay_ky_quyet_dinh = new Date(dateStr);
              }
            } else if (dateCell.text) {
              // Fallback to text property if value is something else but text exists
              const dateStr = dateCell.text.trim();
              if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                const part = dateStr.split('/');
                ngay_ky_quyet_dinh = new Date(parseInt(part[2]), parseInt(part[1]) - 1, parseInt(part[0]));
              } else {
                ngay_ky_quyet_dinh = new Date(dateStr);
              }
            }
          }

          if (ngay_ky_quyet_dinh && isNaN(ngay_ky_quyet_dinh.getTime())) {
            ngay_ky_quyet_dinh = null; // Invalid date
          }

          const tinh_trang_text = headers.tinhTrang ? row.getCell(headers.tinhTrang).text?.trim()?.toLowerCase() : 'bình thường';
          const tinh_trang = (tinh_trang_text === 'tốt nghiệp') ? 'tốt nghiệp' : 'bình thường';

          // Determine Loai Chung Chi
          let loai_chung_chi = headers.loaiChungChi ? row.getCell(headers.loaiChungChi).text?.trim() : null;
          if (!loai_chung_chi) {
            loai_chung_chi = loaiChungChiDefault;
          }

          if (!loai_chung_chi) {
            throw new Error("Chưa xác định loại chứng chỉ");
          }

          // Resolve Loai Chung Chi ID
          let loai_chung_chi_id = null;
          const loaiChungChiRecord = await LoaiChungChiModel.findOne({
            where: { ten_loai_chung_chi: loai_chung_chi }
          });

          if (loaiChungChiRecord) {
            loai_chung_chi_id = loaiChungChiRecord.id;
          }

          // Check if exists (Upsert logic)
          const existingCert = await chung_chi.findOne({
            where: {
              sinh_vien_id: sv.id,
              // Check by loai_chung_chi name as it is what we have
              loai_chung_chi: loai_chung_chi
            }
          });

          if (existingCert) {
            // Update
            await existingCert.update({
              diem_trung_binh: isNaN(diem_trung_binh) ? existingCert.diem_trung_binh : diem_trung_binh,
              xep_loai: xep_loai || existingCert.xep_loai,
              ghi_chu: ghi_chu || existingCert.ghi_chu,
              so_quyet_dinh: so_quyet_dinh || existingCert.so_quyet_dinh,
              ngay_ky_quyet_dinh: ngay_ky_quyet_dinh || existingCert.ngay_ky_quyet_dinh,
              tinh_trang: tinh_trang || existingCert.tinh_trang,
              loai_chung_chi_id: loai_chung_chi_id || existingCert.loai_chung_chi_id
            });
          } else {
            // Create
            await chung_chi.create({
              sinh_vien_id: sv.id,
              diem_trung_binh: isNaN(diem_trung_binh) ? null : diem_trung_binh,
              xep_loai,
              ghi_chu,
              so_quyet_dinh,
              ngay_ky_quyet_dinh,
              tinh_trang,
              loai_chung_chi,
              loai_chung_chi_id,
              xet_tot_nghiep: false
            });
          }

          results.success++;

        } catch (err) {
          results.failed++;
          results.errors.push(`Dòng ${rowNumber}: ${err.message}`);
        }
      }

      return results;

    } catch (error) {
      console.error("Lỗi import:", error);
      throw error;
    }
  }
}

// Export class thay vì instance
module.exports = ChungChiService;