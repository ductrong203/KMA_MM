const mapRole = {
        1: "daoTao",
        2: "khaoThi",
        3: "quanLiSinhVien",
        4: "quanLiThuVien",
        5: "giamDoc",
        6: "sinhVien",
        7: "admin"

      }
const {formatDate} = require("../utils/formatDate");

const  getDiffData =  (oldData, newData) => {
        const change = [];
        for (let key in newData) {
            newData[key] = newData[key] === null ? "": newData[key]; 
            oldData[key] = oldData[key] === null ? "": oldData[key]; 
            if (key.includes("create") || key.includes("update")) continue;

            if (oldData[key] !== newData[key]) {
                console.log("oldData", oldData[key]);
                console.log("newData", newData[key]);

                if (key.includes("ngay_")){
                    oldData[key] = formatDate(oldData[key]);
                    newData[key] = formatDate(newData[key]);
                }

                if (key.includes("thuoc_khoa")) {
                        oldData[key] = oldData[key] == 0 ? " phòng ban ": " khoa ";
                        newData[key] = newData[key] == 0 ? " phòng ban ": " khoa ";
                        change.push(`chuyển từ ${oldData[key]} => ${newData[key]}`);
                        continue;

                }
                if (key === "role" || key === "Role") {
                    oldData[key] = mapRole[oldData[key]];
                    newData[key] = mapRole[newData[key]];
                }
                if (key==="trang_thai") {
                    oldData[key] = oldData[key] == 1 ? "hoạt động": "không hoạt động";
                    newData[key] = newData[key] == 1 ? "hoạt động": "không hoạt động";
                }

                change.push(`${key}: ${oldData[key]} => ${newData[key]}`);

            }
        }
        return change.length >0 ? change.join(" , "): "";
}
module.exports = {getDiffData};