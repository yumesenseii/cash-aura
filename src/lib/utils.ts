import type { DaySession, Goal, HistoryBucket, Transaction } from "./types";

export function todayId(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatPeso(amount: number, symbol = "₱"): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  if (amount < 0) return `−${symbol}${formatted}`;
  return `${symbol}${formatted}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const today = todayId();
  if (dateStr === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === todayId(yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function greetingForNow(name?: string): string {
  const hour = new Date().getHours();
  let base: string;
  if (hour < 12) base = "Good morning! Let's keep track today.";
  else if (hour < 18) base = "Good afternoon! Let's keep track today.";
  else base = "Good evening! Let's wrap up today.";
  if (name?.trim()) {
    return base.replace("!", `, ${name.trim()}!`);
  }
  return base;
}

export function isEveningForCheck(checkTime: string): boolean {
  const [h, m] = checkTime.split(":").map(Number);
  const now = new Date();
  const checkMinutes = h * 60 + (m || 0);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= checkMinutes;
}

export function dayTotals(dayId: string, transactions: Transaction[]) {
  const txs = transactions.filter((t) => t.dayId === dayId);
  const starting =
    txs.find((t) => t.type === "starting")?.amount ??
    txs.filter((t) => t.type === "starting").reduce((s, t) => s + t.amount, 0);
  const spent = txs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const saved = txs
    .filter((t) => t.type === "savings")
    .reduce((s, t) => s + t.amount, 0);
  const safeToSpend = starting - spent - saved;
  const currentCash = starting - spent - saved;
  return { starting, spent, saved, safeToSpend, currentCash, txs };
}

export function progressPercent(starting: number, spent: number, saved: number) {
  const spendPool = Math.max(starting - saved, 0);
  if (spendPool <= 0) return starting > 0 ? 100 : 0;
  const remaining = Math.max(spendPool - spent, 0);
  return Math.round((remaining / spendPool) * 100);
}

export function progressCopy(percent: number): string {
  if (percent >= 50) return "You're doing great! Keep it up.";
  if (percent >= 25) return "Slow day — that's okay.";
  return "Careful — you're close to your limit.";
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function sortDaysDesc(days: DaySession[]): DaySession[] {
  return [...days].sort((a, b) => b.date.localeCompare(a.date));
}

export function tipForToday(tips: readonly string[]): string {
  const idx = new Date().getDate() % tips.length;
  return tips[idx];
}

export function dayMoodNote(spent: number, saved: number): string {
  if (saved > spent) return "Saved more than spent — soft blue day.";
  if (spent > saved && spent > 0) return "Spend-heavy day — review the small logs.";
  if (spent === 0 && saved === 0) return "Quiet day — still good to check in.";
  return "Balanced day — keep showing up.";
}

export function lifetimeStats(transactions: Transaction[], days: DaySession[]) {
  const spent = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const saved = transactions
    .filter((t) => t.type === "savings")
    .reduce((s, t) => s + t.amount, 0);
  const logs = transactions.filter((t) => t.type !== "starting").length;
  return {
    daysTracked: days.length,
    spent,
    saved,
    logs,
  };
}

export function goalRemaining(goal: Goal): number {
  return Math.max(goal.targetAmount - goal.currentSaved, 0);
}

export function goalContributions(
  goalId: string,
  transactions: Transaction[],
  limit = 5
) {
  return transactions
    .filter((t) => t.type === "savings" && t.goalId === goalId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
}

export function rangeTotals(
  startId: string,
  endId: string,
  transactions: Transaction[]
) {
  const txs = transactions.filter(
    (t) => t.dayId >= startId && t.dayId <= endId
  );
  const spent = txs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const saved = txs
    .filter((t) => t.type === "savings")
    .reduce((s, t) => s + t.amount, 0);
  return { spent, saved, txs };
}

export function buildInsightNarrative(input: {
  spent: number;
  saved: number;
  topCategory?: string;
  topAmount?: number;
  bestSaveDay?: string;
  bestSaveAmount?: number;
  avgDailySpend: number;
  weekSpentDelta?: number;
}): string {
  const parts: string[] = [];

  if (input.spent === 0 && input.saved === 0) {
    return "Walang logs pa this week. Track a few days and insights will light up.";
  }

  parts.push(
    `This week you spent ${formatPeso(input.spent)} and saved ${formatPeso(input.saved)}.`
  );

  if (input.saved > input.spent) {
    parts.push("You're ahead on saving — keep that Soft blue energy.");
  } else if (input.spent > input.saved && input.spent > 0) {
    parts.push("Spending led this week — watch the small everyday cash.");
  }

  if (input.topCategory && input.topAmount) {
    parts.push(
      `Most cash went to ${input.topCategory} (${formatPeso(input.topAmount)}).`
    );
  }

  if (input.bestSaveDay && input.bestSaveAmount && input.bestSaveAmount > 0) {
    parts.push(
      `Best save day: ${input.bestSaveDay} with ${formatPeso(input.bestSaveAmount)}.`
    );
  }

  if (input.avgDailySpend > 0) {
    parts.push(
      `Avg daily spend: ${formatPeso(Math.round(input.avgDailySpend))}.`
    );
  }

  if (typeof input.weekSpentDelta === "number" && input.weekSpentDelta !== 0) {
    if (input.weekSpentDelta < 0) {
      parts.push(
        `You spent ${formatPeso(Math.abs(input.weekSpentDelta))} less than last week.`
      );
    } else {
      parts.push(
        `You spent ${formatPeso(input.weekSpentDelta)} more than last week.`
      );
    }
  }

  return parts.join(" ");
}

export function mapToHistoryBucket(
  tx: Transaction
): Exclude<HistoryBucket, "All"> {
  if (tx.type === "savings") return "Savings";
  if (tx.type === "starting") return "Others";

  const c = String(tx.category || "").toLowerCase();
  if (
    ["breakfast", "lunch", "dinner", "snack", "food"].some((k) => c.includes(k))
  ) {
    return "Food";
  }
  if (
    ["transport", "jeepney", "fare", "commute"].some((k) => c.includes(k))
  ) {
    return "Transportation";
  }
  if (["school", "supplies", "project"].some((k) => c.includes(k))) {
    return "School";
  }
  if (["fun", "entertainment", "movie", "game"].some((k) => c.includes(k))) {
    return "Entertainment";
  }
  if (["bill", "bills", "utilities"].some((k) => c.includes(k))) {
    return "Bills";
  }
  if (["shop", "shopping", "mall"].some((k) => c.includes(k))) {
    return "Shopping";
  }
  if (["personal", "load", "data"].some((k) => c.includes(k))) {
    return "Personal";
  }
  if (c.includes("savings")) return "Savings";
  return "Others";
}

export function txDescription(tx: Transaction): string {
  if (tx.type === "starting") return "Starting Cash";
  if (tx.note?.trim()) return tx.note.trim();
  if (tx.category) return String(tx.category);
  return tx.type === "savings" ? "Savings" : "Expense";
}

export function txIcon(tx: Transaction): string {
  if (tx.type === "starting") return "💵";
  if (tx.type === "savings") return "💰";
  const bucket = mapToHistoryBucket(tx);
  const icons: Record<string, string> = {
    Food: "🍽️",
    Transportation: "🚌",
    School: "📚",
    Personal: "👤",
    Entertainment: "🎬",
    Bills: "🧾",
    Shopping: "🛍️",
    Savings: "💰",
    Others: "•",
  };
  return icons[bucket] || "•";
}

export function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T23:59:59`);
  const now = new Date();
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export function savingsPace(goal: Goal): {
  remaining: number;
  perDay: number | null;
  perWeek: number | null;
  daysLeft: number | null;
} {
  const remaining = goalRemaining(goal);
  const daysLeft = daysUntil(goal.targetDate);
  if (daysLeft === null || daysLeft <= 0) {
    return { remaining, perDay: null, perWeek: null, daysLeft };
  }
  const perDay = Math.ceil(remaining / daysLeft);
  const perWeek = Math.ceil(perDay * 7);
  return { remaining, perDay, perWeek, daysLeft };
}

export type Milestone = {
  id: string;
  label: string;
  done: boolean;
};

export function goalMilestones(goal: Goal): Milestone[] {
  const pct =
    goal.targetAmount > 0
      ? (goal.currentSaved / goal.targetAmount) * 100
      : 0;
  return [
    { id: "started", label: "Goal started", done: true },
    {
      id: "first1k",
      label: "First ₱1,000",
      done: goal.currentSaved >= 1000 || pct >= 100,
    },
    { id: "p25", label: "25%", done: pct >= 25 },
    { id: "p50", label: "50%", done: pct >= 50 },
    { id: "p75", label: "75%", done: pct >= 75 },
    { id: "done", label: "Completed", done: pct >= 100 },
  ];
}

export function monthStartId(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function formatLongDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

