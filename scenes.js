const SCENE_PACKS = {
  main: [
    {
      id: "morning-elevator",
      stage: 0,
      time: "早上 · 出门",
      title: "电梯口那一分钟",
      description:
        "你站在楼道里，电梯慢得像故意跟你作对。\n手机弹出物业群消息：‘近期请大家理解施工。’\n你看了眼时间，迟到边缘。",
      options: [
        {
          text: "忍着不说，走楼梯下去",
          effects: { 心气: 5, 面子: -4, 精力: -6 },
        },
        {
          text: "在群里阴阳一句‘理解是双向的’",
          effects: { 面子: 6, 人缘: -8, 心气: -3 },
          flags: ["public-conflict"],
        },
        {
          text: "私聊物业，语气客气但把问题说透",
          effects: { 人缘: 5, 精力: -5, 心气: 2 },
          flags: ["calm-communication"],
        },
      ],
    },
    {
      id: "morning-traffic",
      stage: 0,
      time: "早上 · 出门",
      title: "早高峰绕行",
      description:
        "导航一路飘红，前面轻微剐蹭堵死主路。\n群里已经有人催你到岗。",
      requiresAnyFlags: ["public-conflict"],
      options: [
        {
          text: "抄近路钻胡同，赌一把",
          effects: { 精力: -4, 心气: 3, 面子: 2 },
          delayedConsequences: [
            {
              applyAtStage: 3,
              description: "你被追拍违停短信提醒，补缴罚款。",
              effects: { 马内: -8, 心气: -2 },
            },
          ],
        },
        {
          text: "老实跟导航，顺手给同事发语音说明",
          effects: { 面子: -2, 人缘: 4, 心气: 1 },
          flags: ["team-trust"],
        },
      ],
    },
    {
      id: "noon-noodle",
      stage: 2,
      time: "中午 · 吃饭/碰人",
      title: "面馆遇旧识",
      description:
        "你端着一碗炸酱面刚坐下，碰见以前一起干活的老刘。\n他开口就借马内，说下周肯定还。",
      options: [
        {
          text: "借一小笔，留点余地",
          effects: { 马内: -10, 人缘: 8, 心气: -4 },
          delayedConsequences: [
            {
              applyAtStage: 4,
              description: "老刘半夜发来消息：还得再缓几天。",
              effects: { 心气: -5, 面子: -2 },
            },
          ],
        },
        {
          text: "直接拒绝：‘我现在也紧’",
          effects: { 马内: 2, 面子: 4, 人缘: -9, 心气: -2 },
        },
        {
          text: "请他吃饭但不借马内，把话摊开",
          effects: { 马内: -6, 人缘: 3, 面子: 2, 精力: -2 },
          flags: ["clear-boundary"],
        },
      ],
    },
    {
      id: "afternoon-overtime",
      stage: 3,
      time: "下午 · 冲突/抉择",
      title: "临时加活",
      description:
        "领导临时甩来一份活，今晚要。\n你本来答应家里去接孩子。\n群里没人接话，气氛像一锅闷着的水。",
      options: [
        {
          text: "咬牙接了，先把事顶住",
          effects: { 面子: 5, 精力: -12, 心气: -8, 人缘: 4 },
          flags: ["overdraft-energy"],
        },
        {
          text: "明确拒绝：今天真不行",
          effects: { 面子: -6, 心气: 6, 人缘: -5, 精力: 5 },
          flags: ["self-priority"],
        },
        {
          text: "提议分工：你做核心，其他人补齐",
          effects: { 人缘: 6, 精力: -5, 心气: -2, 面子: 2 },
          flags: ["team-trust"],
        },
      ],
    },
    {
      id: "night-store",
      stage: 4,
      time: "晚上 · 结算/反思",
      title: "楼下小卖部",
      description:
        "夜里回到楼下，你买了瓶冰水坐在台阶上。\n微信里未读消息一串，银行卡余额不太好看。\n你决定怎么收这一天。",
      options: [
        {
          text: "把今天账单和安排记下来，明天按计划来",
          effects: { 心气: 8, 精力: 3, 面子: -1 },
        },
        {
          text: "刷短视频到困，啥也不想",
          effects: { 心气: 2, 精力: -4, 马内: -2 },
        },
        {
          text: "给一个信得过的人发语音，认个怂",
          effects: { 人缘: 7, 心气: 4, 面子: -3 },
        },
      ],
    },
  ],
  "hutong-weekend": [
    {
      id: "morning-window",
      stage: 1,
      time: "上午 · 办事",
      title: "窗口前的规矩",
      description:
        "你去办一张证明，窗口说材料差一页复印件。\n后面队伍已经开始不耐烦。工作人员没抬头，只说‘下一位’。",
      options: [
        {
          text: "赔笑，先撤，去外面复印再回来",
          effects: { 面子: -5, 马内: -3, 精力: -4, 人缘: 3 },
        },
        {
          text: "据理力争：‘你们昨天电话不是这么说的’",
          effects: { 面子: 7, 心气: -6, 人缘: -6, 精力: -3 },
          flags: ["public-conflict"],
        },
        {
          text: "给门口黄牛点马内，让他帮你跑一趟",
          effects: { 马内: -12, 精力: 4, 面子: -2, 人缘: -2 },
          delayedConsequences: [
            {
              applyAtStage: 4,
              description: "黄牛又来私信你，后续还想加价。",
              effects: { 心气: -3, 马内: -4 },
            },
          ],
        },
      ],
    },
    {
      id: "afternoon-parent",
      stage: 3,
      time: "下午 · 冲突/抉择",
      title: "家长群连环响",
      description:
        "你刚准备收尾工作，家长群突然弹出‘明早亲子展示请准备道具’。\n你家里几乎没材料。",
      requiresAnyFlags: ["self-priority", "clear-boundary", "team-trust"],
      options: [
        {
          text: "现在就下单买成品，省时间",
          effects: { 马内: -9, 精力: 3, 心气: 1 },
        },
        {
          text: "回家手工凑一个，今晚少睡",
          effects: { 马内: -2, 精力: -8, 人缘: 5, 心气: -1 },
        },
      ],
    },
    {
      id: "night-walk",
      stage: 4,
      time: "晚上 · 结算/反思",
      title: "二环边上走一圈",
      description:
        "路灯下风有点凉，你沿着便道慢慢走。\n手机震动不停，你忽然不太想立刻回。",
      requiresAnyFlags: ["overdraft-energy", "public-conflict"],
      options: [
        {
          text: "把消息分优先级，先回三条最要紧的",
          effects: { 心气: 6, 人缘: 3, 精力: -1 },
        },
        {
          text: "都先晾着，今晚只顾自己",
          effects: { 精力: 4, 心气: 2, 人缘: -5 },
        },
      ],
    },
  ],
};

window.SCENE_PACKS = SCENE_PACKS;
