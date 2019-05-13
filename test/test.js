var Service = require("../index.js");
var file_os = require("fs");
Service.start({
  prefix: "api",
  port: 8888,
  dataFloderName: "data"
});
