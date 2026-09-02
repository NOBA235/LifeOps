"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/store/agentStore";
import { runGeminiAgent } from "@/lib/agent/geminiAgent";
import { PlayCircle } from "lucide-react";
import type { ButtonProps } from "@/components/ui/button";

export function RunAgentButton({ children, ...props }: ButtonProps) {
  const router = useRouter();
  const isRunning = useAgentStore((s) => s.isRunning);

  return (
    <Button
      {...props}
      disabled={isRunning}
      onClick={() => {
        router.push("/agent");
        runGeminiAgent();
      }}
    >
      <PlayCircle size={15} />
      {children ?? (isRunning ? "Thinking…" : "Run agent")}
    </Button>
  );
}
