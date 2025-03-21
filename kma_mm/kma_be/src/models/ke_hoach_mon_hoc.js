const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ke_hoach_mon_hoc', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    khoa_dao_tao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'khoa_dao_tao',
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
    ky_hoc: {
      type: DataTypes.INTEGER,
      allowNull: false
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
        name: "khoa_dao_tao_id",
        using: "BTREE",
        fields: [
          { name: "khoa_dao_tao_id" },
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
