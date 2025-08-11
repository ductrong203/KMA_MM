'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm cột loai_chung_chi_id vào bảng chung_chi
    await queryInterface.addColumn('chung_chi', 'loai_chung_chi_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'loai_chung_chi',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Foreign key tới bảng loai_chung_chi',
    });

    // Thêm index cho foreign key
    await queryInterface.addIndex('chung_chi', ['loai_chung_chi_id'], {
      name: 'idx_chung_chi_loai_chung_chi_id',
    });

    // Di chuyển dữ liệu từ cột loai_chung_chi (string) sang loai_chung_chi_id (foreign key)
    // Trước tiên, kiểm tra xem có dữ liệu nào trong bảng chung_chi không
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM chung_chi WHERE loai_chung_chi IS NOT NULL"
    );

    if (results[0].count > 0) {
      // Cập nhật loai_chung_chi_id dựa trên ten_loai_chung_chi
      await queryInterface.sequelize.query(`
        UPDATE chung_chi cc
        JOIN loai_chung_chi lcc ON cc.loai_chung_chi = lcc.ten_loai_chung_chi
        SET cc.loai_chung_chi_id = lcc.id
        WHERE cc.loai_chung_chi IS NOT NULL
      `);

      // Với những bản ghi không match được, tạo loại chứng chỉ mới
      const [unmatchedRecords] = await queryInterface.sequelize.query(`
        SELECT DISTINCT cc.loai_chung_chi 
        FROM chung_chi cc
        LEFT JOIN loai_chung_chi lcc ON cc.loai_chung_chi = lcc.ten_loai_chung_chi
        WHERE cc.loai_chung_chi IS NOT NULL AND lcc.id IS NULL
      `);

      // Tạo loại chứng chỉ mới cho những bản ghi không match
      for (const record of unmatchedRecords) {
        const loaiChungChi = record.loai_chung_chi;
        if (loaiChungChi && loaiChungChi.trim()) {
          // Insert loại chứng chỉ mới
          await queryInterface.bulkInsert('loai_chung_chi', [{
            ten_loai_chung_chi: loaiChungChi,
            mo_ta: `Loại chứng chỉ được tạo tự động từ dữ liệu cũ: ${loaiChungChi}`,
            xet_tot_nghiep: false,
            tinh_trang: 'hoạt động',
            created_at: new Date(),
            updated_at: new Date(),
          }]);

          // Cập nhật lại foreign key cho những bản ghi này
          await queryInterface.sequelize.query(`
            UPDATE chung_chi cc
            JOIN loai_chung_chi lcc ON cc.loai_chung_chi = lcc.ten_loai_chung_chi
            SET cc.loai_chung_chi_id = lcc.id
            WHERE cc.loai_chung_chi = '${loaiChungChi}'
          `);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa index trước
    await queryInterface.removeIndex('chung_chi', 'idx_chung_chi_loai_chung_chi_id');
    
    // Xóa cột loai_chung_chi_id
    await queryInterface.removeColumn('chung_chi', 'loai_chung_chi_id');
  },
};
