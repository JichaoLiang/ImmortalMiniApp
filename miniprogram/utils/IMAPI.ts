import * as API from '../utils/serverAPI'
import * as resource from "../utils/resources"

export var listenerrequestpool = []

export const clearlistenerreqeusts = ()=>{
  listenerrequestpool.forEach(t=>t.value.abort())
  listenerrequestpool = []
}

export const callIMserver = (routerpath:string, parameters:any, callback:any, failedcallback:any=(err)=>{}, timeout=1000* 60 * 20)=>{
  return API.callserver(routerpath, parameters, callback, failedcallback, "IM", timeout=timeout)
}

export const Listen = (touser:string, timeoffset:Date=new Date(), success:any, failed:any, taskhandlefunction:any)=>{
  console.log('listen start')
  var token = resource.resource.user.id
  return callIMserver("listen", 
  {
    token: token,
    totoken: touser,
    timeoffset: timeoffset.getTime(),
  }, (data)=>{
    var time = data.timeoffset
    var newtime = new Date(time)
    success(data)
    var handler = Listen(touser, newtime, success, failed, taskhandlefunction)
    taskhandlefunction(handler)
  }, (err)=>{
    console.error(err)
    failed(err)
    var time = timeoffset
    var newtime = new  Date(time)
    var handler = Listen(touser, newtime, success, failed, taskhandlefunction)
    taskhandlefunction(handler)
  })
}


export const ListenBatch = (touser:string[], timeoffset:Date[], success:any, failed:any, taskhandlefunction:any)=>{
  console.log(`touser: ${touser}`)
  console.log('listen start')
  var token = resource.resource.user.id
  return callIMserver("ListenBatch", 
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
    var handler = ListenBatch(touser, newtime, success, failed, taskhandlefunction)
    taskhandlefunction(handler)
  }, (err)=>{
    console.error(err)
    failed(err)
    var time = timeoffset
    var newtime = []
    for(var i = 0;i<touser.length; i++){
      newtime.push( new Date(time) )
    }
    var handler = ListenBatch(touser, newtime, success, failed, taskhandlefunction)
    taskhandlefunction(handler)
  })
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