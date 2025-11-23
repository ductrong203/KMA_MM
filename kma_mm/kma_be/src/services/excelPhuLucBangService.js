const ExcelJS = require("exceljs");
const fs = require("fs");
const { Document, Packer, Paragraph, Table, TableCell, BorderStyle, VerticalAlign, TableRow, TextRun, WidthType, AlignmentType, UnderlineType, PageBreak } = require("docx");
const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { sinh_vien, thoi_khoa_bieu, diem, lop, khoa_dao_tao } = models;
const KeHoachMonHocService = require('../services/keHoachMonHocService');
const { text } = require("body-parser");

class ExcelPhuLucBangService {
  static async getSoKyHocVaKhoa(sinh_vien_id) {
    try {
      // Find student by ID
      const sinhVien = await sinh_vien.findOne({
        where: { id: sinh_vien_id }
      });

      if (!sinhVien) {
        throw new Error("Không tìm thấy thông tin sinh viên");
      }

      // Get lop_id from sinh_vien
      const lop_id = sinhVien.lop_id;

      if (!lop_id) {
        throw new Error("Sinh viên không có thông tin lớp");
      }

      // Find class information by lop_id
      const lopInfo = await lop.findOne({
        where: { id: lop_id }
      });

      if (!lopInfo) {
        throw new Error("Không tìm thấy thông tin lớp");
      }

      // Get khoa_dao_tao_id from lop
      const khoa_dao_tao_id = lopInfo.khoa_dao_tao_id;

      if (!khoa_dao_tao_id) {
        throw new Error("Lớp không có thông tin khóa đào tạo");
      }

      // Find khoa_dao_tao by khoa_dao_tao_id
      const khoaDaoTao = await khoa_dao_tao.findOne({
        where: { id: khoa_dao_tao_id }
      });

      if (!khoaDaoTao) {
        throw new Error("Không tìm thấy thông tin khóa đào tạo");
      }

      return {
        so_ky_hoc: khoaDaoTao.so_ky_hoc,
        khoa_dao_tao_id: khoa_dao_tao_id,
      };
    } catch (error) {
      console.error("Error in getSoKyHoc:", error);
      throw error;
    }
  }

  static async getDiemTongKet(sinh_vien_id, mon_hoc_id) {
    try {
      // Lấy danh sách thời khóa biểu có môn học được truyền vào
      const danhSachTKB = await thoi_khoa_bieu.findAll({
        where: { mon_hoc_id: mon_hoc_id }
      });

      if (!danhSachTKB || danhSachTKB.length === 0) {
        return null; // Không tìm thấy thời khóa biểu phù hợp
      }

      // Lấy các ID của thời khóa biểu
      const tkbIds = danhSachTKB.map(tkb => tkb.id);

      // Lấy tất cả điểm của sinh viên có thời khóa biểu thuộc môn học
      const danhSachDiem = await diem.findAll({
        where: {
          sinh_vien_id: sinh_vien_id,
          thoi_khoa_bieu_id: tkbIds
        },
        order: [['lan_hoc', 'DESC']] // Sắp xếp theo lần học giảm dần để lấy lần học lớn nhất
      });

      if (!danhSachDiem || danhSachDiem.length === 0) {
        return null; // Không tìm thấy điểm phù hợp
      }

      // Lấy bản ghi điểm có lần học cao nhất
      const diemCaoNhat = danhSachDiem[0];

      // Tính điểm tổng kết
      let diem_tong_ket;

      if (diemCaoNhat.diem_ck2 !== null && diemCaoNhat.diem_ck2 !== undefined) {
        // Nếu có điểm thi lại (diem_ck2)
        diem_tong_ket = diemCaoNhat.diem_gk * 0.3 + diemCaoNhat.diem_ck2 * 0.7;
      } else {
        // Nếu không có điểm thi lại
        diem_tong_ket = diemCaoNhat.diem_gk * 0.3 + diemCaoNhat.diem_ck * 0.7;
      }

      return diem_tong_ket;
    } catch (error) {
      console.error("Lỗi khi truy vấn điểm tổng kết:", error);
      throw error;
    }
  }

