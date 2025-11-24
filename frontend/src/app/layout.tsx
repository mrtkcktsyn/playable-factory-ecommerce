import type { Metadata } from "next";
import Link from "next/link";
import "@/app/globals.css";
import { Providers } from "@/components/Providers";
import { AuthStatus } from "@/components/AuthStatus";
import { navContainer, footerContainer } from "@/styles/ui";

export const metadata: Metadata = {
  title: "playableEcommerce",
  description: "E-commerce demo built by MuratKucukatasayan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {/* Top gradient blur */}
            <div className="pointer-events-none absolute inset-x-0 -top-40 z-0 flex justify-center blur-3xl">
              <div className="h-72 w-[600px] bg-linear-to-r from-brand.primary via-brand.soft to-brand.accent opacity-50" />
            </div>

            {/* Navbar */}
            <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
              <nav className={navContainer}>
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="items-center rounded-full border border-white/15 px-2 py-2 text-xs font-medium text-slate-200 hover:border-white/40 md:flex"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-brand.primary to-brand.accent text-sm font-bold">
                      PE
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                      playable
                      <span className="text-brand.accent">
                        -Ecommerce
                      </span>
                    </span>
                  </Link>
                </div>

                {/* Navigation actions (products, auth, cart) */}
                <div className="flex items-center gap-4">
                  <Link
                    href="/products"
                    className="hidden text-slate-300 hover:text-white md:inline text-m font-bold"
                  >
                    Products
                  </Link>
                  <Link
                    href="/cart"
                    className="hidden text-slate-300 hover:text-white md:inline text-m font-bold"
                  >
                    Cart
                  </Link>
                  <Link
                    href="/profile"
                    className="hidden text-slate-300 hover:text-white md:inline text-m font-bold"
                  >
                    Profile
                  </Link>
                </div>

                {/* Auth controls (login/register vs orders/admin/logout) */}
                <AuthStatus />
              </nav>
            </header>

            {/* Page content */}
            <main className="relative z-10 flex-1">{children}</main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-slate-950/80">
              <div className={footerContainer}>
                <span>© {new Date().getFullYear()} playableEcommerce.</span>
                <span>
                  Built by Murat Küçükatasayan for Playable Factory case study.
                </span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
