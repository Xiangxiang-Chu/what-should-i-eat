const questions = [
  {
    eyebrow: "Question 1",
    title: "How hungry are you?",
    subtitle: "No overthinking. Pick the closest one.",
    key: "hunger",
    options: [
      { value: "little", icon: "🍪", title: "Just a little", note: "A snack might do." },
      { value: "normal", icon: "🍽️", title: "Pretty hungry", note: "I need a real meal." },
      { value: "starving", icon: "🔥", title: "I'm starving", note: "Feed me immediately." }
    ]
  },
  {
    eyebrow: "Question 2",
    title: "What sounds good?",
    subtitle: "Choose the feeling, not the food.",
    key: "mood",
    options: [
      { value: "warm", icon: "🥣", title: "Something warm", note: "Cozy and comforting." },
      { value: "fresh", icon: "🥗", title: "Something fresh", note: "Light and refreshing." },
      { value: "comfort", icon: "🛋️", title: "Something comforting", note: "Familiar and satisfying." },
      { value: "exciting", icon: "🌶️", title: "Something exciting", note: "Give me some flavor." },
      { value: "indulgent", icon: "🍰", title: "Something indulgent", note: "I deserve a treat." }
    ]
  },
  {
    eyebrow: "Question 3",
    title: "How much effort can you handle?",
    subtitle: "Be honest. We won't judge.",
    key: "effort",
    options: [
      { value: "zero", icon: "🛋️", title: "Zero effort", note: "Please feed me." },
      { value: "little", icon: "😌", title: "A little effort", note: "I can do something simple." },
      { value: "cook", icon: "👩‍🍳", title: "I can cook", note: "Look at me being productive." }
    ]
  }
];

const foods = [
  { name: "Ramen", emoji: "🍜", description: "Warm, comforting, and absolutely no cooking required.", tags: ["warm", "comforting", "cozy"], rules: { mood: ["warm","comfort"], effort: ["zero","little"], hunger: ["normal","starving"] } },
  { name: "Pizza", emoji: "🍕", description: "Easy, satisfying, and reliably good when you don't want to think.", tags: ["easy", "comforting", "treat"], rules: { mood: ["comfort","indulgent"], effort: ["zero","little"], hunger: ["normal","starving"] } },
  { name: "Sushi", emoji: "🍣", description: "Fresh, a little special, and perfect for a 'I deserve nice things' mood.", tags: ["fresh", "special", "treat"], rules: { mood: ["fresh","indulgent"], effort: ["zero","little"], hunger: ["little","normal"] } },
  { name: "Burger", emoji: "🍔", description: "Crispy, juicy, satisfying. Sometimes you just need a burger.", tags: ["crispy", "filling", "fun"], rules: { mood: ["comfort","exciting","indulgent"], effort: ["zero","little"], hunger: ["normal","starving"] } },
  { name: "Tacos", emoji: "🌮", description: "A little exciting, a little messy, and definitely not boring.", tags: ["fun", "flavorful", "exciting"], rules: { mood: ["exciting"], effort: ["zero","little","cook"], hunger: ["normal","starving"] } },
  { name: "Curry Rice", emoji: "🍛", description: "Warm, hearty, and wonderfully low-stress.", tags: ["warm", "hearty", "cozy"], rules: { mood: ["warm","comfort"], effort: ["zero","little","cook"], hunger: ["normal","starving"] } },
  { name: "Dumplings", emoji: "🥟", description: "Small, cozy, and dangerously easy to say yes to.", tags: ["cozy", "easy", "familiar"], rules: { mood: ["warm","comfort"], effort: ["zero","little","cook"], hunger: ["little","normal","starving"] } },
  { name: "Pasta", emoji: "🍝", description: "A warm bowl of carbs for when you want comfort and a tiny bit of effort.", tags: ["warm", "comforting", "easy"], rules: { mood: ["warm","comfort"], effort: ["little","cook"], hunger: ["normal","starving"] } },
  { name: "Poke Bowl", emoji: "🥗", description: "Fresh, colorful, and light without feeling like you're eating leaves.", tags: ["fresh", "light", "colorful"], rules: { mood: ["fresh"], effort: ["zero","little"], hunger: ["little","normal"] } },
  { name: "Fried Rice", emoji: "🍚", description: "Cheap, filling, and exactly what you need when hunger wins.", tags: ["cheap", "filling", "easy"], rules: { mood: ["comfort"], effort: ["little","cook"], hunger: ["normal","starving"] } }
];

let currentStep = 0;
let answers = {};

const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderQuestion() {
  const q = questions[currentStep];
  $("questionEyebrow").textContent = q.eyebrow;
  $("questionTitle").textContent = q.title;
  $("questionSubtitle").textContent = q.subtitle;
  $("stepText").textContent = `${currentStep + 1} / ${questions.length}`;
  $("progressBar").style.width = `${((currentStep + 1) / questions.length) * 100}%`;
  $("backBtn").style.visibility = currentStep === 0 ? "hidden" : "visible";

  const container = $("options");
  container.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerHTML = `
      <span class="option-icon">${opt.icon}</span>
      <span class="option-text">
        <strong>${opt.title}</strong>
        <small>${opt.note}</small>
      </span>`;
    btn.addEventListener("click", () => choose(opt.value));
    container.appendChild(btn);
  });
}

function choose(value) {
  answers[questions[currentStep].key] = value;

  if (currentStep < questions.length - 1) {
    currentStep++;
    renderQuestion();
  } else {
    showResult();
  }
}

function scoreFood(food) {
  let score = 0;
  Object.entries(answers).forEach(([key, value]) => {
    const matches = food.rules[key] || [];
    if (matches.includes(value)) score += 3;
  });
  score += Math.random() * 1.2;
  return score;
}

function getRecommendation() {
  const scored = foods.map(food => ({ food, score: scoreFood(food) }))
    .sort((a, b) => b.score - a.score);

  // Pick among the strongest few so "Try again" can feel different.
  const top = scored.slice(0, Math.min(4, scored.length));
  return top[Math.floor(Math.random() * top.length)].food;
}

function showResult() {
  const food = getRecommendation();
  $("resultEmoji").textContent = food.emoji;
  $("resultName").textContent = food.name;
  $("resultDescription").textContent = food.description;
  $("resultTags").innerHTML = food.tags.map(t => `<span class="tag">${t}</span>`).join("");
  $("savedMessage").textContent = "";
  showScreen("screen-result");
}

function start() {
  currentStep = 0;
  answers = {};
  renderQuestion();
  showScreen("screen-question");
}

$("startBtn").addEventListener("click", start);
$("againBtn").addEventListener("click", start);
$("homeBtn").addEventListener("click", () => showScreen("screen-home"));

$("backBtn").addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    renderQuestion();
  }
});

$("keepBtn").addEventListener("click", () => {
  $("savedMessage").textContent = "Perfect. Decision made. Now go eat. 🍜";
});
