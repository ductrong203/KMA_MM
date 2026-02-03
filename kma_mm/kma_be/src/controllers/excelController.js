const ExcelService = require("../services/excelService");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục exports/excel tồn tại
const exportDir = path.join(__dirname, "..", "exports", "excel");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

class ExcelController {
  static async exportSinhVienToExcel(req, res) {
    try {

      const sinhVienData = await ExcelService.getSinhVienData(req.body);

      if (!sinhVienData || sinhVienData.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy dữ liệu sinh viên" });
      }

      // Xuất file Excel
      const workbook = await ExcelService.exportToExcel(sinhVienData, req.body);

      // Lưu file vào thư mục exports/excel
      const fileName = `danh_gia_diem_qua_trinh.xlsx`;
      const filePath = path.join(exportDir, fileName);

      await workbook.xlsx.writeFile(filePath);

      // Gửi file về client
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Lỗi khi gửi file:", err);
          return res.status(500).json({ message: "Không thể tải file" });
        }
        console.log("File đã được lưu vĩnh viễn tại:", filePath);
        // Bỏ phần xóa file để lưu vĩnh viễn
      });
    } catch (error) {
      console.error("Lỗi trong controller:", error);
      res.status(500).json({ message: "Lỗi server: " + error.message });
    }
  }

  static async exportSinhVienToExcelCuoiKy(req, res) {
    try {

      const sinhVienData = await ExcelService.getSinhVienCuoiKy(req.body);

      if (!sinhVienData || sinhVienData.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy dữ liệu sinh viên" });
      }

      // Xuất file Excel
      const workbook = await ExcelService.exportToExcelCuoiKy(sinhVienData, req.body);

      // Lưu file vào thư mục exports/excel
      const fileName = `danh_sach_cuoi_ky.xlsx`;
      const filePath = path.join(exportDir, fileName);

      await workbook.xlsx.writeFile(filePath);

      // Gửi file về client
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Lỗi khi gửi file:", err);
          return res.status(500).json({ message: "Không thể tải file" });
        }
        console.log("File đã được lưu vĩnh viễn tại:", filePath);
        // Bỏ phần xóa file để lưu vĩnh viễn
      });
    } catch (error) {
      console.error("Lỗi trong controller:", error);
      res.status(500).json({ message: "Lỗi server: " + error.message });
    }
  }

  // Export danh sách thi lại (chỉ sinh viên cần thi lại)
  static async exportSinhVienToExcelThiLai(req, res) {
    try {
      const sinhVienData = await ExcelService.getSinhVienThiLai(req.body);

      if (!sinhVienData || sinhVienData.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên nào cần thi lại" });
      }

      // Xuất file Excel
      const workbook = await ExcelService.exportToExcelThiLai(sinhVienData, req.body);

      // Lưu file vào thư mục exports/excel
      const fileName = `danh_sach_thi_lai.xlsx`;
      const filePath = path.join(exportDir, fileName);

      await workbook.xlsx.writeFile(filePath);

      // Gửi file về client
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Lỗi khi gửi file:", err);
          return res.status(500).json({ message: "Không thể tải file" });
        }
        console.log("File thi lại đã được lưu tại:", filePath);
      });
    } catch (error) {
      console.error("Lỗi trong controller:", error);
      res.status(500).json({ message: "Lỗi server: " + error.message });
    }
  }
}

module.exports = ExcelController;