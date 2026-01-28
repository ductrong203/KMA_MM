const express = require('express');
const router = express.Router();
const ThoiKhoaBieuController = require('../controllers/thoiKhoaBieuController');

router.get('/get-approval-list', ThoiKhoaBieuController.getApprovalList);
router.get('/filter', ThoiKhoaBieuController.filter);
router.get('/filterbyid', ThoiKhoaBieuController.filterbyid);
router.get('/getbypage', ThoiKhoaBieuController.getByPage);
router.get('/missing/:khoa_dao_tao_id/:ky_hoc?', ThoiKhoaBieuController.getMissingMonHocInKeHoach);
router.post('/createall', ThoiKhoaBieuController.createAll);
router.get('/', ThoiKhoaBieuController.getAll);
router.get('/:id', ThoiKhoaBieuController.getById);

// Route lấy danh sách cần duyệt (cho role duyetDiem)
router.get('/get-approval-list', ThoiKhoaBieuController.getApprovalList);

router.post('/', ThoiKhoaBieuController.create);
router.put('/:id', ThoiKhoaBieuController.update);
router.delete('/:id', ThoiKhoaBieuController.delete);

module.exports = router;
