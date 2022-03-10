(function () {
  return function (argData, argParams) {
    argData.push(argParams.name);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
