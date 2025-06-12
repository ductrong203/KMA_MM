const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { diem, sinh_vien, thoi_khoa_bieu, lop } = models;

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
  static async getByKhoaIdVaMonId(khoa_id, mon_id) {
    try {
      // Lấy danh sách lớp thuộc khóa đào tạo
      const lops = await lop.findAll({
        where: {
          khoa_dao_tao_id: khoa_id,
        },
        attributes: ["id"],
      });
  
      // Lấy danh sách ID lớp
      const lopIds = lops.map((item) => item.id);
      if (lopIds.length === 0) {
        throw new Error(`Không tìm thấy lớp nào thuộc khóa đào tạo id ${khoa_id}`);
      }
  
      // Lấy danh sách thời khóa biểu dựa trên lớp và môn học
      const thoiKhoaBieus = await thoi_khoa_bieu.findAll({
        where: {
          lop_id: lopIds,
          mon_hoc_id: mon_id,
        },
        attributes: ["id"],
      });
  
      // Lấy danh sách ID thời khóa biểu
      const thoiKhoaBieuIds = thoiKhoaBieus.map((tkb) => tkb.id);
      if (thoiKhoaBieuIds.length === 0) {
        throw new Error(`Không tìm thấy thời khóa biểu nào cho lớp thuộc khóa đào tạo id ${khoa_id} và môn học id ${mon_id}`);
      }
  
      // Lấy danh sách điểm dựa trên thời khóa biểu
      const diems = await diem.findAll({
        where: {
          thoi_khoa_bieu_id: thoiKhoaBieuIds,
        },
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
        data: diems
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách điểm:", error);
      throw error;
    }
  }

  static async create(data) {
    const { sinh_vien_id, thoi_khoa_bieu_id } = data;

    const sinhVienExist = await sinh_vien.findByPk(sinh_vien_id);
    if (!sinhVienExist) throw new Error('Sinh viên không tồn tại.');

    const tkbExist = await thoi_khoa_bieu.findByPk(thoi_khoa_bieu_id);
    if (!tkbExist) throw new Error('Thời khóa biểu không tồn tại.');

    const existingDiem = await diem.findOne({
      where: { sinh_vien_id, thoi_khoa_bieu_id },
    });
    if (existingDiem) {
      throw new Error(`Bảng điểm đã tồn tại cho thời khoá biểu id ${thoi_khoa_bieu_id} của sinh viên có id ${sinh_vien_id}`);
    }

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
    const transaction = await sequelize.transaction(); // Bắt đầu transaction
    try {
      const { mon_hoc_id, khoa_dao_tao_id, lop_id } = ids;
  
      // Kiểm tra tham số đầu vào
      if (!mon_hoc_id || !khoa_dao_tao_id) {
        throw new Error("Thiếu mon_hoc_id hoặc khoa_dao_tao_id trong form-data");
      }
  
      // Nếu có lop_id, kiểm tra xem nó thuộc khoa_dao_tao_id không
      if (lop_id) {
        const lopCheck = await lop.findOne({
          where: { id: lop_id, khoa_dao_tao_id },
          transaction,
        });
        if (!lopCheck) {
          throw new Error(`Lớp với lop_id=${lop_id} không thuộc khoa_dao_tao_id=${khoa_dao_tao_id}`);
        }
      }
  
      // Lấy danh sách sinh viên dựa trên mon_hoc_id, khoa_dao_tao_id, và lop_id (nếu có)
      const sinhVienData = await sinh_vien.findAll({
        attributes: ["id", "ma_sinh_vien", "ho_dem", "ten"],
        include: [
          {
            model: diem,
            as: "diems",
            attributes: ["id", "diem_ck"],
            required: true,
            include: [
              {
                model: thoi_khoa_bieu,
                as: "thoi_khoa_bieu",
                attributes: [],
                where: { mon_hoc_id },
                required: true,
                include: [
                  {
                    model: lop,
                    as: "lop",
                    attributes: [],
                    where: { khoa_dao_tao_id, ...(lop_id && { id: lop_id }) }, // Lọc theo lop_id nếu có
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            model: lop,
            as: "lop",
            attributes: ["ma_lop"],
            required: false, // Bao gồm sinh viên học lại từ khóa/lớp khác
          },
        ],
        group: ["sinh_vien.id", "sinh_vien.ma_sinh_vien", "sinh_vien.ho_dem", "sinh_vien.ten", "lop.ma_lop", "diems.id", "diems.diem_ck"],
        subQuery: false,
        transaction,
      });
  
      if (!sinhVienData || sinhVienData.length === 0) {
        throw new Error("Không tìm thấy sinh viên nào phù hợp với mon_hoc_id và khoa_dao_tao_id");
      }
  
      // Chuyển sheet Excel thành JSON
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (rows.length === 0) {
        throw new Error("File Excel rỗng!");
      }
  
      // Tìm dòng tiêu đề
      const headerRowIndex = rows.findIndex((row) => row.includes("STT"));
      if (headerRowIndex === -1) {
        throw new Error("Không tìm thấy tiêu đề hợp lệ!");
      }
  
      // Chuyển tiêu đề về chữ thường
      const headers = rows[headerRowIndex].map((h) => h.toLowerCase().trim());
      const dataRows = rows.slice(headerRowIndex + 1);
  
      // Xác định vị trí cột
      const maHVSVIndex = headers.indexOf("mã hvsv");
      const diemIndex = headers.indexOf("điểm");
  
      if (maHVSVIndex === -1 || diemIndex === -1) {
        throw new Error("Không tìm thấy cột hợp lệ!");
      }
  
      // Tạo map từ ma_sinh_vien đến sinh_vien_id và diem_id từ danh sách sinh viên
      const sinhVienMap = new Map();
      sinhVienData.forEach((sv) => {
        sinhVienMap.set(sv.ma_sinh_vien, {
          sinh_vien_id: sv.id,
          diem_id: sv.diems[0]?.id || null,
          thoi_khoa_bieu_id: sv.diems[0]?.thoi_khoa_bieu_id,
        });
      });
  
      const jsonResult = [];
      const updates = [];
  
      // Xử lý từng dòng trong Excel
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
            if (diem_ck < 0 || diem_ck > 10) {
              throw new Error(`Điểm không hợp lệ cho sinh viên ${ma_hvsv}: ${diem_ck}`);
            }
          } else {
            throw new Error(`Điểm không hợp lệ cho sinh viên ${ma_hvsv}: ${diemRaw}`);
          }
        }
  
        if (ma_hvsv !== "") {
          // Kiểm tra xem sinh viên có trong danh sách hợp lệ không
          const svInfo = sinhVienMap.get(ma_hvsv);
          if (!svInfo) {
            console.warn(`Sinh viên với mã ${ma_hvsv} không thuộc danh sách hợp lệ`);
            continue; // Bỏ qua nếu không tìm thấy sinh viên
          }
  
          const { sinh_vien_id, diem_id, thoi_khoa_bieu_id } = svInfo;
  
          // Kiểm tra xem bản ghi diem đã tồn tại chưa
          if (!diem_id) {
            throw new Error(`Bản ghi điểm chưa tồn tại cho sinh viên ${ma_hvsv} trong khoá đào tạo có id ${khoa_dao_tao_id}`);
          }

          // Chuẩn bị dữ liệu để update
          const diemData = {
            id: diem_id,
            sinh_vien_id,
            thoi_khoa_bieu_id,
            diem_ck,
            updated: false, // Giá trị mặc định
          };

          jsonResult.push(diemData);

          // Thêm thao tác update vào mảng updates
          updates.push(
            diem.update(
              { diem_ck },
              { where: { id: diem_id }, transaction }
            ).then(([affectedCount]) => {
              console.log(`Cập nhật diem_id=${diem_id}: affectedCount=${affectedCount}`);
              diemData.updated = affectedCount > 0; // Đánh dấu bản ghi được cập nhật
              return [affectedCount];
            })
          );
        }
      }
  
      // Thực hiện tất cả các thao tác upsert
      const updateResults = await Promise.all(updates);
      const successCount = updateResults.reduce((count, [affectedCount]) => count + affectedCount, 0);
  
      // Xóa file sau khi xử lý
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
  
      // Commit transaction
      await transaction.commit();
  
      return {
        message: "Cập nhật danh sách điểm thành công!",
        count: successCount,
        data: jsonResult,
      };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw new Error("Lỗi xử lý file Excel: " + error.message);
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
}


module.exports = DiemService;