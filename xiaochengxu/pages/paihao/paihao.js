let app = getApp()
Page({
  data: {
    num: 1111, //当前排号
    type: 1,
    currentSmall: -1,
    currentBig: -1
  },
  onShow: function () {
    this.getNum()
    this.timer = setInterval(() => {
      this.getNum()
    }, 5000) // 每5秒获取一次排号信息
  },
  onHide: function () {
    clearInterval(this.timer)
  },
  //取号
  quhao(event) {
    let type = event.currentTarget.dataset.type
    let that = this;
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
    wx.request({
      url: app.globalData.baseUrl + '/paihao/quhao',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        openid: openid,
        type: type,
        templateid:app.globalData.tmplIds.quhao
      },
      success(res) {
        if (res && res.data && res.data.data) {
          wx.showToast({
            title: '排号成功',
          })
          console.log(res)
          that.setData({
            type: res.data.data.type,
            num: res.data.data.num,
          })
        }
      },
      fail(res) {
        console.log("排号失败", res)
      }
    })

    //这里再单独做一个允许授权的操作
    wx.requestSubscribeMessage({
      tmplIds: [app.globalData.tmplIds.quhao],
      success: res => {
        console.log("授权成功")
      },
      fail: res => {
        console.log("授权失败")
      }
    })
  },
  //查询我的排号
  getNum() {
    let that = this;
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
    wx.request({
      url: app.globalData.baseUrl + '/paihao/getNum',
      data: {
        openid: openid
      },
      success: function (res) {
        if (res && res.data && res.data.data) {
          let dataList = res.data.data;
          console.log("请求到的排号情况", dataList)
          that.setData({
            type: dataList.type,
            num: dataList.num,
            smallOkNum: dataList.smallOkNum,
            bigOkNum: dataList.bigOkNum,
          })
        } else {
          that.setData({
            num: -1
          })
        }
      },
      fail(res) {
        console.log("查询排号失败", res)
      }
    })
  },
  //重新排号
  paihaoAgain() {
    this.setData({
      num: -1
    })
  }
})