// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
var feed = require('../../utils/products.js')

Component({
  data: {
    headbar:{
      images:[
        {
          url: '/images/resources/image1.jpg',
          title: '午夜杀机',
          linkid: 'xujiangv15'},
        {
          url: '/images/resources/image2.jpg',
          title: '吃纸的女孩',
          linkid: '456'},
        {
          url: '/images/resources/image3.jpg',
          title: '破晓黎明',
          linkid: '789'},
      ]
    },
    categorys:[
      {
        title: "推荐",
        id: "1",
        feed: feed.feed
      },
      {
        title: "密室逃脱",
        id: "2"
      },
      {
        title: "互动小说",
        id: "3"
      },
      {
        title: "if剧本",
        id: "4"
      },
      {
        title: "故事相册",
        id: "5"
      },
      {
        title: "明星代言",
        id: "6"
      },
      {
        title: "虚拟女友",
        id: "6"
      },
      {
        title: "虚拟男友",
        id: "6"
      },
    ],
    selectedcategory: "1",

    fixedbutton:[
      {
        icon:"/images/Icon1.png",
        title:"热门",
        link:"123"
      },
      // {
      //   icon:"/images/Icon2.png",
      //   title:"最新",
      //   link:"456"
      // },
      {
        icon:"/images/Icon3.png",
        title:"关注",
        link:"789"
      },
      {
        icon:"/images/Icon4.png",
        title:"收藏",
        link:"1234"
      },
      {
        icon:"/images/Icon5.png",
        title:"社区",
        link:"567"
      },
      {
        icon:"/images/Icon6.png",
        title:"创作",
        link:"5672"
      },
    ],

    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  methods: {
    // 事件处理函数
    toCases() {
      console.log(123)
      wx.navigateTo({
        url: '../cases/cases',
      })
    },
    showTip(evt:any){
      console.log(evt)
      wx.showToast({title: evt.target.dataset.url, //弹框内容
      icon: 'success', //弹框模式
      duration: 2000 })
    },
    showCate(evt:any){
      var cateid = evt.target.dataset.cateid
      this.setData({selectedcategory:cateid})
      // this.data.selectedcategory = cateid
      
      // wx.showToast({title: evt.target.dataset.cateid, //弹框内容
      // icon: 'success', //弹框模式
      // duration: 2000 })
    },
    productDetail(evt:any){
      var prodid = evt.target.dataset.prodid
      wx.navigateTo({url: "/pages/product/product?productid=" + prodid})
    }
  },
})
