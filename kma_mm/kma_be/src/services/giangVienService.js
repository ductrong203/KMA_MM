const { giang_vien } = require("../models");
const { phong_ban } = require("../models");

const createGiangVien = async (giangVien) => {
  console.log("Dữ liệu đầu vào:", giangVien);
  try {
    // Kiểm tra xem giảng viên đã tồn tại chưa
    const checkGiangVien = await giang_vien.findOne({ where: { ma_giang_vien: giangVien.maGiangVien } });
    if (checkGiangVien) {
      throw new Error("Giảng viên đã tồn tại!");
    }

    let phongBan = null;

    // Nếu không phải giảng viên mới, kiểm tra phòng ban
    if (giangVien.laGiangVienMoi === 0) {
      phongBan = await phong_ban.findOne({ where: { ma_phong_ban: giangVien.maPhongBan } });
      if (!phongBan) {
        throw new Error("Phòng ban không tồn tại");
      }
      if (phongBan.thuoc_khoa === null) {
        throw new Error(`Phòng ban ${giangVien.maPhongBan} có thuoc_khoa là null trong CSDL`);
      }
    }

    // Tạo đối tượng giảng viên để lưu vào DB
    const giangVienData = {
      ma_giang_vien: giangVien.maGiangVien,
      username: giangVien.username,
      password: 1, // Mặc định password
      ho_ten: giangVien.hoTen,
      email: giangVien.email || '',
      so_dien_thoai: giangVien.soDienThoai || '',
      dia_chi: giangVien.diaChi || '',
      ngay_sinh: giangVien.ngaySinh || null,
      gioi_tinh: giangVien.gioiTinh || '',
      hoc_ham: giangVien.hocHam || '',
      hoc_vi: giangVien.hocVi || '',
      chuyen_mon: giangVien.chuyenMon || '',
      trang_thai: giangVien.trangThai || 1,
      la_giang_vien_moi: giangVien.laGiangVienMoi,
      cccd: giangVien.cccd || '',
      ngay_cap: giangVien.ngayCap || null,
      noi_cap: giangVien.noiCap || '',
      noi_o_hien_nay: giangVien.noiOHienNay || '',
    };

    // Nếu không phải giảng viên mới, thêm các trường phòng ban
    if (giangVien.laGiangVienMoi === 0) {
      giangVienData.thuoc_khoa = phongBan.thuoc_khoa === 1 ? 1 : 0; // Lấy từ phong_ban, đảm bảo là 1/0
      giangVienData.phong_ban_id = phongBan.id;
    }

    // Tạo giảng viên trong DB
    const createdGiangVien = await giang_vien.create(giangVienData);

    console.log("Giảng viên đã tạo:", createdGiangVien);
    return {
      status: "OK",
      message: "Success!",
      data: createdGiangVien,
    };
  } catch (error) {
    console.error("Lỗi tạo giảng viên:", error.message);
    throw new Error(error.message);
  }
};

const getGiangVien = async () => {

  try {
    return await giang_vien.findAll()

  } catch (error) {
    throw new Error(error.message);
  }
};

const updateGiangVien = async (maGiangVien, giangVien) => {
  console.log('Dữ liệu nhận được:', giangVien);
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!maGiangVien || !giangVien) {
      throw new Error('Thiếu mã giảng viên hoặc dữ liệu giảng viên');
    }

    // Kiểm tra xem giảng viên đã tồn tại chưa
    const checkGiangVien = await giang_vien.findOne({ where: { ma_giang_vien: maGiangVien } });
    if (!checkGiangVien) {
      throw new Error('Không tìm thấy giảng viên với mã: ' + maGiangVien);
    }

    // Kiểm tra trùng lặp ma_giang_vien mới (nếu thay đổi)
    if (giangVien.maGiangVien && giangVien.maGiangVien !== maGiangVien) {
      const checkMaGiangVien = await giang_vien.findOne({
        where: { ma_giang_vien: giangVien.maGiangVien },
      });
      if (checkMaGiangVien) {
        throw new Error('Mã giảng viên mới đã tồn tại: ' + giangVien.maGiangVien);
      }
    }

    // Kiểm tra trùng lặp username mới (nếu thay đổi)
    if (giangVien.username && giangVien.username !== checkGiangVien.username) {
      const checkUsername = await giang_vien.findOne({
        where: { username: giangVien.username },
      });
      if (checkUsername) {
        throw new Error('Tên đăng nhập mới đã tồn tại: ' + giangVien.username);
      }
    }

    let phongBan = null;

    // Nếu không phải giảng viên thỉnh giảng, kiểm tra phòng ban
    if (giangVien.laGiangVienMoi === 0) {
      if (!giangVien.maPhongBan) {
        throw new Error('Mã phòng ban là bắt buộc cho giảng viên cơ hữu/nhân viên');
      }
      phongBan = await phong_ban.findOne({ where: { ma_phong_ban: giangVien.maPhongBan } });
      if (!phongBan) {
        throw new Error('Phòng ban không tồn tại với mã: ' + giangVien.maPhongBan);
      }
    }

    // Chuẩn bị dữ liệu để cập nhật
    const giangVienData = {
      ma_giang_vien: giangVien.maGiangVien || checkGiangVien.ma_giang_vien,
      username: giangVien.username || checkGiangVien.username,
      ho_ten: giangVien.hoTen || checkGiangVien.ho_ten,
      email: giangVien.email || null,
      la_giang_vien_moi: giangVien.laGiangVienMoi ?? checkGiangVien.la_giang_vien_moi,
      so_dien_thoai: giangVien.soDienThoai || null,
      dia_chi: giangVien.diaChi || null,
      ngay_sinh: giangVien.ngaySinh || null,
      gioi_tinh: giangVien.gioiTinh || null,
      hoc_ham: giangVien.hocHam || null,
      hoc_vi: giangVien.hocVi || null,
      chuyen_mon: giangVien.chuyenMon || null,
      trang_thai: giangVien.trangThai ?? checkGiangVien.trang_thai,
      cccd: giangVien.cccd || null,
      ngay_cap: giangVien.ngayCap || null,
      noi_cap: giangVien.noiCap || null,
      noi_o_hien_nay: giangVien.noiOHienNay || null,
    };

    // Nếu là giảng viên cơ hữu/nhân viên, cập nhật thông tin phòng ban
    if (giangVien.laGiangVienMoi === 0) {
      giangVienData.thuoc_khoa = giangVien.thuocKhoa ?? false;
      giangVienData.phong_ban_id = phongBan.id;
    } else {
      // Nếu là giảng viên thỉnh giảng, xóa thông tin phòng ban
      giangVienData.thuoc_khoa = null;
      giangVienData.phong_ban_id = null;
    }

    // Cập nhật giảng viên trong database
    await giang_vien.update(giangVienData, {
      where: { ma_giang_vien: maGiangVien },
    });

    // Lấy thông tin giảng viên sau khi cập nhật
    const updatedGiangVien = await giang_vien.findOne({
      where: { ma_giang_vien: giangVienData.ma_giang_vien },
    });

    return {
      status: 'OK',
      message: 'Cập nhật giảng viên thành công!',
      data: updatedGiangVien,
    };
  } catch (error) {
    console.error('Lỗi cập nhật giảng viên:', error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  createGiangVien,
  getGiangVien,
  updateGiangVien
};

