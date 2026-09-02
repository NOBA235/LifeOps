"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentStore } from "@/lib/store/agentStore";
import { timeAgo } from "@/lib/utils";

export function RecentActivity() {
  const activity = useAgentStore((s) => s.activity).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent activity</CardTitle>
        <Link href="/agent" className="text-[12px] text-signal hover:underline">
          Open agent
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {activity.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-slate">
            Nothing yet — the agent hasn&apos;t run.
          </p>
        ) : (
          <ul>
            {activity.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 first:border-t-0">
                <span className="truncate text-[13px] text-ink">{a.summary}</span>
                <span className="shrink-0 text-[11.5px] text-slate">{timeAgo(a.startedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
