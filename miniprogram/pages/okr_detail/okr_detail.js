var app = getApp();
const db = wx.cloud.database();
import { formatTime } from '../../utils/utils';
Page({
  data: {
    obj: null,
    objId: null,
    keyresults: [],
    TodoKRs: [],
    showDialog: false,
    groups: [
      { text: '标记为已完成', value: 1 },
      { text: '删除', type: 'warn', value: 2 }
    ],
    KRId: null
  },
  onLoad: function (options) {
    this.setData({
      objId: options.objId
    })
    this.getData();
  },
  getData: async function () {
    wx.showLoading({
      title: '',
    });
    const objId = this.data.objId;
    await this.getObj(objId);
    await this.getKR(objId);
    const keyresults = this.data.keyresults;
    let TodoKRs = [];
    await Promise.all(keyresults.map(async (item) => {
      try {
        const todoKRs = await this.getTodoKRs(item._id);
        TodoKRs = [...TodoKRs, ...todoKRs]
      } catch (error) {
        console.error('Failed to fetch todo content:', error);
      }
    }));
    await Promise.all(TodoKRs.map(async (item) => {
      try {
        const todo = await this.getTodo(item.todoId);
        console.log('todo', todo)
        item.todoContent = todo[0].content;
        item.todoComplete = todo[0].isCompleted;
      } catch (error) {
        console.error('Failed to fetch todo content:', error);
      }
    }));
    this.setData({
      TodoKRs: TodoKRs
    })
    wx.hideLoading();
    console.log('getData/keyresults', this.data.keyresults);
    console.log('getData/TodoKRs', this.data.TodoKRs);
  },
  async getObj(id) {
    await db.collection('objective').orderBy('createTime', 'desc').where({
      _id: id
    }).get().then(res => {
      let obj = res.data[0];
      console.log('getObj成功!', res.data)
      this.setData({
        obj: obj,
      })
      // console.log('objValue', this.data.objValue)
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
      // console.log('keyresults', this.data.keyresults)
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    })
  },
  async getTodoKRs(keyresultId) {
    try {
      const res = await db.collection('todo_keyresult').orderBy('createTime', 'desc').where({
        keyresultId: keyresultId
      }).get();
      console.log('getTodoKRs成功！');
      let TodoKRs = res.data;
      // console.log('TodoKRs', TodoKRs);
      return TodoKRs;
    } catch (err) {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      });
      console.error('[数据库] [查询记录] 失败：', err);
      throw err; // 可选：继续将错误抛出以在调用方进行处理
    }
  },
  async getTodo(id) {
    try {
      const res = await db.collection('todo').where({
        _id: id
      }).get();
      console.log('getTodo成功！');
      let todo = res.data;
      return todo;
    } catch (err) {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      });
      console.error('[数据库] [查询记录] 失败：', err);
      throw err; // 可选：继续将错误抛出以在调用方进行处理
    }
  },
  markKR(e) {
    const KRId = e.currentTarget.dataset.krId;
    console.log(KRId);
    this.setData({
      showDialog: true,
      KRId: KRId
    })
  },
  async btnClick(e) {
    var oprateId = e.detail.value;
    const KRId = this.data.KRId;
    console.log('oprateId', oprateId);
    if (oprateId == 1) {
      console.log('oprateId is 1');
      let date = new Date();
      let completed_time = formatTime(date);
      await db.collection('keyresult').where({
        _id: KRId
      }).update({
        data: {
          completed_time: completed_time,
          isCompleted: true
        }
      }).then(res => {
        this.getData();
        this.setData({
          showDialog: false,
        });
      }).catch(err => {
        wx.showToast({
          icon: 'none',
          title: '更新失败'
        })
        console.error('更新失败：', err)
      })
    }
    if (oprateId == 2) {
      console.log('oprateId is 2');
      db.collection('keyresult').where({
        _id: KRId
      }).remove({
        success: res => {
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
})

