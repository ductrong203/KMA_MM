const statisticRouter = require("./statistic");
const authRouter = require("./auth");
const examRouter = require("./exam");
const libraryRouter = require("./library");
const studentRouter = require("./student");
const teacherRouter = require("./teacher");
const classRouter = require("./class");
const scheduleRouter = require("./schedule");
const routes = (app) => {
  app.use("/auth", authRouter);
  //   app.use("student", studentRouter);
  //   app.use("teacher", teacherRouter);
  //   app.use("exam", examRouter);
  //   app.use("class", classRouter);
  //   app.use("schedule", scheduleRouter);
  //   app.use("library", libraryRouter);
  //   app.use("statistic", statisticRouter);
};
module.exports = routes;
