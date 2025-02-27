"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("lop", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ma_lop: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      khoa_dao_tao_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "khoa_dao_tao",
          key: "id",
        },
      },
      trang_thai: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("lop");
  },
};
