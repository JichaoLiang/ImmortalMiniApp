import * as API from '../utils/serverAPI'
import * as resource from "../utils/resources"

export var listenerrequestpool = []

export const clearlistenerreqeusts = ()=>{
  console.log(`listen requests: ${listenerrequestpool.length}`)
  listenerrequestpool.forEach(t=>{
    try{
    t.value.abort()
    }catch(ex){
      console.log(ex)
    }
  })
  listenerrequestpool = []
}

export const droprequestbykey = (key:string)=>{
  for(var i = 0;i<listenerrequestpool.length;i++){
    var current = listenerrequestpool[i]
    if(current.key.toLowerCase() == key.toLowerCase())
    {
      try
      {
        current.abort()
      }
      catch(ex){
        console.log(ex)
      }
      listenerrequestpool.splice(i, 1)
      i -= 1
    }
  }
}

export const callIMserver = (routerpath:string, parameters:any, callback:any, failedcallback:any=(err)=>{}, timeout=1000* 60 * 20)=>{
  return API.callserver(routerpath, parameters, callback, failedcallback, "IM", timeout=timeout)
}

export const Listen = (touser:string, timeoffset:Date=new Date(), success:any, failed:any)=>{
  console.log('listen start')
  var token = resource.resource.user.id
  var key:string = new Date().getTime() + "_" + Math.random()
  var request =  callIMserver("listen", 
  {
    token: token,
    totoken: touser,
    timeoffset: timeoffset.getTime(),
  }, (data)=>{
    var time = data.timeoffset
    var newtime = new Date(time)
    success(data)
    droprequestbykey(key)
    var handler = Listen(touser, newtime, success, failed)
  }, (err)=>{
    console.error(err)
    failed(err)
    
    if(err.errMsg && err.errMsg == "request:fail abort"){
      return
    }
    var time = timeoffset
    var newtime = new  Date(time)
    droprequestbykey(key)
    var handler = Listen(touser, newtime, success, failed)
  })
  listenerrequestpool.push({func:"listen",key:key,value:request})
  return request
}


export const ListenBatch = (touser:string[], timeoffset:Date[], success:any, failed:any)=>{
  console.log(`touser: ${touser}`)
  console.log('listen start')
  var token = resource.resource.user.id
  var key:string = new Date().getTime() + "_" + Math.random()
  var request = callIMserver("ListenBatch", 
  {
    token: token,
    totokens: touser,
    timeoffset: timeoffset.map((t)=>t.getTime()),
  }, (data)=>{
    var time = data.timeoffset
    var newtime = []
    for(var i = 0;i<touser.length; i++){
      newtime.push( new Date(time) )
    }
    console.log(`new time: ${newtime}, touser: ${touser}`)
    success(data)
    var handler = ListenBatch(touser, newtime, success, failed)
  }, (err)=>{
    console.error(err)
    failed(err)
    if(err.errMsg && err.errMsg == "request:fail abort"){
      return
    }
    var time = timeoffset
    var newtime = []
    for(var i = 0;i<touser.length; i++){
      newtime.push( new Date(time) )
    }
    var handler = ListenBatch(touser, newtime, success, failed)
  })
  listenerrequestpool.push({func:"listenbatch",key:key,value:request})
}

export const sendmessage = (touser:string, message:string, success:any, failed:any)=>{
  var token = resource.resource.user.id
  return callIMserver("sendmessage", 
  {
    token: token,
    totoken: touser,
    message: escape(message)
  }, (data)=>{
    success(data)
  }, (err)=>{
    console.error(err)
    failed(err)
  })
}

export const listconversations = (success:any, failed:any)=>{
  var token = resource.resource.user.id
  return callIMserver("ListConversationsByUserid", 
  {
    token: token,
  }, (data)=>{
    success(data.data)
  }, (err)=>{
    console.error(err)
    failed(err)
  })
}

export const getconversationcacheid = (from:string, to:string) =>{
  return `conversatino_${from}_${to}`
}