const app = getApp();
Page({
  data: {
    nickName: '',
    avatarUrl: '../../images/people.png',
  },
  onLoad: function() {
    this.getUserInfo();
  },
  getUserInfo: function() {
    let userInfo = app.globalData.userInfo;
    // console.log('登录/getUserInfo',userInfo)
    if(userInfo.nickName){
      this.setData({
        logged: true,
        userInfo: userInfo
      })
    }
  },
  onChooseAvatar(e) {
    // console.log('onChooseAvatar',e.detail)
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },
  handleLogin: function(e) {
    // console.log('handleLogin',e.detail)
    app.globalData.nickName = this.data.nickName;
    app.globalData.avatarUrl = this.data.avatarUrl;
    if (e.detail.userInfo) {
      app.getUserInfo(()=>{
        wx.navigateBack();
      })
    }
  }
})