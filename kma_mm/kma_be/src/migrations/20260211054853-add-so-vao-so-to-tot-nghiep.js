'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tot_nghiep', 'so_vao_so', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'so_hieu_bang'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tot_nghiep', 'so_vao_so');
  }
};
