"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { invokeTool } from "@/lib/webmcp/registry";
import type { BudgetItem } from "@/lib/data/types";

const CATEGORIES: BudgetItem["category"][] = ["Flights", "Hotel", "Transport", "Food", "Other"];

export function RecordExpenseForm() {
  const [category, setCategory] = React.useState<BudgetItem["category"]>("Other");
  const [amount, setAmount] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSubmitting(true);
    await invokeTool("record_expense", { category, amount: value, label: label || undefined });
    setSubmitting(false);
    setAmount("");
    setLabel("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record an expense</CardTitle>
        <span className="text-[12px] text-slate">record_expense · commit</span>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-slate">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BudgetItem["category"])}
            className="focus-ring h-9 rounded-[6px] border border-line-strong bg-canvas-raised px-2 text-[13px] text-ink"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-slate">Amount (₹)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="focus-ring h-9 w-28 rounded-[6px] border border-line-strong bg-canvas-raised px-2 text-[13px] text-ink"
            placeholder="500"
          />
        </div>
        <div className="flex flex-1 min-w-[140px] flex-col gap-1">
          <label className="text-[11.5px] text-slate">Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="focus-ring h-9 w-full rounded-[6px] border border-line-strong bg-canvas-raised px-2 text-[13px] text-ink"
            placeholder="Airport taxi"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" disabled={submitting || !amount}>
          Record
        </Button>
      </form>
    </Card>
  );
}
