"use strict";
     module.exports = {
       up: async (queryInterface, Sequelize) => {
         await queryInterface.addColumn('giang_vien', 'cccd', {
           type: Sequelize.STRING(20),
           allowNull: true,
         });
         await queryInterface.addColumn('giang_vien', 'ngay_cap', {
           type: Sequelize.DATE,
           allowNull: true,
         });
         await queryInterface.addColumn('giang_vien', 'noi_cap', {
           type: Sequelize.STRING(100),
           allowNull: true,
         });
         await queryInterface.addColumn('giang_vien', 'noi_o_hien_nay', {
           type: Sequelize.STRING(200),
           allowNull: true,
         });
       },

       down: async (queryInterface, Sequelize) => {
         await queryInterface.removeColumn('giang_vien', 'cccd');
         await queryInterface.removeColumn('giang_vien', 'ngay_cap');
         await queryInterface.removeColumn('giang_vien', 'noi_cap');
         await queryInterface.removeColumn('giang_vien', 'noi_o_hien_nay');
       },
     };