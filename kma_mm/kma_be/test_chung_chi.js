const db = require('./src/models');
const ChungChiService = require('./src/services/chungChiService');

async function testLoaiChungChi() {
  try {
    console.log('Testing loai_chung_chi model...');
    
    // Test xem model có tồn tại không
    console.log('loai_chung_chi model:', db.loai_chung_chi ? 'EXISTS' : 'NOT FOUND');
    
    if (db.loai_chung_chi) {
      // Test findOne function
      console.log('Testing findOne function...');
      const testRecord = await db.loai_chung_chi.findOne({
        where: { ten_loai_chung_chi: 'test' }
      });
      console.log('findOne test passed:', testRecord === null ? 'SUCCESS (no record found)' : 'SUCCESS (record found)');
    }
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLoaiChungChi();
