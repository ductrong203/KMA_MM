'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tot_nghiep', 'nguoi_duyet_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tot_nghiep', 'nguoi_duyet_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
