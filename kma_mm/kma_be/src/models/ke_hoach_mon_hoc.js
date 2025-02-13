const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ke_hoach_mon_hoc', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    danh_muc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'danh_muc_dao_tao',
        key: 'id'
      }
    },
    mon_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ky_hoc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bat_buoc: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ke_hoach_mon_hoc',
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
        name: "danh_muc_id",
        using: "BTREE",
        fields: [
          { name: "danh_muc_id" },
        ]
      },
    ]
  });
};
