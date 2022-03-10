/*  
 自定义前缀/应用名/数据名/命令
 程序会建立 自定义前缀/应用名/数据名 的文件夹结构 然后为每一个命令生成一个js文件
 支持get和post方式
*/
exports.start = function (config) {
  var http_os = require("http");
  var file_os = require("fs");
  var url_os = require("url");
  var path_os = require("path");
  var IPv4 = "localhost";
  var os = require("os");
  var formidable_os = require("formidable");
  var WebSocketServer = require("ws").Server;
  //动态的获取本机IP地址
  let network = os.networkInterfaces();
  for (let key in network) {
    let env = network[key];
    for (var i = 0; i < env.length; i++) {
      if (env[i].family == "IPv4" && env[i].address != "127.0.0.1") {
        IPv4 = env[i].address;
      }
    }
  }
  if (config.isOpenWebSocket) {
    //开启了webSocket
    if (config.webSocket && config.webSocket.port == undefined) {
      console.log("没有配置webSocket端口");
      return;
    }
    try {
      var wss = new WebSocketServer({ port: config.webSocket.port });
      console.log(`webSocket is running ${config.webSocket.port}`);
      try {
        //读取websocket.js 没有则创建
        let websocketPath = config.dataFloderName + "/websocket.js";
        if (!file_os.existsSync(websocketPath)) {
          file_os.writeFileSync(
            websocketPath,
            `(function(){
        return function(argData){
            let senData = {}
            return senData;
        }
    })()`
          );
        }

        wss.on("connection", function (ws) {
          ws.on("message", function (message) {
            let websocketjs = file_os.readFileSync(websocketPath, "utf-8");
            // 广播消息
            let result = eval(websocketjs)(JSON.parse(message));

            ws.send(JSON.stringify(result));
          });
        });
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  var server = http_os.createServer(function (request, response) {
    const crossDomainSettings = {
      "Access-Control-Allow-Methods": "DELETE,PUT,POST,GET,OPTIONS",
      "Access-Control-Allow-Origin": request.headers.origin || "*",
      "Access-Control-Allow-Headers":
        Object.keys(request.headers).join(",") +
        "," +
        (request.headers["access-control-request-headers"] || ""),
      "Access-Control-Allow-Credentials": true,
    };
    let isLocal = false;
    if (request.headers.referer) {
      const reqIpv4 = url_os.parse(request.headers.referer).hostname;
      if (reqIpv4 === "127.0.0.1" || reqIpv4 === "localhost") {
        isLocal = true;
      }
    }
    try {
      var urlElementsArr = request.url.slice(1, request.url.length).split("/");
      console.log(`${IPv4}:${config.port}${request.url}`);
      let prefix = urlElementsArr[0],
        appName = urlElementsArr[1],
        moduleNames = urlElementsArr.slice(2, urlElementsArr.length - 2),
        dataName = urlElementsArr[urlElementsArr.length - 2],
        command;
      let paramsPos = urlElementsArr[urlElementsArr.length - 1].indexOf("?");
      if (paramsPos == -1) {
        command = urlElementsArr[urlElementsArr.length - 1];
      } else {
        command = urlElementsArr[urlElementsArr.length - 1].slice(0, paramsPos);
      }

      if (prefix === "favicon.ico") {
        response.writeHead(200, {});
        response.end("");
        return;
      }

      //视频播放
      let external = {
        isLocal,
        request,
        response,
      };

      let floderPathArr = [].concat([
        config.dataFloderName,
        prefix,
        appName,
        ...moduleNames,
        dataName,
      ]);
      var appFloder = {
        path: [
          config.dataFloderName,
          prefix,
          appName,
          ...moduleNames,
          dataName,
        ].join("/"),
      };

      let dataFloder = {
        path: [config.dataFloderName].join("/"),
      };
      let templateFloder = {
        path: path_os.resolve(
          __dirname,
          ["templates", "lifeCycleTemplate.js"].join("/")
        ),
      };

      dataFloder.lifeCyclePath = dataFloder.path + "/lifeCycle.js";
      let dataLifeCycleModule = {};
      if (!file_os.existsSync(dataFloder.lifeCyclePath)) {
        //如果存在生命周期函数
        file_os.writeFileSync(
          dataFloder.lifeCyclePath,
          file_os.readFileSync(templateFloder.path, "utf-8")
        );
      }
      dataLifeCycleModule = eval(
        file_os.readFileSync(dataFloder.lifeCyclePath, "utf-8")
      )();

      let countPath = "";
      floderPathArr.forEach((el) => {
        countPath += el + "/";
        if (!file_os.existsSync(countPath)) {
          file_os.mkdirSync(countPath);
        }
      });
      //创建文件
      appFloder.dataPath = appFloder.path + "/" + dataName + ".json";

      if (!file_os.existsSync(appFloder.dataPath)) {
        file_os.writeFileSync(appFloder.dataPath, "");
      }

      //生命周期文件
      appFloder.lifeCyclePath = appFloder.path + "/lifeCycle.js";

      let appLifeCycleModule = {};
      if (file_os.existsSync(appFloder.lifeCyclePath)) {
        //如果存在生命周期函数
        appLifeCycleModule = eval(
          file_os.readFileSync(appFloder.lifeCyclePath, "utf-8")
        )();
      }

      //创建额外的文件
      appLifeCycleModule.createFloder &&
        appLifeCycleModule.createFloder(createFloder, external);

      var commandTemplate = `(function(){
      return function(argData,argParams){
         
          return {
  
              isWrite:false,
              //data:argData,
              response:{
                  code:200,
                  data:{
      
                  }
              }
          }
      }
  })()`;

      //对不同命令的额外处理
      let commandResults =
        appLifeCycleModule.dealCommand &&
        appLifeCycleModule.dealCommand(command, external);

      if (commandResults) {
        if (commandResults.type === "video") {
          //对视频文件的统一处理
          let { filePath } = commandResults;
          file_os.stat(filePath, function (error, stats) {
            if (error) {
              console.error(error);
              response.end(error.message);
            }
            var range = request.headers.range;
            if (!range) {
              // 416 Wrong range
              return response.sendStatus(416);
            }
            var positions = range.replace(/bytes=/, "").split("-");
            var start = parseInt(positions[0], 10);
            var total = stats.size;
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = end - start + 1;
            response.writeHead(206, {
              "Content-Range": "bytes " + start + "-" + end + "/" + total,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
            });

            var stream = file_os
              .createReadStream(filePath, { start: start, end: end })
              .on("open", function () {
                stream.pipe(response);
              })
              .on("error", function (err) {
                response.end(err);
              });
          });
          //播放静态资源则无需执行后续的操作
          return;
        }
      }

      //创建命令文件  此处代码需要在dealCommand生命周期钩子后执行，防止在处理静态资源的时候额外的创建.js
      appFloder.commandPath = appFloder.path + "/" + command + ".js";
      if (!file_os.existsSync(appFloder.commandPath)) {
        file_os.writeFileSync(appFloder.commandPath, commandTemplate);
      }
      //解析参数
      if (request.method.toUpperCase() == "POST") {
        /**
         * 文件上传
         */

        if (
          ~(request.headers["content-type"] || "").indexOf(
            "multipart/form-data"
          )
        ) {
          var postData = {
            files: [],
          };
          var form = new formidable_os.IncomingForm();
          form.maxFileSize = 5 * 1024 * 1024 * 1024;
          if (appLifeCycleModule.getUploadPath) {
            form.uploadDir = appLifeCycleModule.getUploadPath(external);
          } else {
            form.uploadDir = process.cwd() + "/" + appFloder.path;
          }
          form.parse(request, function (error, fileds, files) {
            if (error) {
              // 超过指定大小时的报错
            }
          });
          form.on("file", function (name, file) {
            //写入文件名和路径
            postData.files.push({
              name: file.name,
              type: file.type,
              flag: file.path.substr(file.path.lastIndexOf("\\") + 1),
            });
          });
          form.on("end", function () {
            executeCommand(postData);
          });
        } else {
          /**
           * 数据读取完毕就会执行的监听方法
           */
          var postData = "";

          request.addListener("data", function (data) {
            postData += data;
          });
          request.addListener("end", function () {
            executeCommand(JSON.parse(postData || null));
          });
        }
      } else if (request.method.toUpperCase() == "GET") {
        var params = url_os.parse(request.url, true).query;
        executeCommand(params);
      } else if (request.method.toUpperCase() == "OPTIONS") {
        response.writeHead(200, {
          "Content-Type": "text/plain",
          ...crossDomainSettings,
        });
        response.end("");
      }
      function createFloder(list) {
        try {
          let path = "";
          list.forEach((el) => {
            path += el;
            if (!file_os.existsSync(path)) {
              file_os.mkdirSync(path);
            }
          });
        } catch (error) {
          dealError(response, error);
        }
      }
      function executeCommand(params) {
        try {
          //执行命令
          //获取json数据
          var data = JSON.parse(
            file_os.readFileSync(appFloder.dataPath, "utf-8") || null
          );
          var cloneData = JSON.parse(JSON.stringify(data));

          let allowNextStep = true;
          var result;
          if (dataLifeCycleModule.ajaxInterceptor) {
            allowNextStep = false;
            result = dataLifeCycleModule.ajaxInterceptor(
              cloneData,
              params,
              external
            );

            allowNextStep = result.allowNextStep;
          }
          if (allowNextStep) {
            result = eval(file_os.readFileSync(appFloder.commandPath, "utf-8"))(
              cloneData,
              params,
              external
            );

            if (result.isDelete) {
              let path;
              if (appLifeCycleModule.getDeleteFilePath) {
                path = appLifeCycleModule.getDeleteFilePath(external, result);
              } else {
                path = appFloder.path + "/" + result.file.flag;
              }
              file_os.unlinkSync(path);
            }
            if (result.isWrite) {
              if (result.data) {
                //防止数据遭到意外覆盖  比如忘记返回数据！
                file_os.writeFileSync(
                  appFloder.dataPath,
                  JSON.stringify(result.data, null, 4)
                );
              } else {
                response.writeHead(500, {
                  "Content-Type": "application/json",
                });
                response.end(
                  JSON.stringify({
                    message: "重写数据时发生错误,没有得到有效的返回数据",
                  })
                );
                return;
              }
            }

            if (result.isDownload) {
              // 文件下载;
              let path;

              if (appLifeCycleModule.getDownloadFilePath) {
                path = appLifeCycleModule.getDownloadFilePath(external, result);
              } else {
                path = appFloder.path + "/" + result.file.flag;
              }
              let readStream = file_os.ReadStream(path);
              response.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Accept-Ranges": "bytes",
                ...crossDomainSettings,
              });
              readStream.on("close", function () {
                response.end();
              });
              readStream.pipe(response);
              return;
            }
          }
          //返回结果
          response.writeHead(result.response.code, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "DELETE,PUT,POST,GET,OPTIONS",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "content-type",
          });
          if (!result.async) {
            //异步请求自己处理返回

            response.end(JSON.stringify(result.response.data));
          }
        } catch (error) {
          dealError(response, error);
        }
      }
    } catch (error) {
      dealError(response, error);
    }
  });
  function dealError(response, error) {
    console.log(error);
    response.writeHead(500);
    response.end(error.stack);
  }
  server.setTimeout(0);
  server.listen(config.port, function () {
    console.log(`service is running http://${IPv4}:${config.port}`);
    // https://192.168.10.118:8000/notes
  });
  server.on("error", function (error) {
    console.log(error);
    if (error.toString().indexOf(`listen EADDRINUSE`) !== -1) {
      console.log(`${config.port}端口被占用,可能是当前应用,也可能是其他应用`);
    }
  });
};
