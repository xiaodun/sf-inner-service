var Service = require("./sfInnerService.js");
Service.start({
  prefix: "api",
  port: 8880,
  dataFloderName: "data",
  isOpenWebSocket: true,
  webSocket: {
    port: 8881,
  },
});
