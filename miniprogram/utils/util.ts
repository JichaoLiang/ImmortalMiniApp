var products = require('./products.js')
import * as resource from './resources'
import * as API from './serverAPI'
import * as enums from './enum'
import {baseurl, dummyaccount} from "./config"

export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export const fileexists = (filepath:string) =>{
  const fs = wx.getFileSystemManager()
  try{
    fs.accessSync(filepath)
    return true
  }
  catch{
    return false
  }
}

export const allcached = (packageid:string, callback) =>{
  listVideoIdByProductId(packageid, (idlist)=>{
    console.log(idlist)
    var isallcached = true
    for(var i = 0;i<idlist.length;i++){
      var id = idlist[i]
      var filepath = wx.env.USER_DATA_PATH + '/' + packageid + '_' + id + ".mp4"
      if(!fileexists(filepath)){
        isallcached = false
        break
      }
    }
    if(isallcached){
      listAudioIdByProductId(packageid, (aidlist)=>{
        console.log(aidlist)
        var isallcached = true
        for(var i = 0;i<aidlist.length;i++){
          var id = aidlist[i]
          var filepath = wx.env.USER_DATA_PATH + '/' + packageid + '_' + id + ".mp3"
          if(!fileexists(filepath)){
            isallcached = false
            break
          }
        }
        callback(isallcached)
      })
    }
    else{
      callback(isallcached)
    }
  })
}
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const listVideoIdByProductId = (productid: string, callback)=>{
  var result = []
  wx.request({
    url: baseurl + 'Immortal/ListVideos?packageid=' + productid, // 开发者服务器接口地址
    method: 'GET', // HTTP 请求方法，默认为 GET
    header: {
      'content-type': 'application/json' // 设置请求的 header，默认为 application/json
    },
    success(res) {
      console.log(res.data); // 接口调用成功的回调函数
      result = res.data
      callback(result)
    },
    fail(err) {
      console.error(err); // 接口调用失败的回调函数
      throw err
    },
    complete() {
    }
    });
}

export const listAudioIdByProductId = (productid: string, callback)=>{
  // var result = []
  wx.request({
    url: baseurl + 'Immortal/ListAudios?packageid=' + productid, // 开发者服务器接口地址
    method: 'GET', // HTTP 请求方法，默认为 GET
    header: {
      'content-type': 'application/json' // 设置请求的 header，默认为 application/json
    },
    success(res) {
      console.log(res.data); // 接口调用成功的回调函数
      var result = res.data
      callback(result)
    },
    fail(err) {
      console.error(err); // 接口调用失败的回调函数
      throw err
    },
    complete() {
    }
    });
}

export const getCheckpointfilepathbyPackageiId = (packageid:any)=>{
  var path = wx.env.USER_DATA_PATH + '/checkpoint_' + packageid + ".txt"
  return path
}

export const fetchVideos = (packageid:string, videoids: string[], callback:any)=>{
  if(videoids.length == 1){
    fetchVideo(packageid, videoids[0], callback, ()=>{})
    return
  }
  if(videoids.length > 1) {
    var tail:string[] = []
    for(var i = 1; i< videoids.length; i++){
      tail.push(videoids[i])
    }
    fetchVideo(packageid, videoids[0], ()=>{
      callback()
    },()=>{
      fetchVideos(packageid, tail, callback)
    })
  }
}

export const fetchAudios = (packageid:string, audioids: string[], callback)=>{
  console.log('audioids: ' + audioids)
  if(audioids.length == 1){
    fetchAideo(packageid, audioids[0], callback, ()=>{})
    return
  }
  if(audioids.length > 1) {
    var tail:string[] = []
    for(var i = 1; i< audioids.length; i++){
      tail.push(audioids[i])
    }
    fetchAideo(packageid, audioids[0], ()=>{
      callback()
    }, ()=>{
      fetchAudios(packageid, tail, callback)
    })
  }
}

