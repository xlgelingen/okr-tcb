var app = getApp();
const db = wx.cloud.database();
import { formatTime } from '../../utils/utils';
Page({
  data: {
    todoId: null,
    token: "1",
    keyResults: [],
    objective: [],
    TodoKR: [],
    KRGroups: [],
    keyresultIdArr: [],
    selectKRArr: [],
    dialogShow: false,
    button: [{ text: '确定' }],
    isSelect: false
  },
  onLoad: async function (options) {
    console.log('onLoad')
    console.log('options', options)
    this.setData({
      todoId: options.todoId,
    })
    console.log('todoId', this.data.todoId)
    // await this.getData();
  },
  onShow: async function () {
    console.log('onShow')
    await this.getData();
  },
  async getData() {
    wx.showLoading({
      title: '',
    });
    await this.getObjective();
    await this.getKR();
    await this.getTodoKR();
    // console.log('getData/TodoKR', this.data.TodoKR)
    // console.log('getData/keyResults', this.data.keyResults)
    const KRIdArr = []
    // console.log('获取数据/keyresultIdArr0', KRIdArr)
    this.data.TodoKR.forEach((item) => {
      if (item.todoId == this.data.todoId) {
        this.data.keyResults.forEach((kr) => {
          if (kr._id == item.keyresultId) {
            kr.active = true;
            KRIdArr.push(kr._id)
          }
        })
      }
    })
    let groups = {};
    this.data.keyResults.forEach((item) => {
      const { objId } = item;
      // console.log('objId', objId)
      if (!groups[objId]) {
        groups[objId] = [];
      }
      groups[objId].push(item);
    });
    // console.log('groups', groups)
    let krGroups = [];
    for (let objId in groups) {
      const obj = this.data.objective.filter((obj) => {
        return obj.id == objId;
      });
      krGroups.push(groups[objId].map((project) => {
        return {
          ...project,
          objective: obj.content
        };
      }));
    }
    // console.log('krGroups', krGroups)
    this.setData({
      KRGroups: krGroups,
      keyresultIdArr: KRIdArr,
      selectKRArr: [...KRIdArr],
    })
    wx.hideLoading();
    // console.log('获取数据/keyresultIdArr', this.data.keyresultIdArr)
  },
  async getObjective() {
    await db.collection('objective')
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        let objective = res.data;
        console.log('获取obj成功: ');
        this.setData({
          objective: objective
        });
        console.log('objective', this.data.objective);
      })
      .catch(err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        });
        console.error('[数据库] [查询记录] 失败：', err);
      });
  },
  async getKR() {
    await db.collection('keyresult').orderBy('createTime', 'desc').get().then(res => {
      let keyresult = res.data;
      console.log('获取keyresult成功: ')
      this.setData({
        keyResults: keyresult
      })
      console.log('keyResults', this.data.keyResults)
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    })
  },
  async getTodoKR() {
    await db.collection('todo_keyresult').orderBy('createTime', 'desc').get().then(res => {
      let TodoKR = res.data;
      console.log('获取TodoKR成功: ')
      this.setData({
        TodoKR: TodoKR
      })
      console.log('TodoKR', this.data.TodoKR)
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    })
  },
  selectKR(e) {
    const keyresultId = e.currentTarget.dataset.krId;
    const KRGroups = this.data.KRGroups;
    // console.log('选择/keyresultId', keyresultId)
    // console.log('选择/KRGroups', KRGroups)
    // let selectKR = [...this.data.keyresultIdArr];
    let selectKR = this.data.selectKRArr;
    KRGroups.forEach(group => {
      group.forEach(item => {
        if (item._id === keyresultId) {
          item.active = !item.active;
          if (item.active) {
            selectKR.push(item._id);
          }
          if (!item.active) {
            selectKR = selectKR.filter((kr) => {
              return kr !== item._id
            });
          }
        }
      });
    });
    this.setData({
      KRGroups: KRGroups,
      selectKRArr: selectKR,
    });
    console.log('选择/keyresultIdArr', this.data.keyresultIdArr)
    console.log('选择/selectKR', this.data.selectKRArr)
  },
  async saveTodoKR() {
    wx.showLoading({
      title: '',
    });
    const todoId = this.data.todoId;
    const TodoKR = this.data.TodoKR;
    const keyresultIdArr = this.data.keyresultIdArr;
    const selectKRArr = this.data.selectKRArr;
    // console.log('todoId', todoId)
    // console.log('TodoKR', TodoKR)
    console.log('keyresultIdArr', keyresultIdArr)
    console.log('selectKRArr', selectKRArr)
    // 找出需要删除的项（只有 keyresultIdArr 有的项）
    const itemsToDelete = keyresultIdArr.filter(id => !selectKRArr.includes(id));
    // 找出需要创建的项（只有 selectKRArr 有的项）
    const itemsToCreate = selectKRArr.filter(id => !keyresultIdArr.includes(id));
    console.log('itemsToDelete', itemsToDelete)
    console.log('itemsToCreate', itemsToCreate)
    // 执行删除操作
    for (const itemId of itemsToDelete) {
      await this.removeTodoKR(itemId);
    }
    // 执行创建操作
    for (const itemId of itemsToCreate) {
      await this.createTodoKR(todoId, itemId);
    }
    this.getData();
    wx.hideLoading();
    this.setData({
      dialogShow: true,
    })
  },
  async removeTodoKR(keyresultId) {
    await db.collection('todo_keyresult').where({
      keyresultId: keyresultId
    }).remove({
      success: res => {
        console.log('删除TodoKR成功: ')
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除失败'
        })
        console.error('删除失败：', err)
      }
    })
  },
  async createTodoKR(todoId, keyresultId) {
    await db.collection('todo_keyresult').add({
      data: {
        todoId: todoId,
        keyresultId: keyresultId,
      }}).then(res => {
        console.log('添加TodoKR成功: ')
      }).catch(err => {
        wx.showToast({
          icon: 'none',
          title: '添加失败'
        })
        console.error('添加失败', err)
      })
  },
  tapDialogButton(e) {
    this.setData({
      dialogShow: false,
    })
    wx.switchTab({
      url: '/pages/todo/todo'
    })
  },
})

