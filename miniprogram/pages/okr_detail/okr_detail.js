var app = getApp();
Page({
  data: {
    token: "1",
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
      token: app.globalData.token,
      objId: options.objId
    })
    this.getData();
  },
  getData: async function () {
    const objId = this.data.objId;
    await this.getObj(objId);
    await this.getKR(objId);
    const keyresults = this.data.keyresults;
    // console.log('keyresults',keyresults);
    this.getTodoKRs(11);
    let TodoKRs = [];
    await Promise.all(keyresults.map(async (item) => {
      try {
        const todoKRs = await this.getTodoKRs(item.id);
        TodoKRs = [...TodoKRs, ...todoKRs]
      } catch (error) {
        console.error('Failed to fetch todo content:', error);
      }
    }));
    await Promise.all(TodoKRs.map(async (item) => {
      try {
        const todo = await this.getTodo(item.todoId);
        item.todoContent = todo.content; 
        item.todoComplete = todo.isCompleted; 
      } catch (error) {
        console.error('Failed to fetch todo content:', error);
      }
    }));
    this.setData({
      TodoKRs: TodoKRs
    })
    console.log('keyresults', this.data.keyresults);
    console.log('TodoKRs', this.data.TodoKRs);
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
            obj: res.data.data
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
  getTodoKRs(keyresultId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/todo-keyresult/select',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data: {
          keyresultId: keyresultId
        },
        success: (res) => {
          // const datas = res.data.data;
          // const todoKRs = [...this.data.TodoKRs, ...datas]
          // this.setData({
          //   TodoKRs: todoKRs
          // })
          // console.log('getTodoKRs成功！')
          // resolve();
          console.log('getTodoKRs成功！',res.data.data)
          resolve(res.data.data);
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  getTodo(id) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://127.0.0.1:3000/todo/' + id,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        success: (res) => {
          // console.log('getTodo成功！',res.data.data[0])
          resolve(res.data.data[0]);
        },
        fail: (error) => {
          console.error('Failed to fetch objective:', error);
          reject(error);
        }
      })
    })
  },
  markKR(e){
    const KRId = e.currentTarget.dataset.krId;
    console.log(KRId);
    this.setData({
      showDialog: true,
      KRId: KRId
    })
  },
  btnClick: function (e) {
    var oprateId = e.detail.value;
    const KRId = this.data.KRId;
    console.log('oprateId', oprateId);
    if (oprateId == 1) {
      console.log('oprateId is 1');
      wx.request({
        url: 'http://127.0.0.1:3000/keyresult/complete/' + KRId,
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
    if (oprateId == 2) {
      console.log('oprateId is 2');
      wx.request({
        url: 'http://127.0.0.1:3000/keyresult/',
        method: 'DELETE',
        header: {
          'Authorization': `Bearer ${this.data.token}`,
        },
        data:{
          id: KRId
        },
        success: (res) => {
          this.getData();
          this.setData({
            showDialog: false,
          });
        },
      })
    }
  },
})

