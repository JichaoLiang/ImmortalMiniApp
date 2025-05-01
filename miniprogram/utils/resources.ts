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
}


export var resource:Resource = new Resource()
