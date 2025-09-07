"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow p-4 flex items-center justify-between">
      <div className="text-xl font-bold text-blue-600">Queen City Media</div>
      <div className="space-x-4">
        <Link href="/" className="hover:text-blue-500">Home</Link>
        <Link href="/dashboard" className="hover:text-blue-500">Dashboard</Link>
        <Link href="/contact" className="hover:text-blue-500">Contact</Link>
      </div>
    </nav>
  );
}
