'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('thoi_khoa_bieu', 'is_locked', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            after: 'ghi_chu'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('thoi_khoa_bieu', 'is_locked');
    }
};
