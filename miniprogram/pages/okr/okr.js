var app = getApp();
Page({
  data: {
    token: "1",
    topics: [],
    objId: null,
    showDialog: false,
    groups: [
      { text: '查看', value: 1 },
      { text: '编辑', value: 2 },
      { text: '完成', value: 3 },
      { text: '删除', type: 'warn', value: 4 }
    ],
    // isComplete: false
  },
  onLoad: function (options) {
    this.setData({
      token: app.globalData.token
    });
    this.getData();
  },
  onShow() {
    this.getData();
    this.setData({
      filteredGroups: this.data.groups
    });
  },
  getData: function () {
    wx.request({
      url: 'http://127.0.0.1:3000/objective',
      header: {
        'Authorization': `Bearer ${this.data.token}`,
      },
      success: (res) => {
        // console.log('getData/res', res.data)
        this.setData({
          topics: res.data.data
        })
      },
      fail: (error) => {
        console.error(error);
      }
    })
  },
  goAddOKR: function () {
    wx.navigateTo({
      url: '/pages/okr_create/okr_create'
    })
  },
  operateDialog: function (e) {
    // console.log(e)
    const isComplete = e.currentTarget.dataset.itemComplete;
    const filteredGroups = isComplete
      ? this.data.groups.filter(item => {
        return item.text !== '编辑' && item.text !== '完成';
      })
      : this.data.groups;

    this.setData({
      filteredGroups: filteredGroups
    });
    this.setData({
      showDialog: true,
      objId: e.currentTarget.dataset.itemId
    });
    // console.log('operateDialog/objId', this.data.objId)
  },
  btnClick: function (e) {
    var oprateId = e.detail.value;
    const objId = this.data.objId;
    console.log('oprateId', oprateId);
    if (oprateId == 1) {
      // console.log('oprateId is 1');
      wx.navigateTo({
        url: '/pages/okr_detail/okr_detail?objId=' + objId,
      });
      this.setData({
        showDialog: false,
      });
    }
    if (oprateId == 2) {
      // console.log('oprateId is 2');
      wx.navigateTo({
        url: '/pages/okr_edit/okr_edit?objId=' + objId,
      });
      this.setData({
        showDialog: false,
      });
    }
    if (oprateId == 3) {
      // console.log('oprateId is 3');
      wx.request({
        url: 'http://127.0.0.1:3000/objective/complete/' + objId,
        method: 'PATCH',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          this.getData();
          this.setData({
            showDialog: false,
          });
        },
      })
    }
    if (oprateId == 4) {
      // console.log('oprateId is 4');
      wx.request({
        url: 'http://127.0.0.1:3000/objective/' + objId,
        method: 'DELETE',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          this.delKR(objId)
          this.getData();
          this.setData({
            showDialog: false,
          });
        },
      })
    }
  },
  delKR(id) {
    wx.request({
      url: 'http://127.0.0.1:3000/keyresult/',
      method: 'DELETE',
      data: { objId: id },
      header: {
        'Authorization': `Bearer ${this.data.token}`,
      },
      success: (res) => {
        console.log('删除KR成功')
      },
    })
  }
})


