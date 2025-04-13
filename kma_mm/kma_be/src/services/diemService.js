const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { diem, sinh_vien, thoi_khoa_bieu } = models;

const XLSX = require("xlsx");
const fs = require("fs");
const ExcelJS = require("exceljs");

class DiemService {
  // static async filter({ sinh_vien_id, thoi_khoa_bieu_id, page = 1, pageSize = 10 }) {
  //   page = parseInt(page) || 1;
  //   pageSize = parseInt(pageSize) || 10;
  //   const offset = (page - 1) * pageSize;
  //   const whereClause = {};

  //   if (sinh_vien_id) {
  //     const foundSinhVien = await sinh_vien.findByPk(sinh_vien_id);
  //     if (foundSinhVien) {
  //       whereClause.sinh_vien_id = sinh_vien_id;
  //     } else {
  //       return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
  //     }
  //   }

  //   if (thoi_khoa_bieu_id) {
  //     const foundTKB = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
  //     if (foundTKB) {
  //       whereClause.thoi_khoa_bieu_id = thoi_khoa_bieu_id;
  //     } else {
  //       return { totalItems: 0, totalPages: 0, currentPage: page, pageSize, data: [] };
  //     }
  //   }

  //   const { count, rows } = await diem.findAndCountAll({
  //     where: whereClause,
  //     limit: pageSize,
  //     offset: offset,
  //     order: [['id', 'DESC']],
  //     include: [
  //       {
  //           model: sinh_vien,
  //           as: 'sinh_vien',
  //           attributes: ['ma_sinh_vien', 'ho_dem', 'ten'] 
  //       }
  //     ]
  //   });

