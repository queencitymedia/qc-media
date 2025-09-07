"use client";
export default function LogoutButton() {
  async function doLogout() {
    try { await fetch("/login", { method: "DELETE" }); }
    finally { window.location.href = "/login"; }
  }
  return <button onClick={doLogout} className="border rounded-lg px-3 py-2">Logout</button>;
}
