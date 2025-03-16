const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('danh_muc_dao_tao', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_he_dao_tao: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ten_he_dao_tao: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'danh_muc_dao_tao',
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
