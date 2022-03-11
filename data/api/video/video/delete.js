(function () {
  return function (argData, argParams) {
    let index = argData.findIndex((item) => item.flag === argParams.flag);
    argData.splice(index, 1);
    return {
      isWrite: true,
      data: argData,
      isDelete: true,
      flag: argParams.flag,
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
