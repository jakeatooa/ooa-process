// ── Theme Extraction, Quote Scoring & Career Insight Engine ──

const STOP_WORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
  "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
  "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs",
  "themselves", "what", "which", "who", "whom", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if",
  "or", "because", "as", "until", "while", "of", "at", "by", "for", "with",
  "about", "against", "between", "through", "during", "before", "after", "above",
  "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
  "again", "further", "then", "once", "here", "there", "when", "where", "why",
  "how", "all", "both", "each", "few", "more", "most", "other", "some", "such",
  "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
  "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re",
  "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven",
  "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren",
  "won", "wouldn", "also", "would", "could", "might", "much", "really", "think",
  "know", "like", "want", "feel", "get", "got", "go", "going", "make", "thing",
  "things", "lot", "way", "even", "still", "something", "one", "don't", "i'm",
  "it's", "that's", "i've", "i'd", "didn't", "doesn't", "wasn't", "wouldn't",
  "couldn't", "shouldn't", "isn't", "aren't", "haven't", "hasn't", "won't",
  "can't", "let", "always", "never", "maybe", "right", "well", "back", "kind",
]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, "").split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function computeTFIDF(documents) {
  const docTokens = documents.map(tokenize);
  const N = docTokens.length;
  if (N === 0) return [];

  const df = {};
  docTokens.forEach(tokens => {
    new Set(tokens).forEach(t => { df[t] = (df[t] || 0) + 1; });
  });

  const allTokens = docTokens.flat();
  const tf = {};
  allTokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });

  const tfidf = {};
  Object.keys(tf).forEach(term => {
    tfidf[term] = (tf[term] / allTokens.length) * (Math.log(N / (df[term] || 1)) + 1);
  });

  return Object.entries(tfidf).sort((a, b) => b[1] - a[1]).slice(0, 15)
    .map(([term, score]) => ({ term, score }));
}

function extractThemes(responses) {
  // Weight responses by length (engagement proxy)
  const texts = responses.map(r => {
    const engagement = r.response.length > 200 ? 2 : 1;
    return Array(engagement).fill(r.response).join(" ");
  });
  const keywords = computeTFIDF(texts);
  return keywords.slice(0, 5).map(kw => ({
    theme: kw.term.charAt(0).toUpperCase() + kw.term.slice(1),
    weight: kw.score,
    mentions: responses.filter(r => r.response.toLowerCase().includes(kw.term)).length,
  }));
}

function scoreQuotes(responses) {
  return responses.map(r => {
    const sentences = r.response.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    let bestSentence = "", bestScore = 0;

    sentences.forEach(sentence => {
      const tokens = tokenize(sentence);
      const uniqueRatio = new Set(tokens).size / (tokens.length || 1);
      const lengthScore = Math.min(sentence.length / 120, 1);
      const emotionWords = tokens.filter(t =>
        ["love","fear","dream","hope","struggle","passion","courage","freedom","growth",
         "change","risk","truth","honest","excited","scared","bold","stuck","alive",
         "meaningful","purpose","creative","energy","power","control","lost","found"].includes(t)
      ).length;
      const score = uniqueRatio * 0.3 + lengthScore * 0.3 + Math.min(emotionWords / 2, 1) * 0.4;
      if (score > bestScore) { bestScore = score; bestSentence = sentence; }
    });

    return { quote: bestSentence || r.response.slice(0, 140), score: bestScore, category: r.categoryName, prompt: r.prompt };
  }).sort((a, b) => b.score - a.score);
}

// ── Career Dimension Analysis ──

