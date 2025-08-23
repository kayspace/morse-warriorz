// Morse Code Dictionary
const morseCode = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  " ": "/",
  "&": ".-...",
  "'": ".----.",
  "@": ".--.-.",
  ")": "-.--.-",
  "(": "-.--.",
  ":": "---...",
  ",": "--..--",
  "=": "-...-",
  "!": "-.-.--",
  ".": ".-.-.-",
  "-": "-....-",
  "×": "-..-",
  "%": "----- -..-.",
  "+": ".-.-.",
  '"': ".-..-.",
  "?": "..--..",
  "/": "-..-.",
};

// Reverse morse code dictionary for decoding
const reverseMorseCode = {};
Object.keys(morseCode).forEach((key) => {
  reverseMorseCode[morseCode[key]] = key;
});

const cheatsheetPhrases = {
  A: { morse: ".-", phrase: "a-PART" },
  B: { morse: "-...", phrase: "BOB-is-the-man" },
  C: { morse: "-.-.", phrase: "CO-ca-CO-la" },
  D: { morse: "-..", phrase: "DOG-did-it" },
  E: { morse: ".", phrase: "eh?" },
  F: { morse: "..-.", phrase: "fetch-a-FIRE-man" },
  G: { morse: "--.", phrase: "GOOD-GRAV-y" },
  H: { morse: "....", phrase: "hip-i-ty-hop" },
  I: { morse: "..", phrase: "i-bid" },
  J: { morse: ".---", phrase: "in-JAWS-JAWS-JAWS" },
  K: { morse: "-.-", phrase: "KANG-a-ROO" },
  L: { morse: ".-..", phrase: "los-AN-ge-les" },
  M: { morse: "--", phrase: "MMMM-MMMM" },
  N: { morse: "-.", phrase: "NU-dist" },
  O: { morse: "---", phrase: "OH-MY-GOD" },
  P: { morse: ".--.", phrase: "a-POOP-Y-smell" },
  Q: { morse: "--.-", phrase: "GOD-SAVE-the-QUEEN" },
  R: { morse: ".-.", phrase: "ro-TAT-ion" },
  S: { morse: "...", phrase: "si-si-si" },
  T: { morse: "-", phrase: "TALL" },
  U: { morse: "..-", phrase: "u-ni-FORM" },
  V: { morse: "...-", phrase: "vic-tor-y-VEE" },
  W: { morse: ".--", phrase: "the-WORLD-WAR" },
  X: { morse: "-..-", phrase: "X-marks-the-SPOT" },
  Y: { morse: "-.--", phrase: "YOU'RE-a-COOL-DUDE" },
  Z: { morse: "--..", phrase: "ZINC-ZOO-kee-per" },
};

// Audio context for playing morse code sounds
let audioContext;
let soundEnabled = true;

// Practice game variables
let currentQuestion = "";
let currentAnswer = "";
let score = 0;
let totalQuestions = 0;

// Sound Quiz variables
let quizTargetText = "";
let quizTargetMorse = "";
let quizRounds = 0;
let quizCorrect = 0;
let quizStreak = 0;
let currentVolume = 0.8;
let progressInterval;
let visualizerInterval;
let isPlaying = false;
let progressStartTime = 0;
let currentProgressDuration = 0;

const currentSection = "converter";

document.addEventListener("DOMContentLoaded", () => {
  showLoadingAnimation();
});

function showLoadingAnimation() {
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingCounter = document.getElementById("loadingCounter");
  const mainContent = document.getElementById("mainContent");

  // Ensure page starts at top
  window.scrollTo(0, 0);

  let counter = 0;
  const interval = setInterval(() => {
    counter += Math.floor(Math.random() * 15) + 5;
    if (counter >= 100) {
      counter = 100;
      clearInterval(interval);

      setTimeout(() => {
        loadingScreen.classList.add("hidden");
        mainContent.classList.add("visible");
        initializeApp();
        // Ensure focus is at top after initialization
        window.scrollTo(0, 0);
      }, 500);
    }
    loadingCounter.textContent = counter;
  }, 100);
}

