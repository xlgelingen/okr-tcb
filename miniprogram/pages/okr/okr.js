var app = getApp();
const db = wx.cloud.database();
import { formatTime } from '../../utils/utils';

Page({
  data: {
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
    this.getData();
  },
  onShow() {
    this.getData();
    this.setData({
      filteredGroups: this.data.groups
    });
  },
  getData: function () {
    wx.showLoading({
      title: '',
    });
    db.collection('objective').orderBy('createTime', 'desc').get({
      success: res => {
        let topics = res.data;
        console.log('[数据库] [查询记录] 成功: ')
        this.setData({
          topics: topics
        })
        console.log('topics', this.data.topics)
        wx.hideLoading();
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
    console.log('objId', objId);
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
      let date = new Date();
      let completed_time = formatTime(date);
      db.collection('objective').where({
        _id: objId
      }).update({
        data: {
          completed_time: completed_time,
          isCompleted: true
        },
        success: res => {
          console.log('更新成功')
          this.setData({
            showDialog: false,
          });
          console.log('showDialog', this.data.showDialog)
          this.getData();
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '更新失败'
          })
          console.error('更新失败', err)
        }
      })
    }
    if (oprateId == 4) {
      // console.log('oprateId is 4');
      db.collection('objective').where({
        _id: objId
      }).remove({
        success: res => {
          this.delKR(objId);
          this.getData();
          this.setData({
            showDialog: false,
          });
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败'
          })
          console.error('删除失败', err)
        }
      })
    }
  },
  delKR(objId) {
    db.collection('keyresult').where({
      objId: objId
    }).remove({
      success: res => {
        console.log('删除KR成功！')
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除失败'
        })
        console.error('删除失败', err)
      }
    })
  }
})


