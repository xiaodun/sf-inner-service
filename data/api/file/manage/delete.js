(function () {
  return function (argData, argParams) {
    let file;
    //找到文件的索引方便在manage.json中进行删除
    const index = argData.findIndex((el) => {
      if (el.id === argParams.id) {
        //获取文件信息,用于在磁盘中删除这个文件
        file = el;
        return true;
      }
    });

    argData.splice(index, 1);
    return {
      isWrite: true, //指定覆盖行为
      data: argData,
      isDelete: true, //指定删除行为
      file,
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
