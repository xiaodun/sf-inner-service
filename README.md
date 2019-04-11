
为个人演示项目提供一个简易的内置服务器

# 安装

    npm install --save-dev sf-inner-service
    
# 在项目中使用


  建议项目有个统一的前缀,并在脚手架里配置代理。
  
  在src同级目录下，新建Service目录，并创建config.json
   
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
      
# 如何编写

    http://172.16.209.105:8080/api/personal/word/get

  服务器只接受如下结构/api/personal/word/get,前缀/应用名/数据名/命令名，会创建api=>personal=>word 文件结构,以及word.json 和 get.js。
所有的命令都是围绕word.json进行操作。
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


### 总结

sf-mobile-web 手脑通相关功能是以破环式的方式实现的，不可通用，可以用命令模式重构，不是目前主要任务。

详细参照可以看sf-pc-web上的使用
