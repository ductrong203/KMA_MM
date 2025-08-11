'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('mon_hoc', 'bao_ve', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      after: 'trang_thai' // Đặt sau trường trang_thai
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('mon_hoc', 'bao_ve');
  }
};
