//index.js
const app = getApp()
let searchKey = null
Page({
  data: {
    banner: [],
  },
  onLoad() {
    this.getTopBanner(); //请求顶部轮播图
  },
  //页面可见
  onShow() {
    searchKey = '' //每次返回首页时，清空搜索词
  },
  /**
   * 搜索相关
   */
  getSearchKey(event) { //获取搜索词
    console.log("搜索词", event.detail.value)
    searchKey = event.detail.value
  },
  goSearch() { //去搜索页
    wx.navigateTo({
      url: '../buy/buy?searchKey=' + searchKey
    })
  },
  //扫码点餐
  btnclick1: function() {
    let that = this;

    //注意：true 扫码点餐； false 本地点餐
    let saoMa = true;

    /**
     * 本地点餐
     */
    if (!saoMa) {
      that.goToBuy("1号桌")
      return
    }

    /**
     * 扫码点餐
     */
    wx.scanCode({
      success: (res) => {
        if (res.result) {
          let str = res.result;
          //识别的二维码里1就代表1号桌，2就代表2号桌以此类推
          if (str.search("1") != -1) {
            console.log("1号小桌")
            that.goToBuy("1号桌")
          } else if (str.search("2") != -1) {
            console.log("2号小桌")
            that.goToBuy("2号桌")
          } else if (str.search("3") != -1) {
            console.log("3号小桌")
            that.goToBuy("3号桌")
          } else if (str.search("A") != -1) {
            console.log("1号大桌")
            that.goToBuy("4号桌")
          }else if (str.search("B") != -1) {
            console.log("2号大桌")
            that.goToBuy("5号桌")
          }
        }
      }
    })
  },

  //去点餐页
  goToBuy(tableNum) {
    wx.setStorageSync("tableNum", tableNum)
    wx.navigateTo({
      url: '../buy/buy'
    })
  },

  //菜品浏览
  btnclick2: function() {
    wx.navigateTo({
      url: '../buy/buy'
    })
  },

  //排号等位
  btnclick3: function() {
    console.log("点击了排号等位")
    wx.navigateTo({
      url: '/pages/paihao/paihao',
    })
  },
  //获取首页顶部轮播图
  getTopBanner() {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/wxPicture/getAll',
      success: function(res) {
        console.log("请求到的轮播图", res)
        if (res && res.data && res.data.data && res.data.data.length > 0) {
          let dataList = res.data.data;
          console.log("请求到的轮播图", dataList)
          that.setData({
            banner: dataList
          })
        } else {
          that.setData({
            list: []
          })
        }
      }
    })
  }


})