  //   return {
  //     totalItems: count,
  //     totalPages: Math.ceil(count / pageSize),
  //     currentPage: page,
  //     pageSize: pageSize,
  //     data: rows
  //   };
  // }
  static async filter({ sinh_vien_id, thoi_khoa_bieu_id }) {
    const whereClause = {};
  
    if (sinh_vien_id) {
      const foundSinhVien = await sinh_vien.findByPk(sinh_vien_id);
      if (foundSinhVien) {
        whereClause.sinh_vien_id = sinh_vien_id;
      } else {
        return { data: [] };
      }
    }
  
    if (thoi_khoa_bieu_id) {
      const foundTKB = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
      if (foundTKB) {
        whereClause.thoi_khoa_bieu_id = thoi_khoa_bieu_id;
      } else {
        return { data: [] };
      }
    }
  
    const rows = await diem.findAll({
      where: whereClause,
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

        // Lấy danh sách điểm đã tồn tại
        const existingDiemRecords = await diem.findAll({
            where: {
                thoi_khoa_bieu_id: thoi_khoa_bieu_id,
                sinh_vien_id: sinhViens.map(sv => sv.id)
            },
            attributes: ['sinh_vien_id']
        });

        // Lọc ra những sinh viên chưa có bản ghi điểm
        const existingStudentIds = new Set(existingDiemRecords.map(d => d.sinh_vien_id));
        const newDiemList = sinhViens
            .filter(sv => !existingStudentIds.has(sv.id))
            .map(sv => ({
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

        // Chỉ thêm bản ghi nếu có sinh viên mới
        if (newDiemList.length > 0) {
            await diem.bulkCreate(newDiemList);
        }

        return { message: "Tạo bảng điểm thành công!", data: newDiemList };
    } catch (error) {
        throw error;
    }
  }

  static async update(diemList) {
    try {
        if (!Array.isArray(diemList) || diemList.length === 0) {
            throw new Error('Danh sách điểm cần cập nhật không hợp lệ.');
        }

        const updatedRecords = [];
        
        for (const data of diemList) {
            const { id, sinh_vien_id, thoi_khoa_bieu_id, ...updateData } = data;
            
            const record = await diem.findByPk(id);
            if (!record) {
                throw new Error(`Điểm với ID ${id} không tồn tại.`);
            }

            if (sinh_vien_id) {
                const sinhVienExist = await sinh_vien.findByPk(sinh_vien_id);
                if (!sinhVienExist) {
                    throw new Error(`Sinh viên với ID ${sinh_vien_id} không tồn tại.`);
                }
            }

            if (thoi_khoa_bieu_id) {
                const tkbExist = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
                if (!tkbExist) {
                    throw new Error(`Thời khóa biểu với ID ${thoi_khoa_bieu_id} không tồn tại.`);
                }
            }

            await record.update(updateData);
            updatedRecords.push(record);
        }

        return { message: 'Cập nhật danh sách điểm thành công!', data: updatedRecords };
    } catch (error) {
        throw error;
    }
  }

  static async delete(id) {
    const record = await diem.findByPk(id);
    if (!record) throw new Error('Điểm không tồn tại.');
    await record.destroy();
    return { message: 'Xóa thành công!' };
  }

  static async importExcel(filePath, ids = {}) {
    try {
      const { lop_id, mon_hoc_id } = ids;

      // Kiểm tra tham số đầu vào
      if (!lop_id || !mon_hoc_id) {
        throw new Error("Thiếu lop_id hoặc mon_hoc_id trong form-data");
      }

      // Lấy thoi_khoa_bieu_id từ lop_id và mon_hoc_id
      const tkb = await thoi_khoa_bieu.findOne({
        where: { lop_id, mon_hoc_id },
      });
      if (!tkb) {
        throw new Error(`Không tìm thấy thời khóa biểu với lop_id: ${lop_id}, mon_hoc_id: ${mon_hoc_id}`);
      }
      const thoi_khoa_bieu_id = tkb.id;

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // Lấy worksheet đầu tiên

      const rows = [];
      worksheet.eachRow((row, rowNumber) => {
        rows.push(row.values.slice(1)); // Bỏ cột đầu tiên nếu là index
      });

      if (rows.length === 0) {
        throw new Error("File Excel rỗng!");
      }

      // Tìm dòng tiêu đề
      const headerRowIndex = rows.findIndex((row) =>
        row.some((cell) => cell && cell.toString().toLowerCase().includes("mã sinh viên"))
      );
      if (headerRowIndex === -1) {
        throw new Error("Không tìm thấy tiêu đề hợp lệ!");
      }

      const headers = rows[headerRowIndex].map((h) => h.toString().toLowerCase().trim());
      const dataRows = rows.slice(headerRowIndex + 1);

      // Xác định vị trí cột
      const maSVIndex = headers.indexOf("mã sinh viên");
      const hoTenStartIndex = headers.indexOf("họ và tên");
      const lopIndex = headers.indexOf("lớp");
      const diemTP1Index = headers.indexOf("điểm thành phần 1");
      const diemTP2Index = headers.indexOf("điểm thành phần 2");

      if (maSVIndex === -1 || hoTenStartIndex === -1 || lopIndex === -1) {
        throw new Error("Không tìm thấy cột hợp lệ!");
      }

      // Tìm tất cả các cột liên quan đến họ tên
      let hoTenIndexes = [];
      for (let i = hoTenStartIndex; i < headers.length; i++) {
        if (headers[i] === "lớp") break;
        hoTenIndexes.push(i);
      }

      const jsonResult = [];

      for (let row of dataRows) {
        let ma_sinh_vien = row[maSVIndex] || "";
        if (!ma_sinh_vien) continue; // Bỏ qua nếu không có mã sinh viên

        // Lấy sinh_vien_id từ ma_sinh_vien
        const sv = await sinh_vien.findOne({
          where: { ma_sinh_vien },
          attributes: ["id"],
        });
        if (!sv) {
          console.warn(`Không tìm thấy sinh viên với mã: ${ma_sinh_vien}`);
          continue; // Bỏ qua nếu không tìm thấy sinh viên
        }
        const sinh_vien_id = sv.id;

        // Ghép họ và tên
        let ho_va_ten = hoTenIndexes
          .map((idx) => row[idx])
          .filter((val) => val !== "")
          .join(" ");

        // Xử lý điểm thành phần 1
        let diem_tp1 = null;
        if (diemTP1Index !== -1 && row[diemTP1Index] !== undefined) {
          let diem1 = row[diemTP1Index].toString().replace(",", ".").trim();
          diem_tp1 = !isNaN(Number(diem1)) ? parseFloat(Number(diem1).toFixed(2)) : null;
        }

        // Xử lý điểm thành phần 2
        let diem_tp2 = null;
        if (diemTP2Index !== -1 && row[diemTP2Index] !== undefined) {
          let diem2 = row[diemTP2Index].toString().replace(",", ".").trim();
          diem_tp2 = !isNaN(Number(diem2)) ? parseFloat(Number(diem2).toFixed(2)) : null;
        }

        // Tính diem_gk = 0.3 * diem_tp1 + 0.7 * diem_tp2
        let diem_gk = null;
        if (diem_tp1 !== null && diem_tp2 !== null) {
          diem_gk = parseFloat((0.3 * diem_tp1 + 0.7 * diem_tp2).toFixed(2));
        }

        // Tìm id của bảng diem từ sinh_vien_id và thoi_khoa_bieu_id
        const diemRecord = await diem.findOne({
          where: { sinh_vien_id, thoi_khoa_bieu_id },
          attributes: ["id"],
        });
        const diem_id = diemRecord ? diemRecord.id : null;

        jsonResult.push({
          id: diem_id, // id của bảng diem (null nếu chưa tồn tại)
          sinh_vien_id,
          thoi_khoa_bieu_id,
          diem_tp1,
          diem_tp2,
          diem_gk,
        });
      }

      fs.unlinkSync(filePath); // Xóa file sau khi xử lý
      return jsonResult;
    } catch (error) {
      throw new Error("Lỗi xử lý file Excel: " + error.message);
    }
  }

  static async importExcelCuoiKy(filePath, ids = {}) {
    try {
      const { mon_hoc_id } = ids;
  
      // Kiểm tra tham số đầu vào
      if (!mon_hoc_id) {
        throw new Error("Thiếu mon_hoc_id trong form-data");
      }
  
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
      const maHVSVIndex = headers.indexOf("mã hvsv");
      const diemIndex = headers.indexOf("điểm");
  
      if (maHVSVIndex === -1 || diemIndex === -1) {
        throw new Error("Không tìm thấy cột hợp lệ!");
      }
  
      const jsonResult = [];
  
      for (let row of dataRows) {
        let ma_hvsv = row[maHVSVIndex];
        let diemRaw = row[diemIndex];
  
        // Xử lý điểm cuối kỳ
        let diem_ck = null;
        if (typeof diemRaw === "string") {
          diemRaw = diemRaw.replace(",", ".").trim();
        }
        if (diemRaw !== "") {
          if (!isNaN(Number(diemRaw))) {
            diem_ck = parseFloat(Number(diemRaw).toFixed(2));
          }
        }
  
        if (ma_hvsv !== "") {
          // Lấy sinh_vien_id từ ma_hvsv
          const sv = await sinh_vien.findOne({
            where: { ma_sinh_vien: ma_hvsv },
            attributes: ["id"],
          });
          if (!sv) {
            console.warn(`Không tìm thấy sinh viên với mã: ${ma_hvsv}`);
            continue; // Bỏ qua nếu không tìm thấy sinh viên
          }
          const sinh_vien_id = sv.id;
  
          // Lấy thoi_khoa_bieu_id từ mon_hoc_id
          const tkb = await thoi_khoa_bieu.findOne({
            where: { mon_hoc_id },
          });
          if (!tkb) {
            console.warn(`Không tìm thấy thời khóa biểu với mon_hoc_id: ${mon_hoc_id}`);
            continue; // Bỏ qua nếu không tìm thấy thời khóa biểu
          }
          const thoi_khoa_bieu_id = tkb.id;
  
          // Tìm id của bảng diem từ sinh_vien_id và thoi_khoa_bieu_id
          const diemRecord = await diem.findOne({
            where: { sinh_vien_id, thoi_khoa_bieu_id },
            attributes: ["id"],
          });
          const diem_id = diemRecord ? diemRecord.id : null;
  
          jsonResult.push({
            id: diem_id, // id của bảng diem (null nếu chưa tồn tại)
            sinh_vien_id,
            thoi_khoa_bieu_id,
            diem_ck,
          });
        }
      }
  
      // Xóa file sau khi xử lý
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
  
      return jsonResult;
    } catch (error) {
      throw new Error("Lỗi xử lý file Excel: " + error.message);
    }
  }
}

module.exports = DiemService;