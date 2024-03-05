let app = getApp();
let payWay = [{
  "id": 1,
  "package": "微信支付"
}, {
  "id": 2,
  "package": "月卡支付"
}]
Page({
  //页面的初始数据
  data: {
    tableNum: "",
    confirmOrder: [],
    // 输入框中的用餐人数
    diner_num: 0,
    // 用餐人数输入框获取焦点
    diner_numF: false,
    // 备注信息
    remarks: "",
    //支付方式列表
    payWayList: [],
    // 购物车数据
    cartList: [],
    totalPrice: 0,
    totalNum: 0,
    // 遮罩
    maskFlag: true,
  },
  // 生命周期函数--监听页面加载
  onLoad: function (Options) {
    let userData = app.globalData.vipInfo
    console.log("确认订单页用户信息", userData)
    let vipShengyu = -1
    if (userData.viptime && userData.viptime > 0) {
      vipShengyu = userData.viptime - new Date().getTime()
    }

    let tableNum = Options.tableNum;
    var arr = wx.getStorageSync('cart') || [];
    let totalPrice = this.data.totalPrice
    for (var i in arr) {
      totalPrice += arr[i].quantity * arr[i].price;
      this.data.totalNum += arr[i].quantity
    }
    this.setData({
      tableNum: tableNum,
      cartList: arr,
      money: userData.money,
      vipShengyu: vipShengyu,
      totalPrice: vipShengyu > 0 ? (totalPrice * 8 / 10).toFixed(2) : totalPrice.toFixed(2),
      totalNum: this.data.totalNum
    })
  },
  // 点击数字，输入框出现对应数字
  getDinnerNUM: function (e) {
    var dinnerNum = e.currentTarget.dataset.num;
    var diner_num = this.data.diner_num;
    // 点击“输”，获取焦点，
    if (dinnerNum == 0) {
      this.setData({
        diner_numF: true,
      })
      this.getDinerNum();
    } else {
      this.setData({
        diner_num: dinnerNum
      });
    }
  },
  //打开支付方式弹窗
  choosePayWay: function () {
    var payWayList = this.data.payWayList
    var that = this;
    var rd_session = wx.getStorageSync('rd_session') || [];
    that.setData({
      payWayList: payWay
    });

    // 支付方式打开动画
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
      delay: 0
    });
    that.animation = animation;
    animation.translate(0, -285).step();
    that.setData({
      animationData: that.animation.export(),
    });
    that.setData({
      maskFlag: false,
    });
  },
  // 支付方式关闭方法
  closePayWay: function () {
    var that = this
    // 支付方式关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    that.setData({
      maskFlag: true
    });
  },
  // 获取输入的用餐人数
  getDinerNum: function (e) {
    var diner_num = this.data.diner_num;
    this.setData({
      diner_num: diner_num
    })
  },
  // 获取用户输入的备注信息
  getRemark: function (e) {
    this.setData({
      remarks: e.detail.value
    })
  },
  //提交订单
  submitOrder: function (e) {
    let that = this;
    let tableNum = that.data.tableNum;
    let totalPrice = this.data.totalPrice
    //校验是否填写手机号
    let phone = app.globalData.vipInfo.phone
    console.log("手机号" + phone)
    if (phone == '' || phone == undefined) {
      wx.showModal({
        title: '提示',
        content: '请填写手机号',
        success: (res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../change/change',
            })
          }
        })
      })
      return
    }
    if (app.globalData.vipInfo.money && app.globalData.vipInfo.money - totalPrice < 0) {
      wx.showToast({
        icon: "none",
        title: '余额不足',
      })
      return
    }

    let arr = wx.getStorageSync('cart') || [];
    let goods_arr = [];
    arr.forEach(order => {
      console.log(order);
      var goods = new Object();
      goods.foodId = order.id;
      goods.foodQuantity = order.quantity;
      goods_arr.push(goods)
    })

    let goods_josn = JSON.stringify(goods_arr);
    console.log(goods_josn)
    let diner_num = this.data.diner_num; //用餐人数

    let remarks = this.data.remarks; //备注信息

    if (diner_num == 0) {
      that.setData({
        diner_num: 1
      })
    }
    var peoples = this.data.diner_num
    console.log("用餐人数：" + peoples)
    console.log("备注：" + remarks)
    console.log("桌号" + tableNum)

    wx.request({
      url: app.globalData.baseUrl + '/userOrder/create',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        openid: app.globalData.openid,
        name: app.globalData.vipInfo.username,
        phone: app.globalData.vipInfo.phone,
        address: tableNum,
        totalPrice: totalPrice,
        items: goods_josn,
        remarks:remarks,//备注
      },
      success: function (res) {
        // var rescode = res.data.code
        console.log("支付成功", res.data)
        if (res && res.data && res.data.data) {
          // 支付方式关闭动画
          that.animation.translate(0, 285).step();
          that.setData({
            animationData: that.animation.export()
          });
          that.setData({
            maskFlag: true
          });
          wx.showToast({
            title: '下单成功！',
          })
          app._getMyUserInfo();
          wx.setStorageSync('cart', "")
          wx.switchTab({
            url: '../me/me',
          })
        } else {
          // 支付方式关闭动画
          that.animation.translate(0, 285).step();
          that.setData({
            animationData: that.animation.export()
          });
          that.setData({
            maskFlag: true
          });
        }

      }
    })

  },


})