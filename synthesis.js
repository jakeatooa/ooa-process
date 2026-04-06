// TF-IDF Theme Extraction, Key Quote Scoring & Career-Dimension Insight

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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function computeTFIDF(documents) {
  const docTokens = documents.map(tokenize);
  const N = docTokens.length;
  if (N === 0) return [];

  const df = {};
  docTokens.forEach((tokens) => {
    const unique = new Set(tokens);
    unique.forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    });
  });

  const allTokens = docTokens.flat();
  const tf = {};
  allTokens.forEach((t) => {
    tf[t] = (tf[t] || 0) + 1;
  });

  const tfidf = {};
  Object.keys(tf).forEach((term) => {
    const termFreq = tf[term] / allTokens.length;
    const idf = Math.log(N / (df[term] || 1)) + 1;
    tfidf[term] = termFreq * idf;
  });

  return Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term, score]) => ({ term, score }));
}

function extractThemes(responses) {
  const texts = responses.map((r) => r.response);
  const keywords = computeTFIDF(texts);

  const themes = keywords.slice(0, 5).map((kw) => {
    const relatedResponses = responses.filter((r) =>
      r.response.toLowerCase().includes(kw.term)
    );
    return {
      theme: kw.term.charAt(0).toUpperCase() + kw.term.slice(1),
      weight: kw.score,
      mentions: relatedResponses.length,
    };
  });

  return themes;
}

