/**
 * ============================================================
 *  CONFIG.js — THE ONLY FILE YOU NEED TO EDIT FOR CONTENT
 * ============================================================
 *  Everything in the site reads from this object: the lock-gate
 *  countdown, the PIN screen, chapter titles, colors, quotes,
 *  music hooks, and images. See /README.md for full instructions.
 * ============================================================
 */

const SITE_CONFIG = {
  // ---- Identity -------------------------------------------------
  friendName: "SANTHIYA",              // <-- CHANGE THIS to her real name
  friendNamePossessive: "(name)'s",

  // ---- Key dates --------------------------------------------------
  birthday: "10 December 2005",
  birthDateTime: "2005-12-10T00:00:00",
  // The opening screen counts down to this — her next birthday.
  nextBirthdayDateTime: "2026-12-10T00:00:00",
  turningAge: 21,
  // The countdown/lock unlocks at this exact local date+time.
  // Format: "YYYY-MM-DDTHH:MM:SS"
  unlockDateTime: "2026-12-10T00:00:00",
  // You knew OF each other for this long before you actually became close...
  yearsAcquainted: 3,
  // ...but only really started talking on this date (the actual friendship twist).
  talkingSinceDate: "28 February 2026",
  specialDate: "28 February 2026",
  // Real closeness duration — how long you've actually been talking (since talkingSinceDate)
  talkingMonths: 4,

  // ---- PIN lock (Chapter 1: The Secret Invitation) -----------------
  // 8 digits, DDMMYYYY of the special date above.
  pin: "28022026",

  // ---- Nicknames / hobbies ------------------------------------------
  nicknames: ["Makku 😂", "Thayir Saatham 🍚"],
  hobbies: ["Watching Reels", "Gossiping"],

  // ---- Chapter system (title cards shown between sections) ------------
  chapters: [
    { n: 1, id: "pin",         title: "The Secret Invitation" },
    { n: 2, id: "hero",        title: "The Fairy Kingdom" },
    { n: 3, id: "story",       title: "3 Years Of Almost, 4 Months Of Everything" },
    { n: 4, id: "memories",    title: "Magical Memories" },
    { n: 5, id: "puzzle",      title: "Unlock The Secret Puzzle" },
    { n: 6, id: "giftbox",     title: "The Birthday Gift" },
    { n: 7, id: "cake",        title: "Make A Birthday Wish" },
    { n: 8, id: "celebration", title: "The Grand Celebration" },
    { n: 9, id: "ending",      title: "Until We Meet Someday" }
  ],

  // ---- Movie trailer lines (black screen, one at a time) --------------
  trailerLines: [
    "Three Years Of Almost Being Friends...",
    "Then, One February Day...",
    "Everything Changed...",
    "Ten Months. Thousands Of Messages...",
    "Endless Laughs...",
    "One Amazing Best Friend...",
    "One Magical Surprise..."
  ],
  trailerLogoLine: "The Birthday Adventure",

  // ---- Lock-gate copy -------------------------------------------------
  lockGateMessage: "A magical surprise has been prepared especially for you...",
  lockGateSubMessage: "This gift will unlock only on your birthday.",

  // ---- Friendship timeline events (the real story — with a twist) --------
  timeline: [
    { year: "3 Years Ago", title: "We Knew Of Each Other", text: "Same circles, same crowd — but somehow, never really friends. Just familiar faces." },
    { year: "28 Feb 2026", title: "Plot Twist: We Actually Started Talking", text: "Out of nowhere, one random conversation changed everything. No one saw this coming — not even us.", scratch: true },
    { year: "The 10  Months Since", title: "Thousands Of Chats", text: "Endless texts, reels sent at 2am, and gossip sessions that never ended — somehow all packed into just a few months." },
    { year: "Somehow Already", title: "Shared Laughter", text: "Inside jokes only we understand. Makku. Thayir Saatham. It feels like years, not months." },
    { year: "Today", title: "This Very Moment", text: "Celebrating you, exactly as you are." },
    { year: "Forever", title: "The Future", text: "More memories, more laughs, more us — however far apart." }
  ],

  // ---- Fake chat memories (Chapter 4) -----------------------------------
  chatMemories: [
    { from: "me", text: "Makku 😂" },
    { from: "her", text: "😑" },
    { from: "me", text: "Thayir Saatham" },
    { from: "her", text: "😂" },
    { from: "me", text: "Erumai" },
    { from: "her", text: "sollu" },
    { from: "her", text: "😂" },
    { from: "me", text: "Erumai ah neenu😂" },
    { from: "her", text: "😂" }
  ],

  // ---- Friendship Letter (plain text, {{NAME}} gets replaced) ------------
  letterBody:
`My dearest {{NAME}},

Heyyy Eruma ❤️

Enna da birthday wish panrathunu romba yosichen...  
usual ah “Happy Birthday, stay happy, enjoy your day” nu sollitu poidalam nu nenachen 😂  
but unakku apdi oru normal wish panna mudiyala.

Because nee enakku normal ah oru friend illa.

Idha epdi explain panrathune therila honestly 😂

Namma ivlo naal pesirukom...  
evlo random ah pesirupom...  
sometimes serious, sometimes mokkaya, sometimes sanda, sometimes summa reels anupitu irupom 😂  
oru topic illama kooda pesitu irundhurupom.

Appo pesumbodhu adhellam perusa theriyadhu.

But sometimes ippo thirumbi yosicha,  
“ivlo memories ah namakku eppadi vandhuchu?” nu thonum.

Unkooda pesuradhu eppadi nu theriyuma...

romba comfortable ah irukum.

Enna pesanum nu yosikanum nu illa.  
epdi pesuna correct ah irukumah nu yosikanum nu illa.  
summa naan naana irundhu pesalam.

And I think adhu dhaan namma friendship la enakku romba pidicha vishayam.

Namma friendship la perusa edhuvum prove panna vendiya avasiyame illa.

Daily pesinalum sari, konjam gap vandhalum sari...  
thirumba pesumbodhu same old mokka than 😂

And honestly...  
en life la nee ipdi oru important person ah aayiduva nu naan expect pannave illa.

Oru normal ah start aana friendship,  
ippo ivlo memories ah maariduchu.

Especially sila dates, sila conversations, sila random moments...  
namakku mattum dhaan puriyura maari irukum.

**28.02.2026** madhiri ❤️

Sometimes nee romba irritating 😂  
sometimes semma comedy piece 😂  
sometimes enna pesra nu unakke theriyadhu pola irukum 😂

But at the same time...

nee romba genuine.

Adhu dhaan un kitta enakku romba pidikkum.

Unakku life la enna nadandhalum,  
nee happy ah irukanum nu genuinely wish panren.

Unakku pudicha things nadakanum.  
Nee nenakura goals ellam achieve pannanum.  
Stress kammiya irukanum.  
Un life la nalla people irukanum.

And nee evlo perusa grow aanaalum...

konjam indha same crazy Santhiya ah irundhuru 😂❤️

Because honestly,  

Indha birthday la naan unakku romba periya gift edhuvum kudukka mudiyama irukkalam...

but one thing mattum sollanum.

**Thank you.**

Enna tolerate pannadhuku 😂  
En mokka jokes ellam ketadhuku.  
En kooda ivlo neram pesinadhuku.  
En life la ivlo memories leave pannadhuku.

And most importantly...

**nee en life la irundhadhuku.**

Namma future epdi irukum,  
enga irupom,  
evlo busy aaguvom,  
ethana changes varum nu enakku theriyadhu.

But one thing...

years later namma old chats ah thirumbi paathu,

“dei 😂 namma appo ippadi lam pesirukome”

nu rendu perum sirikanum.

Adhu dhaan enakku venum.

Innum neraya random talks venum.  
Innum neraya sanda venum.  
Innum neraya teasing venum.  
Innum neraya memories venum.

So...

**Happy Birthday Makku ❤️🎂**

Unakku indha year romba nalla irukanum.

Nee expect panradha vida nalla things nadakanum.

Nalla happy ah iru.  
Nalla enjoy pannu.  
Nalla sirichitu iru.

And...

enna marandhuruva nu mattum nenachidaadha 😂

Happy Birthday once again, Makku.

Stay the same stupid, cute, irritating person. 😂

**Love you da... as my favourite headache. ❤️😂**

Your Best Friend`,

  // ---- Fake Broken Gift twist (Gift chapter) -----------------------------
  giftTwist: {
    shockLine: "😱🧚",
    failLines: ["Hmm, that's not it...", "Wait, let me try again...", "Okay, ONE more try..."],
    successLine: "✨🧚 There we go!",
  },

  // ---- Wish Constellation (Cake chapter) ---------------------------------
  wishConstellation: {
    fairyPrompt: "Before we continue... close your eyes for a moment and make one birthday wish.",
    constellationText: "I hope your wish comes true.",
  },

  // ---- Moon Message (Celebration chapter) --------------------------------
  moonMessage: {
    text: "Happy Birthday {{NAME}}"
  },

  // ---- Completion Whisper (shown only if every secret was found) --------
  completionWhisper: "🧚 Psst... You found every secret. Thank you for exploring every corner of our story.",

  // ---- Scratch-to-Reveal hidden messages ---------------------------------
  scratchReveals: {
    memoryBookNote: "P.S. — I still have the first screenshot of us talking. Never deleting it.",
    dearestWish: "Wishing you a year that finally slows down enough for you to enjoy it.",
    letterHiddenSentence: "Some days you were the only reason I opened my phone at all.",
    featherMessage: "Thank you for staying until the very end. This adventure wouldn't be complete without you."
  },

  // ---- Fake Ending / Fairy Returns / Final Envelope (Secret Ending) ------
  fakeEndingBeat: {
    fairyReturnsLine: "Do you really think our story ends here?",
  },
  finalEnvelope: {
    collecting: ["The Story Book...", "The Memory Book...", "The dearest Card...", "Every wish you made...", "Every secret you found..."],
    closingLine: "Take good care of these memories...",
  },

  // ---- Movie credits (Chapter 9) ----------------------------------------
  credits: [
    { role: "Directed By", name: "Your Best Friend" },
    { role: "Story", name: "3 Years Of Almost, 10 Months Of Everything" },
    { role: "Starring", name: "{{NAME}}" },
    { role: "Special Thanks", name: "Makku 😂 & Thayir Saatham 🍚" },
    { role: "", name: "See You In The Next Adventure..." }
  ],

  // ---- Final closing message (after credits, before fade to black) -------
  finalWhisper: "Some friendships don't need the same place to become special. Sometimes, a screen is enough to start a story worth remembering.",

  // ---- Spotify (replace with a real playlist/track embed URL) --------
  spotifyEmbedUrl: "https://open.spotify.com/embed/track/2A0JZsrJ1Nor5wtoOr9OOR",
  nowPlaying: { title: "Eppadi Vandhaayo", artist: "Siddhu Kumar, Vignesh Ramakrishna, Chinmayi & Anand Aravindakshan" },

  // ---- Loading screen messages ------------------------------------
  loadingMessages: [
    "Preparing a magical surprise...",
    "Collecting happy memories...",
    "Decorating the fairy kingdom...",
    "Lighting birthday candles..."
  ],

  // ---- Easter egg quotes --------------------------------------------
  secretQuote: "\"Some friendships aren't written in blood, they're written in 3am voice notes.\"",

  // ---- Day/night sky gradient stops (scroll-linked atmosphere) -----------
  // Each stop: [topColor, bottomColor]. The site interpolates between
  // these as you scroll from Chapter 1 (morning) to the finale (fireworks).
  skyStops: [
    { label: "morning",   top: "#6bb8e8", bottom: "#c9b98f" },
    { label: "afternoon", top: "#4a96c9", bottom: "#a8c2d9" },
    { label: "sunset",    top: "#5f4899", bottom: "#c98ba3" },
    { label: "night",     top: "#141a45", bottom: "#0B0E2E" },
    { label: "aurora",    top: "#1c2364", bottom: "#241a4d" },
    { label: "fireworks", top: "#05061a", bottom: "#0B0E2E" }
  ],

  // ---- Per-chapter music slots ---------------------------------------
  // Every scene points at a track key loaded in js/audio.js. Right now
  // most point at the same two placeholder tracks (swap-ready) — replace
  // any value here with a new track key once you've added more audio
  // files (see js/audio.js `files` map + README for how to add tracks).
  music: {
    hero:         "ambient",
    storybook:    "ambient",
    memorybook:   "ambient",
    timeline:     "ambient",
    chat:         "ambient",
    puzzle:       "ambient",
    gift:         "ambient",
    greeting:     "ambientAct3",
    cake:         "ambientAct3",
    celebration:  "ambientAct3",
    music:        "ambientAct3",
    credits:      "ambientAct3",
    secretending: "ambientAct3"
  },

  // ---- Theme overrides — change colors/fonts here without touching CSS ----
  // Any value you set here overrides the CSS default at runtime.
  // Leave a value blank ("") to keep the CSS default.
  theme: {
    colors: {
      "--c-gold": "",
      "--c-lavender": "",
      "--c-pink": "",
      "--c-sky": ""
    },
    fonts: {
      "--font-display": "",
      "--font-body": "",
      "--font-ui": ""
    }
  }
};

// Helper: fills {{NAME}} tokens anywhere in strings
function fillName(str) {
  return str.replaceAll("{{NAME}}", SITE_CONFIG.friendName);
}

// Helper: allow ?preview=true or localStorage flag to skip the lock-gate
// during development/testing, without touching the real unlock date.
function isPreviewMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "true") {
      localStorage.setItem("bday_preview", "1");
    }
    return localStorage.getItem("bday_preview") === "1";
  } catch (e) {
    return false;
  }
}
