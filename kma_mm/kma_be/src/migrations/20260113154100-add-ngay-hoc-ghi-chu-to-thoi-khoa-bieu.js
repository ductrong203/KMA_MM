'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('thoi_khoa_bieu', 'ngay_hoc', {
            type: Sequelize.STRING(100),
            allowNull: true,
            after: 'trang_thai'
        });

        await queryInterface.addColumn('thoi_khoa_bieu', 'ghi_chu', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'ngay_hoc'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('thoi_khoa_bieu', 'ngay_hoc');
        await queryInterface.removeColumn('thoi_khoa_bieu', 'ghi_chu');
    }
};
