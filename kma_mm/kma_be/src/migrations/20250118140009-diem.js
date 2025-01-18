"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "diem",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Thêm autoIncrement cho cột id
        },
        sinh_vien_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "sinh_vien",
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
        lan_hoc: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        lan_thi: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        diem_tp1: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        diem_tp2: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        diem_gk: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        diem_ck: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        diem_he_4: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        diem_chu: {
          type: Sequelize.STRING(2),
          allowNull: true,
        },
        ngay_cap_nhat: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        trang_thai: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        diem_hp: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
      },
      {
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "sinh_vien_id",
            using: "BTREE",
            fields: [{ name: "sinh_vien_id" }],
          },
          {
            name: "mon_hoc_id",
            using: "BTREE",
            fields: [{ name: "mon_hoc_id" }],
          },
        ],
        timestamps: false, // Điều này giống như trong model của bạn
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("diem");
  },
};
