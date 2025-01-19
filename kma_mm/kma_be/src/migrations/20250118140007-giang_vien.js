"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "giang_vien",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Thêm autoIncrement cho cột id
        },
        ma_giang_vien: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        ho_ten: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        dia_chi: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        so_dien_thoai: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        username: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        la_giang_vien_moi: {
          type: Sequelize.TINYINT,
          allowNull: true,
        },
        phong_ban_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "phong_ban", // Bảng này phải tồn tại trong cơ sở dữ liệu
            key: "id",
          },
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
            name: "phong_ban_id",
            using: "BTREE",
            fields: [{ name: "phong_ban_id" }],
          },
        ],
        timestamps: false, // Điều này giống như trong model của bạn
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("giang_vien");
  },
};
