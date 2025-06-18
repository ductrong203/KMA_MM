const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const chuong_trinh_dao_tao = sequelize.define('chuong_trinh_dao_tao', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    he_dao_tao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'danh_muc_dao_tao',
        key: 'id'
      }
    },
    so_quyet_dinh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ngay_ra_quyet_dinh: {
      type: DataTypes.DATE,
      allowNull: true
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'chuong_trinh_dao_tao',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      }
    ]
  });

  chuong_trinh_dao_tao.associate = function(models) {
    chuong_trinh_dao_tao.belongsTo(models.danh_muc_dao_tao, {
      foreignKey: 'he_dao_tao_id',
      as: 'heDaoTao',
    });
    chuong_trinh_dao_tao.belongsTo(models.khoa_dao_tao, {
      foreignKey: 'khoa_dao_tao_id',
      as: 'khoaDaoTao',
    });
    chuong_trinh_dao_tao.belongsTo(models.mon_hoc, {
      foreignKey: 'mon_hoc_id',
      as: 'monHoc',
    });
  };

  return chuong_trinh_dao_tao;
};