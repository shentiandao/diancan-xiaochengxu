const app = getApp();

Page({
  //页面的初始数据
  data: {
    username: '',
    phone: '',
    zhuohao: '',
    renshu: '',
    first: true //是否第一次注册用户
  },

  bindinputusername: function (e) {
    this.setData({
      username: e.detail.value
    })
  },

  bindinputphone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  bindinputzhuohao: function (e) {
    this.setData({
      zhuohao: e.detail.value
    })
  },
  bindinputrenshu: function (e) {
    this.setData({
      renshu: e.detail.value
    })
  },


  //修改个人信息
  formSubmit: function () {
    var that = this;
    //如果openid不存在，就重新请求接口获取openid
    var openid = app.globalData.openid;
    if (openid === null || openid === undefined) {
      app.getOpenid();
      wx.showToast({ //这里提示失败原因
        title: 'openid为空！',
        duration: 1500
      })
      return;
    }

    
    let username = that.data.username;
    let phone = that.data.phone;
    let zhuohao = that.data.zhuohao;
    let renshu = that.data.renshu;
    let first = that.data.first;

    // 保存用户名到本地存储,2023年12月6日
    wx.setStorageSync('username', username);
    if (username == '' || username == undefined) {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
      return;
    }
    if (phone == '' || phone == undefined) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return;
    }
    wx.request({
      url: app.globalData.baseUrl + '/user/save',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        openid: openid,
        username: username,
        phone: phone,
        zhuohao: zhuohao == undefined ? '' : zhuohao,
        renshu: renshu == undefined ? '' : renshu,
        money: first ? 1000 : 0 //第一次注册有1000￥
      },
      success(res) {
        if (res && res.data && res.data.data) {
          console.log("修改成功", res.data)
          wx.showToast({
            title: '修改成功',
          })
          let user = app.globalData.vipInfo
          Object.assign(user, res.data.data)
          app.globalData.vipInfo = user
          app._getMyUserInfo();
        }
        // wx.navigateBack();
        wx.switchTab({
          url: '/pages/me/me'
        })
      },
      fail(res) {
        console.log("提交失败", res)
      }
    })

  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    let that = this;
    var openid = app.globalData.openid;
    if (openid === null || openid === undefined) {
      app.getOpenid();
      wx.showToast({ //这里提示失败原因
        title: 'openid为空！',
        duration: 1500
      })
      return;
    }
    let vipInfo = app.globalData.vipInfo
    console.log("修改个人信息页", vipInfo)
    if (vipInfo && vipInfo.username) {
      that.setData({
        username: vipInfo.username,
        phone: vipInfo.phone,
        zhuohao: vipInfo.zhuohao,
        renshu: vipInfo.renshu,
        first: false
      })
    }

  },
})