function scoreQuotes(responses) {
  return responses
    .map((r) => {
      const sentences = r.response
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15);

      let bestSentence = "";
      let bestScore = 0;

      sentences.forEach((sentence) => {
        const tokens = tokenize(sentence);
        const uniqueRatio = new Set(tokens).size / (tokens.length || 1);
        const lengthScore = Math.min(sentence.length / 120, 1);
        const emotionWords = tokens.filter((t) =>
          [
            "love", "fear", "dream", "hope", "struggle", "passion", "courage",
            "freedom", "growth", "change", "risk", "truth", "honest", "excited",
            "scared", "bold", "stuck", "alive", "meaningful", "purpose",
            "creative", "energy", "power", "control", "lost", "found",
          ].includes(t)
        ).length;
        const emotionScore = Math.min(emotionWords / 2, 1);

        const score = uniqueRatio * 0.3 + lengthScore * 0.3 + emotionScore * 0.4;
        if (score > bestScore) {
          bestScore = score;
          bestSentence = sentence;
        }
      });

      return {
        quote: bestSentence || r.response.slice(0, 140),
        score: bestScore,
        category: r.categoryName,
        prompt: r.prompt,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ── Career-Dimension Analysis ──

const CAREER_DIMENSIONS = {
  agency: {
    high: ["choose", "decide", "build", "create", "start", "launch", "own", "lead", "ship",
           "act", "commit", "pursue", "initiative", "drive", "design", "shape", "craft"],
    low:  ["stuck", "waiting", "uncertain", "unsure", "confused", "lost", "paralyzed",
           "hesitate", "afraid", "overwhelmed", "passive", "drift", "limbo", "stagnant"],
  },
  orientation: {
    future: ["next", "dream", "imagine", "someday", "future", "vision", "aspire", "become",
             "transform", "evolve", "reinvent", "pivot", "chapter", "ahead", "possibility", "potential"],
    present: ["now", "today", "current", "here", "moment", "immediate", "existing",
              "lately", "recently", "daily", "routine", "already", "currently"],
  },
  driver: {
    meaning: ["purpose", "passion", "fulfillment", "meaningful", "impact", "matter", "value",
              "calling", "authentic", "honest", "truth", "creative", "soul", "heart", "care", "contribution"],
    security: ["stability", "income", "salary", "safe", "secure", "steady", "reliable",
               "practical", "realistic", "comfortable", "financial", "predictable", "benefits"],
  },
};

function analyzeCareerDimensions(responses) {
  const allText = responses.map(r => r.response).join(" ").toLowerCase();
  const allTokens = tokenize(allText);
  const tokenSet = new Set(allTokens);

  const scores = {};
  for (const [dim, poles] of Object.entries(CAREER_DIMENSIONS)) {
    const poleNames = Object.keys(poles);
    const counts = {};
    for (const pole of poleNames) {
      counts[pole] = poles[pole].filter(w => tokenSet.has(w)).length;
    }
    // Which pole dominates? Store the dominant pole and its margin
    const [poleA, poleB] = poleNames;
    const margin = counts[poleA] - counts[poleB];
    scores[dim] = {
      dominant: margin >= 0 ? poleA : poleB,
      margin: Math.abs(margin),
      counts,
    };
  }
  return scores;
}

function generateCareerInsight(dimensions, themes, responses) {
  const { agency, orientation, driver } = dimensions;

  // Build descriptors based on dominant poles
  const descriptors = {
    agency: {
      high: "someone ready to act",
      low: "someone processing a feeling of being stuck",
    },
    orientation: {
      future: "eyes set on what\u2019s next",
      present: "grounded in the reality of where you are now",
    },
    driver: {
      meaning: "pulled by purpose over practicality",
      security: "navigating the tension between ambition and stability",
    },
  };

  // Determine the two strongest signals (highest margin)
  const ranked = Object.entries(dimensions)
    .sort((a, b) => b[1].margin - a[1].margin);

  const primary = ranked[0];
  const secondary = ranked[1];

  const primaryDesc = descriptors[primary[0]][primary[1].dominant];
  const secondaryDesc = descriptors[secondary[0]][secondary[1].dominant];

  // Get top 2 TF-IDF theme words for texture
  const topThemes = themes.slice(0, 2).map(t => t.theme.toLowerCase());

  // Incorporate kept/discarded category signals subtly
  const keptCategories = responses.filter(r => r.kept === true).map(r => r.categoryName);
  const discardedCategories = responses.filter(r => r.kept === false).map(r => r.categoryName);

  // Build the through-line from multiple template families
  const templates = [];

  // Template family 1: "Your reflections reveal..."
  templates.push(
    `Your reflections reveal ${primaryDesc}, with ${secondaryDesc}.`
    + (topThemes.length >= 2 ? ` The thread connecting them: ${topThemes[0]} and ${topThemes[1]}.` : "")
  );

  // Template family 2: "A pattern emerges..."
  templates.push(
    `A pattern emerges across your responses\u2014${primaryDesc}.`
    + ` Beneath that, ${secondaryDesc}.`
    + (topThemes.length >= 1 ? ` The word "${topThemes[0]}" keeps surfacing.` : "")
  );

  // Template family 3: "What stands out..."
  templates.push(
    `What stands out is ${primaryDesc}`
    + (secondaryDesc ? `, and ${secondaryDesc}` : "")
    + "."
    + (topThemes.length >= 2 ? ` Your language circles around ${topThemes.join(" and ")}\u2014pay attention to that.` : "")
  );

  // Template family 4: Category-informed (if we have kept/discarded data)
  if (keptCategories.length > 0 && discardedCategories.length > 0) {
    templates.push(
      `You held onto the questions that challenged your ${keptCategories[0].toLowerCase()} and let go of ${discardedCategories[0].toLowerCase()}\u2014${primaryDesc}, ${secondaryDesc}.`
    );
  }

  // Template family 5: Direct career framing
  templates.push(
    `In your career right now, you\u2019re ${primaryDesc}. Your responses suggest ${secondaryDesc}.`
    + (topThemes.length >= 1 ? ` "${topThemes[0]}" is the word that binds it together.` : "")
  );

  // Pick a template using a hash for variety across sessions
  const hashSeed = responses.map(r => r.response.length).reduce((a, b) => a + b, 0)
    + responses.map(r => r.categoryName).join("").length;
  return templates[hashSeed % templates.length];
}

// ── Main Synthesis ──

function synthesize(responses) {
  if (!responses || responses.length === 0) {
    return { themes: [], keyQuote: null, quotes: [], throughLine: "" };
  }

  const themes = extractThemes(responses);
  const quotes = scoreQuotes(responses);
  const keyQuote = quotes[0] || null;

  // Career-dimension analysis for the through-line
  const dimensions = analyzeCareerDimensions(responses);
  const throughLine = generateCareerInsight(dimensions, themes, responses);

  return { themes, keyQuote, quotes, throughLine };
}
