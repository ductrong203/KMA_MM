const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { diem, sinh_vien, thoi_khoa_bieu } = models;

const XLSX = require("xlsx");
const fs = require("fs");

class DiemService {
  static async filter({ sinh_vien_id, thoi_khoa_bieu_id, page = 1, pageSize = 10 }) {
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const whereClause = {};

    if (sinh_vien_id) {
      const foundSinhVien = await sinh_vien.findByPk(sinh_vien_id);
      if (foundSinhVien) {
        whereClause.sinh_vien_id = sinh_vien_id;
      } else {
        return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
      }
    }

    if (thoi_khoa_bieu_id) {
      const foundTKB = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
      if (foundTKB) {
        whereClause.thoi_khoa_bieu_id = thoi_khoa_bieu_id;
      } else {
        return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
      }
    }

    const { count, rows } = await diem.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']],
      include: [
        {
            model: sinh_vien,
            as: 'sinh_vien',
            attributes: ['ma_sinh_vien', 'ho_dem', 'ten', 'lop_id'] 
        }
      ]
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
      data: rows
    };
  }

  static async getById(id) {
    return await diem.findByPk(id);
  }

  static async create(data) {
    const { sinh_vien_id, thoi_khoa_bieu_id } = data;

    const sinhVienExist = await sinh_vien.findByPk(sinh_vien_id);
    if (!sinhVienExist) throw new Error('Sinh viên không tồn tại.');

    const tkbExist = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
    if (!tkbExist) throw new Error('Thời khóa biểu không tồn tại.');

    return await diem.create(data);
  }

  static async createDiemForClass(thoi_khoa_bieu_id) {
    try {
      // Tìm thông tin thời khóa biểu
      const tkb = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
      if (!tkb) {
        throw new Error("Không tìm thấy thời khóa biểu!");
      }

      // Lấy danh sách sinh viên thuộc lớp của thời khóa biểu
      const sinhViens = await sinh_vien.findAll({
        where: { lop_id: tkb.lop_id },
        attributes: ['id'] // Chỉ lấy ID sinh viên
      });

      if (!sinhViens.length) {
        throw new Error("Không có sinh viên nào trong lớp này!");
      }

      // Tạo danh sách điểm cho sinh viên
      const diemList = sinhViens.map(sv => ({
        sinh_vien_id: sv.id,
        thoi_khoa_bieu_id: thoi_khoa_bieu_id,
        lan_hoc: null,
        lan_thi: null,
        diem_tp1: null,
        diem_tp2: null,
        diem_gk: null,
        diem_ck: null,
        diem_he_4: null,
        diem_chu: null,
        ngay_cap_nhat: null,
        trang_thai: null,
        diem_hp: null
      }));

      // Bulk insert vào bảng điểm
      const createdDiem = await diem.bulkCreate(diemList);

      return { message: "Tạo bảng điểm thành công!", data: createdDiem };
    } catch (error) {
      throw error;
    }
  }

  static async themSinhVienHocLaiVaoLop(thoi_khoa_bieu_id, ma_sinh_vien) {
    try {
      // Tìm thông tin thời khóa biểu
      const tkb = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id, {
        attributes: ['id', 'mon_hoc_id'],
      });
      if (!tkb) {
        throw new Error("Không tìm thấy thời khóa biểu!");
      }

      if (!tkb.mon_hoc_id) {
        throw new Error("Thời khóa biểu không có thông tin môn học!");
      }

      // Kiểm tra sinh viên học lại tồn tại dựa trên ma_sinh_vien
      const sinhVienHocLai = await sinh_vien.findOne({
        where: { ma_sinh_vien },
      });
      if (!sinhVienHocLai) {
        throw new Error("Sinh viên học lại không tồn tại!");
      }

      const sinh_vien_id = sinhVienHocLai.id;
      const mon_hoc_id = tkb.mon_hoc_id;

      // Đếm số lần học lại của sinh viên với môn học này
      const soLanHoc = await diem.count({
        include: [
          {
            model: thoi_khoa_bieu,
            as: 'thoi_khoa_bieu', // Giả định alias trong quan hệ
            where: { mon_hoc_id: mon_hoc_id },
          },
        ],
        where: {
          sinh_vien_id: sinh_vien_id,
        },
      });

      // Tính lan_hoc mới, bắt đầu từ 2
      const newLanHoc = soLanHoc + 1;

      // Tạo bản ghi điểm mới cho sinh viên học lại
      const newDiem = await diem.create({
        sinh_vien_id: sinh_vien_id,
        thoi_khoa_bieu_id: thoi_khoa_bieu_id,
        lan_hoc: newLanHoc,
        lan_thi: null,
        diem_tp1: null,
        diem_tp2: null,
        diem_gk: null,
        diem_ck: null,
        diem_he_4: null,
        diem_chu: null,
        ngay_cap_nhat: null,
        trang_thai: 'hoc_lai', // Luôn là học lại vì bắt đầu từ 2
        diem_hp: null,
      });

      return { 
        message: `Thêm sinh viên học lại môn này lần ${newLanHoc} thành công!`, 
        data: newDiem 
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const record = await diem.findByPk(id);
    if (!record) throw new Error('Điểm không tồn tại.');

    const { sinh_vien_id, thoi_khoa_bieu_id } = data;

    if (sinh_vien_id) {
      const sinhVienExist = await sinh_vien.findByPk(sinh_vien_id);
      if (!sinhVienExist) throw new Error('Sinh viên không tồn tại.');
    }

    if (thoi_khoa_bieu_id) {
      const tkbExist = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
      if (!tkbExist) throw new Error('Thời khóa biểu không tồn tại.');
    }

    return await record.update(data);
  }

  static async delete(id) {
    const record = await diem.findByPk(id);
    if (!record) throw new Error('Điểm không tồn tại.');
    await record.destroy();
    return { message: 'Xóa thành công!' };
  }

  static async importExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Chuyển sheet thành mảng 2D
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (rows.length === 0) {
        throw new Error("File Excel rỗng!");
      }

      // Tìm dòng tiêu đề
      const headerRowIndex = rows.findIndex((row) => row.includes("Mã Sinh Viên"));
      if (headerRowIndex === -1) {
        throw new Error("Không tìm thấy tiêu đề hợp lệ!");
      }

      // Chuyển tất cả tiêu đề về chữ thường
      const headers = rows[headerRowIndex].map((h) => h.toLowerCase().trim());
      const dataRows = rows.slice(headerRowIndex + 1);

      // Xác định vị trí cột dựa vào headers
      const maSVIndex = headers.indexOf("mã sinh viên");
      const hoTenStartIndex = headers.indexOf("họ và tên"); // Cột đầu tiên chứa họ đệm
      const lopIndex = headers.indexOf("lớp");
      const diemTP1Index = headers.indexOf("điểm thành phần 1");
      const diemTP2Index = headers.indexOf("điểm thành phần 2");

      if (maSVIndex === -1 || hoTenStartIndex === -1 || lopIndex === -1) {
        throw new Error("Không tìm thấy cột hợp lệ!");
      }

      // **Tìm tất cả các cột liên quan đến họ tên**
      let hoTenIndexes = [];
      for (let i = hoTenStartIndex; i < headers.length; i++) {
        if (headers[i] === "lớp") break; // Khi tới cột "Lớp", dừng lại
        hoTenIndexes.push(i);
      }

      const jsonResult = [];

      for (let row of dataRows) {
        let ma_sinh_vien = row[maSVIndex] || "";
        let lop = row[lopIndex] || "";

        // **Ghép tất cả các phần trong "Họ và tên"**
        let ho_va_ten = hoTenIndexes
          .map((idx) => row[idx])
          .filter((val) => val !== "") // Loại bỏ ô rỗng
          .join(" "); // Ghép lại thành một chuỗi

        //logic xử lý Điểm
        let diem_tp1 = null;
        if (diemTP1Index !== -1) {
          let diem1 = row[diemTP1Index];

          // Kiểm tra nếu có dấu phẩy, đổi thành dấu chấm
          if (typeof diem1 === "string") {
            diem1 = diem1.replace(",", ".").trim();
          }

          // Chuyển thành số thực nếu hợp lệ
          if (!isNaN(Number(diem1))) {
            diem_tp1 = parseFloat(Number(diem1).toFixed(2));
          } else if (diem1 !== "") {
            diem_tp1 = diem1; // Nếu là chuỗi, giữ nguyên giá trị
          }
        }

        let diem_tp2 = null;
        if (diemTP2Index !== -1) {
          let diem2 = row[diemTP2Index];

          // Kiểm tra nếu có dấu phẩy, đổi thành dấu chấm
          if (typeof diem2 === "string") {
            diem2 = diem2.replace(",", ".").trim();
          }

          // Chuyển thành số thực nếu hợp lệ
          if (!isNaN(Number(diem2))) {
            diem_tp2 = parseFloat(Number(diem2).toFixed(2));
          } else if (diem2 !== "") {
            diem_tp2 = diem2; // Nếu là chuỗi, giữ nguyên giá trị
          }
        }

        if (ma_sinh_vien !== "") {
          jsonResult.push({
            ma_sinh_vien,
            ho_va_ten: ho_va_ten.trim(),
            lop,
            diem_tp1,
            diem_tp2
          });
        }
      }

      fs.unlinkSync(filePath); // Xóa file sau khi xử lý xong
      return jsonResult;
    } catch (error) {
      throw new Error("Lỗi xử lý file Excel: " + error.message);
    }
  }

  static async importExcelCuoiKy(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Chuyển sheet thành mảng 2D
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (rows.length === 0) {
        throw new Error("File Excel rỗng!");
      }

      // Tìm dòng tiêu đề
      const headerRowIndex = rows.findIndex((row) => row.includes("STT"));
      if (headerRowIndex === -1) {
        throw new Error("Không tìm thấy tiêu đề hợp lệ!");
      }

      // Chuyển tất cả tiêu đề về chữ thường
      const headers = rows[headerRowIndex].map((h) => h.toLowerCase().trim());
      const dataRows = rows.slice(headerRowIndex + 1);

      // Xác định vị trí cột dựa vào headers
      const sttIndex = headers.indexOf("stt");
      const sbdIndex = headers.indexOf("sbd");
      const maHVSVIndex = headers.indexOf("mã hvsv");
      const hoDemIndex = headers.indexOf("họ đệm");
      const tenIndex = headers.indexOf("tên");
      const lopIndex = headers.indexOf("lớp");
      const diemIndex = headers.indexOf("điểm");
      const ghiChuIndex = headers.indexOf("ghi chú");

      if (sttIndex === -1 || sbdIndex === -1 || maHVSVIndex === -1 || hoDemIndex === -1 || tenIndex === -1 || lopIndex === -1 || diemIndex === -1) {
        throw new Error("Không tìm thấy cột hợp lệ!");
      }

      const jsonResult = [];

      for (let row of dataRows) {
        let stt = row[sttIndex];
        let sbd = row[sbdIndex];
        let ma_hvsv = row[maHVSVIndex];
        let ho_dem = row[hoDemIndex];
        let ten = row[tenIndex];
        let lop = row[lopIndex];
        let diemRaw = row[diemIndex];
        let ghi_chu = "";

        // Kiểm tra nếu có ghi chú
        if (ghiChuIndex !== -1) {
          ghi_chu = row[ghiChuIndex] || "";
        }

        let diem = null;
        if (typeof diemRaw === "string") {
          diemRaw = diemRaw.replace(",", ".").trim();
        }

        if (diemRaw === "") {
          diem = null;
        } else if (!isNaN(Number(diemRaw))) {
          diem = parseFloat(Number(diemRaw).toFixed(2));
        } else {
          diem = diemRaw; 
        }

        if (ma_hvsv !== "") {
          jsonResult.push({
            stt: stt,
            sbd: sbd,
            ma_hvsv: ma_hvsv,
            ho_dem: ho_dem,
            ten: ten,
            lop: lop,
            diem: diem,
            ghi_chu: ghi_chu
          });
        }
      }

      // Xóa file sau khi xử lý
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Lỗi khi xóa file: ${filePath}`, err);
          } else {
            console.log(`Đã xóa file: ${filePath}`);
          }
        });
      }

      return jsonResult;
    } catch (error) {
      throw new Error("Lỗi xử lý file Excel: " + error.message);
    }
  }
}

module.exports = DiemService;