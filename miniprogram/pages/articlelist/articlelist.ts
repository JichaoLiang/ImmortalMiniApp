import * as API from "../../utils/serverAPI"
import * as utils from "../../utils/util"
import * as config from "../../utils/config"
Page({
  data: {
    broadcasemode: false,
    issuperuser: config.isSuperUser,
    selected: 0,
    topics: [],
    articles: [],
    pageindex: 0,
    ohnopic: utils.MapImageUrl("ohno.jpg")
  },
  onLoad(option){
    var broadcast = option.isbroadcast == "1"
    this.setData({
      broadcasemode: broadcast
    })
  },
  onShow() {
    this.loadArticles();
  },
  
  loadArticles() {
    API.loadtopics((res)=>{
      var data = res.data
      console.log(data)
      this.setData({
        topics: data,
      })
      this.loadtopiccontent(this.data.topics[this.data.selected].id)
    }, (err)=>{
      utils.alert("加载分类失败")
    }, this.data.broadcasemode)
  },
  loadtopiccontent(id){
    if(!id){
      id = this.data.topics[this.data.selected].id
    }
    API.loadarticlelist(id, this.data.pageindex, (res)=>
    {
      var completestatus = {count:0, target:res.data.length}
      if(res.data.length == 0)
      {
        this.setData({
          articles: res.data
        })
      }
      var ids = res.data.map((e)=>{return e.idarticle})
      console.log(ids)
      // console.log(res)
      res.data.forEach(element => {
        // console.log(element.image)
        element.image = utils.MapImageUrl(element.image)
        element.title = utils.truncateText(element.title, 20)
        var fetchfunc:any  = ()=>{
          utils.fetchResourceTxt(element.contentkey,(data)=>{
            // console.log(data)
            if(typeof(data)=="object"){
              setTimeout(fetchfunc, 1000)
              return
            }
            else{
              element.contentkey = utils.truncateText(data, 80)
            }
            completestatus.count += 1
            if(completestatus.count == completestatus.target){
              console.log("set article data:")
              var ids = res.data.map((e)=>{return e.idarticle})
              console.log(ids)
              this.setData({
                articles: res.data
              })
            }
          },(err)=>{})
        }
        fetchfunc()
      });
      
    },(err)=>{
      console.log(err)
      utils.alert("加载文章失败");
    })
  },
  switchtab(evt){
    var id = evt.target.dataset.id
    var previd = this.data.topics[this.data.selected].id
    var select = 0
    for(var i=0;i<this.data.topics.length;i++){
      if (id == this.data.topics[i].id){
        select = i
      }
    }
    this.setData({
      selected:select
    })
    if(id != previd){
      this.loadtopiccontent(id)
    }
  },
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/articleedit/articleedit?topic=' + this.data.topics[this.data.selected].id,
    });
  },
  
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log(id)
    wx.navigateTo({
      url: `/pages/articledetail/articledetail?id=${id}`,
    });
  },
  onviewuser(e){
    // console.log(e)
    var targettoken = e.currentTarget.dataset.id
    utils.viewuserprofile(targettoken)
  }
})