// accordion functionality for cheatsheet and reference sections
function initializeAccordions() {
    // Cheatsheet section
    const cheatsheetHeader = document.getElementById('cheatsheet-accordion');
    const cheatsheetContent = document.getElementById('cheatsheet-content');
    const cheatsheetArrow = document.getElementById('cheatsheet-arrow');

    cheatsheetHeader.addEventListener('click', function() {
        if (cheatsheetContent.classList.contains('collapsed')) {
            // Show content
            cheatsheetContent.classList.remove('collapsed');
            cheatsheetArrow.classList.remove('collapsed');
        } else {
            // Hide content
            cheatsheetContent.classList.add('collapsed');
            cheatsheetArrow.classList.add('collapsed');
        }
    });

    // Reference section
    const referenceHeader = document.getElementById('reference-accordion');
    const referenceContent = document.getElementById('reference-content');
    const referenceArrow = document.getElementById('reference-arrow');

    referenceHeader.addEventListener('click', function() {
        if (referenceContent.classList.contains('collapsed')) {
            // Show content
            referenceContent.classList.remove('collapsed');
            referenceArrow.classList.remove('collapsed');

        } else {
            // Hide content
            referenceContent.classList.add('collapsed');
            referenceArrow.classList.add('collapsed');
        }
    });
}

function initializeApp() {
  initializeAudio();
  setupEventListeners();
  generateMorseReference();
  generateCheatsheet();
  generateNewQuestion();
  initializeSoundQuiz();
  setupScrollNavigation();
  initializeAccordions();
}

function setupScrollNavigation() {
  const nav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }

    updateActiveNavLink();
  });

  // Smooth scroll for navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navHeight = nav.offsetHeight;
        const targetPosition = targetElement.offsetTop - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

function updateActiveNavLink() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");
  const navHeight = document.querySelector(".main-nav").offsetHeight;

  let currentActiveSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - navHeight - 50;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
      currentActiveSection = section.id;
    }
  });

  // Update active states
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href").substring(1);
    if (targetId === currentActiveSection) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function initializeAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log("Audio not supported");
  }
}

function setupEventListeners() {
  // Text to Morse converter
  document
    .getElementById("convertBtn")
    .addEventListener("click", convertToMorse);
  document
    .getElementById("textInput")
    .addEventListener("input", convertToMorse);
  document.getElementById("playBtn").addEventListener("click", playMorseSound);

  // Morse to Text converter
  document
    .getElementById("decodeBtn")
    .addEventListener("click", decodeFromMorse);
  document
    .getElementById("morseInput")
    .addEventListener("input", decodeFromMorse);

  // Practice game
  document
    .getElementById("checkAnswerBtn")
    .addEventListener("click", checkAnswer);
  document
    .getElementById("newQuestionBtn")
    .addEventListener("click", generateNewQuestion);
  document
    .getElementById("playPracticeBtn")
    .addEventListener("click", playPracticeSound);
  document
    .getElementById("practiceAnswer")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        checkAnswer();
      }
    });

  // Sound Quiz
  const quizPlayBtn = document.getElementById("quizPlayBtn");
  const quizNextBtn = document.getElementById("quizNextBtn");
  const quizReplayBtn = document.getElementById("quizReplayBtn");
  const quizCheckBtn = document.getElementById("quizCheckBtn");
  const quizAnswer = document.getElementById("quizAnswer");
  const quizSpeed = document.getElementById("quizSpeed");
  const quizSpeedValue = document.getElementById("quizSpeedValue");
  const quizVolume = document.getElementById("quizVolume");
  const quizVolumeValue = document.getElementById("quizVolumeValue");

  if (quizPlayBtn) {
    quizPlayBtn.addEventListener("click", toggleQuizPlayback);
  }
  if (quizNextBtn) {
    quizNextBtn.addEventListener("click", generateNewQuizItem);
  }
  if (document.getElementById("quizResetBtn")) {
    document.getElementById("quizResetBtn").addEventListener("click", resetQuizGame);
  }
  if (quizCheckBtn) {
    quizCheckBtn.addEventListener("click", checkQuizAnswer);
  }
  if (quizAnswer) {
    quizAnswer.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        checkQuizAnswer();
      }
    });
  }
  if (quizSpeed && quizSpeedValue) {
    quizSpeed.addEventListener("input", () => {
      quizSpeedValue.textContent = `${Number(quizSpeed.value).toFixed(1)}x`;
    });
  }
  if (quizVolume && quizVolumeValue) {
    quizVolume.addEventListener("input", () => {
      currentVolume = Number(quizVolume.value) / 100;
      quizVolumeValue.textContent = `${quizVolume.value}%`;
      
      // Update volume for currently playing audio
      if (isPlaying && audioContext) {
        // The volume will be applied to new tones being created
        // Existing tones will continue at their original volume
      }
    });
  }
  if (document.getElementById("quizDifficulty")) {
    document.getElementById("quizDifficulty").addEventListener("change", () => {
      // Immediately stop any current playback
      stopQuizPlayback();
      // Generate new quiz item with new difficulty
      generateNewQuizItem();
    });
  }
}