export const fetchResourceTxt = (id:string, success:any, failed:any)=>{
  var path = wx.env.USER_DATA_PATH + "/" + id + ".txt"
  var fs = wx.getFileSystemManager()
  if(fileexists(path)){
    var data = fs.readFileSync(path,"utf-8")
    success(data)
    return
  }
  wx.downloadFile({
    url: MapTextUrl(id),
    timeout: 1800000,
    filePath: path,
    // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
    success(res) {
      if (res.statusCode === 200) {
        // wx.hideLoading()
        console.log(id)
        if(fileexists(path)){
          var data = fs.readFileSync(path)
          success(data)
        }
        else{
          setTimeout(() => {
            fetchResourceTxt(id, success, failed)
          }, 100);
        }
      }
    },
    fail(err) {
      console.log(err);
      wx.showToast({
        title: '下载失败，请重新尝试',
        icon: 'none',
        mask: true
      })
    },
    complete(msg){
    }
  })
}

export const fetchVideo = (packageid: string, videoid: string, callback: any, completecallback:any)=> {
  const filename = wx.env.USER_DATA_PATH + '/' + packageid + '_' + videoid + ".mp4"
  console.log(filename)
  if (fileexists(filename)) {
    callback(filename)
    completecallback(filename)
    return
  }
  const urlstr =  baseurl + 'Immortal/GetVideo?packageid=' + packageid + '&videoid=' + videoid
  wx.downloadFile({
    url: urlstr,
    timeout: 1800000,
    filePath: filename,
    // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
    success(res) {
      if (res.statusCode === 200) {
        // wx.hideLoading()
        callback(filename)
      }
    },
    fail(err) {
      console.log(err);
      wx.showToast({
        title: '下载失败，请重新尝试',
        icon: 'none',
        mask: true
      })
    },
    complete(msg){
      completecallback(filename)
    }
  })
}
export const fetchAideo = (packageid: string, audeoid: string, callback: any, completecallback:any)=> {
  const filename = wx.env.USER_DATA_PATH + '/' + packageid + '_' + audeoid + ".mp3"
  if (fileexists(filename)) {
    callback(filename)
    completecallback(filename)
    return
  }
  const urlstr = baseurl + 'Immortal/GetAudio?packageid=' + packageid + '&audioid=' + audeoid
  wx.downloadFile({
    url: urlstr,
    filePath: filename,
    timeout: 1800000,
    // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
    success(res) {
      if (res.statusCode === 200) {
        console.log(res)
        // wx.hideLoading()
        callback(filename)
      }
    },
    fail(err) {
      console.log(err);
      wx.showToast({
        title: '下载失败，请重新尝试',
        icon: 'none',
        mask: true
      })
    },
    complete(msg){
      completecallback(filename)
    }
  })
}
export const topercentage = (input:number)=>{
  var result = Math.round(input * 100) + '%'
  return result
}


export const getProdById = (prodid:string) => {
  var prodlist = products.productlist
  for (var i = 0;i < prodlist.length; i++){
    var prod = prodlist[i]
    if( prod.id == prodid){
      return prod
    }
  }
}

var lastrefresh:{[index:string]:number} =  {}
export const heartbit = (key:string)=>{
  var now =  new Date().getTime()
  if(!lastrefresh[key]){
    lastrefresh[key] = now - 30 * 60 * 1000
  }
  var last = lastrefresh[key]
  // heartbit every 2 min
  if (now - last > 2 * 60 * 1000){
    lastrefresh[key] = now
    return true
  }
  else{
    return true
  }
}

export const fetchProductList = (callbackfun:Function, completecallback:Function)=>{
  if (!heartbit("product")){
    return callbackfun(products.productlist)
  }
  var filename = wx.env.USER_DATA_PATH + '/' + 'productlist.json'
  const urlstr = baseurl + 'Immortal/GetProducts'
  wx.downloadFile({
    url: urlstr,
    filePath: filename,
    timeout: 18000000,
    // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
    success(res) {
      if (res.statusCode === 200) {
        // console.log(res)
        // wx.hideLoading()
        var FileSystemManager = wx.getFileSystemManager()
        var jsonstring:string = FileSystemManager.readFileSync(filename, "utf-8")
        console.log(jsonstring)
        var jsObj = JSON.parse(jsonstring)
        products.productlist = jsObj.data
        callbackfun(products.productlist)
      }
    },
    fail(err) {
      console.log(err);
      wx.showToast({
        title: '加载产品失败，请重新尝试',
        icon: 'none',
        mask: true
      })
    },
    complete(msg){
      if(completecallback){
        completecallback(filename)
      }
    }
  })
}

