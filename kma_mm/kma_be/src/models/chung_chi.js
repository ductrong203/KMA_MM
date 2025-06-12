const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chung_chi', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    sinh_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sinh_vien',
        key: 'id',
      },
    },
    diem_trung_binh: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    xep_loai: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    so_quyet_dinh: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ngay_ky_quyet_dinh: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tinh_trang: {
      type: DataTypes.ENUM('tốt nghiệp', 'bình thường'),
      allowNull: false,
      defaultValue: 'bình thường',
    },
    loai_chung_chi: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'chung_chi',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }],
      },
      {
        name: 'sinh_vien_id',
        using: 'BTREE',
        fields: [{ name: 'sinh_vien_id' }],
      },
    ],
  });
};