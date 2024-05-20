// app.js
App({
  globalData: {
    // token: '',
    userInfo: {},
    openid: '',
    nickName: '',
    avatarUrl: '../../images/people.png',
  },
  onLaunch: function () {
    this.cloudInit();
  },
  cloudInit: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true
      })
    }
  },
  getUserInfo: function (cb) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.getOpenid();
              this.globalData.userInfo = res.userInfo;
              typeof cb === 'function' && cb(res);
            }
          })
        } else {
          console.log('用户未授权');
        }
      }
    })
  },
  getOpenid: function () {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId',
      },
      success: res => {
        console.log('[getOpenId]user openid: ', res.result.openid)
        this.globalData.openid = res.result.openid;
        wx.hideLoading();
      },
      fail: err => {
        console.error('[getOpenId] 调用失败', err)
        wx.hideLoading();
      }
    })
  },
})
