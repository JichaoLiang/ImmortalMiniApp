// pages/productlist/productlist.ts
import * as utils from "../../utils/util"
import * as API from "../../utils/serverAPI"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedstream: [],
    title: "热门",
    offset:0,
    take: 30,
  },

  onviewuser(evt){
    console.log(evt)
    var targettoken = evt.currentTarget.dataset.id
    utils.viewuserprofile(targettoken)
  },

  productDetail(evt:any){
    var prodid = evt.target.dataset.prodid
    wx.navigateTo({url: "/pages/product/product?productid=" + prodid})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var method = options.method

    if(method == "Hot"){
      this.setData({title: "热门"})
      utils.GetHotProductFeedList((data)=>{
        console.log(data)
        var length = data.data.length
        if(length > 0){
          this.data.offset += length
          for(var i = 0;i<length;i++){
            // mapimageid to url
            var imgs = data.data[i].images
            for(var j = 0;j<imgs.length; j++){
              imgs[j].url = utils.MapImageUrl(imgs[j].url)
            }
            console.log(data.data[i].images)

            // truncate description
            data.data[i].description = utils.truncateText(data.data[i].description, 18)
          }
          this.setData({feedstream: data.data})
        }
        else{
          wx.showToast({
            title: "没有更多了",
            icon: "success",
            duration: 2000,
          })
        }
      }, (err)=>{
        console.log(err)
        wx.showToast({
          title: err,
          icon: "success",
          duration: 2000,
        })
      }, this.data.offset, this.data.take)
    }
    else if (method == "Collect"){
      this.setData({title: "收藏"})
      API.GetCollectProductFeed((data)=>{
        console.log(data)
        var length = data.data.length
        if(length > 0){
          this.data.offset += length
          for(var i = 0;i<length;i++){
            // mapimageid to url
            var imgs = data.data[i].images
            for(var j = 0;j<imgs.length; j++){
              imgs[j].url = utils.MapImageUrl(imgs[j].url)
            }
            console.log(data.data[i].images)

            // truncate description
            data.data[i].description = utils.truncateText(data.data[i].description, 18)
          }
          this.setData({feedstream: data.data})
        }
        else{
          wx.showToast({
            title: "没有更多了",
            icon: "success",
            duration: 2000,
          })
        }
      }, (err)=>{
        console.log(err)
        wx.showToast({
          title: err,
          icon: "success",
          duration: 2000,
        })
      }, this.data.offset, this.data.take)
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

  }
})