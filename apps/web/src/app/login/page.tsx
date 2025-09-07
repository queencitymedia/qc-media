"use client";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const bad = params.get("error");
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form method="POST" action="/login" className="p-6 bg-white rounded-xl shadow space-y-4 w-80">
        <h1 className="text-xl font-semibold">Dashboard Login</h1>
        {bad && <p className="text-red-600 text-sm">Invalid password</p>}
        <input type="password" name="password" placeholder="Password" className="w-full border rounded-lg px-3 py-2" />
        <button className="w-full rounded-lg px-3 py-2 bg-black text-white">Log In</button>
      </form>
    </div>
  );
}