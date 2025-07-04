import * as im from "../../utils/IMAPI"
import { resource } from "../../utils/resources";
import * as utils from "../../utils/util"
import { listAudioIdByProductId } from "../../utils/util";

Page({
  data: {
    searchicon: utils.MapImageUrl("search.jpg"),
    stoplistenflag: false,
    conversations: [
      // {
      //   id: 1,
      //   name: '张三',
      //   avatar: '/images/avatar1.jpg',
      //   lastMsg: '你好，最近怎么样？',
      //   lastTime: new Date().getTime() - 3600000 * 2,
      //   unreadCount: 3,
      //   show:true,
      // },
      // {
      //   id: 2,
      //   name: '李四',
      //   avatar: '/images/avatar2.jpg',
      //   lastMsg: '项目文档已经发给你了',
      //   lastTime: new Date().getTime() - 86400000,
      //   unreadCount: 0,
      //   show:true,
      // },
      // {
      //   id: 3,
      //   name: '王五',
      //   avatar: '/images/avatar3.jpg',
      //   lastMsg: '周末一起吃饭吗？',
      //   lastTime: new Date().getTime() - 86400000 * 2,
      //   unreadCount: 1,
      //   show:true,
      // },
      // {
      //   id: 4,
      //   name: '赵六',
      //   avatar: '/images/avatar4.jpg',
      //   lastMsg: '好的，没问题',
      //   lastTime: new Date().getTime() - 86400000 * 3,
      //   unreadCount: 0,
      //   show:true,
      // },
      // {
      //   id: 5,
      //   name: '钱七',
      //   avatar: '/images/avatar5.jpg',
      //   lastMsg: '会议时间是下午3点',
      //   lastTime: new Date().getTime() - 86400000 * 5,
      //   unreadCount: 0,
      //   show:true,
      // }
    ],
    
    listenrequest: null,
  },
  onsearchinput(evt){
    console.log(evt)
    var data = evt.detail.value
    for(var i = 0;i<this.data.conversations.length;i++)
    {
      var current = this.data.conversations[i]
      current.show = current.name.indexOf(data) >= 0 || current.lastMsg.indexOf(data) >= 0
    }
    this.setData({
      conversations: this.data.conversations
    })
  },
  stoplisten(){
    if(this.data.listenrequest){
      this.data.listenrequest.abort()
    }
  },
  onLoad() {
    // 这里可以添加从服务器获取消息列表的逻辑
  },
  onUnload(){
    try
    {
      this.stoplisten()
    }catch(ex){}
  },

  onShow() {
    // 清除所有监听
    im.clearlistenerreqeusts()
    // 页面显示时刷新消息列表
    this.getConversations(this.listenupdates);
  },
  updatedialogs(data){
    console.log("update dialog start.")
    var messages = data.messages
    var dict = {}
    console.log(`messages: ${messages}`)
    for(var i = 0;i<messages.length;i++){
      var msg = messages[i]
      var conversationid = msg.conversationid
      var name = msg.name
      var avatar = msg.avatar
      var token = msg.token
      var content = msg.message
      var time = Date.parse(msg.createtime)
      if(!dict.hasOwnProperty(conversationid)){
        dict[conversationid] = []
      }
      dict[conversationid].push(
        {
          name:name,
          avatar:avatar,
          token:token,
          content:content,
          time: time
        }
      )
    }
    console.log(`dict: ${dict}`)
    for(var key in dict){
      console.log(`key: ${key}`)
      var current:Array = dict[key]
      current.sort((a, b)=>{
        return a.time - b.time
      })
      var last = current[current.length - 1]
      console.log(this.data.conversations[0].conversationid)
      for(var i = 0;i<this.data.conversations.length;i++){
        var match = this.data.conversations[i]
        if(match.conversationid != key){
          continue;
        }
        console.log(`set matched: `)
        // match.name = last.name
        // match.avatar = utils.MapImageUrl(last.avatar)
        // match.token = last.token
        match.lastMsg = last.content
        match.lastTime = this.formatTime(last.time)
        console.log(`unread from ${match.unreadCount} , then + ${current.length}`)
        match.unreadCount += current.length
      }
    }
    this.setData({
      conversations: this.data.conversations
    })
  },

  onHide(){
    // 清除所有监听
    im.clearlistenerreqeusts()
    this.data.stoplistenflag = true
  },
  listenupdates(){
    this.data.stoplistenflag = false
    var tiemoffset = []
    var tokenlist = []
    var conversations = this.data.conversations
    for(var i = 0;i< conversations.length;i++){
      var conversation = conversations[i]
      var cachekey = im.getconversationcacheid(resource.user.id, conversation.token)
      var cache = wx.getStorageSync(cachekey)
      if(cache){
        var time = cache.timeoffset
        var messages = cache.messages
        if(messages.length > 0){
          this.data.conversations[i].lastMsg  = messages[messages.length - 1].content
        }
        this.data.conversations[i].lastreadtime = new Date(time)
        this.data.conversations[i].lastTime = this.formatTime(time)
        tiemoffset.push(new Date(time))
      }
      else{
        tiemoffset.push(new Date(Date.parse("1970-01-01")))
        this.data.conversations[i].lastreadtime = new Date(Date.parse("1970-01-01"))
        this.data.conversations[i].lastTime = this.formatTime(Date.parse("1970-01-01"))
      }
      tokenlist.push(conversation.token)
    }
    this.setData({
      conversations: this.data.conversations
    })
    if(this.data.conversations.length == 0){
      return
    }
    im.ListenBatch(tokenlist, tiemoffset, (data)=>{
      console.log(data)
      this.updatedialogs(data)
    }, (err)=>{
      console.error(err)
      // utils.alert("获取列表更新失败")
    })
  },

  getConversations(callback) {
    im.listconversations((data)=>{
      console.log(data)
      var list = []
      for(var i = 0;i<data.length;i++){
        var d = data[i]
        var item = 
        {
          id: i,
          name: d.nickname.join(","),
          avatar: utils.MapImageUrl(d.image[0]),
          token: d.token[0],
          lastMsg: '',
          lastTime: '',
          lastreadtime: new Date(Date.parse("1970/01/01")),
          unreadCount: 0,
          show:true,
          conversationid: d.conversationid,
        }
        list.push(item)
      }
      this.setData({
        conversations: list
      })
      if(callback){
        callback()
      }
    }, (err)=>{
      console.error(err)
      utils.alert("加载聊天列表失败")
    })
    // 模拟从服务器获取数据
    wx.showLoading({ title: '加载中...' });
    setTimeout(() => {
      wx.hideLoading();
      // 实际开发中这里应该是从服务器获取数据
      // this.setData({ conversations: newData });
    }, 500);
  },
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000 && date.getDate() === now.getDate()) {
      // 今天
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else if (diff < 86400000 * 2 && date.getDate() === now.getDate() - 1) {
      // 昨天
      return '昨天';
    } else if (diff < 86400000 * 7) {
      // 一周内
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return days[date.getDay()];
    } else {
      // 更早
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    }
  },

  navigateToChat(e) {
    const token = e.currentTarget.dataset.token;
    utils.viewimdialog(token)
  }
});