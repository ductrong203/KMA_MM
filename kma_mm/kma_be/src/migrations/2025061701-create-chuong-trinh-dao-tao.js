"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("chuong_trinh_dao_tao", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      he_dao_tao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "danh_muc_dao_tao", // Liên kết đến bảng 'danh_muc_he_dao_tao'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      so_quyet_dinh: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ngay_ra_quyet_dinh: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      khoa_dao_tao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "khoa_dao_tao",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      mon_hoc_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "mon_hoc",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("chuong_trinh_dao_tao");
  },
};