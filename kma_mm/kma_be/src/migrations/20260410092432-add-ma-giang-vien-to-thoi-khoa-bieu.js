'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('thoi_khoa_bieu', 'ma_giang_vien', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'mon_hoc_id' // Optional: place it after mon_hoc_id column
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('thoi_khoa_bieu', 'ma_giang_vien');
  }
};
