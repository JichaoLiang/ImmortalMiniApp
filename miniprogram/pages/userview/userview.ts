import * as utils from "../../utils/util"
import * as API from "../../utils/serverAPI"
import * as resource from '../../utils/resources'
import { isDataValueHandlerExisted } from "XrFrame/core/DataValue"
import { registerComponent } from "XrFrame/xrFrameSystem"
// pages/profile/profile.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMySelf: true,
    usertoken: resource.resource.user.id,
    avatar: utils.MapImageUrl(resource.resource.user.imgid),
    phonenumber: resource.resource.user.phonenumber,
    nickName: resource.resource.user.nickname,
    signature: resource.resource.user.signature,
    platform: utils.platform,

    c2cstatus:{
      follow: false,
      chat:false,
    },
    userstatus:{
      follow:0,
      befollowed:0,
    },

    // person: [],
    feeddata: [],
    feedstate:{  
      nonextpage:false,
      pageindex: 0,
    },

    ohnoimg: utils.MapImageUrl("ohno.jpg"),
    products: [],
    followers: [],
    followedbyme: [],
    history:[],

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
        title: "粉丝",
        contentTitle: "分类浏览",
        contentText: "这里是分类页面，可以按类别查看内容..."
      },
      {
        id: 3,
        title: "关注",
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
        tabs:[tabs[0], tabs[1], tabs[2]]
      })
    }
  },
  onviewuser(evt){
    var usertoken = evt.currentTarget.dataset.id
    utils.viewuserprofile(usertoken)
  },
  onviewproduct(evt){
    console.log(evt)
    var productid = evt.currentTarget.dataset.id
    utils.viewproduct(productid)
  },
  onproductclick(evt){
    var productid = evt.currentTarget.dataset.id
    utils.viewproduct(productid)
  },
  loadproducts(appendmode:boolean=false){
    API.GetProductByAuthorID(this.data.usertoken,(data)=>{
      console.log(data)
      var products = []
      for(var i = 0;i<data.length;i++) {
        var d = data[i]
        var p = {
          id:d.id,
          name: d.name,
          description: d.description,
          image: utils.MapImageUrl(d.images[0].url)
        }
        products.push(p)
      }
      console.log(products)
      this.setData({
        products: products
      })
    },(err)=>{
      console.error(err)
      utils.alert("获取作品列表失败")
    })
  },
  loadfollowers(){
    API.listfollowers(this.data.usertoken, (data)=>{
      var list = data.data
      var followers = []
      for(var i=0;i<list.length;i++){
        list[i].image = utils.MapImageUrl(list[i].image)
        var f = {
          id: list[i].userid,
          avatar:list[i].image,
          nickName:list[i].nickname,
          signature: utils.truncateText(list[i].signature, 30),
        }
        followers.push(f)
      }
      console.log("followers")
      console.log(followers)
      
      this.setData({
        followers: followers
      })
    },(err)=>{
      console.error(err)
      utils.alert("加载粉丝失败")
    })
  },
  loadfollowedbyme(){
    console.log(this.data.usertoken)
    API.listOnesIFollowed(this.data.usertoken, (data)=>{
      var list = data.data
      var followers = []
      console.log(data.data)
      for(var i=0;i<list.length;i++){
        list[i].image = utils.MapImageUrl(list[i].image)
        var f = {
          id: list[i].userid,
          avatar:list[i].image,
          nickName:list[i].nickname,
          signature: utils.truncateText(list[i].signature, 30),
        }
        followers.push(f)
      }
      
      this.setData({
        followedbyme: followers
      })
    },(err)=>{
      console.error(err)
      utils.alert("加载粉丝失败")
    })
  },
  init(){
    this.setVisible()
    this.updateuserbehavior()
    this.loadfollowers()
    this.loadfollowedbyme()
    this.loadproducts()
    this.loadlivefeed(false, this.data.usertoken)
    this.loadhistory()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var usertoken = options.usertoken
    console.log(`user token: ${usertoken}`)
    if(usertoken && !utils.isMe(usertoken)){
      console.log("not me")
      this.setData({isMySelf: false})
      API.ViewUserProfile(resource.resource.user.id, usertoken, (result)=>{
        console.log(result)
        this.setData({
          usertoken: result.id,
          avatar: utils.MapImageUrl(result.imgid),
          nickName: result.nickname,
          signature: result.signature
        })
        this.init()
      },(err:any)=>{
        wx.showToast({
          title: "加载用户信息失败",
          icon: "error",
          duration: 2000,
        })
        wx.navigateBack()
      })
    }
    else{
      console.log("is me")
      this.init()
    }
  },

  /**
   * 读取动态
   */
  decoratefeed(feedlist){
    for(var i = 0;i<feedlist.length; i++){
      var currentitem = feedlist[i]
      var behavior = currentitem.behavior
      feedlist[i].time = utils.reformattime(currentitem.time)
      if(typeof(currentitem.image) == "string"){
        feedlist[i].image = utils.MapImageUrl(currentitem.image)
      }
      if(typeof(currentitem.simage) == "string"){
        feedlist[i].simage = utils.MapImageUrl(currentitem.simage)
      }
      if(typeof(currentitem.pcoverimage) == "string"){
        feedlist[i].pcoverimage = utils.MapImageUrl(currentitem.pcoverimage)
      }
      if(behavior == "danmaku" || behavior == "comment"){
        var extparam = JSON.parse(currentitem.extparam)
        var commentcontent = extparam.content
        if(commentcontent){
          feedlist[i].commentcontent = commentcontent
        }
        if(behavior == "danmaku"){
          feedlist[i].hasimage = true
          var snapshotimage = extparam.nodeid
          if(snapshotimage){
            feedlist[i].snapshotimage = utils.MapImageUrl(snapshotimage)
          }
        }
        else{
          feedlist[i].hasimage = false
        }
      }

      if(behavior == 'article'){
        if(!currentitem.aparentid || typeof(currentitem.aparentid) == 'object'){
          feedlist[i].isreply = false
        }
        else{
          feedlist[i].isreply = true
        }
      }
    }
    console.log(feedlist)
    return feedlist
  },
  async loadhistory(){
    if(!this.data.isMySelf){
      return
    }
    var history:any[] = utils.getviewhistory()
    console.log("history")
    console.log(history)
    history = history.sort((a, b)=> {
      return Date.parse(b.time) - Date.parse(a.time)
    })
    var promiselist = history.map((t) => new Promise((resolve, reject)=>{
      API.GetProductByPackageID(t.productid,(productinfo)=>{
        resolve({time: t.time, productinfo:productinfo})
      },(err)=>{
        resolve(undefined)
          console.log(err)
      })
    }))
    await Promise.all(promiselist).then(t=>{
      console.log("promise all done")
      console.log(t)
      var list = t.map(tt=>tt)
      var entities = list.map((ttt:any)=>{
        var time = ttt.time
        var productinfo = ttt.productinfo
        productinfo.time = utils.reformattime(time)
        if(productinfo.images.length > 0)
        {
          productinfo.image = utils.MapImageUrl(productinfo.images[0].url)
        }
        return productinfo
      })
      this.setData(
        {
          history:entities
        }
      )
    })
  },
  onscrollbottom(){
    if(!utils.pressDelayedButton("viewuser_onscrollbottom")){
      return
    }
    this.loadlivefeed(true, this.data.usertoken)
  },
  loadlivefeed(append:boolean=false, viewtoken:string=""){
    var pagesize = 10
    var status = this.data.feedstate
    if(status.nonextpage){
      return
    }
    
    utils.getLivefeedByMyToken(resource.resource.user.id, status.pageindex, (data)=>{
      // this.bindpersons(data.data)
      var converted = this.decoratefeed(data.data)
      this.data.feeddata.push(...converted)
      status.nonextpage = converted.length < pagesize
      status.pageindex += 1
      this.setData({
        feeddata: this.data.feeddata,
        feedstate: status
      })
    }, (err)=>{
      console.error(err)
      utils.alert("获取动态信息失败")
    }, viewtoken)
  },
  onclickavatar(evt){
    console.log(evt)
    console.log(evt.currentTarget.dataset.id)
  },
  onusercardclick(evt){
    var targettoken = evt.currentTarget.dataset.id
    utils.viewuserprofile(targettoken)
  },
  onproductclick(evt){
    var productid = evt.currentTarget.dataset.id
    utils.viewproduct(productid)
  },
  onviewuserclick(evt){
    var targettoken = evt.currentTarget.dataset.id
    utils.viewuserprofile(targettoken)
  },
  onviewarticleclick(evt){
    console.log(evt)
    var articleid = evt.currentTarget.dataset.id
    utils.viewarticle(articleid)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  updateuserbehavior(){
    var usertoken = this.data.usertoken
    API.getUserBehaviorInfo(usertoken,(res)=>{
      this.setData({
        userstatus: res[0],
      })
      console.log(this.data.userstatus)
    },(err)=>{
      console.error(err)
      utils.alert("加载行为信息失败")
    })
    API.getBehaviorInfoC2C(usertoken, (res)=>{
      console.log(res)
      this.setData({
        c2cstatus: res,
      })
    },(err)=>{
      console.error(err)
      utils.alert("加载行为状态失败")
    })
  },
  onfollowclick(){
    API.follow(this.data.usertoken, (res)=>{
      utils.alert("关注成功")
      this.updateuserbehavior()
      this.loadfollowers()
    },(err)=>{
      console.error(err)
      utils.alert("关注失败")
    })
  },
  onunfollowclick(){
    API.follow(this.data.usertoken, (res)=>{
      utils.alert("取关成功")
      this.updateuserbehavior()
      this.loadfollowers()
    },(err)=>{
      console.error(err)
      utils.alert("取关失败")
    },true)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // this.loadlivefeed(false, this.data.usertoken)
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
  onmessageclick(evt){
    utils.viewimdialog(this.data.usertoken)
  },
  onuseridtap(evt){
    wx.setClipboardData({
      data: this.data.usertoken,
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