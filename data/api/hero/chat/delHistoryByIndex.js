(function () {
  return function (argData, argParams) {
    argData.splice(argParams.index, 1);
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
