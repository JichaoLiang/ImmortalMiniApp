
export var pathprefix = `${wx.env.USER_DATA_PATH}/immortalcache`

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
var cachelistkey = "imcachelist"

export const clearcachestorage = (percentage:number)=>{
  var fs = wx.getFileSystemManager()
  var cachelist = wx.getStorageSync(cachelistkey)
  if(!cachelist){
    cachelist = []
  }
  var truncatedcount = Math.floor(cachelist * percentage)
  for(var i = 0;i<truncatedcount; i++){
    var current = cachelist.shift()
    var f = current.file
    fs.unlink({
      filePath: f
    })
  }
  wx.setStorageSync(cachelistkey, cachelist)
}

var newcache = (key)=>{
  var path = `${pathprefix}/${key}`
  var cachelist = wx.getStorageSync(cachelistkey)
  if(!cachelist){
    cachelist = []
  }
  cachelist.push({
    file: path,
    time: new Date()
  })
  wx.setStorageSync(cachelistkey, cachelist)
}

export const tryCreateFolder = (file:string)=>{
  var fs = wx.getFileSystemManager()
  var folderpath = file.substring(0, file.lastIndexOf('/'))
  try{
    fs.mkdir({
      dirPath: folderpath,
      recursive: true
    })
  }catch{}
}

export const getfile = (key:string, url:string, callback:any, failed:any, completecallback:any)=>{
  var filepath = `${pathprefix}/${key}`
  tryCreateFolder(filepath)
  if(fileexists(filepath)){
    callback(filepath)
    completecallback(filepath)
  }
  var trydownload = (percentage:number=0)=>{
    return new Promise((resolve, reject)=>{
      if(percentage > 0){
        clearcachestorage(percentage)
      }
      wx.downloadFile({
        url: url,
        timeout: 1800000,
        filePath: filepath,
        // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
        success(res) {
          if (res.statusCode === 200) {
            // wx.hideLoading()
            // callback(filepath)
            newcache(key)
            resolve(filepath)
          }
        },
        fail(err) {
          console.log(err);
          reject(err)
        }
      })
  })}
  var resultpath:any = ""
  var success = true
  trydownload(0).then(result=>{
    resultpath = result
    callback(resultpath)
  }).catch(err=>{
      trydownload(0.25).then(result1=>{
        resultpath = result1
        callback(resultpath)
        completecallback(filepath)
      }).catch(err=>{
        trydownload(0.5).then(result2=>{
          resultpath = result2
          callback(resultpath)
          completecallback(filepath)
        }).catch(err=>{
          trydownload(1).then(result3=>{
            resultpath = result3
            callback(resultpath)
            completecallback(filepath)
          })
          .catch(err=>{
            failed(err)
            success = false
            completecallback(filepath)
          })
        })
      })
    }
  )
}
