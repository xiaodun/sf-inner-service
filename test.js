var Service = require("./index.js");
var file_os = require("fs");
Service.start({
  prefix: "api",
  port: 8089,
  dataFloderName: "data",
  isOpenWebSocket: true,
  webSocket: {
    port: 9001
  }
});
