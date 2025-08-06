"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("khoa_dao_tao", "tong_tin_chi", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Tổng số tín chỉ thực tế của khóa đào tạo",
    });

    await queryInterface.addColumn("khoa_dao_tao", "tong_tin_chi_yeu_cau", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 130,
      comment: "Tổng số tín chỉ yêu cầu để tốt nghiệp của khóa đào tạo",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("khoa_dao_tao", "tong_tin_chi");
    await queryInterface.removeColumn("khoa_dao_tao", "tong_tin_chi_yeu_cau");
  },
};
