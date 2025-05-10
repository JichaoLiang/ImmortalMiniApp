import * as utils from "../../utils/util"
import * as API from "../../utils/serverAPI"
import { setNodeName } from "XrFrame/kanata/lib/index";

Page({
  data: {
    article: {},
    richcontent: {},

    replies: [],
    comments: [],
    commentContent: '',
    articleId: '',

    shareicon: utils.MapImageUrl("share.jpg"),
    replypageindex: 0
  },
  
  onLoad(options) {
    this.setData({
      articleId: options.id
    });
    this.loadArticle();

    // this.loadComments();
    // this.incrementViewCount();
  },
  onShow(){
    console.log("onshow")
    this.loadreply()
    this.updatepreview()
  },
  
  loadArticle() {
    wx.showLoading({
      title: '加载中...',
    });
    
    API.loadarticeinfo(this.data.articleId,(res)=>{
      wx.hideLoading()
      var data= res.data
      var richtextkey = data.contentkey
      data.image = utils.MapImageUrl(data.image)
      data.nickname = utils.truncateText(data.nickname, 15)
      data.signature = utils.truncateText(data.signature, 30)
      utils.fetchResourceTxt(richtextkey,(res)=>{
        data.richtext = res
        this.setData({
          article: data
        })
        // console.log("afterset")
        // console.log(data)
        
        this.updatepreview()
      }, (err)=>{
        console.error(err)
        utils.alert("加载文章内容失败")
      })
    },(err)=>{
      console.error(err)
      wx.hideLoading()
      utils.alert("加载文章失败")
    })
  },
  loadreply(){
    console.log("load reply")
    console.log(this.data.articleId)
    if(this.data.articleId == ''){
      setTimeout(() => {
        this.loadreply()
      }, 1000);
      return
    }
    this.data.replies = []
    API.loadarticlereplies(this.data.articleId, this.data.replypageindex, (res)=>{
      console.log('replies:')
      console.log(res.data)
      var datastatus = {count:0, target: res.data.length}
      for(var i = 0;i< res.data.length; i++){
        var data= res.data[i]
        var richtextkey = data.contentkey
        if(data.image){
          data.image = utils.MapImageUrl(data.image)
        }
        if(data.nickname){
          data.nickname = utils.truncateText(data.nickname, 15)
        }
        if(data.signature){
          data.signature = utils.truncateText(data.signature, 30)
        }
        
        var fetchtextfunc = ()=>{
          utils.fetchResourceTxt(richtextkey,(res)=>{
            data.richtext = res
            if(typeof(res)=="object"){
              setTimeout(fetchtextfunc, 1000)
              return
            }
            this.data.replies.push(data)
            datastatus.count += 1
            if(datastatus.count == datastatus.target){
            // console.log(this.data.replies)
              this.updatepreview()
            }
          }, (err)=>{
            console.error(err)
            this.setData({
              article: data
            })
          })
        }
        fetchtextfunc()
      }
    },(err)=>{
      console.error(err)
      wx.hideLoading()
      utils.alert("加载回复失败")
    })
  },
  onviewuser(e){
    // console.log(e)
    var targettoken = e.currentTarget.dataset.id
    utils.viewuserprofile(targettoken)
  },
  onreply(evt){
    // console.log(evt)
    var replyid = evt.currentTarget.dataset.replyid
    var replyname = "@" + evt.currentTarget.dataset.replyname
    var topic = this.data.article.topic
    // console.log(this.data.article)
    // console.log("navigate: " + `../articleedit/articleedit?topic=${topic}&parent=${replyid}&initText=${replyname}&replyuser=${replyname}`)
    wx.navigateTo({url:`../articleedit/articleedit?topic=${topic}&parent=${replyid}&initText=${replyname}&replyuser=${replyname}`})
  },

  updatepreview(){
    var richtext = this.data.article.richtext
    // console.log(richtext)
    var app = getApp()
    var parseddata = app.towxml(richtext, "html")
    // console.log(parseddata)

    var replies = this.data.replies
    // console.log(replies)
    for(var i = 0;i< replies.length; i++){
      var richtxt = replies[i].richtext
      replies[i].parseddata = app.towxml(richtxt, "html")
    }
    this.setData({
      richcontent:parseddata,
      replies: this.data.replies
    })
  },
  
  loadComments() {
    const db = wx.cloud.database();
    db.collection('comments')
      .where({
        articleId: this.data.articleId
      })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        this.setData({
          comments: res.data
        });
      })
      .catch(err => {
        console.error(err);
      });
  },
  
  incrementViewCount() {
    const db = wx.cloud.database();
    db.collection('articles').doc(this.data.articleId).update({
      data: {
        viewCount: db.command.inc(1)
      }
    });
  },
  
  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },
  
  async submitComment() {
    if (!this.data.commentContent.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '提交中...',
    });
    
    try {
      // 获取用户信息
      const userRes = await wx.cloud.callFunction({
        name: 'getUserInfo'
      });
      const userInfo = userRes.result.userInfo;
      
      const db = wx.cloud.database();
      
      // 添加评论
      await db.collection('comments').add({
        data: {
          articleId: this.data.articleId,
          content: this.data.commentContent,
          author: userInfo.nickName,
          authorAvatar: userInfo.avatarUrl,
          createTime: db.serverDate()
        }
      });
      
      // 更新文章评论数
      await db.collection('articles').doc(this.data.articleId).update({
        data: {
          commentCount: db.command.inc(1)
        }
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '评论成功',
      });
      
      this.setData({
        commentContent: ''
      });
      
      // 重新加载评论和文章
      this.loadComments();
      this.loadArticle();
    } catch (err) {
      console.error(err);
      wx.hideLoading();
      wx.showToast({
        title: '评论失败',
        icon: 'none'
      });
    }
  },
  
  formatTime(time) {
    if (!time) return '';
    const date = new Date(time);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }
});