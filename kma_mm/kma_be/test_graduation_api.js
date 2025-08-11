const db = require('./src/models');

async function testGraduationAPI() {
  try {
    console.log('Testing graduation conditions API...');
    
    // Test models availability
    console.log('Available models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
    
    // Test specific models
    if (db.chung_chi && db.loai_chung_chi) {
      console.log('✓ Both chung_chi and loai_chung_chi models exist');
      
      // Test associations
      if (db.chung_chi.associations && db.chung_chi.associations.loaiChungChi) {
        console.log('✓ Association loaiChungChi exists in chung_chi model');
      } else {
        console.log('✗ Association loaiChungChi NOT found in chung_chi model');
        console.log('Available associations:', Object.keys(db.chung_chi.associations || {}));
      }
      
      // Test a simple query
      const sinhVienCount = await db.sinh_vien.count();
      console.log(`✓ sinh_vien count: ${sinhVienCount}`);
      
      const chungChiCount = await db.chung_chi.count();
      console.log(`✓ chung_chi count: ${chungChiCount}`);
      
      const loaiChungChiCount = await db.loai_chung_chi.count();
      console.log(`✓ loai_chung_chi count: ${loaiChungChiCount}`);
      
    } else {
      console.log('✗ Missing required models');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGraduationAPI();
