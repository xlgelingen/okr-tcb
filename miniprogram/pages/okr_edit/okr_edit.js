var app = getApp();
const db = wx.cloud.database();
import { formatTime } from '../../utils/utils';
Page({
  data: {
    objValue: null,
    keyresults: [],
    originKR: [],
    originObj: null,
    objId: null,
    dialogShow: false,
    button: [{ text: '确定' }]
  },
  onLoad: function (options) {
    this.setData({
      objId: options.objId,
    })
    this.getData();
  },
  async getData() {
    const objId = this.data.objId;
    await this.getObj(objId);
    await this.getKR(objId);
    const krs = this.data.keyresults;
    const originKR = JSON.parse(JSON.stringify(krs));
    this.setData({
      originKR: originKR
    })
    console.log('originKR:', this.data.originKR)
  },
  async getObj(id) {
    await db.collection('objective').orderBy('createTime', 'desc').where({
      _id: id
    }).get().then(res => {
      let objValue = res.data[0].content;
      const originObj = JSON.parse(JSON.stringify(objValue));
      console.log('getObj成功!', res.data)
      this.setData({
        objValue: objValue,
        originObj: originObj
      })
      console.log('objValue', this.data.objValue)
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    })
  },
  async getKR(objId) {
    await db.collection('keyresult').orderBy('createTime', 'desc').where({
      objId: objId
    }).get().then(res => {
      console.log('getKR成功！')
      let keyresults = res.data;
      this.setData({
        keyresults: keyresults,
      })
      console.log('keyresults', this.data.keyresults)
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
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
    // console.log(this.data.objId)
    // keyresults[index].objId = this.data.objId;
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
    wx.showLoading({
      title: '',
    });
    const originObj = this.data.originObj
    const objContent = this.data.objValue;
    const keyresults = this.data.keyresults;
    const originKR = this.data.originKR;
    const objId = this.data.objId;
    // console.log('save/objContent', objContent)
    // console.log('save/keyresults', keyresults)
    // console.log('save/originKR', originKR)
    // console.log('save/objId', objId)
    const itemsToDelete = [];
    const itemsToCreate = [];
    const itemsToUpdate = [];
    // 找出需要删除的项
    for (const kr of originKR) {
      if (!keyresults.find(item => item._id === kr._id)) {
        itemsToDelete.push(kr._id);
      }
    }
    // 找出需要创建的项
    for (const kr of keyresults) {
      if (!originKR.find(item => item._id === kr._id)) {
        itemsToCreate.push(kr);
      }
    }
    // 找出需要更新的项
    for (const kr of keyresults) {
      const originalKR = originKR.find(item => item._id === kr._id);
      if (originalKR && originalKR.content !== kr.content) {
        itemsToUpdate.push(kr);
      }
    }
    console.log('需要删除的项:', itemsToDelete);
    console.log('需要创建的项:', itemsToCreate);
    console.log('需要更新的项:', itemsToUpdate);
    // 执行删除操作
    for (const itemId of itemsToDelete) {
      await this.removeKR(itemId);
    }
    // 执行创建操作
    for (const item of itemsToCreate) {
    const content = item.content
      await this.createKR(objId, content);
    }
    // 执行更新操作
    for (const item of itemsToUpdate) {
      await this.updataKR(item);
    }
    // 执行更新操作
    if (originObj !== objContent) {
      await this.updataObj(objId, objContent);
    }
    wx.hideLoading();
    this.setData({
      dialogShow: true,
    })
  },
  async createKR(objId, content) {
    let date = new Date();
    let date_display = formatTime(date);
    let createTime = db.serverDate();
    await db.collection('keyresult').add({
      data: {
        objId: objId,
        content: content,
        date_display: date_display,
        createTime: createTime,
        isCompleted: false
      }
    }).then(res => {
      console.log('添加KR成功: ')
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '添加失败'
      })
      console.error('添加失败：', err)
    })
  },
  async removeKR(itemId) {
    await db.collection('keyresult').where({
      _id: itemId
    }).remove().then(res => {
      console.log('删除KR成功: ')
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '删除失败'
      })
      console.error('删除失败：', err)
    })
  },
  async updataKR(kr) {
    const _id = kr._id;
    const content = kr.content
    await db.collection('keyresult').where({
      _id: _id
    }).update({
      data: {
        content: content
      }
    }).then(res => {
      console.log('更新KR成功: ')
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '更新失败'
      })
      console.error('更新失败：', err)
    })
  },
  async updataObj(objId, objContent) {
    await db.collection('objective').where({
      _id: objId
    }).update({
      data: {
        content: objContent
      }
    }).then(res => {
      console.log('更新OBJ成功: ')
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '更新OBJ失败'
      })
      console.error('更新OBJ失败：', err)
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

