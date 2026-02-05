const initialStats = {
  面子: 50,
  钱: 50,
  关系: 50,
  精力: 50,
  心气: 50,
};

const scenes = [
  {
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
        effects: { 面子: 6, 关系: -8, 心气: -3 },
      },
      {
        text: "私聊物业，语气客气但把问题说透",
        effects: { 关系: 5, 精力: -5, 心气: 2 },
      },
    ],
  },
  {
    time: "上午 · 办事",
    title: "窗口前的规矩",
    description:
      "你去办一张证明，窗口说材料差一页复印件。\n后面队伍已经开始不耐烦。工作人员没抬头，只说‘下一位’。",
    options: [
      {
        text: "赔笑，先撤，去外面复印再回来",
        effects: { 面子: -5, 钱: -3, 精力: -4, 关系: 3 },
      },
      {
        text: "据理力争：‘你们昨天电话不是这么说的’",
        effects: { 面子: 7, 心气: -6, 关系: -6, 精力: -3 },
      },
      {
        text: "给门口黄牛点钱，让他帮你跑一趟",
        effects: { 钱: -12, 精力: 4, 面子: -2, 关系: -2 },
      },
    ],
  },
  {
    time: "中午 · 吃饭/碰人",
    title: "面馆遇旧识",
    description:
      "你端着一碗炸酱面刚坐下，碰见以前一起干活的老刘。\n他开口就借钱，说下周肯定还。",
    options: [
      {
        text: "借一小笔，留点余地",
        effects: { 钱: -10, 关系: 8, 心气: -4 },
      },
      {
        text: "直接拒绝：‘我现在也紧’",
        effects: { 钱: 2, 面子: 4, 关系: -9, 心气: -2 },
      },
      {
        text: "请他吃饭但不借钱，把话摊开",
        effects: { 钱: -6, 关系: 3, 面子: 2, 精力: -2 },
      },
    ],
  },
  {
    time: "下午 · 冲突/抉择",
    title: "临时加活",
    description:
      "领导临时甩来一份活，今晚要。\n你本来答应家里去接孩子。\n群里没人接话，气氛像一锅闷着的水。",
    options: [
      {
        text: "咬牙接了，先把事顶住",
        effects: { 面子: 5, 精力: -12, 心气: -8, 关系: 4 },
      },
      {
        text: "明确拒绝：今天真不行",
        effects: { 面子: -6, 心气: 6, 关系: -5, 精力: 5 },
      },
      {
        text: "提议分工：你做核心，其他人补齐",
        effects: { 关系: 6, 精力: -5, 心气: -2, 面子: 2 },
      },
    ],
  },
  {
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
        effects: { 心气: 2, 精力: -4, 钱: -2 },
      },
      {
        text: "给一个信得过的人发语音，认个怂",
        effects: { 关系: 7, 心气: 4, 面子: -3 },
      },
    ],
  },
];

let stats = { ...initialStats };
let sceneIndex = 0;
const logList = [];

const statsEl = document.getElementById("stats");
const timeTagEl = document.getElementById("timeTag");
const sceneTitleEl = document.getElementById("sceneTitle");
const sceneDescEl = document.getElementById("sceneDesc");
const optionsEl = document.getElementById("options");
const logListEl = document.getElementById("logList");
const endingEl = document.getElementById("ending");
const restartBtn = document.getElementById("restartBtn");

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function renderStats() {
  statsEl.innerHTML = Object.entries(stats)
    .map(
      ([key, value]) =>
        `<div class="stat"><label>${key}</label><strong>${value}</strong></div>`
    )
    .join("");
}

function describeEffects(effects) {
  return Object.entries(effects)
    .map(([key, val]) => `${key}${val > 0 ? `+${val}` : val}`)
    .join(" / ");
}

function renderLog() {
  logListEl.innerHTML = logList.map((item) => `<li>${item}</li>`).join("");
}

function chooseOption(option) {
  Object.entries(option.effects).forEach(([k, v]) => {
    stats[k] = clamp(stats[k] + v);
  });

  logList.push(`${scenes[sceneIndex].time}：${option.text}（${describeEffects(option.effects)}）`);
  sceneIndex += 1;
  renderStats();
  renderLog();
  renderScene();
}

function getEnding() {
  const average = Object.values(stats).reduce((a, b) => a + b, 0) / 5;
  if (average >= 52 && stats["精力"] >= 35 && stats["心气"] >= 35) {
    return {
      title: "结局：撑过去了",
      text: "今天没赢，也没输。你只是把每一口气都续上了。\n北京还是那样，你也还是你。明天还能出门。",
    };
  }
  if (average >= 38 && stats["心气"] >= 20) {
    return {
      title: "结局：有点绷不住",
      text: "你知道自己在硬撑。面子和里子都磨薄了一层。\n事还在，账还在，人也还在——先睡吧。",
    };
  }
  return {
    title: "结局：今天算是塌了",
    text: "你把一天过成了一团乱麻。\n没人真看见你的难，但每一处都在要你付代价。\n先活过今晚，明天再说。",
  };
}

function renderScene() {
  if (sceneIndex >= scenes.length) {
    const ending = getEnding();
    timeTagEl.textContent = "一天结束";
    sceneTitleEl.textContent = "";
    sceneDescEl.textContent = "";
    optionsEl.innerHTML = "";
    endingEl.classList.remove("hidden");
    endingEl.innerHTML = `<h3>${ending.title}</h3><p class="desc">${ending.text}</p>`;
    restartBtn.classList.remove("hidden");
    return;
  }

  const scene = scenes[sceneIndex];
  endingEl.classList.add("hidden");
  timeTagEl.textContent = scene.time;
  sceneTitleEl.textContent = scene.title;
  sceneDescEl.textContent = scene.description;
  optionsEl.innerHTML = "";

  scene.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = `${option.text}（${describeEffects(option.effects)}）`;
    button.addEventListener("click", () => chooseOption(option));
    optionsEl.appendChild(button);
  });
}

restartBtn.addEventListener("click", () => {
  stats = { ...initialStats };
  sceneIndex = 0;
  logList.length = 0;
  restartBtn.classList.add("hidden");
  renderStats();
  renderLog();
  renderScene();
});

renderStats();
renderLog();
renderScene();
