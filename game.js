const initialStats = {
  Face: 50,
  Money: 50,
  Relation: 50,
  Energy: 50,
  Mood: 50,
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
        effects: { Mood: 5, Face: -4, Energy: -6 },
      },
      {
        text: "在群里阴阳一句‘理解是双向的’",
        effects: { Face: 6, Relation: -8, Mood: -3 },
      },
      {
        text: "私聊物业，语气客气但把问题说透",
        effects: { Relation: 5, Energy: -5, Mood: 2 },
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
        effects: { Face: -5, Money: -3, Energy: -4, Relation: 3 },
      },
      {
        text: "据理力争：‘你们昨天电话不是这么说的’",
        effects: { Face: 7, Mood: -6, Relation: -6, Energy: -3 },
      },
      {
        text: "给门口黄牛点钱，让他帮你跑一趟",
        effects: { Money: -12, Energy: 4, Face: -2, Relation: -2 },
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
        effects: { Money: -10, Relation: 8, Mood: -4 },
      },
      {
        text: "直接拒绝：‘我现在也紧’",
        effects: { Money: 2, Face: 4, Relation: -9, Mood: -2 },
      },
      {
        text: "请他吃饭但不借钱，把话摊开",
        effects: { Money: -6, Relation: 3, Face: 2, Energy: -2 },
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
        effects: { Face: 5, Energy: -12, Mood: -8, Relation: 4 },
      },
      {
        text: "明确拒绝：今天真不行",
        effects: { Face: -6, Mood: 6, Relation: -5, Energy: 5 },
      },
      {
        text: "提议分工：你做核心，其他人补齐",
        effects: { Relation: 6, Energy: -5, Mood: -2, Face: 2 },
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
        effects: { Mood: 8, Energy: 3, Face: -1 },
      },
      {
        text: "刷短视频到困，啥也不想",
        effects: { Mood: 2, Energy: -4, Money: -2 },
      },
      {
        text: "给一个信得过的人发语音，认个怂",
        effects: { Relation: 7, Mood: 4, Face: -3 },
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
  if (average >= 52 && stats.Energy >= 35 && stats.Mood >= 35) {
    return {
      title: "结局：撑过去了",
      text: "今天没赢，也没输。你只是把每一口气都续上了。\n北京还是那样，你也还是你。明天还能出门。",
    };
  }
  if (average >= 38 && stats.Mood >= 20) {
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
