var DataTypes = require("sequelize").DataTypes;
var _danh_muc_dao_tao = require("./danh_muc_dao_tao");
var _danh_muc_khen_ky_luat = require("./danh_muc_khen_ky_luat");
var _diem = require("./diem");
var _doi_tuong_quan_ly = require("./doi_tuong_quan_ly");
var _giang_vien = require("./giang_vien");
var _gradeSettings = require("./gradeSettings");
var _ke_hoach_mon_hoc = require("./ke_hoach_mon_hoc");
var _khen_thuong_ky_luat = require("./khen_thuong_ky_luat");
var _khoa_dao_tao = require("./khoa_dao_tao");
var _lop = require("./lop");
var _mon_hoc = require("./mon_hoc");
var _phong_ban = require("./phong_ban");
var _gradeSettings = require("./gradeSettings");
var _quyDoiDiem = require("./quyDoiDiem");
var _sequelizemeta = require("./sequelizemeta");
var _sinh_vien = require("./sinh_vien");
var _thoi_khoa_bieu = require("./thoi_khoa_bieu");
var _thong_tin_quan_nhan = require("./thong_tin_quan_nhan");
var _tot_nghiep = require("./tot_nghiep");
var _users = require("./users");

function initModels(sequelize) {
  var danh_muc_dao_tao = _danh_muc_dao_tao(sequelize, DataTypes);
  var danh_muc_khen_ky_luat = _danh_muc_khen_ky_luat(sequelize, DataTypes);
  var diem = _diem(sequelize, DataTypes);
  var doi_tuong_quan_ly = _doi_tuong_quan_ly(sequelize, DataTypes);
  var giang_vien = _giang_vien(sequelize, DataTypes);
  var QuyDinhDiem = _gradeSettings(sequelize, DataTypes);
  var QuyDoiDiem = _quyDoiDiem(sequelize, DataTypes);
  var ke_hoach_mon_hoc = _ke_hoach_mon_hoc(sequelize, DataTypes);
  var khen_thuong_ky_luat = _khen_thuong_ky_luat(sequelize, DataTypes);
  var khoa_dao_tao = _khoa_dao_tao(sequelize, DataTypes);
  var lop = _lop(sequelize, DataTypes);
  var mon_hoc = _mon_hoc(sequelize, DataTypes);
  var phong_ban = _phong_ban(sequelize, DataTypes);
  var sequelizemeta = _sequelizemeta(sequelize, DataTypes);
  var sinh_vien = _sinh_vien(sequelize, DataTypes);
  var thoi_khoa_bieu = _thoi_khoa_bieu(sequelize, DataTypes);
  var thong_tin_quan_nhan = _thong_tin_quan_nhan(sequelize, DataTypes);
  var tot_nghiep = _tot_nghiep(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var chung_chi = require("./chung_chi")(sequelize, DataTypes);
  var loai_chung_chi = require("./loai_chung_chi")(sequelize, DataTypes);

  khoa_dao_tao.belongsTo(danh_muc_dao_tao, { as: "he_dao_tao", foreignKey: "he_dao_tao_id" });
  danh_muc_dao_tao.hasMany(khoa_dao_tao, { as: "khoa_dao_taos", foreignKey: "he_dao_tao_id" });
  mon_hoc.belongsTo(danh_muc_dao_tao, { as: "he_dao_tao", foreignKey: "he_dao_tao_id" });
  danh_muc_dao_tao.hasMany(mon_hoc, { as: "mon_hocs", foreignKey: "he_dao_tao_id" });

  // Association for QuyDoiDiem
  QuyDoiDiem.belongsTo(danh_muc_dao_tao, { as: "he_dao_tao", foreignKey: "he_dao_tao_id" });
  danh_muc_dao_tao.hasMany(QuyDoiDiem, { as: "quy_doi_diems", foreignKey: "he_dao_tao_id" });

  khen_thuong_ky_luat.belongsTo(danh_muc_khen_ky_luat, { as: "danh_muc", foreignKey: "danh_muc_id" });
  danh_muc_khen_ky_luat.hasMany(khen_thuong_ky_luat, { as: "khen_thuong_ky_luats", foreignKey: "danh_muc_id" });
  sinh_vien.belongsTo(doi_tuong_quan_ly, { as: "doi_tuong", foreignKey: "doi_tuong_id" });
  doi_tuong_quan_ly.hasMany(sinh_vien, { as: "sinh_viens", foreignKey: "doi_tuong_id" });
  ke_hoach_mon_hoc.belongsTo(khoa_dao_tao, { as: "khoa_dao_tao", foreignKey: "khoa_dao_tao_id" });
  khoa_dao_tao.hasMany(ke_hoach_mon_hoc, { as: "ke_hoach_mon_hocs", foreignKey: "khoa_dao_tao_id" });
  lop.belongsTo(khoa_dao_tao, { as: "khoa_dao_tao", foreignKey: "khoa_dao_tao_id" });
  khoa_dao_tao.hasMany(lop, { as: "lops", foreignKey: "khoa_dao_tao_id" });
  sinh_vien.belongsTo(lop, { as: "lop", foreignKey: "lop_id" });
  lop.hasMany(sinh_vien, { as: "sinh_viens", foreignKey: "lop_id" });
  thoi_khoa_bieu.belongsTo(lop, { as: "lop", foreignKey: "lop_id" });
  lop.hasMany(thoi_khoa_bieu, { as: "thoi_khoa_bieus", foreignKey: "lop_id" });
  ke_hoach_mon_hoc.belongsTo(mon_hoc, { as: "mon_hoc", foreignKey: "mon_hoc_id" });
  mon_hoc.hasMany(ke_hoach_mon_hoc, { as: "ke_hoach_mon_hocs", foreignKey: "mon_hoc_id" });
  thoi_khoa_bieu.belongsTo(mon_hoc, { as: "mon_hoc", foreignKey: "mon_hoc_id" });
  mon_hoc.hasMany(thoi_khoa_bieu, { as: "thoi_khoa_bieus", foreignKey: "mon_hoc_id" });
  giang_vien.belongsTo(phong_ban, { as: "phong_ban", foreignKey: "phong_ban_id" });
  phong_ban.hasMany(giang_vien, { as: "giang_viens", foreignKey: "phong_ban_id" });
  diem.belongsTo(sinh_vien, { as: "sinh_vien", foreignKey: "sinh_vien_id" });
  sinh_vien.hasMany(diem, { as: "diems", foreignKey: "sinh_vien_id" });
  khen_thuong_ky_luat.belongsTo(sinh_vien, { as: "sinh_vien", foreignKey: "sinh_vien_id" });
  sinh_vien.hasMany(khen_thuong_ky_luat, { as: "khen_thuong_ky_luats", foreignKey: "sinh_vien_id" });
  thong_tin_quan_nhan.belongsTo(sinh_vien, { as: "sinh_vien", foreignKey: "sinh_vien_id" });
  sinh_vien.hasMany(thong_tin_quan_nhan, { as: "thong_tin_quan_nhans", foreignKey: "sinh_vien_id" });
  tot_nghiep.belongsTo(sinh_vien, { as: "sinh_vien", foreignKey: "sinh_vien_id" });
  sinh_vien.hasMany(tot_nghiep, { as: "tot_nghieps", foreignKey: "sinh_vien_id" });
  diem.belongsTo(thoi_khoa_bieu, { as: "thoi_khoa_bieu", foreignKey: "thoi_khoa_bieu_id" });
  thoi_khoa_bieu.hasMany(diem, { as: "diems", foreignKey: "thoi_khoa_bieu_id" });
  diem.belongsTo(QuyDinhDiem, { as: "quy_dinh_ck1", foreignKey: "quy_dinh_id_ck1" });
  diem.belongsTo(QuyDinhDiem, { as: "quy_dinh_ck2", foreignKey: "quy_dinh_id_ck2" });

  // Associations for tot_nghiep
  tot_nghiep.belongsTo(lop, { as: "lop", foreignKey: "lop_id" });
  lop.hasMany(tot_nghiep, { as: "tot_nghieps", foreignKey: "lop_id" });
  tot_nghiep.belongsTo(khoa_dao_tao, { as: "khoa_dao_tao", foreignKey: "khoa_dao_tao_id" });
  khoa_dao_tao.hasMany(tot_nghiep, { as: "tot_nghieps", foreignKey: "khoa_dao_tao_id" });
  tot_nghiep.belongsTo(danh_muc_dao_tao, { as: "he_dao_tao", foreignKey: "he_dao_tao_id" });
  danh_muc_dao_tao.hasMany(tot_nghiep, { as: "tot_nghieps", foreignKey: "he_dao_tao_id" });

  // Associations for chung_chi
  chung_chi.belongsTo(sinh_vien, { as: "sinh_vien", foreignKey: "sinh_vien_id" });
  sinh_vien.hasMany(chung_chi, { as: "chung_chis", foreignKey: "sinh_vien_id" });
  chung_chi.belongsTo(loai_chung_chi, { as: "loai_chung_chi_detail", foreignKey: "loai_chung_chi_id" });
  loai_chung_chi.hasMany(chung_chi, { as: "chung_chis", foreignKey: "loai_chung_chi_id" });

  return {
    danh_muc_dao_tao,
    danh_muc_khen_ky_luat,
    diem,
    doi_tuong_quan_ly,
    giang_vien,
    ke_hoach_mon_hoc,
    khen_thuong_ky_luat,
    khoa_dao_tao,
    lop,
    mon_hoc,
    phong_ban,
    QuyDinhDiem,
    QuyDoiDiem,
    sequelizemeta,
    sinh_vien,
    thoi_khoa_bieu,
    thong_tin_quan_nhan,
    tot_nghiep,
    users,
    chung_chi,
    loai_chung_chi,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
