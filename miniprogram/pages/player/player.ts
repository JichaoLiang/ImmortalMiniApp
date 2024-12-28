import { getAssetLoaderTypes } from "XrFrame/loader/AssetLoader"
import { fileexists, fetchAideo, fetchVideo, fetchVideos, getCheckpointfilepathbyPackageiId, getProdById } from "../../utils/util"

// var ResourceManager = require('../../utils/resourceStore.ts')
var audio = wx.createInnerAudioContext()
audio.volume = 0.1
var query = wx.createSelectorQuery()
var temp = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videourl: "http://39.105.153.38/Immortal/GetVideo?packageid=xujiangv15&videoid=immortal_2024_8_9_21_19_34_817",
    continue: false,
    currentNode: "",
    packageId: "",
    context: {},
    nextlist: "",
    actionList: [],

    product:{},

    playing: false,
    videoid: "",
    bgmid: "",
    textinput: "",
    showloading: false,
    loadingmsg: "",
    autopass: false,
    displayinput: false,
    defaultnext: "",
    actionclicktimestamp: 0,
    loadingtime: 2000,
    listeningflag: true,
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
  play(callback: any) {
    var req = 'http://39.105.153.38/Immortal/GetVideoFile?packageid=' + escape(this.data.packageId) + "&nodeid=" + escape(this.data.currentNode) + "&context=" + JSON.stringify(this.data.context);
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
    var defaultnextid:string;
    for (var i = 0; i < actionlist.length; i++) {
        var action = actionlist[i];
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
        this.setData({videourl: path})
        this.data.playing = false
        this.handleActions(this.data.context, defaultnextid, path);
        this.fadeinbuttons()
      }, timeleft);
    })
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
    })
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
playend(evt){
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
    this.play((respJS: any) => {
      // alert(JSON.stringify(respJS));
      this.updateStateByResponse(respJS, waitSignal, this.afterslidefunc)
    });
  },

  preplay(nodeid: string) {
    this.data.context.lastnode = this.data.currentNode;
    this.data.context.currentNode = this.data.nodeid;
    this.data.currentNode = nodeid;
    
    this.data.actionclicktimestamp = new Date().getTime();

    // var textboxinput = $('#tb_textinput');
    // context.promptText = textboxinput.val();
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
    var product = getProdById(option.productid)
    this.setData({ packageId: option.productid, continue: option.continue == "1", product:product })
    console.log(this.data.packageId)
    var foundcheckpoint = false
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
    catch{}
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