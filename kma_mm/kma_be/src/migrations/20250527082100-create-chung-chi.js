'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chung_chi', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sinh_vien_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sinh_vien',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      diem_trung_binh: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      xep_loai: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ghi_chu: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      so_quyet_dinh: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ngay_ky_quyet_dinh: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      tinh_trang: {
        type: Sequelize.ENUM('tốt nghiệp', 'bình thường'),
        allowNull: false,
        defaultValue: 'bình thường',
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      indexes: [
        {
          name: 'sinh_vien_id',
          fields: ['sinh_vien_id'],
        },
      ],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chung_chi');
  },
};