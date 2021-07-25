var Service = require("./index.js");
Service.start({
  prefix: "api",
  port: 8091,
  dataFloderName: "data",
  isOpenWebSocket: false,
  webSocket: {
    port: 9001,
  },
});
