"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("mon_hoc", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ma_mon_hoc: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ten_mon_hoc: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      so_tin_chi: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tinh_diem: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
      trang_thai: {
        type: Sequelize.TINYINT,
        allowNull: true,
        defaultValue: 1,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("mon_hoc");
  },
};
