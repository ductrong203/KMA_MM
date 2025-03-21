"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "1", // Mặc định là '1'
      },
      role: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1, // Giá trị mặc định là 1
      },
      ho_ten: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      ngay_sinh: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      so_dien_thoai: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      dia_chi: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      chuc_vu: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      trang_thai: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1, // 1: Hoạt động, 0: Không hoạt động
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("users");
  },
};
