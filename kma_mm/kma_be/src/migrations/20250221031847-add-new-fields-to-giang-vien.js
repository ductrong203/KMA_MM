"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('giang_vien', 'hoc_ham', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('giang_vien', 'hoc_vi', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('giang_vien', 'chuyen_mon', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('giang_vien', 'trang_thai', {
      type: Sequelize.TINYINT, // 0 = đã nghỉ, 1 = còn hoạt động
      allowNull: true,
    });

    await queryInterface.addColumn('giang_vien', 'gioi_tinh', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });

    await queryInterface.addColumn('giang_vien', 'ngay_sinh', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Thêm cột thuoc_khoa
    await queryInterface.addColumn('giang_vien', 'thuoc_khoa', {
      type: Sequelize.TINYINT, 
      allowNull: true, // Cột này có thể có giá trị null
    });

    await queryInterface.addColumn('giang_vien', 'email', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('giang_vien', 'hoc_ham');
    await queryInterface.removeColumn('giang_vien', 'hoc_vi');
    await queryInterface.removeColumn('giang_vien', 'chuyen_mon');
    await queryInterface.removeColumn('giang_vien', 'trang_thai');
    await queryInterface.removeColumn('giang_vien', 'gioi_tinh');
    await queryInterface.removeColumn('giang_vien', 'ngay_sinh');
    await queryInterface.removeColumn('giang_vien', 'thuoc_khoa');
    await queryInterface.removeColumn('giang_vien', 'email');

  }
};