export const getProductById = (productid: string, callback:Function)=>{
  fetchProductList((products)=>{
    for (var i = 0;i < products.length; i++){
      var prod = products[i]
      if( prod.id == productid){
        // this.setData({product: prod})
        callback(prod)
      }
  }}, (products)=>{})
}

export const fetchUserInfo = (success:any, failed: any)=>{
      wx.request({
        url: baseurl + 'immortal/getuser',
        data: { code: res.code },
        success(res) {
          console.log('openid:', res.data.openid)
        }
      })
}

export const getUserAccountInfo = (success:any, failed:any)=>{
  fetchUserInfo((info:any)=>{
    success(info)
  }, (err)=>{
    requireUserInfo((info:any)=>{
      success(info)
    }, (error:any)=>{
      failed(error)
    })
  })
}

export const tryGetLocalUserInfo = ()=>{
    var user = wx.getStorageSync(enums.userinfo)
    if(user){
      resource.resource.user = user
      return true
    }
    else {
      return false
    }
}

export const requireUserInfo = (success:any, failed:any)=>{
  var loadfromcache = tryGetLocalUserInfo()
  if (loadfromcache) {
    console.log('缓存中有user，已经加载')
    console.log(resource.resource.user)
    return
  }
  if(resource.resource.currentplatform != enums.PLATFORM.wechat) {
    console.log('func: getMiniProgramCode')
    wx.getMiniProgramCode({
      success(res) {
        console.log('callback: getMiniProgramCode')
        if (res.code) {
          console.log(res)
          success(res.code)
          // 将code发送到后端，后端通过微信接口获取openid
          // wx.request({
          //   url: '你的服务器地址',
          //   data: { code: res.code },
          //   success(res) {
          //     console.log('openid:', res.data.openid)
          //   }
          // })
        }
      },fail(res){
        failed(res)
        console.log(res)
      }
    })
  }
  else {
    wx.login({
      success(res) {
        wx.showToast({
          title: res.code,
          icon: "success"
        })
        console.log(res.code)
        var userinfo = resource.resource.user;
        var tempinfo = resource.resource.logintempuser;
        var getOrNew = (tk)=>{
          API.fetchUserInfoByToken(tk,(info)=>{
            userinfo.id = info.id;
            userinfo.imgid = info.imgid;
            userinfo.nickname = info.nickname;
            userinfo.phonenumber = info.phonenumber;
            userinfo.signature = info.signature;
            wx.setStorageSync(enums.userinfo, userinfo)
            success(userinfo)
          },(err)=>{
            //  沒有登録信息跳轉login補充
            wx.navigateTo({
              url:"/pages/login/login?token="+tk
            })
            var msg = "獲取登録信息失败: "
            console.log(err)
            wx.showToast({title: msg, //弹框内容
            icon: 'success', //弹框模式
            duration: 2000 })
          })
        }
        var tpid = res.code
        if(dummyaccount.length > 0){
          tpid = dummyaccount
        }
        API.getTokenbyTempWxid(tpid, false, (token)=>{
          var tk = token.token
          getOrNew(tk)
        }, (err)=>{
          var msg = "获取token失败: "
          console.log(err)
          wx.showToast({title: msg, //弹框内容
          icon: 'success', //弹框模式
          duration: 2000 })
        })
      }
    })
  }
}

export const GetHotProductFeedList = (success:any, failed:any, skip:number, take:number)=>{
  API.GetHotProductFeed(
    (data)=>{
      success(data)
     } ,failed, skip, take)
}

export const truncateText = (text:string, maxLengh:number=18)=>{
  if(text.length <= maxLengh){
    return text
  }
  return text.substr(0, maxLengh) + "..."
}

