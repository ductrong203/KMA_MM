# KMA_MM Backend

A Node.js-based backend for managing data using Express, MySQL, and Sequelize.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/kma_mm.git
   ```
2. install packages: "npm install"
3. create database mysql with database name: quan_ly_dao_tao
4. create file ".env" :
   "
   DB_USERNAME=root
   DB_PASSWORD=trong123
   DB_DATABASE=quan_ly_dao_tao
   DB_HOST=127.0.0.1
   DB_DIALECT=mysql
   PORT=3306
   APPPORT=8000
   ACCESS_TOKEN =access_token
   REFRESH_TOKEN=refresh_token
   "
5. open terminal -> "cd src"
6. execute migration: "npx sequelize-cli db:migrate"

7. tao models
   npx sequelize-auto -o "./models" -d quan_ly_dao_tao -h localhost -u root -p 3306 -x trong123 -e mysql

8. run : "npm start"

## User role

1. Phòng đào tạo (người thuộc phòng đào tạo và có quyền)
2. Phòng khảo thí
3. Phòng quản lý sinh viên
4. Thư viện
5. Ban giám đốc
6. Sinh viên
7. Admin
