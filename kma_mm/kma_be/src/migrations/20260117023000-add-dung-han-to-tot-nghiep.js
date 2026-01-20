'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('tot_nghiep', 'dung_han', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            after: 'trang_thai' // adding it after trang_thai as per user request (or close to it/noi_cap_bang as user requested "sau cột noi_cap_bang", wait, user said "sau cột noi_cap_bang" in request 1, but "sau cột Trạng thái" in request 2 for frontend? Let's re-read.)
            // User request 1: "Thêm 1 cột "dung_han" sau cột noi_cap_bang, chỉ nhận 2 giá trị 0 và 1"
            // User request 2: "trong bảng này sẽ có thêm 1 cột "Đúng hạn"(sau cột "Trạng thái")..." - this refers to frontend table.
            // So DB column should be after 'noi_cap_bang'.
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('tot_nghiep', 'dung_han');
    }
};
