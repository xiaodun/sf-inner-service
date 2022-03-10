(function () {
  return function () {
    return {
      createFloder: function (createFloder, external) {
        external.count = 1;
        external.say = function () {
          console.log("这是一个公用函数");
        };
      },
    };
  };
})();
