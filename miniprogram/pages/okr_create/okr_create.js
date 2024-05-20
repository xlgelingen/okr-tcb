var app = getApp();
Page({
  data: {
    token: "1",
    objValue: null,
    keyresults: [''],
    objId: null,
    dialogShow: false,
    button: [{ text: '确定' }],
    showToptips: false,
    error: ''
  },
  onLoad: function (options) {
    this.setData({
      token: app.globalData.token
    })
  },
  addKRItem() {
    this.setData({
      keyresults: [...this.data.keyresults, '']
    })
    // console.log('addKR/kr', this.data.keyresults)
  },
  handleKRInput: function (e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    let keyresults = this.data.keyresults;
    keyresults[index] = value;
    this.setData({
      keyresults: keyresults
    });
  },
  delKR(e) {
    // console.log(e)
    const krID = e.currentTarget.dataset.krId;
    const keyresult = this.data.keyresults;
    keyresult.splice(krID, 1);
    this.setData({
      keyresults: keyresult
    })
    // console.log('delKR/kr', this.data.keyresults)
  },
  async addOKR() {
    console.log('objValue', this.data.objValue)
    console.log('keyresults', this.data.keyresults)
    const objContent = this.data.objValue;
    const keyresults = this.data.keyresults;
    if (!objContent || !keyresults[0]) {
      this.setData({
        error: '缺少目标内容或Keyresult',
        showToptips: true
      })
      return;
    }
    await this.addObj(objContent);
    const objId = this.data.objId
    // console.log('objId',objId)
    await this.addKR(objId, keyresults)
    this.setData({
      dialogShow: true,
    })
  },
  addObj(content) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/objective',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data: {
          content: content,
        },
        success: (res) => {
          console.log('添加目标成功')
          this.setData({
            objId: res.data.data.id
          })
          resolve();
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  addKR(objId, keyresults) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/keyresult',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data: {
          objId: objId,
          keyresults: keyresults,
        },
        success: (res) => {
          console.log('添加KR成功')
          resolve();
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  tapDialogButton(e) {
    this.setData({
      dialogShow: false,
    })
    wx.switchTab({
      url: '/pages/okr/okr'
    })
  },
})

