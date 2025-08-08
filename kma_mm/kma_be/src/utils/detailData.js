const models = require("../models");
const { phong_ban } = require("../models");
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

const getChucVuDiaDiem = async (laGiangVienMoi, thuocKhoa, maPhongBan) => {
      var chucVu = "Chưa có chức vụ. ";
      var diaDiem = "Chưa thuộc khoa (phòng ban) nào."
      if (laGiangVienMoi===1 && thuocKhoa === null ) {
          chucVu = ` Giảng viên mời `;
      }
      else if (maPhongBan !== "" || maPhongBan){
        
        const  khoa =   await phong_ban.findAll({ where: { ma_phong_ban: maPhongBan }});

        if (laGiangVienMoi===0 && thuocKhoa===false || thuocKhoa ===0) {
          chucVu= `Nhân viên ` ;
          diaDiem = `thuộc phòng ban ${khoa[0].ten_phong_ban}`;
      }
      else if (laGiangVienMoi ===1  && thuocKhoa === false || thuocKhoa ===0) {
          chucVu= `Giảng viên mời `;
          diaDiem = ` ở thuộc phòng ban ${khoa[0].ten_phong_ban}`;
      }
      else if (laGiangVienMoi===0 && thuocKhoa ===true || thuocKhoa ===1) {
          chucVu = `Giảng viên cơ hữu  ` ;
          diaDiem = ` thuộc khoa ${khoa[0].ten_phong_ban} `;
      }
      else if (laGiangVienMoi===1 && thuocKhoa ===true || thuocKhoa ===1) {
          chucVu = `Giảng viên mời ` ;
          diaDiem = ` thuộc khoa ${khoa[0].ten_phong_ban}`;
      }
      }
   return [chucVu, diaDiem];
} 

module.exports = {
    getFieldById,
    getChucVuDiaDiem,

}
//# func test

// func = async () => {
//     const res = await getChucVuDiaDiem(1, false, "PB01");
//     console.log(res);
// }
// func();
// func = async () => {
//     const Result = await getFieldById("users", 3, "username");
//     console.log("res: ", typeof Result);
// }
// func();
