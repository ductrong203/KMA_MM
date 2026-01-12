const { sequelize } = require('../models');
const initModels = require('../models/init-models');
const models = initModels(sequelize);
const { QuyDoiDiem } = models;

const getConversionRules = async (req, res) => {
    try {
        const { he_dao_tao_id } = req.query;

        if (!he_dao_tao_id) {
            return res.status(400).json({ success: false, message: 'Thiếu he_dao_tao_id' });
        }

        const rules = await QuyDoiDiem.findAll({
            where: { he_dao_tao_id },
            order: [['diem_min', 'DESC']] // Sort by highest score first
        });

        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        console.error('Error fetching conversion rules:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy quy tắc chuyển đổi' });
    }
};

const createConversionRule = async (req, res) => {
    try {
        const { he_dao_tao_id, diem_min, diem_max, diem_he_4, diem_chu, xep_loai } = req.body;

        if (!he_dao_tao_id || diem_min === undefined || diem_max === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        const newRule = await QuyDoiDiem.create({
            heDaoTaoId: he_dao_tao_id,
            diemMin: diem_min,
            diemMax: diem_max,
            diemHe4: diem_he_4,
            diemChu: diem_chu,
            xepLoai: xep_loai
        });

        res.json({
            success: true,
            data: newRule,
            message: 'Tạo quy tắc thành công'
        });
    } catch (error) {
        console.error('Error creating conversion rule:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo quy tắc' });
    }
};

const updateConversionRule = async (req, res) => {
    try {
        const { id } = req.params;
        const { diem_min, diem_max, diem_he_4, diem_chu, xep_loai } = req.body;

        const rule = await QuyDoiDiem.findByPk(id);
        if (!rule) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy quy tắc' });
        }

        await rule.update({
            diemMin: diem_min,
            diemMax: diem_max,
            diemHe4: diem_he_4,
            diemChu: diem_chu,
            xepLoai: xep_loai
        });

        res.json({
            success: true,
            data: rule,
            message: 'Cập nhật quy tắc thành công'
        });
    } catch (error) {
        console.error('Error updating conversion rule:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật quy tắc' });
    }
};

const deleteConversionRule = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await QuyDoiDiem.destroy({ where: { id } });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy quy tắc' });
        }

        res.json({
            success: true,
            message: 'Xóa quy tắc thành công'
        });
    } catch (error) {
        console.error('Error deleting conversion rule:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa quy tắc' });
    }
};

module.exports = {
    getConversionRules,
    createConversionRule,
    updateConversionRule,
    deleteConversionRule
};
