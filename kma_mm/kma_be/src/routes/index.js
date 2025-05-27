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

const routes = (app) => {
  app.use("/auth", authRouter);
  app.use("/lop", lopRouter);
  //app.use()
  app.use("/training", trainingRouter);

  app.use("/student", studentRouter);
  app.use("/doituongquanly", doiTuongQuanLyRouter);
  app.use("/danhmuckhenkyluat", danhMucKhenKyLuatRouter);
  app.use("/khenthuongkyluat", khenThuongKyLuatRouter);
  app.use("/thongtinquannhan", thongTinQuanNhanRouter);

  app.use("/phong-ban", phongBanRouter);
  app.use("/giang-vien", giangVienRouter);
  app.use("/khoadaotao", khoaDaoTaoRouter);
  app.use("/mon-hoc", monHocRouter);

  app.use("/kehoachmonhoc", keHoachMonHocRouter);
  app.use("/thoikhoabieu", thoiKhoaBieuRoute);
  app.use('/diem', diemRoute);
  app.use('/excel', excelRoute);
  app.use('/excel-phu-luc-bang', excelPhuLucBangRoute);
  app.use('/chung-chi', chungChiRoute);


  //   app.use("student", studentRouter);

  //   app.use("teacher", teacherRouter);
  //   app.use("exam", examRouter);
  //   app.use("schedule", scheduleRouter);
  //   app.use("library", libraryRouter);
  //   app.use("statistic", statisticRouter);
};
module.exports = routes;
