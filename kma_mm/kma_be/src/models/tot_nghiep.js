const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('tot_nghiep', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sinh_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sinh_vien',
        key: 'id'
      }
    },
    lop_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lop',
        key: 'id'
      }
    },
    khoa_dao_tao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'khoa_dao_tao',
        key: 'id'
      }
    },
    he_dao_tao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'danh_muc_dao_tao',
        key: 'id'
      }
    },
    ngay_xet_duyet: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    trang_thai: {
      type: DataTypes.ENUM('cho_duyet', 'da_duyet', 'tu_choi'),
      allowNull: false,
      defaultValue: 'cho_duyet'
    },
    tong_tin_chi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    du_tin_chi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    co_chung_chi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    du_dieu_kien: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    so_hieu_bang: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: "so_hieu_bang"
    },
    xep_loai: {
      type: DataTypes.ENUM('xuat_sac', 'gioi', 'kha', 'trung_binh', 'kem'),
      allowNull: true
    },
    diem_trung_binh_tich_luy: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ngay_cap_bang: {
      type: DataTypes.DATE,
      allowNull: true
    },
    noi_cap_bang: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    dung_han: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    tableName: 'tot_nghiep',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "so_hieu_bang",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "so_hieu_bang" },
        ]
      },
      {
        name: "unique_student_graduation",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sinh_vien_id" },
          { name: "khoa_dao_tao_id" },
        ]
      },
      {
        name: "tot_nghiep_sinh_vien_id_foreign",
        using: "BTREE",
        fields: [
          { name: "sinh_vien_id" },
        ]
      },
      {
        name: "tot_nghiep_lop_id_foreign",
        using: "BTREE",
        fields: [
          { name: "lop_id" },
        ]
      },
      {
        name: "tot_nghiep_khoa_dao_tao_id_foreign",
        using: "BTREE",
        fields: [
          { name: "khoa_dao_tao_id" },
        ]
      },
      {
        name: "tot_nghiep_he_dao_tao_id_foreign",
        using: "BTREE",
        fields: [
          { name: "he_dao_tao_id" },
        ]
      },
    ]
  });
};
