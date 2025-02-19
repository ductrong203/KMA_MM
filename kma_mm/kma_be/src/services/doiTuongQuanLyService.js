const {doi_tuong_quan_ly} = require("../models");

class DoiTuongQuanLyService {
    static async createDoiTuongQuanLy(data){
        try {
            return await doi_tuong_quan_ly.create(data);
        } catch (e) {
            throw new Error(e.message);
        }
    }

    static async getAllDoiTuongQuanLy(){
        return await doi_tuong_quan_ly.findAll();
    }

    static async getDoiTuongQuanLyById(id){
        return await doi_tuong_quan_ly.findByPk(id);
    }

    static async updateDoiTuongQuanLy(id, data){
        const doiTuongQuanLy = await doi_tuong_quan_ly.findByPk(id);
        if(!doiTuongQuanLy) return null;
        return await doiTuongQuanLy.update(data);
    }

    static async deleteDoiTuongQuanLy(id){
        const doiTuongQuanLy = await doi_tuong_quan_ly.findByPk(id);
        if(!doiTuongQuanLy) return null;
        await doiTuongQuanLy.destroy();
        return doiTuongQuanLy;
    }
}
module.exports = DoiTuongQuanLyService;