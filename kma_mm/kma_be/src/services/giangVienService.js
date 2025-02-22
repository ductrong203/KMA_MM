const { giang_vien } = require("../models");
const { phong_ban } = require("../models");

const createGiangVien = async (giangVien) => {
  console.log(giangVien);
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
    }

    // Tạo đối tượng giảng viên để lưu vào DB
    const giangVienData = {
      ma_giang_vien: giangVien.maGiangVien,
      username: giangVien.username,
      password: 1, // Mặc định password
      ho_ten: giangVien.hoTen,
      email: giangVien.email,
      la_giang_vien_moi: giangVien.laGiangVienMoi,
    };

    // Nếu không phải giảng viên mới, thêm các trường phòng ban
    if (giangVien.laGiangVienMoi === 0) {
      giangVienData.thuoc_khoa = giangVien.thuocKhoa;
      giangVienData.phong_ban_id = phongBan.id;
    }

    // Tạo giảng viên trong DB
    const createdGiangVien = await giang_vien.create(giangVienData);

    console.log(createdGiangVien);
    return {
      status: "OK",
      message: "Success!",
      data: createdGiangVien,
    };
  } catch (error) {
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
  console.log(giangVien)
  try {
     // Kiểm tra xem giảng viên đã tồn tại chưa
     const checkGiangVien = await giang_vien.findOne({ where: { ma_giang_vien: maGiangVien } });
     if (!checkGiangVien) {
       throw new Error("Không tìm thấy giảng viên");
     }
 
     let phongBan = null;
 
     // Nếu không phải giảng viên mời, kiểm tra phòng ban
     if (giangVien.laGiangVienMoi === 0) {
       phongBan = await phong_ban.findOne({ where: { ma_phong_ban: giangVien.maPhongBan } });
       if (!phongBan) {
         throw new Error("Phòng ban không tồn tại");
       }
     }

     const giangVienData = {
      ho_ten: giangVien.hoTen,
      email: giangVien.email,
      la_giang_vien_moi: giangVien.laGiangVienMoi,
      so_dien_thoai: giangVien.soDienThoai,
      dia_chi: giangVien.diaChi,
      ngay_sinh: giangVien.ngaySinh,
      gioi_tinh: giangVien.gioiTinh,
      hoc_ham: giangVien.hocHam,
      hoc_vi: giangVien.hocVi,
      chuyen_mon: giangVien.chuyenMon,
      trang_thai: giangVien.trangThai
    };

     // Nếu là giảng viên cơ hữu, cập nhật thông tin phòng ban
    if (giangVien.laGiangVienMoi === 0) {
      giangVienData.thuoc_khoa = giangVien.thuocKhoa;
      giangVienData.phong_ban_id = phongBan.id;
    }else{
      // Nếu chuyển từ cơ hữu sang thỉnh giảng, xóa thông tin phòng ban
      giangVienData.thuoc_khoa = null;
      giangVienData.phong_ban_id = null;
    }

     // Cập nhật giảng viên trong DB
     await giang_vien.update(
      giangVienData,
      {
        where: { ma_giang_vien: maGiangVien }
      }
    );

     // Lấy thông tin giảng viên sau khi cập nhật
    const updatedGiangVien = await giang_vien.findOne({
      where: { ma_giang_vien: maGiangVien }
    });
    return {
      status: "OK",
      message: "Success!",
      data: updatedGiangVien,
    };
  } catch (error) {
    console.error("Lỗi cập nhật:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  createGiangVien,
  getGiangVien,
  updateGiangVien
};

