const ExportExcelService = require("../services/exportExcelService");
const path = require("path");
const fs = require("fs");

const exportDir = path.join(__dirname, "..", "exports", "excel");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

class ExportExcelController {
    static async exportKetQuaKyHoc(req, res) {
        try {
            const { sinh_vien_id, so_ky_hoc } = req.query;

            // Kiểm tra dữ liệu đầu vào
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên sinh_vien_id"
                });
            }
            
            if (!so_ky_hoc) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin số kỳ học"
                });
            }
            
            // Lấy workbook từ service
            const workbook = await ExportExcelService.exportKetQuaKyHoc(
                parseInt(sinh_vien_id),
                parseInt(so_ky_hoc)
            );
            
            // Lưu file vào thư mục exports/excel
            const fileName = `ket_qua_ky_hoc_${so_ky_hoc}.xlsx`;
            const filePath = path.join(exportDir, fileName);

            await workbook.xlsx.writeFile(filePath);

            // Gửi file về client
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error("Lỗi khi gửi file:", err);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Không thể tải file" 
                    });
                }
                console.log("File đã được lưu tại:", filePath);
                // Bỏ phần xóa file để lưu vĩnh viễn
            });
        } catch (error) {
            console.error("Lỗi khi xuất file Excel kết quả kỳ học:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xuất file Excel kết quả kỳ học",
                error: error.message
            });
        }
    }

    static async getDiemTrungBinhKyHoc(req, res) {
        try {
            const { sinh_vien_id, ky_hoc, khoa_dao_tao_id } = req.query;

            // Kiểm tra dữ liệu đầu vào
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên sinh_vien_id"
                });
            }
            
            if (!ky_hoc) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin kỳ học"
                });
            }
            
            if (!khoa_dao_tao_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin khóa đào tạo"
                });
            }
            
            // Lấy điểm trung bình kỳ học
            const gpa = await ExportExcelService.getDiemTrungBinhKyHoc(
                parseInt(sinh_vien_id),
                parseInt(ky_hoc),
                parseInt(khoa_dao_tao_id)
            );
            
            return res.status(200).json({
                success: true,
                data: gpa
            });
        } catch (error) {
            console.error("Lỗi khi tính điểm trung bình kỳ học:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi tính điểm trung bình kỳ học",
                error: error.message
            });
        }
    }
}

module.exports = ExportExcelController;
