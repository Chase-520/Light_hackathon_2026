const screens = [...document.querySelectorAll(".screen")];
const backBtn = document.querySelector("#backBtn");
const homeBtn = document.querySelector("#homeBtn");
const startLightBtn = document.querySelector("#startLightBtn");
const finishBtn = document.querySelector("#finishBtn");
const backToMapBtn = document.querySelector("#backToMapBtn");
const toast = document.querySelector("#toast");
const unlockCount = document.querySelector("#unlockCount");
const todayLandmark = document.querySelector("#todayLandmark");
const mapViewport = document.querySelector("#mapViewport");
const mapInfo = document.querySelector("#mapInfo");
const questionTitle = document.querySelector("#questionTitle");
const questionHint = document.querySelector("#questionHint");
const questionProgress = document.querySelector("#questionProgress");
const questionOptions = document.querySelector("#questionOptions");
const skipQuestionBtn = document.querySelector("#skipQuestionBtn");
const nextQuestionBtn = document.querySelector("#nextQuestionBtn");
const keywordInput = document.querySelector("#keywordInput");
const replayTitle = document.querySelector("#replayTitle");
const replaySubtitle = document.querySelector("#replaySubtitle");
const replayText = document.querySelector("#replayText");
const replayQuote = document.querySelector("#replayQuote");
const replayVideo = document.querySelector("#replayVideo");

let activeScreen = "map";
let todayLit = false;
let questionIndex = 0;

const questions = [
  {
    title: "How did you feel when you woke up?",
    hint: "Choose the mood closest to your first waking impression.",
    options: [
      ["sentiment_satisfied", "Calm, with a little longing"],
      ["thunderstorm", "Anxious and alert"],
      ["nightlight", "Quiet but curious"],
    ],
  },
  {
    title: "What was the clearest image in the dream?",
    hint: "A person, object, place, or even a color is enough.",
    options: [
      ["key", "A key or locked door"],
      ["water", "Water, glass, or reflection"],
      ["person", "Someone familiar"],
    ],
  },
  {
    title: "Has anything been repeating in your mind lately?",
    hint: "This helps Oneiros separate daily residue from deeper symbols.",
    options: [
      ["work_history", "A pending decision"],
      ["favorite", "A relationship or reunion"],
      ["explore", "A place I want to reach"],
    ],
  },
];

const replayData = {
  bay: {
    title: "Stardust Bay",
    subtitle: "Stored dream 1.",
    video: "./assets/dream-replay-2.mp4?v=2",
    text:
      "This dream appears visually active and emotionally charged, suggesting the mind was processing vivid images or unresolved impressions. The moving scene can be read as a sign of transition, curiosity, or internal momentum rather than distress.",
    quote: "The sea keeps the parts of the dream you were not ready to name.",
  },
  station: {
    title: "Mirror Station",
    subtitle: "Stored dream 2.",
    video: "./assets/dream-replay-3.mp4?v=2",
    text:
      "The rabbit may suggest gentleness, playfulness, and quick emotional movement. Birds in the sky often point to freedom, perspective, and lightness. Together, this dream reads as a calmer, more open dream record, with curiosity and emotional release as its main themes.",
    quote: "The reflection moves first, and you follow when you are ready.",
  },
  forest: {
    title: "Clockwood",
    subtitle: "Today's newly lit dream coordinate.",
    video: "./assets/dream-replay.mp4?v=2",
    text:
      "A locked door, an old clock, and a hidden key point to a decision that has waited long enough. The dream feels tense, but its ending is hopeful.",
    quote: "The light appears only after you stop forcing the door.",
  },
};

