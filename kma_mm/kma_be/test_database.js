const db = require('./src/models');

async function testDatabase() {
  try {
    console.log('Testing database connection and data...');
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✓ Database connection successful');
    
    // Check tables exist
    const tables = await db.sequelize.getQueryInterface().showAllTables();
    console.log('Available tables:', tables.slice(0, 10)); // Show first 10 tables
    
    // Test sinh_vien count
    const sinhVienCount = await db.sinh_vien.count();
    console.log(`✓ Total sinh_vien records: ${sinhVienCount}`);
    
    if (sinhVienCount > 0) {
      // Get first few sinh_vien records
      const sinhViens = await db.sinh_vien.findAll({
        limit: 5,
        attributes: ['id', 'ma_sinh_vien', 'ho_dem', 'ten', 'tong_tin_chi']
      });
      
      console.log('First 5 sinh_vien records:');
      sinhViens.forEach(sv => {
        console.log(`- ID: ${sv.id}, Mã: ${sv.ma_sinh_vien}, Tên: ${sv.ho_dem} ${sv.ten}, Tín chỉ: ${sv.tong_tin_chi}`);
      });
      
      // Test chung_chi count
      const chungChiCount = await db.chung_chi.count();
      console.log(`✓ Total chung_chi records: ${chungChiCount}`);
      
      // Test loai_chung_chi count
      const loaiChungChiCount = await db.loai_chung_chi.count();
      console.log(`✓ Total loai_chung_chi records: ${loaiChungChiCount}`);
      
      // Test graduation condition for first student
      if (sinhViens.length > 0) {
        const firstStudentId = sinhViens[0].id;
        console.log(`\nTesting graduation check for student ID: ${firstStudentId}`);
        
        const SinhVienService = require('./src/services/studentService');
        const result = await SinhVienService.checkGraduationConditions(firstStudentId);
        console.log('✓ Graduation check result:', {
          sinh_vien_id: result.sinh_vien_id,
          ma_sinh_vien: result.ma_sinh_vien,
          ho_ten: result.ho_ten,
          tong_tin_chi: result.tong_tin_chi,
          du_dieu_kien: result.dieu_kien_tot_nghiep.du_dieu_kien
        });
      }
    } else {
      console.log('⚠️ No sinh_vien records found in database');
    }
    
    console.log('\nDatabase test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDatabase();
