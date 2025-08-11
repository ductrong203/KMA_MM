const db = require('./src/models');

async function testAPI() {
  try {
    console.log('Testing models...');
    
    // Test models availability
    console.log('Available models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
    
    // Test loai_chung_chi model
    if (db.loai_chung_chi) {
      console.log('✓ loai_chung_chi model exists');
      console.log('✓ findAll method:', typeof db.loai_chung_chi.findAll === 'function');
      
      // Test a simple query
      const count = await db.loai_chung_chi.count();
      console.log('✓ loai_chung_chi records count:', count);
    } else {
      console.log('✗ loai_chung_chi model missing');
    }
    
    // Test chung_chi model
    if (db.chung_chi) {
      console.log('✓ chung_chi model exists');
      console.log('✓ findAll method:', typeof db.chung_chi.findAll === 'function');
      
      // Test associations
      if (db.chung_chi.associations) {
        console.log('✓ chung_chi associations:', Object.keys(db.chung_chi.associations));
      } else {
        console.log('✗ chung_chi has no associations');
      }
    } else {
      console.log('✗ chung_chi model missing');
    }
    
    console.log('Models test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();
