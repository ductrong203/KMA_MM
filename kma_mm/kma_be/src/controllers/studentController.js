const SinhVienService = require("../services/studentService");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục exports/sinhvien tồn tại
const exportDir = path.join(__dirname, "..", "exports", "sinhvien");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

class SinhVienController {
  static async create(req, res) {
    try {
      const sinhVien = await SinhVienService.createSinhVien(req.body);
      res.status(201).json(sinhVien);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const sinhViens = await SinhVienService.getAllSinhViens();
      res.json(sinhViens);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllPhanTrang(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await SinhVienService.getAllSinhVienPhanTrang(
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByLopId(req, res) {
    try {
      const { lop_id } = req.params;
      const students = await SinhVienService.getStudentsByLopId(lop_id);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByDoiTuongId(req, res) {
    try {
      const { doi_tuong_id } = req.params;
      const students = await SinhVienService.getStudentsByDoiTuongId(doi_tuong_id);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const sinhVien = await SinhVienService.getSinhVienById(req.params.id);
      if (!sinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json(sinhVien);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const updatedSinhVien = await SinhVienService.updateSinhVien(req.params.id, req.body);
      if (!updatedSinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json(updatedSinhVien);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deletedSinhVien = await SinhVienService.deleteSinhVien(req.params.id);
      if (!deletedSinhVien) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      res.json({ message: "Đã xóa sinh viên" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async timSinhVienTheoMaHoacFilter(req, res) {
    try {
      const filters = req.query; // Lấy tất cả query params
      console.log(filters)
      const sinhVienList = await SinhVienService.timSinhVienTheoMaHoacFilter(filters);

      res.status(200).json({
        success: true,
        data: sinhVienList,
      });
    } catch (error) {
      console.error('Error in timSinhVienTheoMaHoacFilter:', error);
      res.status(error.message === 'Không tìm thấy sinh viên phù hợp' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // static async exportToExcel(req, res) {
  //   try {
  //     const sinhVienData = await SinhVienService.getDanhSachSinhVienExcel(req.body);
  //     res.status(200).json({ success: true, data: sinhVienData });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // }


  static async exportToExcel(req, res) {
    try {
      const buffer = await SinhVienService.exportSinhVienToExcel(req.body);

      // Tạo tên file với timestamp để tránh trùng lặp
      const fileName = `danh_sach_sinh_vien_${Date.now()}.xlsx`;
      const filePath = path.join(exportDir, fileName);

      // Lưu file vào thư mục exports/excel
      await fs.promises.writeFile(filePath, buffer);

      // Gửi file về client
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Lỗi khi gửi file:", err);
          return res.status(500).json({ success: false, message: "Không thể tải file" });
        }
        console.log("File đã được lưu vĩnh viễn tại:", filePath);
        // Không xóa file để lưu vĩnh viễn
      });
    } catch (error) {
      console.error("Lỗi trong controller:", error);
      res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  static async importSinhVien(req, res) {
    try {
      const { lop_id, ghi_de } = req.body;
      const filePath = req.file.path; // Giả sử sử dụng middleware như multer để upload file
      const result = await SinhVienService.importSinhVien({lop_id, filePath, ghi_de});
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  static async timSinhVienTheoMaHoacFilter(req, res) {
    try {
      const filters = req.query; // Lấy tất cả query params
      console.log(filters)
      const sinhVienList = await SinhVienService.timSinhVienTheoMaHoacFilter(filters);

      res.status(200).json({
        success: true,
        data: sinhVienList,
      });
    } catch (error) {
      console.error('Error in timSinhVienTheoMaHoacFilter:', error);
      res.status(error.message === 'Không tìm thấy sinh viên phù hợp' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async kiemTraTonTai(req, res) {
    try {
      const { lop_id } = req.body;
      const filePath = req.file.path; // Giả sử sử dụng middleware như multer để upload file
      const result = await SinhVienService.kiemTraTonTai({lop_id, filePath});
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = SinhVienController;