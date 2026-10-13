"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
import { cn } from "@/lib/cn";
import { buttonClasses } from "./button";
import { CloseIcon, HandIcon, MenuIcon } from "./icons";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Practice" },
  { href: "/quiz", label: "Quiz" },
  { href: "/progress", label: "Progress" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeHref = links
    .map((link) => link.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  const isActive = (href: string) => href === activeHref;

  const linkClasses = (
    active: boolean,
    isMobile: boolean,
  ): string =>
    cn(
      isMobile ? "flex h-12 w-full items-center rounded-full px-4" : "inline-flex h-11 items-center rounded-full px-4",
      "border-2 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
      active
        ? "border-foreground bg-accent text-white shadow-pop-sm"
        : "border-transparent text-foreground hover:bg-tertiary",
    );

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-surface/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full font-display text-lg font-extrabold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-accent text-white shadow-pop-sm">
              <HandIcon className="h-5 w-5" />
            </span>
            SignBright
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <AccessibilityMenu />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
              className={buttonClasses({ variant: "secondary", size: "icon" })}
            >
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <ul className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClasses(active, false)}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/login" className={buttonClasses({ size: "sm" })}>
              Sign in
            </Link>
          </li>
          <li className="-ml-1 flex items-center">
            <AccessibilityMenu />
          </li>
        </ul>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="mx-4 mb-4 rounded-3xl border-2 border-foreground bg-card p-4 shadow-pop md:hidden"
      >
        <ul className="flex flex-col gap-2">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={linkClasses(active, true)}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/login" className={buttonClasses({ className: "w-full" })}>
              Sign in
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}