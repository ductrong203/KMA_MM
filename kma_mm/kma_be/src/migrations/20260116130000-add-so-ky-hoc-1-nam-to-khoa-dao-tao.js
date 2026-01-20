'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('khoa_dao_tao', 'so_ky_hoc_1_nam', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 2,
            after: 'so_ky_hoc'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('khoa_dao_tao', 'so_ky_hoc_1_nam');
    }
};
