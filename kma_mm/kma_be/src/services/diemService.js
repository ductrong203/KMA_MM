const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { diem, sinh_vien, thoi_khoa_bieu, lop, mon_hoc, danh_muc_dao_tao, khoa_dao_tao } = models;

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
      order: [['id', 'ASC']],
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
      const hoTenIndex = headers.indexOf("họ và tên");
      const lopIndex = headers.indexOf("lớp");
      const diemTP1Index = headers.indexOf("điểm thành phần 1");
      const diemTP2Index = headers.indexOf("điểm thành phần 2");

      if (maSVIndex === -1 || hoTenIndex === -1 || lopIndex === -1) {
        throw new Error("Không tìm thấy cột hợp lệ!");
      }

      const jsonResult = [];

      for (let row of dataRows) {
        let ma_sinh_vien = row[maSVIndex] || "";
        if (!ma_sinh_vien) continue; // Bỏ qua nếu không có mã sinh viên

        // Lấy sinh_vien_id từ ma_sinh_vien
        const sv = await sinh_vien.findOne({
          where: { ma_sinh_vien },
          attributes: ["id", "ho_dem", "ten"],
        });
        if (!sv) {
          console.warn(`Không tìm thấy sinh viên với mã: ${ma_sinh_vien}`);
          continue; // Bỏ qua nếu không tìm thấy sinh viên
        }

        // Ghép họ và tên từ file Excel (lấy trực tiếp từ cột "Họ và tên")
        let ho_va_ten_excel = row[hoTenIndex] ? row[hoTenIndex].toString().trim() : "";

        // Ghép họ và tên từ database
        const ho_va_ten_db = `${sv.ho_dem || ''} ${sv.ten || ''}`.trim();

        // So sánh tên (loại bỏ khoảng trắng thừa và chuyển về chữ thường để so sánh)
        const normalizeString = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();
        const tenExcelNormalized = normalizeString(ho_va_ten_excel);
        const tenDbNormalized = normalizeString(ho_va_ten_db);

        if (tenExcelNormalized !== tenDbNormalized) {
          console.warn(`Tên không khớp cho sinh viên ${ma_sinh_vien}: Excel="${ho_va_ten_excel}" vs DB="${ho_va_ten_db}"`);
          // Có thể chọn continue để bỏ qua hoặc vẫn tiếp tục xử lý
          continue; // Uncomment nếu muốn bỏ qua khi tên không khớp
        }

        const sinh_vien_id = sv.id;

        // // Ghép họ và tên
        // let ho_va_ten = hoTenIndexes
        //   .map((idx) => row[idx])
        //   .filter((val) => val !== "")
        //   .join(" ");        
        let ghi_chu = null;
        let diem_tp1 = null;
        let diem_tp2 = null;
        let diem_gk = null;
        
        // Lưu giá trị điểm thô để kiểm tra
        let diem1Raw = null;
        let diem2Raw = null;
        let invalidScore = null;
        
        // Xử lý điểm thành phần 1
        if (diemTP1Index !== -1 && row[diemTP1Index] !== undefined) {
          diem1Raw = row[diemTP1Index].toString().replace(",", ".").trim();
          if (diem1Raw !== "" && !isNaN(Number(diem1Raw))) {
            diem_tp1 = parseFloat(Number(diem1Raw).toFixed(2));
          } else if (diem1Raw !== "") {
            invalidScore = diem1Raw;
          }
        }

        // Xử lý điểm thành phần 2
        if (diemTP2Index !== -1 && row[diemTP2Index] !== undefined) {
          diem2Raw = row[diemTP2Index].toString().replace(",", ".").trim();
          if (diem2Raw !== "" && !isNaN(Number(diem2Raw))) {
            diem_tp2 = parseFloat(Number(diem2Raw).toFixed(2));
          } else if (diem2Raw !== "") {
            invalidScore = invalidScore || diem2Raw;
          }
        }

        // Nếu có điểm không hợp lệ, gán tất cả điểm = 0 và lưu ghi chú
        if (invalidScore) {
          diem_tp1 = 0;
          diem_tp2 = 0;
          diem_gk = 0;
          ghi_chu = invalidScore;
        } else if (diem_tp1 !== null && diem_tp2 !== null) {
          // Tính diem_gk = 0.3 * diem_tp1 + 0.7 * diem_tp2
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
          ghi_chu,
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

      // Lấy thông tin điểm giữa kỳ cho tất cả sinh viên
      const diemGKMap = new Map();
      if (sinhVienData.length > 0) {
        const diemIds = sinhVienData.map(sv => sv.diems[0]?.id).filter(id => id);
        if (diemIds.length > 0) {
          const diemGKRecords = await diem.findAll({
            where: { id: diemIds },
            attributes: ['id', 'diem_gk'],
            transaction,
          });
          diemGKRecords.forEach(record => {
            diemGKMap.set(record.id, record.diem_gk);
          });
        }
      }
  
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

          // Lấy điểm giữa kỳ để kiểm tra điều kiện
          const diem_gk = diemGKMap.get(diem_id);
          
          // Kiểm tra điều kiện diem_gk >= 4
          let finalDiemCK = diem_ck;
          if (diem_gk === null || diem_gk === undefined || diem_gk < 4) {
            finalDiemCK = 0;
            console.warn(`Sinh viên ${ma_hvsv} có điểm giữa kỳ ${diem_gk} < 4, gán điểm cuối kỳ = 0`);
          }

          // Chuẩn bị dữ liệu để update
          const diemData = {
            id: diem_id,
            sinh_vien_id,
            thoi_khoa_bieu_id,
            diem_ck: finalDiemCK,
            diem_gk_check: diem_gk, // Thêm để tracking
            updated: false, // Giá trị mặc định
          };

          jsonResult.push(diemData);

          // Thêm thao tác update vào mảng updates
          updates.push(
            diem.update(
              { diem_ck: finalDiemCK },
              { where: { id: diem_id }, transaction }
            ).then(([affectedCount]) => {
              console.log(`Cập nhật diem_id=${diem_id}: affectedCount=${affectedCount}, diem_ck=${finalDiemCK}`);
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

   
static async getThongKeDiem({ he_dao_tao_id, khoa_dao_tao_id, lop_id, ky_hoc_id }) {
  const convertToDiemHe4 = (diemHe10) => {
    if (diemHe10 >= 9.0 && diemHe10 <= 10.0) return 4.0; // Xuất sắc
    if (diemHe10 >= 8.5 && diemHe10 <= 8.9) return 3.8; // Giỏi
    if (diemHe10 >= 7.8 && diemHe10 <= 8.4) return 3.5; // Khá (B+)
    if (diemHe10 >= 7.0 && diemHe10 <= 7.7) return 3.0; // Khá (B)
    if (diemHe10 >= 6.3 && diemHe10 <= 6.9) return 2.4; // Trung bình (C+)
    if (diemHe10 >= 5.5 && diemHe10 <= 6.2) return 2.0; // Trung bình (C)
    if (diemHe10 >= 4.8 && diemHe10 <= 5.4) return 1.5; // Trung bình yếu (D+)
    if (diemHe10 >= 4.0 && diemHe10 <= 4.7) return 1.0; // Trung bình yếu (D)
    return 0.0; // Kém (F)
  };

  try {
    // Điều kiện lọc
    const whereLop = {};
    if (khoa_dao_tao_id) whereLop.khoa_dao_tao_id = khoa_dao_tao_id;
    if (lop_id) whereLop.id = lop_id;

    // Lấy danh sách lớp
    const lops = await lop.findAll({
      where: whereLop,
      attributes: ['id', 'ma_lop', 'khoa_dao_tao_id'],
      include: [
        {
          model: khoa_dao_tao,
          as: 'khoa_dao_tao',
          attributes: ['ten_khoa'],
        },
      ],
    });
    const lopIds = lops.map(l => l.id);
    if (!lopIds.length) {
      return { thongKeTongQuan: [], chiTietMonHoc: [], monHocList: [], thongKeTheoLop: [], thongKeTheoKhoa: [] };
    }

    // Điều kiện thời khóa biểu
    const whereTKB = { lop_id: lopIds };
    if (ky_hoc_id && ky_hoc_id !== 'all') {
      whereTKB.ky_hoc = ky_hoc_id;
    }
    if (he_dao_tao_id) {
      whereTKB['$mon_hoc.he_dao_tao_id$'] = he_dao_tao_id;
    }

    // Lấy danh sách môn học
    const monHocs = await thoi_khoa_bieu.findAll({
      where: whereTKB,
      attributes: [],
      include: [
        {
          model: mon_hoc,
          as: 'mon_hoc',
          attributes: ['ten_mon_hoc'],
          required: true,
        },
      ],
      distinct: true,
    });

    // Tạo danh sách môn học
    const monHocList = monHocs
      .filter(m => m && m.mon_hoc && m.mon_hoc.ten_mon_hoc)
      .map(m => m.mon_hoc.ten_mon_hoc)
      .filter((value, index, self) => self.indexOf(value) === index);

    // Lấy danh sách thời khóa biểu
    const thoiKhoaBieus = await thoi_khoa_bieu.findAll({
      where: whereTKB,
      attributes: ['id', 'ky_hoc', 'mon_hoc_id', 'lop_id'],
      include: [
        {
          model: mon_hoc,
          as: 'mon_hoc',
          attributes: ['ten_mon_hoc', 'so_tin_chi'],
          required: true,
        },
      ],
    });
    const thoiKhoaBieuIds = thoiKhoaBieus.map(tkb => tkb.id);

    // Lấy danh sách điểm
    const diemRecords = await diem.findAll({
      where: { thoi_khoa_bieu_id: thoiKhoaBieuIds },
      include: [
        {
          model: sinh_vien,
          as: 'sinh_vien',
          attributes: ['id', 'ma_sinh_vien', 'ho_dem', 'ten', 'gioi_tinh', 'diem_trung_binh_tich_luy', 'diem_trung_binh_he_4'],
        },
        {
          model: thoi_khoa_bieu,
          as: 'thoi_khoa_bieu',
          attributes: ['ky_hoc', 'lop_id'],
          include: [
            {
              model: mon_hoc,
              as: 'mon_hoc',
              attributes: ['ten_mon_hoc', 'so_tin_chi'],
              required: true,
            },
          ],
        },
      ],
    });

    // Nhóm dữ liệu theo sinh viên
    const sinhVienMap = new Map();
    const lopMap = new Map(); // Map để lưu thống kê theo lớp
    const khoaMap = new Map(); // Map để lưu thống kê theo khóa

    for (const record of diemRecords) {
      if (!record.thoi_khoa_bieu || !record.thoi_khoa_bieu.mon_hoc) {
        console.warn(`Bản ghi điểm thiếu thoi_khoa_bieu hoặc mon_hoc: diem_id=${record.id}`);
        continue; // Bỏ qua bản ghi không hợp lệ
      }

      const sv = record.sinh_vien;
      const svId = sv.id;
      const kyHoc = record.thoi_khoa_bieu.ky_hoc;
      const lopId = record.thoi_khoa_bieu.lop_id;
      const monHoc = record.thoi_khoa_bieu.mon_hoc?.ten_mon_hoc || 'Unknown';
      const soTinChi = record.thoi_khoa_bieu.mon_hoc?.so_tin_chi || 0;

      // Lấy thông tin lớp và khóa
      const lopInfo = lops.find(l => l.id === lopId);
      const khoaId = lopInfo?.khoa_dao_tao_id;
      const maLop = lopInfo?.ma_lop || 'Unknown';
      const tenKhoa = lopInfo?.khoa_dao_tao?.ten_khoa || 'Unknown';

      // Khởi tạo dữ liệu sinh viên
      if (!sinhVienMap.has(svId)) {
        const allDiemRecords = await diem.findAll({
          where: { sinh_vien_id: svId },
          include: [
            {
              model: thoi_khoa_bieu,
              as: 'thoi_khoa_bieu',
              attributes: [],
              include: [
                {
                  model: mon_hoc,
                  as: 'mon_hoc',
                  attributes: ['so_tin_chi'],
                  required: true,
                },
              ],
            },
          ],
        });

        sinhVienMap.set(svId, {
          ma_sinh_vien: sv.ma_sinh_vien,
          ho_ten: `${sv.ho_dem || ''} ${sv.ten || ''}`.trim(),
          gioi_tinh: sv.gioi_tinh === 1 ? 'Nam' : sv.gioi_tinh === 0 ? 'Nữ' : 'Khác',
          diem_tb_ky: {},
          diem_tb_tich_luy_he10: sv.diem_trung_binh_tich_luy || 0,
          diem_tb_tich_luy_he4: sv.diem_trung_binh_he_4 || 0,
          chi_tiet: [],
        });
      }

      const svData = sinhVienMap.get(svId);

      // Tính điểm trung bình kỳ cho sinh viên
      if (!svData.chi_tiet.some(ct => ct.ky_hoc === kyHoc)) {
        const diemKyRecords = diemRecords.filter(
          r => r.sinh_vien.id === svId && r.thoi_khoa_bieu && r.thoi_khoa_bieu.ky_hoc === kyHoc
        );

        let tongDiemTinChiHe10 = 0;
        let tongDiemTinChiHe4 = 0;
        let tongTinChi = 0;
        diemKyRecords.forEach(r => {
          if (!r.thoi_khoa_bieu || !r.thoi_khoa_bieu.mon_hoc) return;
          const diemHP = r.diem_hp;
          const tinChi = r.thoi_khoa_bieu.mon_hoc?.so_tin_chi || 0;
          if (diemHP !== null && !isNaN(diemHP) && tinChi > 0) {
            const diemHe4 = convertToDiemHe4(diemHP);
            tongDiemTinChiHe10 += diemHP * tinChi;
            tongDiemTinChiHe4 += diemHe4 * tinChi;
            tongTinChi += tinChi;
          }
        });

        const diem_tb_ky_he10 = tongTinChi > 0
          ? parseFloat((tongDiemTinChiHe10 / tongTinChi).toFixed(2))
          : 0;
        const diem_tb_ky_he4 = tongTinChi > 0
          ? parseFloat((tongDiemTinChiHe4 / tongTinChi).toFixed(2))
          : 0;

        svData.diem_tb_ky[kyHoc] = diem_tb_ky_he10;
        svData.chi_tiet.push({
          ky_hoc: kyHoc,
          mon_hoc: {},
          diem_tb_ky_he10,
          diem_tb_ky_he4,
        });
      }

      // Thêm chi tiết môn học
      const chiTietKy = svData.chi_tiet.find(ct => ct.ky_hoc === kyHoc);
      chiTietKy.mon_hoc[monHoc] = {
        tp1: record.diem_tp1 || null,
        tp2: record.diem_tp2 || null,
        diem_thi_ktph: record.diem_ck || null,
        diem_hp: record.diem_hp || null,
      };

      // Tính thống kê theo lớp
      if (!lopMap.has(lopId)) {
        lopMap.set(lopId, {
          ma_lop: maLop,
          ky_hoc: kyHoc,
          tong_diem_he10: 0,
          tong_diem_he4: 0,
          tong_tin_chi: 0,
          so_sinh_vien: new Set(),
        });
      }
      const lopData = lopMap.get(lopId);
      if (record.diem_hp !== null && !isNaN(record.diem_hp) && soTinChi > 0) {
        lopData.tong_diem_he10 += record.diem_hp * soTinChi;
        lopData.tong_diem_he4 += convertToDiemHe4(record.diem_hp) * soTinChi;
        lopData.tong_tin_chi += soTinChi;
        lopData.so_sinh_vien.add(svId);
      }

      // Tính thống kê theo khóa
      if (!khoaMap.has(khoaId)) {
        khoaMap.set(khoaId, {
          ten_khoa: tenKhoa,
          ky_hoc: kyHoc,
          tong_diem_he10: 0,
          tong_diem_he4: 0,
          tong_tin_chi: 0,
          so_sinh_vien: new Set(),
        });
      }
      const khoaData = khoaMap.get(khoaId);
      if (record.diem_hp !== null && !isNaN(record.diem_hp) && soTinChi > 0) {
        khoaData.tong_diem_he10 += record.diem_hp * soTinChi;
        khoaData.tong_diem_he4 += convertToDiemHe4(record.diem_hp) * soTinChi;
        khoaData.tong_tin_chi += soTinChi;
        khoaData.so_sinh_vien.add(svId);
      }
    }

    // Chuẩn bị dữ liệu trả về
    const thongKeTongQuan = Array.from(sinhVienMap.values()).map(sv => ({
      ma_sinh_vien: sv.ma_sinh_vien,
      ho_ten: sv.ho_ten,
      gioi_tinh: sv.gioi_tinh,
      diem_tb_ky: sv.diem_tb_ky,
      diem_tb_tich_luy_he10: sv.diem_tb_tich_luy_he10,
      diem_tb_tich_luy_he4: sv.diem_tb_tich_luy_he4,
    }));

    const chiTietMonHoc = Array.from(sinhVienMap.values()).flatMap(sv =>
      sv.chi_tiet.map(ct => ({
        ma_sinh_vien: sv.ma_sinh_vien,
        ho_ten: sv.ho_ten,
        ky_hoc: ct.ky_hoc,
        mon_hoc: ct.mon_hoc,
        diem_tb_ky_he10: ct.diem_tb_ky_he10,
        diem_tb_ky_he4: ct.diem_tb_ky_he4,
      }))
    );

    // Thống kê theo lớp
    const thongKeTheoLop = Array.from(lopMap.entries()).map(([lopId, data]) => ({
      lop_id: lopId,
      ma_lop: data.ma_lop,
      ky_hoc: data.ky_hoc,
      diem_tb_he10: data.tong_tin_chi > 0 ? parseFloat((data.tong_diem_he10 / data.tong_tin_chi).toFixed(2)) : 0,
      diem_tb_he4: data.tong_tin_chi > 0 ? parseFloat((data.tong_diem_he4 / data.tong_tin_chi).toFixed(2)) : 0,
      so_sinh_vien: data.so_sinh_vien.size,
    }));

    // Thống kê theo khóa
    const thongKeTheoKhoa = Array.from(khoaMap.entries()).map(([khoaId, data]) => ({
      khoa_dao_tao_id: khoaId,
      ten_khoa: data.ten_khoa,
      ky_hoc: data.ky_hoc,
      diem_tb_he10: data.tong_tin_chi > 0 ? parseFloat((data.tong_diem_he10 / data.tong_tin_chi).toFixed(2)) : 0,
      diem_tb_he4: data.tong_tin_chi > 0 ? parseFloat((data.tong_diem_he4 / data.tong_tin_chi).toFixed(2)) : 0,
      so_sinh_vien: data.so_sinh_vien.size,
    }));

    return {
      thongKeTongQuan,
      chiTietMonHoc,
      monHocList,
      thongKeTheoLop,
      thongKeTheoKhoa,
    };
  } catch (error) {
    console.error('Lỗi khi lấy thống kê điểm:', error);
    throw new Error('Không thể lấy thống kê điểm: ' + error.message);
  }
}


}


module.exports = DiemService;