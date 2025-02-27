("use strict");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("phong_ban", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ma_phong_ban: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ten_phong_ban: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ghi_chu: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      thuoc_khoa: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("phong_ban");
  },
};
