import * as util from "../../utils/util"
import * as API from "../../utils/serverAPI"
import * as config from "../../utils/config"
import * as resource from '../../utils/resources'

Page({

  data: {
    platform: util.platform,
    appIcon: util.MapImageUrl('IM.jpg'),
    appName: '简绣互动',
    checkedAgree: false,
    readyToLogin: false,
    loginSuccess: false, // 标记是否登录成功
    defaultAvatar: util.MapImageUrl('IM.jpg'),
    phonenumber: "点击填写电话",
    nickname: "",
    signature: "",

    password: "",
    confirmpassword: "",

    passwordpass: true,
    phonenumberpass: true,

    knowntoken: "", //已知token, 补全信息模式
    noregist: false,
  },
  onLoad(option){
    var token = option.token
    if(token){
      this.setData({
        knowntoken: token
      })
    }
  },
  /**
   * 退出页面时触发基础库回调，由基础库内部处理系统登录态。
   */
  onUnload() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('__donutLogin__', { success: this.data.loginSuccess });
    }
  },
  onlogincheckboxchange(evt){
    // console.log(evt.detail.value[0])
    var noreg = evt.detail.value[0]
    var noregist = false
    if(noreg && noreg == 'noregist'){
      noregist = true
    }
    this.setData({
      noregist: noregist
    })
    this.updatelogin()
  },
  weixinlogin_app() {
    console.log('func: weixinlogin_app')
    this.setData({ loginSuccess: true });
    var password = this.data.password
    var tempuser = resource.resource.logintempuser;
    tempuser.nickname = this.data.nickname;
    tempuser.phonenumber = this.data.phonenumber;
    tempuser.signature = this.data.signature;
    var avatar = this.data.defaultAvatar
    console.log(avatar)
    if(avatar.startsWith("http")){
      console.log('start with http')
      var tks = this.data.defaultAvatar.split('.')
      var last = tks[tks.length - 1]
      var uuid = util.genGUID()
      const filename = wx.env.USER_DATA_PATH + '/' + uuid + "." + last
      //console.log(filename)

      var isnew = !this.data.noregist
      wx.downloadFile({
        url: avatar,
        timeout: 1800000,
        filePath: filename,
        // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
        success(res) {
          if (res.statusCode === 200) {
            // wx.hideLoading()
            tempuser.imgid = filename;
            console.log(tempuser)
            
            util.weixinlogin((userinfo)=>{
              wx.navigateBack();
            }, tempuser, password, isnew)
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
    else{
      console.log(avatar + " not start with http")
      tempuser.imgid = avatar;
      console.log(tempuser)
      util.weixinlogin((userinfo)=>{
        wx.navigateBack();
      }, tempuser, password, isnew)
    }
  },
  weixinlogin_wechat(knowntoken) {
    console.log('func: weixinlogin_wechat')
    this.setData({ loginSuccess: true });
    var tempuser = resource.resource.logintempuser;
    tempuser.nickname = this.data.nickname;
    tempuser.phonenumber = this.data.phonenumber;
    tempuser.signature = this.data.signature;
    var avatar = this.data.defaultAvatar
    console.log(avatar)
    if(avatar.startsWith("http")){
      console.log('start with http')
      var tks = this.data.defaultAvatar.split('.')
      var last = tks[tks.length - 1]
      var uuid = util.genGUID()
      const filename = wx.env.USER_DATA_PATH + '/' + uuid + "." + last
      //console.log(filename)

      var knowntoken = this.data.knowntoken
      var isnew = !this.data.noregist
      wx.downloadFile({
        url: avatar,
        timeout: 1800000,
        filePath: filename,
        // filePath: wx.env.USER_DATA_PATH + '/' + item.fullName,
        success(res) {
          if (res.statusCode === 200) {
            // wx.hideLoading()
            tempuser.imgid = filename;
            console.log(tempuser)
            
            util.weixinlogin_wechat((userinfo)=>{
              wx.navigateBack();
            }, knowntoken, isnew)
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
    else{
      console.log(avatar + " not start with http")
      tempuser.imgid = avatar;
      console.log(tempuser)
      util.weixinlogin_wechat((userinfo)=>{
        wx.navigateBack();
      }, knowntoken, isnew)
    }
  },
  /**
   * 触发小程序登录，登录成功后自动退出页面
   */
  onTapWeixinMiniProgramLogin() {
    this.weixinlogin_app(this.data.knowntoken)
  },
  handleLogin(){
    this.weixinlogin_wechat(this.data.knowntoken)
  },
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        this.setData({
          defaultAvatar: res.tempFiles.map(item => item.tempFilePath)[0]
        })
      }
    })
  },
  oninput(e){
    this.setData({ nickname:e.detail.value })
    this.updatelogin();
  },
  oninputphoneNumber(e){
    this.setData({ phonenumber:e.detail.value })
    this.updatelogin();
  },
  oninputsignature(e){
    this.setData({ signature:e.detail.value })
    this.updatelogin();
  },
  getPhoneNumber(e) {
    console.log(e)
    if (e.detail.code) {
      this.setData({
        phonenumber: e.detail.code
      })
      this.updatelogin();
      // 将code发送到后端解密获取手机号
      // wx.request({
      //   url: '你的服务器地址',
      //   data: { code: e.detail.code },
      //   success(res) {
      //     console.log('手机号:', res.data.phoneNumber)
      //   }
      // })
    }
  },
  onCheckboxChange() {
    this.setData({ checkedAgree: !this.data.checkedAgree});
    this.updatelogin();
    //this.setData({ readyToLogin: this.data.checkedAgree && this.data.nickname.length > 0 && this.data.phonenumber.length == 11 });
  },
  oninputpassword(e){
    var value = e.detail.value
    this.setData({
      password: value
    })
    this.updatelogin();
  },
  oninputconfirmpassword(e){
    var value = e.detail.value
    this.setData({
      confirmpassword: value
    })
    this.updatelogin();
  },
  updatelogin(){
    const telRegex = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
    var phonenumberpass = telRegex.test(this.data.phonenumber)

    var regpwd = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~!@#$%^&*()_+<>?:\"{},.\/\\;'[\]])[A-Za-z\d`~!@#$%^&*()_+<>?:\"{},.\/\\;'[\]]{8,}$/;
    var passwordloginvalid = regpwd.test(this.data.password)
    var passwordpass = regpwd.test(this.data.password) && this.data.password == this.data.confirmpassword

    // console.log(this.data.checkedAgree+"||"+(this.data.nickname.length)+"||"+this.data.phonenumber.length)
    this.setData({ readyToLogin:  this.data.checkedAgree && this.data.nickname.length > 0 && phonenumberpass && passwordpass 
      || (this.data.noregist && passwordloginvalid && phonenumberpass),
    phonenumberpass: phonenumberpass,
    passwordpass: passwordpass
    });
  },


  /**
   * 
   * 使用单独的 webview 页面展示用户协议
   */
  onShowAgreement(e) {
    const urls = [
      `../showtext/showtext?title=用户协议&textid=agreement.txt`,
      `../showtext/showtext?title=隐私政策&textid=privacy.txt`,
    ];
    const url = urls[e.target.dataset.idx];
    wx.navigateTo({
      url: url,
    });
  },
  onGetUserInfo(info){
    console.log(info)
  }
})