'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('quy_dinh_diem', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      diem_thi_toi_thieu: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 2.0
      },
      diem_trung_binh_dat: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 4.0
      },
      diem_giua_ky_toi_thieu: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 4.0
      },
      diem_chuyen_can_toi_thieu: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 4.0
      },
      chinh_sach_hien_tai: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'moi'
      },
      chinh_sach_tuy_chinh: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Chèn cài đặt mặc định
    await queryInterface.bulkInsert('quy_dinh_diem', [{
      diem_thi_toi_thieu: 2.0,
      diem_trung_binh_dat: 4.0,
      diem_giua_ky_toi_thieu: 4.0,
      diem_chuyen_can_toi_thieu: 4.0,
      chinh_sach_hien_tai: 'moi',
      chinh_sach_tuy_chinh: false,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('quy_dinh_diem');
  }
};
