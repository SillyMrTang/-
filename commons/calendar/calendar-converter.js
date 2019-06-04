var calendarSignData, date, calendarSignDay, app = getApp();

Page({

    data: {
 
    },
    onLoad: function(a) {
        var n = new Date(), e = n.getFullYear(), t = n.getMonth() + 1;
        date = n.getDate(), console.log("date" + date);
        var c = n.getDay();
        console.log(c);
        var g, o = 7 - (date - c) % 7;
        console.log("nbsp" + o), 1 == t || 3 == t || 5 == t || 7 == t || 8 == t || 10 == t || 12 == t ? g = 31 : 4 == t || 6 == t || 9 == t || 11 == t ? g = 30 : 2 == t && (g = (e - 2e3) % 4 == 0 ? 29 : 28), 
        null != wx.getStorageSync("calendarSignData") && "" != wx.getStorageSync("calendarSignData") || wx.setStorageSync("calendarSignData", new Array(g)), 
        null != wx.getStorageSync("calendarSignDay") && "" != wx.getStorageSync("calendarSignDay") || wx.setStorageSync("calendarSignDay", 0), 
        calendarSignData = wx.getStorageSync("calendarSignData"), calendarSignDay = wx.getStorageSync("calendarSignDay"), 
        console.log(calendarSignData), console.log(calendarSignDay), this.setData({
            year: e,
            month: t,
            nbsp: o,
            monthDaySize: g,
            date: date,
            calendarSignData: calendarSignData,
            calendarSignDay: calendarSignDay
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {},
    register_rule: function() {
        this.setData({
            register_rule: !0
        });
    },
    hideModal: function() {
        this.setData({
            register_rule: !1
        });
    },
    calendarSign: function() {
        calendarSignData[date] = date, console.log(calendarSignData), calendarSignDay += 1, 
        wx.setStorageSync("calendarSignData", calendarSignData), wx.setStorageSync("calendarSignDay", calendarSignDay), 
        wx.showToast({
            title: "签到成功",
            icon: "success",
            duration: 2e3
        }), this.setData({
            calendarSignData: calendarSignData,
            calendarSignDay: calendarSignDay
        });
    }
});