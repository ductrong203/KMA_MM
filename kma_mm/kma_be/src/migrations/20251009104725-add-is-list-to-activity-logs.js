'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activity_logs', 'is_list', {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '0 = No, 1 = Yes'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('activity_logs', 'is_list');
  }
};
