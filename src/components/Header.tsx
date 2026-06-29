import Link from "next/link";
import { MainNavigation } from "@/components/MainNavigation";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link
          className="inline-flex w-fit items-center gap-3 rounded-md font-semibold text-slate-950"
          href="/"
        >
          <span className="grid size-9 place-items-center rounded-md bg-accent text-sm font-bold text-white">
            SF
          </span>
          <span>SaludFlow OSS</span>
        </Link>
        <MainNavigation />
      </div>
    </header>
  );
}
