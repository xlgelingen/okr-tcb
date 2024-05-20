// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();

// 云函数入口函数
exports.main = async (event) => {
  let KRSArr = event.KRSArr;
  const promises = KRSArr.map(async (item) => {
    return await db.collection('keyresult').add({ data: item });
  });
  await Promise.all(promises);
  return "Success";
}