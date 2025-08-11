const ChungChiService = require('./src/services/chungChiService');

async function testTaoChungChi() {
  try {
    console.log('Testing ChungChiService.taoChungChi...');
    
    // Test data - điều chỉnh theo dữ liệu thật trong database
    const testData = {
      ma_sinh_vien: 'SV001', // Cần có sinh viên này trong database
      diem_trung_binh: 8.5,
      xep_loai: 'Giỏi',
      ghi_chu: 'Test chứng chỉ',
      so_quyet_dinh: 'QD001',
      loai_chung_chi: 'Chứng chỉ Tin học', // Test với tên loại chứng chỉ
      ngay_ky_quyet_dinh: '2025-01-20',
      tinh_trang: 'bình thường'
    };
    
    const result = await ChungChiService.taoChungChi(testData);
    console.log('SUCCESS: Tạo chứng chỉ thành công!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Chỉ test import và khởi tạo model
async function testModelImport() {
  try {
    const db = require('./src/models');
    console.log('Available models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
    
    if (db.loai_chung_chi) {
      console.log('✓ loai_chung_chi model imported successfully');
      console.log('✓ findOne method available:', typeof db.loai_chung_chi.findOne === 'function');
    } else {
      console.log('✗ loai_chung_chi model not found');
    }
    
  } catch (error) {
    console.error('Model import error:', error.message);
  }
}

// Chạy test model import trước
testModelImport();
