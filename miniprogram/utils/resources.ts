import * as utils from "./util"
class User{
  id:string = ""
  imgid: string = ""
  nickname:string = ""
  phonenumber:string = ""
  signature:string = ""
}

class Resource{
  user:User = new User()
  logintempuser:User = new User()
  currentProduct:any = null
  currentplatform = utils.platform()
  articletopics = []
}

export var resource:Resource = new Resource()

// init
utils.gettopics((result)=>{
  resource.articletopics = result
},(err)=>{
  console.log(err)
})
