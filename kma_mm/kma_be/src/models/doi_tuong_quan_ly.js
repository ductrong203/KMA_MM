const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('doi_tuong_quan_ly', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_doi_tuong: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ten_doi_tuong: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    chi_tiet_doi_tuong: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'doi_tuong_quan_ly',
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