const CAREER_DIMENSIONS = {
  agency: {
    high: ["choose","decide","build","create","start","launch","own","lead","ship","act","commit","pursue","initiative","drive","design","shape","craft","take","making","made"],
    low: ["stuck","waiting","uncertain","unsure","confused","lost","paralyzed","hesitate","afraid","overwhelmed","passive","drift","limbo","stagnant","trapped","spinning","frozen","avoid"],
  },
  orientation: {
    future: ["next","dream","imagine","someday","future","vision","aspire","become","transform","evolve","reinvent","pivot","chapter","ahead","possibility","potential","new","forward","toward"],
    present: ["now","today","current","here","moment","immediate","existing","lately","recently","daily","routine","already","currently","right-now","this-week","today's"],
  },
  driver: {
    meaning: ["purpose","passion","fulfillment","meaningful","impact","matter","value","calling","authentic","honest","truth","creative","soul","heart","care","contribution","legacy","deeper"],
    security: ["stability","income","salary","safe","secure","steady","reliable","practical","realistic","comfortable","financial","predictable","benefits","mortgage","debt","bills","savings"],
  },
  riskTolerance: {
    bold: ["risk","leap","bold","dare","brave","courage","jump","bet","chance","experiment","try","push","edge","stretch","uncomfortable","scary","exciting","unknown"],
    cautious: ["careful","safe","calculated","slow","steady","plan","prepare","backup","certain","guarantee","proven","tested","conservative","measured","gradual","step-by-step"],
  },
  collaboration: {
    team: ["team","collaborate","together","community","people","mentor","network","partner","collective","shared","support","connection","relationship","colleague","group"],
    solo: ["alone","independent","solo","autonomous","self","own","individual","freedom","space","quiet","focus","mine","personal","private","solitary"],
  },
  thinkingStyle: {
    creative: ["creative","imagine","design","invent","explore","experiment","play","curious","wonder","art","beauty","aesthetics","intuition","inspiration","unconventional","wild"],
    analytical: ["analyze","system","process","structure","logic","data","measure","optimize","efficient","framework","method","strategy","plan","organize","systematic","rational"],
  },
  temporalHorizon: {
    longTerm: ["years","decade","legacy","long-term","eventually","lifetime","career","trajectory","arc","building","foundation","invest","patience","someday","retirement"],
    shortTerm: ["week","month","tomorrow","soon","quick","immediate","now","today","this-year","next-month","sprint","deadline","urgent","asap","right-away"],
  },
};

function analyzeCareerDimensions(responses) {
  const allText = responses.map(r => r.response).join(" ").toLowerCase();
  const allTokens = tokenize(allText);

  const scores = {};
  for (const [dim, poles] of Object.entries(CAREER_DIMENSIONS)) {
    const poleNames = Object.keys(poles);
    const counts = {};
    for (const pole of poleNames) {
      counts[pole] = 0;
      poles[pole].forEach(keyword => {
        // Count actual occurrences, not just presence
        const regex = new RegExp("\\b" + keyword.replace(/-/g, "[\\s-]") + "\\b", "gi");
        const matches = allText.match(regex);
        if (matches) counts[pole] += matches.length;
      });
    }
    const [poleA, poleB] = poleNames;
    const margin = counts[poleA] - counts[poleB];
    scores[dim] = { dominant: margin >= 0 ? poleA : poleB, margin: Math.abs(margin), counts };
  }
  return scores;
}

function analyzeConfidence(responses) {
  const allText = responses.map(r => r.response).join(" ").toLowerCase();
  const strong = ["will", "definitely", "certain", "committed", "decided", "clear", "know exactly", "without question", "no doubt"];
  const hedge = ["might", "maybe", "perhaps", "possibly", "not sure", "i think", "hope", "wish", "wondering", "consider"];

  let strongCount = 0, hedgeCount = 0;
  strong.forEach(w => { const m = allText.match(new RegExp("\\b" + w + "\\b", "gi")); if (m) strongCount += m.length; });
  hedge.forEach(w => { const m = allText.match(new RegExp("\\b" + w + "\\b", "gi")); if (m) hedgeCount += m.length; });

  if (strongCount > hedgeCount + 1) return "decisive";
  if (hedgeCount > strongCount + 1) return "exploratory";
  return "mixed";
}

