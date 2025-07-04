import * as config from './config'
import { resource } from './resources';
import * as utils from  './util'

export const callserver = (routerpath:string, parameters:any, callback:any, failedcallback:any=(err)=>{}, namespace = 'immortalAPP', timeout=300000)=>{
  var url = config.baseurl + namespace + '/' + routerpath;
  var firstparam = true;
  for (const key in parameters) {
    if (parameters.hasOwnProperty(key)) { // 确保只遍历对象自身的属性
      if (firstparam){
        url += '?'
        firstparam = false
      }
      else{
        url += '&'
      }
      url += key + '=' + escape(parameters[key])
    }
  }
  console.log("API access: ")
  console.log(url)
  return wx.request({
    url: url, // 开发者服务器接口地址
    method: 'GET', // HTTP 请求方法，默认为 GET
    header: {
      'content-type': 'application/json' // 设置请求的 header，默认为 application/json
    },
    timeout: timeout,
    success(res) {
      console.log(res); // 接口调用成功的回调函数
      var code = res.statusCode
      console.log(code)
      if (code != 200){
        failedcallback(res);
      }
      else{
        var result = res.data
        callback(result)
      }
    },
    fail(err) {
      console.error(err); // 接口调用失败的回调函数
      failedcallback(err);
    },
    complete(data) {
      // console.log(`server call compete: ${url}`)
      // console.log(data)
    }
    });
}

export const getHeadline = (callback:any, failedcallback:any)=>{
  callserver("GetHeaders", {}, (data)=>{
    var result = data.result
    callback(result)
  }, (err)=>{
    console.error(err)
    failedcallback(err)
  })
}

export const newuser = (weixinid:string, img:string, nicknam:string, phonenumber:string, signature:string, callback:any)=>{
  console.log('创建user')
  callserver('NewUser', {
    token: weixinid,
    imagekey: img,
    nickname: nicknam,
    phonenumber:phonenumber,
    signature:signature
  }, callback)
}

export const fetchUserInfoByToken = (token: string, callback:any, failedcallback: any) =>{
  callserver('GetUserInfo', {
    token: token,
  }, callback, failedcallback)
}

export const getUserBehaviorInfo = (touser:string, callback:any, failed:any) =>{
  var token = resource.user.id
  callserver("GetUserBehaviorInfo",{
    token: token,
    tousertoken: touser,
  }, callback, failed)
}

export const getBehaviorInfoC2C = (touser:string, callback:any, failed:any) =>{
  var token = resource.user.id
  callserver("GetBehaviorInfoC2C",{
    token: token,
    tousertoken: touser,
  }, callback, failed)
}

export const ViewUserProfile = (token:string, toview:string, success:any, failed: any)=>{
  callserver('ViewUserProfile', {
    token: token,
    toview: toview,
  }, success, failed)
}

export const getTokenbyTempWxid = (tempwxid, isAPP, callback, failcallback)=>{
  callserver('GetTokenByWxid', {
    wxid: tempwxid,
    isAPP: isAPP
  }, callback, failcallback)
}

export const uploadfile = (filepath:string, extname:string, callback:any, failcallback:any=(err:any)=>{})=>{
  console.log(config.baseurl + 'FileUpload?extname=' + extname)
  wx.uploadFile({
    url: config.baseurl + 'ImmortalAPP/FileUpload?extname=' + extname, // 替换为你的上传接口
    filePath: filepath,
    name: 'file', // 后端接收的文件字段名
    formData: {
      'user': 'test' // 可以添加额外的表单数据
    },
    success: (res) => {
      if (res.statusCode === 200) {
        var fileid = JSON.parse(res.data).result
        callback(fileid)
        // 可以在这里处理返回的数据
        console.log('上传成功:', res.data);
      } else {
        console.log(res)
        console.log('上传失败:', res.data);
      }
    },
    fail: (err) => {
      utils.alert("上传失败")
      console.error('上传失败:', err);
      failcallback(err)
    }
  });
}

export const uploadAvatar = (filepath:string, extname:string, callback:any, failcallback:any=(err:any)=>{})=>{
  console.log(config.baseurl + 'AvatarUpload?extname=' + extname)
  wx.uploadFile({
    url: config.baseurl + 'ImmortalAPP/FileUpload?extname=' + extname, // 替换为你的上传接口
    filePath: filepath,
    name: 'file', // 后端接收的文件字段名
    formData: {
      'user': 'test' // 可以添加额外的表单数据
    },
    success: (res) => {
      if (res.statusCode === 200) {
        var fileid = JSON.parse(res.data).result
        callback(fileid)
        // 可以在这里处理返回的数据
        console.log('上传成功:', res.data);
      } else {
        console.log(res)
        console.log('上传失败:', res.data);
      }
    },
    fail: (err) => {
      utils.alert("上传失败")
      console.error('上传失败:', err);
      failcallback(err)
    }
  });
}
export const gettopics = (success:any, failed:any)=>{
  callserver("GetArticleTopics",{
  }, (res)=>{
    var data = res.data
    success(data)
  }
    , failed)
}

export const newarticle = (topic:string, title:string, richtext:string, parent:string="", success:any, failed:any)=>{
  var token = resource.user.id
  callserver("NewArticle",{
    token:token,
    topic: topic,
    title: title,
    richtext: richtext,
    parent: parent
  }, (res)=>{
    success(res)
  }, (err)=>{
    console.error(err)
    failed(err)
  })
}

