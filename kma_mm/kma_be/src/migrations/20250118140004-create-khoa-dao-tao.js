"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("khoa_dao_tao", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ma_khoa: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      ten_khoa: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      nam_hoc: {
        type: Sequelize.STRING(9), // Ví dụ: '2023-2024'
        allowNull: true,
      },
      he_dao_tao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "danh_muc_dao_tao", // Liên kết đến bảng 'danh_muc_he_dao_tao'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("khoa_dao_tao");
  },
};
