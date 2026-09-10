export const PRODUCT = {
  name: "Cashora",
  tagline: "Your everyday cash, made visible.",
  sticky: "Not a wallet. Not a bank. Your cash companion.",
  stickyAlt: "Small steps. Bigger goals.",
  empathyTagalog: "Wait, saan napunta yung ₱500?",
  about:
    "Cashora makes physical cash easier to understand and control. Track what you spend, what you save, and what's safe to spend today.",
  privacy: "Your cash log stays on this iPhone. No account required.",
  disclaimer: "Cashora is not a bank, wallet, or financial institution.",
  safariNote: "Works best in Safari",
} as const;

export const COPY = {
  greetings: {
    morning: "Good morning! Let's keep track today.",
    afternoon: "Good afternoon! Let's keep track today.",
    evening: "Good evening! Let's wrap up today.",
  },
  safeToSpend: "Safe to Spend Today",
  safeToSpendHelper: "What's left for spending after expenses and savings.",
  startingCash: "Starting Cash",
  spent: "Spent",
  saved: "Saved",
  progressLabel: "Today's Progress",
  progressGood: "You're doing great! Keep it up.",
  progressNeutral: "Slow day — that's okay.",
  progressCaution: "Careful — you're close to your limit.",
  addExpense: "+ Add Expense",
  addSavings: "+ Add Savings",
  timelineTitle: "Today's Cash Timeline",
  currentCash: "Current cash",
  startingEvent: "Starting cash",
  emptyHomeTitle: "No cash logged yet",
  emptyHomeBody: "Add your starting cash to begin today's timeline.",
  setStartingCash: "Set starting cash",
  savingsFirstTitle: "Want to save a little first?",
  savingsFirstBody: "Set aside money early — future you will thank you.",
  dailyCheckTitle: "Daily Cash Check",
  dailyCheckBody: "Did you log everything today? Quick check before you forget.",
  dailyCheckDone: "I'm done",
  dailyCheckAdd: "Add missing expense",
  dailyCheckLater: "Remind me later",
  historyEmpty: "Walang history pa. Track today and your days will stack here.",
  historyEmptyHint: "Each day shows starting cash, spends, savings, and ending cash.",
  goalsEmptyTitle: "Small steps. Bigger goals.",
  goalsEmptyBody: "Pick a template or create your own — then save a little first.",
  createGoal: "Create a goal",
  insightsIntro: "Simple insights — no complicated charts required.",
  landingHeadline: "Your everyday cash, made visible.",
  landingBody:
    "Track baon and real cash. See what you spent, what you saved, and what's safe to spend today.",
  openApp: "Open Cashora",
  installTitle: "Install on iPhone",
  installSteps: [
    "Open this page in Safari",
    "Tap the Share button",
    "Tap Add to Home Screen",
    "Tap Add",
  ],
  homeTip:
    "Tip: Log jeepney and snacks as they happen — small spends disappear fastest.",
  todayGlance: "Today at a glance",
  activeGoal: "Active goal",
  noActiveGoal: "No goal yet — set one and watch it grow.",
  viewDay: "View timeline",
  dayDetailTitle: "Day timeline",
  contributions: "Recent contributions",
  remaining: "left to go",
  suggestedGoals: "Suggested goals",
  lifetime: "Lifetime on this device",
  faqTitle: "How Cashora works",
} as const;

export const HOME_TIPS = [
  "Tip: Log jeepney and snacks as they happen — small spends disappear fastest.",
  "Tip: Save a little right after you set starting cash. Savings First works.",
  "Tip: Safe to Spend already subtracts savings — that cash is set aside.",
  "Tip: End-of-day Cash Check catches forgotten loads and snacks.",
  "Tip: Small steps. Bigger goals. Even ₱20 counts.",
] as const;

export const GOAL_TEMPLATES = [
  { name: "Emergency fund", targetAmount: 1000, blurb: "Buffer for surprise days" },
  { name: "New earphones", targetAmount: 2500, blurb: "Treat yourself, slowly" },
  { name: "Weekly fare buffer", targetAmount: 500, blurb: "Jeepney & commute ready" },
  { name: "Birthday gift", targetAmount: 800, blurb: "Be ready for someone special" },
  { name: "School supplies", targetAmount: 1500, blurb: "Printouts, paper, projects" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "What is Safe to Spend?",
    a: "Starting cash minus what you spent and what you saved. Savings are set aside, so they’re not for spending.",
  },
  {
    q: "Is Cashora a wallet or bank?",
    a: "No. It’s a cash companion for physical money — baon, allowance, tips. No bank account needed.",
  },
  {
    q: "Where is my data stored?",
    a: "On this device only. Your cash log stays on this iPhone unless you clear it.",
  },
  {
    q: "What is Savings First?",
    a: "Set aside savings as soon as cash arrives — before small spends eat it.",
  },
  {
    q: "What is Daily Cash Check?",
    a: "An in-app evening reminder to log anything you forgot. No iOS web push required.",
  },
] as const;

export const NAV = [
  { href: "/app", label: "Home", id: "home" },
  { href: "/app/history", label: "History", id: "history" },
  { href: "/app/goals", label: "Goals", id: "goals" },
  { href: "/app/insights", label: "Insights", id: "insights" },
  { href: "/app/profile", label: "Profile", id: "profile" },
] as const;
