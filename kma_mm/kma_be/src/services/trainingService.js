const { danh_muc_dao_tao } = require("../models");

const createTraining = async (newTraining) => {
    console.log("newTraining:",newTraining)
    const {code,name } = newTraining;
  
  try {
    const checkTraining = await danh_muc_dao_tao.findOne({ where: { ma_he_dao_tao: code } });
    if (checkTraining) {
      return {
        status: "ERR",
        message: "This training already exists!",
      };
    }
    
    const createdTraining = await danh_muc_dao_tao.create({
        ma_he_dao_tao:code,
        ten_he_dao_tao:name,
        trang_thai: 1
    });

    return {
      status: "OK",
      message: "Success!",
      data: createdTraining,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const fetchDanhSachHeDaoTao = async () => {

  try {
    return await danh_muc_dao_tao.findAll()

  } catch (error) {
    throw new Error(error.message);
  }
};

const updateTraining = async (code, data) => {
  try {
    // Kiểm tra phòng ban có tồn tại không
    const daoTao = await danh_muc_dao_tao.findOne({ where: { ma_he_dao_tao:code } });
    if (!daoTao) {
      console.log("Không tìm thấy hệ đào tạo!");
      return null;
    }

    // Thực hiện cập nhật
    return await danh_muc_dao_tao.update({
      ma_he_dao_tao: data.code,
      ten_he_dao_tao: data.name,
      trang_thai: data.active
    }, { where: { ma_he_dao_tao:code } });
  } catch (error) {
    console.error("Lỗi cập nhật:", error.message);
    throw new Error(error.message);
  }
};


module.exports = {
    createTraining,
    fetchDanhSachHeDaoTao,
    updateTraining
  };
  
