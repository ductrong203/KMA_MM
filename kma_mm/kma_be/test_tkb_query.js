const { thoi_khoa_bieu, lop, mon_hoc } = require('./src/models');
const ThoiKhoaBieuService = require('./src/services/thoiKhoaBieuService');

async function check() {
    try {
        console.log("Checking TKB for lop_id 31...");
        const tkbList = await thoi_khoa_bieu.findAll({
            where: { lop_id: 31 },
            include: [
                {
                    model: lop,
                    as: 'lop',
                    attributes: ['id', 'ma_lop']
                },
                {
                    model: mon_hoc,
                    as: 'mon_hoc',
                    attributes: ['id', 'ten_mon_hoc', 'ma_mon_hoc', 'so_tin_chi'] // Include fields to check what exists
                }
            ]
        });
        console.log(`Found ${tkbList.length} records for lop_id 31.`);
        if (tkbList.length > 0) {
            console.log("Sample record:", JSON.stringify(tkbList[0], null, 2));

            // Check for Semester 1
            const sem1 = tkbList.filter(t => t.ky_hoc == 1);
            console.log(`Found ${sem1.length} records for Semester 1.`);
            if (sem1.length > 0) {
                console.log("Sample ID:", sem1[0].id);
            }
        } else {
            console.log("No TKB found. Checking if lop 31 exists...");
            const lopRec = await lop.findByPk(31);
            console.log("Lop 31:", lopRec ? lopRec.toJSON() : "Not found");
        }

    } catch (error) {
        console.error(error);
    }
}

check();
