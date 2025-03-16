const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('thong_tin_quan_nhan', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sinh_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sinh_vien',
        key: 'id'
      }
    },
    ngay_nhap_ngu: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    cap_bac: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    trinh_do_van_hoa: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    noi_o_hien_nay: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    don_vi_cu_di_hoc: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    loai_luong: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nhom_luong: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    bac_luong: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    he_so_luong: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ngay_nhan_luong: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    chuc_vu: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    suc_khoe: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'thong_tin_quan_nhan',
    timestamps: false,
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
        name: "sinh_vien_id",
        using: "BTREE",
        fields: [
          { name: "sinh_vien_id" },
        ]
      },
    ]
  });
};
