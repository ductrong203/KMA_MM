"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm cột tong_tin_chi vào bảng sinh_vien
    await queryInterface.addColumn("sinh_vien", "tong_tin_chi", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });

    // Kiểm tra bảng sinh_vien tồn tại
    const [tables] = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'sinh_vien';`
    );
    if (tables.length === 0) {
      throw new Error('Bảng sinh_vien không tồn tại. Vui lòng chạy migration tạo bảng sinh_vien trước.');
    }

    // Kiểm tra cột id tồn tại
    const [columns] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM sinh_vien LIKE 'id';`
    );
    if (columns.length === 0) {
      throw new Error('Cột id không tồn tại trong bảng sinh_vien.');
    }

    // Kiểm tra bảng diem và thoi_khoa_bieu
    const [diemTables] = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'diem';`
    );
    const [tkbTables] = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'thoi_khoa_bieu';`
    );
    if (diemTables.length === 0 || tkbTables.length === 0) {
      throw new Error('Bảng diem hoặc thoi_khoa_bieu không tồn tại.');
    }

    // Cập nhật tong_tin_chi cho dữ liệu hiện có
    await queryInterface.sequelize.query(`
      UPDATE sinh_vien sv
      SET sv.tong_tin_chi = COALESCE((
        SELECT SUM(mh.so_tin_chi)
        FROM diem d
        JOIN thoi_khoa_bieu tkb ON d.thoi_khoa_bieu_id = tkb.id
        JOIN mon_hoc mh ON tkb.mon_hoc_id = mh.id
        WHERE d.sinh_vien_id = sv.id
        AND COALESCE(d.diem_ck2, d.diem_ck, -1) = (
          SELECT MAX(COALESCE(d2.diem_ck2, d2.diem_ck, -1))
          FROM diem d2
          JOIN thoi_khoa_bieu tkb2 ON d2.thoi_khoa_bieu_id = tkb2.id
          WHERE d2.sinh_vien_id = sv.id AND tkb2.mon_hoc_id = tkb.mon_hoc_id
        )
        AND COALESCE(d.diem_ck2, d.diem_ck, -1) >= 4.0
      ), 0);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa cột tong_tin_chi nếu rollback
    await queryInterface.removeColumn("sinh_vien", "tong_tin_chi");
  },
};