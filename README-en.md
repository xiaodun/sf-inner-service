[中文](https://github.com/xiaodun/sf-inner-service) | [**English**](https://github.com/xiaodun/sf-inner-service/blob/master/README.md)

sf-inner-service is a small built-in server with npm packages stored in the project. It will help the following people:

- Have been exposed to the front end, but have no deep concept of ajax requests, front-end and back-end collaboration, and perfect development process

- Possess certain front-end knowledge, want to improve yourself by doing project exercises, but suffer from lack of back-end capabilities

- Familiar with the front end, deeply aware of the limitations of packaging, and want to improve development efficiency through engineering

- I want to develop some offline products that satisfy my interactive experience, but limited by the browser, some functions cannot be done

sf-inner-service is essentially a back-end script management platform. The data is stored on the disk. After using it, it is no different from the actual development project. It just writes the back-end by itself. The process is as follows:

- start an http service on the configured port to respond to requests

- Divide the file level according to the request address, parse the parameters uniformly, and do built-in processing for the binary playback of uploaded files, downloaded files and videos

- Can respond to websockets

- Supports the same module and global lifecycle hooks to achieve customized requirements and code reuse

- Automatically create and execute script files, change the logic and only need to request again, no need to restart the service

- Automatic support for cross-domain

- Simplified return form, which can quickly realize addition, deletion, modification and query

sf-inner-service is based on node.js, and it is more than enough to realize one-to-one functional applications, that is, each user pulls down the code from github and deploys it independently. Its limitation is that it is not suitable for real online applications, but its The interface constraint ability is still there (except for video playback), and the switching background can transition smoothly.

# Install

````
    npm install --save-dev sf-inner-service

````

# tutorial

Under the tutorial-en, for those with html files, just execute `node testService.js` to run.

## Basic function introduction

[1. What can be used for] (https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/1. What can be used for/1a.md)

[2. Realize additions, deletions, revisions and search] (https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/2. Realize additions, deletions, revisions/2a.md)

[3.Use in webpack](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/3.Use in webpack/3a.md)

[4. Realize upload and download] (https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/4. Realize upload and download/4a.md)

[8.websocket exercise](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/8.websocket exercise/8a.md)

## Applications

[5. Calling the third-party interface] (https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/5. Calling the third-party interface/5a.md)

[6. Return the base64 code of the online picture] (https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/6. Return the base64 code of the online picture/6a.md)

[7. The specified file is opened in vscode](https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/7. The specified file is opened in vscode/7a.md)

##Extension example

[9. Intercept the interface] (https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/9. Intercept the interface/9a.md)

[10. Realize video playback while playing] (https://github.com/xiaodun/sf-inner-service/blob/master/tutorial/10. Realize video playback while playing/10a.md)

# common problem

## Why use json instead of JS for data files

The json file tends to be more convenient for data display, viewing, reading and writing. Although the JS file has fewer restrictions and can add comments and execute logic, it is also a drawback, which is easy to clutter the data, which goes against the original intention.

## How to realize that other computers in the LAN cannot access my service through ip

Do the following in the `ajaxInterceptor` interceptor of the global life cycle file lifeCycle.js, the file will be created automatically

````
(function () {
  return function () {
    return {
      ajaxInterceptor: function (argData, argParams, external) {
        if (external.isLocal) {
          return {
            allowNextStep: true,
          };
        } else {
          return {
            allowNextStep: false,
            response: {
              code: 401,
            },
          };
        }
      },
    };
  };
})();
````

The judgment logic of `external.isLocal` is whether the hostname of the request source is one of `127.0.0.1` or `localhost`

# How to do application-level code sharing

Take `/api/book/save` as an example, the corresponding file level is api=>book=>book=>save.js, you can add a lifeCycle under the book (the second book, module name) folder. js file, an example is as follows:

````
(function () {
  return function () {
    return {
      createFloder: function (createFloder, external) {
        external.count = 1;
        external.say = function () {
          console.log("This is a public function");
        };
      },
    };
  };
})();
````

The application-level lifeCycle.js file will be read once before each execution of the backend script, `external` can be received in the script file through the third parameter

list.js code is as follows

````
(function () {
  return function (argData, argParams, external) {
    console.log(external.count++);
    external.say();
    return {
      isWrite: false,
      response: {
        code: 200,
        data: argData,
      },
    };
  };
})();


````