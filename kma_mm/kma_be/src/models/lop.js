const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const Lop = sequelize.define('lop', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_lop: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    khoa_dao_tao_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'khoa_dao_tao',
        key: 'id'
      }
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'lop',
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
    ]
  });

  Lop.associate = function (models) {
    Lop.belongsTo(models.khoa_dao_tao, {
      foreignKey: 'khoa_dao_tao_id',
      as: 'khoa_dao_tao'
    });
    Lop.hasMany(models.sinh_vien, {
      foreignKey: 'lop_id',
      as: 'sinh_viens'
    });
  };

  return Lop;
};
