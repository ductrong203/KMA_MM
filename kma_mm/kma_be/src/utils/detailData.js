const models = require("../models");
const getFieldById = async (tableName, id, fieldName) => {
    try {
        const model = models[tableName.toLowerCase()];
        if (!model) throw new Error(`Model for table ${tableName} not found`);
        const record = await model.findByPk(id, {
            attributes: [fieldName],
            raw: true,
        })
        return record ? record[fieldName] : null;
    } catch (error) {
        return error.message;
    }
}

module.exports = {
    getFieldById,
    
}
//# func test
// func = async () => {
//     const Result = await getFieldById("users", 3, "username");
//     console.log("res: ", typeof Result);
// }
// func();
