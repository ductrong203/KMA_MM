const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('activity_logs', {
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Role: {
      type: DataTypes.ENUM('admin','daoTao','khaoThi','giamDoc','quanLiSinhVien','sinhVien','unknown'),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    endpoint: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    request_data: {
      type: DataTypes.JSON,
      allowNull: true
    },
    response_status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    resonse_data: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    ip_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  }, {
    sequelize,
    tableName: 'activity_logs',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID" },
        ]
      },
    ]
  });
};
