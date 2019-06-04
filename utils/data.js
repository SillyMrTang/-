
//提供接口
module.exports = {
  getLoginStatus: getLoginStatus,//保存登录的用户信息
  postData: postData,
  getData: getData,
  getUser: getUser,
  formatDate: formatDate,//格式化日期
  stringToDate: stringToDate,//字符串转日期
  calculateTime: calculateTime,//比较时间差
  formatTime: formatTime,
  countDown: countDown, //倒计时
  getAppId: getAppId,
  getSecret: getSecret,
  checkLoginStatic: checkLoginStatic,
  timeTostr: timeTostr
}

//post===============
//url==网址 ,param===参数,back===返回的函数
function postData(data) {
  var url = data.url;
  var param = data.param;
  var back = data.back;
  wx.showLoading({
    title: '加载中',
  })
  wx.request({
    url: "https://nbapi.cunyougo.com/v1/" + url,
    data: param,
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'auth-token': data.token,
      "app-os": "",
      "app-version": ""
    },
    complete: function (res) {
      wx.hideLoading();
    },
    fail: function (res) {
      wx.showToast({
        title: '请求错误',
        icon: 'error',
        mask: true,
        duration: 2000
      });
      back(false);
    },
    success: function (res) {
      if (res.data.success) {
        back(res.data.data);
      } else {
        back(res.data.data)
      }
    }
  })
}
//get===============
//url==网址 ,param===参数,back===返回的函数
function getData(data) {
  var url = data.url;
  var param = data.param;
  var back = data.back;
  wx.showLoading({
    title: '加载中',
  })
  wx.request({
    url: "https://nbapi.cunyougo.com/v1/" + url,
    data: param,
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'auth-token': data.token,
      "app-os": "",
      "app-version": ""
    },
    success: function (res) {

      if (res.data.success) {
        back(res.data.data);
      } else {
        back(res.data.data)
      }
      // return res.data.data;

    },
    fail: function (res) {
      console.log(res)
      // fail
      back(false);
    },
    complete: function (res) {
      // complete
      wx.hideLoading();
    }
  })
}

// 获取常用信息==================
//获取login状态
function getLoginStatus(back) {
  wx.getStorage({
    key: 'token',
    success: function (res) {
      back(true);
    },
    fail: function (res) {
      back(false);
    },
  });
}
//获取user的登录信息
function getUser(back) {
  wx.getStorage({
    key: 'userInfo',
    fail: function (res) {
      back(false);
    },
    success: function (res) {
      var userData = res.data;
      back(userData);
    }
  });
}

function checkLoginStatic(back) {
  var token = wx.getStorageSync("token")
  console.log("获取到的token", token)
  wx.request({
    url: 'https://nbapi.cunyougo.com/v1/user/dash-panel',
    method: "GET",
    header: {
      'auth-token': token
    },
    success: function (data) {
      back(data.data.data)
    }

  })
}

/** 
   * 字符串转时间（yyyy-MM-dd HH:mm:ss） 
   * result （分钟） 
   */
function stringToDate(fDate) {
  var fullDate = fDate.split("-");
  return new Date(fullDate[0], fullDate[1] - 1, fullDate[2], 0, 0, 0);
}


/** 
     * 格式化日期 
     * @param date 日期 
     * @param format 格式化样式,例如yyyy-MM-dd HH:mm:ss E 
     * @return 格式化后的金额 
     */
function formatDate(date, format) {
  var v = "";
  if (typeof date == "string" || typeof date != "object") {
    return;
  }
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var weekDay = date.getDay();
  var ms = date.getMilliseconds();
  var weekDayString = "";

  if (weekDay == 1) {
    weekDayString = "星期一";
  } else if (weekDay == 2) {
    weekDayString = "星期二";
  } else if (weekDay == 3) {
    weekDayString = "星期三";
  } else if (weekDay == 4) {
    weekDayString = "星期四";
  } else if (weekDay == 5) {
    weekDayString = "星期五";
  } else if (weekDay == 6) {
    weekDayString = "星期六";
  } else if (weekDay == 7) {
    weekDayString = "星期日";
  }

  v = format;
  //Year 
  v = v.replace(/yyyy/g, year);
  v = v.replace(/YYYY/g, year);
  v = v.replace(/yy/g, (year + "").substring(2, 4));
  v = v.replace(/YY/g, (year + "").substring(2, 4));

  //Month 
  var monthStr = ("0" + month);
  v = v.replace(/MM/g, monthStr.substring(monthStr.length - 2));

  //Day 
  var dayStr = ("0" + day);
  v = v.replace(/dd/g, dayStr.substring(dayStr.length - 2));

  //hour 
  var hourStr = ("0" + hour);
  v = v.replace(/HH/g, hourStr.substring(hourStr.length - 2));
  v = v.replace(/hh/g, hourStr.substring(hourStr.length - 2));

  //minute 
  var minuteStr = ("0" + minute);
  v = v.replace(/mm/g, minuteStr.substring(minuteStr.length - 2));

  //Millisecond 
  v = v.replace(/sss/g, ms);
  v = v.replace(/SSS/g, ms);

  //second 
  var secondStr = ("0" + second);
  v = v.replace(/ss/g, secondStr.substring(secondStr.length - 2));
  v = v.replace(/SS/g, secondStr.substring(secondStr.length - 2));

  //weekDay 
  v = v.replace(/E/g, weekDayString);
  return v;
}
/**
 * 计算两个日期相差几天
 * cusDate 当前时间
 * oriDate  比较时间
 * 返回 正数为cusDate>oriDate
 */
function calculateTime(cusDate, oriDate) {
  var cusTime = cusDate.getTime();
  var oriTime = oriDate.getTime();
  return (cusTime - oriTime) / (1000 * 60 * 60 * 24)
}
function formatTime(time) {
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  let day = 0;
  if (time) {
    seconds = time
    if (seconds > 59) {
      minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;
      if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        if (hours > 23) {
          day = Math.floor(hours / 24);
          hours = hours % 60
        }
      }
    }
  }
  let ds = day > 9 ? day : `${day}天`
  let hs = hours > 9 ? hours : `0${hours}`
  let ms = minutes > 9 ? minutes : `0${minutes}`
  let ss = seconds > 9 ? seconds : `0${seconds}`
  return ds > 0 ? `${ds} ${hs}:${ms}:${ss}` : `${hs}:${ms}:${ss}`
}

let t = ""
function countDown(that) {
  let seconds = that.data.remainTime;
  if (seconds === 0) {
    that.setData({
      remainTime: 0,
      clock: formatTime(0)
    })
    return;
  }
  t = setTimeout(function () {
    that.setData({
      remainTime: seconds - 1,
      clock: formatTime(seconds - 1)
    });
    countDown(that)
  }, 1000)
}
function timeTostr(){
  var now = new Date();
  var yy = now.getFullYear();      //年
  var mm = now.getMonth() + 1;     //月
  var dd = now.getDate();          //日
  var hh = now.getHours();         //时
  var ii = now.getMinutes();       //分
  var ss = now.getSeconds();       //秒
  var clock = yy + "-";
  if (mm < 10) clock += "0";
  clock += mm + "-";
  if (dd < 10) clock += "0";
  clock += dd;
  return clock
}
function clearTimeOut() {
  clearTimeout(t)
}
function getAppId() {
  return 'wxf2095d4e996cc9f8'
}
function getSecret() {
  return '3f9a6ab6f3dcab6bdf0e33df74d73829'
}
