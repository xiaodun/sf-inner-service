(function () {
  return function () {
    return {
      ajaxInterceptor: function (argData, argParams, external) {
        let allowNextStep = true;
        if (["/api/book/save"].includes(external.request.url)) {
          allowNextStep = false;
        }
        return {
          allowNextStep,
          response: {
            //返回的数据
            code: 200,
            data: {
              success: false,
              message: "该接口被限制",
            },
          },
        };
      },
    };
  };
})();
