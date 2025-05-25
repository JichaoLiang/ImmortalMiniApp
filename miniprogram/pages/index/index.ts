// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
import { resource } from '../../utils/resources'
import * as API from '../../utils/serverAPI'
import { platform, listVideoIdByProductId, viewuserprofile, listAudioIdByProductId, fetchVideo, fetchAideo, fetchVideos, fetchAudios, topercentage, allcached, getProductById, fetchFeedList, MapImageUrl, requireUserInfo, weixinlogin } from 
"../../utils/util"

Component({
  data: {
    feedstream: [],
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
        id: "推荐"
      },
      {
        title: "密室逃脱",
        id: "密室逃脱"
      },
      {
        title: "互动小说",
        id: "互动小说"
      },
      {
        title: "if剧本",
        id: "if剧本"
      },
      {
        title: "故事相册",
        id: "故事相册"
      },
      {
        title: "明星代言",
        id: "明星代言"
      },
      {
        title: "虚拟女友",
        id: "虚拟女友"
      },
      {
        title: "虚拟男友",
        id: "虚拟男友"
      },
    ],
    selectedcategory: "推荐",

    fixedbutton:[
      {
        icon:"/images/Icon2.png",
        title:"热门",
        link:"/pages/productlist/productlist?method=Hot"
      },
      // {
      //   icon:"/images/Icon2.png",
      //   title:"最新",
      //   link:"456"
      // },
      // {
      //   icon:"/images/Icon3.png",
      //   title:"关注",
      //   link:"789"
      // },
      {
        icon:"/images/Icon4.png",
        title:"收藏",
        link:"/pages/productlist/productlist?method=Collect"
      },
      {
        icon:"/images/Icon3.png",
        title:"社区",
        link:"/pages/articlelist/articlelist"
      },
      {
        icon:"/images/Icon5.png",
        title:"创作",
        link:"/pages/articlelist/articlelist?isbroadcast=1"
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
    onfixedbuttontap(evt:any){
      var link = evt.currentTarget.dataset.link
      // console.log(evt)
      wx.navigateTo({
        url: link,
      })
    },
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
      if(cateid != this.data.selectedcategory){
        this.setData({selectedcategory:cateid})
        this.fetchfeed()
      }
      // this.data.selectedcategory = cateid
      
      // wx.showToast({title: evt.target.dataset.cateid, //弹框内容
      // icon: 'success', //弹框模式
      // duration: 2000 })
    },
    productDetail(evt:any){
      var prodid = evt.target.dataset.prodid
      wx.navigateTo({url: "/pages/product/product?productid=" + prodid})
    },
    onviewuser(evt){
      console.log(evt)
      var targettoken = evt.currentTarget.dataset.id
      viewuserprofile(targettoken)
    },
    onLoad(options){
      console.log(resource.currentplatform)

      var prodid = options.productid
      if(prodid && resource.user.id.length > 0){
        wx.navigateTo({ 
          url: '../product/product?productid='+prodid
        })
      }
    },
    fetchfeed(){
      var tag = [this.data.selectedcategory]
      if(tag[0] == this.data.categorys[0].id){
        tag = []
      }
      console.log(tag)
      fetchFeedList(tag, (feed:any)=>{
        for (var i = 0; i < feed.length; i++){
          feed[i].image = MapImageUrl(feed[i].image)
        }
        this.setData({feedstream: feed})
      }, (feed:any)=>{
      })
    },
    onShow(options){
      /* @if env=='miniprogram' */
      console.log('func: requireUserInfo')
      requireUserInfo((weisinid)=>{
        console.log('callback: requireUserInfo')
        console.log("got weisinid:" + weisinid)
        if(resource.logintempuser.id == ""){
          console.log("got weisinid: set to temp user: " + weisinid)
          resource.logintempuser.id = weisinid
        }
        // console.log('wxid: ' + weisinid)
        // weixinlogin(weisinid,(userinfo)=>{
        // })
      }, ()=>{})
      /* endif */
      this.fetchfeed()
    }
  },
})
