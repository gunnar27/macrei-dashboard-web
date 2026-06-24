"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const I = {
  logo: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /></svg>),
  overview: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>),
  properties: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M19 21V11a1 1 0 0 0-1-1h-3" /><path d="M8 7h2M8 11h2M8 15h2" /></svg>),
  explore: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>),
};

const NAV = [
  { href: "/", label: "Overview", icon: I.overview, exact: true },
  { href: "/properties", label: "Properties", icon: I.properties, exact: false },
  { href: "/explore", label: "Explore", icon: I.explore, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">{I.logo}</div>
        <div>
          <div className="brand-name">MacREI</div>
          <div className="brand-sub">Portfolio Analytics</div>
        </div>
      </div>

      <div className="nav-section">Menu</div>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className={`nav-item${isActive(n.href, n.exact) ? " active" : ""}`}>
          {n.icon}
          {n.label}
        </Link>
      ))}

      <div className="nav-spacer" />
      <div className="nav-foot">
        Read-only · served from the GL cache. No write reaches AppFolio.
      </div>
    </aside>
  );
}
