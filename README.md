sf-inner-service 是以 npm 包存在项目里的小型内置服务器,它将对以下人群产生帮助作用:

- 已经接触前端,但对 ajax 请求,前后端协作,完善的开发流程没有深刻概念

- 具备一定的前端知识,想通过做项目练习而提升自己,苦于缺乏后端能力

- 熟悉前端,深感封装的局限性,想通过工程化提升开发效率

- 想开发一些满足自己交互体验的离线产品,受浏览器器限制,一些功能做不了

sf-inner-service 本质上是一个后端脚本管理平台,数据存储在磁盘,使用它之后就和实际开发项目没有区别,只不过是自己写后端,流程如下:

- 在配置端口处启动一个 http 服务用来响应请求

- 根据请求地址划分文件层级,统一解析参数,对上传文件、下载文件、视频的二进制播放做了内置处理

- 可以响应 websockt

- 支持同一模块、全局的生命周期钩子,从而实现定制化需求、代码复用

- 自动创建、执行脚本文件,更改逻辑只需再次请求,无需重启服务

- 自动支持跨域

- 简化返回形式,可以快速的实现增删改查

sf-inner-service 基于 node.js,实现一对一功能性应用绰绰有余,即每个使用人员都是从 github 上把代码拉下来独立部署,其局限性在于不适合真正的线上应用,但其接口约束能力仍在(除了视频播放),切换后台可以平稳过渡。

# 安装

```
    npm install --save-dev sf-inner-service

```

# 教程

在 tutorial 下,对于有 html 文件的,只需要执行`node testService.js` 就可以跑起来了。

## 基础功能介绍

[1.能用来做什么](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/1.%E8%83%BD%E7%94%A8%E6%9D%A5%E5%81%9A%E4%BB%80%E4%B9%88/1a.md)

[2.实现增删改查](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/2.%E5%AE%9E%E7%8E%B0%E5%A2%9E%E5%88%A0%E6%94%B9%E6%9F%A5/2a.md)

[3.在 webpack 中使用](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/3.%E5%9C%A8webpack%E4%B8%AD%E4%BD%BF%E7%94%A8/3a.md)

[4.实现上传下载](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/4.%E5%AE%9E%E7%8E%B0%E4%B8%8A%E4%BC%A0%E4%B8%8B%E8%BD%BD/4a.md)

[8.websocket 练习](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/8.websocket%E7%BB%83%E4%B9%A0/8a.md)

## 应用案例

[5.调用第三方接口](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/5.%E8%B0%83%E7%94%A8%E7%AC%AC%E4%B8%89%E6%96%B9%E6%8E%A5%E5%8F%A3/5a.md)

[6.返回网上图片的 base64 码](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/6.%E8%BF%94%E5%9B%9E%E7%BD%91%E4%B8%8A%E5%9B%BE%E7%89%87%E7%9A%84base64%E7%A0%81/6a.md)

[7.指定文件在 vscode 中打开.md](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/7.%E6%8C%87%E5%AE%9A%E6%96%87%E4%BB%B6%E5%9C%A8vscode%E4%B8%AD%E6%89%93%E5%BC%80.md/7a.md)

## 扩展示例

[9.对接口做拦截](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/9.%E5%AF%B9%E6%8E%A5%E5%8F%A3%E5%81%9A%E6%8B%A6%E6%88%AA/9a.md)

[10.实现视频的边下边播](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/10.%E5%AE%9E%E7%8E%B0%E8%A7%86%E9%A2%91%E7%9A%84%E8%BE%B9%E6%94%BE%E8%BE%B9%E6%92%AD/10a.md)

# 常见问题

## 数据文件为什么使用 json 而不使用 JS

倾向于 json 文件更方便数据的展示、查阅、读写等特点,尽管 JS 文件少了诸多限制,可以加入注释、执行逻辑等,但这同样也是弊端,容易把数据变得混乱,从而违背初衷。

## 如何实现局域网内其它电脑不能通过 ip 访问我的服务

在全局生命周期文件 lifeCycle.js 的`ajaxInterceptor`拦截器中做如下处理,该文件会被自动创建

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

以`/api/book/save`为例,对应的文件层级为 api=>book=>book=>save.js,可以在 book(第二个 book,模块名) 文件夹下新增一个 lifeCycle.js 文件,示例如下:

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

应用层次的 lifeCycle.js 文件在每次执行后端脚本之前都会被读取一次,`external`在脚本文件里可以通过第三个形参接收

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
