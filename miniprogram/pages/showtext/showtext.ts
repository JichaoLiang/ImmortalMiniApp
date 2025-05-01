import * as utils from "../../utils/util"
// pages/showtext/showtext.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    content: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      this.setData({title:options.title})
      var textid = options.textid
      wx.request({
        url: utils.MapTextUrl(textid),
        success: (txt) =>{
          console.log(txt)
          this.setData({content: txt.data})
        },
        fail:(err)=>{
          wx.showToast({title: "该文章不存在。", //弹框内容
          icon: 'success', //弹框模式
          duration: 2000 })
          wx.navigateBack()
        }
      })
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

  }
})