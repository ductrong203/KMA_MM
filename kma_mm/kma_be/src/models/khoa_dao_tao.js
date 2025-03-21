const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('khoa_dao_tao', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_khoa: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "ma_khoa"
    },
    ten_khoa: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nam_hoc: {
      type: DataTypes.STRING(9),
      allowNull: true
    },
    he_dao_tao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'danh_muc_dao_tao',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'khoa_dao_tao',
    timestamps: true,
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
        name: "ma_khoa",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ma_khoa" },
        ]
      },
      {
        name: "he_dao_tao_id",
        using: "BTREE",
        fields: [
          { name: "he_dao_tao_id" },
        ]
      },
    ]
  });
};
