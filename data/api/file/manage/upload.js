(function () {
  return function (argData, argParams) {
    argData = argData || [];
    const file = argParams.files[0];
    file.id = +new Date() + "";
    argData.unshift(file);
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
