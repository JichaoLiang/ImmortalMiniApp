var productlist = [
  {
    id: "demoplayv03",
    name: "门缝外的脸",
    description: "沉寂的夜，只有几声猫头鹰的叫声陪伴，这份宁静却被门外的动静打破，遇到问题，我们首先要冷静的思考，才能给出一个正确的答案。。。",
    author: {
      name:"绝尘一骑",
      id: "111",
      description: "一个初来乍到的互动场景写手，各位观众老爷们轻拍~",
      followed: 2408
    },
    created: "2024-10-28",
    images: [
      {
        url: "/images/resources/guixiang.jpg"
      }
    ],
    like: 92,
    dislike: 3,
    collection: 32,
    share: 24
  },
  {
    id: "guixiang_nochat",
    name: "归乡",
    description: "思乡的夜晚，山路蜿蜒到天边，毫无准备的我，正在慢慢的离家乡越来越近，阴暗的角落里，仿佛有一个阴谋，正在狰狞着露出他的獠牙，一步一步逼近。。。",
    author: {
      name:"AI小说家",
      id: "111",
      description: "喜欢的小伙伴，欢迎点个赞帮转发一下，拜谢~",
      followed: 21233
    },
    created: "2024-10-28",
    images: [
      {
        url: "/images/resources/image_01.jpg"
      }
    ],
    like: 922,
    dislike: 31,
    collection: 328,
    share: 123
  },
  {
    id: "xujiangv15",
    name: "沉浸式做饭",
    description: "多久没有回到家，再看到那个人站在厨房的灶台边，回首欣喜的望着你的感觉了？有饭的地方就有家的感觉，来一次和老朋友的沉浸式做饭吧！",
    author: {
      name:"AI造梦师",
      id: "111",
      description: "接各类沉浸式陪伴场景定制商单，各种剧情玩法，欢迎私信~",
      followed: 2408
    },
    created: "2024-10-28",
    images: [
      {
        url: "/images/resources/xujiang.jpg"
      }
    ],
    like: 92,
    dislike: 3,
    collection: 32,
    share: 24
  }
]

var feed = [
  {
    image:"/images/resources/image_01.jpg",
    comment: "这种形式的互动小说真的是头一次见",
    title: "归乡",
    linkid: 'guixiang_nochat',
    by: "飞翼里的毛线",
  },
  {
    image:"/images/resources/guixiang.jpg",
    comment: "没看评论攻略，不知道原来结局竟然要这么搞。",
    title: "门缝外的脸",
    linkid: 'demoplayv03',
    by: "今晚吃鸡",
  },
  {
    image:"/images/resources/xujiang.jpg",
    comment: "这也太好玩了吧！",
    title: "沉浸式做饭",
    linkid: 'xujiangv15',
    by: "花间",
  },
  {
    image:"/images/resources/image_03.jpg",
    comment: "还是有些创意的",
    title: "周星星带你飞",
    linkid: 'xujiangv15',
    by: "winner",
  },
  {
    image:"/images/resources/image_04.jpg",
    comment: "玩到这里我就知道走错路了",
    title: "画皮画心",
    linkid: 'xujiangv15',
    by: "童心",
  },
  {
    image:"/images/resources/image_05.jpg",
    comment: "up主加油！",
    title: "ENDLESS",
    linkid: 'xujiangv15',
    by: "@@妈妈",
  },
  {
    image:"/images/resources/image_06.jpg",
    comment: "你是知道怎么算计玩家的",
    title: "冲出绝命镇",
    linkid: 'xujiangv15',
    by: "祖英我泽民啊",
  },
  {
    image:"/images/resources/image_08.jpg",
    comment: "你说我没事儿惹她干嘛？",
    title: "我的野蛮女友",
    linkid: 'xujiangv15',
    by: "帅宝儿",
  },
  {
    image:"/images/resources/image_07.jpg",
    comment: "总体来讲，有点意思",
    title: "气球旅程",
    linkid: 'xujiangv15',
    by: "77的88",
  }
]

module.exports = {
  productlist:productlist,
  feed: feed
}