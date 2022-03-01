新增一个"获取历史信息"的功能,可以进行模糊匹配

注意，sf-inner-service 只会创建默认的文件结构,程序逻辑还要自己编写

此时，"api/hero/chat"下面只是多了"getHistoryList.js"文件,与"saveWord.js"一样,可以操作"chat.json"的文件内容

argData 代表"chat.json"里的数据,只需要将它返回就可以了

```
(function () {
  return function (argData, argParams) {
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

实现搜索的代码如下

```
(function () {
  return function (argData, argParams) {
    const list = argData.filter(
      (item) => item.indexOf(argParams.searchStr) !== -1
    );
    return {
      isWrite: false,
      response: {
        code: 200,
        data: list,
      },
    };
  };
})();
```

对于 sf-inner-service 来说,get、post 请求是一样的,解析好的参数都放在`argParams`
