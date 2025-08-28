const DiemService = require("../services/diemService");
const {logActivity} = require("../services/activityLogService");
const { getFieldById } = require("../utils/detailData");
const {users} = require("../models");
const {getDiffData} = require("../utils/getDiffData");
const { verifyAccessToken } = require("../utils/decodedToken");
const mapRole = {
        1: "daoTao",
        2: "khaoThi",
        3: "quanLiSinhVien",
        5: "giamDoc",
        6: "sinhVien",
        7: "admin"

};
const logDiem =  ( async (oldDataRaw, newData) =>  {
    try {
      const dataArray = Array.isArray(newData) ? newData : [newData];
      // console.log("###", oldData)
      let changedStudents = [];
      let extraData = {};
      if (dataArray.length > 0) {
        // Lấy thông tin chung
        let thoiKhoaBieuId = dataArray[0].thoi_khoa_bieu_id;

        let kyHoc = await getFieldById("thoi_khoa_bieu", thoiKhoaBieuId, "ky_hoc");
        let monHocId = await getFieldById("thoi_khoa_bieu", thoiKhoaBieuId, "mon_hoc_id");
        let monHoc = await getFieldById("mon_hoc", monHocId, "ten_mon_hoc");
        
        // Lấy thông tin lớp (nếu có thoi_khoa_bieu_id)
        let lop = "";
        if (thoiKhoaBieuId) {
          let lopId = await getFieldById("thoi_khoa_bieu", thoiKhoaBieuId, "lop_id");
          if (lopId) {
            lop = await getFieldById("lop", lopId, "ma_lop");
          }
        }

        // Xử lý chi tiết từng sinh viên
        
        for (let item of dataArray) {
          // console.log("item", item);
          let maSinhVien = await getFieldById("sinh_vien", item.sinh_vien_id, "ma_sinh_vien");
          let hoDem = await getFieldById("sinh_vien", item.sinh_vien_id, "ho_dem");
          let ten = await getFieldById("sinh_vien", item.sinh_vien_id, "ten");
          
          const oldData = oldDataRaw[item.id] || {};
          const changes = {};
          
          // console.log("!!!!!", item);
          // So sánh các trường điểm
          Object.keys(item.dataValues).forEach(field => {
            // console.log("field", field)
            if (item.dataValues[field] !== undefined && item.dataValues[field] !== oldData[field] && field !== "diem_gk") {
                changes[field] = {
                old: oldData[field] || null,
                new: item.dataValues[field]
            };
            console.log(field, "changes",changes[field]);
            }
          });
        //   console.log("###", changes);
          if (Object.keys(changes).length > 0) {
            changedStudents.push({
              ma_sinh_vien: maSinhVien,
              ho_dem: hoDem,
              ten: ten,
              changes: changes
            });
          }
        }

        // Tạo extra_data
        extraData = {
          course: monHoc,
          semester: kyHoc,
          ...(lop && { class: lop }),
          total_students: changedStudents.length,
          changed_students: changedStudents
        };
      }
      return extraData;

    } catch (error) {
      console.error("Lỗi đây ní ơi kìa ní:", error.message);
      return {message: error.message};
    }

});

module.exports=  {logDiem};