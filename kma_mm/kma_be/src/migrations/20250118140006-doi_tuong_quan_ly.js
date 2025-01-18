"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "doi_tuong_quan_ly",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Thêm autoIncrement cho cột id
        },
        ma_doi_tuong: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        ten_doi_tuong: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        chi_tiet_doi_tuong: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        ghi_chu: {
          type: Sequelize.TEXT,
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
    await queryInterface.dropTable("doi_tuong_quan_ly");
  },
};
