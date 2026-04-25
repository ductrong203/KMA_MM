'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('thoi_khoa_bieu', 'ma_giang_vien', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'mon_hoc_id' // Đặt sau cột mon_hoc_id cho dễ nhìn
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('thoi_khoa_bieu', 'ma_giang_vien');
    }
};