export const listfollowers = (viewtoken:string, success:any,failed:any, pageindex:number=0) =>{
  var token = resource.user.id
  callserver("ListFollower", {
    token:token,
    viewtoken: viewtoken,
    pageindex: pageindex
  }, (data:any)=>{
    success(data)
  }, failed)
}

export const listOnesIFollowed = (viewtoken:string, success:any,failed:any, pageindex:number=0) =>{
  var token = resource.user.id
  callserver("ListOnesIFollowed", {
    token:token,
    viewtoken: viewtoken,
    pageindex: pageindex
  }, (data:any)=>{
    success(data)
  }, failed)
}

export const listUserLiveStream = (viewtokens:string, pageindex:number=0, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("ListUserLiveStream",{
    token: token,
    tokens:viewtokens,
    pageindex: pageindex
  }, (data)=>{
    success(data)
  }, failed)
}

export const loadtopics = (success:any, failed: any, isbroadcast:boolean=false)=>{
  callserver("GetArticleTopics",{
    isbroadcast:isbroadcast,
  }, success, failed)
}

export const loadarticlelist = (topicid:any, pageindex:number=0, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("ListArticle", {
    token: token,
    topic: topicid,
    pageindex: pageindex
  },success, failed)
}

export const loadarticlereplies = (articleid:any, pageindex:number=0, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("ListArticleReplies", {
    token: token,
    parentid: articleid,
    pageindex: pageindex
  },success, failed)
}

export const loadarticeinfo = (articleid:string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("ViewArticle",{
    token:token,
    id:articleid,
  }, success, failed)
}

export const GetProductFeed = (method:string, tags:string[]=[], success:any, failed:any, skip:number, take:number)=>{
  if(!method){
    method = "Hot"
  }
  if(!skip){
    skip=0
  }
  if(!take){
    take=16
  }
  var token = resource.user.id
  callserver("GetProductFeed",{
    method: method,
    token:token,
    tags: tags.join(','),
    skip:skip,
    take:take
  }, success, failed)
}

export const GetHotProductFeed = (tags=[], success:any, failed:any, skip:number, take:number)=>{
  GetProductFeed("Hot", tags, success, failed, skip, take)
}

export const GetCollectProductFeed = (tags=[], success:any, failed:any, skip:number, take:number)=>{
  GetProductFeed("Collect", tags, success, failed, skip, take)
}

export const GetCommentFeed = (method:string, tags:string[], success:any, failed:any, skip:number, take:number)=>{
  var token = resource.user.id
  callserver("GetCommentFeedStream", {
    method:method,
    token:token,
    tags:escape(tags.join(",")),
    skip:skip,
    take:take,
  }, success, failed)
}

export const GetTagByProductId = (productid:string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("GetTagByProductId", {
    productid:productid,
    token:token,
  }, success, failed)
}

export const GetProductByAuthorID = (authortoken:string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("GetProductListByAuthor", {
    token:token,
    viewtoken: authortoken,
  }, (resp)=>{
    var data = resp.data
    success(data)
  }, failed)
}

export const GetProductByPackageID = (id:string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("GetProductByPackageID", {
    id: id,
    token:token,
  }, (resp)=>{
    console.log("resp")
    console.log(resp)
    var data = resp.data
    if(data.length == 0){
      wx.showToast({
        title: "没有找到当前作品信息",
        icon: "error",
        duration: 2000,
      })
      return
    }
    resource.currentProduct = data[0]
    success(data[0])
  }, failed)
}

// behavior
export const getC2PBehavior = (productid: string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("GetBehaviorInfoC2P", {
    productid: productid,
    token: token
  }, success, failed)
}
export const GetProductBehaviorInfo = (productid: string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("GetProductBehaviorInfo", {
    productid: productid,
    token: token
  }, success, failed)
}

export const like = (productid:string, success:any, failed:any, undo:boolean=false)=>{
  var token = resource.user.id
  callserver("Like",{
    token: token,
    productid: productid,
    undo: undo
  },success, failed)
}

export const dislike = (productid:string, success:any, failed:any, undo:boolean=false)=>{
  var token = resource.user.id
  callserver("Dislike",{
    token: token,
    productid: productid,
    undo: undo
  },success, failed)
}

export const collect = (productid:string, success:any, failed:any, undo:boolean=false)=>{
  var token = resource.user.id
  callserver("Collect",{
    token: token,
    productid: productid,
    undo: undo
  },success, failed)
}

export const share = (productid:string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("Share",{
    token: token,
    productid: productid,
  },success, failed)
}

export const follow = (tousertoken:string, success:any, failed:any, undo:boolean=false)=>{
  var token = resource.user.id
  callserver("Follow",{
    token: token,
    tousertoken: tousertoken,
    undo:undo
  },success, failed)
}

export const comment = (productid:string, content:string, replyuser: string, nodeid:string, undo:boolean, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("Comment",{
    token: token,
    productid: productid,
    content:content,
    replyuser: replyuser,
    nodeid: nodeid,
    undo: undo
  },success, failed)
}

export const listcomment = (productid:string, success:any, failed:any, skip:number, take:number)=>{
  callserver("listcomments",{
    productid: productid,
    skip: skip,
    take: take
  },(data:any)=>{success(data.data)}, failed)
}

export const fetchSnapshotByVideoid = (productid: string, videoid:string, success:any, failed:any)=>{
  var token = resource.user.id
  callserver("GetSnapshotByVideoId",{
    packageid: productid,
    videoid: videoid,
    token: token
  },(data:any)=>{success(data.data)}, failed)
}