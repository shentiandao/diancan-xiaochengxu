const app = getApp()
let moneyVip = 100 //一年会员扣多少钱
Page({
  data: {
    viptime: 0,
    vipTimeStr: ''
  },
  onShow() {
    var user = app.globalData.vipInfo;
   
    if (user && user.phone) {
       console.log("user.viptime",user.viptime)
      let shengyu = user.viptime - new Date().getTime()
      console.log("会员剩余时间", shengyu)
      this.setData({
        user: user,
        shengyu,
        vipTimeStr: app._getCurrentTime(user.viptime)
      })
    } else {
      wx.showModal({
        confirmText: "去注册",
        content: "先去注册为用户，才可以充值会员",
        cancelColor: '取消',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/change/change',
            })
          }
        }
      })
    }
  },
  //充值会员
  payVip(e) {
    let user = this.data.user
    let year = e.currentTarget.dataset.year
    if (moneyVip * year > user.money) {
      wx.showToast({
        icon: "none",
        title: '余额不足',
      })
      return
    }
    wx.showModal({
      confirmText: "确认充值",
      content: "充值会员将扣除" + moneyVip * year + "积分，确定充值吗",
      cancelColor: '取消',
      success: res => {
        if (res.confirm) {
          wx.request({
            url: app.globalData.baseUrl + '/user/payVip',
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              openid: user.openid,
              money: moneyVip * year,
              time: year * 31536000000
            },
            success(res) {
              if (res && res.data && res.data.data) {
                console.log("会员充值成功", res.data)
                wx.showToast({
                  title: '充值成功',
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
              console.log("充值会员失败", res)
            }
          })


        }
      }
    })


  }

})