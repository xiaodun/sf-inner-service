(function () {
  return function (argData, argParams) {
    const list = argData.filter(
      (item) => item.indexOf(argParams.searchStr) !== -1
    );
    return {
      isWrite: false,
      response: {
        code: 200,
        data: list,
      },
    };
  };
})();
