const ExcelJS = require("exceljs");
const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { sinh_vien, thoi_khoa_bieu, diem, lop } = models;

class ExcelService {
  static async getSinhVienData({ lop_id, mon_hoc_id }) {
    try {
      const sinhVienData = await sinh_vien.findAll({
        attributes: ["id", "ma_sinh_vien", "ho_dem", "ten"],
        include: [
          {
            model: diem,
            as: "diems",
            attributes: ["diem_tp1","diem_tp2"],
            required: true,
            include: [
              {
                model: thoi_khoa_bieu,
                as: "thoi_khoa_bieu",
                attributes: [],
                where: {
                  lop_id: lop_id,
                  mon_hoc_id: mon_hoc_id,
                },
                required: true,
              },
            ],
          },
          {
            model: lop,
            as: "lop",
            attributes: ["ma_lop"],
            required: true,
          },
        ],
      });

      if (!sinhVienData || sinhVienData.length === 0) {
        throw new Error("Không tìm thấy sinh viên nào phù hợp");
      }

      return sinhVienData;
    } catch (error) {
      throw new Error("Lỗi khi lấy dữ liệu sinh viên: " + error.message);
    }
  }

  static async exportToExcel(sinhVienData) {
    const headersRow1 = [
      "STT",
      "Mã Sinh Viên",
      "Họ và tên",
      "", "", "", "",
      "Lớp",
      "Điểm thành phần 1",
      "Điểm thành phần 2",
      "Điểm quá trình",
      "",
      "Ghi chú",
      "",
    ];

    const totalColumns = 14;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SinhVien", {
      pageSetup: {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
      },
    });

    let row = worksheet.addRow([]);
    row.getCell(1).value = "HỌC VIỆN KỸ THUẬT MẬT MÃ".toUpperCase();
    row.getCell(7).value = "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM".toUpperCase();
    worksheet.mergeCells(row.number, 1, row.number, 6);
    worksheet.mergeCells(row.number, 7, row.number, 14);
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    row.getCell(7).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { bold: true };
    row.getCell(7).font = { bold: true };

    row = worksheet.addRow([]);
    row.getCell(1).value = "Khoa:";
    row.getCell(7).value = "Độc lập - Tự do - Hạnh phúc";
    worksheet.mergeCells(row.number, 1, row.number, 3);
    worksheet.mergeCells(row.number, 7, row.number, 14);
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    row.getCell(7).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { bold: true };
    row.getCell(7).font = { underline: true };

    row = worksheet.addRow([]);
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);

    row = worksheet.addRow([]);
    row.getCell(1).value = "KẾT QUẢ ĐÁNH GIÁ ĐIỂM QUÁ TRÌNH".toUpperCase();
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { size: 16, bold: true };

    row = worksheet.addRow([]);
    row.getCell(1).value = `HỌC KỲ 1 NĂM HỌC 2024 - 2025`;
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { bold: true };

    row = worksheet.addRow([]);
    row.getCell(1).value = "Học phần:";
    row.getCell(10).value = "Số TC:";
    row.getCell(12).value = "Mã học phần:";
    row.getCell(1).alignment = { horizontal: "left", vertical: "top", wrapText: false };
    row.getCell(10).alignment = { horizontal: "left", vertical: "top", wrapText: false };
    row.getCell(12).alignment = { horizontal: "left", vertical: "top", wrapText: false };

    row = worksheet.addRow([]);
    row.getCell(1).value = "Lớp học phần:";
    row.getCell(10).value = "Khoá:";
    row.getCell(1).alignment = { horizontal: "left", vertical: "top", wrapText: false };
    row.getCell(10).alignment = { horizontal: "left", vertical: "top", wrapText: false };

    row = worksheet.addRow([]);
    row.getCell(1).value = "Giảng viên giảng dạy:";
    row.getCell(1).alignment = { horizontal: "left", vertical: "top", wrapText: false };

    row = worksheet.addRow([]);
    row.getCell(1).value = "Tổng số SV:";
    worksheet.mergeCells(row.number, 1, row.number, 2);
    row.getCell(5).value = "Số SV dự thi: ... Vắng ... Có lý do ... Không lý do ...";
    worksheet.mergeCells(row.number, 5, row.number, 14);
    row.getCell(5).alignment = { horizontal: "left", vertical: "top", wrapText: false };

    row = worksheet.addRow([]);
    row.getCell(1).value = "Ngày thi:";
    row.getCell(5).value = "Ngày nộp điểm:";
    row.getCell(1).alignment = { horizontal: "left", vertical: "top", wrapText: false };
    row.getCell(5).alignment = { horizontal: "left", vertical: "top", wrapText: false };

    worksheet.addRow([]);
    worksheet.addRow([]);

    // **Phần header bảng (dòng 13-14)**
    const headerRow1 = worksheet.addRow(headersRow1);
    worksheet.mergeCells(headerRow1.number, 1, headerRow1.number + 1, 1); // A13:A14 (STT)
    worksheet.mergeCells(headerRow1.number, 2, headerRow1.number + 1, 2); // B13:B14 (Mã Sinh Viên)
    worksheet.mergeCells(headerRow1.number, 3, headerRow1.number + 1, 7); // C13:G14 (Họ và tên)
    worksheet.mergeCells(headerRow1.number, 8, headerRow1.number + 1, 8); // H13:H14 (Lớp)
    worksheet.mergeCells(headerRow1.number, 9, headerRow1.number + 1, 9); // I13:I14 (Điểm thành phần 1)
    worksheet.mergeCells(headerRow1.number, 10, headerRow1.number + 1, 10); // J13:J14 (Điểm thành phần 2)
    worksheet.mergeCells(headerRow1.number, 11, headerRow1.number, 12); // K13:L13 (Điểm quá trình)
    worksheet.mergeCells(headerRow1.number, 13, headerRow1.number + 1, 14); // M13:N14 (Ghi chú)

    headerRow1.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.font = { bold: true }; // Giữ nguyên font size mặc định (13)
    });

    const headerRow2 = worksheet.getRow(headerRow1.number + 1);
    headerRow2.getCell(11).value = "Bằng số";
    headerRow2.getCell(12).value = "Bằng chữ";
    headerRow2.getCell(11).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    headerRow2.getCell(12).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    headerRow2.getCell(11).font = { bold: true };
    headerRow2.getCell(12).font = { bold: true };

    headerRow1.height = 25;
    headerRow2.height = 35;

    const tableStart = headerRow1.number;

    // **Xử lý dữ liệu**
    const dataRows = sinhVienData.map((sv, index) => {
      const diem = sv.diems && sv.diems.length > 0 ? sv.diems[0] : {};
      return [
        `${index + 1}.`,
        sv.ma_sinh_vien || "",
        `${sv.ho_dem || ""} ${sv.ten || ""}`,
        "", "", "", "",
        sv.lop?.ma_lop || "",
        diem.diem_tp1 !== undefined && diem.diem_tp1 !== null ? diem.diem_tp1 : "",
        diem.diem_tp2 !== undefined && diem.diem_tp2 !== null ? diem.diem_tp2 : "",
        "",
        "",
        "",
        sv.ghi_chu || "",
      ];
    });

    dataRows.forEach((rData) => {
      const dataRow = worksheet.addRow(rData);
      worksheet.mergeCells(dataRow.number, 3, dataRow.number, 7); // C-G (Họ và tên)
      worksheet.mergeCells(dataRow.number, 13, dataRow.number, 14); // M-N (Ghi chú)
      dataRow.eachCell((cell) => {
        cell.font = { name: "Times New Roman", size: 12 }; // Font size 12 cho dữ liệu
      });
      dataRow.height = 16; // Giảm độ cao hàng dữ liệu xuống
    });

    const tableEnd = worksheet.lastRow.number;

    // **Phần footer**
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    row = worksheet.addRow([]);
    row.getCell(10).value = "Hà Nội, ngày 30 tháng 12 năm 2024";
    worksheet.mergeCells(row.number, 10, row.number, 14);
    row.getCell(10).alignment = { horizontal: "right", vertical: "top", wrapText: true };
    row.getCell(10).font = { name: "Times New Roman", size: 12, italic: true, bold: false };

    row = worksheet.addRow([]);
    row.getCell(1).value = "GIẢNG VIÊN CHẤM THI";
    worksheet.mergeCells(row.number, 1, row.number, 4);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(1).font = { name: "Times New Roman", size: 12, bold: true };

    row.getCell(6).value = "CHỦ NHIỆM BỘ MÔN";
    worksheet.mergeCells(row.number, 6, row.number, 9);
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(6).font = { name: "Times New Roman", size: 12, bold: true };

    row.getCell(10).value = "GIÁO VỤ KHOA";
    worksheet.mergeCells(row.number, 10, row.number, 11);
    row.getCell(10).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(10).font = { name: "Times New Roman", size: 12, bold: true };

    row.getCell(12).value = "PHÒNG ĐÀO TẠO";
    worksheet.mergeCells(row.number, 12, row.number, 14);
    row.getCell(12).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(12).font = { name: "Times New Roman", size: 12, bold: true };

    row = worksheet.addRow([]);
    row.getCell(1).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 1, row.number, 4);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(1).font = { name: "Times New Roman", size: 12, bold: false };

    row.getCell(6).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 6, row.number, 9);
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(6).font = { name: "Times New Roman", size: 12, bold: false };

    row.getCell(10).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 10, row.number, 11);
    row.getCell(10).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(10).font = { name: "Times New Roman", size: 12, bold: false };

    row.getCell(12).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 12, row.number, 14);
    row.getCell(12).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(12).font = { name: "Times New Roman", size: 12, bold: false };

    // **Định dạng chung**
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (rowNumber >= tableStart && rowNumber <= tableEnd) {
          if (rowNumber === tableStart) {
            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else if (rowNumber === tableStart + 1) {
            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "dotted", color: { argb: "FF808080" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else if (rowNumber === tableEnd) {
            cell.border = {
              top: { style: "dotted", color: { argb: "FF808080" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else {
            cell.border = {
              top: { style: "dotted", color: { argb: "FF808080" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "dotted", color: { argb: "FF808080" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          }
          cell.alignment = {
            horizontal: cell.alignment?.horizontal || "left",
            vertical: "middle",
            wrapText: true,
          };
        } else {
          cell.border = undefined;
          cell.alignment = {
            horizontal: cell.alignment?.horizontal || "left",
            vertical: "top",
            wrapText: cell.alignment?.wrapText || false,
          };
        }
        cell.font = {
          name: "Times New Roman",
          size: cell.font?.size || 13, // Mặc định 13, sẽ bị override bởi dữ liệu
          bold: cell.font?.bold || false,
          underline: cell.font?.underline || false,
        };
      });
    });

    // **Độ rộng cột**
    worksheet.getColumn(1).width = 5.5;
    worksheet.getColumn(2).width = 10.5;
    worksheet.getColumn(3).width = 7;
    worksheet.getColumn(4).width = 4.5;
    worksheet.getColumn(5).width = 3;
    worksheet.getColumn(6).width = 6;
    worksheet.getColumn(7).width = 3;
    worksheet.getColumn(8).width = 7.29;
    worksheet.getColumn(9).width = 8;
    worksheet.getColumn(10).width = 8;
    worksheet.getColumn(11).width = 10.14;
    worksheet.getColumn(12).width = 11.43;
    worksheet.getColumn(13).width = 5;
    worksheet.getColumn(14).width = 5;

    return workbook;
  }

  static async getSinhVienCuoiKy({ mon_hoc_id, khoa_dao_tao_id, lop_id }) {
    try {
      // Kiểm tra tham số đầu vào
      if (!mon_hoc_id || !khoa_dao_tao_id) {
        throw new Error("Thiếu mon_hoc_id hoặc khoa_dao_tao_id trong form-data");
      }
      if (lop_id) {
        const lopCheck = await lop.findOne({ 
          where: { id: lop_id, khoa_dao_tao_id: khoa_dao_tao_id } 
        });
        if (!lopCheck) {
          throw new Error("Lớp không tồn tại trong khóa đào tạo này");
        }
      }
      const sinhVienData = await sinh_vien.findAll({
        attributes: ["id", "ma_sinh_vien", "ho_dem", "ten"],
        include: [
          {
            model: diem,
            as: "diems",
            attributes: ["diem_ck"],
            required: true,
            include: [
              {
                model: thoi_khoa_bieu,
                as: "thoi_khoa_bieu",
                attributes: [],
                where: {
                  mon_hoc_id: mon_hoc_id,
                },
                required: true,
                include: [
                  {
                    model: lop,
                    as: "lop",
                    attributes: [],
                    where: {
                      khoa_dao_tao_id: khoa_dao_tao_id,
                      ...(lop_id && { id: lop_id }), // Nếu có lop_id thì thêm điều kiện này
                    },
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
            required: false, // Cho phép sinh viên học lại từ khóa khác
          },
        ],
        order: [["ten", "ASC"]],
        // Ngăn trùng lặp sinh viên nếu có nhiều bản ghi diem
        //group: ["sinh_vien.id", "sinh_vien.ma_sinh_vien", "sinh_vien.ho_dem", "sinh_vien.ten", "lop.ma_lop", "diems.diem_ck"],
        subQuery: false, // không tạo truy vấn con
      });
  
      if (!sinhVienData || sinhVienData.length === 0) {
        throw new Error("Không tìm thấy sinh viên nào phù hợp");
      }
  
      return sinhVienData;
    } catch (error) {
      throw new Error("Lỗi khi lấy dữ liệu sinh viên: " + error.message);
    }
  }
  static async exportToExcelCuoiKy(sinhVienData) {
    const headersRow = [
      "STT",
      "SBD",
      "Mã HVSV",
      "Họ đệm",
      "Tên",
      "Lớp",
      "Mã đề",
      "Điểm",
      "Ký tên",
      "Ghi chú",
    ];
  
    const totalColumns = 10; // 10 cột từ A đến J
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SinhVien", {
      pageSetup: {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
      },
    });
  
    // Dòng 1: Tiêu đề chính
    let row = worksheet.addRow([]);
    row.getCell(1).value = "HỌC VIỆN KỸ THUẬT MẬT MÃ".toUpperCase();
    row.getCell(5).value = "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM".toUpperCase();
    worksheet.mergeCells(row.number, 1, row.number, 4);
    worksheet.mergeCells(row.number, 5, row.number, 10);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(5).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { bold: false, size: 12 };
    row.getCell(5).font = { bold: true, size: 12 };
  
    // Dòng 2: Phòng và câu slogan
    row = worksheet.addRow([]);
    row.getCell(1).value = "PHÒNG KT&ĐBCLĐT";
    row.getCell(5).value = "Độc lập - Tự do - Hạnh phúc";
    worksheet.mergeCells(row.number, 1, row.number, 4);
    worksheet.mergeCells(row.number, 5, row.number, 10);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(5).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { bold: true, underline: true, size: 12 };
    row.getCell(5).font = { bold: true, underline: true, size: 12 };
  
    // Dòng 3: Khoảng trống
    row = worksheet.addRow([]);
  
    // Dòng 4: Tiêu đề danh sách
    row = worksheet.addRow([]);
    row.getCell(1).value = "DANH SÁCH THI SINH DỰ THI".toUpperCase();
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { size: 12, bold: true };
  
    // Dòng 5: Năm học
    row = worksheet.addRow([]);
    row.getCell(1).value = "Năm học ... . Học kỳ ...";
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.getCell(1).font = { bold: true, size: 12 };
  
    // Dòng 6: Môn thi
    row = worksheet.addRow([]);
    row.getCell(1).value = "Môn thi: ...";
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle", wrapText: false };
    row.getCell(1).font = { size: 11 };
  
    // Dòng 7: Lần thi và hình thức thi
    row = worksheet.addRow([]);
    row.getCell(1).value = "Lần thi: ";
    row.getCell(4).value = "Hình thức thi: ";
    row.getCell(7).value = "Thời gian làm bài:  (phút)";
    worksheet.mergeCells(row.number, 1, row.number, 3);
    worksheet.mergeCells(row.number, 4, row.number, 6);
    worksheet.mergeCells(row.number, 7, row.number, 10);
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle", wrapText: false };
    row.getCell(4).alignment = { horizontal: "left", vertical: "middle", wrapText: false };
    row.getCell(7).alignment = { horizontal: "left", vertical: "middle", wrapText: false };
    row.getCell(1).font = { size: 12 };
    row.getCell(4).font = { size: 12 };
    row.getCell(7).font = { size: 12 };
  
    // Dòng 8: Ngày thi, giờ thi, phòng thi, mã phòng thi
    row = worksheet.addRow([]);
    row.getCell(1).value = "Ngày thi: ...               Giờ thi: ...               Phòng thi: ...             Mã phòng thi: ...";
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle", wrapText: false };
    row.getCell(1).font = { size: 12 };
  
    // Dòng 9: Tổng số thí sinh
    row = worksheet.addRow([]);
    row.getCell(1).value = "Tổng số thí sinh: ...    Có mặt:......   Vắng: ......    Có lý do: ......    Không lý do: .......";
    worksheet.mergeCells(row.number, 1, row.number, totalColumns);
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle", wrapText: false };
    row.getCell(1).font = { size: 12 };
  
    // Dòng trống
    worksheet.addRow([]);
  
    // Phần header bảng (dòng 11)
    const headerRow = worksheet.addRow(headersRow);
    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.font = { bold: true, size: 12 };
    });
  
    const tableStart = headerRow.number;
  
    // Xử lý dữ liệu
    const dataRows = sinhVienData.map((sv, index) => {
      const diem = sv.diems && sv.diems.length > 0 ? sv.diems[0] : {};
      return [
        `${index + 1}`,
        `${index + 1}` || "",
        sv.ma_sinh_vien || "",
        sv.ho_dem || "",
        sv.ten || "",
        sv.lop?.ma_lop || "",
        "",
        diem.diem_ck !== undefined && diem.diem !== null ? diem.diem_ck : "",
        "", // Ký tên (có thể để trống vì đây là chỗ để ký tay)
        "",
      ];
    });
  
    dataRows.forEach((rData) => {
      const dataRow = worksheet.addRow(rData);
      dataRow.eachCell((cell) => {
        // Áp dụng căn giữa và wrapText: false cho tất cả các ô trước
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
        cell.font = { name: "Times New Roman", size: 12 };
      });
  
      // Căn trái và wrapText: true cho cột 4 (Họ đệm) và cột 5 (Tên)
      dataRow.getCell(4).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      dataRow.getCell(5).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    });
  
    const tableEnd = worksheet.lastRow.number;
  
    // Phần footer
    worksheet.addRow([]); // Dòng trống
  
    row = worksheet.addRow([]);
    row.getCell(7).value = "Hà Nội, ngày ___ tháng ___ năm 20___";
    worksheet.mergeCells(row.number, 7, row.number, 10);
    row.getCell(7).alignment = { horizontal: "right", vertical: "top", wrapText: true };
    row.getCell(7).font = { name: "Times New Roman", size: 11, italic: true, bold: false };
  
    row = worksheet.addRow([]);
    row.getCell(1).value = "CBCTChT thứ nhất";
    row.getCell(4).value = "CBCTChT thứ hai";
    row.getCell(7).value = "Đại diện Phòng KT&ĐBCLĐT";
    worksheet.mergeCells(row.number, 1, row.number, 3); // Cột 1-3 (A-C): CBCTChT thứ nhất
    worksheet.mergeCells(row.number, 4, row.number, 6); // Cột 4-6 (D-F): CBCTChT thứ hai
    worksheet.mergeCells(row.number, 7, row.number, 10); // Cột 7-10 (G-J): Đại diện Phòng KT&ĐBCLĐT
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(4).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(7).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(1).font = { name: "Times New Roman", size: 11, bold: true };
    row.getCell(4).font = { name: "Times New Roman", size: 11, bold: true };
    row.getCell(7).font = { name: "Times New Roman", size: 11, bold: true };
  
    // Định dạng chung
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (rowNumber >= tableStart && rowNumber <= tableEnd) {
          if (rowNumber === tableStart) {
            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else if (rowNumber === tableStart + 1) {
            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF808080" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else if (rowNumber === tableEnd) {
            cell.border = {
              top: { style: "thin", color: { argb: "FF808080" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else {
            cell.border = {
              top: { style: "thin", color: { argb: "FF808080" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF808080" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          }
          cell.alignment = {
            horizontal: cell.alignment?.horizontal || "left",
            vertical: "middle",
            wrapText: cell.alignment?.wrapText || false, // Giữ wrapText từ thiết lập trước đó
          };
        } else {
          cell.border = undefined;
          cell.alignment = {
            horizontal: cell.alignment?.horizontal || "left",
            vertical: "top",
            wrapText: cell.alignment?.wrapText || false,
          };
        }
        cell.font = {
          name: "Times New Roman",
          size: cell.font?.size || 12, // Font mặc định 12, trừ khi được ghi đè
          bold: cell.font?.bold || false,
          underline: cell.font?.underline || false,
          italic: cell.font?.italic || false,
        };
      });
    });
  
    // Độ rộng cột (điều chỉnh cho 10 cột A-J)
    worksheet.getColumn(1).width = 4.29 * 1.2;  // A: STT
    worksheet.getColumn(2).width = 4.4 * 1.2;     // B: SBD 
    worksheet.getColumn(3).width = 11.29 * 1.2; // C: Mã HVSV
    worksheet.getColumn(4).width = 19.29 * 1.2; // D: Họ đệm
    worksheet.getColumn(5).width = 7.29 * 1.2;  // E: Tên
    worksheet.getColumn(6).width = 7.71 * 1.2;  // F: Lớp
    worksheet.getColumn(7).width = 6.29 * 1.2;  // G: Mã đề
    worksheet.getColumn(8).width = 7.71 * 1.2;  // H: Điểm
    worksheet.getColumn(9).width = 8 * 1.2;     // I: Ký tên
    worksheet.getColumn(10).width = 12.57 * 1.2;// J: Ghi chú
  
    return workbook;
  }
}

module.exports = ExcelService;