function detectTensions(dimensions) {
  const tensions = [];
  const d = dimensions;

  if (d.agency.dominant === "high" && d.riskTolerance.dominant === "cautious" && d.riskTolerance.margin > 0)
    tensions.push("ready to act but still looking for the safe path");
  if (d.orientation.dominant === "future" && d.driver.dominant === "security" && d.driver.margin > 0)
    tensions.push("imagining change but anchored by the need for stability");
  if (d.agency.dominant === "low" && d.driver.dominant === "meaning")
    tensions.push("you know what matters but something is blocking the move");
  if (d.collaboration.dominant === "team" && d.agency.dominant === "high")
    tensions.push("you want to lead, but not alone");
  if (d.thinkingStyle.dominant === "creative" && d.temporalHorizon.dominant === "shortTerm")
    tensions.push("creative instincts bumping up against deadlines");
  if (d.riskTolerance.dominant === "bold" && d.driver.dominant === "security")
    tensions.push("drawn to risk but needing a net beneath you");
  if (d.orientation.dominant === "present" && d.agency.dominant === "high")
    tensions.push("ready to move but focused on what's directly in front of you");
  if (d.thinkingStyle.dominant === "analytical" && d.driver.dominant === "meaning")
    tensions.push("searching for purpose through structure");

  return tensions;
}

// ── Through-Line Generation (Coaching Voice) ──

function generateCareerInsight(dimensions, themes, responses, confidence, tensions) {
  const ranked = Object.entries(dimensions).sort((a, b) => b[1].margin - a[1].margin);
  const primary = ranked[0];
  const secondary = ranked[1];
  const topThemes = themes.slice(0, 2).map(t => t.theme.toLowerCase());
  const tension = tensions[0] || null;

  // Coaching-voice descriptors
  const desc = {
    agency:          { high: "ready to move", low: "processing something that has you stuck" },
    orientation:     { future: "looking ahead to what\u2019s next", present: "rooted in the reality of right now" },
    driver:          { meaning: "chasing what matters, not what\u2019s easy", security: "weighing ambition against stability" },
    riskTolerance:   { bold: "willing to bet on yourself", cautious: "looking for the right moment, not just any moment" },
    collaboration:   { team: "energized by people around you", solo: "craving space to do your own thing" },
    thinkingStyle:   { creative: "drawn to the open-ended", analytical: "thinking in systems and structures" },
    temporalHorizon: { longTerm: "building toward something that takes time", shortTerm: "focused on the near horizon" },
  };

  const pDesc = desc[primary[0]]?.[primary[1].dominant] || "";
  const sDesc = desc[secondary[0]]?.[secondary[1].dominant] || "";

  // Confidence modifiers
  const confSuffix = {
    decisive: "You sound like you already know. Trust that.",
    exploratory: "You\u2019re still searching \u2014 and that\u2019s not weakness, it\u2019s honesty.",
    mixed: "Part of you knows. The other part is catching up.",
  };

  // Build template pool
  const T = [];

  // ── Core insight templates (primary + secondary dimension) ──
  T.push(() =>
    `You\u2019re not stuck \u2014 you\u2019re ${pDesc}. Your words keep circling back to ${sDesc}. ${confSuffix[confidence]}`
  );
  T.push(() =>
    `Something is shifting. You\u2019re ${pDesc}, and underneath that, ${sDesc}. ${tension ? "The tension: " + tension + ". Sit with that." : "Name what\u2019s next."}`
  );
  T.push(() =>
    `Here\u2019s what your responses say: you\u2019re ${pDesc}. ${sDesc.charAt(0).toUpperCase() + sDesc.slice(1)}. ${topThemes.length ? 'The word "' + topThemes[0] + '" keeps surfacing \u2014 pay attention to that.' : ""}`
  );
  T.push(() =>
    `You wrote like someone ${pDesc}. And the questions that hit hardest were about ${sDesc}. ${confSuffix[confidence]}`
  );

  // ── Tension-based templates ──
  if (tension) {
    T.push(() =>
      `The tension in your responses is real: ${tension}. That\u2019s not a problem to solve \u2014 it\u2019s a signal to follow.`
    );
    T.push(() =>
      `You\u2019re holding two things at once: ${pDesc}, but also ${tension}. The gap between them? That\u2019s where the next move lives.`
    );
    T.push(() =>
      `What stands out is the push and pull \u2014 ${tension}. Your reflections keep returning to this edge. Don\u2019t look away from it.`
    );
  }

  // ── Theme-infused templates ──
  if (topThemes.length >= 2) {
    T.push(() =>
      `${topThemes[0].charAt(0).toUpperCase() + topThemes[0].slice(1)} and ${topThemes[1]} \u2014 those aren\u2019t random. You\u2019re ${pDesc}, and these words are the breadcrumbs. Follow them.`
    );
    T.push(() =>
      `Your language keeps returning to ${topThemes[0]} and ${topThemes[1]}. You\u2019re ${pDesc}. ${confSuffix[confidence]}`
    );
  }

  // ── Confidence-forward templates ──
  if (confidence === "decisive") {
    T.push(() =>
      `You wrote with conviction. You\u2019re ${pDesc} and ${sDesc}. The clarity is already there \u2014 act on it before the noise comes back.`
    );
  }
  if (confidence === "exploratory") {
    T.push(() =>
      `There\u2019s a searching quality in your responses \u2014 ${pDesc}, but still figuring out the shape of it. That\u2019s okay. Clarity comes from motion, not from waiting.`
    );
  }
  if (confidence === "mixed") {
    T.push(() =>
      `Your responses are split between certainty and doubt. You\u2019re ${pDesc}, but ${tension || sDesc}. The question isn\u2019t whether you\u2019re ready \u2014 it\u2019s what you\u2019re waiting for.`
    );
  }

  // ── Category-indirect templates ──
  const keptCats = responses.filter(r => r.kept === true).map(r => r.categoryName);
  const discardedCats = responses.filter(r => r.kept === false).map(r => r.categoryName);

  if (keptCats.length > 0 && discardedCats.length > 0) {
    T.push(() =>
      `The questions about ${catToTheme(keptCats)} landed harder than the ones about ${catToTheme(discardedCats)}. You\u2019re ${pDesc}. ${confSuffix[confidence]}`
    );
    T.push(() =>
      `You held onto the questions that pushed on ${catToTheme(keptCats)} and let go of ${catToTheme(discardedCats)}. That pattern is the insight. ${tension ? "Especially this: " + tension + "." : ""}`
    );
  }

  // ── Edge / challenge templates ──
  T.push(() =>
    `Here\u2019s the uncomfortable truth in your responses: you\u2019re ${pDesc}, but ${tension || "you haven\u2019t given yourself permission to fully commit"}. What would change if you did?`
  );
  T.push(() =>
    `You\u2019re standing at an edge. ${pDesc.charAt(0).toUpperCase() + pDesc.slice(1)}, ${sDesc}. The only question left is: what are you going to do about it?`
  );

  // Select via hash for session variety
  const hash = responses.reduce((acc, r) => acc + r.response.length + r.categoryName.charCodeAt(0), 0);
  return T[hash % T.length]();
}

