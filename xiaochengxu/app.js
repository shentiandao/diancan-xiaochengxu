//app.js
App({
  //创建towxml对象，供小程序页面使用
  globalData: {
    tmplIds: {
      quhao: 'AQjIV2mgNxLOqHbieGumKw4AqHLm_EcXFXmvjou9pek', //公众平台取号的模板
    },
    vipInfo: {},
    openid: null,
    // baseUrl: 'http://localhost:8080/diancan' 
    //本地调试
    baseUrl: 'http://192.168.43.188:8080/diancan' 
    //真机调试,电脑ip，192.168.137.1，192.168.43.188，10.149.5.162
  },
  onLaunch: function () {
    this.getOpenid();
  },
  // 获取用户openid
  getOpenid: function () {
    var app = this;
    var openidStor = wx.getStorageSync('openid');
    if (openidStor) {
      console.log('本地获取openid:' + openidStor);
      app.globalData.openid = openidStor;
      app._getMyUserInfo();
    } else {
    wx.login({
      success(res) {
        console.log('获取的code', res)
        if (res.code) {
          //发起网络请求获取openid
          wx.request({
            url: app.globalData.baseUrl + '/user/getOpenid',
            data: {
              code: res.code
            },
            success: function (res2) {
              let openid=res2.data
              console.log("Java后台返回的openid", openid)
              wx.setStorageSync('openid', openid)
              app.globalData.openid = openid;
              app._getMyUserInfo();
            }
          })
        }
      }
    })
    }
  },
  //获取自己后台的user信息
  _getMyUserInfo() {
    let app = this
    wx.request({
      url: app.globalData.baseUrl + '/user/getUserInfo',
      data: {
        openid: app.globalData.openid
      },
      success: function (res) {
        console.log("Java后台返回的用户信息", res.data)
        if (res && res.data && res.data.data) {
          app._updateVipInfo(res.data.data)
        }
      }
    })
  },
  //更新会员信息
  _updateVipInfo(data) {
    let app = this
    if(data.viptime){
      data.viptime=new Date(data.viptime).getTime()
    }
    app.globalData.vipInfo = data;
    console.log("会员信息", app.globalData.vipInfo)
  },
  _checkOpenid() {
    let app = this
    let openid = this.globalData.openid;
    if (!openid) {
      app.getOpenid();
      wx.showLoading({
        title: 'openid不能为空，请重新登录',
      })
      return null;
    } else {
      return openid;
    }
  },
  //获取今天是本月第几周
  _getWeek: function () {
    // 将字符串转为标准时间格式
    let date = new Date();
    let month = date.getMonth() + 1;
    let week = this.getWeekFromDate(date);
    if (week === 0) { //第0周归于上月的最后一周
      month = date.getMonth();
      let dateLast = new Date();
      let dayLast = new Date(dateLast.getFullYear(), dateLast.getMonth(), 0).getDate();
      let timestamp = new Date(new Date().getFullYear(), new Date().getMonth() - 1, dayLast);
      week = this.getWeekFromDate(new Date(timestamp));
    }
    let time = month + "月第" + week + "周";
    return time;
  },

  getWeekFromDate: function (date) {
    // 将字符串转为标准时间格式
    let w = date.getDay(); //周几
    if (w === 0) {
      w = 7;
    }
    let week = Math.ceil((date.getDate() + 6 - w) / 7) - 1;
    return week;
  },
  // 获取当前时间
  _getCurrentTime(times) {
    var d = new Date();
    if (times) {
      d = new Date(times);
    }
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var day = d.getDay();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var ms = d.getMilliseconds();

    var curDateTime = d.getFullYear() + '年';
    if (month > 9)
      curDateTime += month + '月';
    else
      curDateTime += month + '月';

    if (date > 9)
      curDateTime = curDateTime + date + "日";
    else
      curDateTime = curDateTime + date + "日";
    if (hours > 9)
      curDateTime = curDateTime + hours + "时";
    else
      curDateTime = curDateTime + hours + "时";
    if (minutes > 9)
      curDateTime = curDateTime + minutes + "分";
    else
      curDateTime = curDateTime + minutes + "分";
    return curDateTime;
  }
})