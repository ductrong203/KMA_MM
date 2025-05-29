const chungChiService = require('../services/chungChiService');

exports.layDanhSachLoaiChungChi = async (req, res) => {
  try {
    const danhSachLoai = await chungChiService.layDanhSachLoaiChungChi();
    return res.status(200).json({
      thongBao: 'Lấy danh sách loại chứng chỉ thành công',
      data: danhSachLoai,
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
    const { sinh_vien_id, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, ngay_ky_quyet_dinh, tinh_trang } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!sinh_vien_id || isNaN(sinh_vien_id) || sinh_vien_id <= 0) {
      return res.status(400).json({
        thongBao: 'Tham số sinh_vien_id là bắt buộc và phải là số nguyên dương',
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
      sinh_vien_id: parseInt(sinh_vien_id),
      diem_trung_binh: diem_trung_binh !== null ? parseFloat(diem_trung_binh) : null,
      xep_loai: xep_loai || null,
      ghi_chu: ghi_chu || null,
      so_quyet_dinh: so_quyet_dinh || null,
      loai_chung_chi: loai_chung_chi || null,
      ngay_ky_quyet_dinh: ngay_ky_quyet_dinh || null,
      tinh_trang,
    };

    // Gọi phương thức từ service
    const ketQua = await chungChiService.taoChungChi(data);

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
    const { sinh_vien_id, diem_trung_binh, xep_loai, ghi_chu, so_quyet_dinh, loai_chung_chi, ngay_ky_quyet_dinh, tinh_trang } = req.body;

    // Kiểm tra id hợp lệ
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({
        thongBao: 'Tham số id phải là số nguyên dương',
      });
    }

    // Kiểm tra sinh_vien_id (nếu có)
    if (sinh_vien_id !== undefined && (isNaN(sinh_vien_id) || sinh_vien_id <= 0)) {
      return res.status(400).json({
        thongBao: 'Tham số sinh_vien_id phải là số nguyên dương',
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
      sinh_vien_id,
      diem_trung_binh,
      xep_loai,
      ghi_chu,
      so_quyet_dinh,
      loai_chung_chi,
      ngay_ky_quyet_dinh,
      tinh_trang,
    };

    // Gọi phương thức từ service
    const ketQua = await chungChiService.chinhSuaChungChi(id, data);

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

    // Gọi phương thức từ service
    const ketQua = await chungChiService.xoaChungChi(id);

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