// Map category names to indirect thematic descriptions
function catToTheme(categories) {
  const map = {
    "Action": "taking action",
    "Direction": "where you\u2019re headed",
    "Friction": "what\u2019s holding you back",
    "Identity": "who you are",
    "Values": "what you value",
    "Wild Card": "the unexpected",
  };
  const unique = [...new Set(categories)];
  if (unique.length === 1) return map[unique[0]] || unique[0].toLowerCase();
  if (unique.length === 2) return (map[unique[0]] || unique[0]) + " and " + (map[unique[1]] || unique[1]);
  return unique.slice(0, -1).map(c => map[c] || c).join(", ") + ", and " + (map[unique[unique.length - 1]] || unique[unique.length - 1]);
}

// ── Main Synthesis ──

function synthesize(responses) {
  if (!responses || responses.length === 0) {
    return { themes: [], keyQuote: null, quotes: [], throughLine: "" };
  }

  const themes = extractThemes(responses);
  const quotes = scoreQuotes(responses);
  const keyQuote = quotes[0] || null;

  const dimensions = analyzeCareerDimensions(responses);
  const confidence = analyzeConfidence(responses);
  const tensions = detectTensions(dimensions);

  const throughLine = generateCareerInsight(dimensions, themes, responses, confidence, tensions);

  return { themes, keyQuote, quotes, throughLine };
}
