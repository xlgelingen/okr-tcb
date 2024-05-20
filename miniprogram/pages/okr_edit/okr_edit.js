var app = getApp();
Page({
  data: {
    token: "1",
    objValue: null,
    keyresults: [],
    objId: null,
    dialogShow: false,
    button: [{ text: '确定' }]
  },
  onLoad: function (options) {
    this.setData({
      objId: options.objId,
      token: app.globalData.token
    })
    this.getData();
  },
  async getData() {
    const objId = this.data.objId;
    await this.getObj(objId);
    await this.getKR(objId);
    console.log('origin:', objId, this.data.keyresults)
  },
  getObj(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/objective/' + id,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          console.log('getObj成功！')
          this.setData({
            objValue: res.data.data.content
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
  getKR(objId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/keyresult/objId/' + objId,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          console.log('getKR成功！')
          this.setData({
            keyresults: res.data.data
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
  addKRItem() {
    this.setData({
      keyresults: [...this.data.keyresults, {}]
    })
    // console.log('addKR/kr', this.data.keyresults)
  },
  handleKRInput: function (e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    let keyresults = this.data.keyresults;
    console.log(this.data.objId)
    keyresults[index].objId = Number(this.data.objId);
    keyresults[index].content = value;
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
  async editOKR() {
    console.log('objValue', this.data.objValue)
    console.log('keyresults', this.data.keyresults)
    const objContent = this.data.objValue;
    const keyresults = this.data.keyresults;
    const objId = this.data.objId
    await this.removeObj(objId);
    await this.removeKR(objId);
    await this.addObj(objId, objContent);
    await this.addKR(objId, keyresults)
    this.setData({
      dialogShow: true,
    })
  },
  removeKR(objId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/keyresult',
        method: 'DELETE',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data: {
          objId: objId,
        },
        success: (res) => {
          console.log('删除KR成功')
          resolve();
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  removeObj(objId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/objective/' + objId,
        method: 'DELETE',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          console.log('删除Obj成功')
          resolve();
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  addObj(id, content) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/objective',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data: {
          id: id,
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

