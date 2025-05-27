const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { doi_tuong_quan_ly, sinh_vien, lop, thong_tin_quan_nhan, khoa_dao_tao, danh_muc_dao_tao } = models;
const ExcelJS = require('exceljs');
const fs = require("fs");

class SinhVienService {
  static async createSinhVien(data) {
    try {
      const lopInfo = await lop.findByPk(data.lop_id);
      if (!lopInfo) {
        throw new Error("Lớp không tồn tại");
      }

      const count = await sinh_vien.count({ where: { lop_id: data.lop_id } });
      const maSinhVien = `${lopInfo.ma_lop}${String(count + 1).padStart(2, "0")}`;
      data.ma_sinh_vien = maSinhVien;
      const sinhVien = await sinh_vien.create(data);
        
      // Chuyển đối tượng thành JSON và xóa password
      const sinhVienData = sinhVien.toJSON();
      delete sinhVienData.password;

      return sinhVienData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllSinhViens() {
    return await sinh_vien.findAll({
      include: [
        {
          model: doi_tuong_quan_ly,
          as: "doi_tuong",
          attributes: ["ten_doi_tuong"],
        },
      ],
    });
  }

  static async getAllSinhVienPhanTrang(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const { rows, count } = await sinh_vien.findAndCountAll({
        offset,
        limit,
      });
      if (!rows || rows.length === 0) {
        return { message: "Không tìm thấy sinh viên", students: [], total: count };
      }

      return {
        students: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên");
    }
  }

  static async getStudentsByLopId(lopId) {
    try {
      return await sinh_vien.findAll({ where: { lop_id: lopId } });
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên theo lop_id");
    }
  }

  static async getStudentsByDoiTuongId(doiTuongId) {
    try {
      return await sinh_vien.findAll({ where: { doi_tuong_id: doiTuongId } });
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên theo doi_tuong_id");
    }
  }

  static async getSinhVienById(id) {
    return await sinh_vien.findByPk(id, {
      include: [
        {
          model: doi_tuong_quan_ly,
          as: "doi_tuong",
          attributes: ["ten_doi_tuong"],
        },
      ],
    });
  }

  static async getDanhSachSinhVienExcel({khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id}) {
    try {
      // Kiểm tra tham số đầu vào
      if (!khoa_dao_tao_id && !lop_id && !doi_tuong_quan_ly_id) {
        throw new Error("Phải cung cấp ít nhất một tham số: khoa_dao_tao_id, lop_id, hoặc doi_tuong_quan_ly_id");
      }
      if (lop_id) {
        const lopCheck = await lop.findOne({ 
          where: { 
            id: lop_id, 
            ...(khoa_dao_tao_id && { khoa_dao_tao_id }) // Kiểm tra khoa_dao_tao_id nếu có
          } 
        });
        if (!lopCheck) {
          throw new Error("Lớp không tồn tại hoặc không thuộc khóa đào tạo này");
        }
      }
      if (doi_tuong_quan_ly_id) {
        const doiTuongCheck = await doi_tuong_quan_ly.findByPk(doi_tuong_quan_ly_id);
        if (!doiTuongCheck) {
          throw new Error("Đối tượng quản lý không tồn tại");
        }
      }
      // Xây dựng điều kiện where
      const whereCondition = {};
      if (lop_id) {
        whereCondition.lop_id = lop_id;
      }
      if (doi_tuong_quan_ly_id) {
        whereCondition.doi_tuong_id = doi_tuong_quan_ly_id;
      }

      const sinhViens = await sinh_vien.findAll({
        attributes: [
          'ho_dem',
          'ten',
          'ngay_sinh',
          'gioi_tinh',
          'que_quan',
          'so_dien_thoai',
          'email',
          'ghi_chu'
        ],
        include: [
          {
            model: doi_tuong_quan_ly,
            as: 'doi_tuong',
            attributes: ['ma_doi_tuong'],
            required: true 
          },
          {
            model: thong_tin_quan_nhan,
            as: 'thong_tin_quan_nhans',
            attributes: ['don_vi_cu_di_hoc'],
            required: false
          },
          {
            model: lop,
            as: 'lop',
            attributes: [],
            required: true,
            where: {
              ...(khoa_dao_tao_id && { khoa_dao_tao_id }) // Lọc khoa_dao_tao_id nếu có
            }
          }
        ],
        where: whereCondition,
        order: [['ten', 'ASC']], // Sắp xếp theo tên
        subQuery: false, // Tối ưu hóa truy vấn
        raw: true // Trả về JSON thuần
      });

      if (!sinhViens || sinhViens.length === 0) {
        return { message: "Không tìm thấy sinh viên phù hợp", students: [] };
      }

      // Định dạng dữ liệu cho Excel
      const formattedData = sinhViens.map((sv, index) => ({
        stt: index + 1,
        ho_dem: sv.ho_dem || '',
        ten: sv.ten || '',
        ngay_sinh: sv.ngay_sinh ? new Date(sv.ngay_sinh).toLocaleDateString('vi-VN') : '',
        gioi_tinh: sv.gioi_tinh === 1 ? 'Nam' : sv.gioi_tinh === 0 ? 'Nữ' : '',
        noi_sinh: sv.que_quan || '',
        doi_tuong: sv['doi_tuong.ma_doi_tuong'] || '',
        don_vi_gui_dao_tao: sv['thong_tin_quan_nhans.don_vi_cu_di_hoc'] || '',
        dien_thoai: sv.so_dien_thoai || '',
        email: sv.email || '',
        ghi_chu: sv.ghi_chu || ''
      }));

      return {
        students: formattedData,
        total: sinhViens.length
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên cho Excel: " + error.message);
    }
  }

  static async exportSinhVienToExcel({khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id}) {
    try {
      const { students } = await this.getDanhSachSinhVienExcel( {khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id});
      // if (!students || students.length === 0) {
      //   throw new Error("Không có sinh viên để xuất Excel");
      // }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh sách sinh viên');

      // Định nghĩa tiêu đề cột
      worksheet.columns = [
        { header: 'STT', key: 'stt', width: 5 },
        { header: 'Họ đệm', key: 'ho_dem', width: 20 },
        { header: 'Tên', key: 'ten', width: 15 },
        { header: 'Ngày sinh', key: 'ngay_sinh', width: 12 },
        { header: 'Giới tính', key: 'gioi_tinh', width: 10 },
        { header: 'Nơi sinh', key: 'noi_sinh', width: 25 },
        { header: 'Đối tượng', key: 'doi_tuong', width: 15 },
        { header: 'Đơn vị gửi đào tạo', key: 'don_vi_gui_dao_tao', width: 25 },
        { header: 'Điện thoại', key: 'dien_thoai', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Ghi chú', key: 'ghi_chu', width: 30 }
      ];

      // Thêm dữ liệu
      students.forEach(student => {
        worksheet.addRow(student);
      });

      // Định dạng tiêu đề
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Định dạng các cột
      worksheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });

      // Lưu file vào buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      throw new Error("Lỗi khi xuất file Excel: " + error.message);
    }
  }

  static async updateSinhVien(id, data) {
    const sinhVien = await sinh_vien.findByPk(id);
    if (!sinhVien) return null;
    return await sinhVien.update(data);
  }

  static async deleteSinhVien(id) {
    const sinhVien = await sinh_vien.findByPk(id);
    if (!sinhVien) return null;
    await sinhVien.destroy();
    return sinhVien;
  }

  static async importSinhVien(lop_id, filePath) {
    const transaction = await sequelize.transaction(); // Bắt đầu transaction
    try {
      // Kiểm tra tham số đầu vào
      if (!lop_id) {
        throw new Error("Thiếu lop_id");
      }
      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error("File Excel không tồn tại");
      }

      // Kiểm tra lớp tồn tại
      const lopCheck = await lop.findByPk(lop_id, { transaction });
      if (!lopCheck) {
        throw new Error(`Lớp với id ${lop_id} không tồn tại`);
      }

      // Đọc file Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // Lấy worksheet đầu tiên

      const rows = [];
      worksheet.eachRow((row, rowNumber) => {
        rows.push(row.values.slice(1)); // Bỏ cột đầu tiên nếu là index
      });

      if (rows.length === 0) {
        throw new Error("File Excel rỗng");
      }

      // Tìm dòng tiêu đề
      const headerRowIndex = rows.findIndex((row) =>
        row.some((cell) => cell && cell.toString().toLowerCase().includes("họ đệm"))
      );
      if (headerRowIndex === -1) {
        throw new Error("Không tìm thấy tiêu đề hợp lệ");
      }

      // Chuyển tiêu đề về chữ thường
      const headers = rows[headerRowIndex].map((h) => h.toString().toLowerCase().trim());
      const dataRows = rows.slice(headerRowIndex + 1);

      // Xác định vị trí cột
      const sttIndex = headers.indexOf("stt");
      const hoDemIndex = headers.indexOf("họ đệm");
      const tenIndex = headers.indexOf("tên");
      const ngaySinhIndex = headers.indexOf("ngày sinh");
      const gioiTinhIndex = headers.indexOf("giới tính");
      const noiSinhIndex = headers.indexOf("nơi sinh");
      const doiTuongIndex = headers.indexOf("đối tượng");
      const donViGuiDaoTaoIndex = headers.indexOf("đơn vị gửi đào tạo");
      const dienThoaiIndex = headers.indexOf("điện thoại");
      const emailIndex = headers.indexOf("email");
      const ghiChuIndex = headers.indexOf("ghi chú");

      if (
        hoDemIndex === -1 ||
        tenIndex === -1 ||
        ngaySinhIndex === -1 ||
        gioiTinhIndex === -1 ||
        noiSinhIndex === -1 ||
        doiTuongIndex === -1 ||
        donViGuiDaoTaoIndex === -1 ||
        dienThoaiIndex === -1 ||
        emailIndex === -1 ||
        ghiChuIndex === -1
      ) {
        throw new Error("Không tìm thấy các cột hợp lệ trong file Excel");
      }

      const newSinhViens = [];
      const thongTinQuanNhanRecords = [];

      // Tính toán số thứ tự bắt đầu cho mã sinh viên
      const currentCount = await sinh_vien.count({ where: { lop_id }, transaction });
      let nextSeq = currentCount + 1; // Bắt đầu từ currentCount + 1

      // Xử lý từng dòng dữ liệu
      for (let row of dataRows) {
        // Xử lý họ đệm và tên
        const ho_dem = row[hoDemIndex] ? row[hoDemIndex].toString().trim() : "";
        const ten = row[tenIndex] ? row[tenIndex].toString().trim() : "";
        if (!ho_dem || !ten) {
          throw new Error(`Dòng dữ liệu thiếu họ đệm hoặc tên: ${JSON.stringify(row)}`);
        }

        // Xử lý ngày sinh
        let ngay_sinh = null;
        if (row[ngaySinhIndex]) {
          let date;
          const ngaySinhRaw = row[ngaySinhIndex];

          // Trường hợp 1: Giá trị là đối tượng Date (từ Excel)
          if (ngaySinhRaw instanceof Date) {
            date = ngaySinhRaw;
            if (!isNaN(date)) {
              ngay_sinh = date.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
            }
          } else {
            // Trường hợp 2: Giá trị là chuỗi
            const ngaySinhStr = ngaySinhRaw.toString().trim();
            // Hỗ trợ định dạng D/M/YYYY, DD/MM/YYYY, D-M-YYYY, DD-MM-YYYY
            const regex = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/;
            const match = ngaySinhStr.match(regex);
            if (match) {
              let [_, day, month, year] = match.map(Number);
              day = day.toString().padStart(2, "0");
              month = month.toString().padStart(2, "0");
              date = new Date(year, month - 1, day);
              if (
                !isNaN(date) &&
                date.getDate() === Number(day) &&
                date.getMonth() === Number(month) - 1 &&
                date.getFullYear() === year
              ) {
                ngay_sinh = date.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
              }
            }
          }

          // Ném lỗi nếu không phân tích được ngày sinh
          if (!ngay_sinh) {
            throw new Error(`Định dạng ngày sinh không hợp lệ: ${ngaySinhRaw} cho ${ho_dem} ${ten}`);
          }
        } else {
          throw new Error(`Dòng dữ liệu thiếu ngày sinh: ${ho_dem} ${ten}`);
        }

        // Xử lý giới tính
        let gioi_tinh = null;
        if (row[gioiTinhIndex]) {
          const gioiTinhStr = row[gioiTinhIndex].toString().trim().toLowerCase();
          if (gioiTinhStr === "nam") {
            gioi_tinh = 1;
          } else if (gioiTinhStr === "nữ") {
            gioi_tinh = 0;
          } else {
            throw new Error(`Giới tính không hợp lệ: ${gioiTinhStr} cho ${ho_dem} ${ten}`);
          }
        } else {
          throw new Error(`Dòng dữ liệu thiếu giới tính: ${ho_dem} ${ten}`);
        }

        // Xử lý nơi sinh
        const que_quan = row[noiSinhIndex] ? row[noiSinhIndex].toString().trim() : null;

        // Xử lý đối tượng
        let doi_tuong_id = null;
        if (row[doiTuongIndex]) {
          const ma_doi_tuong = row[doiTuongIndex].toString().trim();
          const doiTuong = await doi_tuong_quan_ly.findOne({
            where: { ma_doi_tuong },
            attributes: ["id"],
            transaction,
          });
          if (doiTuong) {
            doi_tuong_id = doiTuong.id;
          } else {
            throw new Error(`Không tìm thấy đối tượng với mã: ${ma_doi_tuong} cho ${ho_dem} ${ten}`);
          }
        } else {
          throw new Error(`Dòng dữ liệu thiếu mã đối tượng: ${ho_dem} ${ten}`);
        }

        // Xử lý đơn vị gửi đào tạo
        const don_vi_cu_di_hoc = row[donViGuiDaoTaoIndex]
          ? row[donViGuiDaoTaoIndex].toString().trim()
          : null;

        // Xử lý điện thoại, email, ghi chú
        const so_dien_thoai = row[dienThoaiIndex] ? row[dienThoaiIndex].toString().trim() : null;
        const ghi_chu = row[ghiChuIndex] ? row[ghiChuIndex].toString().trim() : null;

        let email = null;
        if (row[emailIndex] != null) {
          const emailRaw = row[emailIndex];
          try {
            let emailStr;
            if (typeof emailRaw === "object" && emailRaw !== null) {
              // Xử lý đối tượng từ ExcelJS
              if (emailRaw.text) {
                emailStr = String(emailRaw.text).trim();
              } else if (emailRaw.value) {
                emailStr = String(emailRaw.value).trim();
              } else if (emailRaw.result) {
                emailStr = String(emailRaw.result).trim();
              } else {
                throw new Error(`Không tìm thấy giá trị chuỗi trong đối tượng email: ${JSON.stringify(emailRaw)}`);
              }
            } else {
              // Xử lý chuỗi hoặc các giá trị khác
              emailStr = String(emailRaw).trim();
            }

            if (emailStr) {
              // Kiểm tra định dạng email (tùy chọn, có thể bỏ nếu không cần)
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(emailStr)) {
                email = emailStr;
              } else {
                throw new Error(`Định dạng email không hợp lệ: ${emailStr} cho ${ho_dem} ${ten}`);
              }
            }
          } catch (err) {
            throw new Error(`Không thể xử lý email: ${JSON.stringify(emailRaw)} cho ${ho_dem} ${ten}. Lỗi: ${err.message}`);
          }
        }

        // Tạo mã sinh viên
        const ma_sinh_vien = `${lopCheck.ma_lop}${nextSeq.toString().padStart(2, "0")}`;
        nextSeq++; // Tăng số thứ tự cho sinh viên tiếp theo

        // Thêm sinh viên mới
        newSinhViens.push({
          ma_sinh_vien,
          ho_dem,
          ten,
          ngay_sinh,
          gioi_tinh,
          que_quan,
          doi_tuong_id,
          so_dien_thoai,
          email,
          ghi_chu,
          lop_id,
          dang_hoc: 1, // Giả sử sinh viên đang học
        });

        // Chuẩn bị thong_tin_quan_nhan
        if (don_vi_cu_di_hoc) {
          thongTinQuanNhanRecords.push({
            sinh_vien_id: null, // Sẽ cập nhật sau khi tạo sinh viên
            don_vi_cu_di_hoc,
          });
        }
      }

      // Thêm sinh viên mới
      const createdSinhViens = await sinh_vien.bulkCreate(newSinhViens, {
        transaction,
        validate: true, // Kích hoạt validation của model
      });

      // Cập nhật sinh_vien_id cho thong_tin_quan_nhan
      const thongTinQuanNhanFinal = thongTinQuanNhanRecords.map((record, index) => ({
        ...record,
        sinh_vien_id: createdSinhViens[index].id,
      }));

      // Thêm thong_tin_quan_nhan
      if (thongTinQuanNhanFinal.length > 0) {
        await thong_tin_quan_nhan.bulkCreate(thongTinQuanNhanFinal, {
          transaction,
          validate: true,
        });
      }

      // Xóa file sau khi xử lý
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Commit transaction
      await transaction.commit();

      return {
        message: "Nhập danh sách sinh viên thành công",
        newCount: createdSinhViens.length,
        thongTinQuanNhanCount: thongTinQuanNhanFinal.length,
      };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw new Error("Lỗi khi nhập danh sách sinh viên: " + error.message);
    }
  }
  
