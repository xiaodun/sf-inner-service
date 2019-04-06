var Service = require("../index.js");
let config = {
    "prefix": "api",
    "port": 8888,
    "dataFloderName": "data"
}
Service.start(config);