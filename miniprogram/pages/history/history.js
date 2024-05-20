var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    topics: [],
  },
  onLoad: function (options) {
    this.getData();
  },
  onShow: async function (options) {
    this.getData();
  },
  getData: function () {
    db.collection('todo').orderBy('createTime', 'desc').get({
      success: res => {
        let topics = res.data;
        console.log('[数据库] [查询记录] 成功: ')
        this.setData({
          topics: topics
        })
        console.log('topics', this.data.topics)
        typeof cb === 'function' && cb();
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
})

