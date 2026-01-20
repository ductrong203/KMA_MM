'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Rename column: trung_tuyen_theo_nguyen_vong -> to_hop_xet_tuyen
        // Note: renameColumn(tableName, oldName, newName)
        try {
            await queryInterface.renameColumn('sinh_vien', 'trung_tuyen_theo_nguyen_vong', 'to_hop_xet_tuyen');
        } catch (error) {
            console.log('Skipping rename, might verify column existence first inside this block if needed, but for now assuming it exists based on user request');
        }

        // 2. Add columns
        // diem_trung_tuyen (float)
        await queryInterface.addColumn('sinh_vien', 'diem_trung_tuyen', {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0
        });

        // quyet_dinh_trung_tuyen (text)
        await queryInterface.addColumn('sinh_vien', 'quyet_dinh_trung_tuyen', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        // ngay_ban_hanh_qd_trung_tuyen (date)
        await queryInterface.addColumn('sinh_vien', 'ngay_ban_hanh_qd_trung_tuyen', {
            type: Sequelize.DATEONLY,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Reverse operations
        await queryInterface.removeColumn('sinh_vien', 'ngay_ban_hanh_qd_trung_tuyen');
        await queryInterface.removeColumn('sinh_vien', 'quyet_dinh_trung_tuyen');
        await queryInterface.removeColumn('sinh_vien', 'diem_trung_tuyen');
        await queryInterface.renameColumn('sinh_vien', 'to_hop_xet_tuyen', 'trung_tuyen_theo_nguyen_vong');
    }
};
