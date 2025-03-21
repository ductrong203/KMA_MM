const { mon_hoc } = require("../models");

const createMonHoc = async (monHoc) => {
    console.log(monHoc);
    try {
        // Kiểm tra xem giảng viên đã tồn tại chưa
        const checkMonHoc = await mon_hoc.findOne({ where: { ma_mon_hoc: monHoc.ma_mon_hoc } });
        if (checkMonHoc) {
            throw new Error("Môn học đã tồn tại!");
        }

        // Tạo đối tượng giảng viên để lưu vào DB
        const monHocData = {
            ma_mon_hoc: monHoc.ma_mon_hoc,
            ten_mon_hoc: monHoc.ten_mon_hoc,
            so_tin_chi: monHoc.so_tin_chi,
            tinh_diem: monHoc.tinh_diem,
            ghi_chu: monHoc.ghi_chu
        };


        // Tạo giảng viên trong DB
        const createdMonHoc = await mon_hoc.create(monHocData);

        console.log(createdMonHoc);
        return {
            status: "OK",
            message: "Success!",
            data: createdMonHoc,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getMonHoc = async () => {

    try {
        return await mon_hoc.findAll()

    } catch (error) {
        throw new Error(error.message);
    }
};

const updateMonHoc = async (id, monHoc) => {
    console.log(monHoc)
    try {
        // Kiểm tra xem giảng viên đã tồn tại chưa
        const checkMonHoc = await mon_hoc.findOne({ where: { id: id } });
        if (!checkMonHoc) {
            throw new Error("Không tìm thấy môn học");
        }


        const monHocData = {
            ma_mon_hoc: monHoc.ma_mon_hoc,
            ten_mon_hoc: monHoc.ten_mon_hoc,
            so_tin_chi: monHoc.so_tin_chi,
            tinh_diem: monHoc.tinh_diem,
            ghi_chu: monHoc.ghi_chu
        };

      
        // Cập nhật giảng viên trong DB
        await mon_hoc.update(
            monHocData,
            {
                where: { id: id }
            }
        );

        // Lấy thông tin giảng viên sau khi cập nhật
        const updatedMonHoc = await mon_hoc.findOne({
            where: { id: id }
        });
        return {
            status: "OK",
            message: "Success!",
            data: updatedMonHoc,
        };
    } catch (error) {
        console.error("Lỗi cập nhật:", error.message);
        throw new Error(error.message);
    }
};

module.exports = {
    createMonHoc,
    getMonHoc,
    updateMonHoc
};

