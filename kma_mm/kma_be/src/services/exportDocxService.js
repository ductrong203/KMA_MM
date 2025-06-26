const { Document, Packer, Paragraph, Table, TableCell, BorderStyle, VerticalAlign, TableRow, TextRun, WidthType, AlignmentType, UnderlineType, PageBreak } = require("docx");
const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { sinh_vien, thoi_khoa_bieu, diem, lop, khoa_dao_tao } = models;
const KeHoachMonHocService = require('../services/keHoachMonHocService');
const { text } = require("body-parser");

class ExportDocxService {
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

  //xuất bản docx
  static async exportDocxKQNamHoc(sinh_vien_id, nam_hoc) {
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
                children: [
                  new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 26, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE } }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.RIGHT,
                indent: { right: 720 },
                children: [
                  new TextRun({ text: 'Hà Nội, ngày', italics: true, size: 26, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `07 tháng 06 năm 2025`, italics: true, size: 26, font: 'Times New Roman', }),
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
                  new TextRun({ text: `${sinhVien.quan_huyen && sinhVien.tinh_thanh ? `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Khoá đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.ma_sinh_vien}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Trình độ đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 24, font: 'Times New Roman' }),
                
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
                  new TextRun({ text: 'Mã học viên: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ"}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Ngành/chuyên ngành: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Hình thức đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `Chính quy`, size: 24, font: 'Times New Roman' }),

                ],
              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
        ],
      });

      const { totalCredits, gpa } = await this.getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);
      
      //thông tin tổng
      const rowTotal = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { line: 300 },
                children: [
                  new TextRun({ text: 'Điểm TB năm học (hệ 4): ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${totalCredits}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Điểm TB năm học (hệ 10): ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${gpa}`, size: 24, font: 'Times New Roman' }),

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
                  new TextRun({ text: 'Xếp loại học lực: ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : ''}`, size: 24, font: 'Times New Roman' }),

                ],
              }),
              new Paragraph({
                spacing: { after: 50 },
                children: [
                  new TextRun({ text: 'Hà Nội, ngày      tháng   năm 202', size: 26, italics: true, break: 1 }),
                ],
                alignment: AlignmentType.RIGHT,

              }),
              new Paragraph({
                indent: { right: 720 },
                children: [
                  new TextRun({ text: 'KT. GIÁM ĐỐC', size: 26, bold: true, break: 1 }),
                  new TextRun({ text: 'PHÓ GIÁM ĐỐC', size: 26, bold: true, break: 1 }),

                ],
                alignment: AlignmentType.RIGHT,

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
                new TextRun({ text: 'KẾT QUẢ HỌC TẬP', bold: true, size: 28, font: 'Times New Roman', break: 1 }),
                new TextRun({ text: 'Năm học 2022-2027', bold: true, size: 28, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE }, break: 1 }),
              ],
            }),

            // PHẦN 1 LỚN
            new Paragraph({
              spacing: { after: 50 },
              children: [new TextRun({ text: '', bold: true, size: 24, font: 'Times New Roman', break: 1 })],

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
              children: [new TextRun({ text: 'I.  Kết quả đào tạo', bold: true, size: 24, font: 'Times New Roman'})],

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
                      children: [
                        new Paragraph({
                            spacing: {after: 50},
                            children: [new TextRun({ text: 'a) Học kỳ 1', size: 26, italics:true  })],
                          }),
                        this.generateSubTable(0, 5)
                    ], // bảng trái

                    }),
                    new TableCell({
                      width: { size: 500, type: WidthType.DXA },
                      children: [new Paragraph({})],
                    }),

                    new TableCell({
                      width: { size: 8000, type: WidthType.DXA },
                      children: [
                        new Paragraph({
                            spacing: {after: 50},
                            children: [new TextRun({ text: 'b) Học kỳ 2', size: 26, italics:true  })],
                          }),
                        this.generateSubTable(5, 10)
                    ], // bảng phải
                    })
                  ],
                }),
              ],

            }),
            // 
            new Paragraph({
                children: [new TextRun({ text: 'II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm', bold: true, size: 24, font: 'Times New Roman'})],
  
              }),
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
                        children: [
                          new Paragraph({
                              spacing: {after: 50},
                              children: [new TextRun({ text: 'a) Học kỳ 1', size: 26, italics:true  })],
                            }),
                          this.generateSubTable(0, 3)
                      ], // bảng trái
  
                      }),
                      new TableCell({
                        width: { size: 500, type: WidthType.DXA },
                        children: [new Paragraph({})],
                      }),
  
                      new TableCell({
                        width: { size: 8000, type: WidthType.DXA },
                        children: [
                          new Paragraph({
                              spacing: {after: 50},
                              children: [new TextRun({ text: 'b) Học kỳ 2', size: 26, italics:true  })],
                            }),
                          this.generateSubTable(0, 3)
                      ], // bảng phải
                      })
                    ],
                  }),
                ],
  
              }),
              new Paragraph({
                // spacing: { after: 100 },
                children: [new TextRun({ text: '',break:1 })],
  
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



  //xuất bản docx
  static async exportDocxKQHocKy(sinh_vien_id, hoc_ky) {
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
                children: [
                  new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 26, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE } }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.RIGHT,
                indent: { right: 720 },
                children: [
                  new TextRun({ text: 'Hà Nội, ngày', italics: true, size: 26, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `07 tháng 06 năm 2025`, italics: true, size: 26, font: 'Times New Roman', }),
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
                  new TextRun({ text: `${sinhVien.quan_huyen && sinhVien.tinh_thanh ? `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Khoá đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.ma_sinh_vien}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Trình độ đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 24, font: 'Times New Roman' }),
                
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
                  new TextRun({ text: 'Mã học viên: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ"}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Ngành/chuyên ngành: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Hình thức đào tạo: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `Chính quy`, size: 24, font: 'Times New Roman' }),

                ],
              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
        ],
      });

      const { totalCredits, gpa } = await this.getTotalCreditsAndGPA(sinh_vien_id, so_ky_hoc, khoa_dao_tao_id);
      
      //thông tin tổng
      const rowTotal = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { line: 300 },
                children: [
                  new TextRun({ text: 'Điểm TB năm học (hệ 4): ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${totalCredits}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Điểm TB năm học (hệ 10): ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${gpa}`, size: 24, font: 'Times New Roman' }),

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
                  new TextRun({ text: 'Xếp loại học lực: ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : ''}`, size: 24, font: 'Times New Roman' }),

                ],
              }),
              new Paragraph({
                spacing: { after: 50 },
                children: [
                  new TextRun({ text: 'Hà Nội, ngày      tháng   năm 202', size: 26, italics: true, break: 1 }),
                ],
                alignment: AlignmentType.RIGHT,

              }),
              new Paragraph({
                indent: { right: 720 },
                children: [
                  new TextRun({ text: 'KT. GIÁM ĐỐC', size: 26, bold: true, break: 1 }),
                  new TextRun({ text: 'PHÓ GIÁM ĐỐC', size: 26, bold: true, break: 1 }),

                ],
                alignment: AlignmentType.RIGHT,

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
                new TextRun({ text: 'KẾT QUẢ HỌC TẬP', bold: true, size: 28, font: 'Times New Roman', break: 1 }),
                new TextRun({ text: 'Học kỳ … Năm học 2022-2027', bold: true, size: 28, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE }, break: 1 }),
              ],
            }),

            // PHẦN 1 LỚN
            new Paragraph({
              spacing: { after: 50 },
              children: [new TextRun({ text: '', bold: true, size: 24, font: 'Times New Roman', break: 1 })],

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
                // spacing: { after: 100 },
                children: [new TextRun({ text: '',break:1 })],
                
              }),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({ text: 'I.  Kết quả đào tạo', bold: true, size: 24, font: 'Times New Roman',})],

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
                      children: [
                        this.generateSubTable(0, 5)
                    ], // bảng trái

                    }),
                    new TableCell({
                      width: { size: 500, type: WidthType.DXA },
                      children: [new Paragraph({})],
                    }),

                    new TableCell({
                      width: { size: 8000, type: WidthType.DXA },
                      children: [
                      
                        this.generateSubTable(5, 10)
                    ], // bảng phải
                    })
                  ],
                }),
              ],

            }),
            // 
            new Paragraph({
                // spacing: { after: 100 },
                children: [new TextRun({ text: '',break:1 })],
                
              }),
            new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: 'II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm', bold: true, size: 24, font: 'Times New Roman'})],
  
              }),
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
                        children: [
            
                          this.generateSubTable(0, 3)
                      ], // bảng trái
  
                      }),
                      new TableCell({
                        width: { size: 500, type: WidthType.DXA },
                        children: [new Paragraph({})],
                      }),
  
                      new TableCell({
                        width: { size: 8000, type: WidthType.DXA },
                        children: [
                      
                          this.generateSubTable(3, 6)
                      ], // bảng phải
                      })
                    ],
                  }),
                ],
  
              }),
              new Paragraph({
                // spacing: { after: 100 },
                children: [new TextRun({ text: '',break:1 })],
                
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

  static  generateSubTable(start, end) {
    console.log(start)
    // const { so_ky_hoc, khoa_dao_tao_id } = await this.getSoKyHocVaKhoa(sinh_vien_id);

    // for (let ky_hoc = 1; ky_hoc <= so_ky_hoc; ky_hoc++) {
    //   // Lấy dữ liệu điểm cho kỳ học hiện tại
    //   const dataDiem = await this.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);
    //   // Nếu kỳ học không có dữ liệu, bỏ qua
    //   if (!dataDiem || dataDiem.length === 0) {
    //     continue;
    //   }
      

    // }

    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'TT', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 100, bottom: 0, left: 50, right: 50 },
              rowSpan: 2,
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Học phần', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 50000, type: WidthType.DXA },
              rowSpan: 2,
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Số TC', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              rowSpan: 2
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Điểm số', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,

              columnSpan: 2,
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Điểm chữ', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              rowSpan: 2,

            }),

          ],

        }),

        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Hệ 10', size: 20, font: 'Times New Roman', bold: true, })],
                alignment: AlignmentType.CENTER,
                verticalAlign: VerticalAlign.CENTER,

              })],
              margins: { top: 50, bottom: 0, left: 50, right: 50 }, // Tăng padding ô

            }),

            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Hệ 4', size: 20, font: 'Times New Roman', bold: true, })],
                alignment: AlignmentType.CENTER,
                verticalAlign: VerticalAlign.CENTER,

              })],
              margins: { top: 50, bottom: 0, left: 50, right: 50 }, // Tăng padding ô

            }),
          ],
          tableHeader: true

        }),
        ...Array.from({ length: end - start }, (_, index) => {
          let i = start + index;

          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: `${i + 1}`, size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })],
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: "", size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })],
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                width: { size: 9000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: `2`, size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: (7.0 + i * 0.1).toFixed(1), size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: (3.0 + i * 0.1).toFixed(1), size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })]
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: i % 2 === 0 ? 'A+' : 'A', size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })]
              }),

            ],

          })
        })
      ],

    })
  }
}

module.exports = ExportDocxService