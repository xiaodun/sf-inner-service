sf-inner-service 是以 npm 包存在项目里的小型内置服务器,它将对一下人群产生帮助作用

- 已经接触前端,但对 ajax 请求,前后端协作,完善的开发流程没深刻概念

- 具备一定的前端知识,想自己做项目练习,从而提升自己。

- 以对前端相当熟悉,同时有意深入了解 node.js 知识,进而提高开发效率

- 想开发一些满足自己交互体验的离线产品,万事俱备,唯独缺少后台能力,收浏览器器限制,一些东西做不了。

虽不能当作真正的后端,但满足功能型应用开发还是绰绰有余,因为 sf-inner-service 本质上是一个后端脚本管理平台,数据是存在磁盘里的,使用它之后就和实际开发项目没有区别,只不过是自己写后端而已,在脚本中可以使用 node.js 的能力,响应流程如下。

- 在配置端口处启动一个 http 服务用来响应请求

- 根据请求地址划分文件层级,统一解析参数,对上传文件、下载文件、视频的二进制播放做了内置处理

- 可以响应 websockt

- 支持同一模块、全局的声明周期函数,从而实现定制化需求、代码复用

- 自动创建、执行脚本文件,更改脚本逻辑只需再次请求,无需重启服务

- 自动支持跨域

- 简化返回形式,可以快速的实现增删改查

# 安装

```
    npm install --save-dev sf-inner-service

```

tutorial 介绍了常见的、具有特点的功能实现及用法

# 常见问答

## 数据文件为什么使用 json 而不使用 JS

倾向于 json 文件更方便数据的展示和、查阅、读写等特点,尽管 JS 文件少了诸多限制,可以加入注释、执行逻辑等,但这同样也是弊端,容易把数据变得混乱,从而违背初衷。

## 如何实现局域网内其它电脑不能通过 ip 访问我的服务

在全局生命周期文件 lifeCycle.js 的`ajaxInterceptor`拦截器中做如下处理

```
(function () {
  return function () {
    return {
      ajaxInterceptor: function (argData, argParams, external) {
        if (external.isLocal) {
          return {
            allowNextStep: true,
          };
        } else {
          return {
            allowNextStep: false,
            response: {
              code: 401,
            },
          };
        }
      },
    };
  };
})();
```

其中`external.isLocal`的判断逻辑为请求来源的 hostname 是否为`127.0.0.1`或`localhost`中的一个

# 如何做到应用层次的代码共用

以`/api/book/save`为例,对应的文件层级为 api=>book=>book=>save.js,可以在 book(模块名) 文件加下新增一个 lifeCycle.js 文件,示例如下

```
(function () {
  return function () {
    return {
      createFloder: function (createFloder, external) {
        external.count = 1;
        external.say = function () {
          console.log("这是一个公用函数");
        };
      },
    };
  };
})();
```

应用层次的 lifeCycle.js 文件在每次执行后端脚本之前都会被读取一次,external 在脚本文件里可以通过第三个形参接受

list.js 代码如下

```
(function () {
  return function (argData, argParams, external) {
    console.log(external.count++);
    external.say();
    return {
      isWrite: false,
      response: {
        code: 200,
        data: argData,
      },
    };
  };
})();


```