function convertToMorse() {
  const text = document.getElementById("textInput").value.toUpperCase();
  const morseOutput = document.getElementById("morseOutput");
  const playBtn = document.getElementById("playBtn");

  if (!text.trim()) {
    morseOutput.textContent = "";
    playBtn.disabled = true;
    return;
  }

  let morse = "";
  for (const char of text) {
    if (morseCode[char]) {
      morse += morseCode[char] + " ";
    } else if (char === " ") {
      morse += "/ ";
    } else {
      morse += "? ";
    }
  }

  morseOutput.textContent = morse.trim();
  playBtn.disabled = false;
}

function decodeFromMorse() {
  const morse = document.getElementById("morseInput").value;
  const textOutput = document.getElementById("textOutput");

  if (!morse.trim()) {
    textOutput.textContent = "";
    return;
  }

  const morseWords = morse.split("/");
  let decoded = "";

  for (const word of morseWords) {
    const morseLetters = word.trim().split(" ");
    for (const morseLetter of morseLetters) {
      if (morseLetter.trim() && reverseMorseCode[morseLetter.trim()]) {
        decoded += reverseMorseCode[morseLetter.trim()];
      } else if (morseLetter.trim()) {
        decoded += "?";
      }
    }
    decoded += " ";
  }

  textOutput.textContent = decoded.trim();
}

function playMorseSound() {
  if (!audioContext || isPlaying) return;

  const morse = document.getElementById("morseOutput").textContent;
  playMorseSequence(morse);
}

function playPracticeSound() {
  if (!audioContext || isPlaying) return;

  const morse = document.getElementById("practiceQuestion").textContent;
  playMorseSequence(morse);
}

function playMorseSequence(morse, speedMultiplier = 1) {
  if (isPlaying) return;

  isPlaying = true;
  setQuizPlayingState(true);
  startProgressTracking(morse, speedMultiplier);
  startVisualizer();

  let time = audioContext.currentTime;
  const totalDuration = calculateMorseDuration(morse, speedMultiplier);

  const unitDot = 0.1 / speedMultiplier; // base 0.1s for dot
  const unitDash = 0.3 / speedMultiplier;
  const gapIntra = 0.05 / speedMultiplier; // small gap between tones of same char
  const gapLetter = 0.2 / speedMultiplier;
  const gapWord = 0.5 / speedMultiplier;

  for (const char of morse) {
    if (char === ".") {
      playTone(600, time, unitDot);
      time += unitDot + gapIntra;
    } else if (char === "-") {
      playTone(600, time, unitDash);
      time += unitDash + gapIntra;
    } else if (char === " ") {
      time += gapLetter;
    } else if (char === "/") {
      time += gapWord;
    }
  }

  setTimeout(() => {
    if (isPlaying) {
      stopQuizPlayback();
    }
  }, totalDuration * 1000);
}

