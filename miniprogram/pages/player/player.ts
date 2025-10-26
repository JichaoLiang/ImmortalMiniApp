import { getAssetLoaderTypes } from "XrFrame/loader/AssetLoader"
import { baseurl } from "../../utils/config"
import { fileexists, fetchAideo, fetchVideo, fetchVideos, getCheckpointfilepathbyPackageiId, getProdById, MapImageUrl, logview } from "../../utils/util"
import * as API from "../../utils/serverAPI"
import * as enums from "../../utils/enum"
import { resource } from "../../utils/resources"

// var ResourceManager = require('../../utils/resourceStore.ts')
var audio = wx.createInnerAudioContext()
audio.volume = 0.3
audio.loop = true
var query = wx.createSelectorQuery()
var temp = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videourl: "",
    videomuted: false,
    continue: false,
    currentNode: "",
    packageId: "",
    context: {},
    preloadcache: {},
    nextlist: "",
    actionList: [],
    showend: false,

    product:{},

    playing: false,
    videoid: "",
    bgmid: "",
    textinput: "",
    showloading: true,
    loadingmsg: "加载中",
    autopass: false,
    displayinput: false,
    defaultnext: "",
    actionclicktimestamp: 0,
    loadingtime: 2000,
    listeningflag: true,

    // 评论弹框
    showComment:false,
    commentText: "",
    trimText: "",
    
    // 行为状态
    behaviorstatus:{
      liked: false,
      disliked: false,
      collected: false,
      share:false,
      commentcount: 0,
    },
    productid: "",

    snapshotNodeid :"",
    snapshotid: "",
    dialog:{
      snapshotNodeid :"",
      snapshotid: "",
    }
  },
  
  onlike(evt){
    API.like(this.data.packageId,(success)=>{
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
    API.dislike(this.data.packageId,(success)=>{
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
    API.collect(this.data.packageId,(success)=>{
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
    API.share(this.data.packageId,(success)=>{
      this.loadC2PBehavior()
    }, (err)=>{
      console.error(err)
    })
  },
  
  loadC2PBehavior(){
    API.getC2PBehavior(this.data.packageId,(data)=>{
      API.GetProductBehaviorInfo(this.data.packageId, (data2)=>{
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
  // 显示评论框
  showCommentModal(evt) {
    if(evt.currentTarget.dataset.token){
      var replyname = evt.currentTarget.dataset.name
      this.setData({
        commentText: "@" + replyname + " "
      })
    }
    API.fetchSnapshotByVideoid(
      this.data.packageId,
      this.data.videoid,
      (data:any)=>{
        console.log("image:" + MapImageUrl(data))

        this.setData({
          showComment: true,
          dialog:{
            snapshotNodeid: data,
            snapshotid: MapImageUrl(data),
          }
        });
      },(err:any)=>{
        console.error(err)
        wx.showToast({
          title: "获取快照失败",
          icon: "error",
          duration: 2000
        })
      }
    )
  },

  // 隐藏评论框
  hideCommentModal() {
    this.setData({
      showComment: false,
      commentText: '',
      trimText: '',
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
    API.comment(this.data.packageId, this.data.trimText, "", this.data.dialog.snapshotNodeid, false,
    (data:any)=>{
      wx.showToast({
        title: '评论发送成功',
        icon: 'success'
      });
      
      // 发送成功后关闭弹框
      this.hideCommentModal()
      this.loadC2PBehavior()
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
  alert(text: any) {
    wx.showToast({
      title: text, //弹框内容
      icon: 'success', //弹框模式
      duration: 2000
    })
  },
  setchattext(evt: any) {
    this.data.context.promptText = evt.detail.value
  },
  buttonaction(evt: any){
    console.log(evt.target.dataset)
    var id = evt.target.dataset.id
    var question = evt.target.dataset.question
    this.clearActions()
    this.showloading(question)
    this.playNode(id)
  },
  showloading(hoveredtext:string){
    this.setData({showloading: true, loadingmsg: hoveredtext})
  },
  hideloading(){
    this.setData({showloading: false, loadingmsg: ""})
  },
  play(callback: any, packageid:any=undefined, nodeid:any=undefined, context:any=undefined) {
    if(!packageid){
      packageid = this.data.packageId
    }
    if(!nodeid){
      nodeid = this.data.currentNode
    }
    if(!context){
      context = this.data.context
    }
    var req = baseurl + 'Immortal/GetVideoFile?packageid=' + escape(packageid) + "&nodeid=" + escape(nodeid) + "&context=" + JSON.stringify(context);
    // var req = 'http://127.0.0.1:5046/Immortal/GetVideoFile' //?packageid=' + escape(packageId) + "&nodeid=" + escape(currentNode) + "&context=" + JSON.stringify(context);
    // alert(req);
    // console.log(escape(this.data.packageId) + "_" + escape(this.data.currentNode) + "_" + JSON.stringify(this.data.context))
    wx.request({
      url: req,
      method: 'POST',
      data: {
        packageid: escape(this.data.packageId),
        nodeid: escape(this.data.currentNode),
        context: JSON.stringify(this.data.context)
      },
      header:{
        "content-type":"application/json"
      },
      success: (response: any) => {
        console.log(response)
        //alert(response);
        // var respJS = JSON.parse(response.data);
        callback(response.data);
      },
      fail:(err:any)=>{
        console.log(err)
      }
    });

  },
  onquit(){
    wx.navigateBack()
  },
  fadeinbuttons(index:number=0, interval:number=1500){
    if(this.data.actionList.length <= index){
      return
    }
    var alist = this.data.actionList
    alist[index].show = true
    this.setData({actionList: alist})
    setTimeout(()=>{
      this.fadeinbuttons(index+1, interval)
    },interval)
  },
  updatedebuginfo(){
    this.setData({currentNode:this.data.currentNode, context:this.data.context, nextlist: this.data.nextlist})
  },
  updateStateByResponse(respJS:any, waitSignal:Boolean=false, callbackAction:any) {
    // alert(JSON.stringify(respJS.node));
    console.log(respJS)
    console.log(111)
    var nodeid = respJS.node.ID;
    this.data.currentNode = nodeid;
    var coxt = respJS.context;
    this.data.context = coxt;
    var actionlist = respJS.nextlist.data;
    this.data.nextlist = actionlist
    this.data.actionList = [];
    var mutekey:string = "mute_" + nodeid
    if(this.data.context.hasOwnProperty(mutekey) && this.data.context[mutekey] > 0) {
      this.data.videomuted = true
    }
    else{
      this.data.videomuted = false
    }
    var defaultnextid:string;
    for (var i = 0; i < actionlist.length; i++) {
        var action = actionlist[i];
        if (action.Preload){
          this.preload(action.ID)
        }
        var newitem = {
            text: action.Question,
            title: action.Title,
            id: action.ID,
            show: false,
        }
        if (i == 0) {
            defaultnextid = action.ID;
        }
        if(action.Title.length > 0){
          this.data.actionList.push(newitem);
        }
    }
    console.log(this.data.actionList)
    this.setData({actionList: this.data.actionList})
    this.updatedebuginfo()
    // updatedebugbox(JSON.stringify(respJS.node), JSON.stringify(actionlist), JSON.stringify(coxt));

    // rebindSubmitButton(currentNode);

    // override video to play
    var videoid = respJS.node.VideoDataKey;
    if (respJS.node.Data && respJS.node.Data.playvideo && respJS.node.Data.playvideo.length > 0) {
        // alert(respJS.node.Data.playvideo);
        videoid = respJS.node.Data.playvideo;
    }
    this.data.videoid = videoid
    fetchVideo(this.data.packageId,this.data.videoid,(path:string)=>{
      var now = new Date().getTime()
      var timespan = now - this.data.actionclicktimestamp
      var timeleft = this.data.loadingtime - timespan
      if(timeleft < 0){
        timeleft = 1
      }
      setTimeout(() => {
        console.log(path)
        this.hideloading()
        this.setData({videourl: path, videomuted: this.data.videomuted})
        this.data.playing = false
        this.handleActions(this.data.context, defaultnextid, path);
        wx.getVideoInfo({src: path,
        success: (res)=>{
          console.log('success')
          var duration = res.duration
          //TODO: load from config or backend
          var donotshowuntilSec = 4
          var timeout = duration - donotshowuntilSec
          console.log('' + timeout)
          if(timeout <= 0){
            this.fadeinbuttons()
          }
          else{
            setTimeout(()=>{this.fadeinbuttons()}, timeout * 1000)
          }
        },fail: (res)=>{
          console.log(res)
        }})
      }, timeleft);
    }, ()=>{})
    // video.attr('src', '/Immortal/GetVideo?packageid=' + packageId + "&videoid=" + videoid);

    // if (waitSignal) {
    //     video.one("canplaythrough", function () {
    //         loadedState = true;
    //         var waitmilisec = 1000;
    //         if (slidechecked && !slided) {
    //             slideTopBar(true, waitmilisec, callbackAction);
    //             // video.off('canplaythrough');
    //             slided = true;
    //             //setTimeout(function () {
    //             //    video[0].play();
    //             //}, waitmilisec);
    //         }
    //     });
    // }
    // else {
    //     var playthroughFunc = function () {
    //         video[0].play();
    //         // video.off('canplaythrough');
    //         callbackAction();
    //     }
    //     video.one("canplaythrough", playthroughFunc);
    // }
    // bgmAudio.attr('src', '/Immortal/GetVideo?packageid=' + packageId + "&audioid=" + )
    // alert(context);
},
playBGM(audioid:string){
  var bgmid = this.data.bgmid
    if (audioid == bgmid) {
      return
  }
  console.log("set bgm: " + audioid)
  this.data.bgmid = audioid
  if (audioid == "") {
      audio.stop()
      audio.src = ""
  }
  else {
    fetchAideo(this.data.packageId, audioid,(file)=>{
      audio.stop()
      audio.src = file
      audio.play()
    },()=>{})
  }
},
clearActions(){
  this.setData({actionList:[]})
},
timeupdate(evt){
  var currenttime = evt.detail.currentTime
  var duration = evt.detail.duration
  const threshold = 0.5
  if (duration - currenttime < threshold && this.data.listeningflag){
    console.log('ticking to: ' + currenttime + " / " + duration)
    this.data.listeningflag = false
    setTimeout(() => {
      this.playend(evt)
      this.data.listeningflag = true
    }, threshold + 0.5);
  }
},
setshowend(){
  var showed = false
  if(this.data.context.hasOwnProperty(enums.showendfeature)){
    showed = this.data.context[enums.showendfeature].length > 0
  }
  else{
    showed = false
  }
  this.data.context[enums.showendfeature] = ""
  this.setData({
    showend: showed
  })
},
playend(evt){
  this.setshowend()
  if(this.data.autopass){
    console.log("autopass" + ":" + this.data.autopass)
    this.playNode(this.data.defaultnext)
  }
},
isActionNode() {
  return this.data.context.NodeType == "Action";
},
handleActions(context:any, defaultnextid:string, videopath:string) {
  if (context.BGMusicKey) {
      this.playBGM(context.BGMusicKey);
  }
  console.log('video duration:')
  wx.getVideoInfo({
    src: videopath,
    success: (info)=>{
      var duration = info.duration
      console.log("duration")
      console.log(duration)
      
      this.data.autopass = context.AutoPass != "False"
      if (context.AutoPass != "False") {
          console.log("autopass")
          this.data.defaultnext = defaultnextid
          setTimeout(() => {
            this.playend(0)
          }, duration * 1000);
      }else{
        this.data.defaultnext = ""
      }
    }
  })

  this.setData({textinput: '', displayinput:this.isActionNode()})
},

  // func(i: number) {
  //   if (buttonList.length > maxbuttonlimit) {
  //     setTimeout(function () { func(i); }, 3000);
  //     return;
  //   }
  //   var item = actionList.pop();
  //   if (!item) {
  //     // setTimeout(function () { func(i); }, 3000);
  //     return;
  //   }
  //   var text = item['text'];
  //   var title = item['title'];
  //   var vid = item['id'];

  //   if (title && title.length > 0) {

  //     var button = dropNewButton(title, video, buttonList.length);
  //     if (title.length == 0) {
  //       button.css('display', 'none');
  //     }

  //     button.click(function (ele) {
  //       // alert($(this).text());
  //       //removeButton($(this), video, buttonList);
  //       clearButton();
  //       setSlideTopBar("\"" + text + "\"", video, vid, true, 2000, afterslidefunc);
  //       // showTopBar("\"" + text + "\"", video, vid);
  //       playNode(vid, true);
  //       // video.attr('src', '/Immortal/GetVideo?packageid=' + packageId + "&videoid=" + vId);
  //     });
  //     buttonList.push(button);

  //     bindtooltip(button, text);
  //   }
  //   setTimeout(function () { func(i + 1); }, 3000);

  // },
  afterslidefunc() {
    // var endpointid = $('#endpoint_id').val();
    // var platformid = $('#platform_id').val();
    // var roomid = $('#room_id').val();
    // sendPlayingNode(endpointid, platformid, roomid, id, currentNode);
    // if (config.enableListenDanmu && context.AutoPass != "True") {
    //     // alert('listen');
    //     listenfunc();
    // }
    //this.func(0);
  },
  playNode(nodeid:string, waitSignal:boolean=false) {

    this.preplay(nodeid)
    if(this.data.preloadcache.hasOwnProperty(nodeid)){
      console.log("load from cached")
      var cacheRespJS = this.data.preloadcache[nodeid]
      this.updateStateByResponse(cacheRespJS, waitSignal, this.afterslidefunc)
      // clear cache
      this.data.preloadcache = {}
    }
    else{
      console.log("load from server")
      this.play((respJS: any) => {
        // alert(JSON.stringify(respJS));
        this.updateStateByResponse(respJS, waitSignal, this.afterslidefunc)
        this.data.preloadcache = {}
      });
    }
  },
  preload(nodeid:string){
    console.log("begin preload")
    var contxt = this.preplay(nodeid, true)
    this.play((respJS: any)=>{
      // var nodeid = respJS.node.ID;
      // this.data.currentNode = nodeid;
      // var coxt = respJS.context;
      // this.data.context = coxt;
      // var actionlist = respJS.nextlist.data;
      // this.data.nextlist = actionlist
      this.data.preloadcache[nodeid] = respJS
    },this.data.packageId, nodeid, contxt)
  },
  preplay(nodeid: string, preloadmode:boolean=false) {
    var contxt = this.data.context
    if(preloadmode){
      contxt = JSON.parse(JSON.stringify(this.data.context))
    }
    contxt.lastnode = this.data.currentNode;
    contxt.currentNode = this.data.nodeid;
    if(!preloadmode){
      this.data.currentNode = nodeid;
      
      this.data.actionclicktimestamp = new Date().getTime();
    }
    // var textboxinput = $('#tb_textinput');
    // context.promptText = textboxinput.val();
    return contxt
  },
savecheckpoint(){
  var path = getCheckpointfilepathbyPackageiId(this.data.packageId)
  if(fileexists(path)){
    wx.getFileSystemManager().unlinkSync(path)
  }
  wx.getFileSystemManager().writeFile({
    filePath:path, 
    data:JSON.stringify({node:this.data.currentNode, nextlist: this.data.nextlist, context:this.data.context}),
    success: (result)=>{
      console.log("checkpoint save success")
    console.log(result)
  }})
},
tryloadcheckpoint(){
  var path:string = getCheckpointfilepathbyPackageiId(this.data.packageId)
  console.log('filepath: ' + path)
  if(fileexists(path)){
    console.log('checkpoint found.')
    var contextstr:string = wx.getFileSystemManager().readFileSync(path,"utf8")
    console.log('get context checkpoint')
    console.log(contextstr)
    var data = JSON.parse(contextstr)
    var node = data.node
    var nextlist = data.nextlist
    var context = data.context
    this.setData({currentNode:node, nextlist:nextlist, context: context})
    return true
  }
  else{
    console.log('no checkpoint found.')
    return false
  }
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) { 
    // deprecated
    // var product = getProdById(option.productid)
    var product = resource.currentProduct
    this.setData({ packageId: option.productid, continue: option.continue == "1", product:product })
    logview(option.productid)
    console.log(this.data.packageId)
    var foundcheckpoint = false
    this.loadC2PBehavior()

    if(this.data.continue){
      foundcheckpoint = this.tryloadcheckpoint()
    }
    if(foundcheckpoint){
      this.playNode(this.data.currentNode, false)
    }
    else{
      this.playNode('', false)
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
    if (audio != undefined){
      try{
        audio.stop()
      }catch{}
    }
    try{
      this.savecheckpoint()
    }
    catch(error){
      console.log(error)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (audio != undefined){
      try{
        audio.stop()
      }catch{}
    }
    try{
      this.savecheckpoint()
    }
    catch(error){
      console.log(error)
    }
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
    var img = this.data.product.images[0].url
    console.log("img")
    console.log(img)
    return {
      title: '这种玩法有点意思，大家来看看',  // 默认是小程序名称
      path: '/pages/index/index?productid='+this.data.productid,  // 默认是当前页面路径
      imageUrl: img  // 自定义图片路径
    }
  },
  onShareTimeline() {
    var img = this.data.product.images[0].url
    return {
      title: '这种玩法有点意思，大家来看看',
      query: 'from=timeline&productid='+this.data.productid,  // 自定义参数
      imageUrl: img // 自定义图片路径
    }
  }
})