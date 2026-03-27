const ExcelPhuLucBangService = require("../services/excelPhuLucBangService");
const path = require("path");
const fs = require("fs");
const SinhVienService = require("../services/studentService");
const archiver = require("archiver");

const exportDir = path.join(__dirname, "..", "exports", "phulucbang");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

class ExcelPhuLucBangController{
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
            const data = await ExcelPhuLucBangService.getDataPhuLucBang(
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
            const data = await ExcelPhuLucBangService.getSoKyHocVaKhoa(parseInt(sinh_vien_id));
            
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

    static async exportExcelPhuLucBang(req, res) {
        try {
            const { sinh_vien_id } = req.query;

            // Kiểm tra dữ liệu đầu vào
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên"
                });
            }
            
            // Lấy thông tin sinh viên
            const sinhVien = await ExcelPhuLucBangService.exportExcelPhuLucBang_v2(parseInt(sinh_vien_id));
            
            // Lưu file vào thư mục exports/phulucbang
            const fileName = `phu_luc_bang_sinh_vien_${sinh_vien_id}.xlsx`;
            const filePath = path.join(exportDir, fileName);

            await sinhVien.xlsx.writeFile(filePath);

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
            console.error("Lỗi khi xuất file Excel phụ lục bảng:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xuất file Excel phụ lục bảng",
                error: error.message
            });
        }
    }

    static async exportDocsPhuLucBang(req, res) {
        
        try {
            const { sinh_vien_id } = req.query;
        
            if (!sinh_vien_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin sinh viên"
                });
            }
        
            const docxBuffer = await ExcelPhuLucBangService.docxPhuLucBang(sinh_vien_id);
            const fileName = `phu_luc_bang_sinh_vien_${sinh_vien_id}.docx`;
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

    static async exportExcelBatch(req, res) {
        try {
            const { sinh_vien_ids } = req.body;
            if (!sinh_vien_ids || !Array.isArray(sinh_vien_ids) || sinh_vien_ids.length === 0) {
                return res.status(400).json({ success: false, message: "Danh sách sinh_vien_ids không hợp lệ" });
            }

            res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="phu_luc_bang_excel_batch.zip"'
            });

            const archive = archiver('zip', { zlib: { level: 9 } });
            
            archive.on('error', function(err) {
                console.error("Lỗi khi tạo file ZIP:", err);
                if (!res.headersSent) {
                    res.status(500).send({ error: err.message });
                }
            });

            archive.pipe(res);

            for (const id of sinh_vien_ids) {
                try {
                    const sinhVien = await ExcelPhuLucBangService.exportExcelPhuLucBang_v2(parseInt(id));
                    const buffer = await sinhVien.xlsx.writeBuffer();
                    archive.append(buffer, { name: `phu_luc_bang_sinh_vien_${id}.xlsx` });
                } catch (err) {
                    console.error(`Lỗi khi xử lý Excel tải hàng loạt cho sinh viên ${id}:`, err.message);
                }
            }

            await archive.finalize();

        } catch (error) {
            console.error("Lỗi khi tải hàng loạt file Excel:", error);
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: "Lỗi nội bộ server" });
            }
        }
    }

    static async exportDocsBatch(req, res) {
        try {
            const { sinh_vien_ids } = req.body;
            if (!sinh_vien_ids || !Array.isArray(sinh_vien_ids) || sinh_vien_ids.length === 0) {
                return res.status(400).json({ success: false, message: "Danh sách sinh_vien_ids không hợp lệ" });
            }

            res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="phu_luc_bang_word_batch.zip"'
            });

            const archive = archiver('zip', { zlib: { level: 9 } });
            
            archive.on('error', function(err) {
                console.error("Lỗi khi tạo file ZIP:", err);
                if (!res.headersSent) {
                    res.status(500).send({ error: err.message });
                }
            });

            archive.pipe(res);

            for (const id of sinh_vien_ids) {
                try {
                    const docxBuffer = await ExcelPhuLucBangService.docxPhuLucBang(parseInt(id));
                    archive.append(docxBuffer, { name: `phu_luc_bang_sinh_vien_${id}.docx` });
                } catch (err) {
                    console.error(`Lỗi khi xử lý Word tải hàng loạt cho sinh viên ${id}:`, err.message);
                }
            }

            await archive.finalize();

        } catch (error) {
            console.error("Lỗi khi tải hàng loạt file Word:", error);
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: "Lỗi nội bộ server" });
            }
        }
    }
}
module.exports = ExcelPhuLucBangController;