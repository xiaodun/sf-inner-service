(function () {
  return function (argData, argParams, external) {
    const request = require("request");

    request(argParams.url, function (error, response, body) {
      external.response.end(JSON.stringify(body));
    });
    return {
      async: true,
      response: {
        code: 200,
      },
    };
  };
})();
