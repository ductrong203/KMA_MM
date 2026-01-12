const { getFieldById } = require("./detailData");
const logDiem = (async (oldDataRaw, newData) => {
  try {
    const dataArray = Array.isArray(newData) ? newData : [newData];
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

        // So sánh các trường điểm
        Object.keys(item.dataValues).forEach(field => {
          if (item.dataValues[field] !== undefined && item.dataValues[field] !== oldData[field] && field !== "diem_gk") {
            changes[field] = {
              old: oldData[field] || null,
              new: item.dataValues[field]
            };
          }
        });
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
    console.error("Lỗi đây ní ơi kìa ní log diem:", error.message);
    return { message: error.message };
  }

});
const extraChangeQuanLyDoAn = (async (oldDataRaw, newData, maLop) => {
  try {
    const dataArray = Array.isArray(newData) ? newData : [newData];
    let changedStudents = [];
    let extraData = {};
    if (dataArray.length > 0) {
      // Xử lý chi tiết từng sinh viên
      for (let i = 0; i <= dataArray.length - 1; i++) {
        let maSinhVien = dataArray[i].ma_sinh_vien;
        let hoDem = dataArray[i].ho_dem;
        let ten = dataArray[i].ten;

        const oldData = oldDataRaw.find(sv => sv.id === dataArray[i].id);

        const changes = {};

        // So sánh các trường điểm
        Object.keys(dataArray[i]).forEach(field => {
          if (dataArray[i].id === oldData.id && dataArray[i][field] !== oldData[field] && field !== "thi_tot_nghiep") {
            changes[field] = {
              old: oldData[field] ? "có" : "không",
              new: dataArray[i][field] ? "có" : "không"
            };
          }
        });
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
        class: maLop,
        total_students: changedStudents.length,
        changed_students: changedStudents
      };
    }
    return extraData;

  } catch (error) {
    console.error("Lỗi đây ní ơi kìa ní log diem:", error.message);
    return { message: error.message };
  }

});

const extraDanhSachTotNghiep = (async (data, maLop, maKhoa) => {
  try {
    const dataArray = Array.isArray(data) ? data : [data];
    let changedStudents = [];
    let extraData = {};
    const changes = {};
    if (dataArray.length > 0) {
      // Xử lý chi tiết từng sinh viên
      for (let i = 0; i <= dataArray.length - 1; i++) {
        // console.log("item", item);
        let sinhVienId = dataArray[i].sinh_vien_id;
        let maSinhVien = await getFieldById("sinh_vien", sinhVienId, "ma_sinh_vien");
        let hoDem = await getFieldById("sinh_vien", sinhVienId, "ho_dem");
        let ten = await getFieldById("sinh_vien", sinhVienId, "ten");
        changedStudents.push({
          ma_sinh_vien: maSinhVien,
          ho_dem: hoDem,
          ten: ten,
          changes: {},
        });

      }

      // Tạo extra_data
      extraData = {
        class: maLop,
        training_course: maKhoa,
        total_students: changedStudents.length,
        changed_students: changedStudents
      };
    }
    return extraData;

  } catch (error) {
    console.error("Lỗi đây ní ơi kìa ní log diem:", error.message);
    return { message: error.message };
  }

});

module.exports = {
  logDiem,
  extraChangeQuanLyDoAn,
  extraDanhSachTotNghiep
};