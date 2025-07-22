const ExportDocxService = require("../services/exportDocxService");
const path = require("path");
const fs = require("fs");
const SinhVienService = require("../services/studentService");

const exportDir = path.join(__dirname, "..", "exports", "ket_qua_hoc_tap_cua_sinh_vien");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

class ExportDocxController{
    static async getDataPhuLucBang(req, res) {
        try {
            const { sinh_vien_id, ky_hoc, khoa_dao_tao_id } = req.query;
            console.log("sinh_vien_id", sinh_vien_id);
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
            
            // Lấy dữ liệu phụ lục bảng
            const data = await ExportDocxService.getDataPhuLucBang(
                parseInt(sinh_vien_id),
                parseInt(ky_hoc),
                parseInt(khoa_dao_tao_id)
            );
            
            return res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu phụ lục bảng:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi lấy dữ liệu phụ lục bảng",
                error: error.message
            });
        }
    }
    
    static async getSoKyHocVaKhoa(req, res) {
        try {
            const { sinh_vien_id } = req.query;
            
            // Kiểm tra dữ liệu đầu vào
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên"
                });
            }
            
            // Lấy thông tin số kỳ học và khóa đào tạo
            const data = await ExportDocxService.getSoKyHocVaKhoa(parseInt(sinh_vien_id));
            
            return res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin số kỳ học và khóa đào tạo:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi lấy thông tin số kỳ học và khóa đào tạo",
                error: error.message
            });
        }
    }

    static async exportDocxKQHocKy(req, res) {
        try {
            const { sinh_vien_id, hoc_ky } = req.query;

            // Kiểm tra dữ liệu đầu vào
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên"
                });
            }
            
            const docxBuffer = await ExportDocxService.exportDocxKQHocKy(sinh_vien_id, hoc_ky);
            
            // Lưu file vào thư mục exports/phulucbang
            const fileName = `ket_qua_hoc_tap_hoc_ky_${hoc_ky}_cua_sinh_vien_${sinh_vien_id}.docx`;
            const filePath = path.join(exportDir, fileName);

            fs.writeFileSync(filePath, docxBuffer);
        
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error("Lỗi khi gửi file:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Không thể tải file"
                    });
                }
        
                console.log("File đã được lưu tại:", filePath);
            });

        } catch (error) {
            console.error("Lỗi khi xuất file Excel phụ lục bảng:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xuất file Excel phụ lục bảng",
                error: error.message
            });
        }
    }

    static async exportDocxKQNamHoc(req, res) {
        
        try {
            const { sinh_vien_id, nam_hoc } = req.query;
        
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên"
                });
            }
        
            const docxBuffer = await ExportDocxService.exportDocxKQNamHoc(sinh_vien_id, nam_hoc);
            const fileName = `ket_qua_hoc_tap_nam_hoc_${nam_hoc}_cua_sinh_vien_${sinh_vien_id}.docx`;
            const filePath = path.join(exportDir, fileName);
        
            fs.writeFileSync(filePath, docxBuffer);
        
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error("Lỗi khi gửi file:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Không thể tải file"
                    });
                }
        
                console.log("File đã được lưu tại:", filePath);
            });
        
        } catch (error) {
            console.error("Lỗi khi xuất file DOCX phụ lục bảng:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xuất file DOCX phụ lục bảng",
                error: error.message
            });
        }
    }
}
module.exports = ExportDocxController;