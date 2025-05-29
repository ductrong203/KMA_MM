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