(function () {
  return function (argData) {
    if (argData.type === "MATH") {
      return argData.value * 2;
    }
  };
})();
