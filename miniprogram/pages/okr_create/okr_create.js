var app = getApp();
const db = wx.cloud.database();
import { formatTime } from '../../utils/utils';
Page({
  data: {
    objValue: null,
    keyresults: [''],
    KRSArr: [''],
    objId: null,
    dialogShow: false,
    button: [{ text: '确定' }],
    showToptips: false,
    error: ''
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
    wx.showLoading({
      title: "插入中",
      mask: true
    })
    await this.addObj(objContent);
    const objId = this.data.objId
    console.log('objId', objId)
    await this.addKR(objId, keyresults)
    wx.hideLoading()
    this.setData({
      dialogShow: true,
    })
  },
  async addObj(content) {
    let date = new Date();
    let date_display = formatTime(date);
    let createTime = db.serverDate();
    await db.collection('objective').add({
      data: {
        content: content,
        createTime: createTime,
        date_display: date_display,
        isCompleted: false
      }
    }).then(res => {
      console.log('添加目标成功')
      console.log('addObj/res', res)
      this.setData({
        objId: res._id
      })
    })
  },
  async addKR(objId, keyresults) {
    let date = new Date();
    let date_display = formatTime(date);
    let createTime = db.serverDate();
    let isCompleted = false;
    const promises = keyresults.map(async (item) => {
      const content = item;
      const data = { content, objId, date_display, createTime, isCompleted };
      return await db.collection("keyresult").add({ data });
    });
    await Promise.all(promises)
      .then(res => {
        console.log('添加KR成功');
        console.log('addKR/res', res);
      })
      .catch(err => {
        console.error('添加KR失败', err);
      });
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

