"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "danh_muc_khen_ky_luat",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Bạn có thể thêm autoIncrement nếu cần cho trường id
        },
        ma_danh_muc: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        ten_danh_muc: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        loai: {
          type: Sequelize.ENUM("khen_thuong", "ky_luat"),
          allowNull: true,
        },
        mo_ta: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        trang_thai: {
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
        ],
        timestamps: false, // Điều này giống như trong model của bạn
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("danh_muc_khen_ky_luat");
  },
};
