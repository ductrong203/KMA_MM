const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mon_hoc', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_mon_hoc: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ten_mon_hoc: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    so_tin_chi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tinh_diem: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'mon_hoc',
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
    ]
  });
};
