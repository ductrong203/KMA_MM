const { danh_muc_dao_tao } = require("../models");

const createTraining = async (newTraining) => {
    console.log(newTraining)
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

module.exports = {
    createTraining
  };
  
