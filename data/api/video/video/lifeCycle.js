(function () {
  return function () {
    const savePathList = ["c://innerServiceTutorial", "/movie"];

    return {
      createFloder: function (createFloder, external) {
        // external 在不同生命周期以及主程序之间共享参数
        createFloder(savePathList);
        external.savePath = savePathList.join("");
      },
      dealCommand(command, external) {
        let { savePath } = external;
        if (command === "getVideolist") {
          let moveList = [];
          //读取文件夹下的视频
          file_os.readdirSync(savePath).forEach((fileName) => {
            let filedir = savePath + "/" + fileName;
            if (file_os.existsSync(filedir)) {
              let stats = file_os.statSync(filedir);
              if (stats.isFile()) {
                moveList.push({
                  name: fileName,
                  flag: fileName,
                  id: fileName,
                });
              }
            }
          });

          external.moveList = moveList;
        } else {
          if (command.includes(".")) {
            //获取视频
            var filePath =
              external.savePath + "/" + decodeURIComponent(command);
            if (!file_os.existsSync(filePath)) {
              //属于上传的视频,这时需要去掉后缀

              let fileName = decodeURIComponent(command);
              let index = fileName.lastIndexOf(".");
              fileName = fileName.substring(0, index);

              filePath = external.savePath + "/" + fileName;
            }
            return {
              type: "video",
              filePath,
            };
          }
        }
      },
      getUploadPath(external) {
        return external.savePath;
      },
      getDeleteFilePath(external, result) {
        return external.savePath + "/" + result.flag;
      },
      getDownloadFilePath(external, result) {
        return external.savePath + "/" + result.flag;
      },
    };
  };
})();
