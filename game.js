const initialStats = {
  面子: 50,
  钱: 50,
  关系: 50,
  精力: 50,
  心气: 50,
};

const enabledPacks = ["main", "hutong-weekend"];
const scenePool = enabledPacks.flatMap((pack) => window.SCENE_PACKS[pack] || []);
const STAGE_COUNT = 5;

let stats = { ...initialStats };
let stageIndex = 0;
let currentScene = null;
let usedSceneIds = new Set();
const logList = [];
const turnHistory = [];
const flags = new Set();
const pendingConsequences = [];
const optionImpact = new Map();
let consecutiveBadTurns = 0;
let hopeUsed = false;

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

function getTotalEffectMagnitude(effects) {
  return Object.values(effects || {}).reduce((sum, value) => sum + Math.abs(value), 0);
}

function applyEffects(effects) {
  Object.entries(effects || {}).forEach(([key, value]) => {
    stats[key] = clamp(stats[key] + value);
  });
}

function describeEffects(effects) {
  return Object.entries(effects || {})
    .map(([key, val]) => `${key}${val > 0 ? `+${val}` : val}`)
    .join(" / ");
}

function renderStats() {
  statsEl.innerHTML = Object.entries(stats)
    .map(([key, value]) => {
      const barClass = value >= 60 ? "bar-good" : value < 35 ? "bar-bad" : "";
      return `
        <div class="stat">
          <label>${key}</label>
          <strong>${value}</strong>
          <div class="stat-bar"><span class="${barClass}" style="width:${value}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function renderLog() {
  logListEl.innerHTML = logList.map((item) => `<li>${item}</li>`).join("");
}

function addImpact(optionLabel, effects) {
  const previous = optionImpact.get(optionLabel) || 0;
  optionImpact.set(optionLabel, previous + getTotalEffectMagnitude(effects));
}

function resolvePendingConsequences() {
  const dueItems = pendingConsequences.filter((item) => item.applyAtStage === stageIndex);
  const remaining = pendingConsequences.filter((item) => item.applyAtStage !== stageIndex);
  pendingConsequences.length = 0;
  pendingConsequences.push(...remaining);

  dueItems.forEach((item) => {
    applyEffects(item.effects);
    addImpact(item.source, item.effects);
    logList.push(`⚠️ 延迟后果：${item.description}（${describeEffects(item.effects)}）`);
  });
}

function sceneAvailable(scene) {
  if (scene.stage !== stageIndex || usedSceneIds.has(scene.id)) {
    return false;
  }
  if (scene.requiresAnyFlags && !scene.requiresAnyFlags.some((flag) => flags.has(flag))) {
    return false;
  }
  if (scene.requiresAllFlags && !scene.requiresAllFlags.every((flag) => flags.has(flag))) {
    return false;
  }
  return true;
}

function chooseScene() {
  const candidates = scenePool.filter(sceneAvailable);
  if (!candidates.length) {
    return null;
  }
  const weighted = candidates
    .map((scene) => {
      const weight = (scene.requiresAnyFlags || []).filter((flag) => flags.has(flag)).length + 1;
      return { scene, weight };
    })
    .sort((a, b) => b.weight - a.weight);

  return weighted[0].scene;
}

function maybeAddHopeOption(options) {
  if (consecutiveBadTurns < 2 || hopeUsed) {
    return options;
  }
  const hopeOption = {
    text: "给自己十分钟，喝口热水，把今天拆成三件能做的小事",
    effects: { 心气: 6, 精力: 4, 面子: -1 },
    flags: ["self-repair"],
  };
  return [...options, hopeOption];
}

function chooseOption(option) {
  const optionLabel = `${currentScene.time}｜${option.text}`;
  const netScore = Object.values(option.effects).reduce((sum, value) => sum + value, 0);

  applyEffects(option.effects);
  addImpact(optionLabel, option.effects);

  if (option.flags) {
    option.flags.forEach((flag) => flags.add(flag));
  }

  if (option.delayedConsequences) {
    option.delayedConsequences.forEach((consequence) => {
      pendingConsequences.push({ ...consequence, source: optionLabel });
    });
  }

  if (option.text.startsWith("给自己十分钟")) {
    hopeUsed = true;
  }

  turnHistory.push({
    stage: stageIndex,
    sceneId: currentScene.id,
    sceneTitle: currentScene.title,
    optionText: option.text,
    effects: { ...option.effects },
  });

  logList.push(`${currentScene.time}：${option.text}（${describeEffects(option.effects)}）`);
  consecutiveBadTurns = netScore < 0 ? consecutiveBadTurns + 1 : 0;

  stageIndex += 1;
  renderStats();
  renderLog();
  renderScene();
}

function getEnding() {
  const average = Object.values(stats).reduce((a, b) => a + b, 0) / 5;
  const minStat = Object.entries(stats).sort((a, b) => a[1] - b[1])[0];

  if (stats["精力"] <= 18) {
    return {
      title: "结局：电量见底",
      text: "你把今天硬扛过去了，但身体在抗议。明天第一件事，不是冲，是补觉。",
    };
  }
  if (stats["钱"] <= 20) {
    return {
      title: "结局：现金流报警",
      text: "你撑住了场面，却把口袋掏得见底。接下来每一步都得更算计。",
    };
  }
  if (stats["关系"] <= 20) {
    return {
      title: "结局：圈子变窄",
      text: "你把边界守住了，也把一些人推远了。省事了，但孤单也更明显。",
    };
  }
  if (average >= 58 && stats["精力"] >= 40 && stats["心气"] >= 40) {
    return {
      title: "结局：稳住了",
      text: "今天没翻盘，但你把节奏攥在手里。不是漂亮仗，是成熟仗。",
    };
  }
  if (average >= 45 && stats["心气"] >= 25) {
    return {
      title: "结局：有点绷不住",
      text: "你知道自己在硬撑。面子和里子都磨薄了一层，先睡，明早再盘。",
    };
  }
  return {
    title: `结局：${minStat[0]}失守`,
    text: "你把一天过成一团乱麻。先活过今晚，明天把最薄弱的一项先补起来。",
  };
}

function getTopImpacts(limit = 2) {
  return [...optionImpact.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, score]) => `• ${label}（影响值 ${score}）`);
}

function renderEnding() {
  const ending = getEnding();
  const topImpacts = getTopImpacts();

  timeTagEl.textContent = "一天结束";
  sceneTitleEl.textContent = "";
  sceneDescEl.textContent = "";
  optionsEl.innerHTML = "";
  endingEl.classList.remove("hidden");

  endingEl.innerHTML = `
    <h3>${ending.title}</h3>
    <p class="desc">${ending.text}</p>
    <div class="recap">
      <h4>复盘：关键转折</h4>
      <p class="desc">${topImpacts.length ? topImpacts.join("\n") : "今天很平，没有明显转折。"}</p>
      <button id="copySummaryBtn" class="copy-btn">复制今天经历</button>
    </div>
  `;

  const copyBtn = document.getElementById("copySummaryBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const summaryText = `${ending.title}\n${ending.text}\n${topImpacts.join("\n")}`;
      try {
        await navigator.clipboard.writeText(summaryText);
        copyBtn.textContent = "已复制，可直接分享";
      } catch (error) {
        copyBtn.textContent = "复制失败，请手动复制";
      }
    });
  }

  restartBtn.classList.remove("hidden");
}

function renderScene() {
  if (stageIndex >= STAGE_COUNT) {
    renderEnding();
    return;
  }

  resolvePendingConsequences();
  currentScene = chooseScene();

  if (!currentScene) {
    stageIndex += 1;
    renderScene();
    return;
  }

  usedSceneIds.add(currentScene.id);
  endingEl.classList.add("hidden");
  timeTagEl.textContent = currentScene.time;
  sceneTitleEl.textContent = currentScene.title;
  sceneDescEl.textContent = currentScene.description;
  optionsEl.innerHTML = "";

  const displayedOptions = maybeAddHopeOption(currentScene.options);
  displayedOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = `${option.text}（${describeEffects(option.effects)}）`;
    button.addEventListener("click", () => chooseOption(option));
    optionsEl.appendChild(button);
  });

  renderStats();
  renderLog();
}

restartBtn.addEventListener("click", () => {
  stats = { ...initialStats };
  stageIndex = 0;
  currentScene = null;
  usedSceneIds = new Set();
  logList.length = 0;
  turnHistory.length = 0;
  flags.clear();
  pendingConsequences.length = 0;
  optionImpact.clear();
  consecutiveBadTurns = 0;
  hopeUsed = false;

  restartBtn.classList.add("hidden");
  renderStats();
  renderLog();
  renderScene();
});

renderStats();
renderLog();
renderScene();
