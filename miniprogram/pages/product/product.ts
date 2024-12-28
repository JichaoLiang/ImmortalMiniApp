// pages/product/product.ts
const app = getApp<IAppOption>()
var prodlist = require("../../utils/products.js")
import { listVideoIdByProductId, fetchVideo, fetchAideo, fetchVideos, topercentage, allcached } from "../../utils/util"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productid: "",
    product: {

    },
    nodecount:0,
    cachednodecount:0,

    displaylist : ["introduction", "comments"],
    display: "introduction",
    feed: prodlist.feed,
    cachebuttondisable: true,
    cachetext: "检查...",
  },
  play(evt:any){
    wx.navigateTo({url: "/pages/player/player?continue=0&productid=" + this.data.productid})
  },
  continue(eve:any){
    wx.navigateTo({url: "/pages/player/player?continue=1&productid=" + this.data.productid})
  },
  productDetail(evt:any){
    var prodid = evt.target.dataset.prodid
    wx.navigateTo({url: "/pages/product/product?productid=" + prodid})
  },
  switchtab(evt:any){
    var tabdata = evt.target.dataset.id
    this.setData({display: tabdata})
  },
  cacheproduct(evt:any){
    this.setData({cachebuttondisable: true})
    listVideoIdByProductId(this.data.productid, (videoidlist)=>{
      this.setData({nodecount: videoidlist.length})
      var step = Math.round(videoidlist.length / 4) // 4 threads
      for(var i=0;i<videoidlist.length;i+=step){
        var videoidbatch = []
        for(var j = i; j< i+step; j++){
          videoidbatch.push(videoidlist[j])
        }
        fetchVideos(this.data.productid, videoidbatch, ()=>{
          this.data.cachednodecount += 1
          var newpercentage = topercentage(this.data.cachednodecount * 1.0 / this.data.nodecount)
          this.setData({cachednodecount: this.data.cachednodecount, cachetext: newpercentage})
          if(this.data.cachednodecount == this.data.nodecount){
            this.setData({cachetext: "已缓存"})
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({productid:options.productid})
    for (var i = 0;i < prodlist.productlist.length; i++){
      var prod = prodlist.productlist[i]
      if( prod.id == this.data.productid){
        this.setData({product: prod})
      }
    }
    // wx.request({
    //   url: 'http://localhost:5046/Immortal/ListVideos?packageid=' + this.data.productid, // 开发者服务器接口地址
    //   method: 'GET', // HTTP 请求方法，默认为 GET
    //   header: {
    //     'content-type': 'application/json' // 设置请求的 header，默认为 application/json
    //   },
    //   success(res) {
    //     console.log(res.data); // 接口调用成功的回调函数
    //     //result = res.data
    //   },
    //   fail(err) {
    //     console.error(err); // 接口调用失败的回调函数
    //     // errordetail = err
    //     // error = true
    //   },
    //   complete() {
    //     // getresult = true
    //   }
    //   });
    //console.log("test all cached")
    allcached(this.data.productid, (result)=>{
      if(result){
        this.setData({cachetext: "已缓存", cachebuttondisable: true})
      }else{
        this.setData({cachetext: "预加载", cachebuttondisable: false})
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