export const fetchFeedList = (callbackfun:Function, completecallback:Function, skip:number=0, take:number=30)=>{
  // if (!heartbit("feed")){
  //   return callbackfun(products.feed)
  // }
  API.GetCommentFeed(
    "New",
    (res:any)=>{
      products.feed = []
      for(var i=0;i<res.length; i++){
        var feeditem = {}
        var resitem = res[i]
        //console.log(resitem.snapshotimageid)
        feeditem.image = resitem.snapshotimageid
        feeditem.comment = resitem.commentcontent
        feeditem.title = resitem.name
        feeditem.linkid = resitem.productid
        feeditem.by = resitem.nickname
        feeditem.authorid = resitem.token
        //console.log(feeditem)
        products.feed.push(feeditem)
      }
      //console.log(products.feed)
      callbackfun(products.feed)
    },
    (err:any)=>{
      alert("加载feed流失败，请重新尝试")
    },
    skip,
    take
  )
  // var filename = wx.env.USER_DATA_PATH + '/' + 'feed.json'
  // const urlstr = baseurl + 'Immortal/GetFeed'
  // wx.downloadFile({
  //   url: urlstr,
  //   filePath: filename,
  //   timeout: 1800000,
  //   // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
  //   success(res) {
  //     if (res.statusCode === 200) {
  //       console.log(res)
  //       // wx.hideLoading()
  //       var FileSystemManager = wx.getFileSystemManager()
  //       var jsonstring:string = FileSystemManager.readFileSync(filename, "utf-8")
  //       // console.log(jsonstring)
  //       var jsObj = JSON.parse(jsonstring)
  //       products.feed = jsObj.data
  //       callbackfun(products.feed)
  //     }
  //   },
  //   fail(err) {
  //     console.log(err);
  //     wx.showToast({
  //       title: '加载feed流失败，请重新尝试',
  //       icon: 'none',
  //       mask: true
  //     })
  //   },
  //   complete(msg){
  //     if(completecallback){
  //       completecallback(filename)
  //     }
  //   }
  // })
}
export const MapImageUrl = (id:string)=>{
  var result = baseurl + ("immortal/GetResourceImage?id=" + id).replace('//', '/')
  return result
}

export const MapTextUrl = (id:string)=>{
  var result = baseurl + ("immortal/GetResourceText?id=" + id).replace('//', '/')
  return result
}

export const MapVideoUrl = (id:string)=>{
  var result = baseurl + ("immortal/GetResourceVideo?id=" + id).replace('//', '/')
  return result
}

export const alert = (msg:string, icon:"success"|"error" = "success", duration:number=2000)=>{
  wx.showToast({
    title: msg,
    icon: icon,
    duration: duration
  })
}

export const weixinlogin = (callback:any, token:string, isnew:boolean)=>{
  console.log("func: utils.weixinlogin")
  var tempinfo = resource.resource.logintempuser;
  var userinfo = resource.resource.user;
  var weisinid = resource.resource.logintempuser.id;
  console.log("test weixintempid: " + weisinid)
  // if(!weisinid){
  //   setTimeout(() => {
  //     weixinlogin(callback, token, isnew)
  //   }, 500);
  //   return;
  // }
  var fetchorcreateuser = (tk:string)=>{
    if(isnew){
      if(tempinfo.imgid.length == 0){
        wx.navigateTo({url: "/pages/login/login"})
        return
      }
      console.log(tempinfo)
      var imgfiletemppath = tempinfo.imgid;
      console.log(imgfiletemppath)
      var tokens = imgfiletemppath.split('.');
      var extname = tokens[tokens.length - 1].toLowerCase();
      API.uploadfile(imgfiletemppath, extname, (imgid)=>{
        API.newuser(tk, imgid, tempinfo.nickname, tempinfo.phonenumber, tempinfo.signature,(result)=>{
          userinfo.id = tk;
          userinfo.imgid = imgid;
          userinfo.nickname = tempinfo.nickname;
          userinfo.phonenumber = tempinfo.phonenumber;
          userinfo.signature = tempinfo.signature;
          console.log("存储user:" + JSON.stringify(userinfo))
          wx.setStorageSync(enums.userinfo, userinfo)
          callback(userinfo)
        })
      })
    }
    else{
      API.fetchUserInfoByToken(tk,(info)=>{
        console.log(info)
        userinfo.id = info.id;
        userinfo.imgid = info.imgid;
        userinfo.nickname = info.nickname;
        userinfo.phonenumber = info.phonenumber;
        userinfo.signature = info.signature;
        console.log("存储user:" + JSON.stringify(userinfo))
        wx.setStorageSync(enums.userinfo, userinfo)
        callback(userinfo)
      },(err)=>{
        console.log(err)
        wx.showToast({
          title: "登录失败",
          icon: "error"
        })
      })
    }
  }
  if(token && token.length > 0){
    fetchorcreateuser(token)
  }
  else{
    API.getTokenbyTempWxid(weisinid, true, (token)=>{
      var tk = token.token
      fetchorcreateuser(tk)
    }, (err)=>{
      var msg = "获取token失败: " + err
      console.log(err)
      wx.showToast({title: msg, //弹框内容
      icon: 'success', //弹框模式
      duration: 2000 })
    })
  }
}

