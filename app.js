const screens = [...document.querySelectorAll(".screen")];
const backBtn = document.querySelector("#backBtn");
const homeBtn = document.querySelector("#homeBtn");
const startLightBtn = document.querySelector("#startLightBtn");
const finishBtn = document.querySelector("#finishBtn");
const backToMapBtn = document.querySelector("#backToMapBtn");
const toast = document.querySelector("#toast");
const unlockCount = document.querySelector("#unlockCount");
const todayLandmark = document.querySelector("#todayLandmark");
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
    subtitle: "Default landmark unlocked on your first login.",
    text:
      "This dream reconstruction centers on drifting light and distant shorelines. It suggests a desire to rest before moving toward something unfamiliar.",
    quote: "The sea keeps the parts of the dream you were not ready to name.",
  },
  forest: {
    title: "Clockwood",
    subtitle: "Today's newly lit dream coordinate.",
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
  todayLandmark.querySelector("text").textContent = "C";
  unlockCount.textContent = "2 / 8 landmarks unlocked";
  mapInfo.querySelector("small").textContent = "Today's lit landmark";
  mapInfo.querySelector("h2").textContent = "Clockwood";
  mapInfo.querySelector("p").textContent =
    "A new coordinate is now lit. Tap any unlocked landmark to replay its video and interpretation.";

  window.setTimeout(() => todayLandmark.classList.remove("newly-lit"), 1700);
}

function openReplay(id) {
  const data = replayData[id] || replayData.bay;
  replayTitle.textContent = data.title;
  replaySubtitle.textContent = data.subtitle;
  replayText.textContent = data.text;
  replayQuote.textContent = data.quote;
  showScreen("replay");
}

function goBack() {
  if (activeScreen === "capture" || activeScreen === "replay") showScreen("map");
  else if (activeScreen === "questions") showScreen("capture");
  else if (activeScreen === "video") showScreen("questions");
  else if (activeScreen === "result") showScreen("video");
}

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
  const activate = () => {
    if (!landmark.classList.contains("unlocked")) {
      showToast(`${landmark.dataset.title} is still locked.`);
      return;
    }
    openReplay(landmark.dataset.id);
  };

  landmark.addEventListener("click", activate);
  landmark.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
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
