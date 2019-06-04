//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/cache.js')
var time = require("../../utils/data.js");
Page({
  data: {
    bannerList:[],
    foodList:[],
    foodsList: [],
    array:['早餐', '午餐', '晚餐'],
    selectList: [],
    index:0,
    tab_index: 0,
    num:1,
    minusStatus: 'disabled',
    minusStatus2: 'normal',
    winHeight:'',
    isDing: false,
    userInfo:{},
    lists:[
      { name : '健康早点'},
      { name: '时令小炒'},
      { name: '养生煲汤'},
      { name: '家庭小炒'},
      { name: '百搭配菜'},
      { name: '经典硬菜'}
    ],
    list0:[],
    list1: [],
    list2: [],
    list3: [],
    list4: [],
    list5: [],
    itemCliked: 0,
    clicked:false
  },
 
  onLoad: function () {
    this.systemType()
    this.getUserInfo()
   
    this.banner()
    this.types()
    this.dishes(0,'')
  },
  bindMinus: function () {
    var num = this.data.num;
    // 如果大于1时，才可以减  
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 点击加号 */
  bindPlus: function () {
    var num = this.data.num;
    // 不作过多考虑自增1
    if(!this.data.isDing){
      num++;
    }  
    
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value;
    // 将数值与状态写回  
    this.setData({
      num: num
    });
  },
  submit:function(e){
    var openid = app.globalData.openid
    var userId = wx.getStorageSync('USERID')
    this.reserve(userId, this.data.num)
    if (app.globalData.userInfo == null){
      var  userInfo = e.detail.userInfo
      app.globalData.userInfo = userInfo
      wx.request({
        url: 'https://lucky.cunyougo.com/users/',
        method: 'POST',
        data: {
          openid: openid,
          name: userInfo['nickName'],
          image: userInfo['avatarUrl']
        }, success: function (res) {
          console.log(res)
        }
      })
    }
  },
  cancel:function(){
    var reserve = wx.getStorageSync('RESERVE')
    console.log(reserve)
    var num = wx.getStorageSync('num')
    var self = this
    console.log('取消订餐的', num, this.data.num, reserve.id)
    var id = reserve.id
    console.log(id)
    if(num >1 && (num-this.data.num) ==0){
      wx.showModal({
        title: '提示',
        content: '是否取消' + num +'份' ,
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.showToast({
              title: '取消成功',
              icon: 'succsse'
            })
            wx.request({
              url: 'https://lucky.cunyougo.com/api/reserves/' + id + '/',
              method: 'PUT',
              data: {
                status: 0,
                num:1
              }, success: function (res) {
                wx.setStorage({
                  key: 'num',
                  data: self.data.num,
                })
                self.setData({
                  isDing:false,
                  num:1
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    else if(num==1){
      console.log('取消订餐')
      wx.request({
        url: 'https://lucky.cunyougo.com/api/reserves/' + id + '/',
        method: 'PUT',
        data: {
          status: 0,
          num:1
        }, success: function (res) {
          wx.setStorage({
            key: 'num',
            data: 1,
          })
          self.setData({
            isDing: false,
            num: 1
          })
        }
      })
    }
    else{
      wx.request({
        url: 'https://lucky.cunyougo.com/api/reserves/' + id + '/',
        method: 'PUT',
        data:{
          num: self.data.num
        },success:function(res){
          wx.setStorage({
            key: 'num',
            data: self.data.num,
          })
          wx.showToast({
            title: '取消成功！',
          })
        }
      })
    }
  },
  // 获取设备屏幕高度
  systemType() {
    wx.getSystemInfo({
      success: (res) => {
        let windowHeight = res.windowHeight

        this.setData({
          windowHeight: windowHeight
        })

        console.log(res)
      }
    })
  },

  tabChange(event) {
    var index = event.detail.current
    var date = time.timeTostr()
    console.log(date)
    this.dishes(index, date)
    this.setData({
      tab_index: event.detail.current
    })
  },

  // tab栏选择
  selectTab(event) {
    var index = event.currentTarget.dataset.index
    var date = time.timeTostr()
    this.dishes(index, date)
    this.setData({
      tab_index: event.currentTarget.dataset.index
    })
  },
  getUserInfo(){
    var openid = app.globalData.openid
    console.log("get openid in global data =====> ", openid)
    var self = this
    if(openid){
      wx.request({
        url: 'https://lucky.cunyougo.com/users',
        method: 'GET',
        data: {
          openid: openid,
        }, success: function (res) {
          wx.setStorage({
            key: 'USERID',
            data: res.data[0].pk,
          })
          self.getReserve()
          self.setData({
            userInfo: res.data[0].fields
          })
        }
      })
    }else{
      app.loginCallBack=()=>{
        console.log('再次回调', app.globalData.openid)
        var openid = app.globalData.openid
        wx.request({
          url: 'https://lucky.cunyougo.com/users',
          method: 'GET',
          data: {
            openid: openid,
          }, success: function (res) {
            wx.setStorage({
              key: 'USERID',
              data: res.data[0].pk,
            })
            self.getReserve()
            self.setData({
              userInfo: res.data[0].fields
            })
          }
        })
      }
      
      
    }
  },
  reserve:function(pk, num){
    console.log('订餐数量' + num)
    wx.setStorage({
      key: 'num',
      data: num,
    })
    var self = this
    wx.request({
      url: 'https://lucky.cunyougo.com/api/reserves/',
      method: 'POST',
      data:{
        user: pk,
        num: num,
        status:1
      },
      success:function(res){
        wx.setStorage({
          key: 'RESERVE',
          data: res.data,
        })
        if(res.statusCode == 200){
          wx.showToast({
            title: '预订成功',
          })

          self.setData({
            isDing: true,
            minusStatus2: 'disabled',
          })
        }
      }
    })
  },
  getReserve:function(){
    var self = this
    var userid = wx.getStorageSync('USERID')
    console.log('当前用户ID', userid)
    wx.request({
      url: 'https://lucky.cunyougo.com/api/reserves/',
      data:{
        user: userid,
        status:1,
      },success:function(res){
        console.log("今日点餐",res)
        if(res.data.length){
          wx.setStorage({
            key: 'RESERVE',
            data: res.data[0],
          })
          self.setData({
            num: res.data[0].num,
            isDing: true
          })
        }
      }
    })
  },
  formSubmit:function(e){
    console.log(e)
    var formId = e.detail.formId
    if (formId != "the formId is a mock one" && formId != "") {
      wx.request({
        url: 'https://lucky.cunyougo.com/forms/',
        method:'POST',
        data:{
          form:formId
        },success:function(res){
          console.log('存储成功',res)
        }
      })
    }
  },
  banner:function(){
    var self = this
    wx.request({
      url: 'https://lucky.cunyougo.com/api/banners/',
      success:function(res){
        self.setData({
          bannerList:res.data
        })
      }
    })
  },

  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
 
 
  dishes:function(index, date){
    var self = this
    if(date != ''){
      wx.request({
        url: 'https://lucky.cunyougo.com/api/dishes/',
        data: {
          types: index,
          create: date
        },
        success: function (res) {
          if(index == 1){
            self.setData({
              affterList: self.setResult(res.data)
            })
          }else if(index == 2){
            self.setData({
              wanList: self.setResult(res.data)
            })
          }

        }
      })
    }else{
    wx.request({
      url: 'https://lucky.cunyougo.com/api/dishes/',
      data:{
        types:index
      },
      success: function (res) {
        self.setData({
          foodsList: self.setResult(res.data)
        })
        
      }
    })
    }
  },
  setResult:function(arr){
    var newArray = []
    for(var key in arr){
      newArray.push(arr[key].dishes)
    }
    console.log(newArray)
    var result = [];
    var obj = {};
    for (var i = 0; i < newArray.length; i++) {
      if (!obj[newArray[i].id]) {
         result.push(arr[i]);
         obj[newArray[i].id] = true;
      }
    }
    return result
  },
  // 厨师选择菜单页面
  types: function () {
    var self = this
    wx.request({
      url: 'https://lucky.cunyougo.com/api/types/',
      data: {
        types: 0
      },
      success: function (res) {
        console.log(res.data)
        self.setData({
          list0: res.data
        })
      }
    })
  },
  itemTap:function(e){
    var index = e.currentTarget.dataset.index
    console.log(this.data.list0)
    var self = this
    if (index >0 && (self.data.list0.length == 0 || self.data.list1.length == 0 || self.data.list2.length == 0 || self.data.list3.length == 0 || self.data.list4.length == 0 || self.data.list5.length == 0)){
      wx.request({
        url: 'https://lucky.cunyougo.com/api/types/',
        data: {
          types: index
        }, success: function (res) {
          console.log(index)
          index ==1?self.setData({
            list1:res.data
          }) : index == 2 ? self.setData({
            list2: res.data
            }) : index == 3 ? self.setData({
              list3: res.data
              }) : index == 4 ? self.setData({
                list4: res.data
                }):index == 5 ? self.setData({
                  list5: res.data
                }):''
          
        }
      })
    }
      self.setData({
        itemCliked:index
      })
  },
  checkboxChange: function (e) { 
    var id = e.detail.value
    console.log(id)
    var foodList = this.data.list0
    console.log(foodList)
    for(var k in foodList){ 
      if (id.indexOf(foodList[k].id + '') != -1){
        var c = 'list0[' + k + '].checked'
          this.setData({
            [c]: true
          }) 
      }else{
        var c = 'list0[' + k + '].checked'
        this.setData({
          [c]: false
        }) 
      }
    }
  },
  checkboxChange1: function (e) {
    var id = e.detail.value
    console.log(id)
    var foodList = this.data.list1
    console.log(foodList)
    for (var k in foodList) {
      if (id.indexOf(foodList[k].id + '') != -1) {
        var c = 'list1[' + k + '].checked'
        this.setData({
          [c]: true
        })
      } else {
        var c = 'list1[' + k + '].checked'
        this.setData({
          [c]: false
        })
      }
    }
    console.log(this.data.list0)
  },
  checkboxChange2: function (e) {
    var id = e.detail.value
    console.log(id)
    var foodList = this.data.list2
    console.log(foodList)
    for (var k in foodList) {
      if (id.indexOf(foodList[k].id + '') != -1) {
        var c = 'list2[' + k + '].checked'
        this.setData({
          [c]: true
        })
      } else {
        var c = 'list2[' + k + '].checked'
        this.setData({
          [c]: false
        })
      }
    }

  },
  checkboxChange3: function (e) {
    var id = e.detail.value
    var foodList = this.data.list3
    for (var k in foodList) {
      if (id.indexOf(foodList[k].id + '') != -1) {
        var c = 'list3[' + k + '].checked'
        this.setData({
          [c]: true
        })
      } else {
        var c = 'list3[' + k + '].checked'
        this.setData({
          [c]: false
        })
      }
    }
  },
  checkboxChange4: function (e) {
    var id = e.detail.value
    var foodList = this.data.list4
    for (var k in foodList) {
      if (id.indexOf(foodList[k].id + '') != -1) {
        var c = 'list4[' + k + '].checked'
        this.setData({
          [c]: true
        })
      } else {
        var c = 'list4[' + k + '].checked'
        this.setData({
          [c]: false
        })
      }
    }
  },
  checkboxChange5: function (e) {
    var id = e.detail.value
    var foodList = this.data.list5
    for (var k in foodList) {
      if (id.indexOf(foodList[k].id + '') != -1) {
        var c = 'list5[' + k + '].checked'
        this.setData({
          [c]: true
        })
      } else {
        var c = 'list5[' + k + '].checked'
        this.setData({
          [c]: false
        })
      }
    }
  },
  submitButton: function (e) {
    var that = this
    var select = this.food_num()
    
    if (select.length > 0) {
      wx.request({
        url: 'https://lucky.cunyougo.com/api/dishes/',
        method: 'POST',
        data: {
          types: this.data.index,
          dishe: select
        },
        success: function (res) {
          if (res.data.code == 200) {
            wx.showToast({
              title: '添加成功',
              icon: 'successe'
            })
            that.remark()
            var day = that.data.foodList
            for (var i in day) {
              for (var j in select) {
                if (day[i].name == select[i]) {
                  day[i].checked = false
                }
              }
            }
            that.setData({
              foodList: that.data.foodList,
              selectList: []
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '请选择菜品',
        icon: 'none'
      })
    }


  },
  food_num:function(){
    var newArry = []
    for(var key in this.data.list0){
      if (this.data.list0[key].checked){
        newArry.push(this.data.list0[key].id)
      }
    }
    for (var key in this.data.list1) {
      if (this.data.list1[key].checked) {
        newArry.push(this.data.list1[key].id)
      }
    }
    for (var key in this.data.list2) {
      if (this.data.list2[key].checked) {
        newArry.push(this.data.list2[key].id)
      }
    }
    for (var key in this.data.list3) {
      if (this.data.list3[key].checked) {
        newArry.push(this.data.list3[key].id)
      }
    }
    for (var key in this.data.list4) {
      if (this.data.list4[key].checked) {
        newArry.push(this.data.list4[key].id)
      }
    }
    for (var key in this.data.list5) {
      if (this.data.list5[key].checked) {
        newArry.push(this.data.list5[key].id)
      }
    }
    return newArry
  },
  remark:function(){
    for (var k in this.data.list0) {
      var c = 'list0[' + k + '].checked'
      this.setData({
        [c]: false
      })
    }
    for (var k in this.data.list1) {
      var c = 'list1[' + k + '].checked'
      this.setData({
        [c]: false
      })
    }
    for (var k in this.data.list2) {
      var c = 'list2[' + k + '].checked'
      this.setData({
        [c]: false
      })
    }
    for (var k in this.data.list3) {
      var c = 'list3[' + k + '].checked'
      this.setData({
        [c]: false
      })
    }
    for (var k in this.data.list4) {
      var c = 'list4[' + k + '].checked'
      this.setData({
        [c]: false
      })
    }
    for (var k in this.data.list5) {
      var c = 'list5[' + k + '].checked'
      this.setData({
        [c]: false
      })
    }
  },
  onPullDownRefresh: function () {
    // 显示顶部刷新图标
    wx.showLoading({
      title: '正在刷新',
    })
    this.getUserInfo()
    setTimeout(function(){
      wx.hideLoading()
      wx.stopPullDownRefresh();
    },2000)
  },
})
