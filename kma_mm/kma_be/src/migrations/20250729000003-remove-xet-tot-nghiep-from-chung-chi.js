'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Xóa cột xet_tot_nghiep từ bảng chung_chi
    await queryInterface.removeColumn('chung_chi', 'xet_tot_nghiep');
  },

  down: async (queryInterface, Sequelize) => {
    // Thêm lại cột xet_tot_nghiep nếu rollback
    await queryInterface.addColumn('chung_chi', 'xet_tot_nghiep', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Có được xét tốt nghiệp hay không',
    });
  },
};
