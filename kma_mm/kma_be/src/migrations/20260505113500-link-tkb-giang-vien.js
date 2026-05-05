'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Dọn dẹp rác dữ liệu trước khi tạo khóa ngoại (TKB tham chiếu đến mã GV không tồn tại)
    // Cập nhật ma_giang_vien trong thoi_khoa_bieu thành NULL nếu không tìm thấy trong bảng giang_vien
    await queryInterface.sequelize.query(`
      UPDATE thoi_khoa_bieu 
      SET ma_giang_vien = NULL 
      WHERE ma_giang_vien IS NOT NULL 
      AND ma_giang_vien NOT IN (SELECT ma_giang_vien FROM giang_vien WHERE ma_giang_vien IS NOT NULL);
    `);

    // 2. Chuyển cột ma_giang_vien trong bảng giang_vien thành unique
    await queryInterface.changeColumn('giang_vien', 'ma_giang_vien', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: 'ma_giang_vien_unique'
    });

    // 3. Thêm khóa ngoại vào bảng thoi_khoa_bieu
    await queryInterface.addConstraint('thoi_khoa_bieu', {
      fields: ['ma_giang_vien'],
      type: 'foreign key',
      name: 'fk_tkb_giang_vien_ma',
      references: {
        table: 'giang_vien',
        field: 'ma_giang_vien'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa khóa ngoại trước
    await queryInterface.removeConstraint('thoi_khoa_bieu', 'fk_tkb_giang_vien_ma');

    // Chuyển lại cột ma_giang_vien về trạng thái ban đầu (bỏ unique)
    await queryInterface.changeColumn('giang_vien', 'ma_giang_vien', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: false
    });
  }
};
