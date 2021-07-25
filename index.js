/*  
 自定义前缀/应用名/数据名/命令
 程序会建立 自定义前缀/应用名/数据名 的文件夹结构 然后为每一个命令生成一个js文件
 支持get和post方式
*/
exports.start = function (config) {
  var http_os = require("http");
  var file_os = require("fs");
  var url_os = require("url");
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

      //视频播放
      let external = {};

      let floderPathArr = (
        config.abspath ? config.abspath.split("/") : []
      ).concat([
        config.dataFloderName,
        prefix,
        appName,
        ...moduleNames,
        dataName,
      ]);
      var rootFloder = {
        path:
          (config.abspath ? config.abspath + "/" : "") +
          [
            config.dataFloderName,
            prefix,
            appName,
            ...moduleNames,
            dataName,
          ].join("/"),
      };

      let countPath = "";
      floderPathArr.forEach((el) => {
        countPath += el + "/";
        if (!file_os.existsSync(countPath)) {
          file_os.mkdirSync(countPath);
        }
      });
      //创建文件
      rootFloder.dataPath = rootFloder.path + "/" + dataName + ".json";

      if (!file_os.existsSync(rootFloder.dataPath)) {
        file_os.writeFileSync(rootFloder.dataPath, "");
      }

      //生命周期文件
      rootFloder.lifeCyclePath = rootFloder.path + "/lifeCycle.js";

      let lifeCycleModule = {};
      if (file_os.existsSync(rootFloder.lifeCyclePath)) {
        //如果存在生命周期函数
        lifeCycleModule = eval(
          file_os.readFileSync(rootFloder.lifeCyclePath, "utf-8")
        )();
      }

      //创建额外的文件
      lifeCycleModule.createFloder &&
        lifeCycleModule.createFloder(createFloder, external);

      var commandTemplate = `(function(){
      return function(argData,argParams){
          //argData 数据的副本
          return {
  
              isWrite:false,//是否覆盖数据
              //data:argData,//需要存储的新数据
              response:{//返回的数据
                  code:200,
                  data:{
      
                  }
              }
          }
      }
  })()`;

      //对不同命令的额外处理
      let commandResults =
        lifeCycleModule.dealCommand &&
        lifeCycleModule.dealCommand(command, external);

      if (commandResults) {
        if (commandResults.type === "video") {
          //对视频文件的统一处理
          let { filePath } = commandResults;
          file_os.stat(filePath, function (error, stats) {
            if (error) {
              response.end(error);
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
      rootFloder.commandPath = rootFloder.path + "/" + command + ".js";
      if (!file_os.existsSync(rootFloder.commandPath)) {
        file_os.writeFileSync(rootFloder.commandPath, commandTemplate);
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
          if (lifeCycleModule.getUploadPath) {
            form.uploadDir = lifeCycleModule.getUploadPath(external);
          } else {
            form.uploadDir = process.cwd() + "/" + rootFloder.path;
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
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, sessionToken",
          "Access-Control-Allow-Methods": "PUT, POST, GET, DELETE, OPTIONS",
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
            file_os.readFileSync(rootFloder.dataPath, "utf-8") || null
          );
          var cloneData = JSON.parse(JSON.stringify(data));
          // var result = eval(new String(file_os.readFileSync(rootFloder.commandPath)))(cloneData,params);
          var result = eval(
            file_os.readFileSync(rootFloder.commandPath, "utf-8")
          )(cloneData, params, external);
          if (result.isDelete) {
            let path;
            if (lifeCycleModule.getDeleteFilePath) {
              path = lifeCycleModule.getDeleteFilePath(external, result);
            } else {
              path = rootFloder.path + "/" + result.file.flag;
            }
            file_os.unlinkSync(path);
          }

          if (result.isWrite) {
            if (result.data) {
              //防止数据遭到意外覆盖  比如忘记返回数据！
              file_os.writeFileSync(
                rootFloder.dataPath,
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

            if (lifeCycleModule.getDownloadFilePath) {
              path = lifeCycleModule.getDownloadFilePath(external, result);
            } else {
              path = rootFloder.path + "/" + result.file.flag;
            }
            let readStream = file_os.ReadStream(path);
            response.writeHead(200, {
              "Content-Type": "application/octet-stream",
              "Accept-Ranges": "bytes",
            });
            readStream.on("close", function () {
              response.end();
            });
            readStream.pipe(response);
          } else {
            //返回结果
            response.writeHead(result.response.code, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Methods": "DELETE,PUT,POST,GET,OPTIONS",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "content-type",
            });
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
