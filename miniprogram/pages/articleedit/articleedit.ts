// const towsml = require('/miniprogram_npm/towxml/index')
import * as API from "../../utils/serverAPI"
import * as utils from "../../utils/util"
import * as config from "../../utils/config"
Page({
  data: {
    images: [],
    video: null,
    article: {},
    topicid: "-1",
    parent: "",
    parentname: "",
    input: {
      title: "",
      content:{
        richtext: "",
        cursor: 0,
      }
    },
    // preview
    showComment:false,
    commentText: "",
    imagemapping: [],
    videomapping: [],

    // pending box
    showpending: false,
  },
  onLoad(option){
    if(option.topic){
      this.data.topicid = option.topic
    }
    if(option.parent){
      this.data.parent = option.parent
    }
    if(option.initText){
      this.data.input.content.richtext = option.initText + " "
    }
    if(option.replyuser){
      this.data.parentname = option.replyuser
    }
    this.setData({
      topicid:this.data.topicid,
      input: this.data.input,
      parent: this.data.parent,
      parentname:this.data.parentname,
    })
    console.log(this.data.topicid)
    console.log(this.data.parent)
    // var app = getApp()
    // var parseddata = app.towxml("<p>富文本</p><br /> <a href='https://www.liangjichao.com/'>梁先生的個人網站</a>", "html")
    
    // this.setData({
    //   article: parseddata,
    // })
  },
  showpending(){
    this.setData({
      showpending:true
    })
  },
  hidependding(){
    this.setData({
      showpending:false
    })
  },
  // 显示评论框
  showCommentModal(evt) {
    this.updatepreview()
    this.setData({
      showComment: true
    });
  },

  // 隐藏评论框
  hideCommentModal() {
    this.setData({
      showComment: false
    });
  },
  insertstringtocursor(text:string, replace:string, cursor:number){
    return text.substring(0, cursor) +  replace + text.substring(cursor)
  },
  oncontentinput(evt){
    // console.log(evt)
    var text = evt.detail.value
    var cursor = evt.detail.cursor
    var input = this.data.input
    var content = input.content;

    var replaceline = '<br />\n'
    if(text[cursor-1] == '\n')
    {
      text = this.insertstringtocursor(text, replaceline, cursor)
      cursor += replaceline.length
    }
    content.richtext = text
    content.cursor = cursor
    this.setData({
      input: input
    })
    this.updatepreview()
  },
  decodePlaceholder(richtext:string){
    var imgmapping = this.data.imagemapping
    var vidmapping = this.data.videomapping
    var temp = richtext
    for(var i = 0;i<imgmapping.length;i++){
      var placeholder = `[image_${i}]`
      var src = imgmapping[i]
      temp = temp.replace(placeholder, src)
    }
    for(var i = 0;i<vidmapping.length;i++){
      var placeholder = `[video_${i}]`
      var src = vidmapping[i]
      temp = temp.replace(placeholder, src)
    }
    return temp
  },
  updatepreview(){
    var app = getApp()
    var decoded = this.decodePlaceholder(this.data.input.content.richtext)
    decoded = `<h1 style="width:100%; text-align:center;">${this.data.input.title}</h1>` + decoded
    var parseddata = app.towxml(decoded, "html")
    this.setData({
      article:parseddata
    })
  },
  
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        var path = res.tempFilePaths[0]
        this.showpending()
        API.uploadfile(path, "jpg", (result)=>{
          this.hidependding()
          var imgid = result
          var link = utils.MapImageUrl(imgid)
          var imghtml = `<img style='max-width: 80%; height:auto; object-fit:cover; object-position:center' src='${link}'></img>`

          var text = this.data.input.content.richtext
          var cursor = this.data.input.content.cursor
          var imgmapping = this.data.imagemapping
          imgmapping.push(link)
          var imgindex = imgmapping.length - 1
          var placeholder = `[image_${imgindex}]`
          var replaced = imghtml.replace(link, placeholder)
          this.data.input.content.richtext = this.insertstringtocursor(text, imghtml, cursor).replace(link, placeholder)
          this.data.input.content.cursor += replaced.length
          
          this.setData({
            input: this.data.input,
          })
          this.updatepreview()
        },(err:any)=>{
          this.hidependding()
        })
      }
    });
  },
  onsubmit(){
    console.log([this.data.topicid, this.data.input.title, this.decodePlaceholder(this.data.input.content.richtext), this.data.parent])
    API.newarticle(this.data.topicid, this.data.input.title, this.decodePlaceholder(this.data.input.content.richtext), this.data.parent, (res) =>{
      utils.alert("创建成功")
      var pages = getCurrentPages();
      var lastpage = pages[pages.length - 2]
      wx.navigateBack()
      // wx.navigateBack({
      //   success: ()=>{
      //     setTimeout(() => {
      //       if(lastpage.onShow){
      //         console.log('navigate back: call last page onshow')
      //         lastpage.onShow()
      //       }
      //     }, 100);
      //   }
      // })
    }, (err)=>{
      utils.alert("创建失败, 请稍后再试")
    })
  },
  oninputtitle(evt){
    var title = evt.detail.value.trim()
    this.data.input.title = title
    this.updatepreview()
  },
  chooseVideo() {
    wx.chooseMedia({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: res => {
        var tempfile = res.tempFiles[0]
        var path = tempfile.tempFilePath
        var filetype = tempfile.fileType
        var duration = tempfile.duration
        var size = tempfile.size
        if(filetype != "video"){
          utils.alert("上传文件不是视频")
          return
        }
        if(duration > config.maxUploadVideoDurationSEC){
          utils.alert("视频过长")
          return
        }
        if(size > config.maxUploadVideoSizeBYTE){
          utils.alert("视频过大")
          return
        }
        this.showpending()
        API.uploadfile(path, "mp4", (result)=>{
          this.hidependding()
          var vidid = result
          var link = utils.MapVideoUrl(vidid)
          var imghtml = `<video style='max-width: 80%; max-height:80%' src='${link}'></video>`

          var text = this.data.input.content.richtext
          var cursor = this.data.input.content.cursor
          var videomapping = this.data.videomapping
          videomapping.push(link)
          var vidindex = videomapping.length - 1
          var placeholder = `[video_${vidindex}]`
          var replaced = imghtml.replace(link,placeholder)
          this.data.input.content.richtext = this.insertstringtocursor(text, imghtml, cursor).replace(link, placeholder)
          this.data.input.content.cursor += replaced.length
          
          this.setData({
            input: this.data.input,
          })
          this.updatepreview()
        },(err:any)=>{
          this.hidependding()
        })
      }
    });
  },
  
  async submitForm(e) {
    const { title, content } = e.detail.value;
    
    if (!title || !content) {
      wx.showToast({
        title: '标题和内容不能为空',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '发布中...',
    });
    
    try {
      // 上传图片
      const imageUrls = [];
      for (const path of this.data.images) {
        const cloudPath = `article-images/${Date.now()}-${Math.floor(Math.random() * 1000)}${path.match(/\.[^.]+?$/)[0]}`;
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: path
        });
        imageUrls.push(uploadRes.fileID);
      }
      
      // 上传视频
      let videoUrl = '';
      if (this.data.video) {
        const cloudPath = `article-videos/${Date.now()}-${Math.floor(Math.random() * 1000)}${this.data.video.match(/\.[^.]+?$/)[0]}`;
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: this.data.video
        });
        videoUrl = uploadRes.fileID;
      }
      
      // 获取用户信息
      const userRes = await wx.cloud.callFunction({
        name: 'getUserInfo'
      });
      const userInfo = userRes.result.userInfo;
      
      // 保存文章数据
      const db = wx.cloud.database();
      await db.collection('articles').add({
        data: {
          title,
          content,
          images: imageUrls,
          video: videoUrl,
          author: userInfo.nickName,
          authorAvatar: userInfo.avatarUrl,
          createTime: db.serverDate(),
          viewCount: 0,
          commentCount: 0
        }
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error(err);
      wx.hideLoading();
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  }
});