function calculateMorseDuration(morse, speedMultiplier) {
  let duration = 0;
  const unitDot = 0.1 / speedMultiplier;
  const unitDash = 0.3 / speedMultiplier;
  const gapIntra = 0.05 / speedMultiplier;
  const gapLetter = 0.2 / speedMultiplier;
  const gapWord = 0.5 / speedMultiplier;

  for (const char of morse) {
    if (char === ".") {
      duration += unitDot + gapIntra;
    } else if (char === "-") {
      duration += unitDash + gapIntra;
    } else if (char === " ") {
      duration += gapLetter;
    } else if (char === "/") {
      duration += gapWord;
    }
  }
  return duration;
}

function playTone(frequency, startTime, duration) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  // Use current volume setting directly
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(currentVolume, startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(currentVolume, startTime + duration - 0.01);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function generateNewQuestion() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&'@)(:,.=!×%+\"?/";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];

  currentAnswer = randomLetter;
  currentQuestion = morseCode[randomLetter];

  document.getElementById("practiceQuestion").textContent = currentQuestion;
  document.getElementById("practiceAnswer").value = "";
  document.getElementById("practiceResult").textContent = "";
  document.getElementById("practiceAnswer").focus();
}

document.getElementById("soundToggleBtn").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  document.getElementById("soundToggleBtn").textContent = soundEnabled
    ? "Sound: ON"
    : "Sound: OFF";

});

function checkAnswer() {
  const userAnswer = document
    .getElementById("practiceAnswer")
    .value.toUpperCase();
  const resultDiv = document.getElementById("practiceResult");

  if (!userAnswer) return;

  totalQuestions++;

  if (userAnswer === currentAnswer) {
    score++;
    resultDiv.textContent = "Correct! Well done!";
    resultDiv.className = "practice-result correct";

    // Play success sound
    if (audioContext && soundEnabled) {
      playTone(800, audioContext.currentTime, 0.2);
      setTimeout(() => playTone(1000, audioContext.currentTime, 0.2), 200);
    }
  } else {
    resultDiv.textContent = `Incorrect. The answer was ${currentAnswer}`;
    resultDiv.className = "practice-result incorrect";

    // Play error sound
    if (audioContext && soundEnabled) {
      playTone(300, audioContext.currentTime, 0.3);
    }
  }

  document.getElementById("score").textContent = `${score}/${totalQuestions}`;

  // Auto-generate new question after 2 seconds
  if (totalQuestions < 10) {
    setTimeout(() => {
      generateNewQuestion();
    }, 2000);
  } else {
    endGame();
  }
}

function endGame() {
  const resultDiv = document.getElementById("practiceResult");
  resultDiv.textContent = `Game Over! Final Score: ${score}/10 (^◕.◕^)`;
  resultDiv.className = "practice-result correct fade-in";

  document.getElementById("practiceQuestion").textContent = "";
  document.getElementById("practiceAnswer").disabled = true;
  document.getElementById("checkAnswerBtn").disabled = true;

  const nextBtn = document.getElementById("newQuestionBtn");
  nextBtn.textContent = "PLAY AGAIN";
  nextBtn.onclick = resetGame;
}

function resetGame() {
  score = 0;
  totalQuestions = 0;
  document.getElementById("score").textContent = "0/10";
  document.getElementById("practiceAnswer").disabled = false;
  document.getElementById("checkAnswerBtn").disabled = false;

  const nextBtn = document.getElementById("newQuestionBtn");
  nextBtn.textContent = "NEXT";
  nextBtn.onclick = generateNewQuestion;

  generateNewQuestion();
}


