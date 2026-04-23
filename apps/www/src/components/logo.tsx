import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 text-foreground transition-opacity hover:opacity-90"
      aria-label="Mehtrics home"
    >
      <svg viewBox="0 0 28 28" role="img" aria-hidden="true" className="size-8">
        <rect
          x="2.5"
          y="2.5"
          width="23"
          height="23"
          rx="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M7 18V10.5L11 14.5L14 11L17 14.5L21 9.5V18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight">mehtrics</span>
    </Link>
  );
}
