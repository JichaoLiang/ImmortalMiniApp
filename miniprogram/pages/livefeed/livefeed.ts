// pages/livefeed/livefeed.ts
import * as utils from "../../utils/util"
import * as API from "../../utils/serverAPI"
import * as im from "../../utils/IMAPI"
import { resource } from "../../utils/resources"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    person: [{
      token:"ALL",
      avatarurl:utils.MapImageUrl("IM.jpg"),
      nickname: "全部",
      signature: "",
      active: false,
    }],
    currentavatar: "ALL",
    feedstream: {},
    feeddata: [],
    feedstate:{
    },

    ohnoimg: utils.MapImageUrl("ohno.jpg")
  },
  bindpersons(livefeed:any[]){
    var result = [this.data.person[0]]
    for(var i = 0;i<livefeed.length; i++){
      var currentfeeditem = livefeed[i]
      var token = currentfeeditem.token
      var snickname = utils.truncateText(currentfeeditem.snickname, 6)
      var ssignature = currentfeeditem.ssignature
      var simage = utils.MapImageUrl(currentfeeditem.simage)
      var exists = false
      for(var j=0;j<result.length;j++){
        if(result[j].token == token){
          exists = true
        }
      }
      if(!exists){
        var person = {
          token:token,
          avatarurl:simage,
          nickname: snickname,
          signature: ssignature,
          active: false
        }
        result.push(person)
      }
    }
    this.setData({
      person: result
    })
  },
  onavartarclick(evt){
    console.log(evt)
    var targettoken = evt.currentTarget.dataset.id
    if(targettoken == "ALL"){
      this.loadlivefeed(false , "")
    }
    else{
      this.loadlivefeed(false , targettoken)
    }
  },
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
  getActivePerson(){
    // console.log(this.data.person)
    return this.data.person.find(t=>t.active).token
  },
  onscrollbottom(){
    var person = this.getActivePerson()
    if(!person){
      person = ""
    }
    this.loadlivefeed(false, person)
  },
  getCateKey(k){
    if(k == ""){
      k = "ALL"
    }
    return k
  },
  updatecurrentfeed(key){
    this.setData({
      feeddata: this.data.feedstream[key]
    })
    this.updateperson(key)
  },
  updateperson(token){
    var pointer = token
    if(pointer == ""){
      pointer = "ALL"
    }
    this.data.person.map(item=>{
      item.active = item.token == pointer
    })
    this.setData({
      person: this.data.person
    })
  },
  loadlivefeed(append:boolean=false, viewtoken:string=""){
    var cate = this.getCateKey(viewtoken)
    if(!this.data.feedstate.hasOwnProperty(cate)){
      var defaultstatus = {  
        nonextpage:false,
        pageindex: 0,
      }
      this.data.feedstate[cate] = defaultstatus
    }
    var status = this.data.feedstate[cate]
    if(status.nonextpage){
      this.updatecurrentfeed(cate)
      return
    }
    var pindex = status.pageindex
    var pagesize = 10
    utils.getLivefeedByMyToken(resource.user.id, pindex, (data)=>{
      this.bindpersons(data.data)
      var converted = this.decoratefeed(data.data)

      status.nonextpage = data.data.length < pagesize
      status.pageindex += 1
      this.data.feedstate[cate] = status
      if(!this.data.feedstream.hasOwnProperty(cate)){
        this.data.feedstream[cate] =[]
      }
      this.data.feedstream[cate].push(...converted)
      this.updatecurrentfeed(cate)
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
    var targettoken = evt.currentTarget.dataset.token
    utils.viewuserprofile(targettoken)
  },
  onviewarticleclick(evt){
    console.log(evt)
    var articleid = evt.currentTarget.dataset.id
    utils.viewarticle(articleid)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
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
    // 清除所有监听
    im.clearlistenerreqeusts()
    this.loadlivefeed(false)
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