function generateMorseReference() {
  const morseGrid = document.getElementById("morseGrid");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&'@)(:,.=!×%+\"?/";

  for (const letter of letters) {
    const morseItem = document.createElement("div");
    morseItem.className = "morse-item";
    morseItem.innerHTML = `
      <div class="morse-letter">${letter}</div>
      <div class="morse-code">${morseCode[letter]}</div>
    `;

    // Add click to play sound
    morseItem.addEventListener("click", () => {
      if (audioContext && !isPlaying) {
        playMorseSequence(morseCode[letter]);
      }
    });

    morseGrid.appendChild(morseItem);
  }
}

function generateCheatsheet() {
  const cheatsheetGrid = document.getElementById("cheatsheetGrid");

  Object.keys(cheatsheetPhrases).forEach((letter) => {
    const item = cheatsheetPhrases[letter];
    const cheatsheetItem = document.createElement("div");
    cheatsheetItem.className = "cheatsheet-item";
    cheatsheetItem.innerHTML = `
      <div class="cheatsheet-letter">${letter}</div>
      <div class="cheatsheet-morse">${item.morse}</div>
      <div class="cheatsheet-phrase">"${item.phrase}"</div>
    `;

    // Add click to play sound
    cheatsheetItem.addEventListener("click", () => {
      if (audioContext && !isPlaying) {
        playMorseSequence(item.morse);
      }
    });

    cheatsheetGrid.appendChild(cheatsheetItem);
  });
}

// --- Sound Quiz ---
function initializeSoundQuiz() {
  // pre-populate first quiz but don't auto-play
  generateNewQuizItemWithoutAutoPlay();
  const speedEl = document.getElementById("quizSpeed");
  const speedValue = document.getElementById("quizSpeedValue");
  if (speedEl && speedValue) {
    speedValue.textContent = `${Number(speedEl.value).toFixed(1)}x`;
  }
  setQuizStatusText("Ready");
}

function smoothClearInput(
  inputEl,
  placeholderText = "Decode the morse sound..."
) {
  try {
    inputEl.classList.add("clearing");
    setTimeout(() => {
      inputEl.value = "";
      inputEl.placeholder = placeholderText;
      inputEl.classList.remove("clearing");
      inputEl.focus();
    }, 180);
  } catch (_) {
    inputEl.value = "";
    inputEl.placeholder = placeholderText;
    inputEl.focus();
  }
}

function getQuizSpeedMultiplier() {
  const speedEl = document.getElementById("quizSpeed");
  const value = speedEl ? Number(speedEl.value) : 1;
  return value > 0 ? value : 1;
}

function generateNewQuizItem() {
  // Stop current playback first
  stopQuizPlayback();
  
  const difficulty = (document.getElementById("quizDifficulty") || {}).value || "letter";
  if (difficulty === "letter") {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const ch = letters[Math.floor(Math.random() * letters.length)];
    quizTargetText = ch;
    quizTargetMorse = morseCode[ch];
  } else if (difficulty === "word") {
    const words = [
      "MORSE",
      "CODE",
      "HELLO",
      "WORLD",
      "TEST",
      "RADIO",
      "SIGNAL",
      "LEARN",
      "QUIZ",
      "WARRIORZ"
    ];
    const w = words[Math.floor(Math.random() * words.length)];
    quizTargetText = w;
    quizTargetMorse = textToMorse(w);
  } else {
    const sentences = [
      "HELLO WORLD",
      "MORSE CODE QUIZ",
      "I LOVE RADIO",
      "LEARN MORSE FAST"
    ];
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    quizTargetText = s;
    quizTargetMorse = textToMorse(s);
  }

  const resultDiv = document.getElementById("quizResult");
  const input = document.getElementById("quizAnswer");
  if (resultDiv) resultDiv.textContent = "";
  if (input) {
    smoothClearInput(input);
  }
  
  // Reset progress and visualizer
  resetProgress();
  resetVisualizer();
  
  // Auto-play the new item
  setTimeout(() => {
    if (quizTargetMorse) {
      playMorseSequence(quizTargetMorse, getQuizSpeedMultiplier());
    }
  }, 100);
}

