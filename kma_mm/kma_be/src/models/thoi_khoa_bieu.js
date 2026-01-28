const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const ThoiKhoaBieu = sequelize.define('thoi_khoa_bieu', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ky_hoc: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dot_hoc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    lop_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lop',
        key: 'id'
      }
    },
    mon_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mon_hoc',
        key: 'id'
      }
    },
    giang_vien: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phong_hoc: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tiet_hoc: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    ngay_hoc: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'thoi_khoa_bieu',
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
        name: "lop_id",
        using: "BTREE",
        fields: [
          { name: "lop_id" },
        ]
      },
      {
        name: "mon_hoc_id",
        using: "BTREE",
        fields: [
          { name: "mon_hoc_id" },
        ]
      },
    ]
  });

  ThoiKhoaBieu.associate = function (models) {
    ThoiKhoaBieu.belongsTo(models.lop, { foreignKey: 'lop_id', as: 'lop' });
    ThoiKhoaBieu.belongsTo(models.mon_hoc, { foreignKey: 'mon_hoc_id', as: 'mon_hoc' });
  };

  return ThoiKhoaBieu;
};
