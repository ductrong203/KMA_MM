"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("thoi_khoa_bieu", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ky_hoc: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      dot_hoc: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      lop_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lop",
          key: "id",
        },
      },
      mon_hoc_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "mon_hoc",
          key: "id",
        },
      },
      giang_vien: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phong_hoc: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tiet_hoc: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      trang_thai: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("thoi_khoa_bieu");
  },
};
