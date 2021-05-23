// pages/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checklist: [],
    cl_id: "",
    newItem: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    if(!app.globalData.openid){
      await this.wxlogin()
    }
    this.db = wx.cloud.database()
    this.getChecklist()
  },

  wxlogin(){
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        
      }
    })
  },

  initChecklist() {
    this.db
    .collection("checklists")
    .add({
      data: {
        "_openid": app.globalData.openid,
        "checklist": []
      },
      success: res => {
        console.log('[数据库] [新增记录] 成功: ', res)
        this.setData({cl_id: res._id})
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

 getChecklist() {
    this.db
    .collection("checklists")
    .where({
      _openid: app.globalData.openid
    })
    .get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        if (res.data.length > 0) {
          this.setData({checklist: res.data[0].checklist})
          this.setData({cl_id: res.data[0]._id})
        } else {
          this.initChecklist()
        }
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

  checkboxChange(e) {
    //console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    const items = this.data.checklist
    const values = e.detail.value
    for (let i = 0; i < items.length; ++i) {
      items[i].checked = false

      for (let j = 0; j < values.length; ++j) {
        if (items[i].name === values[j]) {
          items[i].checked = true
          break
        }
      }
    }
    this.setData({
      items
    })
    this.db
    .collection("checklists")
    .doc(this.data.cl_id)
    .update({
      data: {
        checklist: this.data.checklist
      },
      success: res => {
        console.log('[数据库] [更新记录] 成功: ', res)
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  },

  createNewItem(e) {
    const items = this.data.checklist
    items.push({
      "name": this.data.newItem,
      "checked": false
    })
    this.setData({
      checklist: items
    })
    this.db
    .collection("checklists")
    .doc(this.data.cl_id)
    .update({
      data: {
        checklist: this.data.checklist
      },
      success: res => {
        console.log('[数据库] [更新记录] 成功: ', res)
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  },

  clearItem(e) { 
    const items = []
    console.log(items)
    for (let i = 0; i < this.data.checklist.length; ++i) {
      if (!this.data.checklist[i].checked) {
        items.push({
          "name": this.data.checklist[i].name,
          "checked": false
        })
      }
    }
    console.log(items)
    this.setData({
      checklist:items
    })
    this.db
    .collection("checklists")
    .doc(this.data.cl_id)
    .update({
      data: {
        checklist: items
      },
      success: res => {
        console.log('[数据库] [更新记录] 成功: ', res)
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  },

  bindKeyInput: function (e) {
    this.setData({
      newItem: e.detail.value
    })
  }
})