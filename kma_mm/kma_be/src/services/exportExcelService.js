const ExcelJS = require("exceljs");
const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { sinh_vien, lop, khoa_dao_tao } = models;
const ExcelPhuLucBangService = require('./excelPhuLucBangService');

class ExportExcelService {
  // Tính điểm trung bình kỳ học
  async getDiemTrungBinhKyHoc(sinh_vien_id, ky_hoc, khoa_dao_tao_id) {
    try {
      const dataDiem = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);
      
      if (!dataDiem || dataDiem.length === 0) {
        return { gpa_he_4: 0, gpa_he_10: 0 };
      }
      
      let totalCredits = 0;
      let totalWeightedGradePoints_4 = 0;
      let totalWeightedGradePoints_10 = 0;
      
      for (const item of dataDiem) {
        if (item.diem_he_4 !== null && item.diem_he_4 !== undefined && 
            item.so_tin_chi !== null && item.so_tin_chi !== undefined) {
          const credits = Number(item.so_tin_chi);
          const gradePoints_4 = Number(item.diem_he_4);
          const gradePoints_10 = Number(item.diem_he_10);
          
          if (!isNaN(credits) && !isNaN(gradePoints_4) && gradePoints_4 >= 1.0) {
            totalCredits += credits;
            totalWeightedGradePoints_4 += (gradePoints_4 * credits);
            totalWeightedGradePoints_10 += (gradePoints_10 * credits);
          }
        }
      }
      
      let gpa_he_4 = 0;
      let gpa_he_10 = 0;
      
      if (totalCredits > 0) {
        gpa_he_4 = totalWeightedGradePoints_4 / totalCredits;
        gpa_he_10 = totalWeightedGradePoints_10 / totalCredits;
        gpa_he_4 = Math.round(gpa_he_4 * 100) / 100;
        gpa_he_10 = Math.round(gpa_he_10 * 100) / 100;
      }
      
      return { gpa_he_4, gpa_he_10 };
    } catch (error) {
      console.error("Lỗi khi tính điểm trung bình kỳ học:", error);
      return { gpa_he_4: 0, gpa_he_10: 0 };
    }
  }

  async exportKetQuaKyHoc(sinh_vien_id, so_ky_hoc) {
    try {
      // Biến chung cho chiều cao dòng
      const ROW_HEIGHT = 23;
      
      // Lấy thông tin sinh viên
      const sinhVien = await sinh_vien.findOne({
        where: { id: sinh_vien_id },
        include: [
          {
            model: lop,
            as: 'lop',
            attributes: ['ma_lop', 'id'],
            include: [
              {
                model: khoa_dao_tao,
                as: 'khoa_dao_tao',
                attributes: ['ma_khoa', 'ten_khoa', 'nam_hoc', 'id']
              }
            ]
          }
        ]
      });
      
      if (!sinhVien) {
        throw new Error("Không tìm thấy thông tin sinh viên");
      }

      const khoa_dao_tao_id = sinhVien.lop?.khoa_dao_tao?.id;
      if (!khoa_dao_tao_id) {
        throw new Error("Không tìm thấy thông tin khóa đào tạo");
      }

      // Tạo workbook mới
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Kết quả kỳ học", {
        pageSetup: {
          orientation: 'portrait',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          paperSize: 9 // A4
        },
        properties: {
          defaultRowHeight: ROW_HEIGHT
        }
      });

      // Thiết lập độ rộng cột
      worksheet.getColumn('A').width = 4.5;      // TT
      worksheet.getColumn('B').width = 35;    // Học phần 
      worksheet.getColumn('C').width = 4.5;    // Số TC
      worksheet.getColumn('D').width = 4.5;     // Hệ 10
      worksheet.getColumn('E').width = 4.5;    // Hệ 4
      worksheet.getColumn('F').width = 5;    // Điểm chữ
      worksheet.getColumn('G').width = 2;      // ô trống
      worksheet.getColumn('H').width = 4.5;      // TT
      worksheet.getColumn('I').width = 35;    // Học phần
      worksheet.getColumn('J').width = 4.5;    // Số TC
      worksheet.getColumn('K').width = 4.5;     // Hệ 10
      worksheet.getColumn('L').width = 4.5;    // Hệ 4
      worksheet.getColumn('M').width = 5;    // Điểm chữ

      // Format ngày tháng
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // Phần header đầu tương tự
      worksheet.mergeCells("A1", "E1");
      worksheet.getCell("A1").value = "BAN CƠ YẾU CHÍNH PHỦ";
      worksheet.getCell("A1").alignment = { horizontal: "center" };
      worksheet.getCell("A1").font = { name: 'Times New Roman', size: 12, bold: false };

      worksheet.mergeCells("A2", "E2");
      worksheet.getCell("A2").value = "HỌC VIỆN KỸ THUẬT MẬT MÃ";
      worksheet.getCell("A2").alignment = { horizontal: "center" };
      worksheet.getCell("A2").font = { name: 'Times New Roman', size: 13, bold: true, underline: 'single' };

      worksheet.mergeCells("F1", "M1");
      worksheet.getCell("F1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
      worksheet.getCell("F1").alignment = { horizontal: "center" };
      worksheet.getCell("F1").font = { name: 'Times New Roman', size: 12, bold: true };

      worksheet.mergeCells("F2", "M2");
      worksheet.getCell("F2").value = "Độc lập - Tự do - Hạnh phúc";
      worksheet.getCell("F2").font = { name: 'Times New Roman', bold: true, underline: 'single', size: 13 };
      worksheet.getCell("F2").alignment = { horizontal: "center" };

      worksheet.mergeCells("F3","M3");
      worksheet.getCell("F3").value = `Hà Nội, ngày ${day} tháng ${month} năm ${year}`;
      worksheet.getCell("F3").alignment = { horizontal: "center" };
      worksheet.getCell("F3").font = { name: 'Times New Roman', size: 13, italic: true };
      worksheet.getRow(3).height = ROW_HEIGHT;

      worksheet.getCell("A4").height = 5;
      worksheet.mergeCells("A5", "M5");
      worksheet.getCell("A5").value = "KẾT QUẢ HỌC TẬP";
      worksheet.getCell("A5").font = { name: 'Times New Roman', bold: true, size: 14 };
      worksheet.getCell("A5").alignment = { horizontal: "center" };
      worksheet.getRow(5).height = ROW_HEIGHT;

      // Thông tin học kỳ và năm học
      const namHoc = sinhVien.lop?.khoa_dao_tao?.nam_hoc || '';
      worksheet.mergeCells("A6", "M6");
      worksheet.getCell("A6").value = `Học kỳ ${so_ky_hoc} Năm học ${namHoc}`;
      worksheet.getCell("A6").font = { name: 'Times New Roman', size: 14, bold: true };
      worksheet.getCell("A6").alignment = { horizontal: "center" };
      worksheet.getRow(6).height = 20;

      worksheet.getCell("A7").height = 5;

      // Thông tin sinh viên - 4 dòng, mỗi dòng có 2 cột
      // Dòng 1: Họ và tên | Ngày sinh
      worksheet.mergeCells('A8','F8');
      worksheet.getCell("A8").value = `Họ và tên: ${sinhVien.ho_dem} ${sinhVien.ten}`;
      worksheet.getCell("A8").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(8).height = ROW_HEIGHT;

      worksheet.mergeCells('H8','M8');
      const ngaySinh = sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : '';
      worksheet.getCell("H8").value = `Ngày sinh: ${ngaySinh}`;
      worksheet.getCell("H8").font = { name: 'Times New Roman', size: 12 };

      // Dòng 2: Nơi sinh | Mã học viên
      worksheet.mergeCells('A9','F9');
      const noiSinh = sinhVien.quan_huyen && sinhVien.tinh_thanh ? 
        `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : (sinhVien.que_quan || '');
      worksheet.getCell("A9").value = `Nơi sinh: ${noiSinh}`;
      worksheet.getCell("A9").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(9).height = ROW_HEIGHT;

      worksheet.mergeCells('H9','M9');
      worksheet.getCell("H9").value = `Mã học viên: ${sinhVien.ma_sinh_vien || ''}`;
      worksheet.getCell("H9").font = { name: 'Times New Roman', size: 12 };

      // Dòng 3: Khóa đào tạo | Ngành/chuyên ngành
      worksheet.mergeCells('A10','F10');
      const khoaInfo = sinhVien.lop?.khoa_dao_tao?.ma_khoa || '';
      worksheet.getCell("A10").value = `Khóa đào tạo: ${khoaInfo}`;
      worksheet.getCell("A10").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(10).height = ROW_HEIGHT;

      worksheet.mergeCells('H10','M10');
      const tenKhoa = sinhVien.lop?.khoa_dao_tao?.ten_khoa || '';
      worksheet.getCell("H10").value = `Ngành/chuyên ngành: ${tenKhoa}`;
      worksheet.getCell("H10").font = { name: 'Times New Roman', size: 12 };

      // Dòng 4: Trình độ đào tạo | Hình thức đào tạo
      worksheet.mergeCells('A11','F11');
      worksheet.getCell("A11").value = "Trình độ đào tạo: Đại học";
      worksheet.getCell("A11").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(11).height = ROW_HEIGHT;

      worksheet.mergeCells('H11','M11');
      worksheet.getCell("H11").value = "Hình thức đào tạo: Chính quy";
      worksheet.getCell("H11").font = { name: 'Times New Roman', size: 12 };

      // I. Kết quả đào tạo
      worksheet.mergeCells('A12','M12');
      worksheet.getCell("A12").value = "I. Kết quả đào tạo";
      worksheet.getCell("A12").font = { name: 'Times New Roman', size: 12, bold: true };
      worksheet.getRow(12).height = ROW_HEIGHT;

      // Lấy dữ liệu điểm cho kỳ học sử dụng hàm từ ExcelPhuLucBangService
      const dataDiem = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);

      // Chia dữ liệu thành 2 cột và cân bằng
      const midPoint = Math.ceil(dataDiem.length / 2);
      const leftData = dataDiem.slice(0, midPoint);
      const rightData = dataDiem.slice(midPoint);

      // Hàm tạo header cho bảng
      const createTableHeader = () => {
        // Dòng header 1
        const headerRow1 = worksheet.addRow(['TT', 'Học phần','Số TC', 'Điểm số','', 'Điểm chữ', '','TT', 'Học phần','Số TC', 'Điểm số','', 'Điểm chữ']);
        const headerRow1Idx = worksheet.rowCount;
        
        // Dòng header 2
        const headerRow2 = worksheet.addRow(['', '', '', 'Hệ 10', 'Hệ 4', '',   '',    '', '','', 'Hệ 10', 'Hệ 4', '']);
        const headerRow2Idx = worksheet.rowCount;
        
        // Thực hiện merge các ô
        worksheet.mergeCells(`A${headerRow1Idx}:A${headerRow2Idx}`);
        worksheet.mergeCells(`B${headerRow1Idx}:B${headerRow2Idx}`);
        worksheet.mergeCells(`C${headerRow1Idx}:C${headerRow2Idx}`);
        worksheet.mergeCells(`D${headerRow1Idx}:E${headerRow1Idx}`);
        worksheet.mergeCells(`F${headerRow1Idx}:F${headerRow2Idx}`);
        worksheet.mergeCells(`H${headerRow1Idx}:H${headerRow2Idx}`);
        worksheet.mergeCells(`I${headerRow1Idx}:I${headerRow2Idx}`);
        worksheet.mergeCells(`J${headerRow1Idx}:J${headerRow2Idx}`);
        worksheet.mergeCells(`K${headerRow1Idx}:L${headerRow1Idx}`);
        worksheet.mergeCells(`M${headerRow1Idx}:M${headerRow2Idx}`);
        
        // Áp dụng style cho các ô header dòng 1
        ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K', 'M'].forEach(col => {
          const cell = headerRow1.getCell(col);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.font = { name: 'Times New Roman', size: 10, bold: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        headerRow1.height = 18;

        // Áp dụng style cho các ô header dòng 2
        ['D', 'E', 'K', 'L'].forEach(col => {
          const cell = headerRow2.getCell(col);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.font = { name: 'Times New Roman', size: 10, bold: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Thêm border cho các ô đã merged từ dòng trên
        ['A', 'B', 'C', 'F', 'G', 'H', 'I', 'J', 'M'].forEach(col => {
          const cell = headerRow2.getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        headerRow2.height = 30;
        
        return { headerRow1Idx, headerRow2Idx };
      };

      // Tạo header đầu tiên
      const { headerRow1Idx: firstHeaderRow1Idx } = createTableHeader();

      // Điền dữ liệu vào 2 bảng song song
      const maxRows = Math.max(leftData.length, rightData.length, 1);

      for (let i = 0; i < maxRows; i++) {
        const leftItem = leftData[i];
        const rightItem = rightData[i];
        
        const dataRow = worksheet.addRow([
          // Bảng trái
          leftItem ? i + 1 : '',
          leftItem ? leftItem.ten_mon_hoc : '',
          leftItem ? leftItem.so_tin_chi : '',
          leftItem && leftItem.diem_he_10 !== null ? leftItem.diem_he_10 : '',
          leftItem && leftItem.diem_he_4 !== null ? leftItem.diem_he_4 : '',
          leftItem ? leftItem.diem_chu : '',
          
          '', // Cột trống
          
          // Bảng phải
          rightItem ? i + midPoint + 1 : '',
          rightItem ? rightItem.ten_mon_hoc : '',
          rightItem ? rightItem.so_tin_chi : '',
          rightItem && rightItem.diem_he_10 !== null ? rightItem.diem_he_10 : '',
          rightItem && rightItem.diem_he_4 !== null ? rightItem.diem_he_4 : '',
          rightItem ? rightItem.diem_chu : ''
        ]);
        
        // Áp dụng style cho các ô dữ liệu
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = { 
            horizontal: (colNumber === 2 || colNumber === 9) ? 'left' : 'center', 
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { name: 'Times New Roman', size: 11 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        dataRow.height = ROW_HEIGHT;
      }

      // Merge cột trống (cột G)
      try {
        const startRow = firstHeaderRow1Idx;
        const endRow = worksheet.rowCount;
        worksheet.mergeCells(`G${startRow}:G${endRow}`);
        for (let row = startRow; row <= endRow; row++) {
          const cell = worksheet.getCell(`G${row}`);
          cell.border = {};
        }
      } catch (error) {
        console.warn("Không thể merge cột G:", error.message);
      }

      // II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm
      worksheet.mergeCells(`A${worksheet.rowCount + 1}:M${worksheet.rowCount + 1}`);
      const section2Row = worksheet.addRow([]);
      section2Row.getCell('A').value = "II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm";
      section2Row.getCell('A').font = { name: 'Times New Roman', size: 12, bold: true };
      section2Row.height = ROW_HEIGHT;

      // Tạo header bảng cho phần II (tương tự phần I nhưng trống)
      const { headerRow1Idx: header2Row1Idx } = createTableHeader();

      // Thêm vài dòng trống cho phần II
      for (let i = 0; i < 3; i++) {
        const emptyRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
        emptyRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = { 
            horizontal: (colNumber === 2 || colNumber === 9) ? 'left' : 'center', 
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { name: 'Times New Roman', size: 10 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        emptyRow.height = ROW_HEIGHT;
      }

      // Merge cột trống cho phần II
      try {
        const startRow2 = header2Row1Idx;
        const endRow2 = worksheet.rowCount;
        worksheet.mergeCells(`G${startRow2}:G${endRow2}`);
        for (let row = startRow2; row <= endRow2; row++) {
          const cell = worksheet.getCell(`G${row}`);
          cell.border = {};
        }
      } catch (error) {
        console.warn("Không thể merge cột G cho phần II:", error.message);
      }

      // Tính điểm trung bình kỳ học sử dụng hàm từ ExcelPhuLucBangService
      const { gpa_he_4, gpa_he_10 } = await this.getDiemTrungBinhKyHoc(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);

      // Xếp loại học lực dựa trên GPA hệ 4
      let xepLoaiHocLuc = '';
      if (gpa_he_4 >= 3.5) {
        xepLoaiHocLuc = 'Xuất sắc';
      } else if (gpa_he_4 >= 3.0) {
        xepLoaiHocLuc = 'Giỏi';
      } else if (gpa_he_4 >= 2.5) {
        xepLoaiHocLuc = 'Khá';
      } else if (gpa_he_4 >= 2.0) {
        xepLoaiHocLuc = 'Trung bình';
      } else if (gpa_he_4 >= 1.0) {
        xepLoaiHocLuc = 'Yếu';
      } else {
        xepLoaiHocLuc = 'Kém';
      }

      const dongTrong = worksheet.addRow(['']);
      dongTrong.height = 5;
      // Thông tin tổng kết - 2 bên
      const summaryRow1 = worksheet.addRow([
        `Điểm TB học kỳ (hệ 4): ${gpa_he_4}`, '', '', '', '', '', '',
        `Xếp loại học lực: ${xepLoaiHocLuc}`, '', '', '', '', ''
      ]);
      const summaryRow1Idx = worksheet.rowCount;
      worksheet.mergeCells(`A${summaryRow1Idx}:F${summaryRow1Idx}`);
      worksheet.mergeCells(`H${summaryRow1Idx}:M${summaryRow1Idx}`);
      summaryRow1.getCell('A').font = { name: 'Times New Roman', size: 12 };
      summaryRow1.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
      summaryRow1.getCell('H').font = { name: 'Times New Roman', size: 12 };
      summaryRow1.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };
      summaryRow1.height = ROW_HEIGHT;

      const summaryRow2 = worksheet.addRow([
        `Điểm TB học kỳ (hệ 10): ${gpa_he_10}`, '', '', '', '', '', '',
        '', '', '', '', '', ''
      ]);
      const summaryRow2Idx = worksheet.rowCount;
      worksheet.mergeCells(`A${summaryRow2Idx}:F${summaryRow2Idx}`);
      worksheet.mergeCells(`H${summaryRow2Idx}:M${summaryRow2Idx}`);
      summaryRow2.getCell('A').font = { name: 'Times New Roman', size: 12 };
      summaryRow2.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
      summaryRow2.height = ROW_HEIGHT;

      // Date footer
      const footerDateRow = worksheet.addRow(['', '', '', '', '', '', '', `Hà Nội, ngày ${day} tháng ${month} năm ${year}`, '', '', '', '', '']);
      const footerDateRowIdx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerDateRowIdx}:L${footerDateRowIdx}`);
      footerDateRow.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerDateRow.getCell('H').font = { name: 'Times New Roman', size: 12, italic: true };
      footerDateRow.height = ROW_HEIGHT;

      // Signature lines
      const footerRow3 = worksheet.addRow(['', '', '', '', '', '', '', 'KT. GIÁM ĐỐC', '', '', '', '', '']);
      const footerRow3Idx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerRow3Idx}:L${footerRow3Idx}`);
      footerRow3.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerRow3.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };
      footerRow3.height = 20;

      const footerRow4 = worksheet.addRow(['', '', '', '', '', '', '', 'PHÓ GIÁM ĐỐC', '', '', '', '', '']);
      const footerRow4Idx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerRow4Idx}:L${footerRow4Idx}`);
      footerRow4.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerRow4.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };
      footerRow4.height = 20;

      // Thêm dòng chữ ký
      const signRow1 = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
      signRow1.height = ROW_HEIGHT;
      const signRow2 = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
      signRow2.height = ROW_HEIGHT;
      const signRow3 = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
      signRow3.height = ROW_HEIGHT;

      return workbook;
    } catch (error) {
      console.error("Lỗi khi xuất file Excel kết quả kỳ học:", error);
      throw error;
    }
  }

  async exportKetQuaNamHoc(sinh_vien_id, nam_hoc_truyen_vao) {
    try {
      // Biến chung cho chiều cao dòng
      const ROW_HEIGHT = 23;
      
      // Lấy thông tin sinh viên
      const sinhVien = await sinh_vien.findOne({
        where: { id: sinh_vien_id },
        include: [
          {
            model: lop,
            as: 'lop',
            attributes: ['ma_lop', 'id'],
            include: [
              {
                model: khoa_dao_tao,
                as: 'khoa_dao_tao',
                attributes: ['ma_khoa', 'ten_khoa', 'nam_hoc', 'id','so_ky_hoc']
              }
            ]
          }
        ]
      });
      
      if (!sinhVien) {
        throw new Error("Không tìm thấy thông tin sinh viên");
      }

      const khoa_dao_tao_id = sinhVien.lop?.khoa_dao_tao?.id;
      if (!khoa_dao_tao_id) {
        throw new Error("Không tìm thấy thông tin khóa đào tạo");
      }

      // Tạo workbook mới
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Kết quả năm học", {
        pageSetup: {
          orientation: 'portrait',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          paperSize: 9 // A4
        },
        properties: {
          defaultRowHeight: ROW_HEIGHT
        }
      });

      // Thiết lập độ rộng cột
      worksheet.getColumn('A').width = 4.5;      // TT
      worksheet.getColumn('B').width = 35;    // Học phần 
      worksheet.getColumn('C').width = 4.5;    // Số TC
      worksheet.getColumn('D').width = 4.5;     // Hệ 10
      worksheet.getColumn('E').width = 4.5;    // Hệ 4
      worksheet.getColumn('F').width = 5;    // Điểm chữ
      worksheet.getColumn('G').width = 2;      // ô trống
      worksheet.getColumn('H').width = 4.5;      // TT
      worksheet.getColumn('I').width = 35;    // Học phần
      worksheet.getColumn('J').width = 4.5;    // Số TC
      worksheet.getColumn('K').width = 4.5;     // Hệ 10
      worksheet.getColumn('L').width = 4.5;    // Hệ 4
      worksheet.getColumn('M').width = 5;    // Điểm chữ

      // Format ngày tháng
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // Phần header đầu tương tự
      worksheet.mergeCells("A1", "E1");
      worksheet.getCell("A1").value = "BAN CƠ YẾU CHÍNH PHỦ";
      worksheet.getCell("A1").alignment = { horizontal: "center" };
      worksheet.getCell("A1").font = { name: 'Times New Roman', size: 12, bold: false };

      worksheet.mergeCells("A2", "E2");
      worksheet.getCell("A2").value = "HỌC VIỆN KỸ THUẬT MẬT MÃ";
      worksheet.getCell("A2").alignment = { horizontal: "center" };
      worksheet.getCell("A2").font = { name: 'Times New Roman', size: 13, bold: true, underline: 'single' };

      worksheet.mergeCells("F1", "M1");
      worksheet.getCell("F1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
      worksheet.getCell("F1").alignment = { horizontal: "center" };
      worksheet.getCell("F1").font = { name: 'Times New Roman', size: 12, bold: true };

      worksheet.mergeCells("F2", "M2");
      worksheet.getCell("F2").value = "Độc lập - Tự do - Hạnh phúc";
      worksheet.getCell("F2").font = { name: 'Times New Roman', bold: true, underline: 'single', size: 13 };
      worksheet.getCell("F2").alignment = { horizontal: "center" };

      worksheet.mergeCells("F3","M3");
      worksheet.getCell("F3").value = `Hà Nội, ngày ${day} tháng ${month} năm ${year}`;
      worksheet.getCell("F3").alignment = { horizontal: "center" };
      worksheet.getCell("F3").font = { name: 'Times New Roman', size: 13, italic: true };
      worksheet.getRow(3).height = ROW_HEIGHT;

      worksheet.getCell("A4").height = 5;
      worksheet.mergeCells("A5", "M5");
      worksheet.getCell("A5").value = "KẾT QUẢ HỌC TẬP";
      worksheet.getCell("A5").font = { name: 'Times New Roman', bold: true, size: 14 };
      worksheet.getCell("A5").alignment = { horizontal: "center" };
      worksheet.getRow(5).height = ROW_HEIGHT;

      // Thông tin học kỳ và năm học
      const namHoc = sinhVien.lop?.khoa_dao_tao?.nam_hoc || '';
      worksheet.mergeCells("A6", "M6");
      worksheet.getCell("A6").value = `Năm học ${namHoc}`;
      worksheet.getCell("A6").font = { name: 'Times New Roman', size: 14, bold: true };
      worksheet.getCell("A6").alignment = { horizontal: "center" };
      worksheet.getRow(6).height = 20;

      worksheet.getCell("A7").height = 5;

      // Thông tin sinh viên - 4 dòng, mỗi dòng có 2 cột
      // Dòng 1: Họ và tên | Ngày sinh
      worksheet.mergeCells('A8','F8');
      worksheet.getCell("A8").value = `Họ và tên: ${sinhVien.ho_dem} ${sinhVien.ten}`;
      worksheet.getCell("A8").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(8).height = ROW_HEIGHT;

      worksheet.mergeCells('H8','M8');
      const ngaySinh = sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : '';
      worksheet.getCell("H8").value = `Ngày sinh: ${ngaySinh}`;
      worksheet.getCell("H8").font = { name: 'Times New Roman', size: 12 };

      // Dòng 2: Nơi sinh | Mã học viên
      worksheet.mergeCells('A9','F9');
      const noiSinh = sinhVien.quan_huyen && sinhVien.tinh_thanh ? 
        `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : (sinhVien.que_quan || '');
      worksheet.getCell("A9").value = `Nơi sinh: ${noiSinh}`;
      worksheet.getCell("A9").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(9).height = ROW_HEIGHT;

      worksheet.mergeCells('H9','M9');
      worksheet.getCell("H9").value = `Mã học viên: ${sinhVien.ma_sinh_vien || ''}`;
      worksheet.getCell("H9").font = { name: 'Times New Roman', size: 12 };

      // Dòng 3: Khóa đào tạo | Ngành/chuyên ngành
      worksheet.mergeCells('A10','F10');
      const khoaInfo = sinhVien.lop?.khoa_dao_tao?.ma_khoa || '';
      worksheet.getCell("A10").value = `Khóa đào tạo: ${khoaInfo}`;
      worksheet.getCell("A10").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(10).height = ROW_HEIGHT;

      worksheet.mergeCells('H10','M10');
      const tenKhoa = sinhVien.lop?.khoa_dao_tao?.ten_khoa || '';
      worksheet.getCell("H10").value = `Ngành/chuyên ngành: ${tenKhoa}`;
      worksheet.getCell("H10").font = { name: 'Times New Roman', size: 12 };

      // Dòng 4: Trình độ đào tạo | Hình thức đào tạo
      worksheet.mergeCells('A11','F11');
      worksheet.getCell("A11").value = "Trình độ đào tạo: Đại học";
      worksheet.getCell("A11").font = { name: 'Times New Roman', size: 12 };
      worksheet.getRow(11).height = ROW_HEIGHT;

      worksheet.mergeCells('H11','M11');
      worksheet.getCell("H11").value = "Hình thức đào tạo: Chính quy";
      worksheet.getCell("H11").font = { name: 'Times New Roman', size: 12 };

      // I. Kết quả đào tạo
      worksheet.mergeCells('A12','M12');
      worksheet.getCell("A12").value = "I. Kết quả đào tạo";
      worksheet.getCell("A12").font = { name: 'Times New Roman', size: 12, bold: true };
      worksheet.getRow(12).height = ROW_HEIGHT;

      worksheet.mergeCells('A13','F13');
      worksheet.getCell("A13").value = "a) Học kỳ 1";
      worksheet.getCell("A13").font = { name: 'Times New Roman', size: 12, italic: true };
      worksheet.getRow(13).height = ROW_HEIGHT;

      worksheet.mergeCells('H13','M13');
      worksheet.getCell("H13").value = "b) Học kỳ 2";
      worksheet.getCell("H13").font = { name: 'Times New Roman', size: 12, italic: true };
      worksheet.getRow(13).height = ROW_HEIGHT;

      // Tính toán học kỳ dựa trên năm học truyền vào
      const namHocGoc = sinhVien.lop?.khoa_dao_tao?.nam_hoc || ''; // VD: "2024-2027"
      const soKyHocTong = sinhVien.lop?.khoa_dao_tao?.so_ky_hoc || 6; // Tổng số kỳ học
      //console.log("nam hoc goc", namHocGoc);
      // Kiểm tra định dạng namHocGoc
      if (!namHocGoc) {
        throw new Error("Không tìm thấy thông tin năm học gốc của khóa đào tạo");
      }

      // Tách năm từ namHocGoc để tính khoảng hợp lệ
      const [namBatDauGoc, namKetThucGoc] = namHocGoc.split('-').map(Number);
      if (!namBatDauGoc || !namKetThucGoc) {
        throw new Error("Định dạng năm học gốc không hợp lệ");
      }

      // Chuyển đổi nam_hoc_truyen_vao thành string để đảm bảo có thể sử dụng split()
      const namHocTruyenVaoStr = String(nam_hoc_truyen_vao);
      
      // Kiểm tra định dạng nam_hoc_truyen_vao
      if (!namHocTruyenVaoStr.includes('-')) {
        throw new Error(`Định dạng năm học ${namHocTruyenVaoStr} không hợp lệ. Vui lòng sử dụng định dạng YYYY-YYYY`);
      }

      // Tách năm bắt đầu từ nam_hoc_truyen_vao
      const namBatDauTruyenVao = parseInt(namHocTruyenVaoStr.split('-')[0]); // VD: 2024
      
      // Kiểm tra nam_hoc_truyen_vao có nằm trong khoảng hợp lệ không
      // Khoảng hợp lệ: từ namBatDauGoc đến (namKetThucGoc - 1)
      // VD: namHocGoc = "2024-2027" thì các năm học hợp lệ là: 2024-2025, 2025-2026, 2026-2027
      const namKetThucTruyenVao = namBatDauTruyenVao + 1;
      
      if (namBatDauTruyenVao < namBatDauGoc || namKetThucTruyenVao > namKetThucGoc) {
        throw new Error(`Năm học ${namHocTruyenVaoStr} không nằm trong khoảng đào tạo ${namHocGoc}`);
      }
      
      // Tính offset năm học (mỗi năm học có 2 kỳ)
      const offsetNam = namBatDauTruyenVao - namBatDauGoc; // VD: 0, 1, 2...
      const kyHoc1 = (offsetNam * 2) + 1; // Kỳ 1 của năm học truyền vào
      const kyHoc2 = (offsetNam * 2) + 2; // Kỳ 2 của năm học truyền vào

      // Kiểm tra các kỳ học có vượt quá tổng số kỳ học không
      if (kyHoc1 > soKyHocTong || kyHoc2 > soKyHocTong) {
        throw new Error(`Các kỳ học ${kyHoc1}, ${kyHoc2} vượt quá tổng số kỳ học ${soKyHocTong} của khóa đào tạo`);
      }

      // Lấy dữ liệu điểm cho từng kỳ học
      const dataDiemKy1 = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, kyHoc1, khoa_dao_tao_id);
      const dataDiemKy2 = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, kyHoc2, khoa_dao_tao_id);

      // Chia dữ liệu thành 2 cột (kỳ 1 bên trái, kỳ 2 bên phải)
      const maxRowsNamHoc = Math.max(dataDiemKy1.length, dataDiemKy2.length, 1);
      const leftData = dataDiemKy1; // Dữ liệu kỳ 1
      const rightData = dataDiemKy2; // Dữ liệu kỳ 2

      // Hàm tạo header cho bảng
      const createTableHeader = () => {
        // Dòng header 1
        const headerRow1 = worksheet.addRow(['TT', 'Học phần','Số TC', 'Điểm số','', 'Điểm chữ', '','TT', 'Học phần','Số TC', 'Điểm số','', 'Điểm chữ']);
        const headerRow1Idx = worksheet.rowCount;
        
        // Dòng header 2
        const headerRow2 = worksheet.addRow(['', '', '', 'Hệ 10', 'Hệ 4', '',   '',    '', '','', 'Hệ 10', 'Hệ 4', '']);
        const headerRow2Idx = worksheet.rowCount;
        
        // Thực hiện merge các ô
        worksheet.mergeCells(`A${headerRow1Idx}:A${headerRow2Idx}`);
        worksheet.mergeCells(`B${headerRow1Idx}:B${headerRow2Idx}`);
        worksheet.mergeCells(`C${headerRow1Idx}:C${headerRow2Idx}`);
        worksheet.mergeCells(`D${headerRow1Idx}:E${headerRow1Idx}`);
        worksheet.mergeCells(`F${headerRow1Idx}:F${headerRow2Idx}`);
        worksheet.mergeCells(`H${headerRow1Idx}:H${headerRow2Idx}`);
        worksheet.mergeCells(`I${headerRow1Idx}:I${headerRow2Idx}`);
        worksheet.mergeCells(`J${headerRow1Idx}:J${headerRow2Idx}`);
        worksheet.mergeCells(`K${headerRow1Idx}:L${headerRow1Idx}`);
        worksheet.mergeCells(`M${headerRow1Idx}:M${headerRow2Idx}`);
        
        // Áp dụng style cho các ô header dòng 1
        ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K', 'M'].forEach(col => {
          const cell = headerRow1.getCell(col);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.font = { name: 'Times New Roman', size: 10, bold: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        headerRow1.height = 18;

        // Áp dụng style cho các ô header dòng 2
        ['D', 'E', 'K', 'L'].forEach(col => {
          const cell = headerRow2.getCell(col);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.font = { name: 'Times New Roman', size: 10, bold: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Thêm border cho các ô đã merged từ dòng trên
        ['A', 'B', 'C', 'F', 'G', 'H', 'I', 'J', 'M'].forEach(col => {
          const cell = headerRow2.getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        headerRow2.height = 30;
        
        return { headerRow1Idx, headerRow2Idx };
      };

      // Tạo header đầu tiên
      const { headerRow1Idx: firstHeaderRow1Idx } = createTableHeader();

      // Điền dữ liệu vào 2 bảng song song
      for (let i = 0; i < maxRowsNamHoc; i++) {
        const leftItem = leftData[i];
        const rightItem = rightData[i];
        
        const dataRow = worksheet.addRow([
          // Bảng trái (Kỳ 1)
          leftItem ? i + 1 : '',
          leftItem ? leftItem.ten_mon_hoc : '',
          leftItem ? leftItem.so_tin_chi : '',
          leftItem && leftItem.diem_he_10 !== null ? leftItem.diem_he_10 : '',
          leftItem && leftItem.diem_he_4 !== null ? leftItem.diem_he_4 : '',
          leftItem ? leftItem.diem_chu : '',
          
          '', // Cột trống
          
          // Bảng phải (Kỳ 2)
          rightItem ? i + 1 : '',
          rightItem ? rightItem.ten_mon_hoc : '',
          rightItem ? rightItem.so_tin_chi : '',
          rightItem && rightItem.diem_he_10 !== null ? rightItem.diem_he_10 : '',
          rightItem && rightItem.diem_he_4 !== null ? rightItem.diem_he_4 : '',
          rightItem ? rightItem.diem_chu : ''
        ]);
        
        // Áp dụng style cho các ô dữ liệu
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = { 
            horizontal: (colNumber === 2 || colNumber === 9) ? 'left' : 'center', 
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { name: 'Times New Roman', size: 11 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        dataRow.height = ROW_HEIGHT;
      }

      // Merge cột trống (cột G)
      try {
        const startRow = firstHeaderRow1Idx;
        const endRow = worksheet.rowCount;
        worksheet.mergeCells(`G${startRow}:G${endRow}`);
        for (let row = startRow; row <= endRow; row++) {
          const cell = worksheet.getCell(`G${row}`);
          cell.border = {};
        }
      } catch (error) {
        console.warn("Không thể merge cột G:", error.message);
      }

      // II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm
      const section2Row = worksheet.addRow([]);
      const section2RowIdx = worksheet.rowCount;
      worksheet.mergeCells(`A${section2RowIdx}:M${section2RowIdx}`);
      section2Row.getCell('A').value = "II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm";
      section2Row.getCell('A').font = { name: 'Times New Roman', size: 12, bold: true };
      section2Row.height = ROW_HEIGHT;

      // Thêm dòng a) Học kỳ 1 và b) Học kỳ 2 cho phần II
      const section2SubRow = worksheet.addRow([]);
      const section2SubRowIdx = worksheet.rowCount;
      worksheet.mergeCells(`A${section2SubRowIdx}:F${section2SubRowIdx}`);
      worksheet.mergeCells(`H${section2SubRowIdx}:M${section2SubRowIdx}`);
      section2SubRow.getCell('A').value = "a) Học kỳ 1";
      section2SubRow.getCell('A').font = { name: 'Times New Roman', size: 12, italic: true };
      section2SubRow.getCell('H').value = "b) Học kỳ 2";
      section2SubRow.getCell('H').font = { name: 'Times New Roman', size: 12, italic: true };
      section2SubRow.height = ROW_HEIGHT;

      // Tạo header bảng cho phần II (tương tự phần I nhưng trống)
      const { headerRow1Idx: header2Row1Idx } = createTableHeader();

      // Thêm vài dòng trống cho phần II
      for (let i = 0; i < 3; i++) {
        const emptyRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
        emptyRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = { 
            horizontal: (colNumber === 2 || colNumber === 9) ? 'left' : 'center', 
            vertical: 'middle',
            wrapText: true
          };
          cell.font = { name: 'Times New Roman', size: 10 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        emptyRow.height = ROW_HEIGHT;
      }

      // Merge cột trống cho phần II
      try {
        const startRow2 = header2Row1Idx;
        const endRow2 = worksheet.rowCount;
        worksheet.mergeCells(`G${startRow2}:G${endRow2}`);
        for (let row = startRow2; row <= endRow2; row++) {
          const cell = worksheet.getCell(`G${row}`);
          cell.border = {};
        }
      } catch (error) {
        console.warn("Không thể merge cột G cho phần II:", error.message);
      }

      // Tính điểm trung bình năm học từ cả hai kỳ học
      const gpaKy1 = await this.getDiemTrungBinhKyHoc(sinh_vien_id, kyHoc1, khoa_dao_tao_id);
      const gpaKy2 = await this.getDiemTrungBinhKyHoc(sinh_vien_id, kyHoc2, khoa_dao_tao_id);
      
      // Tính điểm trung bình năm học (trung bình của 2 kỳ)
      const gpa_he_4 = (gpaKy1.gpa_he_4 + gpaKy2.gpa_he_4) / 2;
      const gpa_he_10 = (gpaKy1.gpa_he_10 + gpaKy2.gpa_he_10) / 2;
      
      // Làm tròn 2 chữ số thập phân
      const gpa_he_4_rounded = Math.round(gpa_he_4 * 100) / 100;
      const gpa_he_10_rounded = Math.round(gpa_he_10 * 100) / 100;

      // Xếp loại học lực dựa trên GPA hệ 4
      let xepLoaiHocLuc = '';
      if (gpa_he_4_rounded >= 3.5) {
        xepLoaiHocLuc = 'Xuất sắc';
      } else if (gpa_he_4_rounded >= 3.0) {
        xepLoaiHocLuc = 'Giỏi';
      } else if (gpa_he_4_rounded >= 2.5) {
        xepLoaiHocLuc = 'Khá';
      } else if (gpa_he_4_rounded >= 2.0) {
        xepLoaiHocLuc = 'Trung bình';
      } else if (gpa_he_4_rounded >= 1.0) {
        xepLoaiHocLuc = 'Yếu';
      } else {
        xepLoaiHocLuc = 'Kém';
      }

      const dongTrong = worksheet.addRow(['']);
      dongTrong.height = 5;
      // Thông tin tổng kết - 2 bên
      const summaryRow1 = worksheet.addRow([
        `Điểm TB năm học (hệ 4): ${gpa_he_4_rounded}`, '', '', '', '', '', '',
        `Xếp loại học lực: ${xepLoaiHocLuc}`, '', '', '', '', ''
      ]);
      const summaryRow1Idx = worksheet.rowCount;
      worksheet.mergeCells(`A${summaryRow1Idx}:F${summaryRow1Idx}`);
      worksheet.mergeCells(`H${summaryRow1Idx}:M${summaryRow1Idx}`);
      summaryRow1.getCell('A').font = { name: 'Times New Roman', size: 12 };
      summaryRow1.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
      summaryRow1.getCell('H').font = { name: 'Times New Roman', size: 12 };
      summaryRow1.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };
      summaryRow1.height = ROW_HEIGHT;

      const summaryRow2 = worksheet.addRow([
        `Điểm TB năm học (hệ 10): ${gpa_he_10_rounded}`, '', '', '', '', '', '',
        '', '', '', '', '', ''
      ]);
      const summaryRow2Idx = worksheet.rowCount;
      worksheet.mergeCells(`A${summaryRow2Idx}:F${summaryRow2Idx}`);
      worksheet.mergeCells(`H${summaryRow2Idx}:M${summaryRow2Idx}`);
      summaryRow2.getCell('A').font = { name: 'Times New Roman', size: 12 };
      summaryRow2.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
      summaryRow2.height = ROW_HEIGHT;

      // Date footer
      const footerDateRow = worksheet.addRow(['', '', '', '', '', '', '', `Hà Nội, ngày ${day} tháng ${month} năm ${year}`, '', '', '', '', '']);
      const footerDateRowIdx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerDateRowIdx}:L${footerDateRowIdx}`);
      footerDateRow.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerDateRow.getCell('H').font = { name: 'Times New Roman', size: 12, italic: true };
      footerDateRow.height = ROW_HEIGHT;

      // Signature lines
      const footerRow3 = worksheet.addRow(['', '', '', '', '', '', '', 'KT. GIÁM ĐỐC', '', '', '', '', '']);
      const footerRow3Idx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerRow3Idx}:L${footerRow3Idx}`);
      footerRow3.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerRow3.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };
      footerRow3.height = 20;

      const footerRow4 = worksheet.addRow(['', '', '', '', '', '', '', 'PHÓ GIÁM ĐỐC', '', '', '', '', '']);
      const footerRow4Idx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerRow4Idx}:L${footerRow4Idx}`);
      footerRow4.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerRow4.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };
      footerRow4.height = 20;

      // Thêm dòng chữ ký
      const signRow1 = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
      signRow1.height = ROW_HEIGHT;
      const signRow2 = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
      signRow2.height = ROW_HEIGHT;
      const signRow3 = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
      signRow3.height = ROW_HEIGHT;

      return workbook;
    } catch (error) {
      console.error("Lỗi khi xuất file Excel kết quả năm học:", error);
      throw error;
    }
  }
}

module.exports = new ExportExcelService();