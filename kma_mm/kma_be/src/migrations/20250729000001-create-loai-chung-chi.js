'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('loai_chung_chi', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ten_loai_chung_chi: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Tên loại chứng chỉ (VD: Trung cấp, Cao đẳng, Đại học, Thạc sĩ)',
      },
      mo_ta: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mô tả chi tiết về loại chứng chỉ',
      },
      xet_tot_nghiep: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Có được xét tốt nghiệp hay không',
      },
      tinh_trang: {
        type: Sequelize.ENUM('hoạt động', 'tạm dừng'),
        allowNull: false,
        defaultValue: 'hoạt động',
        comment: 'Tình trạng hoạt động của loại chứng chỉ',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      indexes: [
        {
          name: 'idx_loai_chung_chi_ten_loai',
          unique: true,
          fields: ['ten_loai_chung_chi'],
        },
        {
          name: 'idx_loai_chung_chi_tinh_trang',
          fields: ['tinh_trang'],
        },
        {
          name: 'idx_loai_chung_chi_xet_tot_nghiep',
          fields: ['xet_tot_nghiep'],
        },
      ],
    });

    // Thêm một số dữ liệu mẫu
    await queryInterface.bulkInsert('loai_chung_chi', [
      {
        ten_loai_chung_chi: 'Trung cấp',
        mo_ta: 'Chứng chỉ trung cấp chuyên nghiệp',
        xet_tot_nghiep: true,
        tinh_trang: 'hoạt động',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        ten_loai_chung_chi: 'Cao đẳng',
        mo_ta: 'Chứng chỉ cao đẳng chuyên nghiệp',
        xet_tot_nghiep: true,
        tinh_trang: 'hoạt động',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        ten_loai_chung_chi: 'Đại học',
        mo_ta: 'Bằng tốt nghiệp đại học',
        xet_tot_nghiep: true,
        tinh_trang: 'hoạt động',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        ten_loai_chung_chi: 'Thạc sĩ',
        mo_ta: 'Bằng thạc sĩ',
        xet_tot_nghiep: true,
        tinh_trang: 'hoạt động',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        ten_loai_chung_chi: 'Chứng chỉ',
        mo_ta: 'Chứng chỉ kỹ năng, nghề nghiệp',
        xet_tot_nghiep: false,
        tinh_trang: 'hoạt động',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('loai_chung_chi');
  },
};
