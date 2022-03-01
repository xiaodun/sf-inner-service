基于前面对sf-inner-service的了解，已经可以实现很多基本功能了

无论在什么场景下使用，其本质上就是把请求发送到服务器上

```
npm install --save-dev sf-inner-service

```


一个项目对应一个服务器

选一个文件夹专门负责存放sf-inner-service相关代码,列如"service/sfInnerService.js"

```
const sfInnerService = require("sf-inner-service");
sfInnerService.start({
  port: 9000,
});

```
执行`node .\sfInnerService.js`


如果直接将请求地址写成服务器的，必然会发生跨域,可以设置代理,这个不同的脚手架都有自己的方法不一一列举了。

在windows系统中可以写一个bat文件

service.bat

```
cd service
node service.js
```
但是如果程序崩溃，界面会直接关掉，可以在写一个bat启动service.bat

start-service.bat

```
start service.bat
```

修改一下package.json里的启动命令，让服务器和项目一起启动

例如:

```
start-service.bat  && npm run dev 
```







