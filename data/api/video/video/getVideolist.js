(function () {
  return function (argData, argParams, external) {
    //argData 数据的副本
    external.moveList.forEach((item1) => {
      const data = argData.find((item2) => item2.flag === item1.flag);
      if (data) {
        item1.name = data.name;
        item1.isUser = true;
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
