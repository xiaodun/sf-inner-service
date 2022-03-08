var Service = require("./sfInnerService.js");
Service.start({
  prefix: "api",
  port: 8091,
  dataFloderName: "data",
  isOpenWebSocket: true,
  webSocket: {
    port: 8092,
  },
});
