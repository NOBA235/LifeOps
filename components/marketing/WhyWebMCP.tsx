const TRADITIONAL = ["Understand UI", "Find button", "Click", "Read page", "Guess", "Retry"];
const WEBMCP = ["Discover structured tool", "Validate input", "Execute action", "Receive structured result"];

function FlowColumn({
  title,
  steps,
  tone,
}: {
  title: string;
  steps: string[];
  tone: "muted" | "signal";
}) {
  return (
    <div>
      <p className={`font-mono text-[12px] uppercase tracking-wide ${tone === "signal" ? "text-signal" : "text-white/40"}`}>
        {title}
      </p>
      <ol className="mt-4 space-y-0">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                  tone === "signal" ? "bg-signal text-white" : "border border-white/25 text-white/60"
                }`}
              >
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <div className={`h-6 w-px ${tone === "signal" ? "bg-signal/40" : "bg-white/15"}`} />
              )}
            </div>
            <span className={`pb-6 pt-0.5 text-[14px] ${tone === "signal" ? "text-white" : "text-white/55"}`}>
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function WhyWebMCP() {
  return (
    <section className="bg-ink px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/40">Why WebMCP</p>
        <h2 className="mt-3 max-w-xl text-[26px] font-medium leading-tight text-white md:text-[32px]">
          Applications built for humans force agents to guess. WebMCP lets them ask directly.
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <FlowColumn title="Traditional agent" steps={TRADITIONAL} tone="muted" />
          <FlowColumn title="WebMCP" steps={WEBMCP} tone="signal" />
        </div>

        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/70">
          WebMCP lets applications expose capabilities directly to agents instead of forcing
          agents to operate every website like a human.
        </p>
      </div>
    </section>
  );
}
