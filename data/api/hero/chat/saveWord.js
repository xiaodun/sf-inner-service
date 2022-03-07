(function () {
  return function (argData, argParams) {
    argData.push(argParams.word);
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
