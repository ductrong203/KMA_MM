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
      lop_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "lop",
          key: "id",
        },
      },
      mon_hoc_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "mon_hoc",
          key: "id",
        },
      },
      giang_vien_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "giang_vien",
          key: "id",
        },
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