export const weixinlogin_wechat = (callback:any, token:string, isnew:boolean=true)=>{
  console.log("func: utils.weixinlogin")
  var tempinfo = resource.resource.logintempuser;
  var userinfo = resource.resource.user;
  var weisinid = resource.resource.logintempuser.id;
  console.log("test weixintempid: " + weisinid)
  // if(!weisinid){
  //   setTimeout(() => {
  //     weixinlogin(callback, token, isnew)
  //   }, 500);
  //   return;
  // }
  var fetchorcreateuser = (tk:string)=>{
    if(isnew){
      if(tempinfo.imgid.length == 0){
        wx.navigateTo({url: "/pages/login/login"})
        return
      }
      console.log(tempinfo)
      var imgfiletemppath = tempinfo.imgid;
      console.log(imgfiletemppath)
      var tokens = imgfiletemppath.split('.');
      var extname = tokens[tokens.length - 1].toLowerCase();
      API.uploadfile(imgfiletemppath, extname, (imgid)=>{
        API.newuser(tk, imgid, tempinfo.nickname, tempinfo.phonenumber, tempinfo.signature,(result)=>{
          userinfo.id = tk;
          userinfo.imgid = imgid;
          userinfo.nickname = tempinfo.nickname;
          userinfo.phonenumber = tempinfo.phonenumber;
          userinfo.signature = tempinfo.signature;
          console.log("存储user:" + JSON.stringify(userinfo))
          wx.setStorageSync(enums.userinfo, userinfo)
          callback(userinfo)
        })
      })
    }
    else{
      API.fetchUserInfoByToken(tk,(info)=>{
        console.log(info)
        userinfo.id = info.id;
        userinfo.imgid = info.imgid;
        userinfo.nickname = info.nickname;
        userinfo.phonenumber = info.phonenumber;
        userinfo.signature = info.signature;
        console.log("存储user:" + JSON.stringify(userinfo))
        wx.setStorageSync(enums.userinfo, userinfo)
        callback(userinfo)
      },(err)=>{
        console.log(err)
        wx.showToast({
          title: "登录失败",
          icon: "error"
        })
      })
    }
  }
  if(token && token.length > 0){
    fetchorcreateuser(token)
  }
  else{
    API.getTokenbyTempWxid(weisinid, true, (token)=>{
      var tk = token.token
      fetchorcreateuser(tk)
    }, (err)=>{
      var msg = "获取token失败: " + err
      console.log(err)
      wx.showToast({title: msg, //弹框内容
      icon: 'success', //弹框模式
      duration: 2000 })
    })
  }
}

export const genGUID = ()=>{
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export const platform = ()=>{
  var sysinfo = wx.getSystemInfoSync()
  var host = sysinfo.host
  var env = host.env
  console.log(sysinfo)
  if(env.toLowerCase() == 'wechat'){
    return 'wechat'
  }
  else{
    var platform = sysinfo.platform
    return platform
  }
}

export const viewuserprofile = (usertoken:string)=>{
  console.log(usertoken)
  wx.navigateTo({
    url: "/pages/userview/userview?usertoken=" + usertoken
  })
}

export const gettopics = (success:any, failed:any)=>{
  API.gettopics(success, failed)
}

export const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(buffer);
  return uint8Array.reduce((str, byte) => str + String.fromCharCode(byte), '');
};