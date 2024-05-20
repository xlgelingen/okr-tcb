const app = getApp();

Page({
  data: {
    logged: false,
    nickName: '',
    avatarUrl: '../../images/people.png',
    userInfo: {},
  },
  onShow: function () {
    this.getUserInfo();
  },
  getUserInfo: function () {
    let userInfo = app.globalData.userInfo;
    // console.log('欢迎页/getUserInfo',userInfo);
    const nickName = app.globalData.nickName?app.globalData.nickName:app.globalData.userInfo.nickName;
    if (userInfo.nickName) {
      this.setData({
        logged: true,
        userInfo: userInfo,
        nickName:nickName,
        avatarUrl: app.globalData.avatarUrl
      })
    } 
    // console.log('欢迎页/nickName',this.data.nickName)
    // console.log('欢迎页/avatarUrl',this.data.avatarUrl)
  },
  goTodo: function () {
    const nickName = this.data.nickName;
    if(nickName){
      wx.switchTab({
        url: '/pages/todo/todo'
      })
    }else{
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
})

