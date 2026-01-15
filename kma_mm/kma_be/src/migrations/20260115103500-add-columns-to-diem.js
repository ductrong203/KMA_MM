'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add quy_dinh_id_ck1
        await queryInterface.addColumn('diem', 'quy_dinh_id_ck1', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            after: 'diem_chuyen_can_1' // Position guess, optional
        });

        // Add quy_dinh_id_ck2
        await queryInterface.addColumn('diem', 'quy_dinh_id_ck2', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            after: 'diem_chuyen_can_2' // Position guess, optional
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('diem', 'quy_dinh_id_ck1');
        await queryInterface.removeColumn('diem', 'quy_dinh_id_ck2');
    }
};