function textToMorse(text) {
  let out = "";
  for (const chRaw of text.toUpperCase()) {
    const ch = chRaw;
    if (ch === " ") {
      out += "/ ";
    } else if (morseCode[ch]) {
      out += morseCode[ch] + " ";
    }
  }
  return out.trim();
}

function normalizedString(str) {
  return (str || "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function checkQuizAnswer() {
  const answerEl = document.getElementById("quizAnswer");
  const resultDiv = document.getElementById("quizResult");
  const scoreEl = document.getElementById("quizScore");
  const roundEl = document.getElementById("quizRound");
  const streakEl = document.getElementById("quizStreak");
  if (!answerEl || !resultDiv) return;

  const user = normalizedString(answerEl.value);
  const target = normalizedString(quizTargetText);
  if (!user) return;

  quizRounds++;

  if (user === target) {
    quizCorrect++;
    quizStreak++;
    resultDiv.textContent = "Correct!";
    resultDiv.className = "result-display correct";
    resultDiv.style.display = "block";
    if (audioContext && soundEnabled) {
      playTone(800, audioContext.currentTime, 0.18);
      setTimeout(() => playTone(1000, audioContext.currentTime, 0.18), 200);
    }
  } else {
    quizStreak = 0;
    resultDiv.textContent = `Incorrect. It was "${target}"`;
    resultDiv.className = "result-display incorrect";
    resultDiv.style.display = "block";
    if (audioContext && soundEnabled) {
      playTone(300, audioContext.currentTime, 0.25);
    }
  }

  if (scoreEl) {
    const pct = Math.round((quizCorrect / quizRounds) * 100);
    scoreEl.textContent = `${isNaN(pct) ? 0 : pct}%`;
  }
  if (roundEl) {
    roundEl.textContent = String(quizRounds);
  }
  if (streakEl) {
    streakEl.textContent = String(quizStreak);
  }

  // Clear input and placeholder after answer
  if (answerEl) {
    smoothClearInput(answerEl, "");
  }

  // Clear result after animation (match CSS duration 2.2s)
  setTimeout(() => {
    if (resultDiv) {
      resultDiv.textContent = "";
      resultDiv.className = "result-display";
      resultDiv.style.display = "none";
    }
  }, 2300);

  // prepare next after delay to match fade
  setTimeout(generateNewQuizItem, 2300);
}

function setQuizPlayingState(playing) {
  const dot = document.getElementById("quizPlayingIndicator");
  const text = document.getElementById("quizStatusText");
  if (!dot || !text) return;
  dot.classList.remove("changed");
  if (playing) {
    dot.classList.add("playing");
    text.textContent = "Playing...";
  } else {
    dot.classList.remove("playing");
    text.textContent = "Ready";
  }
}

function flashQuizChangedState() {
  const dot = document.getElementById("quizPlayingIndicator");
  if (!dot) return;
  dot.classList.add("changed");
  setTimeout(() => dot.classList.remove("changed"), 600);
}

function setQuizStatusText(msg) {
  const text = document.getElementById("quizStatusText");
  if (text) text.textContent = msg;
}

// Music Player Functions
function toggleQuizPlayback() {
  if (isPlaying) {
    stopQuizPlayback();
  } else {
    if (quizTargetMorse) {
      playMorseSequence(quizTargetMorse, getQuizSpeedMultiplier());
    }
  }
}

function stopQuizPlayback() {
  isPlaying = false;
  setQuizPlayingState(false);
  stopProgressTracking();
  stopVisualizer();
  
  // Stop all audio by closing and reinitializing audio context
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    initializeAudio();
  }
}



