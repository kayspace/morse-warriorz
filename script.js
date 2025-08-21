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
let isPlaying = false;
let soundEnabled = true;

// Practice game variables
let currentQuestion = "";
let currentAnswer = "";
let score = 0;
let totalQuestions = 0;

const currentSection = "converter";

document.addEventListener("DOMContentLoaded", () => {
  showLoadingAnimation();
});

function showLoadingAnimation() {
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingCounter = document.getElementById("loadingCounter");
  const mainContent = document.getElementById("mainContent");

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
      }, 500);
    }
    loadingCounter.textContent = counter;
  }, 100);
}

function initializeApp() {
  initializeAudio();
  setupEventListeners();
  generateMorseReference();
  generateCheatsheet();
  generateNewQuestion();
  setupScrollNavigation();
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

function playMorseSequence(morse) {
  if (isPlaying) return;

  isPlaying = true;
  let time = audioContext.currentTime;

  for (const char of morse) {
    if (char === ".") {
      playTone(600, time, 0.1);
      time += 0.15;
    } else if (char === "-") {
      playTone(600, time, 0.3);
      time += 0.35;
    } else if (char === " ") {
      time += 0.2;
    } else if (char === "/") {
      time += 0.5;
    }
  }

  setTimeout(() => {
    isPlaying = false;
  }, (time - audioContext.currentTime) * 1000);
}

function playTone(frequency, startTime, duration) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + duration - 0.01);
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
    resultDiv.textContent = `Incorrect. The answer was "${currentAnswer}"`;
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
