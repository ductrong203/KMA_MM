const db = require('./src/models');
const migration = require('./src/migrations/20260124210000-add-is-locked-to-thoi-khoa-bieu.js');

async function run() {
    try {
        console.log('Running migration...');
        const queryInterface = db.sequelize.getQueryInterface();
        await migration.up(queryInterface, db.Sequelize);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