function setQuizPlayingState(playing) {
  const playBtn = document.getElementById("quizPlayBtn");
  if (!playBtn) return;
  
  if (playing) {
    playBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    playBtn.title = "Stop";
    playBtn.classList.add("playing");
  } else {
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    playBtn.title = "Play";
    playBtn.classList.remove("playing");
  }
}

function startProgressTracking() { /* progress removed */ }

function stopProgressTracking() { /* progress removed */ }

function resetProgress() { /* progress removed */ }

function startVisualizer() {
  const bars = document.querySelectorAll(".visualizer-bars .bar");
  
  visualizerInterval = setInterval(() => {
    bars.forEach((bar, index) => {
      const height = Math.random() * 30 + 10;
      bar.style.height = `${height}px`;
      
      if (Math.random() > 0.7) {
        bar.classList.add("active");
        setTimeout(() => bar.classList.remove("active"), 200);
      }
    });
  }, 100);
}

function stopVisualizer() {
  if (visualizerInterval) {
    clearInterval(visualizerInterval);
    visualizerInterval = null;
  }
}

function resetVisualizer() {
  const bars = document.querySelectorAll(".visualizer-bars .bar");
  bars.forEach(bar => {
    bar.style.height = "10px";
    bar.classList.remove("active");
  });
}

function generateNewQuizItemWithoutAutoPlay() {
  const difficulty = (document.getElementById("quizDifficulty") || {}).value || "letter";
  if (difficulty === "letter") {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&'@)(:,.=!×%+\"?/";
    const ch = letters[Math.floor(Math.random() * letters.length)];
    quizTargetText = ch;
    quizTargetMorse = morseCode[ch];
  } else if (difficulty === "word") {
    const words = [
      "MORSE",
      "CODE",
      "HELLO",
      "WORLD",
      "TEST",
      "RADIO",
      "SIGNAL",
      "LEARN",
      "QUIZ",
      "WARRIORZ"
    ];
    const w = words[Math.floor(Math.random() * words.length)];
    quizTargetText = w;
    quizTargetMorse = textToMorse(w);
  } else {
    const sentences = [
      "HELLO WORLD",
      "MORSE CODE QUIZ",
      "I LOVE RADIO",
      "LEARN MORSE FAST"
    ];
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    quizTargetText = s;
    quizTargetMorse = textToMorse(s);
  }

  const resultDiv = document.getElementById("quizResult");
  const input = document.getElementById("quizAnswer");
  if (resultDiv) resultDiv.textContent = "";
  if (input) {
    smoothClearInput(input);
  }
  
  // Reset progress and visualizer
  resetProgress();
  resetVisualizer();
}

function scrollToAnswerSection() {
  // Removed auto-scrolling functionality
  // Users can scroll manually if needed
}

function resetQuizGame() {
  // Reset all game variables
  quizRounds = 0;
  quizCorrect = 0;
  quizStreak = 0;
  
  // Update display
  const scoreEl = document.getElementById("quizScore");
  const roundEl = document.getElementById("quizRound");
  const streakEl = document.getElementById("quizStreak");
  const resultDiv = document.getElementById("quizResult");
  const input = document.getElementById("quizAnswer");
  
  if (scoreEl) scoreEl.textContent = "0%";
  if (roundEl) roundEl.textContent = "0";
  if (streakEl) streakEl.textContent = "0";
  if (resultDiv) resultDiv.textContent = "";
  if (input) {
    smoothClearInput(input);
  }
  
  // Stop any current playback and audio context
  stopQuizPlayback();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    initializeAudio();
  }
  
  // Generate new item without auto-play
  generateNewQuizItemWithoutAutoPlay();
}

// Resume audio context on user interaction (required by browsers)
document.addEventListener(
  "click",
  () => {
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }
  },
  { once: true }
);

// Change theme
const theme_button = document.querySelector(".change-theme");
const body = document.querySelector("body");

theme_button.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
});
