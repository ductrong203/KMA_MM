
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE activity_logs
      MODIFY COLUMN resonse_data TEXT
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Giả sử charset cũ là utf8 và collate là utf8_general_ci
    await queryInterface.sequelize.query(`
      ALTER TABLE activity_logs
      MODIFY COLUMN resonse_data TEXT
      CHARACTER SET utf8
      COLLATE utf8_general_ci;
    `);
  }
};
