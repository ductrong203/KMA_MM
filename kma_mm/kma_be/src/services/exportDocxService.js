const { Document, Packer, Paragraph, Table, TableCell, BorderStyle, VerticalAlign, TableRow, TextRun, WidthType, AlignmentType, UnderlineType, PageBreak, HeightRule } = require("docx");
const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { sinh_vien, thoi_khoa_bieu, diem, lop, khoa_dao_tao, QuyDoiDiem } = models;
const KeHoachMonHocService = require('../services/keHoachMonHocService');
const ExcelPhuLucBangService = require('./excelPhuLucBangService');
const { text } = require("body-parser");

class ExportDocxService {
  // Tính điểm trung bình kỳ học
  static async getDiemTrungBinhKyHoc(sinh_vien_id, ky_hoc, khoa_dao_tao_id) {
    try {
      const dataDiem = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, ky_hoc, khoa_dao_tao_id);

      if (!dataDiem || dataDiem.length === 0) {
        return { gpa_he_4: 0, gpa_he_10: 0 };
      }

      let totalCredits = 0;
      let totalWeightedGradePoints_4 = 0;
      let totalWeightedGradePoints_10 = 0;

      for (const item of dataDiem) {
        if (item.diem_he_4 !== null && item.diem_he_10 !== null) {
          totalCredits += item.so_tin_chi;
          totalWeightedGradePoints_4 += item.diem_he_4 * item.so_tin_chi;
          totalWeightedGradePoints_10 += item.diem_he_10 * item.so_tin_chi;
        }
      }

      let gpa_he_4 = 0;
      let gpa_he_10 = 0;

      if (totalCredits > 0) {
        gpa_he_4 = Math.round((totalWeightedGradePoints_4 / totalCredits) * 100) / 100;
        gpa_he_10 = Math.round((totalWeightedGradePoints_10 / totalCredits) * 100) / 100;
      }

      return { gpa_he_4, gpa_he_10 };
    } catch (error) {
      console.error("Lỗi khi tính điểm trung bình kỳ học:", error);
      return { gpa_he_4: 0, gpa_he_10: 0 };
    }
  }

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

      // Lấy thông tin hệ đào tạo từ khóa
      const khoaInfo = await khoa_dao_tao.findByPk(khoa_dao_tao_id, { attributes: ['he_dao_tao_id'] });
      const he_dao_tao_id = khoaInfo?.he_dao_tao_id;

      // Lấy rules quy đổi
      const conversionRules = he_dao_tao_id ? await QuyDoiDiem.findAll({
        where: { he_dao_tao_id },
        order: [['diem_min', 'DESC']]
      }) : [];

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
          // Logic quy đổi động
          if (conversionRules.length > 0) {
            const match = conversionRules.find(r => diemTongKet >= r.diemMin);
            if (match) {
              diem_he_4 = match.diemHe4;
              diem_chu = match.diemChu;
            } else {
              diem_he_4 = 0;
              diem_chu = 'F';
            }
          } else {
            // Fallback nếu không tìm thấy rules (giữ lại logic cũ hoặc trả về null/mặc định)
            // Để an toàn, có thể giữ logic cũ làm fallback hoặc throw error.
            // Ở đây ta mặc định về 0/F nếu không có rules để thúc đẩy việc cấu hình.
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

      // Chuyển đổi nam_hoc thành string để đảm bảo có thể sử dụng split()
      const namHocTruyenVaoStr = String(nam_hoc);

      // Kiểm tra định dạng nam_hoc
      if (!namHocTruyenVaoStr.includes('-')) {
        throw new Error(`Định dạng năm học ${namHocTruyenVaoStr} không hợp lệ. Vui lòng sử dụng định dạng YYYY-YYYY`);
      }

      // Tách năm bắt đầu từ nam_hoc
      const namBatDauTruyenVao = parseInt(namHocTruyenVaoStr.split('-')[0]); // VD: 2024

      // Lấy thông tin sinh viên để tính toán kỳ học
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
                attributes: ['ma_khoa', 'ten_khoa', 'nam_hoc', 'id', 'so_ky_hoc']
              }
            ]
          }
        ]
      });

      if (!sinhVien) {
        throw new Error("Không tìm thấy thông tin sinh viên");
      }

      // Lấy thông tin năm học gốc của khóa đào tạo
      const namHocGoc = sinhVien.lop?.khoa_dao_tao?.nam_hoc || ''; // VD: "2024-2027"
      const soKyHocTong = sinhVien.lop?.khoa_dao_tao?.so_ky_hoc || 6; // Tổng số kỳ học

      // Kiểm tra định dạng namHocGoc
      if (!namHocGoc) {
        throw new Error("Không tìm thấy thông tin năm học gốc của khóa đào tạo");
      }

      // Tách năm từ namHocGoc để tính khoảng hợp lệ
      const [namBatDauGoc, namKetThucGoc] = namHocGoc.split('-').map(Number);
      if (!namBatDauGoc || !namKetThucGoc) {
        throw new Error("Định dạng năm học gốc không hợp lệ");
      }

      // Kiểm tra nam_hoc có nằm trong khoảng hợp lệ không
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

      // Lấy dữ liệu điểm cho từng kỳ học cụ thể
      const dataDiemKy1 = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, kyHoc1, khoa_dao_tao_id);
      const dataDiemKy2 = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, kyHoc2, khoa_dao_tao_id);

      // Tính điểm trung bình năm học từ cả hai kỳ học cụ thể
      // Tính GPA cho kỳ 1
      let totalCreditsKy1 = 0;
      let totalWeightedGradePointsKy1 = 0;
      for (const item of dataDiemKy1) {
        if (item.diem_he_4 !== null && item.diem_he_4 !== undefined &&
          item.so_tin_chi !== null && item.so_tin_chi !== undefined) {
          const credits = Number(item.so_tin_chi);
          const gradePoints = Number(item.diem_he_4);
          if (!isNaN(credits) && !isNaN(gradePoints) && gradePoints >= 1.0) {
            totalCreditsKy1 += credits;
            totalWeightedGradePointsKy1 += (gradePoints * credits);
          }
        }
      }
      const gpaKy1 = totalCreditsKy1 > 0 ? (totalWeightedGradePointsKy1 / totalCreditsKy1) : 0;

      // Tính GPA cho kỳ 2
      let totalCreditsKy2 = 0;
      let totalWeightedGradePointsKy2 = 0;
      for (const item of dataDiemKy2) {
        if (item.diem_he_4 !== null && item.diem_he_4 !== undefined &&
          item.so_tin_chi !== null && item.so_tin_chi !== undefined) {
          const credits = Number(item.so_tin_chi);
          const gradePoints = Number(item.diem_he_4);
          if (!isNaN(credits) && !isNaN(gradePoints) && gradePoints >= 1.0) {
            totalCreditsKy2 += credits;
            totalWeightedGradePointsKy2 += (gradePoints * credits);
          }
        }
      }
      const gpaKy2 = totalCreditsKy2 > 0 ? (totalWeightedGradePointsKy2 / totalCreditsKy2) : 0;

      // Tính điểm trung bình năm học (trung bình có trọng số theo tín chỉ)
      const totalCreditsNamHoc = totalCreditsKy1 + totalCreditsKy2;
      const totalWeightedGradePointsNamHoc = totalWeightedGradePointsKy1 + totalWeightedGradePointsKy2;
      const gpaNamHoc_he4 = totalCreditsNamHoc > 0 ? (totalWeightedGradePointsNamHoc / totalCreditsNamHoc) : 0;

      // Làm tròn 2 chữ số thập phân
      const gpaNamHoc = Math.round(gpaNamHoc_he4 * 100) / 100;

      // Xếp loại học lực dựa trên GPA hệ 4
      let xepLoaiHocLuc = '';
      if (gpaNamHoc >= 3.5) {
        xepLoaiHocLuc = 'Xuất sắc';
      } else if (gpaNamHoc >= 3.0) {
        xepLoaiHocLuc = 'Giỏi';
      } else if (gpaNamHoc >= 2.5) {
        xepLoaiHocLuc = 'Khá';
      } else if (gpaNamHoc >= 2.0) {
        xepLoaiHocLuc = 'Trung bình';
      } else if (gpaNamHoc >= 1.0) {
        xepLoaiHocLuc = 'Yếu';
      } else {
        xepLoaiHocLuc = 'Kém';
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
                children: [
                  new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 26, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE } }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.RIGHT,
                indent: { right: 720 },
                children: [
                  new TextRun({ text: 'Hà Nội, ngày ', italics: true, size: 26, font: 'Times New Roman', break: 1 }),
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
                  new TextRun({ text: 'Họ và tên: ', size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ho_dem} ${sinhVien.ten}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Nơi sinh: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.quan_huyen && sinhVien.tinh_thanh ? `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : ''}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Khoá đào tạo: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.ma_sinh_vien}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Trình độ đào tạo: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 28, font: 'Times New Roman' }),

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
                  new TextRun({ text: 'Ngày sinh: ', size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : ''}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Mã học viên: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ"}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Ngành/chuyên ngành: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Hình thức đào tạo: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `Chính quy`, size: 28, font: 'Times New Roman' }),

                ],
              }),
            ],
            borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } },
          }),
        ],
      });

      //thông tin tổng
      const rowTotal = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { line: 300 },
                children: [
                  new TextRun({ text: 'Điểm TB năm học (hệ 4): ', size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: `${gpaNamHoc}`, size: 24, font: 'Times New Roman' }),
                  new TextRun({ text: 'Tổng số tín chỉ năm học: ', size: 24, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${totalCreditsNamHoc}`, size: 24, font: 'Times New Roman' }),

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
                  new TextRun({ text: `${xepLoaiHocLuc}`, size: 24, font: 'Times New Roman' }),

                ],
              }),
              new Paragraph({
                spacing: { after: 50 },
                children: [
                  new TextRun({ text: `Hà Nội, ngày ${day.toString().padStart(2, '0')} tháng ${month.toString().padStart(2, '0')} năm ${year}`, size: 26, italics: true, break: 1 }),
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
                new TextRun({ text: `Năm học ${namHocTruyenVaoStr}`, bold: true, size: 28, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE }, break: 1 }),
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
              children: [new TextRun({ text: 'I.  Kết quả đào tạo', bold: true, size: 24, font: 'Times New Roman' })],

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
                          spacing: { after: 50 },
                          children: [new TextRun({ text: 'a) Học kỳ 1', size: 26, italics: true })],
                        }),
                        this.generateSubTable(dataDiemKy1, 0, dataDiemKy1.length)
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
                          spacing: { after: 50 },
                          children: [new TextRun({ text: 'b) Học kỳ 2', size: 26, italics: true })],
                        }),
                        this.generateSubTable(dataDiemKy2, 0, dataDiemKy2.length)
                      ], // bảng phải
                    })
                  ],
                }),
              ],

            }),
            // 
            new Paragraph({
              children: [new TextRun({ text: 'II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm', bold: true, size: 24, font: 'Times New Roman' })],

            }), new Table({
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
                          spacing: { after: 50 },
                          children: [new TextRun({ text: 'a) Học kỳ 1', size: 26, italics: true })],
                        }),
                        this.generateSubTable([], 0, 3)
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
                          spacing: { after: 50 },
                          children: [new TextRun({ text: 'b) Học kỳ 2', size: 26, italics: true })],
                        }),
                        this.generateSubTable([], 3, 6)
                      ], // bảng phải
                    })
                  ],
                }),
              ],

            }),
            new Paragraph({
              // spacing: { after: 100 },
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



  //xuất bản docx
  static async exportDocxKQHocKy(sinh_vien_id, hoc_ky) {
    try {
      // Lấy thông tin số kỳ học và khóa đào tạo của sinh viên
      const { so_ky_hoc, khoa_dao_tao_id } = await this.getSoKyHocVaKhoa(sinh_vien_id);

      // Lấy dữ liệu điểm cho kỳ học sử dụng hàm từ ExcelPhuLucBangService
      const dataDiem = await ExcelPhuLucBangService.getDataPhuLucBang(sinh_vien_id, hoc_ky, khoa_dao_tao_id);

      // Tính điểm trung bình kỳ học
      const { gpa_he_4, gpa_he_10 } = await this.getDiemTrungBinhKyHoc(sinh_vien_id, hoc_ky, khoa_dao_tao_id);

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
                children: [
                  new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 26, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE } }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.RIGHT,
                indent: { right: 720 },
                children: [
                  new TextRun({ text: 'Hà Nội, ngày ', italics: true, size: 26, font: 'Times New Roman', break: 1 }),
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
                  new TextRun({ text: 'Họ và tên: ', size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ho_dem} ${sinhVien.ten}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Nơi sinh: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.quan_huyen && sinhVien.tinh_thanh ? `${sinhVien.quan_huyen} - ${sinhVien.tinh_thanh}` : ''}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Khoá đào tạo: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.ma_sinh_vien}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Trình độ đào tạo: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 28, font: 'Times New Roman' }),

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
                  new TextRun({ text: 'Ngày sinh: ', size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: `${sinhVien.ngay_sinh ? new Date(sinhVien.ngay_sinh).toLocaleDateString('vi-VN') : ''}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Mã học viên: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.gioi_tinh === 1 ? "Nam" : "Nữ"}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Ngành/chuyên ngành: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${sinhVien.lop?.khoa_dao_tao?.ten_khoa || ''}`, size: 28, font: 'Times New Roman' }),
                  new TextRun({ text: 'Hình thức đào tạo: ', size: 28, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `Chính quy`, size: 28, font: 'Times New Roman' }),

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
                  new TextRun({ text: 'Điểm TB học kỳ (hệ 4): ', size: 26, font: 'Times New Roman' }),
                  new TextRun({ text: `${gpa_he_4}`, size: 26, font: 'Times New Roman' }),
                  new TextRun({ text: 'Điểm TB học kỳ (hệ 10): ', size: 26, font: 'Times New Roman', break: 1 }),
                  new TextRun({ text: `${gpa_he_10}`, size: 26, font: 'Times New Roman' }),

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
                  new TextRun({ text: 'Xếp loại học lực: ', size: 26, font: 'Times New Roman' }),
                  new TextRun({ text: `${xepLoaiHocLuc}`, size: 26, font: 'Times New Roman' }),

                ],
              }),
              new Paragraph({
                spacing: { after: 50 },
                children: [
                  new TextRun({ text: `Hà Nội, ngày ${day.toString().padStart(2, '0')} tháng ${month.toString().padStart(2, '0')} năm ${year}`, size: 26, italics: true, break: 1 }),
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
                new TextRun({ text: `Học kỳ ${hoc_ky} Năm học ${sinhVien.lop?.khoa_dao_tao?.nam_hoc || ''}`, bold: true, size: 28, font: 'Times New Roman', underline: { type: UnderlineType.SINGLE }, break: 1 }),
              ],
            }),

            // PHẦN 1 LỚN
            new Paragraph({
              spacing: { after: 50 },
              children: [new TextRun({ text: '', bold: true, size: 28, font: 'Times New Roman', break: 1 })],

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
              children: [new TextRun({ text: '', break: 1 })],

            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({ text: 'I.  Kết quả đào tạo', bold: true, size: 24, font: 'Times New Roman', })],

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
                  children: [new TableCell({
                    width: { size: 8000, type: WidthType.DXA },
                    children: [
                      this.generateSubTable(dataDiem, 0, Math.ceil(dataDiem.length / 2))
                    ], // bảng trái

                  }),
                  new TableCell({
                    width: { size: 500, type: WidthType.DXA },
                    children: [new Paragraph({})],
                  }),

                  new TableCell({
                    width: { size: 8000, type: WidthType.DXA },
                    children: [

                      this.generateSubTable(dataDiem, Math.ceil(dataDiem.length / 2), dataDiem.length)
                    ], // bảng phải
                  })
                  ],
                }),
              ],

            }),
            // 
            new Paragraph({
              // spacing: { after: 100 },
              children: [new TextRun({ text: '', break: 1 })],

            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({ text: 'II. Các học phần được miễn học, công nhận tín chỉ hoặc chuyển đổi điểm', bold: true, size: 24, font: 'Times New Roman' })],

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
                      width: { size: 8000, type: WidthType.DXA }, children: [

                        this.generateSubTable([], 0, 3)
                      ], // bảng trái

                    }),
                    new TableCell({
                      width: { size: 500, type: WidthType.DXA },
                      children: [new Paragraph({})],
                    }),

                    new TableCell({
                      width: { size: 8000, type: WidthType.DXA },
                      children: [

                        this.generateSubTable([], 3, 6)
                      ], // bảng phải
                    })
                  ],
                }),
              ],

            }),
            new Paragraph({
              // spacing: { after: 100 },
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

  static generateSubTable(data, start, end) {
    console.log('generateSubTable called with:', { dataLength: data.length, start, end });
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
              width: { size: 3000, type: WidthType.DXA },
              rowSpan: 2,
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Số TC', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 500, type: WidthType.DXA },
              rowSpan: 2
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Điểm số', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 1000, type: WidthType.DXA },
              columnSpan: 2,
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Điểm chữ', size: 20, font: 'Times New Roman', bold: true })],
                alignment: AlignmentType.CENTER
              })],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 700, type: WidthType.DXA },
              rowSpan: 2,

            }),

          ],
          height: { value: 300, rule: HeightRule.ATLEAST }, // Tăng chiều cao hàng tiêu đề

        }),

        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Hệ 10', size: 20, font: 'Times New Roman', bold: true, })],
                alignment: AlignmentType.CENTER,
                verticalAlign: VerticalAlign.CENTER,

              })],
              width: { size: 500, type: WidthType.DXA },
              margins: { top: 50, bottom: 0, left: 50, right: 50 },
              verticalAlign: VerticalAlign.CENTER,

            }),

            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Hệ 4', size: 20, font: 'Times New Roman', bold: true, })],
                alignment: AlignmentType.CENTER,
                verticalAlign: VerticalAlign.CENTER,

              })],
              width: { size: 500, type: WidthType.DXA },
              margins: { top: 50, bottom: 0, left: 50, right: 50 },
              verticalAlign: VerticalAlign.CENTER,

            }),
          ],
          tableHeader: true,
          //height: { value: 400, rule: HeightRule.ATLEAST }, // Tăng chiều cao hàng con tiêu đề

        }),
        ...Array.from({ length: end - start }, (_, index) => {
          let i = start + index;
          const item = data[i];

          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: item ? `${i + 1}` : '', size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: item ? item.ten_mon_hoc : '', size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.LEFT,
                })],
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                width: { size: 3000, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: item ? `${item.so_tin_chi}` : '', size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })],
                width: { size: 500, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: item && item.diem_he_10 !== null ? `${item.diem_he_10}` : '', size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })],
                width: { size: 500, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: item && item.diem_he_4 !== null ? `${item.diem_he_4}` : '', size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })],
                width: { size: 500, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: item ? item.diem_chu || '' : '', size: 20, font: 'Times New Roman' })],
                  alignment: AlignmentType.CENTER,
                })],
                width: { size: 700, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
              }),

            ],
            height: { value: 300, rule: HeightRule.ATLEAST }, // Tăng chiều cao hàng giá trị

          })
        })
      ],

    })
  }
}

module.exports = ExportDocxService