(function () {
  return function (argData, argParams) {
    return {
      isDownload: true,
      flag: argParams.flag,
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
