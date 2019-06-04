// pages/swiper2/swiper2.js
var Data = require("../../utils/data.js");
const app = getApp()
Page({

  /** 
   * 页面的初始数据
   */
  data: {
    sysW: null,
    lastDay: null,
    firstDay: null,
    year: null,
    userInfo: {},
    hasEmptyGrid: false,
    cur_year: '',
    cur_month: '',
    firstDay: null,
    getDate: null,
    month: null,
    display: "none",
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setNowDate();
    that.getUserInfo();
    that.getRegimentMonth()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  getUserInfo: function () {
    var user = app.globalData.userInfo
    console.log(user)
    if(user == null){
      this.data.userInfo["nickName"] = ""
      this.data.userInfo["avatarUrl"] = "http://app-image-test.cunyougo.com/wechat-mini/moren.png"
      this.setData({
        userInfo: this.data.userInfo
      })
    }else{

      this.setData({
        userInfo:user
      })
    }
  },
  submit:function(e){
    var openid = app.globalData.openid
    var self = this
    if (app.globalData.userInfo == null) {
      var userInfo = e.detail.userInfo
      app.globalData.userInfo = userInfo
      wx.request({
        url: 'https://lucky.cunyougo.com/users/',
        method: 'POST',
        data: {
          openid: openid,
          name: userInfo['nickName'],
          image: userInfo['avatarUrl']
        }, success: function (res) {
          self.setData({
            userInfo: e.detail.userInfo
          })
        }
      })
    }
    
    
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  setNowDate: function () {
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const cur_day = date.getDate();
    const todayIndex = date.getDate() - 1;
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.setData({
      cur_year: cur_year,
      cur_month: cur_month,
      org_year: date.getFullYear(),//现在时间的年月日
      org_month: date.getMonth(),
      org_day: cur_day,
      weeks_ch,
      todayIndex,
    })

    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);

  },

  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },
  calculateDays(year, month) {
    let days = [];
    var that = this
    const thisMonthDays = this.getThisMonthDays(year, month);
    for (let i = 1; i <= thisMonthDays; i++) {
      var date = new Date(year, month - 1, i);
      var day = {};
      // console.log(date)
      //status 0-不可选择 1-当前时间 2-可选择 3-被选中
      //比现在的时间比较是大于还是小于，小于则不可点击
      var cusDate = new Date(this.data.org_year, this.data.org_month, this.data.org_day)
      day["day"] = i;
      day["year"] = year;
      day["month"] = month;
      var time = parseInt(Data.calculateTime(date, cusDate));
      if (time < 0) {
        day["status"] = 0;
      }else if(time == 0){
        day['status'] = 1
      }
      days.push(day);
    }
    that.setData({
      days
    });
  },
  handleCalendar(e) {
    const handle = e.currentTarget.dataset.handle;
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }
      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);
      // this.getRegimentMonth(newYear, newMonth)
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })

    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);
      // this.getRegimentMonth(newYear, newMonth)

      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })
    }
  },
  getRegimentMonth:function(){
    var openid = app.globalData.openid
    var self = this
    wx.request({
      url: 'https://lucky.cunyougo.com/users',
      method: 'GET',
      data: {
        openid: openid,
      }, success: function (res) {
        
        self.getReserve(res.data[0].pk)
      }
    })
  },
  getReserve: function (userid) {
    var self = this
    wx.request({
      url: 'https://lucky.cunyougo.com/api/reserves/',
      data: {
        user: userid,
        status: 1
      }, success: function (res) {
        console.log(res)
        if(res.data.length){
          var dList = res.data
          var dayList = self.data.days
          console.log(res.data)
          for (var day in dayList){
            var date = dayList[day].year + '-0' + dayList[day].month + '-' + dayList[day].day
            for(var d in dList){
              if(date === dList[d].create){
                  dayList[day].click = 1
              } 
            }
          }
          self.setData({
            days: dayList
          })
        }

      }
    })
  },
})