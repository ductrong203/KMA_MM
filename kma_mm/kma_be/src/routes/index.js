const statisticRouter = require("./statistic");
const authRouter = require("./auth");
const examRouter = require("./exam");
const libraryRouter = require("./library");
const studentRouter = require("./student");
const teacherRouter = require("./giangVien");
const lopRouter = require("./lop");
const scheduleRouter = require("./schedule");
const trainingRouter = require("./training");
const phongBanRouter = require("./phongBan");
const giangVienRouter = require("./giangVien");

const routes = (app) => {
  app.use("/auth", authRouter);
  app.use("/lop", lopRouter);
  //app.use()
  app.use("/training", trainingRouter);
  app.use("/phong-ban", phongBanRouter);
  app.use("/giang-vien", giangVienRouter);

  //   app.use("student", studentRouter);
  //   app.use("teacher", teacherRouter);
  //   app.use("exam", examRouter);
  //   app.use("schedule", scheduleRouter);
  //   app.use("library", libraryRouter);
  //   app.use("statistic", statisticRouter);
};
module.exports = routes;
