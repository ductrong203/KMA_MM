const { sequelize } = require('./models');
const initModels = require('./models/init-models');

async function run() {
  try {
    const models = initModels(sequelize);
    console.log("Starting batch update for sinh_vien based on tot_nghiep records...");

    // Find all tot_nghiep records with trang_thai = 'da_duyet'
    const graduates = await models.tot_nghiep.findAll({
      attributes: ['sinh_vien_id'],
      where: {
        trang_thai: 'da_duyet'
      }
    });

    const svIds = graduates.map(g => g.sinh_vien_id);
    console.log(`Found ${svIds.length} graduated students. Updating sinh_vien table...`);

    if (svIds.length > 0) {
      const [updatedRows] = await models.sinh_vien.update(
        { dang_hoc: 4 },
        {
          where: {
            id: svIds
          }
        }
      );
      console.log(`Successfully updated ${updatedRows} students to dang_hoc=4 (Tốt nghiệp).`);
    } else {
      console.log("No graduated students found. No updates needed.");
    }
    
    // Check if there are any students with dang_hoc = 0 and what to do with them.
    // Since dang_hoc is now 1,2,3,4,5, any remaining 0s should probably be 1 if they are not dropped out or graduated.
    // But the user didn't ask to convert 0 to 1 explicitly for everyone, only "Nhớ làm cho sinh viên thôi học dang_hoc = 3, những sinh viên có trong bảng tot_nghiep dang_hoc = 4"
    // Wait, in StudentManagement we see dang_hoc: false which maps to 0. Let's just update the graduates for now.

    console.log("Done.");
  } catch (err) {
    console.error("Error during sync:", err);
  } finally {
    process.exit(0);
  }
}

run();
