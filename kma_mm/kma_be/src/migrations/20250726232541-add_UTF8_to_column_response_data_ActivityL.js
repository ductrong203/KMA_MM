'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('activity_logs', 'resonse_data', {
      type: Sequelize.TEXT,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  async down(queryInterface, Sequelize) {
    // Chạy khi rollback
    await queryInterface.changeColumn('activity_logs', 'resonse_data', {
      type: Sequelize.TEXT,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  }
};

