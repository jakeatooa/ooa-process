const CATEGORIES = {
  action: {
    name: "Action",
    backImage: "assets/OOA_CG_Action__back.png",
    cards: [
      { prompt: "Write three words to describe the next chapter of your career. Keep it punchy.", front: "assets/OOA_CG_Action__front.png", back: "assets/OOA_CG_Action__back.png" },
      { prompt: "Name one person you could reach out to this week who might shift your trajectory.", front: "assets/OOA_CG_Action_2_front.png", back: "assets/OOA_CG_Action_2_back.png" },
      { prompt: "What's a small experiment you can run this month to test a career idea?", front: "assets/OOA_CG_Action_3_front.png", back: "assets/OOA_CG_Action_3_back.png" },
      { prompt: "Which skill could you double-down on that would open the most doors?", front: "assets/OOA_CG_Action_4_front.png", back: "assets/OOA_CG_Action_4_back.png" },
      { prompt: "Name one boundary you need to set in your work life right now?", front: "assets/OOA_CG_Action_5_front.png", back: "assets/OOA_CG_Action_5_back.png" },
      { prompt: "What's your next 90-day goal\u2014and how can you spend the next 15-minutes on an action towards it?", front: "assets/OOA_CG_Action_6_front.png", back: "assets/OOA_CG_Action_6_back.png" },
      { prompt: "Where are you currently over-engineering a decision?", front: "assets/OOA_CG_Action_7_front.png", back: "assets/OOA_CG_Action_7_back.png" },
      { prompt: "Name something you could stop doing at work that would improve your life immediately?", front: "assets/OOA_CG_Action_8_front.png", back: "assets/OOA_CG_Action_8_back.png" },
      { prompt: "If you had to pitch yourself today for your dream job, what\u2019s your headline?", front: "assets/OOA_CG_Action_9_front.png", back: "assets/OOA_CG_Action_9_back.png" },
      { prompt: "Name one thing you wish to no longer tolerate from your job.", front: "assets/OOA_CG_Action_10_front.png", back: "assets/OOA_CG_Action_10_back.png" },
    ],
  },
  direction: {
    name: "Direction",
    backImage: "assets/OOA_CG_Direction__back.png",
    cards: [
      { prompt: "Imagine one year from now, and you\u2019ve changed roles. How do you describe your work?", front: "assets/OOA_CG_Direction__front.png", back: "assets/OOA_CG_Direction__back.png" },
      { prompt: "What\u2019s a skill you want to master purely because it excites you\u2014not because it\u2019s practical?", front: "assets/OOA_CG_Direction_2_front.png", back: "assets/OOA_CG_Direction_2_back.png" },
      { prompt: "If your career were a building, what phase of construction are you in? (Concept, Schematic, DD, CD, CA, Punchlist)", front: "assets/OOA_CG_Direction_3_front.png", back: "assets/OOA_CG_Direction_3_back.png" },
      { prompt: "What kind of problems do you wish people paid you to solve?", front: "assets/OOA_CG_Direction_4_front.png", back: "assets/OOA_CG_Direction_4_back.png" },
      { prompt: "Describe a work environment where your best traits become inevitable.", front: "assets/OOA_CG_Direction_5_front.png", back: "assets/OOA_CG_Direction_5_back.png" },
      { prompt: "What\u2019s one door you\u2019d love to open\u2014even if you aren\u2019t ready to walk through it yet?", front: "assets/OOA_CG_Direction_6_front.png", back: "assets/OOA_CG_Direction_6_back.png" },
      { prompt: "What would your dream manager be like?", front: "assets/OOA_CG_Direction_7_front.png", back: "assets/OOA_CG_Direction_7_back.png" },
      { prompt: "Where in your life do you want to experience more scale? More depth?", front: "assets/OOA_CG_Direction_8_front.png", back: "assets/OOA_CG_Direction_8_back.png" },
      { prompt: "Name a role that scares you in a good way. Why?", front: "assets/OOA_CG_Direction_9_front.png", back: "assets/OOA_CG_Direction_9_back.png" },
      { prompt: "What are you building toward that would make next year unmistakably successful?", front: "assets/OOA_CG_Direction_10_front.png", back: "assets/OOA_CG_Direction_10_back.png" },
    ],
  },
  friction: {
    name: "Friction",
    backImage: "assets/OOA_CG_Friction__back.png",
    cards: [
      { prompt: "If failure wasn\u2019t a fear, what would you try tomorrow?", front: "assets/OOA_CG_Friction__front.png", back: "assets/OOA_CG_Friction__back.png" },
      { prompt: "What\u2019s a fear (even a small one) that has had the biggest impact on your decisions?", front: "assets/OOA_CG_Friction_2_front.png", back: "assets/OOA_CG_Friction_2_back.png" },
      { prompt: 'What\u2019s a belief about \u201cwhat an architect should do\u201d that still limits you?', front: "assets/OOA_CG_Friction_3_front.png", back: "assets/OOA_CG_Friction_3_back.png" },
      { prompt: "What\u2019s one risk that you regret not taking?", front: "assets/OOA_CG_Friction_4_front.png", back: "assets/OOA_CG_Friction_4_back.png" },
      { prompt: "Whose approval are you still subconsciously chasing?", front: "assets/OOA_CG_Friction_5_front.png", back: "assets/OOA_CG_Friction_5_back.png" },
      { prompt: "If you trusted that everything would work out, what choice would become obvious?", front: "assets/OOA_CG_Friction_6_front.png", back: "assets/OOA_CG_Friction_6_back.png" },
      { prompt: "What\u2019s the real cost of staying exactly where you are?", front: "assets/OOA_CG_Friction_7_front.png", back: "assets/OOA_CG_Friction_7_back.png" },
      { prompt: "What does burnout protect you from feeling or confronting?", front: "assets/OOA_CG_Friction_8_front.png", back: "assets/OOA_CG_Friction_8_back.png" },
      { prompt: "What\u2019s something you\u2019re good at but hate being known for?", front: "assets/OOA_CG_Friction_9_front.png", back: "assets/OOA_CG_Friction_9_back.png" },
      { prompt: "What fear would disappear if you had twice your current income?", front: "assets/OOA_CG_Friction_10_front.png", back: "assets/OOA_CG_Friction_10_back.png" },
    ],
  },
  identity: {
    name: "Identity",
    backImage: "assets/OOA_CG_Identity__back.png",
    cards: [
      { prompt: "What\u2019s a part of your identity you\u2019ve outgrown... but still perform out of habit?", front: "assets/OOA_CG_Identity__front.png", back: "assets/OOA_CG_Identity__back.png" },
      { prompt: "Who were you before architecture school shaped your thinking? What remains of that person?", front: "assets/OOA_CG_Identity_2_front.png", back: "assets/OOA_CG_Identity_2_back.png" },
      { prompt: "If someone shadowed you for a week, what do you think would surprise them about how you work?", front: "assets/OOA_CG_Identity_3_front.png", back: "assets/OOA_CG_Identity_3_back.png" },
      { prompt: "Which project in your life (not just work) best represents you? Why?", front: "assets/OOA_CG_Identity_4_front.png", back: "assets/OOA_CG_Identity_4_back.png" },
      { prompt: "What\u2019s the story you instinctively tell about how you ended up here\u2014and what version haven\u2019t you told yet?", front: "assets/OOA_CG_Identity_5_front.png", back: "assets/OOA_CG_Identity_5_back.png" },
      { prompt: "What do people consistently ask you for help with, even outside your job? What does that say about you?", front: "assets/OOA_CG_Identity_6_front.png", back: "assets/OOA_CG_Identity_6_back.png" },
      { prompt: "What part of your personality has architecture rewarded? Which part has it punished?", front: "assets/OOA_CG_Identity_7_front.png", back: "assets/OOA_CG_Identity_7_back.png" },
      { prompt: "What do you admire most in others that you secretly want to embody yourself?", front: "assets/OOA_CG_Identity_8_front.png", back: "assets/OOA_CG_Identity_8_back.png" },
      { prompt: 'When do you feel \u201cmost like yourself\u201d at work?', front: "assets/OOA_CG_Identity_9_front.png", back: "assets/OOA_CG_Identity_9_back.png" },
      { prompt: "What would your 18-year-old self think of your career today?", front: "assets/OOA_CG_Identity_10_front.png", back: "assets/OOA_CG_Identity_10_back.png" },
    ],
  },
  values: {
    name: "Values",
    backImage: "assets/OOA_CG_Values__back.png",
    cards: [
      { prompt: "Name the three values you protect instinctively\u2014even when no one\u2019s watching.", front: "assets/OOA_CG_Values__front.png", back: "assets/OOA_CG_Values__back.png" },
      { prompt: "Which matters more right now: stability or momentum? Why?", front: "assets/OOA_CG_Values_2_front.png", back: "assets/OOA_CG_Values_2_back.png" },
      { prompt: "If you had to work at 70% of your current effort level, where would you place your energy?", front: "assets/OOA_CG_Values_3_front.png", back: "assets/OOA_CG_Values_3_back.png" },
      { prompt: "What trade-offs are you willing to make for a better career? What trade-offs are absolutely off-limits?", front: "assets/OOA_CG_Values_4_front.png", back: "assets/OOA_CG_Values_4_back.png" },
      { prompt: "Which of your values feels most underutilized in your current role?", front: "assets/OOA_CG_Values_5_front.png", back: "assets/OOA_CG_Values_5_back.png" },
      { prompt: "What value do you pretend to have\u2014but don\u2019t actually care about?", front: "assets/OOA_CG_Values_6_front.png", back: "assets/OOA_CG_Values_6_back.png" },
      { prompt: 'What does \u201ca good day\u201d look like for you, and how rare is it?', front: "assets/OOA_CG_Values_7_front.png", back: "assets/OOA_CG_Values_7_back.png" },
      { prompt: "Rank these for the next chapter: Learning, Earning, Visibility, Flexibility, Challenge", front: "assets/OOA_CG_Values_8_front.png", back: "assets/OOA_CG_Values_8_back.png", widget: "rank" },
      { prompt: "What\u2019s one thing you would never want to compromise, no matter the job?", front: "assets/OOA_CG_Values_9_front.png", back: "assets/OOA_CG_Values_9_back.png" },
      { prompt: "Where in your life do you feel rich\u2014even if it\u2019s not financial?", front: "assets/OOA_CG_Values_10_front.png", back: "assets/OOA_CG_Values_10_back.png" },
    ],
  },
  wildcard: {
    name: "Wild Card",
    backImage: "assets/OOA_CG_Wildcard__back.png",
    cards: [
      { prompt: "Plot your work life on these axes: Competence vs Confidence. Where are you? Why there?", front: "assets/OOA_CG_Wildcard__front.png", back: "assets/OOA_CG_Wildcard__back.png", widget: "quadrant" },
      { prompt: '\u201cThis job is holding me back because...\u201d now rewrite it as \u201cI am holding myself back because...\u201d What changes?', front: "assets/OOA_CG_Wildcard_2_front.png", back: "assets/OOA_CG_Wildcard_2_back.png" },
      { prompt: "Rewrite your current job description into one you\u2019d actually be excited about.", front: "assets/OOA_CG_Wildcard_3_front.png", back: "assets/OOA_CG_Wildcard_3_back.png" },
      { prompt: 'Define your \u201cDesign Constraints\u201d for life: 3 rules that keep you aligned.', front: "assets/OOA_CG_Wildcard_4_front.png", back: "assets/OOA_CG_Wildcard_4_back.png" },
      { prompt: "Pull any other card\u2014answer it as your future self.", front: "assets/OOA_CG_Wildcard_6_front.png", back: "assets/OOA_CG_Wildcard_6_back.png" },
      { prompt: "Name a dream completely unrelated to your training. Why does it matter?", front: "assets/OOA_CG_Wildcard_8_front.png", back: "assets/OOA_CG_Wildcard_8_back.png" },
      { prompt: "Write the resignation letter you\u2019ll never send. What truth is hiding in it?", front: "assets/OOA_CG_Wildcard_9_front.png", back: "assets/OOA_CG_Wildcard_9_back.png" },
      { prompt: "What is the working title for your next chapter?", front: "assets/OOA_CG_Wildcard_10_front.png", back: "assets/OOA_CG_Wildcard_10_back.png" },
    ],
  },
};

