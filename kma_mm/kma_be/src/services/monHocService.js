const { mon_hoc, danh_muc_dao_tao } = require("../models");

const createMonHoc = async (monHoc) => {
    console.log(monHoc);
    try {
        const createdMonHocs = [];

        // Lặp qua từng he_dao_tao_id trong curriculumIds để tạo bản ghi riêng
        for (const heDaoTaoId of monHoc.curriculumIds || []) {
            // Kiểm tra xem môn học với mã và hệ đào tạo này đã tồn tại chưa
            const checkMonHoc = await mon_hoc.findOne({ 
                where: { 
                    ma_mon_hoc: monHoc.ma_mon_hoc, 
                    he_dao_tao_id: heDaoTaoId 
                } 
            });
            if (checkMonHoc) {
                throw new Error(`Môn học với mã ${monHoc.ma_mon_hoc} đã tồn tại trong hệ đào tạo ${heDaoTaoId}!`);
            }

            // Tạo dữ liệu môn học cho từng he_dao_tao_id
            const monHocData = {
                ma_mon_hoc: monHoc.ma_mon_hoc,
                ten_mon_hoc: monHoc.ten_mon_hoc,
                so_tin_chi: monHoc.so_tin_chi,
                tinh_diem: monHoc.tinh_diem,
                ghi_chu: monHoc.ghi_chu,
                he_dao_tao_id: heDaoTaoId // Chỉ lưu một he_dao_tao_id cho mỗi bản ghi
            };

            // Tạo bản ghi trong DB
            const createdMonHoc = await mon_hoc.create(monHocData);
            createdMonHocs.push(createdMonHoc);
        }

        return {
            status: "OK",
            message: "Success!",
            data: createdMonHocs, // Trả về danh sách các bản ghi đã tạo
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getMonHoc = async () => {
    try {
        // Lấy tất cả môn học
        const monHocList = await mon_hoc.findAll();
        return monHocList;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateMonHoc = async (id, monHoc) => {
    console.log(monHoc);
    try {
        // Kiểm tra xem môn học có tồn tại không
        const checkMonHoc = await mon_hoc.findOne({ where: { id: id } });
        if (!checkMonHoc) {
            throw new Error("Không tìm thấy môn học");
        }

        // Dữ liệu môn học để cập nhật
        const monHocData = {
            ma_mon_hoc: monHoc.ma_mon_hoc,
            ten_mon_hoc: monHoc.ten_mon_hoc,
            so_tin_chi: monHoc.so_tin_chi,
            tinh_diem: monHoc.tinh_diem,
            ghi_chu: monHoc.ghi_chu,
            he_dao_tao_id: monHoc.curriculumIds[0] // Chỉ cập nhật một he_dao_tao_id cho bản ghi này
        };

        // Cập nhật môn học trong DB
        await mon_hoc.update(monHocData, {
            where: { id: id }
        });

        // Lấy thông tin môn học sau khi cập nhật
        const updatedMonHoc = await mon_hoc.findOne({
            where: { id: id }
        });

        // Nếu có thêm curriculumIds mới, tạo bản ghi mới
        const additionalCurriculumIds = monHoc.curriculumIds.slice(1); // Lấy các he_dao_tao_id còn lại
        for (const heDaoTaoId of additionalCurriculumIds) {
            const checkExisting = await mon_hoc.findOne({
                where: { ma_mon_hoc: monHoc.ma_mon_hoc, he_dao_tao_id: heDaoTaoId }
            });
            if (!checkExisting) {
                await mon_hoc.create({
                    ma_mon_hoc: monHoc.ma_mon_hoc,
                    ten_mon_hoc: monHoc.ten_mon_hoc,
                    so_tin_chi: monHoc.so_tin_chi,
                    tinh_diem: monHoc.tinh_diem,
                    ghi_chu: monHoc.ghi_chu,
                    he_dao_tao_id: heDaoTaoId
                });
            }
        }

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

const getMonHocByIds = async (ids) => {
    try {
        // Chuyển chuỗi ids thành mảng
        const idArray = ids.split(',').map(id => id.trim());

        // Tìm các môn học theo danh sách ID
        const monHocList = await mon_hoc.findAll({
            where: {
                id: idArray
            }
        });

        if (!monHocList || monHocList.length === 0) {
            throw new Error("Không tìm thấy môn học nào với các ID đã cung cấp");
        }

        return {
            status: "OK",
            message: "Success!",
            data: monHocList,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};


const fetchSubjectsByTrainingId = async (id) => {
    try {
      // Kiểm tra xem hệ đào tạo có tồn tại không
      const training = await danh_muc_dao_tao.findOne({ 
        where: { id: id }
      });
      
      if (!training) {
        return {
          status: "ERR",
          message: "Training system not found!"
        };
      }
  
      // Lấy danh sách môn học theo mã hệ đào tạo
      return await mon_hoc.findAll({
        where: { 
          he_dao_tao_id: id 
        }
      });
  
  
    } catch (error) {
      throw new Error(error.message);
    }
  };

module.exports = {
    createMonHoc,
    getMonHoc,
    updateMonHoc,
    getMonHocByIds,
    fetchSubjectsByTrainingId
};