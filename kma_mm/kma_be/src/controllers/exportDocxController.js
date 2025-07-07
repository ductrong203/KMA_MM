const ExportDocxService = require("../services/exportDocxService");
const path = require("path");
const fs = require("fs");
const SinhVienService = require("../services/studentService");

const exportDir = path.join(__dirname, "..", "exports", "docx");
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

            if (!hoc_ky) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin học kỳ"
                });
            }
            
            const docxBuffer = await ExportDocxService.exportDocxKQHocKy(parseInt(sinh_vien_id), parseInt(hoc_ky));
            
            // Lưu file vào thư mục exports/docx
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
            console.error("Lỗi khi xuất file DOCX kết quả học kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xuất file DOCX kết quả học kỳ",
                error: error.message
            });
        }
    }

    static async exportDocxKQNamHoc(req, res) {
        try {
            const { sinh_vien_id, nam_hoc } = req.query;
        
            // Kiểm tra dữ liệu đầu vào
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên"
                });
            }
        
            if (!nam_hoc) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin năm học"
                });
            }

            // Kiểm tra định dạng năm học (phải là YYYY-YYYY và hai năm phải liên tiếp)
            const namHocRegex = /^\d{4}-\d{4}$/;
            if (!namHocRegex.test(nam_hoc)) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng năm học không đúng. Vui lòng sử dụng định dạng YYYY-YYYY (ví dụ: 2024-2025)"
                });
            }

            const [namBatDau, namKetThuc] = nam_hoc.split('-').map(Number);
            if (namKetThuc !== namBatDau + 1) {
                return res.status(400).json({
                    success: false,
                    message: "Năm học phải là hai năm liên tiếp (ví dụ: 2024-2025)"
                });
            }
        
            // Chuyển đổi sang số nguyên để đảm bảo kiểu dữ liệu đúng
            const sinhVienId = parseInt(sinh_vien_id);
            if (isNaN(sinhVienId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID sinh viên không hợp lệ"
                });
            }
        
            // Gọi service để tạo file DOCX
            const docxBuffer = await ExportDocxService.exportDocxKQNamHoc(sinhVienId, nam_hoc);
            
            // Tạo tên file với timestamp để tránh trùng lặp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `ket_qua_hoc_tap_nam_hoc_${nam_hoc}_sinh_vien_${sinh_vien_id}_${timestamp}.docx`;
            const filePath = path.join(exportDir, fileName);
        
            // Lưu file vào thư mục exports/docx
            fs.writeFileSync(filePath, docxBuffer);
        
            // Gửi file về client
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error("Lỗi khi gửi file:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Không thể tải file"
                    });
                }
        
                console.log("File đã được lưu và gửi thành công:", filePath);
                
                // Xóa file tạm sau khi gửi thành công (tùy chọn)
                // setTimeout(() => {
                //     try {
                //         if (fs.existsSync(filePath)) {
                //             fs.unlinkSync(filePath);
                //             console.log("File tạm đã được xóa:", filePath);
                //         }
                //     } catch (unlinkError) {
                //         console.error("Lỗi khi xóa file tạm:", unlinkError);
                //     }
                // }, 5000); // Xóa sau 5 giây
            });
        
        } catch (error) {
            console.error("Lỗi khi xuất file DOCX kết quả năm học:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xuất file DOCX kết quả năm học",
                error: error.message
            });
        }
    }
}
module.exports = ExportDocxController;