function getRandomCard(categoryKey) {
  const cat = CATEGORIES[categoryKey];
  const idx = Math.floor(Math.random() * cat.cards.length);
  return { category: categoryKey, categoryName: cat.name, cardIndex: idx, ...cat.cards[idx] };
}

function getRandomCategoryKey() {
  const keys = Object.keys(CATEGORIES);
  return keys[Math.floor(Math.random() * keys.length)];
}

// Fisher-Yates shuffle — returns all 6 category keys in random order
function getShuffledCategoryKeys() {
  const keys = Object.keys(CATEGORIES);
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

// Smart card selection — prefers cards not drawn in recent sessions
function getSmartRandomCard(categoryKey) {
  const cat = CATEGORIES[categoryKey];
  const totalCards = cat.cards.length;

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("card_draw_history") || "[]");
  } catch (e) {
    history = [];
  }

  // Which card indices in this category were drawn recently?
  const recentlyDrawn = new Set(
    history.filter(h => h.category === categoryKey).map(h => h.cardIndex)
  );

  // Prefer undrawn cards; fall back to full pool if all seen
  const undrawn = [];
  for (let i = 0; i < totalCards; i++) {
    if (!recentlyDrawn.has(i)) undrawn.push(i);
  }
  const pool = undrawn.length > 0 ? undrawn : Array.from({ length: totalCards }, (_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];

  // Record this draw (keep last 60 = ~10 full sessions)
  history.push({ category: categoryKey, cardIndex: idx, timestamp: Date.now() });
  if (history.length > 60) history = history.slice(-60);
  try {
    localStorage.setItem("card_draw_history", JSON.stringify(history));
  } catch (e) { /* non-fatal */ }

  return { category: categoryKey, categoryName: cat.name, cardIndex: idx, ...cat.cards[idx] };
}
