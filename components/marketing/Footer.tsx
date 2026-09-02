import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="max-w-xl font-display text-[19px] italic leading-snug text-ink-soft">
          LifeOps isn&apos;t an AI that uses websites. It&apos;s a web application designed from
          the beginning for humans and AI agents to work together.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[12.5px] text-slate">
          <span className="font-mono">lifeops</span>
          <div className="flex gap-4">
            <Link href="/overview" className="hover:text-ink">Open app</Link>
            <Link href="/webmcp" className="hover:text-ink">WebMCP inspector</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
