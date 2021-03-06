
为个人演示项目提供一个简易的内置服务器。

支持对数据的任意操作,自由程度高。

支持文件的上传、下载、删除。

支持对视频的二进制播放,可以边下边播。

支持websocket

支持生命周期函数挂载自定义逻辑。

![生成文件结构图](https://github.com/xiaodun/sf-inner-service/blob/master/preview.png)
# 安装

    npm install --save-dev sf-inner-service

# 如何编写

    http://172.16.209.105:8080/api/personal/word/get

  /api/personal/word/get,前缀/应用名/数据名/命令名，会创建api=>personal=>word 文件结构,以及word.json 和 get.js。
所有的命令都是围绕word.json进行操作。

  至少要有以上4个部分组成,可以在应用名和数据名之间添加任意自定义模块名，例如 /api/personal/module1/module2/word/get，但是为了不同的命令可以操作同一份数据，需要保持长度的一致,例如/api/personal/module1/module2/word/remove。
  
  命令模板如下:
  
    (function () {
      return function (argData, argParams) {
        return {
        isWrite: false, //是否覆盖数据
        //data:argData,//需要存储的新数据
        response: {
          //返回的数据
          code: 200,
          data: {
          },
        },
      };
     };
    })();
    
argData word.json的JS对象形式,argParams是对ajax参数的解析，支持get、post两种方式。

## 上传的使用
  
  上传时argParams的files参数会记录用户上传文件的数据,文件就保存在word.json 同级。
  files提供数据有以下信息
  
        "name": "i18n的使用.zip",
        "type": "application/x-zip-compressed",
        "flag": "upload_14055a151e73762ed1b41eead641cbc0",
  
  需要全部存储起来，upload_14055a151e73762ed1b41eead641cbc0是formidablechan插件生成的文件标识。

## 删除上传的文件
         
  通过参数删除argData中的数据并覆盖,同时在返回数据中,告知需要删除这个文件，示例如下
  
    (function () {
      return function (argData, argParams) {
        //argData 数据的副本
        let file;
        let index = argData.findIndex ((el, index, arr) => {
          if (el.id === argParams.id) {
            file = el;
            return true;
          }
        });
        argData.splice (index, 1);
        return {
          isWrite: true, //是否覆盖数据
          data: argData, //需要存储的新数据
          isDelete: true,
          file,
          response: {
            //返回的数据
            code: 200,
            data: {},
          },
        };
      };
    }) ();

## 下载文件
    
  通过参数在argData中找到文件的信息，并在返回数据中告知需要下载文件，模板如下
  
       (function () {
      return function (argData, argParams, argEnv) {
        //argData 数据的副本
        let id = argParams.id;
        let file = '';
        argData.some ((el, index, arr) => {
          if (el.id === id) {
            file = {
              flag: el.flag,
              name: el.name,
              type:el.type
            };
            return true;
          }
        });
        return {
          isWrite: false, //是否覆盖数据
          //data:argData,//需要存储的新数据
          isDownload: true,
          file,
          response: {
            //返回的数据
            code: 200,
            data: {},
          },
        };
      };
    }) ();
## websocket.js
    
在启动的配置中增加
    
    "isOpenWebSocket": true,
    "webSocket": {
        "port": 9001
    }

初次访问,会自动生成websocket.js

    (function () {
         return function (argData) {
             let senData = {};
             return senData;
         };
     })();
    
argData 是前端发过来的数据，自动解析为对象,senData是返回给前端的数据，自动转换成字符串。
可参考sf-feed中的使用。

## lifeCycle.js

   每个应用可以创建一个lifeCycle.js,结构以及支持的生命周期方法如下:
   
        /* external 在不同生命周期以及主程序之间共享数据
         * result 执行完命令所代表的js文件后返回的结果
         */
        (function() {
          return function() {
            return {
            createFloder: function(createFloder, external) {
                //创建程序需要的文件夹
                let pathList = ["c://sf-mobile-web", "/player", "/system", "/movie"];
                let userPathList = ["c://sf-mobile-web", "/player", "/user", "/movie"];
                createFloder(pathList);
                createFloder(userPathList);
                
            },
            //command 命令的名字
            dealCommand(command, external) {
                
                //对不同命令的额外处理                              
                if (command.includes(".")) {
                    //是静态文件
                    //去掉后缀
                    let fileName = decodeURIComponent(command);
                    let index = fileName.lastIndexOf(".");
                    fileName = fileName.substring(0, index);
                    return {
                        type: "video",//目前只支持video,
                        filePath:"",//文件的位置
                    };
                }
               
            },
            getUploadPath(external) {
                //自定义上传文件的路径
                return "";
            },
            getDeleteFilePath(external, result) {
                
                //自定义删除文件路径
                return "";
            },
            getDownloadFilePath(external, result) {
                //自定义下载文件路径
                return "";
            }
            };

            
         };
        })();
    
# 在项目中使用


  建议项目有个统一的前缀,并在脚手架里配置代理。
  
  在src同级目录下，新建service/app目录，并创建config.json
   
       {
        "prefix": "api",
        "port": 8888,
        "dataFloderName": "data"
       }
    
   service.js
   
      var Service = require("sf-inner-service");
      var file_os = require("fs");
      let config = JSON.parse(file_os.readFileSync("config.json", "utf-8"));    
      Service.start(config);
      
   在根目录下创建两个bat,一个用于启动服务器，一个用于启动前一个bat
   
   service.bat  
   
      cd service/app
      node service.js

   start-service.bat
   
     start service.bat
     
   package.json 的start 命令改为如下
   
      "start": "start-service.bat && npm run dev"
 
## 在vue-cli 配置代理
   
   config/index.js
   
   新增
   
    const path = require("path");
    var os = require("os");
    var IPv4 = "localhost";
    var readFile = require("fs");
    let network = os.networkInterfaces();

    //动态的获取本机IP地址
    for (let key in network) {
      let env = network[key];
      for (var i = 0; i < env.length; i++) {
        if (env[i].family == "IPv4" && env[i].address != "127.0.0.1") {
          IPv4 = env[i].address;
        }
      }
    }
    //获取内置服务器的配置
    let bultinService = {
      path: "./service/app/config.json"
    };
    bultinService.config = JSON.parse(
      readFile.readFileSync(bultinService.path, "utf-8")
    );
    
   module.exports
   
   新增
   
        proxyTable: {
          ["/" + bultinService.config.prefix]: {
            target: `http://${IPv4}:${bultinService.config.port}/`
          }
        }
        
   修改
   
        host: IPv4
        
