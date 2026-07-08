const state = {
  screen: "home",
  questionStep: 0,
  journal: [
    {
      title: "雾里的电梯",
      date: "2026-07-06",
      summary: "关键词：电梯、迟到、白雾。睡眠评分 72，压力信号中。",
    },
  ],
};

const screens = [...document.querySelectorAll(".screen")];
const goButtons = [...document.querySelectorAll("[data-go]")];
const questionCards = [...document.querySelectorAll(".question-card")];
const progressDots = [...document.querySelectorAll(".progress span")];

const fields = {
  extra: document.querySelector("#extraInput"),
  refine: document.querySelector("#refineInput"),
};

function getSelectedChoice(question) {
  const selected = document.querySelector(`.option-group[data-question="${question}"] .option.selected`);
  return {
    value: selected?.dataset.value || "",
    label: selected?.querySelector("span")?.textContent.trim() || "以上内容都不在梦境中",
    letter: selected?.querySelector("b")?.textContent.trim() || "D",
  };
}

function showScreen(name) {
  state.screen = name;
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  if (name === "draft") renderDraft();
  if (name === "journal") renderJournal();

  document.querySelector(".phone").scrollTo({ top: 0, behavior: "smooth" });
}

function setQuestionStep(step) {
  state.questionStep = Math.max(0, Math.min(2, step));
  questionCards.forEach((card, index) => {
    card.classList.toggle("active", index === state.questionStep);
  });
  progressDots.forEach((dot, index) => {
    dot.classList.toggle("active", index <= state.questionStep);
  });
  document.querySelector("#prevQuestion").textContent = state.questionStep === 0 ? "返回首页" : "上一轮";
  document.querySelector("#nextQuestion").textContent = state.questionStep === 2 ? "生成梦境草稿" : "下一轮";
}

function analyzeTone(text) {
  const lower = text.toLowerCase();
  if (/焦虑|害怕|追|逃|打不开|找不到|冷|孤独|不要/.test(lower)) return "焦虑、孤独与寻找安全感";
  if (/温暖|家|光|妈妈|拥抱|平静/.test(lower)) return "怀念、温暖与靠近";
  if (/飞|宇宙|发光|奇幻|漂浮/.test(lower)) return "奇幻、失重与探索";
  return "模糊、安静与轻微不确定";
}

function tidySentence(text) {
  return text.replace(/[。！？\s]+$/g, "");
}

function buildDreamData() {
  const visualChoice = getSelectedChoice("visual");
  const emotionChoice = getSelectedChoice("emotion");
  const eventChoice = getSelectedChoice("event");
  const visual = visualChoice.value;
  const emotion = emotionChoice.value;
  const event = eventChoice.value;
  const extra = fields.extra.value.trim();
  const refine = fields.refine.value.trim();
  const tone = analyzeTone(`${visual} ${emotion} ${event} ${extra}`);

  const environment = /海|浪|沙滩/.test(visual) ? "夜晚海边" : /房|家|门/.test(visual + event) ? "熟悉又陌生的室内空间" : "半真实半梦境的空间";
  const palette = /紫/.test(visual) ? "深紫、冷蓝、暖金门缝光" : "冷蓝、雾白、低饱和暖光";
  const music = tone.includes("焦虑")
    ? "低频环境音、远处海浪声、缓慢钢琴和轻微心跳质感"
    : "柔和钢琴、空灵合成器、轻微环境自然声";
  const selectedCount = [visual, emotion, event].filter(Boolean).length;
  const similarity = Math.max(46, Math.min(92, 54 + selectedCount * 10 + (extra ? 6 : 0) + (refine ? 2 : 0)));
  const similarityReason =
    selectedCount === 0
      ? "三轮追问均未匹配到 AI 推测线索，因此视频会更多依靠梦话文本、REM 阶段和自由补充生成，贴近度偏保守。"
      : `AI 根据 ${selectedCount} 轮选择与梦话关键词、REM 心率上升、连续体动的匹配程度估算相似度。选择越多与自动采集线索一致，视频越接近系统推测的梦境片段。`;

  return {
    visual,
    emotion,
    event,
    extra,
    refine,
    tone,
    environment,
    palette,
    music,
    similarity,
    similarityReason,
    choices: { visual: visualChoice, emotion: emotionChoice, event: eventChoice },
  };
}

function renderDraft() {
  const dream = buildDreamData();
  document.querySelector("#draftText").textContent =
    `我理解到的梦境是：你似乎身处${dream.environment}，画面带有${dream.palette}的视觉倾向。` +
    `梦里的主要感受接近${dream.tone}。结合梦话“不要走”“门打不开”“我找不到路”和 REM 阶段的心率上升，` +
    `这段梦可能围绕一个想靠近却无法完全抵达的对象展开。你描述的关键事件是：${dream.event || "一个对象逐渐远离，你试图靠近或寻找出口。"} ` +
    `${dream.extra ? `你还补充了：${dream.extra}` : ""}`;
}

