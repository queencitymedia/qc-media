"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/offers", label: "Offers" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contact", label: "Contact" }
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Queen City Media</Link>
        <div className="flex items-center gap-5">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`
                text-sm hover:opacity-80
                ${pathname === l.href ? "font-semibold underline" : "opacity-80"}
              `}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
