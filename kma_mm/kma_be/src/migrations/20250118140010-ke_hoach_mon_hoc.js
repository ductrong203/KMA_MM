"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "ke_hoach_mon_hoc",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Thêm autoIncrement cho cột id
        },
        danh_muc_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "danh_muc_dao_tao", // Bảng này phải tồn tại trong cơ sở dữ liệu
            key: "id",
          },
        },
        mon_hoc_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        ky_hoc: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        bat_buoc: {
          type: Sequelize.TINYINT,
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
            name: "danh_muc_id",
            using: "BTREE",
            fields: [{ name: "danh_muc_id" }],
          },
        ],
        timestamps: false, // Điều này giống như trong model của bạn
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ke_hoach_mon_hoc");
  },
};
