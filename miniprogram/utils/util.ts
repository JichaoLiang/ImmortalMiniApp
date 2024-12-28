var products = require('./products.js')
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
    callback(isallcached)
  })
}
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const listVideoIdByProductId = (productid: string, callback)=>{
  var result = []
  wx.request({
    url: 'http://39.105.153.38/Immortal/ListVideos?packageid=' + productid, // 开发者服务器接口地址
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

export const getCheckpointfilepathbyPackageiId = (packageid)=>{
  var path = wx.env.USER_DATA_PATH + '/checkpoint_' + packageid + ".txt"
  return path
}

export const fetchVideos = (packageid:string, videoids: string[], callback)=>{
  if(videoids.length == 1){
    fetchVideo(packageid, videoids[0], callback)
    return
  }
  if(videoids.length > 1) {
    var tail:string[] = []
    for(var i = 1; i< videoids.length; i++){
      tail.push(videoids[i])
    }
    fetchVideo(packageid, videoids[0], ()=>{
      callback()
      fetchVideos(packageid, tail, callback)
    })
  }
}

export const fetchVideo = (packageid: string, videoid: string, callback: any)=> {
  const filename = wx.env.USER_DATA_PATH + '/' + packageid + '_' + videoid + ".mp4"
  console.log(filename)
  if (fileexists(filename)) {
    callback(filename)
    return
  }
  const urlstr = 'http://39.105.153.38/Immortal/GetVideo?packageid=' + packageid + '&videoid=' + videoid
  wx.downloadFile({
    url: urlstr,
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
    }
  })
}
export const fetchAideo = (packageid: string, audeoid: string, callback: any)=> {
  const filename = wx.env.USER_DATA_PATH + '/' + packageid + '_' + audeoid + ".mp3"
  if (fileexists(filename)) {
    callback(filename)
  }
  const urlstr = 'http://39.105.153.38/Immortal/GetAudio?packageid=' + packageid + '&audioid=' + audeoid
  wx.downloadFile({
    url: urlstr,
    filePath: filename,
    // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
    success(res) {
      if (res.statusCode === 200) {
        wx.hideLoading()
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