  static async timSinhVienTheoMaHoacFilter(filters) {
    try {
      const { ma_sinh_vien, he_dao_tao_id, khoa_id, lop_id } = filters;
      const where = {};
      if (ma_sinh_vien) where.ma_sinh_vien = ma_sinh_vien;
      if (lop_id) where.lop_id = lop_id;

      const lopWhere = {};
      if (khoa_id) lopWhere.khoa_dao_tao_id = khoa_id;

      const khoaWhere = {};
      if (he_dao_tao_id) khoaWhere.he_dao_tao_id = he_dao_tao_id;

      const sinhVienList = await sinh_vien.findAll({
        where,
        include: [
          {
            model: lop,
            as: 'lop',
            attributes: ['ma_lop'],
            where: lopWhere,
            include: [
              {
                model: khoa_dao_tao,
                as: 'khoa_dao_tao',
                attributes: ['ma_khoa'],
                where: khoaWhere,
                include: [
                  {
                    model: danh_muc_dao_tao,
                    as: 'he_dao_tao',
                    attributes: ['id', 'ten_he_dao_tao'], // Thêm 'id'
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!sinhVienList || sinhVienList.length === 0) {
        throw new Error('Không tìm thấy sinh viên phù hợp');
      }

      return sinhVienList.map(sv => ({
        ma_sinh_vien: sv.ma_sinh_vien,
        ho_dem: sv.ho_dem,
        ten: sv.ten,
        lop: sv.lop?.ma_lop || sv.lop_id,
        khoa: sv.lop?.khoa_dao_tao?.ma_khoa || null,
        he_dao_tao_id: sv.lop?.khoa_dao_tao?.he_dao_tao?.id || null, // Lấy từ id của danh_muc_dao_tao
        ten_he_dao_tao: sv.lop?.khoa_dao_tao?.he_dao_tao?.ten_he_dao_tao || null,
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = SinhVienService;
