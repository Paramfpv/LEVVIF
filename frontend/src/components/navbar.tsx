"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const AUTH_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/history", label: "History" },
  { href: "/chat", label: "Chat" },
];

export function Navbar() {
  const { email, logout, isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="border-b border-gold/10 bg-card/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        {/* Left — logo + nav links */}
        <div className="flex items-center gap-6">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="font-heading text-xl font-bold text-gold tracking-wide"
          >
            LEWIF
          </Link>

          {!isLoading && (
            <div className="hidden sm:flex items-center gap-0.5">
              {isLoggedIn
                ? AUTH_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-gold/10 text-gold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))
                : isHome
                  ? (
                    <>
                      <a href="#how-it-works" className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                        How It Works
                      </a>
                      <a href="#features" className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Features
                      </a>
                      <Link href="/about" className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                        About
                      </Link>
                    </>
                  )
                  : null}
            </div>
          )}
        </div>

        {/* Right — auth actions */}
        {!isLoading && (
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                {!isHome && (
                  <Link
                    href="/calculate"
                    className="hidden sm:inline text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    Try Free
                  </Link>
                )}
                <Link
                  href="/login"
                  className="text-sm text-gold hover:text-gold-light transition-colors font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile nav for auth pages */}
      {!isLoading && isLoggedIn && (
        <div className="sm:hidden flex items-center gap-0.5 px-4 pb-2 overflow-x-auto">
          {AUTH_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
