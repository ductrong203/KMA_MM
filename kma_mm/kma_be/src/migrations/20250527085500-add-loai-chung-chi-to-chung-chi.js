'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chung_chi', 'loai_chung_chi', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('chung_chi', 'loai_chung_chi');
  },
};