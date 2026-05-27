const statisticRouter = require("./statistic");
const authRouter = require("./auth");
const examRouter = require("./exam");
const libraryRouter = require("./library");
const studentRouter = require("./student");
const teacherRouter = require("./giangVien");
const lopRouter = require("./lop");
const scheduleRouter = require("./schedule");
const trainingRouter = require("./training");

const doiTuongQuanLyRouter = require("./doiTuongQuanLy");
const thongTinQuanNhanRouter = require("./thongTinQuanNhan");
const danhMucKhenKyLuatRouter = require("./danhMucKhenKyLuat");
const khenThuongKyLuatRouter = require("./khenThuongKyLuat");

const phongBanRouter = require("./phongBan");
const giangVienRouter = require("./giangVien");
const khoaDaoTaoRouter = require("./khoaDaoTao");
const monHocRouter = require("./monHoc");


//const monHocRouter = require("./monHoc");




const keHoachMonHocRouter = require("./keHoachMonHoc");
const thoiKhoaBieuRoute = require('./thoiKhoaBieu');
const diemRoute = require('./diem');
const excelRoute = require('./excel');
const excelPhuLucBangRoute = require('./excelPhuLucBang');
const chungChiRoute = require('./chungChi');
const loaiChungChiRoute = require('./loaiChungChi');
const chuongTrinhDaoTaoRoute = require('./chuongTrinhDaoTao');
const exportExcelRoute = require('./exportExcel');
const exportDocx = require('./exportDocx');
const totNghiepRoute = require('./totNghiep');
const gradeSettingsRoute = require('./gradeSettingsRoutes');
const conversionRoute = require('./conversionRoutes');
// const logActivity = require("../middelWare/logger");

// const docsPhuLucBangRoute = require('./docsPhuLucBang');

const { authRequired } = require("../middelWare/authMiddelWare");

const routes = (app) => {
  // app.use(logActivity);

  app.use("/auth", authRouter);
  app.use("/lop", authRequired, lopRouter);
  //app.use()
  app.use("/training", authRequired, trainingRouter);

  app.use("/student", authRequired, studentRouter);
  app.use("/doituongquanly", authRequired, doiTuongQuanLyRouter);
  app.use("/danhmuckhenkyluat", authRequired, danhMucKhenKyLuatRouter);
  app.use("/khenthuongkyluat", authRequired, khenThuongKyLuatRouter);
  app.use("/thongtinquannhan", authRequired, thongTinQuanNhanRouter);

  app.use("/phong-ban", authRequired, phongBanRouter);
  app.use("/giang-vien", authRequired, giangVienRouter);
  app.use("/khoadaotao", authRequired, khoaDaoTaoRouter);
  app.use("/mon-hoc", authRequired, monHocRouter);

  app.use("/kehoachmonhoc", authRequired, keHoachMonHocRouter);
  app.use("/thoikhoabieu", authRequired, thoiKhoaBieuRoute);
  app.use('/diem', authRequired, diemRoute);
  app.use('/excel', authRequired, excelRoute);
  app.use('/excel-phu-luc-bang', authRequired, excelPhuLucBangRoute);
  app.use('/excel-docs', authRequired, exportDocx);

  // app.use('/docs-phu-luc-bang', docsPhuLucBangRoute);


  //   app.use("student", studentRouter);

  //   app.use("teacher", teacherRouter);
  //   app.use("exam", examRouter);
  //   app.use("schedule", scheduleRouter);
  //   app.use("library", libraryRouter);
  //   app.use("statistic", statisticRouter);
  app.use('/chung-chi', authRequired, chungChiRoute);
  app.use('/loai-chung-chi', authRequired, loaiChungChiRoute);
  app.use('/chuong-trinh-dao-tao', authRequired, chuongTrinhDaoTaoRoute);
  app.use('/export-excel', authRequired, exportExcelRoute);
  app.use('/tot-nghiep', authRequired, totNghiepRoute);
  app.use('/grade-settings', authRequired, gradeSettingsRoute);
  app.use('/conversion-rules', authRequired, conversionRoute);
  app.use('/statistic', authRequired, statisticRouter);
};
module.exports = routes;
