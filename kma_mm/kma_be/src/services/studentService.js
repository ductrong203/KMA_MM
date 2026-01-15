const db = require("../models");
const { doi_tuong_quan_ly, sinh_vien, lop, thong_tin_quan_nhan, khoa_dao_tao, danh_muc_dao_tao, loai_chung_chi: LoaiChungChiModel, chung_chi, tot_nghiep } = db;
const { sequelize } = db;
const ExcelJS = require('exceljs');
const fs = require("fs");

class SinhVienService {
  static async createSinhVien(data) {
    try {
      const lopInfo = await lop.findByPk(data.lop_id);
      if (!lopInfo) {
        throw new Error("Lớp không tồn tại");
      }

      const count = await sinh_vien.count({ where: { lop_id: data.lop_id } });
      const maSinhVien = `${lopInfo.ma_lop}${String(count + 1).padStart(2, "0")}`;
      data.ma_sinh_vien = maSinhVien;
      const sinhVien = await sinh_vien.create(data);

      // Chuyển đối tượng thành JSON và xóa password
      const sinhVienData = sinhVien.toJSON();
      delete sinhVienData.password;

      return sinhVienData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllSinhViens() {
    return await sinh_vien.findAll({
      include: [
        {
          model: doi_tuong_quan_ly,
          as: "doi_tuong",
          attributes: ["ten_doi_tuong"],
        },
      ],
    });
  }

  static async getAllSinhVienPhanTrang(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const { rows, count } = await sinh_vien.findAndCountAll({
        offset,
        limit,
      });
      if (!rows || rows.length === 0) {
        return { message: "Không tìm thấy sinh viên", students: [], total: count };
      }

      return {
        students: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên");
    }
  }

  static async getStudentsByLopId(lopId) {
    try {
      return await sinh_vien.findAll({ where: { lop_id: lopId } });
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên theo lop_id");
    }
  }

  static async getStudentsByDoiTuongId(doiTuongId) {
    try {
      return await sinh_vien.findAll({ where: { doi_tuong_id: doiTuongId } });
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên theo doi_tuong_id");
    }
  }

  static async getSinhVienById(id) {
    return await sinh_vien.findByPk(id, {
      include: [
        {
          model: doi_tuong_quan_ly,
          as: "doi_tuong",
          attributes: ["ten_doi_tuong"],
        },
      ],
    });
  }

  static async getDanhSachSinhVienExcel({ khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id }) {
    try {
      // Kiểm tra tham số đầu vào
      if (!khoa_dao_tao_id && !lop_id && !doi_tuong_quan_ly_id) {
        throw new Error("Phải cung cấp ít nhất một tham số: khoa_dao_tao_id, lop_id, hoặc doi_tuong_quan_ly_id");
      }
      if (lop_id) {
        const lopCheck = await lop.findOne({
          where: {
            id: lop_id,
            ...(khoa_dao_tao_id && { khoa_dao_tao_id })
          }
        });
        if (!lopCheck) {
          throw new Error("Lớp không tồn tại hoặc không thuộc khóa đào tạo này");
        }
      }
      if (doi_tuong_quan_ly_id) {
        const doiTuongCheck = await doi_tuong_quan_ly.findByPk(doi_tuong_quan_ly_id);
        if (!doiTuongCheck) {
          throw new Error("Đối tượng quản lý không tồn tại");
        }
      }
      // Xây dựng điều kiện where
      const whereCondition = {};
      if (lop_id) {
        whereCondition.lop_id = lop_id;
      }
      if (doi_tuong_quan_ly_id) {
        whereCondition.doi_tuong_id = doi_tuong_quan_ly_id;
      }

      const sinhViens = await sinh_vien.findAll({
        include: [
          {
            model: doi_tuong_quan_ly,
            as: 'doi_tuong',
            required: false // Left Join
          },
          {
            model: thong_tin_quan_nhan,
            as: 'thong_tin_quan_nhans',
            required: false
          },
          {
            model: lop,
            as: 'lop',
            required: true,
            where: {
              ...(khoa_dao_tao_id && { khoa_dao_tao_id })
            },
            include: [
              {
                model: khoa_dao_tao,
                as: 'khoa_dao_tao',
              }
            ]
          },
          {
            model: tot_nghiep,
            as: 'tot_nghieps',
            required: false
          },
          {
            model: chung_chi,
            as: 'chungChis',
            required: false
          }
        ],
        where: whereCondition,
        order: [['ten', 'ASC']],
        distinct: true
      });

      if (!sinhViens || sinhViens.length === 0) {
        return { message: "Không tìm thấy sinh viên phù hợp", students: [] };
      }

      // Định dạng dữ liệu cho Excel theo Template mới
      const formattedData = sinhViens.map((sv, index) => {
        const formatDate = (dateVal) => dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : '';

        // Extract complex data
        const gradInfo = (sv.tot_nghieps && sv.tot_nghieps.length > 0) ? sv.tot_nghieps[0] : {};
        const chungChis = sv.chungChis || [];

        // Find Certificates by Type ID (Assuming: 7=GDQPAN, 6=TA, 3=TotNghiep/DaiHoc from logic discussion)
        // User request: "khác loai_chung_chi_id". I will assume ID 3 for Graduation Decision based on loai_chung_chi table image.
        const gdqpan = chungChis.find(c => c.loai_chung_chi_id === 7);
        const chuanTA = chungChis.find(c => c.loai_chung_chi_id === 6);
        const qdTn = chungChis.find(c => c.loai_chung_chi_id === 3); // Adjust ID if needed

        // Split Nam Hoc (2021-2025)
        let dao_tao_tu = '';
        let dao_tao_den = '';
        const namHoc = sv.lop?.khoa_dao_tao?.nam_hoc;
        if (namHoc) {
          const parts = namHoc.split('-');
          if (parts.length > 0) dao_tao_tu = parts[0];
          if (parts.length > 1) dao_tao_den = parts[1];
        }

        const donViGui = (sv.thong_tin_quan_nhans && sv.thong_tin_quan_nhans.length > 0)
          ? sv.thong_tin_quan_nhans[0].don_vi_cu_di_hoc
          : '';

        return {
          stt: index + 1,
          ma_sinh_vien: sv.ma_sinh_vien || '',
          ho_dem: sv.ho_dem || '',
          ten: sv.ten || '',
          lop: sv.lop?.ma_lop || '',
          ngay_sinh: formatDate(sv.ngay_sinh),
          noi_sinh: sv.que_quan || '',
          gioi_tinh: sv.gioi_tinh === 1 ? 'Nam' : sv.gioi_tinh === 0 ? 'Nữ' : '',
          dan_toc: sv.dan_toc || '',
          ton_giao: sv.ton_giao || '',
          quoc_tich: sv.quoc_tich || '',
          cccd: sv.CCCD || '',
          ngay_cap_cccd: formatDate(sv.ngay_cap_CCCD),
          noi_cap_cccd: sv.noi_cap_CCCD || '',
          so_dien_thoai: sv.so_dien_thoai || '',
          email: sv.email || '',
          dien_thoai_gia_dinh: sv.dien_thoai_gia_dinh || '',
          dien_thoai_cq: sv.dien_thoai_CQ || '',
          ngay_vao_doan: formatDate(sv.ngay_vao_doan),
          ngay_vao_dang: formatDate(sv.ngay_vao_dang),

          doi_tuong: sv.doi_tuong?.ma_doi_tuong || '', // Use CODE as requested
          don_vi_gui: donViGui,
          nam_tot_nghiep: formatDate(sv.nam_tot_nghiep_PTTH),

          // New/Mapped Fields
          ngay_nhap_hoc: formatDate(sv.ngay_vao_truong), // User request: Ngày nhập học=sv.ngay_vao_truong
          ma_chuong_trinh_dt: sv.lop?.khoa_dao_tao?.ten_khoa || '',
          dao_tao_tu: dao_tao_tu,
          dao_tao_den: dao_tao_den,

          tin_chi: sv.tong_tin_chi || 0,
          diem_tbtl_10: sv.diem_trung_binh_tich_luy || '',
          diem_tbtl_4: sv.diem_trung_binh_he_4 || '',

          // Graduation
          xep_loai_tn: gradInfo.xep_loai || '',
          so_hieu_bang: gradInfo.so_hieu_bang || '',
          ngay_cap_bang: formatDate(gradInfo.ngay_cap_bang),

          // Certificates Decisions
          so_qd_tn: qdTn?.so_quyet_dinh || '',
          ngay_qd_tn: formatDate(qdTn?.ngay_ky_quyet_dinh),

          qd_gdqpan: gdqpan?.so_quyet_dinh || '',
          ngay_qd_gdqpan: formatDate(gdqpan?.ngay_ky_quyet_dinh),

          qd_ta: chuanTA?.so_quyet_dinh || '',
          ngay_qd_ta: formatDate(chuanTA?.ngay_ky_quyet_dinh)
        }
      });

      return {
        message: "Lấy danh sách thành công",
        students: formattedData,
        total: sinhViens.length
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên cho Excel: " + error.message);
    }
  }

  static async exportSinhVienToExcel({ khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id }) {
    try {
      const { students } = await this.getDanhSachSinhVienExcel({ khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh sách sinh viên');

      // Định nghĩa tiêu đề cột - FULL 40+ CỘT
      // Các cột "kệ nó" sẽ để key là null hoặc empty để không map data
      worksheet.columns = [
        { header: 'TT', key: 'stt', width: 5 },
        { header: 'Mã sinh viên', key: 'ma_sinh_vien', width: 15 },
        { header: 'Họ tên đệm', key: 'ho_dem', width: 20 },
        { header: 'Tên', key: 'ten', width: 10 },
        { header: 'Lớp', key: 'lop', width: 10 },
        { header: 'Ngày sinh', key: 'ngay_sinh', width: 12 },
        { header: 'Nơi sinh', key: 'noi_sinh', width: 15 },
        { header: 'Giới tính', key: 'gioi_tinh', width: 8 },
        { header: 'Dân tộc', key: 'dan_toc', width: 10 },
        { header: 'Tôn giáo', key: 'ton_giao', width: 10 },
        { header: 'Quốc tịch', key: 'quoc_tich', width: 10 },
        { header: 'Số CCCD/Hộ chiếu', key: 'cccd', width: 15 },
        { header: 'Ngày cấp CCCD/Hộ chiếu', key: 'ngay_cap_cccd', width: 15 },
        { header: 'Nơi cấp CCCD/Hộ chiếu', key: 'noi_cap_cccd', width: 20 },
        { header: 'Số điện thoại', key: 'so_dien_thoai', width: 12 },
        { header: 'Email', key: 'email', width: 20 },
        { header: 'Điện thoại gia đình', key: 'dien_thoai_gia_dinh', width: 15 },
        { header: 'Điện thoại cơ quan', key: 'dien_thoai_cq', width: 15 },
        { header: 'Ngày vào đoàn', key: 'ngay_vao_doan', width: 12 },
        { header: 'Ngày vào Đảng', key: 'ngay_vao_dang', width: 12 },
        { header: 'Đối tượng', key: 'doi_tuong', width: 10 },
        { header: 'Đơn vị gửi đào tạo', key: 'don_vi_gui', width: 20 },
        { header: 'Năm tốt nghiệp THPT', key: 'nam_tot_nghiep', width: 12 },

        // Nhóm Tuyển Sinh & Đào Tạo
        { header: 'Tổ hợp xét tuyển', key: '', width: 10 },
        { header: 'Điểm trúng tuyển', key: '', width: 10 },
        { header: 'Ngày nhập học', key: 'ngay_nhap_hoc', width: 12 },
        { header: 'Quyết định trúng tuyển', key: '', width: 15 },
        { header: 'Ngày ban hành QĐ trúng tuyển', key: '', width: 15 },
        { header: 'Ngành/Chuyên ngành', key: '', width: 20 },
        { header: 'Loại hình đào tạo', key: '', width: 15 },
        { header: 'Mã chương trình ĐT', key: 'ma_chuong_trinh_dt', width: 20 },
        { header: 'Đào tạo từ năm', key: 'dao_tao_tu', width: 10 },
        { header: 'Đào tạo đến năm', key: 'dao_tao_den', width: 10 },
        { header: 'Số ngày QĐ thôi học; ngày phát hành', key: '', width: 20 }, // Giữ nguyên title
        { header: 'Số QĐ bảo lưu; ngày phát hành', key: '', width: 20 },
        { header: 'Cảnh báo học tập; ngày ký', key: '', width: 20 },

        // Nhóm Kết Quả & Tốt Nghiệp
        { header: 'Số tín chỉ tích lũy', key: 'tin_chi', width: 10 },
        { header: 'Điểm TBTL (hệ 10)', key: 'diem_tbtl_10', width: 10 },
        { header: 'Điểm TBTL (hệ 4)', key: 'diem_tbtl_4', width: 10 },
        { header: 'Xếp loại TN', key: 'xep_loai_tn', width: 10 },

        { header: 'Số QĐ tốt nghiệp', key: 'so_qd_tn', width: 15 },
        { header: 'Ngày ban hành QĐ tốt nghiệp', key: 'ngay_qd_tn', width: 15 },

        { header: 'QĐ đạt chuẩn GDQPAN', key: 'qd_gdqpan', width: 15 },
        { header: 'Ngày phát hành QĐ đạt chuẩn GDQPAN', key: 'ngay_qd_gdqpan', width: 15 },

        { header: 'Xếp loại GDTC', key: '', width: 10 },

        { header: 'QĐ công nhận đạt chuẩn TA', key: 'qd_ta', width: 15 },
        { header: 'Ngày phát hành QĐ/ký CCTA', key: 'ngay_qd_ta', width: 15 },

        { header: 'Ngày cấp bằng', key: 'ngay_cap_bang', width: 15 },
        { header: 'Số hiệu văn bằng', key: 'so_hieu_bang', width: 15 },

        { header: 'Số vào sổ cấp bằng', key: '', width: 20 }
      ];

      // Thêm dữ liệu
      students.forEach(student => {
        worksheet.addRow(student);
      });

      // --- Style cho Header (Định dạng hàng đầu tiên) ---
      const headerRow = worksheet.getRow(1);
      headerRow.font = { name: 'Times New Roman', size: 11, color: { argb: '000000' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true, };
      headerRow.height = 45; // Tăng chiều cao để hiển thị đẹp hơn

      // Hàm hỗ trợ tô màu nền cho các ô
      const fillCell = (colIndices, colorHex) => {
        colIndices.forEach(idx => {
          const cell = headerRow.getCell(idx);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorHex }
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      };

      // Tô màu theo nhóm (Dựa trên template ảnh)
      // Nhóm 1: Thông tin cá nhân (Cột 1->18) - Màu Cam nhạt
      const personalCols = [];
      for (let i = 1; i <= 18; i++) personalCols.push(i);
      fillCell(personalCols, 'FFE699');

      // Nhóm 2: Đảng/Đoàn & Tuyển sinh (Cột 19->36) - Màu Xanh lá nhạt
      const admissionCols = [];
      for (let i = 19; i <= 36; i++) admissionCols.push(i);
      fillCell(admissionCols, 'E2EFDA');

      // Nhóm 3: Kết quả & Tốt nghiệp (Cột 37->50) - Màu Xanh dương nhạt
      const resultCols = [];
      for (let i = 37; i <= 50; i++) resultCols.push(i);
      fillCell(resultCols, 'DDEBF7');

      // --- Style cho các ô dữ liệu (Thêm border) ---
      const totalColumns = 50; // Tổng 50 cột
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { vertical: 'middle', wrapText: true };
        }
        // Apply border cho tất cả cột từ 1 đến 50
        for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
          const cell = row.getCell(colIndex);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      throw new Error("Lỗi khi xuất file Excel: " + error.message);
    }
  }

  static async importSinhVien({ lop_id, filePath, ghi_de = 0 }) {
    const transaction = await sequelize.transaction();
    try {
      if (!lop_id) throw new Error("Thiếu lop_id");
      if (!filePath || !fs.existsSync(filePath)) throw new Error("File Excel không tồn tại");

      const lopCheck = await lop.findByPk(lop_id, { transaction });
      if (!lopCheck) throw new Error(`Lớp với id ${lop_id} không tồn tại`);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);

      const rows = [];
      worksheet.eachRow((row) => rows.push(row.values)); // values is array, index 0 is empty usually

      if (rows.length === 0) throw new Error("File Excel rỗng");

      // 1. Tìm dòng tiêu đề chứa "Mã sinh viên"
      let headerRowIndex = -1;
      let headers = [];

      // Helper function to safely get text from cell value (handling rich text objects)
      const getCellText = (cellValue) => {
        if (cellValue === null || cellValue === undefined) return '';
        if (typeof cellValue === 'object') {
          // Handle rich text or other objects if ExcelJS returns them
          if (cellValue.richText) return cellValue.richText.map(t => t.text).join('');
          if (cellValue.text) return cellValue.text;
          if (cellValue.result) return cellValue.result; // Formula result
        }
        return cellValue.toString();
      };

      // Quét 20 dòng đầu tiên
      for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const rowVal = rows[i];
        if (Array.isArray(rowVal)) {
          // Use helper to check content
          const isHeader = rowVal.some(c => {
            const text = getCellText(c).toLowerCase().trim();
            return text.includes("mã sinh viên") || text === "mã sv";
          });

          if (isHeader) {
            headerRowIndex = i;
            headers = Array.from(rowVal).map(c => getCellText(c).toLowerCase().trim());
            break;
          }
        }
      }

      if (headerRowIndex === -1) throw new Error("Không tìm thấy dòng tiêu đề chứa 'Mã sinh viên' (hoặc 'Mã SV'). Vui lòng kiểm tra file Excel.");

      // 2. Map cột (Chỉ map các cột có trong DB)
      // Headers array index corresponds to correct column index in row
      const colMap = {
        ma_sinh_vien: headers.findIndex(h => h.includes("mã sinh viên") || h === "mã sv"),
        ho_dem: headers.findIndex(h => h.includes("họ tên đệm") || h === "họ đệm"),
        ten: headers.findIndex(h => h === "tên"),
        ngay_sinh: headers.findIndex(h => h.includes("ngày sinh")),
        gioi_tinh: headers.findIndex(h => h === "giới tính"),
        noi_sinh: headers.findIndex(h => h.includes("nơi sinh")),
        dan_toc: headers.findIndex(h => h === "dân tộc"),
        ton_giao: headers.findIndex(h => h === "tôn giáo"),
        quoc_tich: headers.findIndex(h => h === "quốc tịch"),

        // Cố gắng match chính xác các tiêu đề mới sửa
        cccd: headers.findIndex(h => h.includes("cccd") || h.includes("hộ chiếu") || h.includes("cmnd")),
        ngay_cap_cccd: headers.findIndex(h => h.includes("ngày cấp") && (h.includes("cccd") || h.includes("hộ chiếu") || h.includes("cmnd"))),
        noi_cap_cccd: headers.findIndex(h => h.includes("nơi cấp") && (h.includes("cccd") || h.includes("hộ chiếu") || h.includes("cmnd"))),

        so_dien_thoai: headers.findIndex(h => h === "số điện thoại" || h === "sđt"),
        email: headers.findIndex(h => h === "email"),
        dien_thoai_gia_dinh: headers.findIndex(h => h.includes("điện thoại gia đình")),
        dien_thoai_cq: headers.findIndex(h => h.includes("điện thoại cơ quan")),
        ngay_vao_doan: headers.findIndex(h => h.includes("ngày vào đoàn")),
        ngay_vao_dang: headers.findIndex(h => h.includes("ngày vào đảng")),
        doi_tuong: headers.findIndex(h => h.includes("đối tượng")),
        don_vi_gui: headers.findIndex(h => h.includes("đơn vị gửi") || h.includes("đơn vị cử"))
      };

      // Refine Date Issue: There are many "Ngày ...".
      // "Ngày cấp" (CCCD), "Ngày vào đoàn", "Ngày vào đảng".
      // Fix 'ngay_cap_cccd' specific search:
      if (colMap.ngay_cap_cccd === -1 || headers[colMap.ngay_cap_cccd] === 'ngày cấp') { // Ambiguous?
        // Try exact string from template if possible, or relative position?
        // Using includes("ngày cấp") might match "ngày cấp bằng"?
        // Template: "Ngày cấp CCCD/Hộ chiếu"
        const idx = headers.findIndex(h => h.includes("ngày cấp cccd") || h.includes("ngày cấp")); // Priority
        if (idx !== -1) colMap.ngay_cap_cccd = idx;
      }

      // Check mandatory
      if (colMap.ma_sinh_vien === -1 || colMap.ho_dem === -1 || colMap.ten === -1) {
        throw new Error("File thiếu cột bắt buộc: Mã sinh viên, Họ tên đệm, hoặc Tên");
      }

      const dataRows = rows.slice(headerRowIndex + 1);
      const newSinhViens = [];
      const thongTinQuanNhanRecords = [];
      let updateCount = 0;

      for (let row of dataRows) {
        if (!row || row.length === 0) continue;

        // Helper to get raw value
        const getVal = (idx) => (idx !== -1 && row[idx]) ? getCellText(row[idx]).trim() : null;

        const ma_sinh_vien = getVal(colMap.ma_sinh_vien);
        const ho_dem = getVal(colMap.ho_dem);
        const ten = getVal(colMap.ten);

        if (!ma_sinh_vien && (!ho_dem || !ten)) continue; // Skip empty rows

        // Parse Dates
        const parseDate = (raw) => {
          if (!raw) return null;
          // IMPORTANT: If raw is object (rich text), convert to string first, UNLESS it is a Date object
          if (raw instanceof Date) return raw.toISOString().split("T")[0];

          const textVal = getCellText(raw).trim();
          if (!textVal) return null;

          // Try regex DD/MM/YYYY
          const parts = textVal.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
          if (parts) {
            return `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
          return null;
        };

        const ngay_sinh = parseDate(row[colMap.ngay_sinh]);
        const ngay_cap_CCCD = parseDate(row[colMap.ngay_cap_cccd]);
        const ngay_vao_doan = parseDate(row[colMap.ngay_vao_doan]);
        const ngay_vao_dang = parseDate(row[colMap.ngay_vao_dang]);
        // const nam_tot_nghiep = parseDate(row[colMap.nam_tot_nghiep]); // If needed

        // Gender
        let gioi_tinh = null;
        const gtStr = getVal(colMap.gioi_tinh);
        if (gtStr) {
          gioi_tinh = (gtStr.toLowerCase() === 'nam' || gtStr === '1') ? 1 : 0;
        }

        const cccd = getVal(colMap.cccd);

        // Object mapping (Doi Tuong)
        let doi_tuong_id = null;
        const dtMa = getVal(colMap.doi_tuong);
        if (dtMa) {
          const { Op } = db.Sequelize;
          const dt = await doi_tuong_quan_ly.findOne({
            where: {
              [Op.or]: [
                { ma_doi_tuong: dtMa },
                { ten_doi_tuong: dtMa }
              ]
            },
            transaction
          });
          if (dt) doi_tuong_id = dt.id;
        }

        // Check Existing
        let existing = null;
        if (ma_sinh_vien) {
          existing = await sinh_vien.findOne({ where: { ma_sinh_vien }, transaction });
        } else if (cccd) {
          existing = await sinh_vien.findOne({ where: { CCCD: cccd }, transaction });
        }

        const svData = {
          ma_sinh_vien,
          ho_dem,
          ten,
          ngay_sinh,
          gioi_tinh,
          que_quan: getVal(colMap.noi_sinh),
          dan_toc: getVal(colMap.dan_toc),
          ton_giao: getVal(colMap.ton_giao),
          quoc_tich: getVal(colMap.quoc_tich),
          CCCD: cccd,
          ngay_cap_CCCD,
          noi_cap_CCCD: getVal(colMap.noi_cap_cccd),
          so_dien_thoai: getVal(colMap.so_dien_thoai),
          email: getVal(colMap.email),
          dien_thoai_gia_dinh: getVal(colMap.dien_thoai_gia_dinh),
          dien_thoai_CQ: getVal(colMap.dien_thoai_cq), // Correct field name
          ngay_vao_doan,
          ngay_vao_dang,
          doi_tuong_id,
          lop_id
        };

        // Remove undefined/null keys if validation requires? No, updates handle nulls.

        if (existing) {
          if (ghi_de == 1) {
            await existing.update(svData, { transaction });
            updateCount++;
            // Update quan nhan
            const dv = getVal(colMap.don_vi_gui);
            if (dv) {
              await thong_tin_quan_nhan.findOrCreate({ where: { sinh_vien_id: existing.id }, defaults: { don_vi_cu_di_hoc: dv }, transaction });
              // Or update if exists?
              await thong_tin_quan_nhan.update({ don_vi_cu_di_hoc: dv }, { where: { sinh_vien_id: existing.id }, transaction });
            }
          }
        } else {
          newSinhViens.push({ ...svData, dang_hoc: 1 });
          if (getVal(colMap.don_vi_gui)) {
            // Store index to map later
            svData._temp_dv = getVal(colMap.don_vi_gui);
          }
        }
      } // End Loop

      if (newSinhViens.length > 0) {
        const created = await sinh_vien.bulkCreate(newSinhViens, { transaction });
        // Handle Info Quan Nhan
        const qnRecords = [];
        created.forEach((sv, idx) => {
          if (newSinhViens[idx]._temp_dv) {
            qnRecords.push({ sinh_vien_id: sv.id, don_vi_cu_di_hoc: newSinhViens[idx]._temp_dv });
          }
        });
        if (qnRecords.length > 0) await thong_tin_quan_nhan.bulkCreate(qnRecords, { transaction });
      }

      await transaction.commit();
      return {
        message: "Import thành công",
        newCount: newSinhViens.length,
        updateCount
      };

    } catch (error) {
      await transaction.rollback();
      console.error("Import Error Details:", error); // Log full error
      throw error;
    } finally {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  static async timSinhVienTheoMaHoacFilter(filters) {
    try {
      const { ma_sinh_vien, he_dao_tao_id, khoa_id, lop_id } = filters;

      // Build WHERE conditions for sinh_vien
      const sinhVienWhere = {};
      if (ma_sinh_vien) sinhVienWhere.ma_sinh_vien = ma_sinh_vien;
      if (lop_id) sinhVienWhere.lop_id = lop_id;

      // Simple case: only search by ma_sinh_vien or lop_id
      if ((ma_sinh_vien || lop_id) && !khoa_id && !he_dao_tao_id) {
        const sinhVienList = await sinh_vien.findAll({
          where: sinhVienWhere,
          include: [
            {
              model: lop,
              as: 'lop',
              attributes: ['ma_lop', 'khoa_dao_tao_id'],
            },
          ],
        });

        if (!sinhVienList || sinhVienList.length === 0) {
          throw new Error('Không tìm thấy sinh viên phù hợp');
        }

        return sinhVienList.map(sv => ({
          ma_sinh_vien: sv.ma_sinh_vien,
          ho_dem: sv.ho_dem,
          ten: sv.ten,
          lop: sv.lop?.ma_lop || sv.lop_id,
          khoa: null,
          he_dao_tao_id: null,
          ten_he_dao_tao: null,
        }));
      }

      // Complex case: need to filter by khoa_id or he_dao_tao_id
      // Step 1: Get lop_ids that match the criteria
      let validLopIds = [];

      if (khoa_id && !he_dao_tao_id) {
        // Filter by khoa_dao_tao_id only
        const lopList = await lop.findAll({
          where: { khoa_dao_tao_id: khoa_id },
          attributes: ['id', 'ma_lop'],
        });
        validLopIds = lopList.map(l => l.id);
      } else if (he_dao_tao_id) {
        // Filter by he_dao_tao_id (need to go through khoa_dao_tao)
        const khoaList = await khoa_dao_tao.findAll({
          where: { he_dao_tao_id: he_dao_tao_id },
          attributes: ['id'],
        });
        const khoaIds = khoaList.map(k => k.id);

        if (khoaIds.length === 0) {
          throw new Error('Không tìm thấy khóa đào tạo phù hợp');
        }

        const lopWhere = { khoa_dao_tao_id: khoaIds };
        if (khoa_id) {
          lopWhere.khoa_dao_tao_id = khoa_id; // Override if specific khoa_id is provided
        }

        const lopList = await lop.findAll({
          where: lopWhere,
          attributes: ['id', 'ma_lop'],
        });
        validLopIds = lopList.map(l => l.id);
      }

      if (validLopIds.length === 0) {
        throw new Error('Không tìm thấy lớp phù hợp với tiêu chí');
      }

      // Step 2: Filter sinh_vien by valid lop_ids
      const finalWhere = { ...sinhVienWhere };
      if (lop_id) {
        // Check if the specified lop_id is in validLopIds
        if (!validLopIds.includes(parseInt(lop_id))) {
          throw new Error('Lớp không phù hợp với tiêu chí tìm kiếm');
        }
        finalWhere.lop_id = lop_id;
      } else {
        finalWhere.lop_id = validLopIds;
      }

      const sinhVienList = await sinh_vien.findAll({
        where: finalWhere,
        include: [
          {
            model: lop,
            as: 'lop',
            attributes: ['ma_lop', 'khoa_dao_tao_id'],
          },
        ],
      });

      if (!sinhVienList || sinhVienList.length === 0) {
        throw new Error('Không tìm thấy sinh viên phù hợp');
      }

      // Step 3: Get additional info for khoa and he_dao_tao
      const result = [];
      for (const sv of sinhVienList) {
        let khoaInfo = null;
        let heDaoTaoInfo = null;

        if (sv.lop && sv.lop.khoa_dao_tao_id) {
          khoaInfo = await khoa_dao_tao.findByPk(sv.lop.khoa_dao_tao_id, {
            attributes: ['ma_khoa', 'he_dao_tao_id'],
          });

          if (khoaInfo && khoaInfo.he_dao_tao_id) {
            heDaoTaoInfo = await danh_muc_dao_tao.findByPk(khoaInfo.he_dao_tao_id, {
              attributes: ['id', 'ten_he_dao_tao'],
            });
          }
        }

        result.push({
          ma_sinh_vien: sv.ma_sinh_vien,
          ho_dem: sv.ho_dem,
          ten: sv.ten,
          lop: sv.lop?.ma_lop || sv.lop_id,
          khoa: khoaInfo?.ma_khoa || null,
          he_dao_tao_id: heDaoTaoInfo?.id || null,
          ten_he_dao_tao: heDaoTaoInfo?.ten_he_dao_tao || null,
        });
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async kiemTraTonTai({ lop_id, filePath }) {
    const transaction = await sequelize.transaction(); // Bắt đầu transaction
    try {
      // Kiểm tra tham số đầu vào
      if (!lop_id) {
        throw new Error("Thiếu lop_id");
      }
      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error("File Excel không tồn tại");
      }

      // Kiểm tra lớp tồn tại
      const lopCheck = await lop.findByPk(lop_id, { transaction });
      if (!lopCheck) {
        throw new Error(`Lớp với id ${lop_id} không tồn tại`);
      }

      // Đọc file Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // Lấy worksheet đầu tiên

      const rows = [];
      worksheet.eachRow((row, rowNumber) => {
        rows.push(row.values.slice(1)); // Bỏ cột đầu tiên nếu là index
      });

      if (rows.length === 0) {
        throw new Error("File Excel rỗng");
      }

      // Helper function to safely get text (COPY from importSinhVien)
      const getCellText = (cellValue) => {
        if (cellValue === null || cellValue === undefined) return '';
        if (typeof cellValue === 'object') {
          if (cellValue.richText) return cellValue.richText.map(t => t.text).join('');
          if (cellValue.text) return cellValue.text;
          if (cellValue.result) return cellValue.result;
        }
        return cellValue.toString();
      };

      // Tìm dòng tiêu đề (quét 20 dòng đầu)
      let headerRowIndex = -1;
      let headers = [];

      for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const rowVal = rows[i];
        if (Array.isArray(rowVal)) {
          const isHeader = rowVal.some(c => {
            const text = getCellText(c).toLowerCase().trim();
            return text.includes("mã sinh viên") || text === "mã sv";
          });
          if (isHeader) {
            headerRowIndex = i;
            headers = Array.from(rowVal).map(c => getCellText(c).toLowerCase().trim());
            break;
          }
        }
      }

      if (headerRowIndex === -1) {
        throw new Error("Không tìm thấy dòng tiêu đề hợp lệ (Mã sinh viên). Vui lòng kiểm tra file Excel.");
      }

      const dataRows = rows.slice(headerRowIndex + 1);

      // Xác định vị trí cột (Sync with importSinhVien)
      const hoDemIndex = headers.findIndex(h => h.includes("họ tên đệm") || h.includes("họ đệm"));
      const tenIndex = headers.findIndex(h => h === "tên");

      // CCCD Header: "Số CCCD/Hộ chiếu" or "CCCD" or "Hộ chiếu"
      const cccdIndex = headers.findIndex(h => h.includes("cccd") || h.includes("hộ chiếu") || h.includes("cmnd"));
      const maSvIndex = headers.findIndex(h => h.includes("mã sinh viên") || h === "mã sv");

      // Validating columns
      if (maSvIndex === -1 && (hoDemIndex === -1 || tenIndex === -1)) {
        throw new Error("File thiếu cột bắt buộc: Mã sinh viên HOẶC (Họ đệm + Tên)");
      }

      if (cccdIndex === -1 && maSvIndex === -1) {
        // If we don't have Ma SV, we typically rely on CCCD to check ID. 
        // But strict req from user is "Họ đệm, Tên, Mã sinh viên..."
        // So MaSV is prio.
      }

      const existingStudents = [];

      // Xử lý từng dòng dữ liệu
      for (let row of dataRows) {
        const getVal = (idx) => (idx !== -1 && row[idx]) ? getCellText(row[idx]).trim() : "";

        const ho_dem = getVal(hoDemIndex);
        const ten = getVal(tenIndex);
        const CCCD = getVal(cccdIndex);
        const ma_sinh_vien = getVal(maSvIndex);

        if ((!ho_dem || !ten) && !ma_sinh_vien) {
          continue;
        }

        // Kiểm tra sinh viên đã tồn tại theo CCCD
        const existingSinhVien = await sinh_vien.findOne({
          where: { CCCD },
          attributes: ['ma_sinh_vien', 'ho_dem', 'ten', 'CCCD', 'lop_id'],
          transaction
        });

        if (existingSinhVien) {
          existingStudents.push({
            ma_sinh_vien: existingSinhVien.ma_sinh_vien,
            ho_dem: existingSinhVien.ho_dem,
            ten: existingSinhVien.ten,
            CCCD: existingSinhVien.CCCD,
            lop_id: existingSinhVien.lop_id
          });
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        message: "Kiểm tra danh sách sinh viên thành công",
        existingStudents: existingStudents,
        existingCount: existingStudents.length
      };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw new Error("Lỗi khi kiểm tra danh sách sinh viên: " + error.message);
    } finally {
      // Xóa file sau khi xử lý, bất kể thành công hay thất bại
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  static async checkGraduationConditions(sinhVienId, requiredCredits = null) {
    try {
      // Tìm sinh viên theo ID và lấy thông tin lớp
      const sinhVien = await sinh_vien.findByPk(sinhVienId, {
        include: [
          {
            model: lop,
            as: 'lop',
            attributes: ['id', 'ma_lop', 'khoa_dao_tao_id'],
          }
        ]
      });

      if (!sinhVien) {
        throw new Error("Sinh viên không tồn tại");
      }

      // Lấy tổng tín chỉ từ bảng sinh_vien
      const tongTinChi = sinhVien.tong_tin_chi || 0;

      // Lấy thông tin khóa đào tạo để lấy số tín chỉ yêu cầu
      let tongTinChiYeuCau = requiredCredits;

      if (!tongTinChiYeuCau && sinhVien.lop && sinhVien.lop.khoa_dao_tao_id) {
        const khoaDaoTao = await khoa_dao_tao.findByPk(sinhVien.lop.khoa_dao_tao_id, {
          attributes: ['id', 'tong_tin_chi_yeu_cau']
        });

        if (khoaDaoTao && khoaDaoTao.tong_tin_chi_yeu_cau) {
          tongTinChiYeuCau = khoaDaoTao.tong_tin_chi_yeu_cau;
          console.log(`Lấy tín chỉ yêu cầu từ khóa đào tạo: ${tongTinChiYeuCau}`);
        } else {
          console.log(`Không tìm thấy tín chỉ yêu cầu trong khóa đào tạo ID: ${sinhVien.lop.khoa_dao_tao_id}`);
        }
      }

      // Nếu không có giá trị từ tham số hoặc từ khóa đào tạo, dùng giá trị mặc định là 130
      tongTinChiYeuCau = tongTinChiYeuCau || 130;

      // Kiểm tra điều kiện tín chỉ
      const isTinChiValid = tongTinChi >= tongTinChiYeuCau;

      // Lấy tất cả các loại chứng chỉ có xet_tot_nghiep = true
      const allRequiredCertTypes = await LoaiChungChiModel.findAll({
        where: {
          xet_tot_nghiep: true,
          tinh_trang: 'hoạt động' // Chỉ lấy loại chứng chỉ đang hoạt động
        },
        attributes: ['id', 'ten_loai_chung_chi', 'xet_tot_nghiep']
      });

      // Lấy danh sách chứng chỉ của sinh viên có tinh_trang "tốt nghiệp" và thuộc loại chứng chỉ có xet_tot_nghiep = true
      const chungChiList = await chung_chi.findAll({
        where: {
          sinh_vien_id: sinhVienId,
          tinh_trang: 'tốt nghiệp',
        },
        include: [
          {
            model: LoaiChungChiModel,
            as: 'loaiChungChi',
            where: {
              xet_tot_nghiep: true,
            },
            attributes: ['id', 'ten_loai_chung_chi', 'xet_tot_nghiep'],
          },
        ],
        attributes: ['id', 'loai_chung_chi', 'loai_chung_chi_id', 'tinh_trang', 'diem_trung_binh', 'xep_loai', 'so_quyet_dinh', 'ngay_ky_quyet_dinh'],
      });

      // Lấy danh sách ID các loại chứng chỉ mà sinh viên đã có
      const studentCertTypeIds = chungChiList.map(cc => cc.loai_chung_chi_id).filter(id => id);
      const uniqueStudentCertTypeIds = [...new Set(studentCertTypeIds)];

      // Lấy danh sách ID các loại chứng chỉ bắt buộc
      const requiredCertTypeIds = allRequiredCertTypes.map(cert => cert.id);

      // Kiểm tra xem sinh viên có đủ tất cả loại chứng chỉ bắt buộc không
      const missingCertTypes = requiredCertTypeIds.filter(id => !uniqueStudentCertTypeIds.includes(id));
      const isChungChiValid = missingCertTypes.length === 0 && requiredCertTypeIds.length > 0;

      // Lấy thông tin về các loại chứng chỉ còn thiếu
      const missingCertTypesInfo = allRequiredCertTypes.filter(cert => missingCertTypes.includes(cert.id));

      // Xác định điều kiện tốt nghiệp
      const isEligible = isTinChiValid && isChungChiValid;

      // Trả về kết quả
      const result = {
        sinh_vien_id: sinhVien.id,
        ma_sinh_vien: sinhVien.ma_sinh_vien,
        ho_ten: `${sinhVien.ho_dem || ''} ${sinhVien.ten || ''}`.trim(),
        tong_tin_chi: tongTinChi,
        chung_chi_tot_nghiep: chungChiList.map((cc) => ({
          ...cc.toJSON(),
          loai_chung_chi_info: cc.loaiChungChi ? cc.loaiChungChi.toJSON() : null,
        })),
        dieu_kien_tot_nghiep: {
          du_tin_chi: isTinChiValid,
          co_chung_chi_xet_tot_nghiep: isChungChiValid,
          du_dieu_kien: isEligible,
          chi_tiet: {
            tong_tin_chi_hien_tai: tongTinChi,
            tong_tin_chi_yeu_cau: tongTinChiYeuCau,
            so_chung_chi_dat_yeu_cau: chungChiList.length,
            so_loai_chung_chi_yeu_cau: requiredCertTypeIds.length,
            so_loai_chung_chi_da_co: uniqueStudentCertTypeIds.length,
            so_loai_chung_chi_con_thieu: missingCertTypes.length,
            loai_chung_chi_con_thieu: missingCertTypesInfo.map(cert => ({
              id: cert.id,
              ten_loai_chung_chi: cert.ten_loai_chung_chi
            })),
            tat_ca_loai_chung_chi_yeu_cau: allRequiredCertTypes.map(cert => ({
              id: cert.id,
              ten_loai_chung_chi: cert.ten_loai_chung_chi,
              da_co: uniqueStudentCertTypeIds.includes(cert.id)
            }))
          },
        },
      };

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async checkMultipleStudentsGraduationConditions(sinhVienIds, requiredCredits = null) {
    try {
      if (!Array.isArray(sinhVienIds) || sinhVienIds.length === 0) {
        throw new Error("Danh sách ID sinh viên không hợp lệ");
      }

      const results = [];
      for (const sinhVienId of sinhVienIds) {
        try {
          const result = await this.checkGraduationConditions(sinhVienId, requiredCredits);
          results.push(result);
        } catch (error) {
          results.push({
            sinh_vien_id: sinhVienId,
            error: error.message,
          });
        }
      }

      // Thống kê tổng quan
      const eligibleCount = results.filter(r => r.dieu_kien_tot_nghiep?.du_dieu_kien).length;
      const totalCount = results.length;

      return {
        results,
        summary: {
          total_students: totalCount,
          eligible_students: eligibleCount,
          not_eligible_students: totalCount - eligibleCount,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getStudentsByKhoaDaoTaoId(khoaDaoTaoId) {
    try {
      // Kiểm tra khóa đào tạo có tồn tại
      const khoaCheck = await khoa_dao_tao.findByPk(khoaDaoTaoId);
      if (!khoaCheck) {
        throw new Error("Khóa đào tạo không tồn tại");
      }

      // Lấy danh sách sinh viên thuộc các lớp của khóa đào tạo
      const sinhViens = await sinh_vien.findAll({
        include: [
          {
            model: lop,
            as: 'lop',
            attributes: ['ma_lop'],
            required: true,
            where: {
              khoa_dao_tao_id: khoaDaoTaoId
            }
          },
          {
            model: doi_tuong_quan_ly,
            as: 'doi_tuong',
            attributes: ['ten_doi_tuong', 'ma_doi_tuong'],
            required: false
          }
        ],
        order: [['ten', 'ASC']],
      });

      if (!sinhViens || sinhViens.length === 0) {
        return { message: "Không tìm thấy sinh viên thuộc khóa đào tạo này", students: [], total: 0 };
      }

      return {
        students: sinhViens,
        total: sinhViens.length
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên theo khóa đào tạo: " + error.message);
    }
  }
  static async updateSinhVienByKhoaDaoTao(khoaDaoTaoId, sinhVienList) {
    const transaction = await sequelize.transaction();
    try {
      // Kiểm tra khóa đào tạo tồn tại
      const khoaCheck = await khoa_dao_tao.findByPk(khoaDaoTaoId, { transaction });
      if (!khoaCheck) {
        throw new Error("Khóa đào tạo không tồn tại");
      }

      // Kiểm tra danh sách sinh viên đầu vào
      if (!sinhVienList || !Array.isArray(sinhVienList) || sinhVienList.length === 0) {
        throw new Error("Danh sách sinh viên không hợp lệ hoặc rỗng");
      }

      const updatedSinhViens = [];
      const errors = [];

      // Xử lý từng sinh viên
      for (const sv of sinhVienList) {
        const { id, bao_ve_do_an } = sv;
        if (!id || typeof bao_ve_do_an !== 'boolean') {
          errors.push(`Dữ liệu không hợp lệ cho sinh viên ID ${id || 'không xác định'}`);
          continue;
        }

        // Kiểm tra sinh viên tồn tại và thuộc khóa đào tạo
        const sinhVien = await sinh_vien.findOne({
          where: { id },
          include: [{
            model: lop,
            as: 'lop',
            attributes: [],
            where: { khoa_dao_tao_id: khoaDaoTaoId }
          }],
          transaction
        });

        if (!sinhVien) {
          errors.push(`Sinh viên ID ${id} không tồn tại hoặc không thuộc khóa đào tạo`);
          continue;
        }

        // Cập nhật sinh viên
        await sinhVien.update({
          bao_ve_do_an,
          thi_tot_nghiep: !bao_ve_do_an
        }, { transaction });

        updatedSinhViens.push(sinhVien);
      }

      if (errors.length > 0 && updatedSinhViens.length === 0) {
        throw new Error(`Không thể cập nhật sinh viên: ${errors.join('; ')}`);
      }

      await transaction.commit();

      return {
        message: "Cập nhật danh sách sinh viên thành công",
        updatedCount: updatedSinhViens.length,
        updatedSinhViens: updatedSinhViens.map(sv => ({
          id: sv.id,
          ma_sinh_vien: sv.ma_sinh_vien,
          ho_dem: sv.ho_dem,
          ten: sv.ten,
          bao_ve_do_an: sv.bao_ve_do_an,
          thi_tot_nghiep: sv.thi_tot_nghiep
        })),
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error("Lỗi khi cập nhật danh sách sinh viên: " + error.message);
    }
  }
}

module.exports = SinhVienService;
