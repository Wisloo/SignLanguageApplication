import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider";
import { SiteNav } from "@/components/ui/site-nav";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SignBright — Learn Sign Language",
    template: "%s · SignBright",
  },
  description:
    "A calm, accessible way for special education learners to learn the ASL and FSL fingerspelling alphabet, practice with their camera, and track progress.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="bg-surface text-foreground min-h-full flex flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:border-2 focus:border-foreground focus:bg-accent focus:px-5 focus:py-2 focus:font-bold focus:text-white focus:shadow-pop focus-visible:outline-none"
        >
          Skip to content
        </a>
        <AccessibilityProvider>
          <SiteNav />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <footer className="mt-8 border-t-2 border-foreground/10 py-12 text-center text-sm font-medium text-muted">
            <p>Made with care for every learner.</p>
          </footer>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
