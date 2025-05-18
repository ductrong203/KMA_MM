const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const models = initModels(sequelize);
const { doi_tuong_quan_ly, sinh_vien, lop } = models;

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

  static async getDanhSachSinhVienExcel({khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id}) {
    try {
      // Kiểm tra tham số đầu vào
      if (!khoa_dao_tao_id && !lop_id && !doi_tuong_quan_ly_id) {
        throw new Error("Phải cung cấp ít nhất một tham số: khoa_dao_tao_id, lop_id, hoặc doi_tuong_quan_ly_id");
      }
      if (lop_id) {
        const lopCheck = await lop.findOne({ 
          where: { 
            id: lop_id, 
            ...(khoa_dao_tao_id && { khoa_dao_tao_id }) // Kiểm tra khoa_dao_tao_id nếu có
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
        attributes: [
          'ho_dem',
          'ten',
          'ngay_sinh',
          'gioi_tinh',
          'que_quan',
          'so_dien_thoai',
          'email',
          'ghi_chu'
        ],
        include: [
          {
            model: doi_tuong_quan_ly,
            as: 'doi_tuong',
            attributes: ['ma_doi_tuong'],
            required: true 
          },
          {
            model: thong_tin_quan_nhan,
            as: 'thong_tin_quan_nhans',
            attributes: ['don_vi_cu_di_hoc'],
            required: false
          },
          {
            model: lop,
            as: 'lop',
            attributes: [],
            required: true,
            where: {
              ...(khoa_dao_tao_id && { khoa_dao_tao_id }) // Lọc khoa_dao_tao_id nếu có
            }
          }
        ],
        where: whereCondition,
        order: [['ten', 'ASC']], // Sắp xếp theo tên
        subQuery: false, // Tối ưu hóa truy vấn
        raw: true // Trả về JSON thuần
      });

      if (!sinhViens || sinhViens.length === 0) {
        return { message: "Không tìm thấy sinh viên phù hợp", students: [] };
      }

      // Định dạng dữ liệu cho Excel
      const formattedData = sinhViens.map((sv, index) => ({
        stt: index + 1,
        ho_dem: sv.ho_dem || '',
        ten: sv.ten || '',
        ngay_sinh: sv.ngay_sinh ? new Date(sv.ngay_sinh).toLocaleDateString('vi-VN') : '',
        gioi_tinh: sv.gioi_tinh === 1 ? 'Nam' : sv.gioi_tinh === 0 ? 'Nữ' : '',
        noi_sinh: sv.que_quan || '',
        doi_tuong: sv['doi_tuong.ma_doi_tuong'] || '',
        don_vi_gui_dao_tao: sv['thong_tin_quan_nhans.don_vi_cu_di_hoc'] || '',
        dien_thoai: sv.so_dien_thoai || '',
        email: sv.email || '',
        ghi_chu: sv.ghi_chu || ''
      }));

      return {
        students: formattedData,
        total: sinhViens.length
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách sinh viên cho Excel: " + error.message);
    }
  }

  static async exportSinhVienToExcel({khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id}) {
    try {
      const { students } = await this.getDanhSachSinhVienExcel( {khoa_dao_tao_id, lop_id, doi_tuong_quan_ly_id});
      if (!students || students.length === 0) {
        throw new Error("Không có sinh viên để xuất Excel");
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh sách sinh viên');

      // Định nghĩa tiêu đề cột
      worksheet.columns = [
        { header: 'STT', key: 'stt', width: 5 },
        { header: 'Họ đệm', key: 'ho_dem', width: 20 },
        { header: 'Tên', key: 'ten', width: 15 },
        { header: 'Ngày sinh', key: 'ngay_sinh', width: 12 },
        { header: 'Giới tính', key: 'gioi_tinh', width: 10 },
        { header: 'Nơi sinh', key: 'noi_sinh', width: 25 },
        { header: 'Đối tượng', key: 'doi_tuong', width: 15 },
        { header: 'Đơn vị gửi đào tạo', key: 'don_vi_gui_dao_tao', width: 25 },
        { header: 'Điện thoại', key: 'dien_thoai', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Ghi chú', key: 'ghi_chu', width: 30 }
      ];

      // Thêm dữ liệu
      students.forEach(student => {
        worksheet.addRow(student);
      });

      // Định dạng tiêu đề
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Định dạng các cột
      worksheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });

      // Lưu file vào buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      throw new Error("Lỗi khi xuất file Excel: " + error.message);
    }
  }

  static async updateSinhVien(id, data) {
    const sinhVien = await sinh_vien.findByPk(id);
    if (!sinhVien) return null;
    return await sinhVien.update(data);
  }

  static async deleteSinhVien(id) {
    const sinhVien = await sinh_vien.findByPk(id);
    if (!sinhVien) return null;
    await sinhVien.destroy();
    return sinhVien;
  }
}

module.exports = SinhVienService;
