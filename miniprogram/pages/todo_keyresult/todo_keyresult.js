var app = getApp();
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
    console.log('options',options)
    this.setData({
      todoId: options.todoId,
    })
    // await this.getData();
  },
  onShow: async function (options) {
    // console.log('options',options)
    // this.setData({
    //   todoId: options.todoId,
    // })
    // await this.getData();
  },
  getData: async function () {
    await this.getObjective();
    await this.getKR();
    await this.getTodoKR();
    // console.log('TodoKR', this.data.TodoKR)
    // console.log('keyResults', this.data.keyResults)
    const KRIdArr = []
    // console.log('获取数据/keyresultIdArr0',KRIdArr)
    this.data.TodoKR.forEach((item) => {
      if (item.todoId == this.data.todoId) {
        this.data.keyResults.forEach((kr) => {
          if (kr.id == item.keyresultId) {
            kr.active = true;
            KRIdArr.push(kr.id)
            // this.setData({
            //   keyresultIdArr: KRIdArr
            // })
          }
        })
      }
    })
    let groups = [];
    this.data.keyResults.forEach((item) => {
      const { objId } = item;
      if (!groups[objId]) {
        groups[objId] = [];
      }
      groups[objId].push(item);
    });
    groups = groups.filter((item) => {
      return item !== null
    })
    // console.log('groups', groups)
    const krGroups = groups.map((item) => {
      const objId = item[0].objId;
      // console.log('objId', objId)
      const obj = this.data.objective.filter((obj) => {
        return obj.id == objId;
      })
      return item.map((project) => {
        return {
          ...project,
          objective: obj[0].content
        }
      })
    })
    this.setData({
      KRGroups: krGroups,
      keyresultIdArr: KRIdArr,
      selectKRArr: [...KRIdArr],
    })
    // console.log('获取数据/keyresultIdArr',this.data.keyresultIdArr)
  },
  getObjective() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/objective',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          // console.log('getObjective/res', res.data)
          this.setData({
            objective: res.data.data
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
  getKR() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/keyresult',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          this.setData({
            keyResults: res.data.data
          });
          resolve();
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  getTodoKR() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/todo-keyresult',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          this.setData({
            TodoKR: res.data.data
          });
          resolve();
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  selectKR(e) {
    const keyresultId = e.currentTarget.dataset.krId;
    const KRGroups = this.data.KRGroups;
    // let selectKR = [...this.data.keyresultIdArr];
    let selectKR = this.data.selectKRArr;
    KRGroups.forEach(group => {
      group.forEach(item => {
        if (item.id === keyresultId) {
          item.active = !item.active;
          if (item.active) {
            selectKR.push(item.id);
          }
          if (!item.active) {
            selectKR = selectKR.filter((kr) => {
              return kr !== item.id
            });
          }
        }
      });
    });
    this.setData({
      KRGroups: KRGroups,
      selectKRArr: selectKR,
    });
    // console.log('选择/keyresultIdArr', this.data.keyresultIdArr)
    // console.log('选择/selectKR', selectKR)
  },
  async saveTodoKR() {
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
    await this.createTodoKR(todoId, itemsToCreate);
    this.getData();
    this.setData({
      dialogShow: true,
    })
  },
  removeTodoKR(keyresultId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/todo-keyresult',
        method: 'DELETE',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data: {
          keyresultId: keyresultId
        },
        success: (res) => {
          console.log('删除成功')
          resolve();
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  createTodoKR(todoId, keyresultIdArr) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/todo-keyresult',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data: {
          todoId: todoId,
          keyresultIdArr: keyresultIdArr
        },
        success: (res) => {
          console.log('添加成功')
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
      url: '/pages/todo/todo'
    })
  },
})

