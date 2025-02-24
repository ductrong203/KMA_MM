// migration file: <timestamp>-add-thuoc-khoa-to-phong-ban.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('phong_ban', 'thuoc_khoa', {
      type: Sequelize.TINYINT, // Kiểu boolean
      allowNull: true, // Có thể cho phép null, nếu cần có thể thay đổi thành false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('phong_ban', 'thuoc_khoa');
  },
};
