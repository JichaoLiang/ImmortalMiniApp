import * as utils from "../../utils/util"
import * as API from "../../utils/serverAPI"
import * as resource from '../../utils/resources'
import { isDataValueHandlerExisted } from "XrFrame/core/DataValue"
// pages/profile/profile.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMySelf: true,
    userid: resource.resource.user.id,
    avatar: utils.MapImageUrl(resource.resource.user.imgid),
    phonenumber: resource.resource.user.phonenumber,
    nickName: resource.resource.user.nickname,
    signature: resource.resource.user.signature,
    platform: utils.platform,

    activeTab: 0, // 当前激活的Tab索引
    tabs: [
      {
        id: 0,
        title: "动态",
        contentTitle: "欢迎来到首页",
        contentText: "这里是首页的内容区域，可以展示各种信息..."
      },
      {
        id: 1,
        title: "作品",
        contentTitle: "分类浏览",
        contentText: "这里是分类页面，可以按类别查看内容..."
      },
      {
        id: 2,
        title: "关注",
        contentTitle: "分类浏览",
        contentText: "这里是分类页面，可以按类别查看内容..."
      },
      {
        id: 3,
        title: "粉丝",
        contentTitle: "分类浏览",
        contentText: "这里是分类页面，可以按类别查看内容..."
      },
      {
        id: 4,
        title: "足迹",
        contentTitle: "分类浏览",
        contentText: "这里是分类页面，可以按类别查看内容..."
      }
    ],
  },
  getPhoneNumber(e) {
    if (e.detail.code) {
      // 将code发送到后端解密获取手机号
      wx.request({
        url: '你的服务器地址',
        data: { code: e.detail.code },
        success(res) {
          console.log('手机号:', res.data.phoneNumber)
        }
      })
    }
  },
  onEditorInput(e){

  },
  onStatusChange(e){

  },
  gologin(){
    wx.navigateTo({url:"../login/login"})
  },
  setVisible(){
    var isMySelf = this.data.isMySelf
    if(!isMySelf){
      var tabs = this.data.tabs
      this.setData({
        tabs:[tabs[0], tabs[1], tabs[3]]
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var usertoken = options.usertoken
    if(usertoken && resource.resource.user.id != usertoken){
      this.setData({isMySelf: false})
      API.ViewUserProfile(resource.resource.user.id, usertoken, (result)=>{
        this.setData({
          id: result.id,
          avatar: utils.MapImageUrl(result.imgid),
          nickName: result.nickname,
          signature: result.signature
        })
      },(err:any)=>{
        wx.showToast({
          title: "加载用户信息失败",
          icon: "error",
          duration: 2000,
        })
        wx.navigateBack()
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onuseridtap(evt){
    wx.setClipboardData({
      data: this.data.userid,
      success (res) {
        wx.showToast({
          title: "id已复制", //弹框内容
          icon: 'success', //弹框模式
          duration: 2000 })
      }
    })
  },
    // 切换Tab
    switchTab(e) {
      const tabId = e.currentTarget.dataset.id;
      this.setData({
        activeTab: tabId
      });
    },
  
    // Swiper滑动切换
    swiperChange(e) {
      const current = e.detail.current;
      this.setData({
        activeTab: current
      });
    }
})