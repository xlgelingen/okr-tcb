var app = getApp();
const db = wx.cloud.database();
import { formatTime } from '../../utils/utils';
Page({
  data: {
    // token: "1",
    topics: [],
    todoId: null,
    showDialog: false,
    groups: [
      { text: '关联', value: 1 },
      { text: '完成', value: 2 },
      { text: '删除', type: 'warn', value: 3 }
    ],
    inputValue: '',
  },
  onLoad: function () {
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
  addTodo: function (e) {
    this.data.inputValue = e.detail.value;
    console.log('addTodo/content', this.data.inputValue);
    let date = new Date();
    let date_display = formatTime(date);
    let createTime = db.serverDate();
    db.collection('todo').add({
      data: {
        content: this.data.inputValue,
        createTime: createTime,
        date_display: date_display,
        isCompleted: false
      },
      success: res => {
        this.getData();
        this.setData({ inputValue: '' });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '添加失败'
        })
        console.error('添加失败', err)
      }
    })

  },
  operateDialog: function (e) {
    this.setData({
      showDialog: true,
      todoId: e.currentTarget.dataset.itemId
    });
    console.log('operateDialog/todoId', this.data.todoId)
  },
  btnClick: function (e) {
    var oprateId = e.detail.value;
    const todoId = this.data.todoId
    console.log('oprateId', oprateId);
    console.log('todoId', todoId);
    if (oprateId == 1) {
      console.log('oprateId is 1');
      wx.navigateTo({
        url: '/pages/todo_keyresult/todo_keyresult?todoId=' + todoId,
      });
      this.setData({
        showDialog: false,
      });
    }
    if (oprateId == 2) {
      console.log('oprateId is 2');
      let date = new Date();
      let completed_time = formatTime(date);
      db.collection('todo').where({
        _id: todoId
      }).update({
        data: {
          completed_time: completed_time,
          isCompleted: true
        },
        success: res => {
          this.getData();
          this.setData({
            showDialog: false,
          });
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
    if (oprateId == 3) {
      console.log('oprateId is 3');
      db.collection('todo').where({
        _id: todoId
      }).remove({
        success: res => {
          this.delTodoKR(todoId);
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
  delTodoKR(todoId) {
    db.collection('todo_keyresult').where({
      todoId: todoId
    }).remove({
      success: res => {
        console.error('删除TodoKR成功', err)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除TodoKR失败'
        })
        console.error('删除TodoKR失败', err)
      }
    })
  }
})
