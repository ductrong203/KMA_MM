const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('danh_muc_khen_ky_luat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_danh_muc: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ten_danh_muc: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    loai: {
      type: DataTypes.ENUM('khen_thuong','ky_luat'),
      allowNull: true
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'danh_muc_khen_ky_luat',
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
