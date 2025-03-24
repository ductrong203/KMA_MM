const ExcelJS = require("exceljs");
const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { sinh_vien } = models;

class ExcelService {
  static async getSinhVienData() {
    try {
      const sinhVienData = await sinh_vien.findAll();
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
      ""
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
      cell.font = { bold: true };
    });

    // Chỉ thêm "Bằng số" và "Bằng chữ" vào K14, L14 mà không ảnh hưởng các ô merged khác
    const headerRow2 = worksheet.getRow(headerRow1.number + 1); // Lấy dòng 14
    headerRow2.getCell(11).value = "Bằng số"; // K14
    headerRow2.getCell(12).value = "Bằng chữ"; // L14
    headerRow2.getCell(11).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    headerRow2.getCell(12).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    headerRow2.getCell(11).font = { bold: true };
    headerRow2.getCell(12).font = { bold: true };

    // Tăng chiều cao dòng để tiêu đề hiển thị rõ qua cả hai dòng
    headerRow1.height = 25; // Tăng chiều cao dòng 13
    headerRow2.height = 35; // Tăng chiều cao dòng 14

    const tableStart = headerRow1.number;

    // **Xử lý dữ liệu**
    const dataRows = sinhVienData.map((sv, index) => {
      return [
        `${index + 1}.`,           // A: STT
        sv.ma_sinh_vien || "",     // B: Mã Sinh Viên
        `${sv.ho_dem || ""} ${sv.ten || ""}`, // C: Họ và tên
        "", "", "", "",            // D-G: trống (merge với C)
        sv.lop_id || "",           // H: Lớp
        "",                        // I: Điểm thành phần 1
        "",                        // J: Điểm thành phần 2
        "",                        // K: Điểm quá trình
        "",                        // L: Bằng số
        "",                        // M: Bằng chữ
        sv.ghi_chu || ""           // N: Ghi chú (merge M-N)
      ];
    });

    dataRows.forEach((rData) => {
      const dataRow = worksheet.addRow(rData);
      worksheet.mergeCells(dataRow.number, 3, dataRow.number, 7);  // C-G (Họ và tên)
      worksheet.mergeCells(dataRow.number, 13, dataRow.number, 14); // M-N (Ghi chú)
    });

    const tableEnd = worksheet.lastRow.number;

    // **Phần footer**
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    row = worksheet.addRow([]);
    row.getCell(10).value = "Hà Nội, ngày 30 tháng 12 năm 2024";
    worksheet.mergeCells(row.number, 10, row.number, 14); // Merge cột J-N (10-14)
    row.getCell(10).alignment = { horizontal: "right", vertical: "top", wrapText: true }; // Căn trái
    row.getCell(10).font = { name: "Times New Roman", size: 12, italic: true, bold: false }; // Font 12, in nghiêng

    // Dòng cho các tiêu đề
    row = worksheet.addRow([]);
    row.getCell(1).value = "GIẢNG VIÊN CHẤM THI";
    worksheet.mergeCells(row.number, 1, row.number, 4); // Merge cột A-D (1-4)
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(1).font = { name: "Times New Roman", size: 12, bold: true }; // Font 12, in đậm

    row.getCell(6).value = "CHỦ NHIỆM BỘ MÔN";
    worksheet.mergeCells(row.number, 6, row.number, 9); // Merge cột F-I (6-9)
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(6).font = { name: "Times New Roman", size: 12, bold: true }; // Font 12, in đậm

    row.getCell(10).value = "GIÁO VỤ KHOA";
    worksheet.mergeCells(row.number, 10, row.number, 11); // Merge cột J-K (10-11)
    row.getCell(10).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(10).font = { name: "Times New Roman", size: 12, bold: true }; // Font 12, in đậm

    row.getCell(12).value = "PHÒNG ĐÀO TẠO";
    worksheet.mergeCells(row.number, 12, row.number, 14); // Merge cột L-N (12-14)
    row.getCell(12).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(12).font = { name: "Times New Roman", size: 12, bold: true }; // Font 12, in đậm

    row = worksheet.addRow([]);
    row.getCell(1).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 1, row.number, 4); // Merge cột A-D (1-4)
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(1).font = { name: "Times New Roman", size: 12, bold: false }; // Font 12, không in đậm

    row.getCell(6).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 6, row.number, 9); // Merge cột F-I (6-9)
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(6).font = { name: "Times New Roman", size: 12, bold: false }; // Font 12, không in đậm

    row.getCell(10).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 10, row.number, 11); // Merge cột J-K (10-11)
    row.getCell(10).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(10).font = { name: "Times New Roman", size: 12, bold: false }; // Font 12, không in đậm

    row.getCell(12).value = "(Ký, ghi rõ họ tên)";
    worksheet.mergeCells(row.number, 12, row.number, 14); // Merge cột L-N (12-14)
    row.getCell(12).alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    row.getCell(12).font = { name: "Times New Roman", size: 12, bold: false }; // Font 12, không in đậm

    // **Định dạng chung**
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (rowNumber >= tableStart && rowNumber <= tableEnd) {
          if (rowNumber === tableStart) {
            // Dòng tiêu đề đầu tiên (dòng 13) - viền trên và dưới đều là đường liền
            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else if (rowNumber === tableStart + 1) {
            // Dòng tiêu đề thứ hai (dòng 14) - viền trên liền, viền dưới dotted
            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "dotted", color: { argb: "FF808080" } }, // Màu xám nhạt
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else if (rowNumber === tableEnd) {
            // Dòng cuối cùng của bảng - viền trên dotted, viền dưới liền
            cell.border = {
              top: { style: "dotted", color: { argb: "FF808080" } }, // Màu xám nhạt
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          } else {
            // Các dòng ở giữa - viền ngang dotted, viền dọc liền
            cell.border = {
              top: { style: "dotted", color: { argb: "FF808080" } }, // Màu xám nhạt
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "dotted", color: { argb: "FF808080" } }, // Màu xám nhạt
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
          size: cell.font?.size || 13,
          bold: cell.font?.bold || false,
          underline: cell.font?.underline || false,
        };
      });
    });

    // **Độ rộng cột**
    worksheet.getColumn(1).width = 5.5;
    worksheet.getColumn(2).width = 10;
    worksheet.getColumn(3).width = 7;
    worksheet.getColumn(4).width = 4.5;
    worksheet.getColumn(5).width = 3.5;
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
}

module.exports = ExcelService;