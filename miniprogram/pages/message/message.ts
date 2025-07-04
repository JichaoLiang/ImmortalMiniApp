// pages/chat/chat.js
import * as utils from "../../utils/util"
import * as API from "../../utils/serverAPI"
import * as im from "../../utils/IMAPI"
import { resource } from "../../utils/resources";
Page({
  data: {
    touser: '',
    timeoffset: Date.parse("1970-01-01"),
    stoplistenflag: false,
    chatName: '聊天对象',
    inputValue: '',
    inputFocus: false,
    lastMsgId: 0,
    messages: [
      // {
      //   id: 1,
      //   isMe: false,
      //   avatar: utils.MapImageUrl("im.jpg"),
      //   content: '你好，最近怎么样？',
      //   time: '10:30',
      //   showTime: true
      // },
      // {
      //   id: 2,
      //   isMe: true,
      //   avatar: utils.MapImageUrl("im.jpg"),
      //   content: '还不错，你呢？',
      //   time: '10:32',
      //   showTime: false
      // },
      // {
      //   id: 3,
      //   isMe: false,
      //   avatar: utils.MapImageUrl("im.jpg"),
      //   content: '我也挺好的，周末有空一起吃饭吗？',
      //   time: '10:33',
      //   showTime: false
      // }
    ],

    listenrequest: null,
  },
  loaduserinfo(){
    API.fetchUserInfoByToken(this.data.touser, (data)=>{
      console.log(data)
      this.setData({
        chatName: data.nickname
      })
    }
    ,(err)=>{
      console.error(err)
      utils.alert("获取用户信息失败")
    })
  },
  savedialogcache(){
    var key = im.getconversationcacheid(resource.user.id, this.data.touser)
    console.log(`save time: ${this.data.timeoffset}`)
    wx.setStorageSync(key,{
        timeoffset: this.data.timeoffset,
        messages: this.data.messages
      }
    )
  },
  cleardialogcache(){
    var key = `conversatino_${resource.user.id}_${this.data.touser}`
    console.log(`save time: ${this.data.timeoffset}`)
    wx.setStorage({
      key: key,
      data: null
    })
  },
  getlastmsgid(messages:any){
    if(!messages){
      messages = this.data.messages
    }
    console.log(messages.length)
    if(messages.length == 0){
      return 0
    }
    var lastitem = messages[messages.length - 1]
    console.log(lastitem)
    return lastitem.id
  },
  restoredialogcache(){
    var key = im.getconversationcacheid(resource.user.id, this.data.touser)
    var content = wx.getStorageSync(key)
    console.log(`storagecontent: ${content}`)
    if(content)
    {
      this.setData({
        timeoffset: content.timeoffset,
        messages: content.messages,
      })
    }
    setTimeout(() => {
      this.setData({
        lastMsgId: this.getlastmsgid(content.messages)
      }) 
    }, 300);
  },
  listen(){
    console.log(this.data.timeoffset)
    im.Listen(this.data.touser, new Date(this.data.timeoffset), (data)=>{
      console.log(data)
      var messages = this.data.messages
      var msgarray = data.messages
      var lastid = 1
      if(messages.length > 0){
        lastid = messages[messages.length - 1].id
      }
      var newmsg = []
      for(var i=0;i<msgarray.length; i++){
        var msg = msgarray[i]
        lastid += 1
        var newitem = 
        {
          id: lastid,
          isMe: utils.isMe(msg.token),
          avatar: utils.MapImageUrl(msg.avatar),
          content: unescape(msg.message),
          time: msg.createtime,
          showTime: false
        }
        newmsg.push(newitem)
      }
      console.log(`lastid: ${lastid}`)
      this.setData({
        messages: [...this.data.messages, ...newmsg],
      })
      // sync code seems not work correctly, delay 300ms to scroll to bottom
      setTimeout(() => {
        this.setData({
          lastMsgId: lastid
        })
      }, 300);
      this.data.timeoffset = Date.parse(data.timeoffset)
      this.savedialogcache()
    },(err)=>{
      console.error(err)
      // utils.alert("收取信息失败")
    })
  },
  stoplisten(){
    if(this.data.listenrequest){
      this.data.listenrequest.abort()
    }
  },
  onUnload(){
    console.log("unload")
    try
    {
      this.stoplisten()
    }catch(ex){
      console.error(err)
    }
  },
  onLoad: function(options) {
    // 清除所有监听
    im.clearlistenerreqeusts()
    if(options.touser){
      this.data.touser = options.touser
      this.loaduserinfo()
      this.restoredialogcache()
      this.listen()
    }
    if (options.name) {
      this.setData({ chatName: options.name });
    }
    // this.setData({ lastMsgId: this.data.messages[this.data.messages.length - 1].id });
  },
  
  onInput: function(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onsendmessage(){
    var msg = this.data.inputValue.trim()
    if (!msg) return;
    im.sendmessage(this.data.touser, msg,(success)=>{
      this.setData({
        inputValue: ''
      })
    }
    ,(err)=>{
      console.error(err)
      utils.alert("发送失败")
    })
  },
  
  sendMessage: function() {
    if (!this.data.inputValue.trim()) return;
    
    const newMsg = {
      id: this.data.lastMsgId + 1,
      isMe: true,
      avatar: utils.MapImageUrl("im.jpg"),
      content: this.data.inputValue,
      time: this.formatTime(new Date()),
      showTime: this.shouldShowTime()
    };
    
    this.setData({
      messages: [...this.data.messages, newMsg],
      inputValue: '',
      lastMsgId: newMsg.id
    });
    
    // 模拟回复
    setTimeout(() => {
      const replyMsg = {
        id: this.data.lastMsgId + 1,
        isMe: false,
        avatar: utils.MapImageUrl("im.jpg"),
        content: '收到你的消息了: ' + newMsg.content,
        time: this.formatTime(new Date()),
        showTime: this.shouldShowTime()
      };
      
      this.setData({
        messages: [...this.data.messages, replyMsg],
        lastMsgId: replyMsg.id
      });
    }, 1000);
  },
  
  goBack: function() {
    wx.navigateBack();
  },
  
  showMore: function() {
    wx.showActionSheet({
      itemList: ['设置备注', '清空聊天记录', '投诉'],
      success(res) {
        console.log(res.tapIndex);
      }
    });
  },
  
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  
  shouldShowTime: function() {
    // 这里可以添加逻辑判断是否显示时间
    return Math.random() > 0.7; // 示例：随机显示时间
  }
});