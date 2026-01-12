require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE || "quan_ly_dao_tao",
    process.env.DB_USERNAME || "root",
    process.env.DB_PASSWORD || "",
    {
        host: process.env.DB_HOST || "localhost",
        port: process.env.PORT || "3306",
        dialect: 'mysql',
        logging: console.log,
    }
);

async function createTable() {
    try {
        await sequelize.authenticate();
        console.log('Connection established successfully.');

        const query = `
      CREATE TABLE IF NOT EXISTS quy_doi_diem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        he_dao_tao_id INT NOT NULL,
        diem_min FLOAT NOT NULL,
        diem_max FLOAT NOT NULL,
        diem_he_4 FLOAT,
        diem_chu VARCHAR(10),
        xep_loai VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (he_dao_tao_id) REFERENCES danh_muc_dao_tao(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

        await sequelize.query(query);
        console.log('Table quy_doi_diem created successfully.');
    } catch (error) {
        console.error('Unable to create table:', error);
    } finally {
        await sequelize.close();
    }
}

createTable();