function generateResult() {
  const dream = buildDreamData();
  const prompt =
    `30-60 秒电影感梦境重现视频。场景：${dream.environment}。视觉：${tidySentence(dream.visual) || "依据梦话和睡眠数据生成抽象场景"}。` +
    `情绪：${tidySentence(dream.emotion) || "依据心率、呼吸和梦话生成情绪氛围"}。事件：${tidySentence(dream.event) || "依据梦话线索生成模糊事件"}。补充修正：${tidySentence(dream.refine) || "保持艺术化但不过度虚构"}。` +
    `整体风格为梦幻、低饱和、轻微超现实，色彩为${dream.palette}，镜头缓慢、漂浮、像模糊记忆。`;

  document.querySelector("#videoPrompt").textContent = prompt;
  document.querySelector("#musicText").textContent =
    `${dream.music}。音效包含远处回声、海浪或空间低鸣，并在门出现时加入柔和的高频光感音。`;

  const scenes = [
    ["00:00-00:08", `镜头贴近黑色沙滩或昏暗地面，缓慢向前推进，环境像刚从 REM 阶段浮现的碎片。`],
    ["00:08-00:20", `${dream.visual || "远处出现一个发光物体，空间边界变得不稳定。"} 镜头轻微摇晃，保留梦的模糊感。`],
    ["00:20-00:38", `${dream.event || "一个看不清的人影慢慢远离，主角试图追上。"} 心跳式低频和呼吸声轻轻出现。`],
    ["00:38-00:55", `门缝或光源成为最后焦点，画面从冷色转向一点暖光，情绪从紧张转为怀念。`],
  ];

  document.querySelector("#storyboard").innerHTML = scenes
    .map(([time, text], index) => `<article class="scene"><b>镜头 ${index + 1} · ${time}</b><p>${text}</p></article>`)
    .join("");

  document.querySelector("#interpretation").textContent =
    `这个梦可能与“寻找、靠近和安全感”有关。门像是边界或入口，海边和冷空气带有未知与情绪流动的感觉。` +
    `如果门后连接着小时候的家，它也许代表某种熟悉、被保护或想重新看清的记忆。以上只是用于自我观察的温和解读，不代表心理或医学诊断。`;

  document.querySelector("#healthText").textContent =
    `昨晚睡眠评分 78，整体时长充足，但 REM 阶段出现心率上升、体动增加和带有紧张色彩的梦话，压力信号判断为中。` +
    `建议睡前减少强刺激内容，保持稳定入睡时间，尝试 3-5 分钟呼吸放松，并持续记录梦境与情绪。如果长期失眠、噩梦频繁或呼吸/心率明显异常，建议咨询医生或专业心理咨询师。`;

  document.querySelector("#similarityValue").textContent = `${dream.similarity}%`;
  document.querySelector("#similarityReason").textContent = dream.similarityReason;

  showScreen("result");
}

function renderJournal() {
  const list = document.querySelector("#journalList");
  list.innerHTML = state.journal
    .map(
      (entry) => `
        <article class="journal-card">
          <h3>${entry.title}</h3>
          <p>${entry.date}</p>
          <p>${entry.summary}</p>
          <div class="chips">
            <span>可查看视频</span>
            <span>解梦</span>
            <span>健康建议</span>
          </div>
        </article>
      `,
    )
    .join("");
}

goButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});

document.querySelector("#prevQuestion").addEventListener("click", () => {
  if (state.questionStep === 0) showScreen("home");
  else setQuestionStep(state.questionStep - 1);
});

document.querySelector("#nextQuestion").addEventListener("click", () => {
  if (state.questionStep === 2) showScreen("draft");
  else setQuestionStep(state.questionStep + 1);
});

document.querySelector("#generateBtn").addEventListener("click", generateResult);

document.querySelectorAll(".option").forEach((option) => {
  option.addEventListener("click", () => {
    const group = option.closest(".option-group");
    group.querySelectorAll(".option").forEach((item) => item.classList.remove("selected"));
    option.classList.add("selected");
  });
});

document.querySelector("#saveBtn").addEventListener("click", () => {
  const dream = buildDreamData();
  state.journal.unshift({
    title: "夜海尽头的门",
    date: "2026-07-08",
    summary: `关键词：海边、门、童年家。AI 估算相似度 ${dream.similarity}%，压力信号中。`,
  });
  showScreen("journal");
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  setQuestionStep(0);
  showScreen("home");
});

setQuestionStep(0);
renderJournal();
