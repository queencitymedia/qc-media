"use client";
import { useEffect } from "react";
export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error("App error:", error); }, [error]);
  return (
    <main style={{ padding: 24 }}>
      <h1>Something went wrong</h1>
      <p>Please retry or return to the homepage.</p>
      <a href="/">Go home</a>
    </main>
  );
}