const ExcelJS = require("exceljs");
const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { sinh_vien, thoi_khoa_bieu, diem, lop, khoa_dao_tao } = models;
const KeHoachMonHocService = require('../services/keHoachMonHocService');

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
            
            // Lọc ra các môn học có tinh_diem = 1
            const danhSachMonHocTinhDiem = danhSachMonHoc.filter(monHoc => monHoc.tinh_diem === 1);
            
            // Mảng kết quả
            const ketQua = [];
            
            // Xử lý từng môn học
            for (const monHoc of danhSachMonHocTinhDiem) {
                // Lấy điểm tổng kết cho môn học này
                const diemTongKet = await this.getDiemTongKet(sinh_vien_id, monHoc.id);
                
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
    }    static async getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id) {
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
            worksheet.getCell("A4").font = { name: 'Times New Roman',bold: true, size: 16 };
            worksheet.getCell("A4").alignment = { horizontal: "center" };
            worksheet.getCell("A5").height = 5;
            // --- Phần thông tin văn bằng ---
            worksheet.mergeCells('A6','L6');
            worksheet.getCell("A6").value = "I. THÔNG TIN VỀ VĂN BẰNG";
            worksheet.getCell("A6").font = { name: 'Times New Roman',size: 14,bold: true };
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
            worksheet.mergeCells('A18','L18');
            worksheet.getCell("A18").value = "II. ĐIỂM TOÀN KHÓA HỌC";
            worksheet.getCell("A18").font = { name: 'Times New Roman',size: 14,bold: true };

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
                const headerRow1 = worksheet.addRow(['STT', 'Tên học phần','', '', '', '', 'Số tín chỉ', 'Điểm', '', '', 'Ghi chú', '']);
                const headerRow1Idx = worksheet.rowCount;
                
                // Dòng header 2
                const headerRow2 = worksheet.addRow(['', '', '', '', '', '','', 'Hệ 10', 'Hệ 4', 'Hệ chữ', '', '']);
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

}

module.exports = ExcelPhuLucBangService