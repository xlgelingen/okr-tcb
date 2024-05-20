// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let topic_id = event.topic_id;
  try {
    return await db.collection('topic').doc(topic_id).update({
      data: {
        reply_number: _.inc(1)
      }
    })
  } catch(e) {
    console.error(e)
  }
}