'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tot_nghiep', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sinh_vien_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sinh_vien',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lop_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lop',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      khoa_dao_tao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'khoa_dao_tao',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      he_dao_tao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'danh_muc_dao_tao',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ngay_xet_duyet: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      trang_thai: {
        type: Sequelize.ENUM('cho_duyet', 'da_duyet', 'tu_choi'),
        allowNull: false,
        defaultValue: 'cho_duyet'
      },
      tong_tin_chi: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      du_tin_chi: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      co_chung_chi: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      du_dieu_kien: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      so_hieu_bang: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      xep_loai: {
        type: Sequelize.ENUM('xuat_sac', 'gioi', 'kha', 'trung_binh', 'kem'),
        allowNull: true
      },
      diem_trung_binh_tich_luy: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true
      },
      ghi_chu: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ngay_cap_bang: {
        type: Sequelize.DATE,
        allowNull: true
      },
      noi_cap_bang: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Tạo index để tối ưu truy vấn
    await queryInterface.addIndex('tot_nghiep', ['sinh_vien_id']);
    await queryInterface.addIndex('tot_nghiep', ['lop_id']);
    await queryInterface.addIndex('tot_nghiep', ['khoa_dao_tao_id']);
    await queryInterface.addIndex('tot_nghiep', ['he_dao_tao_id']);
    await queryInterface.addIndex('tot_nghiep', ['trang_thai']);
    await queryInterface.addIndex('tot_nghiep', ['ngay_xet_duyet']);
    
    // Tạo unique constraint để tránh duplicate
    await queryInterface.addConstraint('tot_nghiep', {
      fields: ['sinh_vien_id', 'khoa_dao_tao_id'],
      type: 'unique',
      name: 'unique_student_graduation'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tot_nghiep');
  }
};
