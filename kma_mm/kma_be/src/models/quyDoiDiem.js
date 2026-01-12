const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class QuyDoiDiem extends Model {
        static associate(models) {
            QuyDoiDiem.belongsTo(models.danh_muc_dao_tao, {
                foreignKey: 'he_dao_tao_id',
                as: 'he_dao_tao'
            });
        }
    }

    QuyDoiDiem.init({
        heDaoTaoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'he_dao_tao_id',
            references: {
                model: 'danh_muc_dao_tao',
                key: 'id'
            }
        },
        diemMin: {
            type: DataTypes.FLOAT,
            allowNull: false,
            field: 'diem_min'
        },
        diemMax: {
            type: DataTypes.FLOAT,
            allowNull: false,
            field: 'diem_max'
        },
        diemHe4: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'diem_he_4'
        },
        diemChu: {
            type: DataTypes.STRING(10),
            allowNull: true,
            field: 'diem_chu'
        },
        xepLoai: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'xep_loai'
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at',
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at',
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'QuyDoiDiem',
        tableName: 'quy_doi_diem',
        underscored: true,
        timestamps: true
    });

    return QuyDoiDiem;
};
