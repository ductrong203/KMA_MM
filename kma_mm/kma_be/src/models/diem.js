const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('diem', {
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
    mon_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'mon_hoc',
        key: 'id'
      }
    },
    lan_hoc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lan_thi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    diem_tp1: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    diem_tp2: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    diem_gk: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    diem_ck: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    diem_he_4: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    diem_chu: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    ngay_cap_nhat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    diem_hp: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'diem',
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
      {
        name: "mon_hoc_id",
        using: "BTREE",
        fields: [
          { name: "mon_hoc_id" },
        ]
      },
    ]
  });
};