    static async getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id) {
        try {
            // Lấy danh sách môn học theo khóa đào tạo và kỳ học
            const danhSachMonHoc = await KeHoachMonHocService.getMonHocByKhoaDaoTaoAndKyHoc(khoa_dao_tao_id, ky_hoc);
            //console.log("Danh sách môn học:", danhSachMonHoc);
            // Lọc ra các môn học có tinh_diem = 1
            const danhSachMonHocTinhDiem = danhSachMonHoc.filter(monHoc => monHoc.tinh_diem === 1);
            //console.log("Danh sách môn học cần tính điểm:", danhSachMonHocTinhDiem);
            // Mảng kết quả
            const ketQua = [];
            
            // Xử lý từng môn học
            for (const monHoc of danhSachMonHocTinhDiem) {
                // Lấy điểm tổng kết cho môn học này
                //console.log(`Đang xử lý môn học: ${monHoc.ten_mon_hoc}`);
                const diemTongKet = await this.getDiemTongKet(sinh_vien_id, monHoc.id);
                //console.log(`Điểm tổng kết cho môn ${monHoc.ten_mon_hoc}:`, diemTongKet);
                // Nếu không có điểm
                if (diemTongKet === null) {
                    ketQua.push({
                        ten_mon_hoc: monHoc.ten_mon_hoc,
                        so_tin_chi: monHoc.so_tin_chi,
                        diem_he_10: null,
                        diem_he_4: null,
                        diem_chu: null
                    });
                    continue;
                }
                
                // Tính toán điểm hệ 4 và điểm chữ từ điểm hệ 10
                let diem_he_4 = null;
                let diem_chu = null;
                
                if (diemTongKet !== null) {
                    // Quy đổi sang hệ 4
                    if (diemTongKet >= 9.0) {
                        diem_he_4 = 4.0;
                        diem_chu = 'A+';
                    } else if (diemTongKet >= 8.5) {
                        diem_he_4 = 3.7;
                        diem_chu = 'A';
                    } else if (diemTongKet >= 8.0) {
                        diem_he_4 = 3.5;
                        diem_chu = 'B+';
                    } else if (diemTongKet >= 7.0) {
                        diem_he_4 = 3.0;
                        diem_chu = 'B';
                    } else if (diemTongKet >= 6.5) {
                        diem_he_4 = 2.5;
                        diem_chu = 'C+';
                    } else if (diemTongKet >= 5.5) {
                        diem_he_4 = 2.0;
                        diem_chu = 'C';
                    } else if (diemTongKet >= 5.0) {
                        diem_he_4 = 1.5;
                        diem_chu = 'D+';
                    } else if (diemTongKet >= 4.0) {
                        diem_he_4 = 1.0;
                        diem_chu = 'D';
                    } else {
                        diem_he_4 = 0;
                        diem_chu = 'F';
                    }
                }
                
                // Thêm kết quả vào mảng
                ketQua.push({
                    ten_mon_hoc: monHoc.ten_mon_hoc,
                    so_tin_chi: monHoc.so_tin_chi,
                    diem_he_10: diemTongKet ? Math.round(diemTongKet * 100) / 100 : null, // Làm tròn 2 chữ số thập phân
                    diem_he_4: diem_he_4,
                    diem_chu: diem_chu
                });
            }
            
            return ketQua;
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu phụ lục bảng:", error);
            throw error;
        }
    }   

    static async getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id) {
        try {
            let totalCredits = 0;
            let totalWeightedGradePoints = 0;
            
            // Lặp qua từng kỳ học để tính tổng số tín chỉ và điểm GPA
            for (let ky_hoc = 1; ky_hoc <= so_ky_hoc; ky_hoc++) {
                try {
                    const dataDiem = await this.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);
                    
                    if (dataDiem && Array.isArray(dataDiem)) {
                        for (const item of dataDiem) {
                            // Kiểm tra nếu điểm và số tín chỉ đều có giá trị
                            if (item.diem_he_4 !== null && item.diem_he_4 !== undefined && 
                                item.so_tin_chi !== null && item.so_tin_chi !== undefined) {
                                const credits = Number(item.so_tin_chi);
                                const gradePoints = Number(item.diem_he_4);
                                
                                // Chỉ tính các giá trị hợp lệ
                                if (!isNaN(credits) && !isNaN(gradePoints) && gradePoints >= 1.0) { // Chỉ tính điểm đạt (>= D)
                                    totalCredits += credits;
                                    totalWeightedGradePoints += (gradePoints * credits);
                                }
                            }
                        }
                    }
                } catch (kyHocError) {
                    console.error(`Lỗi khi tính điểm cho kỳ học ${ky_hoc}:`, kyHocError);
                    // Tiếp tục với kỳ học tiếp theo
                }
            }
            
            // Tính GPA
            let gpa = 0;
            if (totalCredits > 0) {
                gpa = totalWeightedGradePoints / totalCredits;
                gpa = Math.round(gpa * 100) / 100; // Làm tròn đến 2 chữ số thập phân
            }
            
            return {
                totalCredits,
                gpa
            };
        } catch (error) {
            console.error("Lỗi khi tính tổng số tín chỉ và GPA:", error);
            // Trả về giá trị mặc định nếu có lỗi
            return {
                totalCredits: 0,
                gpa: 0
            };
        }
    }

    static async exportExcelPhuLucBang(sinh_vien_id) {
        try {
            // Lấy thông tin số kỳ học và khóa đào tạo của sinh viên
            const { so_ky_hoc, khoa_dao_tao_id } = await this.getSoKyHocVaKhoa(sinh_vien_id);
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
                                attributes: ['ma_khoa', 'ten_khoa', 'nam_hoc']
                            }
                        ]
                    }
                ]
            });
            
            if (!sinhVien) {
                throw new Error("Không tìm thấy thông tin sinh viên");
            }
            
            // Tạo workbook mới
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Phụ lục bảng điểm", {
                pageSetup: {
                    orientation: 'portrait',
                    fitToPage: true,
                    fitToWidth: 1,
                    fitToHeight: 0,
                    paperSize: 9 // A4
                },
                properties: {
                    defaultRowHeight: 18
                }
            });
            
            // Thiết lập độ rộng cột
            worksheet.getColumn('A').width = 4.5;      // STT
            worksheet.getColumn('B').width = 1;    // Tên học phần (bắt đầu)
            worksheet.getColumn('C').width = 5.5;    // Tên học phần 
            worksheet.getColumn('D').width = 25;     // Tên học phần (chính)
            worksheet.getColumn('E').width = 6;    // Tên học phần (kết thúc)
            worksheet.getColumn('F').width = 8;    // Tên học phần (kết thúc)
            worksheet.getColumn('G').width = 7.7;    // Số tín chỉ
            worksheet.getColumn('H').width = 7.7;    // Điểm hệ 10
            worksheet.getColumn('I').width = 7.7;    // Điểm hệ 4
            worksheet.getColumn('J').width = 7.7;    // Điểm hệ chữ
            worksheet.getColumn('K').width = 7.7;    // Ghi chú
            worksheet.getColumn('L').width = 8    // Ghi chú
            
            //Phần header đầu
            worksheet.mergeCells("A1", "D1");
            worksheet.getCell("A1").value = "BAN CƠ YẾU CHÍNH PHỦ";
            worksheet.getCell("A1").alignment = { horizontal: "center" };
            worksheet.getCell("A1").font = { name: 'Times New Roman',size: 12,bold: false };
          
            worksheet.mergeCells("A2", "D2");
            worksheet.getCell("A2").value = "HỌC VIỆN KỸ THUẬT MẬT MÃ";
            worksheet.getCell("A2").font = { name: 'Times New Roman',size: 13,bold: true, underline: 'single' };
          
            worksheet.mergeCells("F1", "L1");
            worksheet.getCell("F1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
            worksheet.getCell("F1").alignment = { horizontal: "center" };
            worksheet.getCell("F1").font = {name: 'Times New Roman',size: 12, bold: true };
          
            worksheet.mergeCells("F2", "L2");
            worksheet.getCell("F2").value = "Độc lập - Tự do - Hạnh phúc";
            worksheet.getCell("F2").font = { name: 'Times New Roman',bold: true, underline: 'single', size: 12 };
            worksheet.getCell("F2").alignment = { horizontal: "center" };

      worksheet.getCell("A3").height = 5;
      worksheet.mergeCells("A4", "L4");
      worksheet.getCell("A4").value = "PHỤ LỤC VĂN BẰNG";
      worksheet.getCell("A4").font = { name: 'Times New Roman', bold: true, size: 16 };
      worksheet.getCell("A4").alignment = { horizontal: "center" };
      worksheet.getCell("A5").height = 5;

      // --- Phần thông tin văn bằng ---
      worksheet.mergeCells('A6', 'L6');
      worksheet.getCell("A6").value = "I. THÔNG TIN VỀ VĂN BẰNG";
      worksheet.getCell("A6").font = { name: 'Times New Roman', size: 14, bold: true };
      //thông tin bên trái
      worksheet.getCell("A7").value = `Họ và tên: ${sinhVien.ho_dem} ${sinhVien.ten}`;
      worksheet.getCell("A7").font = { name: 'Times New Roman', size: 14 };

      const ngaySinh = sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : '';
      worksheet.getCell("A8").value = `Ngày sinh: ${ngaySinh}`;
      worksheet.getCell("A8").font = { name: 'Times New Roman', size: 14 };

      const noiSinh = sinhVien.quan_huyen && sinhVien.tinh_thanh ?
        `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : '';
      worksheet.getCell("A9").value = `Nơi sinh: ${noiSinh}`;
      worksheet.getCell("A9").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("A10").value = `Mã số sinh viên: ${sinhVien.ma_sinh_vien || ''}`;
      worksheet.getCell("A10").font = { name: 'Times New Roman', size: 14 };

      const khoaInfo = sinhVien.lop?.khoa_dao_tao?.ma_khoa || '';
      worksheet.getCell("A11").value = `Khóa: ${khoaInfo}`;
      worksheet.getCell("A11").font = { name: 'Times New Roman', size: 14 };

      const tenKhoa = sinhVien.lop?.khoa_dao_tao?.ten_khoa || '';
      worksheet.getCell("A12").value = `Chuyên ngành đào tạo: ${tenKhoa}`;
      worksheet.getCell("A12").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("A13").value = "Hình thức đào tạo:";
      worksheet.getCell("A13").font = { name: 'Times New Roman', size: 14 };

      const ngayNhapHoc = sinhVien.ngay_vao_truong ? new Date(sinhVien.ngay_vao_truong).toLocaleDateString('vi-VN') : '';
      worksheet.getCell("A14").value = `Ngày nhập học: ${ngayNhapHoc}`;
      worksheet.getCell("A14").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("A15").value = "Trình độ đào tạo:";
      worksheet.getCell("A15").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("A16").value = "Số hiệu văn bằng:";
      worksheet.getCell("A16").font = { name: 'Times New Roman', size: 14 };

      //thông tin bên phải
      const gioiTinh = sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ";
      worksheet.getCell("H7").value = `Giới tính: ${gioiTinh}`;
      worksheet.getCell("H7").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("H11").value = `Lớp: ${sinhVien.lop?.ma_lop || ''}`;
      worksheet.getCell("H11").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("H13").value = "Ngôn ngữ đào tạo: Tiếng Việt";
      worksheet.getCell("H13").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("H14").value = "Thời gian đào tạo:";
      worksheet.getCell("H14").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("H15").value = "Xếp hạng tốt nghiệp: ";
      worksheet.getCell("H15").font = { name: 'Times New Roman', size: 14 };

      worksheet.getCell("H16").value = "Số vào sổ gốc:";
      worksheet.getCell("H16").font = { name: 'Times New Roman', size: 14 };

      worksheet.addRow([]);

      // --- Phần II ---
      worksheet.mergeCells('A18', 'L18');
      worksheet.getCell("A18").value = "II. ĐIỂM TOÀN KHÓA HỌC";
      worksheet.getCell("A18").font = { name: 'Times New Roman', size: 14, bold: true };

      // Thêm dòng trống để tách biệt
      worksheet.addRow([]);

      let stt = 1;
      // Lặp qua từng kỳ học
      for (let ky_hoc = 1; ky_hoc <= so_ky_hoc; ky_hoc++) {
        // Lấy dữ liệu điểm cho kỳ học hiện tại
        const dataDiem = await this.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);

        // Tạo header cho kỳ học
        // Dòng tiêu đề kỳ học
        const kyHocRow = worksheet.addRow([`HỌC KỲ ${ky_hoc}`]);
        const kyHocRowIdx = worksheet.rowCount;
        worksheet.mergeCells(`A${kyHocRowIdx}:L${kyHocRowIdx}`);
        kyHocRow.getCell('A').alignment = { horizontal: 'center', vertical: 'middle' };
        kyHocRow.getCell('A').font = { name: 'Times New Roman', size: 11, bold: true };
        kyHocRow.getCell('A').border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        kyHocRow.height = 20;

        // Dòng header 1
        const headerRow1 = worksheet.addRow(['STT', 'Tên học phần', '', '', '', '', 'Số tín chỉ', 'Điểm', '', '', 'Ghi chú', '']);
        const headerRow1Idx = worksheet.rowCount;

        // Dòng header 2
        const headerRow2 = worksheet.addRow(['', '', '', '', '', '', '', 'Hệ 10', 'Hệ 4', 'Hệ chữ', '', '']);
        const headerRow2Idx = worksheet.rowCount;

        // Thực hiện merge các ô
        worksheet.mergeCells(`A${headerRow1Idx}:A${headerRow2Idx}`);
        worksheet.mergeCells(`B${headerRow1Idx}:F${headerRow2Idx}`);
        worksheet.mergeCells(`G${headerRow1Idx}:G${headerRow2Idx}`);
        worksheet.mergeCells(`H${headerRow1Idx}:J${headerRow1Idx}`);
        worksheet.mergeCells(`K${headerRow1Idx}:L${headerRow2Idx}`);

        // Áp dụng style cho các ô header dòng 1
        ['A', 'B', 'G', 'H', 'K'].forEach(col => {
          const cell = headerRow1.getCell(col);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.font = { name: 'Times New Roman', size: 9, bold: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        headerRow1.height = 13;

        // Áp dụng style cho các ô header dòng 2
        ['H', 'I', 'J'].forEach(col => {
          const cell = headerRow2.getCell(col);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.font = { name: 'Times New Roman', size: 9, bold: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Thêm border cho các ô đã merged từ dòng trên
        ['A', 'B', 'D', 'E', 'F', 'G', 'K', 'L'].forEach(col => {
          const cell = headerRow2.getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        headerRow2.height = 13;

        // Nếu kỳ học không có dữ liệu, bỏ qua
        if (!dataDiem || dataDiem.length === 0) {
          continue;
        }

        // Thêm dữ liệu điểm
        for (const item of dataDiem) {
          const dataRow = worksheet.addRow([
            stt,
            item.ten_mon_hoc, // Tên học phần
            '',
            '',
            '', // Phần cuối của tên học phần
            '', // Phần cuối của tên học phần
            item.so_tin_chi,
            item.diem_he_10 !== null ? item.diem_he_10 : '',
            item.diem_he_4 !== null ? item.diem_he_4 : '',
            item.diem_chu !== null ? item.diem_chu : '',
            '', // Ghi chú
            '' // Ghi chú
          ]);

          const dataRowIdx = worksheet.rowCount;

          // Merge các cột tên học phần
          worksheet.mergeCells(`B${dataRowIdx}:F${dataRowIdx}`);
          worksheet.mergeCells(`K${dataRowIdx}:L${dataRowIdx}`);

          // Áp dụng style cho các ô dữ liệu
          dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.alignment = {
              horizontal: colNumber === 4 ? 'left' : 'center',
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

          dataRow.height = 15;
          stt++;
        }
      }            // Tính toán tổng số tín chỉ và GPA
      const { totalCredits, gpa } = await this.getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);

      // Thêm dòng trống
      worksheet.addRow();

      // Thêm thông tin tổng kết
      // 1. Thêm dòng tổng số tín chỉ (merged A-D, Times New Roman 14, left aligned)
      const summaryRow1 = worksheet.addRow(['Tổng số tín chỉ đã tích lũy:', totalCredits, '', '', '', '', '', '', '', '', '', '']);
      const summaryRow1Idx = worksheet.rowCount;
      worksheet.mergeCells(`A${summaryRow1Idx}:D${summaryRow1Idx}`);
      summaryRow1.getCell('A').font = { name: 'Times New Roman', size: 14 };
      summaryRow1.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };

      // 2. Thêm dòng GPA (merged A-F, Times New Roman 14, left aligned)
      const summaryRow2 = worksheet.addRow(['Điểm trung bình chung toàn khóa hệ 4:', gpa, '', '', '', '', '', '', '', '', '', '']);
      const summaryRow2Idx = worksheet.rowCount;
      worksheet.mergeCells(`A${summaryRow2Idx}:F${summaryRow2Idx}`);
      summaryRow2.getCell('A').font = { name: 'Times New Roman', size: 14 };
      summaryRow2.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };

      // 3. Thêm dòng Giáo dục thể chất (merged A-D, Times New Roman 14, left aligned)
      const gdtcRow = worksheet.addRow(['Giáo dục Thể chất:', '', '', '', '', '', '', '', '', '', '', '']);
      const gdtcRowIdx = worksheet.rowCount;
      worksheet.mergeCells(`A${gdtcRowIdx}:D${gdtcRowIdx}`);
      gdtcRow.getCell('A').font = { name: 'Times New Roman', size: 14 };
      gdtcRow.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };

      // 4. Thêm dòng Quốc phòng (merged A-F, Times New Roman 14, left aligned)
      const gdqpRow = worksheet.addRow(['Giáo dục Quốc phòng và An ninh: ', '', '', '', '', '', '', '', '', '', '', '']);
      const gdqpRowIdx = worksheet.rowCount;
      worksheet.mergeCells(`A${gdqpRowIdx}:F${gdqpRowIdx}`);
      gdqpRow.getCell('A').font = { name: 'Times New Roman', size: 14 };
      gdqpRow.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };

      // Thêm dòng trống
      worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);

      // Format ngày tháng
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // 5. Thêm dòng date footer 
      const footerDateRow = worksheet.addRow(['', '', '', '', '', '', '', `Hà Nội, ngày ${day} tháng ${month} năm ${year}`, '', '', '', '']);
      const footerDateRowIdx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerDateRowIdx}:L${footerDateRowIdx}`);
      footerDateRow.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerDateRow.getCell('H').font = { name: 'Times New Roman', size: 12, italic: true };

      // 6. Thêm dòng signature line (merged H-L, Times New Roman 13, center aligned, bold)
      const footerRow3 = worksheet.addRow(['', '', '', '', '', '', '', 'KT. GIÁM ĐỐC', '', '', '', '']);
      const footerRow3Idx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerRow3Idx}:L${footerRow3Idx}`);
      footerRow3.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerRow3.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };

      const footerRow4 = worksheet.addRow(['', '', '', '', '', '', '', 'PHÓ GIÁM ĐỐC', '', '', '', '']);
      const footerRow4Idx = worksheet.rowCount;
      worksheet.mergeCells(`H${footerRow4Idx}:L${footerRow4Idx}`);
      footerRow4.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
      footerRow4.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };

      // Thêm dòng chữ ký
      worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);

      // Trả về workbook
      return workbook;

    } catch (error) {
      console.error("Lỗi khi xuất file Excel phụ lục bảng:", error);
      throw error;
    }
  }

    static async exportExcelPhuLucBang_v2(sinh_vien_id) {
        try {
            // Lấy thông tin số kỳ học và khóa đào tạo của sinh viên
            const { so_ky_hoc, khoa_dao_tao_id } = await this.getSoKyHocVaKhoa(sinh_vien_id);
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
                                attributes: ['ma_khoa', 'ten_khoa', 'nam_hoc']
                            }
                        ]
                    }
                ]
            });
            
            if (!sinhVien) {
                throw new Error("Không tìm thấy thông tin sinh viên");
            }
            
            // Tạo workbook mới
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Phụ lục bảng điểm", {
                pageSetup: {
                    orientation: 'portrait',
                    fitToPage: true,
                    fitToWidth: 1,
                    fitToHeight: 0,
                    paperSize: 9 // A4
                },
                properties: {
                    defaultRowHeight: 18
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
            worksheet.getColumn('M').width = 5    // Điểm chữ
            
            // Format ngày tháng
            const today = new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            //Phần header đầu
            worksheet.mergeCells("A1", "E1");
            worksheet.getCell("A1").value = "BAN CƠ YẾU CHÍNH PHỦ";
            worksheet.getCell("A1").alignment = { horizontal: "center" };
            worksheet.getCell("A1").font = { name: 'Times New Roman',size: 12,bold: false };
          
            worksheet.mergeCells("A2", "E2");
            worksheet.getCell("A2").value = "HỌC VIỆN KỸ THUẬT MẬT MÃ";
            worksheet.getCell("A2").alignment = { horizontal: "center" };
            worksheet.getCell("A2").font = { name: 'Times New Roman',size: 13,bold: true, underline: 'single' };
          
            worksheet.mergeCells("F1", "M1");
            worksheet.getCell("F1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
            worksheet.getCell("F1").alignment = { horizontal: "center" };
            worksheet.getCell("F1").font = {name: 'Times New Roman',size: 12, bold: true };
          
            worksheet.mergeCells("F2", "M2");
            worksheet.getCell("F2").value = "Độc lập - Tự do - Hạnh phúc";
            worksheet.getCell("F2").font = { name: 'Times New Roman',bold: true, underline: 'single', size: 13 };
            worksheet.getCell("F2").alignment = { horizontal: "center" };

            worksheet.mergeCells("F3","M3");
            worksheet.getCell("F3").value = `Hà Nội, ngày ${day} tháng ${month} năm ${year}`;
            worksheet.getCell("F3").alignment = { horizontal: "center" };
            worksheet.getCell("F3").font = { name: 'Times New Roman', size: 13, italic: true };

            worksheet.getCell("A4").height = 5;
            worksheet.mergeCells("A5", "M5");
            worksheet.getCell("A5").value = "PHỤ LỤC VĂN BẰNG";
            worksheet.getCell("A5").font = { name: 'Times New Roman',bold: true, size: 14 };
            worksheet.getCell("A5").alignment = { horizontal: "center" };
            worksheet.getCell("A6").height = 5;
            // --- Phần thông tin văn bằng ---
            worksheet.mergeCells('A7','M7');
            worksheet.getCell("A7").value = "I. Thông tin chung";
            worksheet.getCell("A7").font = { name: 'Times New Roman',size: 12,bold: true };
            //thông tin bên trái
            worksheet.mergeCells('A8','F8');
            worksheet.getCell("A8").value = `Họ và tên: ${sinhVien.ho_dem} ${sinhVien.ten}`;
            worksheet.getCell("A8").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A9','F9');
            const noiSinh = sinhVien.quan_huyen && sinhVien.tinh_thanh ? 
                `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : (sinhVien.que_quan || '');
            worksheet.getCell("A9").value = `Nơi sinh: ${noiSinh}`;
            worksheet.getCell("A9").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('A10','F10');
            worksheet.getCell("A10").value = `Mã học viên: ${sinhVien.ma_sinh_vien || ''}`;
            worksheet.getCell("A10").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('A11','F11');
            const tenKhoa = sinhVien.lop?.khoa_dao_tao?.ten_khoa || '';
            worksheet.getCell("A11").value = `Ngành đào tạo: ${tenKhoa}`;
            worksheet.getCell("A11").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('A12','F12');
            worksheet.getCell("A12").value = "Trình độ đào tạo: Đại học";
            worksheet.getCell("A12").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('A13','F13');
            const ngayNhapHoc = sinhVien.ngay_vao_truong ? new Date(sinhVien.ngay_vao_truong).toLocaleDateString('vi-VN') : '';
            worksheet.getCell("A13").value = `Ngày nhập học: ${ngayNhapHoc}`;
            worksheet.getCell("A13").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('A14','F14');
            worksheet.getCell("A14").value = "Ngôn ngữ đào tạo: Tiếng Việt";
            worksheet.getCell("A14").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('A15','F15');
            worksheet.getCell("A15").value = "Số hiệu văn bằng:";
            worksheet.getCell("A15").font = { name: 'Times New Roman', size: 12 };
          
            //thông tin bên phải
            worksheet.mergeCells('H8','M8');
            const ngaySinh = sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : '';
            worksheet.getCell("H8").value = `Ngày sinh: ${ngaySinh}`;
            worksheet.getCell("H8").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H9','M9');
            const gioiTinh = sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ";
            worksheet.getCell("H9").value = `Giới tính: ${gioiTinh}`;
            worksheet.getCell("H9").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('H10','M10');
            const khoaInfo = sinhVien.lop?.khoa_dao_tao?.ma_khoa || '';
            worksheet.getCell("H10").value = `Khóa đào tạo: ${khoaInfo}`;
            worksheet.getCell("H10").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('H11','M11');
            worksheet.getCell("H11").value = "Chuyên ngành:";
            worksheet.getCell("H11").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('H12','M12');
            worksheet.getCell("H12").value = "Hình thức đào tạo: Chính quy";
            worksheet.getCell("H12").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('H13','M13');
            worksheet.getCell("H13").value = "Thời gian đào tạo:";
            worksheet.getCell("H13").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('H14','M14');
            worksheet.getCell("H14").value = "Xếp hạng tốt nghiệp:";
            worksheet.getCell("H14").font = { name: 'Times New Roman', size: 12 };
            
            worksheet.mergeCells('H15','M15');
            worksheet.getCell("H15").value = "Số vào sổ cấp bằng:";
            worksheet.getCell("H15").font = { name: 'Times New Roman', size: 12 };

            worksheet.addRow([]);

            // --- Phần II ---
            worksheet.mergeCells('A16','M16');
            worksheet.getCell("A16").value = "II. Kết quả đào tạo ";
            worksheet.getCell("A16").font = { name: 'Times New Roman',size: 12,bold: true };            // Lấy tất cả dữ liệu từ tất cả kỳ học
            let allData = [];
            for (let ky_hoc = 1; ky_hoc <= so_ky_hoc; ky_hoc++) {
                const dataDiem = await this.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);
                if (dataDiem && dataDiem.length > 0) {
                    allData = allData.concat(dataDiem);
                }            }

            // Chia dữ liệu thành 2 cột và cân bằng
            const midPoint = Math.ceil(allData.length / 2);
            const leftData = allData.slice(0, midPoint);
            const rightData = allData.slice(midPoint);
            
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

                headerRow1.height = 15;

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
            const ROWS_PER_PAGE = 50; // Mỗi bảng 50 dòng = tổng 100 dòng
            
            let currentPage = 0;
            let rowsInCurrentPage = 0;
            let dataStartRow = worksheet.rowCount + 1;
            let allHeaderRows = [firstHeaderRow1Idx];
            
            for (let i = 0; i < maxRows; i++) {
                // Kiểm tra nếu cần tạo header mới (sau mỗi 50 dòng)
                if (i > 0 && i % ROWS_PER_PAGE === 0) {
                    // Thêm một dòng trống trước header mới
                    //worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
                    
                    // Tạo header mới
                    const { headerRow1Idx } = createTableHeader();
                    allHeaderRows.push(headerRow1Idx);
                    
                    // Reset data start row cho page mới
                    dataStartRow = worksheet.rowCount + 1;
                    currentPage++;
                    rowsInCurrentPage = 0;
                }
                
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
                    cell.font = { name: 'Times New Roman', size: 10 };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
                dataRow.height = 15;
                rowsInCurrentPage++;
            }
            
            // Merge cột trống (cột G) cho từng phần dữ liệu
            let startRow = firstHeaderRow1Idx;
            let currentRowIndex = firstHeaderRow1Idx + 2; // Bắt đầu sau header (2 dòng)
            
            for (let pageIndex = 0; pageIndex <= currentPage; pageIndex++) {
                const isLastPage = pageIndex === currentPage;
                const rowsInThisPage = isLastPage ? rowsInCurrentPage : ROWS_PER_PAGE;
                
                if (rowsInThisPage > 0) {
                    const endRow = currentRowIndex + rowsInThisPage - 1;
                    
                    if (pageIndex === 0) {
                        // Merge từ header đầu tiên
                        try {
                            worksheet.mergeCells(`G${firstHeaderRow1Idx}:G${endRow}`);
                            for (let row = firstHeaderRow1Idx; row <= endRow; row++) {
                                const cell = worksheet.getCell(`G${row}`);
                                cell.border = {};
                            }
                        } catch (error) {
                            console.warn("Không thể merge cột G cho page đầu tiên:", error.message);
                        }
                    } else {
                        // Merge từ header của page hiện tại
                        const headerRowIndex = allHeaderRows[pageIndex];
                        try {
                            worksheet.mergeCells(`G${headerRowIndex}:G${endRow}`);
                            for (let row = headerRowIndex; row <= endRow; row++) {
                                const cell = worksheet.getCell(`G${row}`);
                                cell.border = {};
                            }
                        } catch (error) {
                            console.warn(`Không thể merge cột G cho page ${pageIndex}:`, error.message);
                        }
                    }
                    
                    // Cập nhật currentRowIndex cho page tiếp theo
                    currentRowIndex = endRow + 4; // +3 cho dòng trống và 2 dòng header + 1 để bắt đầu dữ liệu
                }
            }// Tính toán tổng số tín chỉ và GPA
            const { totalCredits, gpa } = await this.getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);
            
            // Thêm dòng trống
            worksheet.addRow();
              // Thêm thông tin tổng kết - 2 bên
            // 1. Dòng 1: Tổng số tín chỉ tích luỹ và Giáo dục thể chất
            const summaryRow1 = worksheet.addRow([
                `Tổng số tín chỉ tích luỹ: ${totalCredits}`, '', '', '', '', '', '',
                'Giáo dục thể chất:', '', '', '', '', ''
            ]);
            const summaryRow1Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow1Idx}:F${summaryRow1Idx}`);
            worksheet.mergeCells(`H${summaryRow1Idx}:M${summaryRow1Idx}`);
            summaryRow1.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow1.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
            summaryRow1.getCell('H').font = { name: 'Times New Roman', size: 12 };
            summaryRow1.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };
            
            // 2. Dòng 2: Điểm TB tích luỹ toàn khoá (hệ 4) và Giáo dục Quốc phòng
            const summaryRow2 = worksheet.addRow([
                `Điểm TB tích luỹ toàn khoá (hệ 4): ${gpa}`, '', '', '', '', '', '',
                'Giáo dục Quốc phòng và an ninh:', '', '', '', '', ''
            ]);
            const summaryRow2Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow2Idx}:F${summaryRow2Idx}`);
            worksheet.mergeCells(`H${summaryRow2Idx}:M${summaryRow2Idx}`);
            summaryRow2.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow2.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
            summaryRow2.getCell('H').font = { name: 'Times New Roman', size: 12 };
            summaryRow2.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };
            
            // 3. Dòng 3: Điểm TB tích luỹ toàn khoá (hệ 10) và Chuẩn đầu ra Tiếng anh
            const gpa10 = gpa * 2.5; // Quy đổi từ hệ 4 sang hệ 10 (ước tính)
            const summaryRow3 = worksheet.addRow([
                `Điểm TB tích luỹ toàn khoá (hệ 10): ${gpa10.toFixed(2)}`, '', '', '', '', '', '',
                'Chuẩn đầu ra Tiếng anh:', '', '', '', '', ''
            ]);
            const summaryRow3Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow3Idx}:F${summaryRow3Idx}`);
            worksheet.mergeCells(`H${summaryRow3Idx}:M${summaryRow3Idx}`);
            summaryRow3.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow3.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
            summaryRow3.getCell('H').font = { name: 'Times New Roman', size: 12 };
            summaryRow3.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };
            
            // 4. Dòng 4: Xếp loại tốt nghiệp
            const summaryRow4 = worksheet.addRow([
                'Xếp loại tốt nghiệp:', '', '', '', '', '', '',
                '', '', '', '', '', ''
            ]);
            const summaryRow4Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow4Idx}:F${summaryRow4Idx}`);
            worksheet.mergeCells(`H${summaryRow4Idx}:M${summaryRow4Idx}`);
            summaryRow4.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow4.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
            
            // Thêm dòng trống
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);

            // 5. Thêm dòng date footer     
            const footerDateRow = worksheet.addRow(['', '', '', '', '', '', '', `Hà Nội, ngày ${day} tháng ${month} năm ${year}`, '', '', '', '']);
            const footerDateRowIdx = worksheet.rowCount;
            worksheet.mergeCells(`H${footerDateRowIdx}:L${footerDateRowIdx}`);
            footerDateRow.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
            footerDateRow.getCell('H').font = { name: 'Times New Roman', size: 12, italic: true };
            
            // 6. Thêm dòng signature line (merged H-L, Times New Roman 13, center aligned, bold)
            const footerRow3 = worksheet.addRow(['', '', '', '', '', '', '', 'KT. GIÁM ĐỐC', '', '', '', '']);
            const footerRow3Idx = worksheet.rowCount;
            worksheet.mergeCells(`H${footerRow3Idx}:L${footerRow3Idx}`);
            footerRow3.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
            footerRow3.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };

            const footerRow4 = worksheet.addRow(['', '', '', '', '', '', '', 'PHÓ GIÁM ĐỐC', '', '', '', '']);
            const footerRow4Idx = worksheet.rowCount;
            worksheet.mergeCells(`H${footerRow4Idx}:L${footerRow4Idx}`);
            footerRow4.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
            footerRow4.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };
            
            // Thêm dòng chữ ký
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
            
            // Trả về workbook
            return workbook;
        } catch (error) {
            console.error("Lỗi khi xuất file Excel phụ lục bảng:", error);
            throw error;
        }
    }

    static async exportExcelPhuLucBang_v3_test(sinh_vien_id) {
        try {
            // Lấy thông tin số kỳ học và khóa đào tạo của sinh viên
            const { so_ky_hoc, khoa_dao_tao_id } = await this.getSoKyHocVaKhoa(sinh_vien_id);
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
                                attributes: ['ma_khoa', 'ten_khoa', 'nam_hoc']
                            }
                        ]
                    }
                ]
            });

            if (!sinhVien) {
                throw new Error("Không tìm thấy thông tin sinh viên");
            }

            // Tạo workbook mới
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Phụ lục bảng điểm", {
                pageSetup: {
                    orientation: 'portrait',
                    fitToPage: true,
                    fitToWidth: 1,
                    fitToHeight: 0,
                    paperSize: 9 // A4
                },
                properties: {
                    defaultRowHeight: 18
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

            // Phần header đầu
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

            worksheet.mergeCells("F3", "M3");
            worksheet.getCell("F3").value = `Hà Nội, ngày ${day} tháng ${month} năm ${year}`;
            worksheet.getCell("F3").alignment = { horizontal: "center" };
            worksheet.getCell("F3").font = { name: 'Times New Roman', size: 13, italic: true };

            worksheet.getCell("A4").height = 5;
            worksheet.mergeCells("A5", "M5");
            worksheet.getCell("A5").value = "PHỤ LỤC VĂN BẰNG";
            worksheet.getCell("A5").font = { name: 'Times New Roman', bold: true, size: 14 };
            worksheet.getCell("A5").alignment = { horizontal: "center" };
            worksheet.getCell("A6").height = 5;

            // --- Phần thông tin văn bằng ---
            worksheet.mergeCells('A7', 'M7');
            worksheet.getCell("A7").value = "I. Thông tin chung";
            worksheet.getCell("A7").font = { name: 'Times New Roman', size: 12, bold: true };

            // thông tin bên trái
            worksheet.mergeCells('A8', 'F8');
            worksheet.getCell("A8").value = `Họ và tên: ${sinhVien.ho_dem} ${sinhVien.ten}`;
            worksheet.getCell("A8").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A9', 'F9');
            const noiSinh = sinhVien.quan_huyen && sinhVien.tinh_thanh ? 
                `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : (sinhVien.que_quan || '');
            worksheet.getCell("A9").value = `Nơi sinh: ${noiSinh}`;
            worksheet.getCell("A9").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A10', 'F10');
            worksheet.getCell("A10").value = `Mã học viên: ${sinhVien.ma_sinh_vien || ''}`;
            worksheet.getCell("A10").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A11', 'F11');
            const tenKhoa = sinhVien.lop?.khoa_dao_tao?.ten_khoa || '';
            worksheet.getCell("A11").value = `Ngành đào tạo: ${tenKhoa}`;
            worksheet.getCell("A11").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A12', 'F12');
            worksheet.getCell("A12").value = "Trình độ đào tạo: Đại học";
            worksheet.getCell("A12").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A13', 'F13');
            const ngayNhapHoc = sinhVien.ngay_vao_truong ? new Date(sinhVien.ngay_vao_truong).toLocaleDateString('vi-VN') : '';
            worksheet.getCell("A13").value = `Ngày nhập học: ${ngayNhapHoc}`;
            worksheet.getCell("A13").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A14', 'F14');
            worksheet.getCell("A14").value = "Ngôn ngữ đào tạo: Tiếng Việt";
            worksheet.getCell("A14").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('A15', 'F15');
            worksheet.getCell("A15").value = "Số hiệu văn bằng:";
            worksheet.getCell("A15").font = { name: 'Times New Roman', size: 12 };

            // thông tin bên phải
            worksheet.mergeCells('H8', 'M8');
            const ngaySinh = sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : '';
            worksheet.getCell("H8").value = `Ngày sinh: ${ngaySinh}`;
            worksheet.getCell("H8").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H9', 'M9');
            const gioiTinh = sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ";
            worksheet.getCell("H9").value = `Giới tính: ${gioiTinh}`;
            worksheet.getCell("H9").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H10', 'M10');
            const khoaInfo = sinhVien.lop?.khoa_dao_tao?.ma_khoa || '';
            worksheet.getCell("H10").value = `Khóa đào tạo: ${khoaInfo}`;
            worksheet.getCell("H10").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H11', 'M11');
            worksheet.getCell("H11").value = "Chuyên ngành:";
            worksheet.getCell("H11").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H12', 'M12');
            worksheet.getCell("H12").value = "Hình thức đào tạo: Chính quy";
            worksheet.getCell("H12").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H13', 'M13');
            worksheet.getCell("H13").value = "Thời gian đào tạo:";
            worksheet.getCell("H13").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H14', 'M14');
            worksheet.getCell("H14").value = "Xếp hạng tốt nghiệp:";
            worksheet.getCell("H14").font = { name: 'Times New Roman', size: 12 };

            worksheet.mergeCells('H15', 'M15');
            worksheet.getCell("H15").value = "Số vào sổ cấp bằng:";
            worksheet.getCell("H15").font = { name: 'Times New Roman', size: 12 };

            worksheet.addRow([]);

            // --- Phần II ---
            worksheet.mergeCells('A16', 'M16');
            worksheet.getCell("A16").value = "II. Kết quả đào tạo ";
            worksheet.getCell("A16").font = { name: 'Times New Roman', size: 12, bold: true };            // Lấy tất cả dữ liệu từ tất cả kỳ học
            let allData = [];
            for (let ky_hoc = 1; ky_hoc <= so_ky_hoc; ky_hoc++) {
                const dataDiem = await this.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);
                if (dataDiem && dataDiem.length > 0) {
                    allData = allData.concat(dataDiem);
                }
            }

            // Chia dữ liệu thành 2 cột và cân bằng
            const midPoint = Math.ceil(allData.length / 2);
            const leftData = allData.slice(0, midPoint);
            const rightData = allData.slice(midPoint);
            
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

                headerRow1.height = 15;

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
            const ROWS_PER_PAGE = 50; // Mỗi bảng 50 dòng = tổng 100 dòng
            
            let currentPage = 0;
            let rowsInCurrentPage = 0;
            let dataStartRow = worksheet.rowCount + 1;
            let allHeaderRows = [firstHeaderRow1Idx];
            
            for (let i = 0; i < maxRows; i++) {
                // Kiểm tra nếu cần tạo header mới (sau mỗi 50 dòng)
                if (i > 0 && i % ROWS_PER_PAGE === 0) {
                    // Thêm một dòng trống trước header mới
                    worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '']);
                    
                    // Tạo header mới
                    const { headerRow1Idx } = createTableHeader();
                    allHeaderRows.push(headerRow1Idx);
                    
                    // Reset data start row cho page mới
                    dataStartRow = worksheet.rowCount + 1;
                    currentPage++;
                    rowsInCurrentPage = 0;
                }
                
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
                    cell.font = { name: 'Times New Roman', size: 10 };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
                dataRow.height = 15;
                rowsInCurrentPage++;
            }

            // Thêm 30 dòng trống cho mỗi bảng với số thứ tự
            const leftStartNumber = leftData.length + 1; // Số thứ tự tiếp theo cho bảng trái
            const rightStartNumber = midPoint + rightData.length + 1; // Số thứ tự tiếp theo cho bảng phải
            for (let i = 0; i < 30; i++) {
                const blankRow = worksheet.addRow([
                    // Bảng trái
                    leftStartNumber + i,
                    '', // Học phần
                    '', // Số TC
                    '', // Hệ 10
                    '', // Hệ 4
                    '', // Điểm chữ
                    '', // Cột trống
                    // Bảng phải
                    rightStartNumber + i,
                    '', // Học phần
                    '', // Số TC
                    '', // Hệ 10
                    '', // Hệ 4
                    ''  // Điểm chữ
                ]);

                blankRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
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
                blankRow.height = 15;
                rowsInCurrentPage++;
            }
            
            // Merge cột trống (cột G) cho từng phần dữ liệu
            let startRow = firstHeaderRow1Idx;
            let currentRowIndex = firstHeaderRow1Idx + 2; // Bắt đầu sau header (2 dòng)
            
            for (let pageIndex = 0; pageIndex <= currentPage; pageIndex++) {
                const isLastPage = pageIndex === currentPage;
                const rowsInThisPage = isLastPage ? rowsInCurrentPage : ROWS_PER_PAGE + 30; // +30 cho dòng trống
                
                if (rowsInThisPage > 0) {
                    const endRow = currentRowIndex + rowsInThisPage - 1;
                    
                    if (pageIndex === 0) {
                        // Merge từ header đầu tiên
                        try {
                            worksheet.mergeCells(`G${firstHeaderRow1Idx}:G${endRow}`);
                            for (let row = firstHeaderRow1Idx; row <= endRow; row++) {
                                const cell = worksheet.getCell(`G${row}`);
                                cell.border = {};
                            }
                        } catch (error) {
                            console.warn("Không thể merge cột G cho page đầu tiên:", error.message);
                        }
                    } else {
                        // Merge từ header của page hiện tại
                        const headerRowIndex = allHeaderRows[pageIndex];
                        try {
                            worksheet.mergeCells(`G${headerRowIndex}:G${endRow}`);
                            for (let row = headerRowIndex; row <= endRow; row++) {
                                const cell = worksheet.getCell(`G${row}`);
                                cell.border = {};
                            }
                        } catch (error) {
                            console.warn(`Không thể merge cột G cho page ${pageIndex}:`, error.message);
                        }
                    }
                    
                    // Cập nhật currentRowIndex cho page tiếp theo
                    currentRowIndex = endRow + 4; // +3 cho dòng trống và 2 dòng header + 1 để bắt đầu dữ liệu
                }
            }

            // Tính toán tổng số tín chỉ và GPA
            const { totalCredits, gpa } = await this.getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);

            // Thêm dòng trống
            worksheet.addRow();

            // Thêm thông tin tổng kết - 2 bên
            // 1. Dòng 1: Tổng số tín chỉ tích luỹ và Giáo dục thể chất
            const summaryRow1 = worksheet.addRow([
                `Tổng số tín chỉ tích luỹ: ${totalCredits}`, '', '', '', '', '', '',
                'Giáo dục thể chất:', '', '', '', '', ''
            ]);
            const summaryRow1Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow1Idx}:F${summaryRow1Idx}`);
            worksheet.mergeCells(`H${summaryRow1Idx}:M${summaryRow1Idx}`);
            summaryRow1.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow1.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
            summaryRow1.getCell('H').font = { name: 'Times New Roman', size: 12 };
            summaryRow1.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };

            // 2. Dòng 2: Điểm TB tích luỹ toàn khoá (hệ 4) và Giáo dục Quốc phòng
            const summaryRow2 = worksheet.addRow([
                `Điểm TB tích luỹ toàn khoá (hệ 4): ${gpa}`, '', '', '', '', '', '',
                'Giáo dục Quốc phòng và an ninh:', '', '', '', '', ''
            ]);
            const summaryRow2Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow2Idx}:F${summaryRow2Idx}`);
            worksheet.mergeCells(`H${summaryRow2Idx}:M${summaryRow2Idx}`);
            summaryRow2.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow2.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
            summaryRow2.getCell('H').font = { name: 'Times New Roman', size: 12 };
            summaryRow2.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };

            // 3. Dòng 3: Điểm TB tích luỹ toàn khoá (hệ 10) và Chuẩn đầu ra Tiếng anh
            const gpa10 = gpa * 2.5; // Quy đổi từ hệ 4 sang hệ 10 (ước tính)
            const summaryRow3 = worksheet.addRow([
                `Điểm TB tích luỹ toàn khoá (hệ 10): ${gpa10.toFixed(2)}`, '', '', '', '', '', '',
                'Chuẩn đầu ra Tiếng anh:', '', '', '', '', ''
            ]);
            const summaryRow3Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow3Idx}:F${summaryRow3Idx}`);
            worksheet.mergeCells(`H${summaryRow3Idx}:M${summaryRow3Idx}`);
            summaryRow3.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow3.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };
            summaryRow3.getCell('H').font = { name: 'Times New Roman', size: 12 };
            summaryRow3.getCell('H').alignment = { horizontal: 'left', vertical: 'middle' };

            // 4. Dòng 4: Xếp loại tốt nghiệp
            const summaryRow4 = worksheet.addRow([
                'Xếp loại tốt nghiệp:', '', '', '', '', '', '',
                '', '', '', '', '', ''
            ]);
            const summaryRow4Idx = worksheet.rowCount;
            worksheet.mergeCells(`A${summaryRow4Idx}:F${summaryRow4Idx}`);
            worksheet.mergeCells(`H${summaryRow4Idx}:M${summaryRow4Idx}`);
            summaryRow4.getCell('A').font = { name: 'Times New Roman', size: 12 };
            summaryRow4.getCell('A').alignment = { horizontal: 'left', vertical: 'middle' };

            // Thêm dòng trống
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);

            // 5. Thêm dòng date footer     
            const footerDateRow = worksheet.addRow(['', '', '', '', '', '', '', `Hà Nội, ngày ${day} tháng ${month} năm ${year}`, '', '', '', '']);
            const footerDateRowIdx = worksheet.rowCount;
            worksheet.mergeCells(`H${footerDateRowIdx}:L${footerDateRowIdx}`);
            footerDateRow.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
            footerDateRow.getCell('H').font = { name: 'Times New Roman', size: 12, italic: true };

            // 6. Thêm dòng signature line (merged H-L, Times New Roman 13, center aligned, bold)
            const footerRow3 = worksheet.addRow(['', '', '', '', '', '', '', 'KT. GIÁM ĐỐC', '', '', '', '']);
            const footerRow3Idx = worksheet.rowCount;
            worksheet.mergeCells(`H${footerRow3Idx}:L${footerRow3Idx}`);
            footerRow3.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
            footerRow3.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };

            const footerRow4 = worksheet.addRow(['', '', '', '', '', '', '', 'PHÓ GIÁM ĐỐC', '', '', '', '']);
            const footerRow4Idx = worksheet.rowCount;
            worksheet.mergeCells(`H${footerRow4Idx}:L${footerRow4Idx}`);
            footerRow4.getCell('H').alignment = { horizontal: 'center', vertical: 'middle' };
            footerRow4.getCell('H').font = { name: 'Times New Roman', size: 13, bold: true };

            // Thêm dòng chữ ký
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
            worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);

            // Trả về workbook
            return workbook;
        } catch (error) {
            console.error("Lỗi khi xuất file Excel phụ lục bảng:", error);
            throw error;
        }
    }

  //xuất bản docx
  static async docxPhuLucBang(sinh_vien_id) {
    try {
      // Lấy thông tin số kỳ học và khóa đào tạo của sinh viên
      const { so_ky_hoc, khoa_dao_tao_id } = await this.getSoKyHocVaKhoa(sinh_vien_id);
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
                attributes: ['ma_khoa', 'ten_khoa', 'nam_hoc']
              }
            ]
          }
        ]
      });

      if (!sinhVien) {
        throw new Error("Không tìm thấy thông tin sinh viên");
      }

      // Format ngày tháng
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // Header
      const rowHead = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: '       BAN CƠ YẾU CHÍNH PHỦ', size: 24, font: 'Times New Roman' }),
                ],

              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: 'HỌC VIỆN KỸ THUẬT MẬT MÃ', bold: true, size: 24, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE } }),
                ],
              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 24, font: 'Times New Roman' }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.RIGHT,
                indent: { right: 720 },
                spacing: { after: 130 },
                children: [
                  new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 26, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE } }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                indent: { right: 720 },
                children: [
                  new TextRun({ text: `Hà Nội, ngày ${day} tháng ${month} năm ${year}`, italics: true, size: 26, font: 'Times New Roman' }),
                ],
              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
        ],
      });

      //Thông tin chung
      const rowTitle = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { line: 300 },
                children: [
                  new TextRun({ text: 'Họ và tên: ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ho_dem} ${sinhVien.ten}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Nơi sinh: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.quan_huyen && sinhVien.tinh_thanh ? `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : (sinhVien.que_quan || '')}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Mã học viên: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.ma_sinh_vien || ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Ngành đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Trình độ đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `Đại học`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Ngày nhập học: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.ngay_vao_truong ? new Date(sinhVien.ngay_vao_truong).toLocaleDateString('vi-VN') : ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Ngôn ngữ đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `Tiếng Việt`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Số hiệu văn bằng: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),

                ],
                alignment: AlignmentType.LEFT,

              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { line: 300 },
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: 'Ngày sinh: ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Giới tính: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ"}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Khoá đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.ma_lop || ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Chuyên ngành: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Hình thức đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `Chính quy`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Thời gian đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Xếp hạng tốt nghiệp: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Số vào sổ cấp bằng: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),

                ],
              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
        ],
      });

      const { totalCredits, gpa } = await this.getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);
      
      // Lấy tất cả dữ liệu từ tất cả kỳ học
      let allData = [];
      for (let ky_hoc = 1; ky_hoc <= so_ky_hoc; ky_hoc++) {
          const dataDiem = await this.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);
          if (dataDiem && dataDiem.length > 0) {
              allData = allData.concat(dataDiem);
          }
      }

      // Chia dữ liệu thành 2 cột và cân bằng
      const midPoint = Math.ceil(allData.length / 2);
      const leftData = allData.slice(0, midPoint);
      const rightData = allData.slice(midPoint);
      
      //thông tin tổng
      const rowTotal = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { line: 300 },
                children: [
                  new TextRun({ text: 'Tổng số tín chỉ tích luỹ: ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${totalCredits}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Điểm TB tích luỹ toàn khoá (hệ 4): ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${gpa}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Điểm TB tích luỹ toàn khoá (hệ 10): ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${(gpa * 2.5).toFixed(2)}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Xếp loại tốt nghiệp: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),

                ],
                alignment: AlignmentType.LEFT,

              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { line: 300 },
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: 'Giáo dục thể chất: ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Giáo dục Quốc phòng và an ninh:', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Chuẩn đầu ra Tiếng anh: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: ``, size: 24, font: 'Times New Roman' }),

                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 },
                children: [
                  new TextRun({ text: `Hà Nội, ngày ${day} tháng ${month} năm ${year}`, size: 26, italics: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100 },
                children: [
                  new TextRun({ text: 'KT. GIÁM ĐỐC', size: 26, bold: true, break: 1 }),
                  new TextRun({ text: 'PHÓ GIÁM ĐỐC', size: 26, bold: true, break: 1 }),
                ],
              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
        ],
      });
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            }
          },
          children: [
            new Table({
              rows: [rowHead],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { size: 0, color: "FFFFFF" },
                bottom: { size: 0, color: "FFFFFF" },
                left: { size: 0, color: "FFFFFF" },
                right: { size: 0, color: "FFFFFF" },
                insideHorizontal: { size: 0, color: "FFFFFF" },
                insideVertical: { size: 0, color: "FFFFFF" },
              },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({ text: 'PHỤ LỤC VĂN BẰNG', bold: true, size: 28, font: 'Times New Roman', break: 1 }),
              ],
            }),

            // PHẦN 1 LỚN
            new Paragraph({
              spacing: { after: 50 },
              children: [new TextRun({ text: 'I. Thông tin chung', bold: true, size: 24, font: 'Times New Roman', break: 1 })],

            }),
            new Table({
              rows: [rowTitle],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { size: 0, color: "FFFFFF" },
                bottom: { size: 0, color: "FFFFFF" },
                left: { size: 0, color: "FFFFFF" },
                right: { size: 0, color: "FFFFFF" },
                insideHorizontal: { size: 0, color: "FFFFFF" },
                insideVertical: { size: 0, color: "FFFFFF" },
              },
            }),

            // PHẦN 2 LỚN
            new Paragraph({
              spacing: { before: 30, after: 50 },
              children: [new TextRun({ text: 'II. Kết quả đào tạo', bold: true, size: 24, font: 'Times New Roman' })],
            }),

            // Bảng kết quả
            new Table({
              borders: {
                top: { size: 0, color: "FFFFFF" },
                bottom: { size: 0, color: "FFFFFF" },
                left: { size: 0, color: "FFFFFF" },
                right: { size: 0, color: "FFFFFF" },
                insideHorizontal: { size: 0, color: "FFFFFF" },
                insideVertical: { size: 0, color: "FFFFFF" },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 8000, type: WidthType.DXA },
                      children: [this.generateSubTable(leftData, 0)], // bảng trái

                    }),
                    new TableCell({
                      width: { size: 500, type: WidthType.DXA },
                      children: [new Paragraph({})],
                    }),

                    new TableCell({
                      width: { size: 8000, type: WidthType.DXA },
                      children: [this.generateSubTable(rightData, leftData.length)], // bảng phải
                    })
                  ],
                }),
              ],

            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({ text: '', break: 1 })],

            }),
            //footer
            new Table({
              rows: [rowTotal],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { size: 0, color: "FFFFFF" },
                bottom: { size: 0, color: "FFFFFF" },
                left: { size: 0, color: "FFFFFF" },
                right: { size: 0, color: "FFFFFF" },
                insideHorizontal: { size: 0, color: "FFFFFF" },
                insideVertical: { size: 0, color: "FFFFFF" },
              },
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      console.log('Buffer generated successfully, length:', buffer.length);
      return buffer;
    } catch (error) {
      console.error('Error generating buffer:', error);
      throw error;
    }
  }

  static generateSubTable(data, startIndex = 0) {
    // Hàm tạo header row
    const createHeaderRows = () => {
      return [
        // Header row 1
        new TableRow({
          height: { value: 300, rule: "exact" },
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'TT', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 100, bottom: 100, left: 50, right: 50 },
              rowSpan: 2,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Học phần', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 50000, type: WidthType.DXA },
              rowSpan: 2,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Số TC', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              rowSpan: 2,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Điểm số', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              columnSpan: 2,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Điểm chữ', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              rowSpan: 2,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
          ],
        }),
        // Header row 2
        new TableRow({
          height: { value: 550, rule: "exact" },
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Hệ 10', size: 20, font: 'Times New Roman', bold: true, })],
                alignment: AlignmentType.CENTER,
                verticalAlign: VerticalAlign.CENTER,
              })],
              margins: { top: 100, bottom: 100, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Hệ 4', size: 20, font: 'Times New Roman', bold: true, })],
                alignment: AlignmentType.CENTER,
                verticalAlign: VerticalAlign.CENTER,
              })],
              margins: { top: 100, bottom: 100, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
          ],
        })
      ];
    };

    // Tạo header ban đầu
    const rows = createHeaderRows();

    // Add data rows với chiều cao cố định và header mới sau mỗi 25 dòng
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        // Thêm header mới sau mỗi 25 dòng (ngoại trừ dòng đầu tiên)
        if (index > 0 && (index % 25 === 0)) {
          const newHeaderRows = createHeaderRows();
          rows.push(...newHeaderRows);
        }

        rows.push(new TableRow({
          height: { value: 300, rule: "exact" }, // Chiều cao cố định cho data rows
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: (startIndex + index + 1).toString(), size: 18, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: item.ten_mon_hoc || '', size: 18, font: 'Times New Roman' })],
                alignment: AlignmentType.LEFT
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: item.so_tin_chi?.toString() || '', size: 18, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: item.diem_he_10 !== null ? item.diem_he_10.toString() : '', size: 18, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: item.diem_he_4 !== null ? item.diem_he_4.toString() : '', size: 18, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: item.diem_chu || '', size: 18, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              },
            }),
          ],
        }));
      });
    }

    return new Table({
      rows: rows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
        insideVertical: { style: BorderStyle.SINGLE, size: 5, color: "000000" },
      },
    });
  }
}

module.exports = ExcelPhuLucBangService;