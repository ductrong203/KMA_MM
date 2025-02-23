const { phong_ban } = require("../models");

const createPhongBan = async (phongBan) => {
    console.log(phongBan)
    const {code,name, notes, thuocKhoa } = phongBan;
  
  try {
    const checkPhongBan = await phong_ban.findOne({ where: { ma_phong_ban: code } });
    if (checkPhongBan) {
      throw new Error("Phong ban da ton tai!")
    }
    
    const createdPhongBan = await phong_ban.create({
        ma_phong_ban:code,
        ten_phong_ban:name,
        ghi_chu: notes,
        thuoc_khoa:thuocKhoa
    });

    return {
      status: "OK",
      message: "Success!",
      data: createdPhongBan,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
const getPhongBan = async () => {
  
try {
  return await phong_ban.findAll()

} catch (error) {
  throw new Error(error.message);
}
};

const updatePhongBan = async (code, data) => {
  try {
    console.log(code)
    console.log(data)
    // Kiểm tra phòng ban có tồn tại không
    const phongBan = await phong_ban.findOne({ where: { ma_phong_ban:code } });
    if (!phongBan) {
      console.log("Không tìm thấy phòng ban!");
      return null;
    }

    // Thực hiện cập nhật
    return await phong_ban.update({
      ma_phong_ban: data.code,
      ten_phong_ban: data.name,
      ghi_chu: data.notes,
      thuoc_khoa: data.thuocKhoa
    }, { where: { ma_phong_ban:code } });
  } catch (error) {
    console.error("Lỗi cập nhật:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
    createPhongBan,
    getPhongBan,
    updatePhongBan
  };
  
