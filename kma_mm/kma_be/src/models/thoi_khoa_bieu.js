const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('thoi_khoa_bieu', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    lop_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'lop',
        key: 'id'
      }
    },
    mon_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'mon_hoc',
        key: 'id'
      }
    },
    giang_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'giang_vien',
        key: 'id'
      }
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
      {
        name: "giang_vien_id",
        using: "BTREE",
        fields: [
          { name: "giang_vien_id" },
        ]
      },
    ]
  });
};
