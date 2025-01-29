const statisticRouter = require("./statistic");
const authRouter = require("./auth");
const examRouter = require("./exam");
const libraryRouter = require("./library");
const studentRouter = require("./student");
const teacherRouter = require("./teacher");
const lopRouter = require("./lop");
const scheduleRouter = require("./schedule");
const routes = (app) => {
  app.use("/auth", authRouter);
  app.use("/lop", lopRouter);
  //app.use()
  //   app.use("student", studentRouter);
  //   app.use("teacher", teacherRouter);
  //   app.use("exam", examRouter);
  //   app.use("schedule", scheduleRouter);
  //   app.use("library", libraryRouter);
  //   app.use("statistic", statisticRouter);
};
module.exports = routes;
