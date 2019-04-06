(function () {
  return function (argData, argParams) {
    let filterTagId = argParams.filter.tagId;
    if (filterTagId) {
      //过滤
      argData = argData.filter((notepad, index, arr) => {
        if (notepad.tagId === filterTagId) {
          return true;
        }
      });
    }
    //argData 数据的副本
    let start = (argParams.page - 1) * argParams.size;
    let end = start + argParams.size;
    let arr = argData.slice(start, end);

    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          data: arr,
          total: argData.length,
        },
      },
    };
  };
})();
