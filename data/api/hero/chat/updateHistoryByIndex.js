(function () {
  return function (argData, argParams) {
    argData[argParams.index] = argParams.content;
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
