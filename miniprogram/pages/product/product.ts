// pages/product/product.ts
const app = getApp<IAppOption>()
var prodlist = require("../../utils/products.js")
import * as API from "../../utils/serverAPI"
import { listVideoIdByProductId, listAudioIdByProductId, fetchVideo, fetchAideo, fetchVideos, fetchAudios, topercentage, allcached, getProductById, fetchFeedList, MapImageUrl, platform } from "../../utils/util"
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

    displaylist : ["introduction", "comment"],
    display: "introduction",
    feed: prodlist.feed,
    cachebuttondisable: true,
    cachetext: "检查...",

    //评论区
    nocommenticon: MapImageUrl("ohno.jpg"),
    showComment:false,
    commentText: "",
    trimText: "",
    currentreplytoken: "",
    currentreplyid: "",
    comments: [
      // {
      //   id:123,
      //   token: 123,
      //   hasImage:true,
      //   avatar:MapImageUrl("IM.jpg"),
      //   username: "赛博匠人",
      //   time: "2025/4/23",
      //   content: "这个真棒isodjfkldsjfljsdflsjdkf",
      //   image: MapImageUrl("image_01.jpg"),
      //   likecount: 12,
      // },
      // {
      //   id:123,
      //   token: 123,
      //   hasImage:false,
      //   avatar:MapImageUrl("IM.jpg"),
      //   username: "赛博匠人",
      //   time: "2025/4/23",
      //   content: "这个真棒",
      //   image: MapImageUrl("image_01.jpg"),
      //   likecount: 12,
      // },
      // {
      //   id:123,
      //   token: 123,
      //   hasImage:true,
      //   avatar:MapImageUrl("IM.jpg"),
      //   username: "赛博匠人",
      //   time: "2025/4/23",
      //   content: "这个真棒isodjfkldsjfljsdflsjdkf",
      //   image: MapImageUrl("image_01.jpg"),
      //   likecount: 12,
      // },
      // {
      //   id:123,
      //   token: 123,
      //   hasImage:false,
      //   avatar:MapImageUrl("IM.jpg"),
      //   username: "赛博匠人",
      //   time: "2025/4/23",
      //   content: "这个真棒",
      //   image: MapImageUrl("image_01.jpg"),
      //   likecount: 12,
      // }
    ],

    behaviorstatus:{
      liked: false,
      disliked: false,
      collected: false,
      share:false,
      commentcount: 0,
    }
  },

  // 显示评论框
  showCommentModal(evt) {
    if(evt.currentTarget.dataset.token){
      var replyname = evt.currentTarget.dataset.name
      var replytoken = evt.currentTarget.dataset.token
      var replyid = evt.currentTarget.dataset.id
      this.data.currentreplytoken = replytoken
      this.data.currentreplyid = replyid
      this.setData({
        commentText: "@" + replyname + " "
      })
    }
    this.setData({
      showComment: true
    });
  },

  // 隐藏评论框
  hideCommentModal() {
    this.setData({
      showComment: false,
      commentText: '',
      trimText: '',
      currentreplytoken: "",
      currentreplyid: "",
    });
  },

  // 监听评论输入
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value,
      trimText: e.detail.value.trim(),
    });
  },

  // 发送评论
  sendComment() {
    if (!this.data.commentText.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    
    // 这里可以添加发送评论的逻辑，比如调用接口
    API.comment(this.data.productid, this.data.trimText, this.data.currentreplytoken, "", false,
    (data:any)=>{
      wx.showToast({
        title: '评论发送成功',
        icon: 'success'
      });
      
      // 发送成功后关闭弹框
      this.hideCommentModal()
      this.loadC2PBehavior()
      this.loadComments()
      wx.pageScrollTo({
        scrollTop: 0
        });
    }, (err)=>{
      console.error(err)
      wx.showToast({
        title: err,
        icon: 'success'
      });
    })
    
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
    var threads = this.data.product.loadThread
    listVideoIdByProductId(this.data.productid, (videoidlist)=>{
        listAudioIdByProductId(this.data.productid,(audioidlist)=>{
          this.setData({nodecount: videoidlist.length + audioidlist.length})
          // fetch videos
          var step = Math.round(videoidlist.length / threads) // 4 threads
          if(step==0){
            step = 1
          }
          for(var i=0;i<videoidlist.length;i+=step){
            var videoidbatch = []
            for(var j = i; j< i+step && j<videoidlist.length; j++){
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
          
          //fetch audios
          var step = Math.round(audioidlist.length / threads) // 2 threads
          if(step == 0){
            step = 1
          }
          for(var i=0;i<audioidlist.length;i+=step){
            var audioidbatch = []
            for(var j = i; j< i+step && j<audioidlist.length; j++){
              audioidbatch.push(audioidlist[j])
            }
            fetchAudios(this.data.productid, audioidbatch, ()=>{
              this.data.cachednodecount += 1
              var newpercentage = topercentage(this.data.cachednodecount * 1.0 / this.data.nodecount)
              this.setData({cachednodecount: this.data.cachednodecount, cachetext: newpercentage})
              if(this.data.cachednodecount == this.data.nodecount){
                this.setData({cachetext: "已缓存"})
              }
            })
          }
        })
    })
  },
  onlike(evt){
    API.like(this.data.productid,(success)=>{
      this.loadC2PBehavior()
    }, (err)=>{
      console.error(err)
      wx.showToast({
        title: "点赞失败",
        icon: "success",
        duration: 2000
      })
    }, this.data.behaviorstatus.liked)
  },
  ondislike(evt){
    API.dislike(this.data.productid,(success)=>{
      this.loadC2PBehavior()
    }, (err)=>{
      console.error(err)
      wx.showToast({
        title: "反对失败",
        icon: "success",
        duration: 2000
      })
    }, this.data.behaviorstatus.disliked)
  },
  oncollect(evt){
    console.log(111)
    API.collect(this.data.productid,(success)=>{
      this.loadC2PBehavior()
    }, (err)=>{
      console.error(err)
      wx.showToast({
        title: "收藏失败",
        icon: "success",
        duration: 2000
      })
    }, this.data.behaviorstatus.collected)
  },
  onshare(evt){
    API.share(this.data.productid,(success)=>{
      this.loadC2PBehavior()
    }, (err)=>{
      console.error(err)
    })
  },
  loadComments(){
    API.listcomment(this.data.productid, (commentlist)=>{
      var comments = []
      for(var i = 0;i < commentlist.length; i++){
        var commentitem = commentlist[i]
        commentitem.avatar = MapImageUrl(commentitem.avatar)
        var refimage = commentitem.image
        if(refimage.length > 0){
          commentitem.image = MapImageUrl(refimage)
        }
        comments.push(commentitem)
      }
      console.log("comments")
      console.log(comments)
      this.setData({
        comments:comments
      })
    }, (err:any)=>{
      console.error(err)
      wx.showToast({
        title: "评论加载失败",
        icon: "error",
        duration: 2000
      })
    })
  },
  loadC2PBehavior(){
    API.getC2PBehavior(this.data.productid,(data)=>{
      API.GetProductBehaviorInfo(this.data.productid, (data2)=>{
        var newStatus = {
          liked: data.like,
          disliked: data.dislike,
          collected: data.collection,
          share: data.share,
          commentcount: data2.commentcount,
        }
        var product = this.data.product
        product.like = data2.like
        product.dislike = data2.dislike
        product.collection = data2.collection
        product.share = data2.share
        console.log("product status")
        console.log(newStatus)
        this.setData({
          behaviorstatus : newStatus,
          product: product
        })
      }, (err)=>{
        console.error(err)
        wx.showToast({
          title: "加载作品信息失败",
          icon:"success",
          duration:2000,
        })
      })
    }, (err)=>{
        console.error(err)
        wx.showToast({
          title: "加载作品信息失败",
          icon:"success",
          duration:2000,
        })
      })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({productid:options.productid})
    API.GetProductByPackageID(options.productid, (prod:any)=>{
      console.log(prod)
      prod.images[0].url = MapImageUrl(prod.images[0].url)
      prod.author.image = MapImageUrl(prod.author.image)
      this.setData({product: prod})
      this.loadC2PBehavior()
      this.loadComments()
    }, (err: any)=>{
      console.error(err)
      wx.showToast({
        title: "获取作品信息失败",
        icon: "error",
        duration: 2000,
      })
    })
    // getProductById(options.productid, (prod:any)=>{
    //   console.log(MapImageUrl(prod.images[0].url))
    //   prod.images[0].url = MapImageUrl(prod.images[0].url)
    //   this.setData({product: prod})
    // })
    fetchFeedList((feed:any)=>{
      for (var i = 0; i < feed.length; i++){
        feed[i].image = MapImageUrl(feed[i].image)
      }
      this.setData({feed: feed})
    }, (feed:any)=>{})
    // for (var i = 0;i < prodlist.productlist.length; i++){
    //   var prod = prodlist.productlist[i]
    //   if( prod.id == this.data.productid){
    //     this.setData({product: prod})
    //   }
    // }
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
    console.log("productid: " + this.data.productid)
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
    this.loadComments()
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
    // TODO: 应用于APP模式
    // const promise = new Promise(resolve => {
    //   setTimeout(() => {
    //     resolve({
    //       userName: '小程序原始id',  
    //       path: 'pages/index/index',
    //       title: '标题',
    //       imagePath: '/pages/thumb.png',
    //       webpageUrl: 'www.qq.com',
    //       withShareTicket: true,
    //       miniprogramType: 0,
    //       scene: 0, 
    //     })
    //   }, 2000)
    // })
    // return {
    //   userName: '小程序原始id',  
    //   path: 'pages/index/index',
    //   title: '标题',
    //   imagePath: '/pages/thumb.png',
    //   webpageUrl: 'www.qq.com',
    //   withShareTicket: true,
    //   miniprogramType: 0,
    //   scene: 0, 
    //   promise 
    // }
    return {
      title: '这种玩法有点意思，大家来看看',  // 默认是小程序名称
      path: '/pages/index/index?productid='+this.data.productid,  // 默认是当前页面路径
      imageUrl: MapImageUrl(this.data.product.images[0].url)  // 自定义图片路径
    }
  },
  onShareTimeline() {
    return {
      title: '这种玩法有点意思，大家来看看',
      query: 'from=timeline&productid='+this.data.productid,  // 自定义参数
      imageUrl: MapImageUrl(this.data.product.images[0].url)  // 自定义图片路径
    }
  }
})