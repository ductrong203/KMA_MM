'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('quy_doi_diem', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            he_dao_tao_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'danh_muc_dao_tao',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            diem_min: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            diem_max: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            diem_he_4: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            diem_chu: {
                type: Sequelize.STRING(10),
                allowNull: true
            },
            xep_loai: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add index or constraint if needed
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('quy_doi_diem');
    }
};
