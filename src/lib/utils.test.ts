import { describe, expect, it, vi, afterEach } from "vitest";
import type { Goal, Transaction } from "@/lib/types";
import {
  dayTotals,
  formatPeso,
  goalMilestones,
  goalRemaining,
  mapToHistoryBucket,
  savingsPace,
  txDescription,
} from "@/lib/utils";

function tx(
  partial: Partial<Transaction> &
    Pick<Transaction, "id" | "dayId" | "type" | "amount">
): Transaction {
  return {
    timestamp: "2026-09-10T08:00:00.000Z",
    ...partial,
  };
}

describe("formatPeso", () => {
  it("formats positive amounts with peso sign", () => {
    expect(formatPeso(500)).toBe("₱500");
    expect(formatPeso(1250)).toBe("₱1,250");
  });

  it("formats negative amounts with minus sign", () => {
    expect(formatPeso(-75)).toBe("−₱75");
  });

  it("formats zero", () => {
    expect(formatPeso(0)).toBe("₱0");
  });
});

describe("dayTotals / Safe to Spend (TC03)", () => {
  const dayId = "2026-09-10";

  it("computes Safe to Spend as Starting − Spent − Saved", () => {
    const transactions: Transaction[] = [
      tx({
        id: "1",
        dayId,
        type: "starting",
        amount: 500,
        category: "Starting",
      }),
      tx({
        id: "2",
        dayId,
        type: "savings",
        amount: 100,
        category: "Savings",
      }),
      tx({
        id: "3",
        dayId,
        type: "expense",
        amount: 50,
        category: "Snack",
      }),
    ];

    const totals = dayTotals(dayId, transactions);
    expect(totals.starting).toBe(500);
    expect(totals.spent).toBe(50);
    expect(totals.saved).toBe(100);
    expect(totals.safeToSpend).toBe(350);
    expect(totals.currentCash).toBe(350);
  });

  it("ignores transactions from other days", () => {
    const transactions: Transaction[] = [
      tx({ id: "1", dayId, type: "starting", amount: 400 }),
      tx({
        id: "2",
        dayId: "2026-09-09",
        type: "expense",
        amount: 999,
        category: "Food",
      }),
    ];
    expect(dayTotals(dayId, transactions).safeToSpend).toBe(400);
  });
});

describe("mapToHistoryBucket", () => {
  it("maps savings and starting types", () => {
    expect(
      mapToHistoryBucket(tx({ id: "a", dayId: "d", type: "savings", amount: 10 }))
    ).toBe("Savings");
    expect(
      mapToHistoryBucket(
        tx({ id: "b", dayId: "d", type: "starting", amount: 10 })
      )
    ).toBe("Others");
  });

  it("maps expense categories to buckets", () => {
    expect(
      mapToHistoryBucket(
        tx({
          id: "1",
          dayId: "d",
          type: "expense",
          amount: 20,
          category: "Breakfast",
        })
      )
    ).toBe("Food");
    expect(
      mapToHistoryBucket(
        tx({
          id: "2",
          dayId: "d",
          type: "expense",
          amount: 20,
          category: "Transport/Jeepney",
        })
      )
    ).toBe("Transportation");
    expect(
      mapToHistoryBucket(
        tx({
          id: "3",
          dayId: "d",
          type: "expense",
          amount: 20,
          category: "School/Supplies",
        })
      )
    ).toBe("School");
    expect(
      mapToHistoryBucket(
        tx({
          id: "4",
          dayId: "d",
          type: "expense",
          amount: 20,
          category: "Fun",
        })
      )
    ).toBe("Entertainment");
    expect(
      mapToHistoryBucket(
        tx({
          id: "5",
          dayId: "d",
          type: "expense",
          amount: 20,
          category: "Others",
        })
      )
    ).toBe("Others");
  });
});

describe("txDescription", () => {
  it("prefers note, then category, with type fallbacks", () => {
    expect(
      txDescription(
        tx({
          id: "1",
          dayId: "d",
          type: "starting",
          amount: 500,
        })
      )
    ).toBe("Starting Cash");

    expect(
      txDescription(
        tx({
          id: "2",
          dayId: "d",
          type: "expense",
          amount: 50,
          note: "Breakfast at canteen",
          category: "Food",
        })
      )
    ).toBe("Breakfast at canteen");

    expect(
      txDescription(
        tx({
          id: "3",
          dayId: "d",
          type: "expense",
          amount: 20,
          category: "Jeepney",
        })
      )
    ).toBe("Jeepney");

    expect(
      txDescription(
        tx({ id: "4", dayId: "d", type: "savings", amount: 100 })
      )
    ).toBe("Savings");
  });
});

describe("goalRemaining", () => {
  it("returns remaining amount, never below zero", () => {
    const goal: Goal = {
      id: "g1",
      name: "OJT",
      targetAmount: 10000,
      currentSaved: 2400,
      createdAt: "2026-01-01",
    };
    expect(goalRemaining(goal)).toBe(7600);
    expect(
      goalRemaining({ ...goal, currentSaved: 15000 })
    ).toBe(0);
  });
});

describe("savingsPace", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates per-day and per-week when target date is ahead", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T12:00:00"));

    const goal: Goal = {
      id: "g1",
      name: "Emergency",
      targetAmount: 15000,
      currentSaved: 6000,
      createdAt: "2026-01-01",
      targetDate: "2026-09-20", // 10 days left (through end of day)
    };

    const pace = savingsPace(goal);
    expect(pace.remaining).toBe(9000);
    expect(pace.daysLeft).toBeGreaterThan(0);
    expect(pace.perDay).toBe(Math.ceil(9000 / (pace.daysLeft as number)));
    expect(pace.perWeek).toBe(Math.ceil((pace.perDay as number) * 7));
  });

  it("returns null pace without a usable target date", () => {
    const goal: Goal = {
      id: "g1",
      name: "No date",
      targetAmount: 1000,
      currentSaved: 100,
      createdAt: "2026-01-01",
    };
    const pace = savingsPace(goal);
    expect(pace.remaining).toBe(900);
    expect(pace.perDay).toBeNull();
    expect(pace.perWeek).toBeNull();
  });
});

describe("goalMilestones", () => {
  it("marks milestones based on progress", () => {
    const early: Goal = {
      id: "g1",
      name: "OJT",
      targetAmount: 10000,
      currentSaved: 0,
      createdAt: "2026-01-01",
    };
    const earlyMs = goalMilestones(early);
    expect(earlyMs.find((m) => m.id === "started")?.done).toBe(true);
    expect(earlyMs.find((m) => m.id === "first1k")?.done).toBe(false);
    expect(earlyMs.find((m) => m.id === "done")?.done).toBe(false);

    const mid: Goal = {
      ...early,
      currentSaved: 5000,
    };
    const midMs = goalMilestones(mid);
    expect(midMs.find((m) => m.id === "first1k")?.done).toBe(true);
    expect(midMs.find((m) => m.id === "p50")?.done).toBe(true);
    expect(midMs.find((m) => m.id === "p75")?.done).toBe(false);

    const done: Goal = { ...early, currentSaved: 10000 };
    expect(goalMilestones(done).find((m) => m.id === "done")?.done).toBe(true);
  });
});
