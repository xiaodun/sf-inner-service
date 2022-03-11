(function () {
  return function (argData, argParams, external) {
    external.moveList.forEach((item1) => {
      const data = argData.find((item2) => item2.flag === item1.flag);
      if (data) {
        //用户上传的视频要显示真实名字,否则只会显示上传后的名字
        item1.name = data.name;
        //区分是否为用户上传
        item1.isUser = true;
        //加上文件后缀,播放的时候会用到
        item1.id = item1.flag + data.name.substring(data.name.lastIndexOf("."));
      }
    });
    return {
      isWrite: false,
      response: {
        code: 200,
        data: external.moveList,
      },
    };
  };
})();
