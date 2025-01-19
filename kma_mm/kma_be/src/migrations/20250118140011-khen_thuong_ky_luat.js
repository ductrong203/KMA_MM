"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("khen_thuong_ky_luat", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sinh_vien_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sinh_vien",
          key: "id",
        },
      },
      danh_muc_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "danh_muc_khen_ky_luat",
          key: "id",
        },
      },
      ngay_quyet_dinh: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      so_quyet_dinh: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      nguoi_ky: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ly_do: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      hinh_thuc: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      muc_thuong_phat: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      ghi_chu: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ngay_tao: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      nguoi_tao: {
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
    await queryInterface.dropTable("khen_thuong_ky_luat");
  },
};
