export type TransactionType = "starting" | "expense" | "savings";

export type ExpenseCategory =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snack"
  | "Transport/Jeepney"
  | "School/Supplies"
  | "Load/Data"
  | "Fun"
  | "Others"
  | "Bills"
  | "Shopping"
  | "Personal"
  | "Entertainment"
  | "Food"
  | "Transportation"
  | "School"
  | "Savings"
  | "Starting";

export type HistoryBucket =
  | "All"
  | "Food"
  | "Transportation"
  | "School"
  | "Personal"
  | "Entertainment"
  | "Bills"
  | "Shopping"
  | "Savings"
  | "Others";

export type GoalCategory =
  | "School"
  | "Gadget"
  | "Travel"
  | "Emergency"
  | "Personal"
  | "Other";

export interface Transaction {
  id: string;
  dayId: string;
  type: TransactionType;
  amount: number;
  category?: ExpenseCategory | string;
  note?: string;
  timestamp: string;
  goalId?: string;
}

export interface DaySession {
  id: string;
  date: string;
  startingCash: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  createdAt: string;
  targetDate?: string;
  category?: GoalCategory;
  icon?: string;
}

export interface UserPrefs {
  name: string;
  currency: "PHP";
  currencySymbol: "₱";
  dailyCheckTime: string;
  dailyCheckEnabled: boolean;
  onboardingComplete: boolean;
  installedHintSeen: boolean;
  allowanceRhythm: "daily" | "weekly" | "irregular";
  defaultStartingCash: number;
}

export interface CashoraState {
  version: 1;
  prefs: UserPrefs;
  days: DaySession[];
  transactions: Transaction[];
  goals: Goal[];
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Food",
  "Transport/Jeepney",
  "Transportation",
  "School/Supplies",
  "School",
  "Load/Data",
  "Personal",
  "Fun",
  "Entertainment",
  "Bills",
  "Shopping",
  "Others",
];

export const HISTORY_BUCKETS: HistoryBucket[] = [
  "All",
  "Food",
  "Transportation",
  "School",
  "Personal",
  "Entertainment",
  "Bills",
  "Shopping",
  "Savings",
  "Others",
];

export const GOAL_CATEGORIES: GoalCategory[] = [
  "School",
  "Gadget",
  "Travel",
  "Emergency",
  "Personal",
  "Other",
];

export const GOAL_CATEGORY_ICONS: Record<GoalCategory, string> = {
  School: "🎓",
  Gadget: "📱",
  Travel: "✈️",
  Emergency: "🛟",
  Personal: "✨",
  Other: "🎯",
};

export const DEFAULT_PREFS: UserPrefs = {
  name: "",
  currency: "PHP",
  currencySymbol: "₱",
  dailyCheckTime: "20:00",
  dailyCheckEnabled: true,
  onboardingComplete: false,
  installedHintSeen: false,
  allowanceRhythm: "daily",
  defaultStartingCash: 500,
};

export function createEmptyState(): CashoraState {
  return {
    version: 1,
    prefs: { ...DEFAULT_PREFS },
    days: [],
    transactions: [],
    goals: [],
  };
}

export type CreateGoalInput = {
  name: string;
  targetAmount: number;
  currentSaved?: number;
  targetDate?: string;
  category?: GoalCategory;
  icon?: string;
};

export type UpdateTransactionInput = {
  amount?: number;
  category?: string;
  note?: string;
  timestamp?: string;
  goalId?: string | null;
};
