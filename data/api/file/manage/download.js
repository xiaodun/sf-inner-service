(function () {
  return function (argData, argParams) {
    //获取文件信息
    const file = argData.find((el) => el.id === argParams.id);

    return {
      isDownload: true, //指定下载行为
      file, //下载的文件信息
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