function showScreen(name) {
  activeScreen = name;
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
  document.querySelector(".app-shell").scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderQuestion() {
  const question = questions[questionIndex];
  questionTitle.textContent = question.title;
  questionHint.textContent = question.hint;
  questionProgress.textContent = `${questionIndex + 1} of ${questions.length}`;
  questionOptions.innerHTML = question.options
    .map(
      ([icon, label]) => `
        <button class="question-option" type="button">
          <span class="material-symbols-rounded">${icon}</span>
          <strong>${label}</strong>
        </button>
      `
    )
    .join("");

  questionOptions.querySelectorAll(".question-option").forEach((option) => {
    option.addEventListener("click", () => {
      questionOptions.querySelectorAll(".question-option").forEach((item) => item.classList.remove("selected"));
      option.classList.add("selected");
    });
  });
}

function advanceQuestion() {
  if (questionIndex >= questions.length - 1) {
    questionIndex = 0;
    renderQuestion();
    showScreen("video");
    return;
  }
  questionIndex += 1;
  renderQuestion();
}

function lightTodayLandmark() {
  if (todayLit) return;

  todayLit = true;
  todayLandmark.classList.remove("locked");
  todayLandmark.classList.add("unlocked", "newly-lit");
  todayLandmark.querySelector("text").textContent = "3";
  unlockCount.textContent = "3 / 8 landmarks unlocked";
  mapInfo.querySelector("small").textContent = "Today's lit landmark";
  mapInfo.querySelector("h2").textContent = "Clockwood";
  mapInfo.querySelector("p").textContent =
    "A new coordinate is now lit with today's generated dream video. Tap it to replay the reconstruction.";

  mapViewport.scrollTo({ left: 330, top: 0, behavior: "smooth" });
  window.setTimeout(() => todayLandmark.classList.remove("newly-lit"), 1700);
}

function openReplay(id) {
  const data = replayData[id] || replayData.bay;
  replayVideo.pause();
  replayVideo.src = data.video;
  replayVideo.load();
  replayTitle.textContent = data.title;
  replaySubtitle.textContent = data.subtitle;
  replayText.textContent = data.text;
  replayQuote.textContent = data.quote;
  showScreen("replay");
}

function activateLandmark(landmark) {
  if (!landmark.classList.contains("unlocked")) {
    showToast(`${landmark.dataset.title} is still locked.`);
    return;
  }
  openReplay(landmark.dataset.id);
}

function goBack() {
  if (activeScreen === "capture" || activeScreen === "replay") showScreen("map");
  else if (activeScreen === "questions") showScreen("capture");
  else if (activeScreen === "video") showScreen("questions");
  else if (activeScreen === "result") showScreen("video");
}

function setupDraggableMap() {
  let isDragging = false;
  let didDrag = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;
  let pressedLandmark = null;

  mapViewport.scrollLeft = 220;
  mapViewport.scrollTop = 86;

  mapViewport.addEventListener("pointerdown", (event) => {
    isDragging = true;
    didDrag = false;
    pressedLandmark = event.target instanceof Element ? event.target.closest(".landmark") : null;
    startX = event.clientX;
    startY = event.clientY;
    scrollLeft = mapViewport.scrollLeft;
    scrollTop = mapViewport.scrollTop;
    mapViewport.classList.add("dragging");
    mapViewport.setPointerCapture(event.pointerId);
  });

  mapViewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
    mapViewport.scrollLeft = scrollLeft - dx;
    mapViewport.scrollTop = scrollTop - dy;
  });

  const stopDrag = (event) => {
    if (!isDragging) return;
    const shouldOpenLandmark = pressedLandmark && !didDrag;
    isDragging = false;
    mapViewport.classList.remove("dragging");
    if (mapViewport.hasPointerCapture(event.pointerId)) {
      mapViewport.releasePointerCapture(event.pointerId);
    }
    if (shouldOpenLandmark) {
      activateLandmark(pressedLandmark);
    }
    pressedLandmark = null;
    window.setTimeout(() => {
      didDrag = false;
    }, 0);
  };

  mapViewport.addEventListener("pointerup", stopDrag);
  mapViewport.addEventListener("pointercancel", stopDrag);

  return () => didDrag;
}

const mapWasDragged = setupDraggableMap();

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});

document.querySelectorAll(".voice-bubble").forEach((bubble) => {
  bubble.addEventListener("click", () => {
    bubble.classList.toggle("playing");
    showToast(`Playing sleep talk: "${bubble.dataset.voice}"`);
  });
});

document.querySelectorAll("[data-keyword]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const words = keywordInput.value
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean);
    if (!words.includes(chip.dataset.keyword)) words.push(chip.dataset.keyword);
    keywordInput.value = words.join(", ");
  });
});

document.querySelectorAll(".landmark").forEach((landmark) => {
  landmark.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateLandmark(landmark);
    }
  });
});

startLightBtn.addEventListener("click", () => {
  if (todayLit) {
    showToast("Already lit today. See you tomorrow morning.");
    return;
  }
  showScreen("capture");
});

finishBtn.addEventListener("click", () => {
  showScreen("map");
  window.requestAnimationFrame(() => {
    lightTodayLandmark();
    showToast("Clockwood is now lit.");
  });
});

homeBtn.addEventListener("click", () => showScreen("map"));
backBtn.addEventListener("click", goBack);
backToMapBtn.addEventListener("click", () => showScreen("map"));
skipQuestionBtn.addEventListener("click", advanceQuestion);
nextQuestionBtn.addEventListener("click", advanceQuestion);

renderQuestion();
