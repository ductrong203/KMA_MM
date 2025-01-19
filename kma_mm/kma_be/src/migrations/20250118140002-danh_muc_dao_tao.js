"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "danh_muc_dao_tao",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Bạn có thể thêm autoIncrement nếu cần cho trường id
        },
        ma_he_dao_tao: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        ten_he_dao_tao: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        trang_thai: {
          type: Sequelize.TINYINT,
          allowNull: true,
        },
      },
      {
        // Optional: Bạn có thể chỉ định thêm thông tin khác tại đây
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
    await queryInterface.dropTable("danh_muc_dao_tao");
  },
};
