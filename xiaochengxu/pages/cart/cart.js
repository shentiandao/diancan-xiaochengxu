const app = getApp()
let tableNum = null
Page({
  data: {
    cartList: [],
    totalPrice: 0, // 总价，初始为0
    totalNum: 0, //总数，初始为0
  },
  onShow() {
    tableNum = wx.getStorageSync("tableNum")
    let cartList = wx.getStorageSync('cart') || [];
    this.setData({
      cartList
    })
    this.getTotalPrice();
  },
  // 获取购物车总价、总数
  getTotalPrice() {
    var cartList = this.data.cartList; // 获取购物车列表
    var totalP = 0;
    var totalN = 0
    for (var i in cartList) { // 循环列表得到每个数据
      totalP += cartList[i].quantity * cartList[i].price; // 所有价格加起来     
      totalN += cartList[i].quantity
    }
    this.setData({ // 最后赋值到data中渲染到页面
      cartList: cartList,
      totalNum: totalN,
      totalPrice: totalP.toFixed(2)
    });
  },
  // 购物车增加数量
  addCount(e) {
    let item = e.currentTarget.dataset.item;
    let arr = wx.getStorageSync('cart') || [];
    let f = false;
    if (arr.length > 0) {
      for (let j in arr) { // 遍历购物车找到被点击的商品，数量加1
        if (arr[j]._id == item._id) {
          arr[j].quantity += 1;
          f = true;
          try {
            wx.setStorageSync('cart', arr)
          } catch (e) {
            console.log(e)
          }
          break;
        }
      }
      if (!f) {
        arr.push(item);
      }
    } else {
      arr.push(item);
    }
    try {
      wx.setStorageSync('cart', arr)
    } catch (e) {
      console.log(e)
    }
    this.setData({
      cartList: arr,
    }, success => {
      this.getTotalPrice();
    })

  },
  //购物车减少数量
  minusCount(e) {
    let item = e.currentTarget.dataset.item;
    let cartList = wx.getStorageSync('cart') || [];
    if (cartList.length > 0) {
      for (let j in cartList) {
        if (cartList[j]._id == item._id) {
          cartList[j].quantity ? cartList[j].quantity -= 1 : 0
          if (cartList[j].quantity <= 0) {
            //购买数里为0就从购物车里删除
            this.removeByValue(cartList, item._id)
          }
          if (cartList.length <= 0) {
            this.setData({
              cartList: [],
              totalNum: 0,
              totalPrice: 0
            })
          }
          try {
            wx.setStorageSync('cart', cartList)
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
    this.setData({
      cartList: cartList
    }, success => {
      this.getTotalPrice();
    })
  },
  // 定义根据id删除数组的方法
  removeByValue(array, id) {
    for (var i = 0; i < array.length; i++) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        break;
      }
    }
  },
  //删除购物车单项
  deleteOne(e) {
    var index = e.currentTarget.dataset.index;
    var arr = wx.getStorageSync('cart')
    arr.splice(index, 1);
    if (arr.length <= 0) {
      this.setData({
        cartList: [],
        totalNum: 0,
        totalPrice: 0
      })
    }
    try {
      wx.setStorageSync('cart', arr)
    } catch (e) {
      console.log(e)
    }
    this.setData({
      cartList: arr
    }, success => {
      this.getTotalPrice();
    })
  },
  // 去菜单页
  goFood() {
    wx.navigateTo({
      url: '/pages/buy/buy'
    })
  },
  //去支付
  gotoOrder: function () {
    if (!tableNum) {
      wx.showModal({
        title: '提示',
        content: '请到首页扫码点餐',
        showCancel: false, //去掉取消按钮
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../index/index',
            })
          }
        }
      })
      return;
    }
    //购物车为空
    var arr = wx.getStorageSync('cart') || [];
    console.log("arr", arr)
    if (!arr || arr.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择菜品'
      })
      return;
    }

    // 1,校验微信授权登录
    var userStor = wx.getStorageSync('user');
    if (!userStor || !userStor.nickName) {
      wx.showModal({
        title: "请授权登录",
        content: "请先点击授权登录，以便获取您的微信昵称和微信头像",
        confirmText: "授权登录",
        success: res => {
          if (res.confirm) {
            wx.getUserProfile({
              desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
              success: (res) => {
                wx.setStorageSync('user', res.userInfo)
              }
            })
          }
        }
      })
      return
    }

    // 2,校验是否注册用户
    if (!app.globalData.vipInfo || !app.globalData.vipInfo.username) {
      wx.showModal({
        title: '请先注册',
        content: '请到个人中心注册为用户',
        showCancel: false, //去掉取消按钮
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../me/me',
            })
          }
        }
      })
      return;
    }
    wx.navigateTo({
      url: '../confirmOrder/confirmOrder?tableNum=' + tableNum
    })
  },


})