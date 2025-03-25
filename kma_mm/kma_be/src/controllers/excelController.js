// const ExcelService = require("../services/excelService");
// const path = require("path");
// const fs = require("fs");

// class ExcelController {
//   static async exportSinhVienToExcel(req, res) {
//     try {
//       // Lấy toàn bộ dữ liệu sinh viên
//       const sinhVienData = await ExcelService.getSinhVienData();

//       if (!sinhVienData || sinhVienData.length === 0) {
//         return res.status(404).json({ message: "Không tìm thấy dữ liệu sinh viên" });
//       }

//       // Xuất file Excel
//       const workbook = await ExcelService.exportToExcel(sinhVienData);

//       // Lưu file tạm thời
//       const fileName = `danh_gia_diem_qua_trinh.xlsx`;
//       const filePath = path.join("./uploads", fileName);

//       await workbook.xlsx.writeFile(filePath);

//       // Gửi file về client
//       res.download(filePath, fileName, (err) => {
//         if (err) {
//           console.error("Lỗi khi gửi file:", err);
//           return res.status(500).json({ message: "Không thể tải file" });
//         }
//         fs.unlink(filePath, (unlinkErr) => {
//           if (unlinkErr) {
//             console.error("Lỗi khi xóa file:", unlinkErr);
//           } else {
//             console.log("File đã được xóa thành công sau khi gửi.");
//           }
//         });
//       });
//     } catch (error) {
//       console.error("Lỗi trong controller:", error);
//       res.status(500).json({ message: "Lỗi server: " + error.message });
//     }
//   }
// }

// module.exports = ExcelController;
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
      // Lấy toàn bộ dữ liệu sinh viên
      const sinhVienData = await ExcelService.getSinhVienData();

      if (!sinhVienData || sinhVienData.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy dữ liệu sinh viên" });
      }

      // Xuất file Excel
      const workbook = await ExcelService.exportToExcel(sinhVienData);

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
}

module.exports = ExcelController;