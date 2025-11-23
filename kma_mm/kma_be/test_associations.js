const db = require('./src/models');

async function testAssociations() {
  try {
    console.log('Testing model associations...');
    
    // Test sinh_vien model
    if (db.sinh_vien) {
      console.log('✓ sinh_vien model exists');
      console.log('sinh_vien associations:', Object.keys(db.sinh_vien.associations || {}));
    }
    
    // Test doi_tuong_quan_ly model
    if (db.doi_tuong_quan_ly) {
      console.log('✓ doi_tuong_quan_ly model exists');
      console.log('doi_tuong_quan_ly associations:', Object.keys(db.doi_tuong_quan_ly.associations || {}));
    }
    
    // Test simple query without associations
    const sinhVienCount = await db.sinh_vien.count();
    console.log(`✓ sinh_vien count: ${sinhVienCount}`);
    
    // Test with a simple find
    const sinhVien = await db.sinh_vien.findByPk(1);
    if (sinhVien) {
      console.log('✓ Found sinh_vien:', {
        id: sinhVien.id,
        ma_sinh_vien: sinhVien.ma_sinh_vien,
        ho_dem: sinhVien.ho_dem,
        ten: sinhVien.ten
      });
    }
    
    console.log('Basic test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAssociations();
